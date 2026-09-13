import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { MIGRATION_CHUNKS, SUPABASE_PROJECT_REF } from '../../shared/supabaseMigrationSql.ts';

// ════════════════════════════════════════════════════════════════
// supabaseMigrationDeploy
// Deploys hardened control-plane migrations to the canonical Supabase
// project: Xtreme OS (msnsyhpakeujypqxugpz).
//
// Actions:
//   deploy  — Execute all migration chunks sequentially
//   verify  — Check that key tables and functions exist
//   seed    — Insert the default organization and a bootstrap system
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'deploy';

    // ── Get Supabase OAuth access token ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');
    if (!accessToken) return Response.json({ error: 'Supabase connector not connected' }, { status: 500 });

    const supabaseApiBase = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`;

    // ── DEPLOY: Execute all migration chunks ──
    if (action === 'deploy') {
      const results: any[] = [];
      let allOk = true;

      for (const chunk of MIGRATION_CHUNKS) {
        try {
          const res = await fetch(`${supabaseApiBase}/database/query`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: chunk.sql }),
          });

          if (!res.ok) {
            const errText = await res.text();
            // Some errors are expected (e.g., "relation already exists" on rerun)
            // Only fail on unexpected errors
            const isExpected = errText.includes('already exists') || errText.includes('duplicate');
            results.push({
              chunk: chunk.name,
              status: isExpected ? 'already_exists' : 'failed',
              error: errText.slice(0, 500),
            });
            if (!isExpected) allOk = false;
          } else {
            results.push({ chunk: chunk.name, status: 'applied' });
          }
        } catch (e: any) {
          results.push({ chunk: chunk.name, status: 'error', error: e.message });
          allOk = false;
        }
      }

      return Response.json({
        ok: allOk,
        project_ref: SUPABASE_PROJECT_REF,
        project_name: 'Xtreme OS',
        chunks_total: MIGRATION_CHUNKS.length,
        chunks_applied: results.filter(r => r.status === 'applied').length,
        chunks_already_exists: results.filter(r => r.status === 'already_exists').length,
        chunks_failed: results.filter(r => r.status === 'failed' || r.status === 'error').length,
        results,
      });
    }

    // ── VERIFY: Check that key tables and functions exist ──
    if (action === 'verify') {
      const verifySql = `SELECT
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='systems') as systems_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='control_leases') as control_leases_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='jobs') as jobs_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='evidence_receipts') as evidence_receipts_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='validation_runs') as validation_runs_table,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema='public' AND routine_name='acquire_control_lease') as acquire_lease_fn,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema='public' AND routine_name='queue_send') as queue_send_fn,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='organizations') as orgs_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='organization_members') as org_members_table;`;

      const res = await fetch(`${supabaseApiBase}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: verifySql }),
      });

      const data = await res.json();
      return Response.json({
        ok: res.ok,
        project_ref: SUPABASE_PROJECT_REF,
        verification: data,
      });
    }

    // ── SEED: Insert default organization and bootstrap system ──
    if (action === 'seed') {
      const seedSql = `INSERT INTO public.organizations (org_id, name, slug, status)
VALUES ('xtreme-team', 'XTREME Team', 'xtreme-team', 'active')
ON CONFLICT (org_id) DO NOTHING;

INSERT INTO public.systems (system_id, organization_id, name, system_type, current_mode, lifecycle, active)
VALUES ('epoxyquotenearme', 'xtreme-team', 'Epoxy Quote Near Me', 'website', 'bootstrap', 'bootstrap', true)
ON CONFLICT (system_id) DO NOTHING;

INSERT INTO public.systems (system_id, organization_id, name, system_type, current_mode, lifecycle, active)
VALUES ('thextremeteam-console', 'xtreme-team', 'XTREME Team Console', 'control_plane', 'bootstrap', 'bootstrap', true)
ON CONFLICT (system_id) DO NOTHING;

SELECT 'seeded' as status;`;

      const res = await fetch(`${supabaseApiBase}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: seedSql }),
      });

      const data = await res.json();
      return Response.json({
        ok: res.ok,
        project_ref: SUPABASE_PROJECT_REF,
        seed_result: data,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}