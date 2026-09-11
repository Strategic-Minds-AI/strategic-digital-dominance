import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// ============================================================
// ALPHA PRIME ORCHESTRATOR — Deterministic CEO Audit Engine
// ============================================================
// Runs a full executive audit of the business: leads, funnel,
// system health, website factory, agent swarm, strategy alignment.
// Produces prioritized recommendations with approval gates.
// No LLM — pure deterministic analysis on real entity data.
// ============================================================

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const client = await createClientFromRequest(req);

    if (action === "audit") {
      // === Parallel data fetch — all subsystems at once ===
      const [
        leads, swarmTasks, swarmMessages, strategyDocs, systemAudits,
        websiteQueue, swarmAudits, socialPosts, appointments, funnelEvents,
        marketplaceListings, domainStrategies, investigations
      ] = await Promise.all([
        client.entities.Lead.list("-created_date", 100).catch(() => []),
        client.entities.SwarmTask.list("-created_date", 50).catch(() => []),
        client.entities.SwarmMessage.list("-created_date", 20).catch(() => []),
        client.entities.StrategyDocument.list("-updated_date", 20).catch(() => []),
        client.entities.SystemHealthAudit.list("-created_date", 5).catch(() => []),
        client.entities.WebsiteQueue.list("-created_date", 50).catch(() => []),
        client.entities.SwarmAudit.list("-created_date", 20).catch(() => []),
        client.entities.SocialPost.list("-created_date", 20).catch(() => []),
        client.entities.Appointment.list("-created_date", 20).catch(() => []),
        client.entities.FunnelEvent.list("-created_date", 100).catch(() => []),
        client.entities.MarketplaceListing.list("-created_date", 20).catch(() => []),
        client.entities.DomainStrategy.list("-created_date", 20).catch(() => []),
        client.entities.Investigation.list("-created_date", 10).catch(() => []),
      ]);

      // === BUSINESS HEALTH METRICS ===
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const leadsToday = leads.filter(l => new Date(l.created_date) >= oneDayAgo);
      const leadsThisWeek = leads.filter(l => new Date(l.created_date) >= oneWeekAgo);

      const wonLeads = leads.filter(l => l.status === "WON");
      const wonValue = wonLeads.reduce((sum, l) => sum + (l.won_value || 0), 0);
      const pipelineValue = leads
        .filter(l => !["WON", "LOST", "NURTURE"].includes(l.status))
        .reduce((sum, l) => sum + (l.estimate_mid || 0), 0);

      const conversionRate = leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0;

      // === FUNNEL PERFORMANCE ===
      const funnelStarted = funnelEvents.filter(e => e.event_type === "funnel_started" || e.event_name === "funnel_started");
      const estimatesGenerated = leads.length;
      const funnelDropoff = funnelStarted.length > 0
        ? ((funnelStarted.length - estimatesGenerated) / funnelStarted.length) * 100
        : 0;

      // === LEAD FOLLOW-UP ANALYSIS ===
      const newLeads = leads.filter(l => l.status === "NEW ESTIMATE");
      const staleLeads = newLeads.filter(l => {
        const created = new Date(l.created_date);
        return (now.getTime() - created.getTime()) > 60 * 60 * 1000; // > 1 hour old
      });

      // === SYSTEM HEALTH ===
      const latestAudit = systemAudits[0];
      const systemScore = latestAudit?.overall_score || 0;
      const bottleneck = latestAudit?.bottleneck || "No audit run yet";
      const nextBestAction = latestAudit?.next_best_action || "Run a system health audit";

      // === WEBSITE FACTORY ===
      const sitesLive = websiteQueue.filter(q => q.status === "live");
      const sitesQueued = websiteQueue.filter(q => q.status === "queued");
      const sitesStuck = websiteQueue.filter(q =>
        ["researching", "generating", "deploying"].includes(q.status) &&
        q.last_audit_at && (now.getTime() - new Date(q.last_audit_at).getTime()) > 24 * 60 * 60 * 1000
      );

      // === AGENT SWARM ===
      const pendingTasks = swarmTasks.filter(t => t.status === "pending");
      const failedTasks = swarmTasks.filter(t => t.status === "failed");
      const stuckTasks = swarmTasks.filter(t =>
        ["claimed", "in_progress"].includes(t.status) &&
        t.claimed_at && (now.getTime() - new Date(t.claimed_at).getTime()) > 2 * 60 * 60 * 1000
      );

      // === STRATEGY ALIGNMENT ===
      const activeStrategies = strategyDocs.filter(s => s.status === "active");
      const draftStrategies = strategyDocs.filter(s => s.status === "draft");

      // === BUILD RECOMMENDATIONS ===
      const recommendations = [];

      // Critical: stale leads not followed up
      if (staleLeads.length > 0) {
        recommendations.push({
          priority: "critical",
          category: "Lead Pipeline",
          title: `${staleLeads.length} new lead(s) have not been followed up within 1 hour`,
          problem: `Leads are going cold. Every hour a lead sits without contact, the conversion probability drops by 60%.`,
          action: `Immediately trigger the Lead Orchestrator agent to contact all stale leads via SMS, email, and AI voice call. Assign each to a sales agent and book consultations.`,
          expected_result: `Recover 40-60% of stale leads into active pipeline. Estimated recovered value: $${(staleLeads.length * 3500).toLocaleString()}.`,
          owner: "Lead Orchestrator Agent",
          timeline: "Immediate — within 30 minutes",
          approval_needed: true,
        });
      }

      // Critical: failed tasks
      if (failedTasks.length > 0) {
        recommendations.push({
          priority: "critical",
          category: "Agent Swarm",
          title: `${failedTasks.length} task(s) have failed and need attention`,
          problem: `Failed tasks indicate broken automation or agent errors. Left unaddressed, they cascade into missed revenue and system drift.`,
          action: `Review each failed task, identify root cause, retry with adjusted parameters or escalate to human. Log the fix pattern for future prevention.`,
          expected_result: `Restore autonomous operation. Prevent recurrence of the same failure pattern.`,
          owner: "Swarm Orchestrator",
          timeline: "Within 1 hour",
          approval_needed: true,
        });
      }

      // High: sites stuck in deployment
      if (sitesStuck.length > 0) {
        recommendations.push({
          priority: "high",
          category: "Website Factory",
          title: `${sitesStuck.length} site(s) stuck in deployment for over 24 hours`,
          problem: `Sites stuck in research/generate/deploy status are blocking the pipeline. Every day a site is not live is a day of lost lead generation.`,
          action: `Force-restart the deployment pipeline for stuck sites. Verify each is live and submitted to Google. Activate lead capture and AI sales agents.`,
          expected_result: `${sitesStuck.length} new live sites generating leads within 24 hours. Estimated new monthly leads: ${sitesStuck.length * 15}.`,
          owner: "Site Factory Manager",
          timeline: "Within 4 hours",
          approval_needed: true,
        });
      }

      // High: system health below threshold
      if (systemScore > 0 && systemScore < 70) {
        recommendations.push({
          priority: "high",
          category: "System Health",
          title: `System optimality score is ${systemScore}/100 — below the 70 threshold`,
          problem: `Low system score means subsystems are underperforming. The bottleneck: ${bottleneck}.`,
          action: `${nextBestAction}. Run a full system audit to identify all underperforming subsystems and auto-fix anything scoring below 60.`,
          expected_result: `System score raised to 80+ within 7 days. Autonomous operation restored.`,
          owner: "System Operator",
          timeline: "Within 24 hours",
          approval_needed: true,
        });
      }

      // Medium: queued sites not deployed
      if (sitesQueued.length > 5) {
        recommendations.push({
          priority: "medium",
          category: "Website Factory",
          title: `${sitesQueued.length} sites in queue waiting to be deployed`,
          problem: `A large queue means the deployment pipeline is not keeping pace with demand. Each queued site represents unrealized lead generation.`,
          action: `Accelerate the deployment pipeline. Batch-deploy 5 sites per day until the queue is cleared. Prioritize high-search-volume keywords.`,
          expected_result: `Queue cleared within ${Math.ceil(sitesQueued.length / 5)} days. ${sitesQueued.length * 20} new monthly leads once all are live.`,
          owner: "Site Factory Manager",
          timeline: "Ongoing — 5 sites/day",
          approval_needed: true,
        });
      }

      // Medium: draft strategies not activated
      if (draftStrategies.length > 0) {
        recommendations.push({
          priority: "medium",
          category: "Strategy",
          title: `${draftStrategies.length} strategy document(s) are still in draft`,
          problem: `Drafts mean decisions have not been made. The business is drifting without clear direction on these items.`,
          action: `Review each draft, finalize the decisions, and activate them. Assign owners and timelines to every objective.`,
          expected_result: `Clear strategic direction. Every active strategy has an owner and a deadline.`,
          owner: "Alpha Prime",
          timeline: "Within 48 hours",
          approval_needed: true,
        });
      }

      // Low: no social posts recently
      const recentSocialPosts = socialPosts.filter(p =>
        p.created_date && (now.getTime() - new Date(p.created_date).getTime()) < 24 * 60 * 60 * 1000
      );
      if (recentSocialPosts.length === 0) {
        recommendations.push({
          priority: "low",
          category: "Marketing",
          title: `No social media posts in the last 24 hours`,
          problem: `Social silence means declining reach and engagement. The algorithm favors consistency.`,
          action: `Activate the Social Manager agent to generate and publish 3 posts today: one before/after, one educational, one testimonial.`,
          expected_result: `Maintained social presence. 3 new posts reaching the audience.`,
          owner: "Social Manager Agent",
          timeline: "Today",
          approval_needed: true,
        });
      }

      // === EXECUTIVE SUMMARY ===
      const healthScore = Math.round(
        (Math.min(100, leadsToday.length * 20) * 0.2) +
        (conversionRate * 2 * 0.15) +
        (systemScore * 0.25) +
        (Math.min(100, sitesLive.length * 10) * 0.15) +
        (pendingTasks.length === 0 ? 100 : Math.max(0, 100 - pendingTasks.length * 10)) * 0.1 +
        (staleLeads.length === 0 ? 100 : Math.max(0, 100 - staleLeads.length * 20)) * 0.15
      );

      const verdict = healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Needs Attention" : "Critical";

      // === RISKS ===
      const risks = [];
      if (staleLeads.length > 2) risks.push("Lead pipeline is backing up — if not cleared, revenue will drop within 7 days.");
      if (failedTasks.length > 3) risks.push("Agent reliability is degrading — autonomous operation may collapse without intervention.");
      if (sitesStuck.length > 0) risks.push("Deployment pipeline is stalled — new market opportunities are being missed daily.");
      if (systemScore > 0 && systemScore < 70) risks.push("System health is below threshold — a cascade failure is possible if not addressed.");
      if (risks.length === 0) risks.push("No immediate risks detected. Maintain current trajectory and focus on scaling.");

      return Response.json({
        ok: true,
        audited_at: now.toISOString(),
        health_score: healthScore,
        verdict,
        metrics: {
          leads_total: leads.length,
          leads_today: leadsToday.length,
          leads_this_week: leadsThisWeek.length,
          won_count: wonLeads.length,
          won_value: wonValue,
          pipeline_value: pipelineValue,
          conversion_rate: Math.round(conversionRate * 10) / 10,
          new_leads_waiting: newLeads.length,
          stale_leads: staleLeads.length,
          funnel_started: funnelStarted.length,
          funnel_dropoff: Math.round(funnelDropoff * 10) / 10,
          system_score: systemScore,
          bottleneck,
          sites_live: sitesLive.length,
          sites_queued: sitesQueued.length,
          sites_stuck: sitesStuck.length,
          pending_tasks: pendingTasks.length,
          failed_tasks: failedTasks.length,
          stuck_tasks: stuckTasks.length,
          active_strategies: activeStrategies.length,
          draft_strategies: draftStrategies.length,
          social_posts_24h: recentSocialPosts.length,
        },
        recommendations,
        risks,
        executive_summary: `${verdict} — Health score ${healthScore}/100. ${staleLeads.length} stale leads, ${failedTasks.length} failed tasks, ${sitesStuck.length} stuck sites. ${risks[0]}`,
        goal_this_week: staleLeads.length > 0
          ? `Clear all ${staleLeads.length} stale leads and restore the follow-up pipeline to under 1 hour response time.`
          : sitesQueued.length > 5
          ? `Deploy ${Math.min(10, sitesQueued.length)} queued sites and activate their lead capture.`
          : `Run a full system audit and raise the optimality score to 80+.`,
      });
    }

    if (action === "approve") {
      // Owner approved a recommendation — create a SwarmTask and schedule it
      const { recommendation, owner_id } = body;
      if (!recommendation) return Response.json({ error: "recommendation required" }, { status: 400 });

      const client2 = await createClientFromRequest(req);
      const task = await client2.entities.SwarmTask.create({
        task_type: recommendation.category?.toLowerCase().replace(/\s+/g, "_") || "ceo_directive",
        title: recommendation.title,
        description: `${recommendation.problem}\n\nACTION: ${recommendation.action}\n\nEXPECTED: ${recommendation.expected_result}\n\nOWNER: ${recommendation.owner}\n\nTIMELINE: ${recommendation.timeline}`,
        priority: recommendation.priority || "normal",
        status: "pending",
        assigned_agent: recommendation.owner || "swarm_orchestrator",
        created_by_agent: "alpha_prime_orchestrator",
        payload: {
          action: recommendation.action,
          params: { category: recommendation.category, timeline: recommendation.timeline },
        },
        max_retries: 3,
      });

      // Log the approval as a swarm message
      await client2.entities.SwarmMessage.create({
        from_agent: "alpha_prime_orchestrator",
        to_agent: recommendation.owner || "swarm_orchestrator",
        message_type: "directive",
        content: `APPROVED by owner: ${recommendation.title}. Task ${task.id} created. Execute immediately.`,
        related_task_id: task.id,
      }).catch(() => {});

      return Response.json({
        ok: true,
        task_id: task.id,
        message: `Approved. Task created and assigned to ${recommendation.owner}. It is now in the swarm queue for execution.`,
      });
    }

    if (action === "schedule") {
      // Schedule a task in Google Calendar via the connector
      const { task_id, scheduled_time, title, description } = body;
      if (!task_id || !scheduled_time) return Response.json({ error: "task_id and scheduled_time required" }, { status: 400 });

      const client3 = await createClientFromRequest(req);
      try {
        const calConn = await client3.asServiceRole.connectors.getConnection("googlecalendar");
        const accessToken = calConn?.accessToken;
        if (!accessToken) {
          return Response.json({ ok: false, error: "Google Calendar not connected. Connect it in Integrations." });
        }

        const startISO = new Date(scheduled_time).toISOString();
        const endISO = new Date(new Date(scheduled_time).getTime() + 60 * 60 * 1000).toISOString();

        const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: title || "Alpha Prime Scheduled Task",
            description: description || "",
            start: { dateTime: startISO },
            end: { dateTime: endISO },
            reminders: { useDefault: true },
          }),
        });

        if (!calRes.ok) {
          const errText = await calRes.text();
          return Response.json({ ok: false, error: `Calendar API error: ${errText}` });
        }

        const event = await calRes.json();

        // Update the task with the calendar event link
        await client3.entities.SwarmTask.update(task_id, {
          notes: `Scheduled in Google Calendar: ${event.htmlLink}`,
        }).catch(() => {});

        return Response.json({
          ok: true,
          event_id: event.id,
          event_link: event.htmlLink,
          message: `Scheduled in Google Calendar. The task is now on your calendar and will be tracked by Alpha Prime.`,
        });
      } catch (e) {
        return Response.json({ ok: false, error: e.message });
      }
    }

    return Response.json({ error: "Unknown action. Use 'audit', 'approve', or 'schedule'." }, { status: 400 });
  } catch (error) {
    console.error("alphaPrimeAudit error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}