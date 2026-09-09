import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// swarmOrchestrator — The autonomous swarm brain.
//
// This function is the coordination layer that turns 7 isolated AI agents into
// a self-organizing autonomous swarm. It runs on a schedule (every 30 min via
// workflow) and on-demand from the SwarmCommand dashboard.
//
// Swarm cycle:
//   1. SCAN — read all pending SwarmTasks, ordered by priority
//   2. DISPATCH — for each task, create a conversation with the assigned agent,
//      send the task as a message, and let the agent execute it using its
//      entity + function tools
//   3. COLLECT — read the agent's response, update the task with the result
//   4. PROPAGATE — if the agent's response implies follow-up work for another
//      agent, spawn new SwarmTasks (swarm chaining)
//   5. HEALTH — run a platform health check and spawn tasks for any anomalies
//
// Actions:
//   runCycle    — full swarm cycle (scan → dispatch → collect → propagate)
//   dispatch    — dispatch a single task by ID
//   healthCheck — scan platform metrics and spawn tasks for anomalies
//   getStatus   — return swarm status (pending tasks, active agents, recent activity)
//   spawnTask   — create a new task (used by dashboard or other agents)
//
// Invoke: base44.functions.invoke('swarmOrchestrator', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

const AGENTS = [
  'lead_orchestrator',
  'seo_manager',
  'social_manager',
  'reputation_manager',
  'site_factory_manager',
  'comms_manager',
  'swarm_orchestrator',
];

const PRIORITY_ORDER = { critical: 0, high: 1, normal: 2, low: 3 };

async function logSop(svc, action, description, detail) {
  await svc.entities.SopLog.create({
    category: 'integration',
    action,
    description,
    detail: detail || '',
    source: 'swarmOrchestrator',
  }).catch(() => {});
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'runCycle';

    // ── getStatus: swarm overview ──
    if (action === 'getStatus') {
      const [pending, inProgress, completed24h, failed24h, messages] = await Promise.all([
        svc.entities.SwarmTask.filter({ status: 'pending' }, '-created_date', 100),
        svc.entities.SwarmTask.filter({ status: 'in_progress' }, '-created_date', 50),
        svc.entities.SwarmTask.filter({ status: 'completed' }, '-completed_at', 50),
        svc.entities.SwarmTask.filter({ status: 'failed' }, '-created_date', 50),
        svc.entities.SwarmMessage.filter({ read: false }, '-created_date', 50),
      ]);

      const byAgent = {};
      for (const a of AGENTS) {
        byAgent[a] = {
          pending: pending.filter((t) => t.assigned_agent === a).length,
          completed: completed24h.filter((t) => t.assigned_agent === a).length,
          failed: failed24h.filter((t) => t.assigned_agent === a).length,
        };
      }

      return Response.json({
        ok: true,
        agents: AGENTS,
        stats: {
          pending: pending.length,
          in_progress: inProgress.length,
          completed_recent: completed24h.length,
          failed_recent: failed24h.length,
          unread_messages: messages.length,
        },
        byAgent,
        recentCompleted: completed24h.slice(0, 10).map((t) => ({
          id: t.id, title: t.title, agent: t.assigned_agent, summary: t.result_summary, at: t.completed_at,
        })),
        recentFailed: failed24h.slice(0, 10).map((t) => ({
          id: t.id, title: t.title, agent: t.assigned_agent, error: t.error,
        })),
      });
    }

    // ── spawnTask: create a new swarm task ──
    if (action === 'spawnTask') {
      const { task_type, title, description, assigned_agent, priority, payload, created_by_agent, parent_task_id } = body;
      if (!title || !assigned_agent) return Response.json({ error: 'title and assigned_agent required' }, { status: 400 });
      const task = await svc.entities.SwarmTask.create({
        task_type: task_type || 'cross_domain',
        title,
        description: description || '',
        assigned_agent,
        created_by_agent: created_by_agent || 'system',
        priority: priority || 'normal',
        status: 'pending',
        payload: payload || {},
        parent_task_id: parent_task_id || undefined,
        retry_count: 0,
        max_retries: 3,
        spawned_tasks: [],
      });
      await logSop(svc, 'swarm_task_spawned', `Task spawned: ${title} → ${assigned_agent}`, JSON.stringify({ task_id: task.id, priority }));
      return Response.json({ ok: true, task_id: task.id });
    }

    // ── healthCheck: scan platform and spawn tasks for anomalies ──
    if (action === 'healthCheck') {
      const spawned = [];
      const [leads, templates, socialPosts, appts] = await Promise.all([
        svc.entities.Lead.list('-created_date', 200),
        svc.entities.WebsiteTemplate.list('-created_date', 500),
        svc.entities.SocialPost.filter({ status: 'draft' }, '-created_date', 50),
        svc.entities.Appointment.list('-created_date', 100),
      ]);

      // Check 1: New leads with no follow-up task
      const newLeads = leads.filter((l) => l.status === 'NEW ESTIMATE');
      if (newLeads.length > 0) {
        const task = await svc.entities.SwarmTask.create({
          task_type: 'lead_followup',
          title: `Follow up with ${newLeads.length} new estimate leads`,
          description: `${newLeads.length} leads are sitting in NEW ESTIMATE status. Score them, trigger immediate follow-up emails, sync to CRM, and enrich high-value leads. Lead IDs: ${newLeads.slice(0, 10).map((l) => l.id).join(', ')}`,
          assigned_agent: 'lead_orchestrator',
          created_by_agent: 'swarm_orchestrator',
          priority: newLeads.length > 5 ? 'high' : 'normal',
          status: 'pending',
          payload: { lead_ids: newLeads.map((l) => l.id) },
          spawned_tasks: [],
        });
        spawned.push(task.id);
      }

      // Check 2: Templates not deployed
      const undeployed = templates.filter((t) => t.status === 'configured' && !t.generated_url);
      if (undeployed.length > 0) {
        const task = await svc.entities.SwarmTask.create({
          task_type: 'site_deploy',
          title: `Deploy ${undeployed.length} configured site templates`,
          description: `${undeployed.length} website templates are configured but not live. Deploy them and trigger SEO page generation for each. Template IDs: ${undeployed.slice(0, 5).map((t) => t.id).join(', ')}`,
          assigned_agent: 'site_factory_manager',
          created_by_agent: 'swarm_orchestrator',
          priority: 'normal',
          status: 'pending',
          payload: { template_ids: undeployed.map((t) => t.id) },
          spawned_tasks: [],
        });
        spawned.push(task.id);
      }

      // Check 3: Draft social posts
      if (socialPosts.length > 0) {
        const task = await svc.entities.SwarmTask.create({
          task_type: 'social_publish',
          title: `Publish ${socialPosts.length} draft social posts`,
          description: `${socialPosts.length} social posts are in draft status. Review, schedule, and publish them.`,
          assigned_agent: 'social_manager',
          created_by_agent: 'swarm_orchestrator',
          priority: 'low',
          status: 'pending',
          payload: { post_ids: socialPosts.map((p) => p.id) },
          spawned_tasks: [],
        });
        spawned.push(task.id);
      }

      // Check 4: Upcoming appointments needing reminders
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      const upcomingAppts = appts.filter((a) => a.date === tomorrow && a.status === 'booked');
      if (upcomingAppts.length > 0) {
        const task = await svc.entities.SwarmTask.create({
          task_type: 'comms_send',
          title: `Send appointment reminders for ${upcomingAppts.length} tomorrow consultations`,
          description: `${upcomingAppts.length} in-home estimates are scheduled for tomorrow. Send SMS reminders to reduce no-shows. Appointment IDs: ${upcomingAppts.map((a) => a.id).join(', ')}`,
          assigned_agent: 'comms_manager',
          created_by_agent: 'swarm_orchestrator',
          priority: 'high',
          status: 'pending',
          payload: { appointment_ids: upcomingAppts.map((a) => a.id) },
          spawned_tasks: [],
        });
        spawned.push(task.id);
      }

      await logSop(svc, 'swarm_health_check', `Health check spawned ${spawned.length} tasks`, JSON.stringify(spawned));
      return Response.json({ ok: true, spawned_tasks: spawned.length, task_ids: spawned });
    }

    // ── dispatch: execute a single task via its assigned agent ──
    if (action === 'dispatch') {
      const { task_id } = body;
      if (!task_id) return Response.json({ error: 'task_id required' }, { status: 400 });

      const task = await svc.entities.SwarmTask.get(task_id);
      if (!task) return Response.json({ error: 'Task not found' }, { status: 404 });
      if (task.status === 'completed' || task.status === 'in_progress') {
        return Response.json({ ok: true, skipped: true, reason: `already ${task.status}` });
      }

      // Claim the task
      await svc.entities.SwarmTask.update(task_id, {
        status: 'in_progress',
        claimed_at: new Date().toISOString(),
      });

      try {
        // Create a conversation with the assigned agent and send the task
        const conversation = await base44.agents.createConversation({
          agent_name: task.assigned_agent,
          metadata: {
            name: task.title,
            description: `SwarmTask: ${task.task_type} [${task.priority}]`,
          },
        });

        const messageContent = [
          `SWARM TASK: ${task.title}`,
          ``,
          `Type: ${task.task_type}`,
          `Priority: ${task.priority}`,
          `Created by: ${task.created_by_agent}`,
          ``,
          `Details: ${task.description}`,
          ``,
          `Payload: ${JSON.stringify(task.payload || {})}`,
          ``,
          `Execute this task now using your available tools. When done, provide a clear summary of what you did and the outcome.`,
        ].join('\n');

        await base44.agents.addMessage(conversation, { role: 'user', content: messageContent });

        // Update task with conversation ID
        await svc.entities.SwarmTask.update(task_id, { conversation_id: conversation.id });

        await logSop(svc, 'swarm_task_dispatched', `Dispatched: ${task.title} → ${task.assigned_agent}`, task_id);

        return Response.json({
          ok: true,
          task_id,
          conversation_id: conversation.id,
          agent: task.assigned_agent,
          status: 'dispatched',
        });
      } catch (error) {
        await svc.entities.SwarmTask.update(task_id, {
          status: 'failed',
          error: error.message,
          retry_count: (task.retry_count || 0) + 1,
        });
        await logSop(svc, 'swarm_dispatch_failed', `Failed to dispatch: ${task.title}`, error.message);
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // ── runCycle: full swarm cycle — scan, dispatch top N pending tasks ──
    if (action === 'runCycle' || action === undefined) {
      const maxDispatch = body.max_dispatch || 5;
      const pending = await svc.entities.SwarmTask.filter({ status: 'pending' }, '-created_date', 100);

      // Sort by priority
      pending.sort((a, b) => (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2));

      const toDispatch = pending.slice(0, maxDispatch);
      const dispatched = [];

      for (const task of toDispatch) {
        try {
          // Claim
          await svc.entities.SwarmTask.update(task.id, {
            status: 'in_progress',
            claimed_at: new Date().toISOString(),
          });

          const conversation = await base44.agents.createConversation({
            agent_name: task.assigned_agent,
            metadata: {
              name: task.title,
              description: `SwarmTask: ${task.task_type} [${task.priority}]`,
            },
          });

          const messageContent = [
            `SWARM TASK: ${task.title}`,
            ``,
            `Type: ${task.task_type}`,
            `Priority: ${task.priority}`,
            `Created by: ${task.created_by_agent}`,
            ``,
            `Details: ${task.description}`,
            ``,
            `Payload: ${JSON.stringify(task.payload || {})}`,
            ``,
            `Execute this task now using your available tools. When done, provide a clear summary of what you did and the outcome.`,
          ].join('\n');

          await base44.agents.addMessage(conversation, { role: 'user', content: messageContent });

          await svc.entities.SwarmTask.update(task.id, { conversation_id: conversation.id });

          dispatched.push({
            task_id: task.id,
            title: task.title,
            agent: task.assigned_agent,
            conversation_id: conversation.id,
          });
        } catch (error) {
          await svc.entities.SwarmTask.update(task.id, {
            status: 'failed',
            error: error.message,
            retry_count: (task.retry_count || 0) + 1,
          });
        }
      }

      await logSop(svc, 'swarm_cycle', `Cycle dispatched ${dispatched.length} tasks`, JSON.stringify(dispatched.map((d) => d.task_id)));

      return Response.json({
        ok: true,
        cycle_complete: true,
        pending_count: pending.length,
        dispatched_count: dispatched.length,
        dispatched,
      });
    }

    // ── completeTask: mark a task complete (called after agent finishes) ──
    if (action === 'completeTask') {
      const { task_id, result, result_summary, spawned_tasks } = body;
      if (!task_id) return Response.json({ error: 'task_id required' }, { status: 400 });

      const update = {
        status: 'completed',
        result: result || '',
        result_summary: result_summary || '',
        completed_at: new Date().toISOString(),
      };
      if (spawned_tasks && Array.isArray(spawned_tasks)) {
        update.spawned_tasks = spawned_tasks;
      }

      await svc.entities.SwarmTask.update(task_id, update);
      await logSop(svc, 'swarm_task_completed', `Completed: ${result_summary || 'task'}`, task_id);

      return Response.json({ ok: true, task_id });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[swarmOrchestrator] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}