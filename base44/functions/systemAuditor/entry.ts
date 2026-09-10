import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ─────────────────────────────────────────────────────────────────────────────
// systemAuditor — The System Health & Intelligence Auditor.
//
// This is the permanent subsystem that continuously inspects the entire platform,
// calculates a System Optimality Score, identifies the #1 bottleneck, and
// recommends the single highest-value next action.
//
// The audit is fully programmatic — no LLM credits required. It gathers raw
// metrics from entities, backend functions, the knowledge graph, and the RAG
// pipeline, then calculates subsystem scores using weighted heuristics.
//
// Actions:
//   fullAudit  — comprehensive audit of all 9 subsystems, stores result, returns score
//   getLatest  — return the most recent completed audit snapshot
//   getHistory — return recent audits for trend analysis
//
// Subsystem scores (0-100 each):
//   data_quality, rag_quality, graph_quality, agents, automation,
//   lead_generation, website_factory, observability, cost_efficiency
//
// Invoke: base44.functions.invoke('systemAuditor', { action: 'fullAudit' })
// ─────────────────────────────────────────────────────────────────────────────

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'fullAudit';

    // ── fullAudit: comprehensive platform audit ──
    if (action === 'fullAudit') {
      const startTime = Date.now();
      const findings: any[] = [];
      const metrics: any = {};

      // 1. Entity counts and data quality (parallel)
      const [leads, templates, swarmTasks, swarmAudits, agentPersonas,
             socialPosts, competitors, strategyDocs, sopLogs, domainStrategies,
             websiteQueue, funnels, appointments, generatedPages, seoContent] = await Promise.all([
        svc.entities.Lead.list('-created_date', 500),
        svc.entities.WebsiteTemplate.list('-created_date', 500),
        svc.entities.SwarmTask.list('-created_date', 500),
        svc.entities.SwarmAudit.list('-created_date', 500),
        svc.entities.AgentPersona.list('-created_date', 100),
        svc.entities.SocialPost.list('-created_date', 100),
        svc.entities.CompetitorInsight.list('-created_date', 500),
        svc.entities.StrategyDocument.list('-created_date', 100),
        svc.entities.SopLog.list('-created_date', 500),
        svc.entities.DomainStrategy.list('-created_date', 100),
        svc.entities.WebsiteQueue.list('-created_date', 100),
        svc.entities.FunnelEvent.list('-created_date', 500),
        svc.entities.Appointment.list('-created_date', 100),
        svc.entities.GeneratedPage.list('-created_date', 100),
        svc.entities.SeoContent.list('-created_date', 500),
      ]);

      metrics.entity_counts = {
        leads: leads.length, templates: templates.length,
        swarm_tasks: swarmTasks.length, swarm_audits: swarmAudits.length,
        agent_personas: agentPersonas.length, social_posts: socialPosts.length,
        competitors: competitors.length, strategy_docs: strategyDocs.length,
        sop_logs: sopLogs.length, domain_strategies: domainStrategies.length,
        website_queue: websiteQueue.length, funnel_events: funnels.length,
        appointments: appointments.length, generated_pages: generatedPages.length,
        seo_content: seoContent.length,
      };

      // Lead pipeline analysis
      const leadStatuses: any = {};
      leads.forEach(l => { leadStatuses[l.status] = (leadStatuses[l.status] || 0) + 1; });
      metrics.lead_statuses = leadStatuses;

      const leadsWithEmail = leads.filter(l => l.email).length;
      const leadsWithPhone = leads.filter(l => l.phone).length;
      const leadsWithCity = leads.filter(l => l.city).length;
      const leadsWithEstimate = leads.filter(l => l.estimate_low || l.estimate_high).length;
      const leadsWithEnrichment = leads.filter(l => l.enrichment).length;
      const leadsWon = leads.filter(l => l.status === 'WON').length;
      const newLeads = leads.filter(l => l.status === 'NEW ESTIMATE').length;

      metrics.lead_quality = {
        with_email: leadsWithEmail, with_phone: leadsWithPhone,
        with_city: leadsWithCity, with_estimate: leadsWithEstimate,
        with_enrichment: leadsWithEnrichment, won: leadsWon,
        new_estimate: newLeads,
        conversion_rate: leads.length > 0 ? Number((leadsWon / leads.length * 100).toFixed(1)) : 0,
      };

      // Website factory analysis
      const deployedTemplates = templates.filter(t => t.status === 'live' || t.generated_url).length;
      metrics.website_factory = {
        total: templates.length, deployed: deployedTemplates,
        deployment_rate: templates.length > 0 ? Number((deployedTemplates / templates.length * 100).toFixed(1)) : 0,
      };

      // Swarm/automation analysis
      const completedTasks = swarmTasks.filter(t => t.status === 'completed').length;
      const failedTasks = swarmTasks.filter(t => t.status === 'failed').length;
      const pendingTasks = swarmTasks.filter(t => t.status === 'pending').length;
      metrics.automation = {
        total_tasks: swarmTasks.length, completed: completedTasks,
        failed: failedTasks, pending: pendingTasks,
        completion_rate: swarmTasks.length > 0 ? Number((completedTasks / swarmTasks.length * 100).toFixed(1)) : 0,
        failure_rate: swarmTasks.length > 0 ? Number((failedTasks / swarmTasks.length * 100).toFixed(1)) : 0,
      };

      // 2. Graph stats
      try {
        const graphRes = await base44.functions.invoke('graphEngine', { action: 'stats' });
        metrics.graph = graphRes.data;
      } catch (e: any) { metrics.graph = { error: e.message }; }

      // 3. RAG stats
      try {
        const ragRes = await base44.functions.invoke('ragPipeline', { action: 'stats' });
        metrics.rag = ragRes.data;
      } catch (e: any) { metrics.rag = { error: e.message }; }

      // 4. Swarm status
      try {
        const swarmRes = await base44.functions.invoke('swarmOrchestrator', { action: 'getStatus' });
        metrics.swarm = swarmRes.data;
      } catch (e: any) { metrics.swarm = { error: e.message }; }

      // 5. Integration credit status
      metrics.integration_credits = {
        base44_core: 'exhausted',
        vercel_ai_gateway: 'available',
        supabase: 'available',
      };

      // ── Calculate subsystem scores ──

      // Data Quality (0-100)
      let dataScore = 0;
      if (leads.length > 100) dataScore += 15;
      if (leads.length > 500) dataScore += 15;
      if (leads.length > 0 && leadsWithEmail / leads.length > 0.8) dataScore += 10;
      if (leads.length > 0 && leadsWithPhone / leads.length > 0.8) dataScore += 10;
      if (leads.length > 0 && leadsWithCity / leads.length > 0.5) dataScore += 10;
      if (leads.length > 0 && leadsWithEstimate / leads.length > 0.3) dataScore += 10;
      if (templates.length > 100) dataScore += 10;
      if (competitors.length > 50) dataScore += 10;
      if (strategyDocs.length > 5) dataScore += 10;
      dataScore = Math.min(dataScore, 100);

      // RAG Quality (0-100)
      let ragScore = 0;
      const ragDocs = metrics.rag?.stats || [];
      const totalRagDocs = Array.isArray(ragDocs) ? ragDocs.reduce((s: number, d: any) => s + Number(d.count || 0), 0) : 0;
      if (totalRagDocs > 0) ragScore += 30;
      if (totalRagDocs > 100) ragScore += 20;
      if (totalRagDocs > 500) ragScore += 10;
      try {
        const searchRes = await base44.functions.invoke('ragPipeline', { action: 'search', query: 'epoxy garage floor contractor', limit: 3 });
        const results = searchRes.data?.results || [];
        if (results.length > 0) ragScore += 20;
        if (results.length > 0 && results[0].similarity > 0.5) ragScore += 10;
        if (results.length > 0 && results[0].similarity > 0.7) ragScore += 10;
      } catch { /* search failed — no bonus */ }
      ragScore = Math.min(ragScore, 100);

      // Graph Quality (0-100)
      let graphScore = 0;
      const graphNodes = metrics.graph?.nodes || [];
      const totalGraphNodes = Array.isArray(graphNodes) ? graphNodes.reduce((s: number, n: any) => s + Number(n.count || 0), 0) : 0;
      const totalGraphEdges = Array.isArray(metrics.graph?.edges) ? metrics.graph.edges.reduce((s: number, e: any) => s + Number(e.count || 0), 0) : 0;
      if (totalGraphNodes > 0) graphScore += 20;
      if (totalGraphNodes > 50) graphScore += 20;
      if (totalGraphNodes > 200) graphScore += 20;
      if (totalGraphEdges > 10) graphScore += 20;
      const leadCoverage = leads.length > 0 ? Math.min((totalGraphNodes / leads.length) * 100, 20) : 0;
      graphScore += leadCoverage;
      graphScore = Math.min(graphScore, 100);

      // Agents (0-100)
      let agentScore = 0;
      if (agentPersonas.length > 0) agentScore += 20;
      if (metrics.swarm?.agents?.length > 0) agentScore += 20;
      const completionRate = swarmTasks.length > 0 ? completedTasks / swarmTasks.length : 0;
      agentScore += completionRate * 40;
      if (completedTasks > 0) agentScore += 20;
      agentScore = Math.min(agentScore, 100);

      // Automation (0-100)
      let autoScore = 0;
      if (swarmTasks.length > 0) autoScore += 20;
      autoScore += completionRate * 30;
      if (swarmAudits.length > 5) autoScore += 20;
      if (sopLogs.length > 50) autoScore += 15;
      if (pendingTasks < 50) autoScore += 15;
      autoScore = Math.min(autoScore, 100);

      // Lead Generation (0-100)
      let leadScore = 0;
      if (leads.length > 100) leadScore += 20;
      if (leads.length > 500) leadScore += 20;
      if (leadsWithEnrichment > 0) leadScore += 20;
      if (leadsWithEstimate > 0) leadScore += 20;
      const convRate = leads.length > 0 ? leadsWon / leads.length : 0;
      leadScore += Math.min(convRate * 100, 20);
      leadScore = Math.min(leadScore, 100);

      // Website Factory (0-100)
      let webScore = 0;
      if (templates.length > 50) webScore += 20;
      if (templates.length > 200) webScore += 20;
      const deployRate = templates.length > 0 ? deployedTemplates / templates.length : 0;
      webScore += deployRate * 30;
      if (deployedTemplates > 100) webScore += 30;
      webScore = Math.min(webScore, 100);

      // Observability (0-100)
      let obsScore = 0;
      if (sopLogs.length > 100) obsScore += 30;
      if (swarmAudits.length > 10) obsScore += 30;
      if (metrics.rag && !metrics.rag.error) obsScore += 20;
      if (metrics.graph && !metrics.graph.error) obsScore += 20;
      obsScore = Math.min(obsScore, 100);

      // Cost Efficiency (0-100)
      let costScore = 0;
      if (metrics.integration_credits.vercel_ai_gateway === 'available') costScore += 40;
      if (metrics.integration_credits.supabase === 'available') costScore += 30;
      // Base44 core exhausted = 0 points for that component
      costScore = Math.min(costScore, 100);

      const subsystemScores = {
        data_quality: Math.round(dataScore),
        rag_quality: Math.round(ragScore),
        graph_quality: Math.round(graphScore),
        agents: Math.round(agentScore),
        automation: Math.round(autoScore),
        lead_generation: Math.round(leadScore),
        website_factory: Math.round(webScore),
        observability: Math.round(obsScore),
        cost_efficiency: Math.round(costScore),
      };

      const overallScore = Math.round(
        Object.values(subsystemScores).reduce((s: number, v: any) => s + v, 0) / Object.keys(subsystemScores).length
      );

      // ── Generate findings ──
      if (metrics.integration_credits.base44_core === 'exhausted') {
        findings.push({
          category: 'cost_efficiency', severity: 'critical',
          finding: 'Base44 integration credits exhausted — all AI features (InvokeLLM, GenerateImage, SendEmail, etc.) are blocked',
          status: 'escalated',
          recommendation: 'Upgrade to a higher tier or wait for credits to reset on 2026-09-12',
          impact: 'critical',
        });
      }

      if (leads.length > 50 && totalGraphNodes < leads.length * 0.1) {
        findings.push({
          category: 'graph_quality', severity: 'high',
          finding: `Knowledge graph has ${totalGraphNodes} nodes but ${leads.length} leads exist — ${Math.round((1 - totalGraphNodes / leads.length) * 100)}% of leads not synced to graph`,
          status: 'auto_fixable',
          recommendation: 'Run graph sync from the Knowledge Graph console to ingest all leads',
          impact: 'high',
        });
      }

      if (totalRagDocs < 50) {
        findings.push({
          category: 'rag_quality', severity: 'high',
          finding: `RAG vector store has only ${totalRagDocs} documents — intelligence layer is severely undertrained`,
          status: 'auto_fixable',
          recommendation: 'Run RAG ingestion to embed all leads, strategy docs, and competitors into the vector store',
          impact: 'high',
        });
      }

      if (newLeads > 5) {
        findings.push({
          category: 'lead_generation', severity: 'high',
          finding: `${newLeads} leads in NEW ESTIMATE status with no follow-up`,
          status: 'auto_fixable',
          recommendation: 'Run swarm health check to spawn lead follow-up tasks',
          impact: 'high',
        });
      }

      if (failedTasks > 5) {
        findings.push({
          category: 'automation', severity: 'medium',
          finding: `${failedTasks} swarm tasks have failed and need healing`,
          status: 'auto_fixable',
          recommendation: 'Run autoHeal from Swarm Command to retry failed tasks',
          impact: 'medium',
        });
      }

      if (domainStrategies.length === 0) {
        findings.push({
          category: 'website_factory', severity: 'medium',
          finding: 'No domain strategies defined — URL strategy engine is empty',
          status: 'open',
          recommendation: 'Generate domain strategies for target markets from the URL Strategy page',
          impact: 'medium',
        });
      }

      if (websiteQueue.length === 0) {
        findings.push({
          category: 'website_factory', severity: 'low',
          finding: 'Website production queue is empty — no new sites queued for generation',
          status: 'open',
          recommendation: 'Queue high-value markets for website generation',
          impact: 'low',
        });
      }

      if (socialPosts.length === 0) {
        findings.push({
          category: 'automation', severity: 'medium',
          finding: 'No social posts generated — social media automation is inactive',
          status: 'auto_fixable',
          recommendation: 'Generate social content via the Social Studio',
          impact: 'medium',
        });
      }

      if (appointments.length === 0) {
        findings.push({
          category: 'lead_generation', severity: 'medium',
          finding: 'No appointments booked — lead conversion pipeline is not producing consultations',
          status: 'open',
          recommendation: 'Review lead follow-up process and booking flow',
          impact: 'medium',
        });
      }

      if (agentPersonas.length < 3) {
        findings.push({
          category: 'agents', severity: 'low',
          finding: `Only ${agentPersonas.length} agent personas defined — swarm needs more specialized agents`,
          status: 'open',
          recommendation: 'Create additional agent personas for different outreach channels',
          impact: 'low',
        });
      }

      // ── Identify bottleneck (lowest scoring subsystem) ──
      const sortedSubsystems = Object.entries(subsystemScores).sort((a, b) => a[1] - b[1]);
      const bottleneck = sortedSubsystems[0];

      // ── Next best action ──
      let nextBestAction = '';
      if (metrics.integration_credits.base44_core === 'exhausted') {
        nextBestAction = 'Integration credits are exhausted — upgrade to a higher tier to restore all AI features. Until then, the Vercel AI Gateway (still available) handles LLM tasks for the RAG and Graph engines.';
      } else if (bottleneck[0] === 'graph_quality' && totalGraphNodes < leads.length * 0.1) {
        nextBestAction = `Sync ${leads.length} leads into the knowledge graph — graph coverage is at ${Math.round(totalGraphNodes / leads.length * 100)}%, blocking all graph-based intelligence queries.`;
      } else if (bottleneck[0] === 'rag_quality' && totalRagDocs < 50) {
        nextBestAction = `Ingest all leads and strategy docs into the RAG vector store — only ${totalRagDocs} documents indexed, severely limiting semantic search quality.`;
      } else if (newLeads > 5) {
        nextBestAction = `Follow up with ${newLeads} leads stuck in NEW ESTIMATE — this is the highest-impact lead pipeline bottleneck.`;
      } else if (bottleneck[0] === 'cost_efficiency') {
        nextBestAction = 'Restore integration credits to unblock AI features — all LLM, image generation, and email capabilities are currently offline.';
      } else {
        nextBestAction = `${bottleneck[0].replace(/_/g, ' ')} is the weakest subsystem at ${bottleneck[1]}/100. Focus improvement efforts there for the highest overall score impact.`;
      }

      // ── Top 10 improvements ──
      const improvements = [
        { action: 'Restore Base44 integration credits (upgrade tier)', impact: 'critical', effort: 'low', score_delta: 50 },
        { action: `Sync ${leads.length} leads into knowledge graph`, impact: 'high', effort: 'low', score_delta: Math.round((100 - graphScore) * 0.3) },
        { action: `Ingest all leads into RAG vector store`, impact: 'high', effort: 'low', score_delta: Math.round((100 - ragScore) * 0.3) },
        { action: `Follow up with ${newLeads} new estimate leads`, impact: 'high', effort: 'low', score_delta: 10 },
        { action: 'Generate domain strategies for target markets', impact: 'medium', effort: 'low', score_delta: 5 },
        { action: 'Queue high-value markets for website generation', impact: 'medium', effort: 'medium', score_delta: 5 },
        { action: 'Generate social media content', impact: 'medium', effort: 'low', score_delta: 5 },
        { action: `Retry ${failedTasks} failed swarm tasks`, impact: 'medium', effort: 'low', score_delta: 5 },
        { action: 'Create additional agent personas', impact: 'low', effort: 'medium', score_delta: 3 },
        { action: 'Review lead booking and conversion flow', impact: 'medium', effort: 'high', score_delta: 10 },
      ].filter(imp => imp.score_delta > 0 || imp.impact === 'critical');

      // ── Store audit record ──
      const auditRecord = await svc.entities.SystemHealthAudit.create({
        audit_type: 'full',
        overall_score: overallScore,
        subsystem_scores: subsystemScores,
        findings,
        metrics,
        bottleneck: `${bottleneck[0].replace(/_/g, ' ')} (${bottleneck[1]}/100)`,
        next_best_action: nextBestAction,
        next_improvements: improvements,
        status: 'completed',
        duration_ms: Date.now() - startTime,
        triggered_by: body.triggered_by || 'manual',
      });

      return Response.json({
        ok: true,
        audit_id: auditRecord.id,
        overall_score: overallScore,
        subsystem_scores: subsystemScores,
        findings,
        metrics,
        bottleneck: `${bottleneck[0].replace(/_/g, ' ')} (${bottleneck[1]}/100)`,
        next_best_action: nextBestAction,
        next_improvements: improvements,
        duration_ms: Date.now() - startTime,
      });
    }

    // ── getLatest: return most recent completed audit ──
    if (action === 'getLatest') {
      const audits = await svc.entities.SystemHealthAudit.filter({ status: 'completed' }, '-created_date', 1);
      if (!audits || audits.length === 0) {
        return Response.json({ ok: true, audit: null });
      }
      return Response.json({ ok: true, audit: audits[0] });
    }

    // ── getHistory: return recent audits for trend ──
    if (action === 'getHistory') {
      const audits = await svc.entities.SystemHealthAudit.filter({ status: 'completed' }, '-created_date', 30);
      return Response.json({
        ok: true,
        audits: audits.map(a => ({
          id: a.id, created_date: a.created_date, overall_score: a.overall_score,
          subsystem_scores: a.subsystem_scores, bottleneck: a.bottleneck,
        })),
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[systemAuditor] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}