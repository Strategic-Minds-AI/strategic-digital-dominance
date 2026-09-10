import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { getSupabaseConfig, runSupabaseSQL } from '../../shared/supabaseClient.ts';

// ─────────────────────────────────────────────────────────────────────────────
// ragPipeline — Retrieval-Augmented Generation engine.
//
// The "twin turbo" intelligence layer: embeds all entity data into pgvector
// on Supabase, then does semantic search + retrieval-then-generation.
//
// This is what transforms the system from a per-request scraper into an
// accumulating knowledge base. Every lead, strategy doc, and audit becomes
// queryable intelligence the swarm can reason over.
//
// Actions:
//   initSchema      — CREATE EXTENSION vector + rag_documents table
//   ingest         — embed + store a single document
//   ingestLeads    — batch ingest leads (50/call, paginated via offset)
//   ingestStrategy — batch ingest strategy documents
//   search         — semantic vector search (cosine similarity)
//   query          — RAG: retrieve + generate with cited sources
//   stats          — document counts by source_type
//   clear          — delete documents (optionally by source_type)
//
// Requires:
//   - VERCEL_AI_GATEWAY_API_KEY secret (for embeddings via vercelAiGateway)
//   - Supabase connector authorized with database:write scope
// ─────────────────────────────────────────────────────────────────────────────

const EMBEDDING_DIMS = 1536;
const ALLOWED_SOURCE_TYPES = ['lead', 'strategy', 'competitor', 'market', 'general', 'swarm_audit'];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ── initSchema: Create pgvector extension + rag_documents table ──
    if (action === 'initSchema') {
      await runSupabaseSQL(base44, `CREATE EXTENSION IF NOT EXISTS vector;`);
      await runSupabaseSQL(base44, `
        CREATE TABLE IF NOT EXISTS rag_documents (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          source_type text NOT NULL,
          source_id text,
          content text NOT NULL,
          metadata jsonb DEFAULT '{}',
          embedding vector(${EMBEDDING_DIMS}),
          created_at timestamptz DEFAULT now()
        );
      `);
      await runSupabaseSQL(base44, `
        CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx
        ON rag_documents USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
      `);
      // Stored function for vector search — called via PostgREST RPC
      // (avoids sending 30KB embedding strings through the SQL endpoint)
      await runSupabaseSQL(base44, `
        CREATE OR REPLACE FUNCTION rag_search(query_embedding vector(1536), filter_type text DEFAULT NULL, limit_count int DEFAULT 10)
        RETURNS TABLE(id uuid, source_type text, source_id text, content text, metadata jsonb, similarity double precision)
        LANGUAGE sql AS $$
          SELECT id, source_type, source_id, content, metadata,
                 1 - (embedding <=> query_embedding) as similarity
          FROM rag_documents
          WHERE filter_type IS NULL OR source_type = filter_type
          ORDER BY embedding <=> query_embedding
          LIMIT limit_count;
        $$;
      `);
      return Response.json({ ok: true, message: 'Schema initialized — pgvector + rag_documents table + rag_search function ready' });
    }

    // ── ingest: Embed + store a single document ──
    if (action === 'ingest') {
      const { source_type, source_id, content, metadata } = body;
      if (!source_type || !content) return Response.json({ error: 'source_type and content required' }, { status: 400 });

      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      const embRes = await base44.functions.invoke('vercelAiGateway', { action: 'generateEmbedding', text: content.slice(0, 8000) });
      const embedding = embRes.data?.embedding;
      if (!embedding) return Response.json({ error: 'Embedding generation failed' }, { status: 500 });

      const insertRes = await fetch(`${projectUrl}/rest/v1/rag_documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          source_type,
          source_id: source_id || null,
          content,
          metadata: metadata || {},
          embedding: `[${embedding.join(',')}]`,
        }),
      });
      if (!insertRes.ok) {
        const err = await insertRes.text();
        return Response.json({ error: `Insert failed: ${err}` }, { status: 500 });
      }
      return Response.json({ ok: true, ingested: 1 });
    }

    // ── ingestLeads: Batch ingest leads into the vector store ──
    if (action === 'ingestLeads') {
      const batchSize = Math.min(parseInt(body.batch_size) || 50, 200);
      const offset = parseInt(body.offset) || 0;
      const leads = await base44.asServiceRole.entities.Lead.list('-created_date', batchSize, offset);
      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      let ingested = 0, skipped = 0;

      for (const lead of leads) {
        const content = [
          `Name: ${lead.first_name || ''} ${lead.last_name || ''}`,
          `Email: ${lead.email || ''}  Phone: ${lead.phone || ''}`,
          `Address: ${lead.address || ''}, ${lead.city || ''}, ${lead.state || ''} ${lead.zip || ''}`,
          `Source: ${lead.lead_source || 'website'}  Type: ${lead.lead_type || 'homeowner'}`,
          `Status: ${lead.status || 'NEW ESTIMATE'}`,
          `Garage: ${lead.square_footage || '?'} sqft  System: ${lead.desired_system || ''}`,
          `Color: ${lead.flake_color_name || ''}`,
          `Estimate: $${lead.estimate_low || 0}–$${lead.estimate_high || 0}`,
          `Notes: ${lead.notes || ''}`,
          `Enrichment: ${lead.enrichment || ''}`,
        ].join('\n');

        try {
          const embRes = await base44.functions.invoke('vercelAiGateway', { action: 'generateEmbedding', text: content.slice(0, 8000) });
          const embedding = embRes.data?.embedding;
          if (!embedding) { skipped++; continue; }

          await fetch(`${projectUrl}/rest/v1/rag_documents`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              source_type: 'lead',
              source_id: lead.id,
              content,
              metadata: { lead_id: lead.id, status: lead.status, city: lead.city, state: lead.state },
              embedding: `[${embedding.join(',')}]`,
            }),
          });
          ingested++;
        } catch {
          skipped++;
        }
      }

      return Response.json({
        ok: true,
        ingested,
        skipped,
        processed: leads.length,
        next_offset: offset + leads.length,
        has_more: leads.length === batchSize,
      });
    }

    // ── ingestStrategy: Batch ingest strategy documents ──
    if (action === 'ingestStrategy') {
      const batchSize = Math.min(parseInt(body.batch_size) || 20, 100);
      const offset = parseInt(body.offset) || 0;
      const docs = await base44.asServiceRole.entities.StrategyDocument.list('-created_date', batchSize, offset);
      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      let ingested = 0, skipped = 0;

      for (const doc of docs) {
        const content = `${doc.title}\nType: ${doc.type}\n${doc.summary || ''}\n${doc.content || ''}`.slice(0, 8000);
        try {
          const embRes = await base44.functions.invoke('vercelAiGateway', { action: 'generateEmbedding', text: content });
          const embedding = embRes.data?.embedding;
          if (!embedding) { skipped++; continue; }

          await fetch(`${projectUrl}/rest/v1/rag_documents`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              source_type: 'strategy',
              source_id: doc.id,
              content,
              metadata: { title: doc.title, type: doc.type, status: doc.status },
              embedding: `[${embedding.join(',')}]`,
            }),
          });
          ingested++;
        } catch {
          skipped++;
        }
      }

      return Response.json({
        ok: true,
        ingested,
        skipped,
        processed: docs.length,
        next_offset: offset + docs.length,
        has_more: docs.length === batchSize,
      });
    }

    // ── search: Semantic vector search (via PostgREST RPC) ──
    if (action === 'search') {
      const q = body.query;
      if (!q) return Response.json({ error: 'query required' }, { status: 400 });

      const limit = Math.min(Math.max(parseInt(body.limit) || 10, 1), 50);
      const source_type = body.source_type && ALLOWED_SOURCE_TYPES.includes(body.source_type) ? body.source_type : null;

      const embRes = await base44.functions.invoke('vercelAiGateway', { action: 'generateEmbedding', text: q });
      const embedding = embRes.data?.embedding;
      if (!embedding) return Response.json({ error: 'Embedding generation failed' }, { status: 500 });

      const { projectUrl, serviceRoleKey } = await getSupabaseConfig(base44);
      const rpcRes = await fetch(`${projectUrl}/rest/v1/rpc/rag_search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_embedding: `[${embedding.join(',')}]`,
          filter_type: source_type,
          limit_count: limit,
        }),
      });

      if (!rpcRes.ok) {
        const err = await rpcRes.text();
        return Response.json({ error: `Search RPC failed: ${err}` }, { status: 500 });
      }

      const results = await rpcRes.json();
      return Response.json({ ok: true, results: Array.isArray(results) ? results : [] });
    }

    // ── query: RAG — retrieve + generate with cited sources ──
    if (action === 'query') {
      const q = body.query;
      if (!q) return Response.json({ error: 'query required' }, { status: 400 });

      const limit = Math.min(Math.max(parseInt(body.limit) || 5, 1), 20);
      const searchRes = await base44.functions.invoke('ragPipeline', { action: 'search', query: q, limit });
      const docs = searchRes.data?.results || [];

      const context = docs.map((d: any, i: number) =>
        `[${i + 1}] (similarity: ${Number(d.similarity).toFixed(3)}, type: ${d.source_type})\n${d.content}`
      ).join('\n\n---\n\n');

      const genRes = await base44.functions.invoke('vercelAiGateway', {
        action: 'generateText',
        system_prompt: body.system_prompt || 'You are the Xtreme Intelligence Architect. Answer using the retrieved context. Cite sources by number [1], [2], etc. If the context is insufficient, say so explicitly.',
        prompt: `Retrieved context from knowledge base:\n\n${context}\n\n---\n\nQuestion: ${q}\n\nAnswer:`,
      });

      return Response.json({
        ok: true,
        answer: genRes.data?.text,
        sources: docs.map((d: any) => ({
          type: d.source_type,
          id: d.source_id,
          similarity: Number(d.similarity).toFixed(3),
          preview: d.content?.slice(0, 150),
        })),
      });
    }

    // ── stats: Document counts by source_type ──
    if (action === 'stats') {
      const results = await runSupabaseSQL(base44, `SELECT source_type, count(*) as count FROM rag_documents GROUP BY source_type ORDER BY count DESC;`);
      return Response.json({ ok: true, stats: Array.isArray(results) ? results : (results?.rows || []) });
    }

    // ── clear: Delete documents (optionally by source_type) ──
    if (action === 'clear') {
      const source_type = body.source_type && ALLOWED_SOURCE_TYPES.includes(body.source_type) ? body.source_type : null;
      const sql = source_type ? `DELETE FROM rag_documents WHERE source_type = '${source_type}';` : `DELETE FROM rag_documents;`;
      await runSupabaseSQL(base44, sql);
      return Response.json({ ok: true, message: source_type ? `Cleared ${source_type} documents` : 'Cleared all documents' });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[ragPipeline] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}