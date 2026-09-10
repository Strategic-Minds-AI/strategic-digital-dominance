import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { getSupabaseConfig, runSupabaseSQL } from '../../shared/supabaseClient.ts';

// ─────────────────────────────────────────────────────────────────────────────
// graphEngine — Knowledge Graph layer.
//
// Relational graph on Supabase: graph_nodes (entities) + graph_edges (relationships).
// Combined with pgvector embeddings on nodes for hybrid vector + graph reasoning.
//
// This is what transforms "find similar documents" into "understand relationships."
// You can ask "show me every contractor in FL who serves the same market as Lead X"
// and the graph traverses the relationships — vector search alone can't do that.
//
// Actions:
//   initSchema     — graph_nodes + graph_edges + traversal functions
//   sync           — sync Base44 entities into graph (leads, competitors, websites, strategies)
//   traverse       — multi-hop graph traversal from a node
//   findNodes      — search nodes by label or type
//   hybridQuery    — vector search → graph expansion → LLM generation
//   stats          — node/edge counts
//   clear          — wipe graph
//
// Requires:
//   - VERCEL_AI_GATEWAY_API_KEY secret (for embeddings via vercelAiGateway)
//   - Supabase connector authorized with database:write scope
// ─────────────────────────────────────────────────────────────────────────────

const EMBEDDING_DIMS = 1536;
const NODE_TYPES = ['contractor', 'homeowner_lead', 'competitor', 'market', 'website', 'strategy'];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ── initSchema ──
    if (action === 'initSchema') {
      await runSupabaseSQL(base44, `
        CREATE TABLE IF NOT EXISTS graph_nodes (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          node_type text NOT NULL,
          external_id text,
          label text NOT NULL,
          properties jsonb DEFAULT '{}',
          embedding vector(${EMBEDDING_DIMS}),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `);
      await runSupabaseSQL(base44, `
        CREATE TABLE IF NOT EXISTS graph_edges (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          from_node_id uuid NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
          to_node_id uuid NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
          edge_type text NOT NULL,
          properties jsonb DEFAULT '{}',
          weight float DEFAULT 1.0,
          created_at timestamptz DEFAULT now()
        );
      `);

      // Unique constraint for upserts (external_id per node_type)
      await runSupabaseSQL(base44, `
        CREATE UNIQUE INDEX IF NOT EXISTS graph_nodes_type_ext_unique_idx
        ON graph_nodes(node_type, external_id) WHERE external_id IS NOT NULL;
      `);
      // Unique constraint for edges (prevent duplicates)
      await runSupabaseSQL(base44, `
        CREATE UNIQUE INDEX IF NOT EXISTS graph_edges_unique_idx
        ON graph_edges(from_node_id, to_node_id, edge_type);
      `);

      // Indexes
      await runSupabaseSQL(base44, `CREATE INDEX IF NOT EXISTS graph_nodes_type_idx ON graph_nodes(node_type);`);
      await runSupabaseSQL(base44, `CREATE INDEX IF NOT EXISTS graph_nodes_embedding_idx ON graph_nodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`);
      await runSupabaseSQL(base44, `CREATE INDEX IF NOT EXISTS graph_edges_from_idx ON graph_edges(from_node_id);`);
      await runSupabaseSQL(base44, `CREATE INDEX IF NOT EXISTS graph_edges_to_idx ON graph_edges(to_node_id);`);
      await runSupabaseSQL(base44, `CREATE INDEX IF NOT EXISTS graph_edges_type_idx ON graph_edges(edge_type);`);

      // Graph traversal function — BIDIRECTIONAL (follows edges in both directions)
      // This is critical: leads point TO markets (located_in), so traversing FROM
      // a market node requires following incoming edges to discover the leads.
      await runSupabaseSQL(base44, `
        CREATE OR REPLACE FUNCTION graph_traverse(start_node_id uuid, max_hops int DEFAULT 2)
        RETURNS TABLE(
            node_id uuid, node_type text, label text, properties jsonb,
            hop int, edge_type text, from_node_id uuid
        )
        LANGUAGE sql AS $$
            WITH RECURSIVE traverse AS (
                SELECT n.id, n.node_type, n.label, n.properties, 0 as hop,
                       NULL::text as edge_type, NULL::uuid as from_node_id,
                       ARRAY[n.id] as path
                FROM graph_nodes n WHERE n.id = start_node_id
                UNION ALL
                SELECT
                    CASE WHEN e.from_node_id = t.id THEN e.to_node_id ELSE e.from_node_id END,
                    n.node_type, n.label, n.properties, t.hop + 1,
                    e.edge_type, e.from_node_id,
                    t.path || CASE WHEN e.from_node_id = t.id THEN e.to_node_id ELSE e.from_node_id END
                FROM traverse t
                JOIN graph_edges e ON (e.from_node_id = t.id OR e.to_node_id = t.id)
                JOIN graph_nodes n ON n.id = CASE WHEN e.from_node_id = t.id THEN e.to_node_id ELSE e.from_node_id END
                WHERE t.hop < max_hops
                  AND NOT (n.id = ANY(t.path))
            )
            SELECT DISTINCT ON (id) id as node_id, node_type, label, properties, hop, edge_type, from_node_id
            FROM traverse ORDER BY id, hop;
        $$;
      `);

      // Vector search on graph nodes
      await runSupabaseSQL(base44, `
        CREATE OR REPLACE FUNCTION graph_vector_search(query_embedding vector(1536), node_type_filter text DEFAULT NULL, limit_count int DEFAULT 10)
        RETURNS TABLE(node_id uuid, node_type text, label text, properties jsonb, similarity double precision)
        LANGUAGE sql AS $$
            SELECT id, node_type, label, properties,
                   1 - (embedding <=> query_embedding) as similarity
            FROM graph_nodes
            WHERE embedding IS NOT NULL
              AND (node_type_filter IS NULL OR node_type = node_type_filter)
            ORDER BY embedding <=> query_embedding
            LIMIT limit_count;
        $$;
      `);

      return Response.json({ ok: true, message: 'Graph schema initialized — graph_nodes + graph_edges + traversal functions ready' });
    }

    // ── sync: Sync Base44 entities into the graph ──
    if (action === 'sync') {
      const entityType = body.entity_type || 'leads';
      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      const headers = {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      };

      let nodesCreated = 0, edgesCreated = 0, skipped = 0;

      // Helper: upsert a node, return its id
      async function upsertNode(node_type: string, external_id: string, label: string, properties: any, embeddingText?: string) {
        let embedding: number[] | null = null;
        if (embeddingText) {
          try {
            const embRes = await base44.functions.invoke('vercelAiGateway', { action: 'generateEmbedding', text: embeddingText.slice(0, 8000) });
            embedding = embRes.data?.embedding;
          } catch { /* skip embedding on error */ }
        }

        const payload: any = {
          node_type,
          external_id: external_id || null,
          label: label.slice(0, 500),
          properties: properties || {},
          updated_at: new Date().toISOString(),
        };
        if (embedding) payload.embedding = `[${embedding.join(',')}]`;

        const res = await fetch(`${projectUrl}/rest/v1/graph_nodes`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error('Node upsert failed:', await res.text());
          return null;
        }
        const data = await res.json();
        return data[0]?.id;
      }

      // Helper: upsert an edge (idempotent)
      async function upsertEdge(from_id: string, to_id: string, edge_type: string, properties?: any) {
        if (!from_id || !to_id) return false;
        const res = await fetch(`${projectUrl}/rest/v1/graph_edges`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({
            from_node_id: from_id, to_node_id: to_id, edge_type,
            properties: properties || {}, weight: 1.0,
          }),
        });
        return res.ok;
      }

      // ── Sync Leads ──
      if (entityType === 'leads' || entityType === 'all') {
        const batchSize = Math.min(parseInt(body.batch_size) || 50, 100);
        const offset = parseInt(body.offset) || 0;
        const leads = await base44.asServiceRole.entities.Lead.list('-created_date', batchSize, offset);

        for (const lead of leads) {
          try {
            const isContractor = lead.lead_type === 'contractor';
            const node_type = isContractor ? 'contractor' : 'homeowner_lead';
            const label = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email || 'Unknown';
            const props = {
              email: lead.email, phone: lead.phone,
              city: lead.city, state: lead.state, zip: lead.zip,
              sqft: lead.square_footage, estimate_low: lead.estimate_low, estimate_high: lead.estimate_high,
              status: lead.status, lead_type: lead.lead_type, desired_system: lead.desired_system,
            };
            const embText = `${label} ${lead.email || ''} ${lead.city || ''} ${lead.state || ''} ${lead.lead_type || 'homeowner'} ${lead.desired_system || ''} ${lead.notes || ''} ${lead.enrichment || ''}`;

            const nodeId = await upsertNode(node_type, lead.id, label, props, embText);
            if (!nodeId) { skipped++; continue; }
            nodesCreated++;

            // Create market node + edge
            if (lead.city && lead.state) {
              const marketKey = `market:${lead.state}:${lead.city}`.toLowerCase().replace(/[^a-z0-9:]/g, '');
              const marketLabel = `${lead.city}, ${lead.state}`;
              const marketId = await upsertNode('market', marketKey, marketLabel, { city: lead.city, state: lead.state }, marketLabel);
              if (marketId) {
                await upsertEdge(nodeId, marketId, isContractor ? 'serves' : 'located_in');
                edgesCreated++;
              }
            }
          } catch { skipped++; }
        }

        return Response.json({
          ok: true, entity_type: 'leads',
          nodes_created: nodesCreated, edges_created: edgesCreated, skipped,
          processed: leads.length, next_offset: offset + leads.length,
          has_more: leads.length === batchSize,
        });
      }

      // ── Sync Competitors ──
      if (entityType === 'competitors' || entityType === 'all') {
        try {
          const competitors = await base44.asServiceRole.entities.CompetitorInsight.list('-created_date', 100, 0);
          for (const comp of competitors) {
            try {
              const label = comp.name || comp.url || 'Unknown Competitor';
              const props = { url: comp.url, services: comp.services, pricing: comp.pricing, city: comp.city, state: comp.state };
              const embText = `${label} ${comp.url || ''} ${comp.services || ''} ${comp.pricing || ''} ${comp.city || ''} ${comp.state || ''}`;
              const nodeId = await upsertNode('competitor', comp.id, label, props, embText);
              if (!nodeId) { skipped++; continue; }
              nodesCreated++;
              if (comp.city && comp.state) {
                const marketKey = `market:${comp.state}:${comp.city}`.toLowerCase().replace(/[^a-z0-9:]/g, '');
                const marketId = await upsertNode('market', marketKey, `${comp.city}, ${comp.state}`, { city: comp.city, state: comp.state }, `${comp.city}, ${comp.state}`);
                if (marketId) { await upsertEdge(nodeId, marketId, 'serves'); edgesCreated++; }
              }
            } catch { skipped++; }
          }
        } catch (e) { console.error('Competitor sync error:', e.message); }
        return Response.json({ ok: true, entity_type: 'competitors', nodes_created: nodesCreated, edges_created: edgesCreated, skipped });
      }

      // ── Sync Websites ──
      if (entityType === 'websites' || entityType === 'all') {
        try {
          const templates = await base44.asServiceRole.entities.WebsiteTemplate.list('-created_date', 100, 0);
          for (const tmpl of templates) {
            try {
              const label = tmpl.name || tmpl.slug || 'Unknown Site';
              const props = { slug: tmpl.slug, status: tmpl.status, domain: tmpl.config?.domain, city: tmpl.config?.primary_city, state: tmpl.config?.primary_state };
              const embText = `${label} ${tmpl.slug || ''} ${tmpl.config?.domain || ''} ${tmpl.config?.primary_city || ''} ${tmpl.config?.primary_state || ''}`;
              const nodeId = await upsertNode('website', tmpl.id, label, props, embText);
              if (!nodeId) { skipped++; continue; }
              nodesCreated++;
              if (tmpl.config?.primary_city && tmpl.config?.primary_state) {
                const marketKey = `market:${tmpl.config.primary_state}:${tmpl.config.primary_city}`.toLowerCase().replace(/[^a-z0-9:]/g, '');
                const marketId = await upsertNode('market', marketKey, `${tmpl.config.primary_city}, ${tmpl.config.primary_state}`, { city: tmpl.config.primary_city, state: tmpl.config.primary_state }, `${tmpl.config.primary_city}, ${tmpl.config.primary_state}`);
                if (marketId) { await upsertEdge(nodeId, marketId, 'targets'); edgesCreated++; }
              }
            } catch { skipped++; }
          }
        } catch (e) { console.error('Website sync error:', e.message); }
        return Response.json({ ok: true, entity_type: 'websites', nodes_created: nodesCreated, edges_created: edgesCreated, skipped });
      }

      // ── Sync Strategy Docs ──
      if (entityType === 'strategies' || entityType === 'all') {
        try {
          const docs = await base44.asServiceRole.entities.StrategyDocument.list('-created_date', 50, 0);
          for (const doc of docs) {
            try {
              const label = doc.title || 'Untitled Strategy';
              const props = { type: doc.type, summary: doc.summary, status: doc.status };
              const embText = `${label} ${doc.type || ''} ${doc.summary || ''} ${doc.content?.slice(0, 2000) || ''}`;
              const nodeId = await upsertNode('strategy', doc.id, label, props, embText);
              if (!nodeId) { skipped++; continue; }
              nodesCreated++;
            } catch { skipped++; }
          }
        } catch (e) { console.error('Strategy sync error:', e.message); }
        return Response.json({ ok: true, entity_type: 'strategies', nodes_created: nodesCreated, edges_created: edgesCreated, skipped });
      }

      return Response.json({ error: `Unknown entity_type: ${entityType}` }, { status: 400 });
    }

    // ── traverse: Multi-hop graph traversal ──
    if (action === 'traverse') {
      const { node_id, max_hops } = body;
      if (!node_id) return Response.json({ error: 'node_id required' }, { status: 400 });
      const hops = Math.min(Math.max(parseInt(max_hops) || 2, 1), 5);

      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      const res = await fetch(`${projectUrl}/rest/v1/rpc/graph_traverse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_node_id: node_id, max_hops: hops }),
      });
      if (!res.ok) return Response.json({ error: await res.text() }, { status: 500 });
      const results = await res.json();
      return Response.json({ ok: true, nodes: Array.isArray(results) ? results : [] });
    }

    // ── findNodes: Search nodes by label or type ──
    if (action === 'findNodes') {
      const { query, node_type, limit } = body;
      const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);

      let url = `${projectUrl}/rest/v1/graph_nodes?select=id,node_type,label,properties&order=created_at.desc&limit=${lim}`;
      if (node_type) url += `&node_type=eq.${node_type}`;
      if (query) url += `&label=ilike.*${encodeURIComponent(query)}*`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey } });
      if (!res.ok) return Response.json({ error: await res.text() }, { status: 500 });
      const results = await res.json();
      return Response.json({ ok: true, nodes: Array.isArray(results) ? results : [] });
    }

    // ── hybridQuery: Vector search → graph expansion → LLM ──
    if (action === 'hybridQuery') {
      const q = body.query;
      if (!q) return Response.json({ error: 'query required' }, { status: 400 });

      const maxHops = Math.min(Math.max(parseInt(body.max_hops) || 1, 1), 3);
      const topK = Math.min(Math.max(parseInt(body.top_k) || 5, 1), 20);

      // 1. Embed the query
      const embRes = await base44.functions.invoke('vercelAiGateway', { action: 'generateEmbedding', text: q });
      const embedding = embRes.data?.embedding;
      if (!embedding) return Response.json({ error: 'Embedding generation failed' }, { status: 500 });

      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      const rpcHeaders = { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey, 'Content-Type': 'application/json' };

      // 2. Vector search on graph nodes
      const vecRes = await fetch(`${projectUrl}/rest/v1/rpc/graph_vector_search`, {
        method: 'POST', headers: rpcHeaders,
        body: JSON.stringify({ query_embedding: `[${embedding.join(',')}]`, node_type_filter: body.node_type || null, limit_count: topK }),
      });
      if (!vecRes.ok) return Response.json({ error: `Vector search failed: ${await vecRes.text()}` }, { status: 500 });
      const seedNodes = await vecRes.json();

      if (!Array.isArray(seedNodes) || seedNodes.length === 0) {
        return Response.json({ ok: true, answer: 'No relevant nodes found in the knowledge graph. Try syncing data first.', sources: [], graph_nodes: [] });
      }

      // 3. Graph expansion from each seed
      const allNodes = new Map();
      for (const seed of seedNodes) {
        allNodes.set(seed.node_id, {
          node_id: seed.node_id, node_type: seed.node_type, label: seed.label,
          properties: seed.properties, similarity: seed.similarity, hop: 0, edge_type: null,
        });

        const travRes = await fetch(`${projectUrl}/rest/v1/rpc/graph_traverse`, {
          method: 'POST', headers: rpcHeaders,
          body: JSON.stringify({ start_node_id: seed.node_id, max_hops: maxHops }),
        });
        if (travRes.ok) {
          const travNodes = await travRes.json();
          for (const tn of travNodes) {
            if (!allNodes.has(tn.node_id)) {
              allNodes.set(tn.node_id, {
                node_id: tn.node_id, node_type: tn.node_type, label: tn.label,
                properties: tn.properties, hop: tn.hop, edge_type: tn.edge_type, from_node_id: tn.from_node_id,
              });
            }
          }
        }
      }

      // 4. Build context
      const contextNodes = Array.from(allNodes.values()).sort((a, b) => {
        if (a.hop !== b.hop) return a.hop - b.hop;
        return (b.similarity || 0) - (a.similarity || 0);
      });

      const context = contextNodes.map((n, i) => {
        const props = typeof n.properties === 'string' ? JSON.parse(n.properties) : (n.properties || {});
        const propStr = Object.entries(props).slice(0, 10).map(([k, v]) => `${k}: ${v}`).join(', ');
        const rel = n.hop === 0
          ? ` (seed, similarity ${Number(n.similarity || 0).toFixed(3)})`
          : ` (hop ${n.hop}, via ${n.edge_type})`;
        return `[${i + 1}] ${n.node_type}: ${n.label}${rel}\n    ${propStr}`;
      }).join('\n\n');

      // 5. Generate answer
      const genRes = await base44.functions.invoke('vercelAiGateway', {
        action: 'generateText',
        system_prompt: body.system_prompt || 'You are the Xtreme Intelligence Architect with access to a knowledge graph. The graph contains entities (contractors, leads, competitors, markets, websites, strategies) connected by relationships (serves, located_in, targets, competes_with). Answer using the retrieved nodes AND their relationships. Reason about how entities connect. Cite sources by number [1], [2], etc.',
        prompt: `Knowledge graph context (nodes + relationships):\n\n${context}\n\n---\n\nQuestion: ${q}\n\nAnswer:`,
      });

      return Response.json({
        ok: true,
        answer: genRes.data?.text,
        sources: contextNodes.slice(0, 15).map((n) => ({
          type: n.node_type, label: n.label, hop: n.hop,
          similarity: n.similarity ? Number(n.similarity).toFixed(3) : null,
          edge: n.edge_type,
        })),
        graph_nodes: contextNodes,
      });
    }

    // ── stats ──
    if (action === 'stats') {
      const nodeStats = await runSupabaseSQL(base44, `SELECT node_type, count(*) as count FROM graph_nodes GROUP BY node_type ORDER BY count DESC;`);
      const edgeStats = await runSupabaseSQL(base44, `SELECT edge_type, count(*) as count FROM graph_edges GROUP BY edge_type ORDER BY count DESC;`);
      return Response.json({
        ok: true,
        nodes: Array.isArray(nodeStats) ? nodeStats : [],
        edges: Array.isArray(edgeStats) ? edgeStats : [],
      });
    }

    // ── clear ──
    if (action === 'clear') {
      await runSupabaseSQL(base44, `DELETE FROM graph_edges;`);
      await runSupabaseSQL(base44, `DELETE FROM graph_nodes;`);
      return Response.json({ ok: true, message: 'Graph cleared' });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[graphEngine] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}