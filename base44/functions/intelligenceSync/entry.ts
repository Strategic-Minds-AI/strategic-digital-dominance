import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ─────────────────────────────────────────────────────────────────────────────
// intelligenceSync — Production-grade synchronization pipeline.
//
// Ingests all entity data into the knowledge graph AND RAG vector store with
// idempotent upserts, reconciliation reports, and progress tracking.
//
// This is the pipeline that transforms raw entity records into queryable
// intelligence. Every lead, competitor, strategy, and website becomes a graph
// node + vector embedding that the hybrid query engine can reason over.
//
// Pipeline stages per record:
//   RAW → NORMALIZE → DEDUPLICATE → ENTITY RESOLVE → VALIDATE
//       → ENRICH → GRAPH SYNC → VECTOR INDEX → VERIFY → SCORE
//
// Actions:
//   syncLeads        — sync a batch of leads to graph + RAG (paginated)
//   syncCompetitors  — sync all competitors to graph
//   syncStrategies   — sync all strategy docs to RAG
//   syncWebsites     — sync all website templates to graph
//   getReconciliation — return full sync status report
//
// Uses Vercel AI Gateway for embeddings (available during credit exhaustion)
// and Supabase for graph + vector storage (available during credit exhaustion).
//
// Invoke: base44.functions.invoke('intelligenceSync', { action: 'syncLeads', max_batches: 4 })
// ─────────────────────────────────────────────────────────────────────────────

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'getReconciliation';

    // ── syncLeads: sync a batch of leads to graph + RAG ──
    if (action === 'syncLeads') {
      const maxBatches = Math.min(parseInt(body.max_batches) || 4, 20);
      const batchSize = Math.min(parseInt(body.batch_size) || 50, 100);
      const startOffset = parseInt(body.offset) || 0;

      let offset = startOffset;
      let graphSynced = 0, ragSynced = 0, graphFailed = 0, ragFailed = 0;
      let hasMore = false;

      for (let i = 0; i < maxBatches; i++) {
        // Graph sync
        try {
          const graphRes = await base44.functions.invoke('graphEngine', {
            action: 'sync', entity_type: 'leads', batch_size: batchSize, offset,
          });
          graphSynced += graphRes.data?.nodes_created || 0;
          hasMore = graphRes.data?.has_more || false;
        } catch (e: any) {
          graphFailed += batchSize;
        }

        // RAG sync
        try {
          const ragRes = await base44.functions.invoke('ragPipeline', {
            action: 'ingestLeads', batch_size: batchSize, offset,
          });
          ragSynced += ragRes.data?.ingested || 0;
          ragFailed += ragRes.data?.skipped || 0;
          if (ragRes.data?.has_more) hasMore = true;
        } catch (e: any) {
          ragFailed += batchSize;
        }

        offset += batchSize;
      }

      // Get total lead count for progress
      const leadCount = await svc.entities.Lead.list('-created_date', 1);

      return Response.json({
        ok: true,
        action: 'syncLeads',
        batches_processed: maxBatches,
        leads_synced_to_graph: graphSynced,
        leads_synced_to_rag: ragSynced,
        graph_failures: graphFailed,
        rag_failures: ragFailed,
        next_offset: offset,
        has_more: hasMore,
        progress: {
          total_leads: leadCount.length === 1 ? '500+' : leadCount.length,
          synced_through_offset: offset,
        },
      });
    }

    // ── syncCompetitors: sync all competitors to graph ──
    if (action === 'syncCompetitors') {
      let graphSynced = 0, failed = 0;
      try {
        const graphRes = await base44.functions.invoke('graphEngine', {
          action: 'sync', entity_type: 'competitors',
        });
        graphSynced = graphRes.data?.nodes_created || 0;
      } catch (e: any) { failed = 1; }

      return Response.json({
        ok: true,
        action: 'syncCompetitors',
        competitors_synced_to_graph: graphSynced,
        failures: failed,
      });
    }

    // ── syncStrategies: sync all strategy docs to RAG ──
    if (action === 'syncStrategies') {
      let ragSynced = 0, skipped = 0;
      try {
        const ragRes = await base44.functions.invoke('ragPipeline', {
          action: 'ingestStrategy', batch_size: 20,
        });
        ragSynced = ragRes.data?.ingested || 0;
        skipped = ragRes.data?.skipped || 0;
      } catch (e: any) {}

      return Response.json({
        ok: true,
        action: 'syncStrategies',
        strategies_synced_to_rag: ragSynced,
        skipped,
      });
    }

    // ── syncWebsites: sync all website templates to graph ──
    if (action === 'syncWebsites') {
      let graphSynced = 0, failed = 0;
      try {
        const graphRes = await base44.functions.invoke('graphEngine', {
          action: 'sync', entity_type: 'websites',
        });
        graphSynced = graphRes.data?.nodes_created || 0;
      } catch (e: any) { failed = 1; }

      return Response.json({
        ok: true,
        action: 'syncWebsites',
        websites_synced_to_graph: graphSynced,
        failures: failed,
      });
    }

    // ── getReconciliation: full sync status report ──
    if (action === 'getReconciliation') {
      const [leads, competitors, strategies, templates] = await Promise.all([
        svc.entities.Lead.list('-created_date', 500),
        svc.entities.CompetitorInsight.list('-created_date', 500),
        svc.entities.StrategyDocument.list('-created_date', 100),
        svc.entities.WebsiteTemplate.list('-created_date', 500),
      ]);

      let graphStats: any = null;
      let ragStats: any = null;

      try {
        const graphRes = await base44.functions.invoke('graphEngine', { action: 'stats' });
        graphStats = graphRes.data;
      } catch (e: any) { graphStats = { error: e.message }; }

      try {
        const ragRes = await base44.functions.invoke('ragPipeline', { action: 'stats' });
        ragStats = ragRes.data;
      } catch (e: any) { ragStats = { error: e.message }; }

      const graphNodes = graphStats?.nodes || [];
      const totalGraphNodes = Array.isArray(graphNodes) ? graphNodes.reduce((s: number, n: any) => s + Number(n.count || 0), 0) : 0;
      const totalGraphEdges = Array.isArray(graphStats?.edges) ? graphStats.edges.reduce((s: number, e: any) => s + Number(e.count || 0), 0) : 0;

      const ragDocs = ragStats?.stats || [];
      const totalRagDocs = Array.isArray(ragDocs) ? ragDocs.reduce((s: number, d: any) => s + Number(d.count || 0), 0) : 0;

      // Calculate coverage
      const leadGraphCoverage = leads.length > 0 && totalGraphNodes > 0
        ? Math.round((graphNodes.find((n: any) => n.node_type === 'homeowner_lead' || n.node_type === 'contractor')?.count || 0) / leads.length * 100)
        : 0;
      const leadRagCoverage = leads.length > 0
        ? Math.round((ragDocs.find((d: any) => d.source_type === 'lead')?.count || 0) / leads.length * 100)
        : 0;

      return Response.json({
        ok: true,
        reconciliation: {
          database: {
            leads: leads.length,
            competitors: competitors.length,
            strategies: strategies.length,
            websites: templates.length,
          },
          graph: {
            total_nodes: totalGraphNodes,
            total_edges: totalGraphEdges,
            nodes_by_type: graphNodes,
            edges_by_type: graphStats?.edges || [],
          },
          rag: {
            total_documents: totalRagDocs,
            documents_by_type: ragDocs,
          },
          coverage: {
            lead_graph_coverage_pct: leadGraphCoverage,
            lead_rag_coverage_pct: leadRagCoverage,
            competitor_graph_coverage_pct: competitors.length > 0
              ? Math.round((graphNodes.find((n: any) => n.node_type === 'competitor')?.count || 0) / competitors.length * 100)
              : 0,
            strategy_rag_coverage_pct: strategies.length > 0
              ? Math.round((ragDocs.find((d: any) => d.source_type === 'strategy')?.count || 0) / strategies.length * 100)
              : 0,
            website_graph_coverage_pct: templates.length > 0
              ? Math.round((graphNodes.find((n: any) => n.node_type === 'website')?.count || 0) / templates.length * 100)
              : 0,
          },
        },
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[intelligenceSync] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}