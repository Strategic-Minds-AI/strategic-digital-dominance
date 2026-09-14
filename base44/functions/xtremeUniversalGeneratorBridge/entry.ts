import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import {
  XTREME_SOURCE_MANIFEST_VERSION,
  XTREME_UNIVERSAL_GENERATOR,
  XTREME_DIGITAL_DOMINANCE,
  XTREME_SYNC_OWNERSHIP,
  VERIFIED_100_CONTRACT,
} from '../../shared/xtremeUniversalGeneratorSources.ts';

// XTREME UNIVERSAL GENERATOR BRIDGE
// Safe bidirectional bridge between Base44 and canonical Xtreme OS Supabase.
// IMPORTANT: This is NOT last-write-wins sync.
// Source ownership is explicit and execution defaults to SHADOW / READ-ONLY.
// Execute mode backfills Base44's richer benchmark constitution into Supabase
// before allowing Supabase runtime fields to flow back into Base44.

const SUPABASE_PROJECT_REF = XTREME_UNIVERSAL_GENERATOR.canonical_supabase_project;
const ORG_ID = 'xtreme-team';

const sqlText = (value: unknown) => {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
};
const sqlBool = (value: unknown) => value ? 'true' : 'false';
const sqlNum = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : String(fallback);
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'shadow_sync';
    const systemId = body.system_id || 'epoxyquotenearme';
    const execute = body.mode === 'execute';
    const svc = base44.asServiceRole;

    const { accessToken: supabaseToken } = await svc.connectors.getConnection('supabase');
    if (!supabaseToken) return Response.json({ error: 'Supabase connector is not connected' }, { status: 500 });
    const supabaseApiBase = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`;

    const execSql = async (sql: string) => {
      const res = await fetch(`${supabaseApiBase}/database/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${supabaseToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Supabase SQL error: ${JSON.stringify(data).slice(0, 600)}`);
      return Array.isArray(data) ? data : (data.rows || [data]);
    };

    const getBase44System = async (id: string) => {
      const rows = await svc.entities.FleetSystem.filter({ system_id: id }, '-created_date', 1);
      return rows[0] || null;
    };

    const getBase44State = async (id: string) => {
      const [system, benchmarks, results, gaps, repairs, regression] = await Promise.all([
        getBase44System(id),
        svc.entities.BenchmarkDefinition.filter({ system_id: id, enabled: true }, 'benchmark_id', 500),
        svc.entities.BenchmarkResult.filter({ system_id: id }, '-created_date', 500),
        svc.entities.OptimizationGap.filter({ system_id: id }, '-created_date', 500),
        svc.entities.RepairJob.filter({ system_id: id }, '-created_date', 500),
        svc.entities.RegressionTest.filter({ system_id: id }, '-created_date', 500).catch(() => []),
      ]);
      return { system, benchmarks, results, gaps, repairs, regression };
    };

    const getSupabaseState = async (id: string) => {
      const systems = await execSql(`SELECT system_id,name,current_mode,global_score,total_benchmarks,passing_benchmarks,failing_benchmarks,unknown_benchmarks,p0_count,p1_count,source_parity,deployment_parity,updated_at FROM public.systems WHERE system_id=${sqlText(id)} LIMIT 1;`);
      const counts = await execSql(`SELECT
        (SELECT COUNT(*) FROM public.benchmarks WHERE system_id=${sqlText(id)} AND enabled=true) AS benchmark_count,
        (SELECT COUNT(*) FROM public.benchmark_results WHERE system_id=${sqlText(id)}) AS result_count,
        (SELECT COUNT(*) FROM public.optimization_gaps WHERE system_id=${sqlText(id)}) AS gap_count,
        (SELECT COUNT(*) FROM public.repairs WHERE system_id=${sqlText(id)}) AS repair_count,
        (SELECT COUNT(*) FROM public.regression_tests WHERE system_id=${sqlText(id)}) AS regression_count;`);
      return { system: systems[0] || null, counts: counts[0] || {} };
    };

    const driveStatus = async () => {
      const { accessToken: driveToken } = await svc.connectors.getConnection('googledrive');
      const allSources = [
        ...XTREME_UNIVERSAL_GENERATOR.documents,
        ...XTREME_DIGITAL_DOMINANCE.sources,
      ];
      const files: any[] = [];
      for (const f of allSources) {
        const r = await fetch(`https://www.googleapis.com/drive/v3/files/${f.drive_id}?fields=id,name,mimeType,modifiedTime,md5Checksum,size`, {
          headers: { Authorization: `Bearer ${driveToken}` },
        });
        if (r.ok) {
          const meta = await r.json();
          files.push({ key: f.key, expected_title: f.title, ...meta, verified: true });
        } else {
          files.push({ key: f.key, expected_title: f.title, drive_id: f.drive_id, verified: false, http_status: r.status });
        }
      }
      return files;
    };

    if (action === 'status' || action === 'shadow_sync') {
      const [base44State, supabaseState, sources] = await Promise.all([
        getBase44State(systemId),
        getSupabaseState(systemId),
        driveStatus(),
      ]);
      const baseCount = base44State.benchmarks.length;
      const supaCount = Number(supabaseState.counts?.benchmark_count || 0);
      const constitutionConverged = baseCount > 0 && supaCount >= baseCount;
      const sourceFilesVerified = sources.filter((s: any) => s.verified).length;

      return Response.json({
        ok: true,
        mode: 'shadow',
        action,
        source_manifest_version: XTREME_SOURCE_MANIFEST_VERSION,
        system_id: systemId,
        ownership: XTREME_SYNC_OWNERSHIP,
        verified_100_contract: VERIFIED_100_CONTRACT,
        base44: {
          system: base44State.system,
          benchmark_definitions: baseCount,
          benchmark_results: base44State.results.length,
          gaps: base44State.gaps.length,
          repairs: base44State.repairs.length,
          regression_tests: base44State.regression.length,
        },
        supabase: supabaseState,
        drift: {
          benchmark_definition_delta: baseCount - supaCount,
          constitution_converged: constitutionConverged,
          pull_from_supabase_allowed: constitutionConverged,
          false_green_risk: !constitutionConverged && Number(supabaseState.system?.global_score || 0) === 100,
        },
        source_documents: {
          expected: sources.length,
          verified: sourceFilesVerified,
          missing_or_unverified: sources.filter((s: any) => !s.verified),
          files: sources,
        },
        next_safe_action: constitutionConverged
          ? 'Run execute sync, then recompute from full constitution.'
          : 'Backfill Base44 benchmark constitution to Supabase before accepting any Supabase score.',
      });
    }

    if (action === 'push_constitution_to_supabase') {
      if (!execute) {
        const state = await getBase44State(systemId);
        const supa = await getSupabaseState(systemId);
        return Response.json({
          ok: true,
          mode: 'dry_run',
          system_id: systemId,
          would_upsert_benchmarks: state.benchmarks.length,
          would_sync_score_from_base44: !!state.system,
          current_supabase_benchmarks: Number(supa.counts?.benchmark_count || 0),
          execute_hint: 'Reinvoke with {action:"push_constitution_to_supabase", mode:"execute"}.',
        });
      }

      const state = await getBase44State(systemId);
      if (!state.system) return Response.json({ error: `Base44 FleetSystem ${systemId} not found` }, { status: 404 });
      if (state.benchmarks.length === 0) return Response.json({ error: 'Refusing to sync zero-definition constitution' }, { status: 409 });

      let created = 0;
      let updated = 0;
      for (const b of state.benchmarks) {
        const existing = await execSql(`SELECT id FROM public.benchmarks WHERE system_id=${sqlText(systemId)} AND benchmark_id=${sqlText(b.benchmark_id)} LIMIT 1;`);
        const fields = `organization_id=${sqlText(ORG_ID)}, benchmark_pack_id=${sqlText(b.benchmark_pack_id)}, validator_id=${sqlText(b.validator_id)}, category=${sqlText(b.category)}, name=${sqlText(b.name)}, description=${sqlText(b.description)}, target=${sqlText(b.target)}, measurement=${sqlText(b.measurement)}, comparator=${sqlText(b.comparator)}, severity=${sqlText(b.severity)}, mandatory=${sqlBool(b.mandatory !== false)}, environment=${sqlText(b.environment || 'production')}, data_source=${sqlText(b.data_source)}, validator=${sqlText(b.validator)}, evidence_required=${sqlBool(b.evidence_required !== false)}, freshness_requirement=${sqlText(b.freshness_requirement)}, auto_repair_allowed=${sqlBool(b.auto_repair_allowed !== false)}, benchmark_version=${sqlText(b.benchmark_version || '1.0')}, standard_source=${sqlText(b.standard_source)}, enabled=${sqlBool(b.enabled !== false)}, updated_at=NOW()`;
        if (existing.length > 0) {
          await execSql(`UPDATE public.benchmarks SET ${fields} WHERE id=${sqlText(existing[0].id)};`);
          updated++;
        } else {
          await execSql(`INSERT INTO public.benchmarks (benchmark_id,system_id,organization_id,benchmark_pack_id,validator_id,category,name,description,target,measurement,comparator,severity,mandatory,environment,data_source,validator,evidence_required,freshness_requirement,auto_repair_allowed,benchmark_version,standard_source,enabled,created_at,updated_at) VALUES (${sqlText(b.benchmark_id)},${sqlText(systemId)},${sqlText(ORG_ID)},${sqlText(b.benchmark_pack_id)},${sqlText(b.validator_id)},${sqlText(b.category)},${sqlText(b.name)},${sqlText(b.description)},${sqlText(b.target)},${sqlText(b.measurement)},${sqlText(b.comparator)},${sqlText(b.severity)},${sqlBool(b.mandatory !== false)},${sqlText(b.environment || 'production')},${sqlText(b.data_source)},${sqlText(b.validator)},${sqlBool(b.evidence_required !== false)},${sqlText(b.freshness_requirement)},${sqlBool(b.auto_repair_allowed !== false)},${sqlText(b.benchmark_version || '1.0')},${sqlText(b.standard_source)},${sqlBool(b.enabled !== false)},NOW(),NOW());`);
          created++;
        }
      }

      // During convergence Base44 owns the richer constitution and score.
      // Sync its current rollup into canonical Supabase so the old 1/1 false-green cannot survive.
      await execSql(`UPDATE public.systems SET
        name=${sqlText(state.system.name)},
        current_mode=${sqlText(state.system.current_mode || 'completion_sprint')},
        global_score=${sqlNum(state.system.global_score)},
        distance_to_100=${sqlNum(state.system.distance_to_100,100)},
        p0_count=${sqlNum(state.system.p0_count)},
        p1_count=${sqlNum(state.system.p1_count)},
        total_benchmarks=${sqlNum(state.system.total_benchmarks,state.benchmarks.length)},
        passing_benchmarks=${sqlNum(state.system.passing_benchmarks)},
        failing_benchmarks=${sqlNum(state.system.failing_benchmarks)},
        unknown_benchmarks=${sqlNum(state.system.unknown_benchmarks)},
        source_parity=${sqlText(state.system.source_parity || 'unknown')},
        deployment_parity=${sqlText(state.system.deployment_parity || 'unknown')},
        updated_at=NOW()
        WHERE system_id=${sqlText(systemId)};`);

      const after = await getSupabaseState(systemId);
      return Response.json({
        ok: true,
        mode: 'execute',
        system_id: systemId,
        benchmarks_created: created,
        benchmarks_updated: updated,
        base44_definition_count: state.benchmarks.length,
        supabase_definition_count: Number(after.counts?.benchmark_count || 0),
        constitution_converged: Number(after.counts?.benchmark_count || 0) >= state.benchmarks.length,
        canonical_score_after_sync: after.system?.global_score,
        note: 'No benchmark result was fabricated. Score copied from Base44 only as convergence baseline; future canonical score must be evidence-derived in Supabase.',
      });
    }

    if (action === 'pull_runtime_to_base44') {
      const b44 = await getBase44State(systemId);
      const supa = await getSupabaseState(systemId);
      const baseCount = b44.benchmarks.length;
      const supaCount = Number(supa.counts?.benchmark_count || 0);
      if (supaCount < baseCount || baseCount === 0) {
        return Response.json({
          ok: false,
          blocked: true,
          reason: 'CANONICAL_CONSTITUTION_NOT_CONVERGED',
          base44_benchmarks: baseCount,
          supabase_benchmarks: supaCount,
          message: 'Refusing to let a smaller Supabase constitution overwrite Base44 runtime state.',
        }, { status: 409 });
      }
      if (!execute) return Response.json({ ok: true, mode: 'dry_run', would_pull: supa.system, constitution_converged: true });
      if (!b44.system || !supa.system) return Response.json({ error: 'Missing system in one side of bridge' }, { status: 404 });

      await svc.entities.FleetSystem.update(b44.system.id, {
        current_mode: supa.system.current_mode,
        global_score: Number(supa.system.global_score || 0),
        distance_to_100: 100 - Number(supa.system.global_score || 0),
        total_benchmarks: Number(supa.system.total_benchmarks || 0),
        passing_benchmarks: Number(supa.system.passing_benchmarks || 0),
        failing_benchmarks: Number(supa.system.failing_benchmarks || 0),
        unknown_benchmarks: Number(supa.system.unknown_benchmarks || 0),
        p0_count: Number(supa.system.p0_count || 0),
        p1_count: Number(supa.system.p1_count || 0),
        source_parity: supa.system.source_parity || 'unknown',
        deployment_parity: supa.system.deployment_parity || 'unknown',
      });

      return Response.json({ ok: true, mode: 'execute', system_id: systemId, pulled_runtime_fields: true });
    }

    return Response.json({ error: `Unknown action ${action}` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
