import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// intentRouter
// Consumes pending OperatorIntents, validates them, and creates
// deterministic SwarmTasks for Fleet Alpha Prime to dispatch.
//
// State machine:
//   PENDING → VALIDATING → ROUTED → EXECUTING → VALIDATING_RESULT → COMPLETED
//   or → BLOCKED / FAILED / REJECTED
// ════════════════════════════════════════════════════════════════

const SCOPE_TO_TASK_TYPE: Record<string, string> = {
  fleet: 'fleet_governance',
  system: 'system_diagnostic',
  workflow: 'workflow_management',
  agent: 'agent_management',
  benchmark: 'benchmark_validation',
  repair: 'repair_execution',
  deployment: 'deployment_operation',
  research: 'research_task',
  approval: 'approval_processing',
  query: 'query_resolution',
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const now = new Date().toISOString();

    // ── Read pending intents ──
    const pendingIntents = await svc.entities.OperatorIntent.filter({ status: 'pending' }, '-created_date', 50);

    const results: any[] = [];

    for (const intent of pendingIntents) {
      try {
        // ── VALIDATING: Validate target system ──
        await svc.entities.OperatorIntent.update(intent.id, { status: 'executing', executed_at: now });

        let targetSystem = null;
        if (intent.system_id && intent.system_id !== 'fleet') {
          const systems = await svc.entities.FleetSystem.filter({ system_id: intent.system_id, active: true }, '-created_date', 1);
          targetSystem = systems[0];
          if (!targetSystem) {
            await svc.entities.OperatorIntent.update(intent.id, {
              status: 'rejected',
              result: `Target system "${intent.system_id}" not found or not active`,
            });
            results.push({ intent_id: intent.intent_id, status: 'rejected', reason: 'system_not_found' });
            continue;
          }
        }

        // ── Validate objective ──
        if (!intent.interpreted_objective || intent.interpreted_objective.length < 5) {
          await svc.entities.OperatorIntent.update(intent.id, {
            status: 'rejected',
            result: 'Objective too vague or empty',
          });
          results.push({ intent_id: intent.intent_id, status: 'rejected', reason: 'vague_objective' });
          continue;
        }

        // ── Determine risk and approval ──
        const risk = intent.risk || 'low';
        const needsApproval = intent.approval_policy === 'operator_required' || intent.approval_policy === 'operator_required_protected';

        // ── ROUTED: Create deterministic SwarmTask ──
        const taskType = SCOPE_TO_TASK_TYPE[intent.scope] || 'query_resolution';
        const taskId = `task-${intent.intent_id}-${Math.random().toString(36).substring(2, 8)}`;
        const assignedAgent = risk === 'high' ? 'alpha_prime_orchestrator' : 'system_operator';

        const task = await svc.entities.SwarmTask.create({
          task_type: taskType,
          title: `[Intent] ${intent.interpreted_objective.slice(0, 100)}`,
          description: `OperatorIntent ${intent.intent_id}: ${intent.interpreted_objective}\n\nSystem: ${intent.system_id}\nScope: ${intent.scope}\nPriority: ${intent.priority}\nRisk: ${risk}\nConstraints: ${(intent.constraints || []).join(', ')}`,
          priority: intent.priority === 'critical' ? 'critical' : intent.priority === 'high' ? 'high' : 'normal',
          status: 'pending',
          assigned_agent: assignedAgent,
          created_by_agent: 'vision_cortex_router',
          payload: {
            intent_id: intent.intent_id,
            system_id: intent.system_id,
            action: intent.scope,
            params: {
              objective: intent.interpreted_objective,
              target_benchmarks: intent.target_benchmarks || [],
              constraints: intent.constraints || [],
              risk,
              approval_policy: intent.approval_policy,
            },
          },
        });

        // ── If approval required, mark as blocked ──
        if (needsApproval) {
          await svc.entities.OperatorIntent.update(intent.id, {
            status: 'blocked',
            result: `Task ${task.id} created but requires operator approval (policy=${intent.approval_policy})`,
          });
          results.push({ intent_id: intent.intent_id, status: 'blocked', task_id: task.id, reason: 'approval_required' });
        } else {
          // ── EXECUTING: Task is ready for Fleet Alpha Prime to dispatch ──
          await svc.entities.OperatorIntent.update(intent.id, {
            status: 'executing',
            result: `Task ${task.id} created and routed to ${assignedAgent}`,
          });
          results.push({ intent_id: intent.intent_id, status: 'executing', task_id: task.id, agent: assignedAgent });
        }
      } catch (e: any) {
        await svc.entities.OperatorIntent.update(intent.id, {
          status: 'rejected',
          result: `Router error: ${e.message}`,
        });
        results.push({ intent_id: intent.intent_id, status: 'failed', error: e.message });
      }
    }

    return Response.json({
      ok: true,
      intents_processed: pendingIntents.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}