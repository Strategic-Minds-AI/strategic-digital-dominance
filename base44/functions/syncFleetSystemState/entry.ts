import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// syncFleetSystemState
// After every Local Alpha Prime cycle, calculates verified rollup
// from current evidence and updates the FleetSystem record.
//
// Accepts: { system_id }
// Calculates from BenchmarkResult, OptimizationGap, RepairJob:
//   total_benchmarks, passing, failing, unknown, stale
//   global_score, distance_to_100, p0_count, p1_count
//   active_repair_jobs, pending_approvals
//   last_full_cycle, next_full_cycle
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { system_id } = body;

    const svc = base44.asServiceRole;
    const now = new Date().toISOString();

    // ── Determine target system(s) ──
    let systems: any[] = [];
    if (system_id) {
      systems = await svc.entities.FleetSystem.filter({ system_id, active: true }, '-created_date', 1);
    } else {
      systems = await svc.entities.FleetSystem.filter({ active: true }, '-created_date', 50);
    }

    const results: any[] = [];

    for (const system of systems) {
      try {
        // ── Read all benchmark definitions for this system ──
        const benchmarks = await svc.entities.BenchmarkDefinition.filter({ system_id: system.system_id, enabled: true }, '-created_date', 500);
        const benchmarkIds = new Set(benchmarks.map((b: any) => b.benchmark_id));

        // ── Read latest BenchmarkResults for this system ──
        const allResults = await svc.entities.BenchmarkResult.filter({ system_id: system.system_id }, '-created_date', 500);

        // Deduplicate: keep only the latest result per benchmark_id
        const latestByBenchmark: Record<string, any> = {};
        for (const r of allResults) {
          if (!latestByBenchmark[r.benchmark_id] || new Date(r.created_date) > new Date(latestByBenchmark[r.benchmark_id].created_date)) {
            latestByBenchmark[r.benchmark_id] = r;
          }
        }
        const latestResults = Object.values(latestByBenchmark);

        const passing = latestResults.filter((r: any) => r.status === 'pass').length;
        const failing = latestResults.filter((r: any) => r.status === 'fail').length;
        const unknown = latestResults.filter((r: any) => r.status === 'unknown').length;
        const stale = latestResults.filter((r: any) => r.status === 'stale').length;
        const total = latestResults.length;

        const globalScore = total > 0 ? Math.round((passing / total) * 100) : 0;
        const distanceTo100 = 100 - globalScore;

        // P0/P1 from failing results
        const p0Count = latestResults.filter((r: any) => r.status === 'fail' && r.severity === 'P0').length;
        const p1Count = latestResults.filter((r: any) => r.status === 'fail' && r.severity === 'P1').length;

        // Active repair jobs
        const activeRepairs = await svc.entities.RepairJob.filter({ system_id: system.system_id, status: ['queued', 'claimed', 'in_progress', 'blocked'] }, '-created_date', 100);
        const pendingApprovals = activeRepairs.filter((j: any) => j.approval_required).length;

        // Open gaps
        const openGaps = await svc.entities.OptimizationGap.filter({ system_id: system.system_id, status: 'open' }, '-created_date', 100);

        // Determine mode
        let newMode = system.current_mode || 'bootstrap';
        if (p0Count > 0 || failing > 0) {
          newMode = 'completion_sprint';
        } else if (unknown > 0) {
          newMode = 'bootstrap';
        } else if (failing === 0 && unknown === 0 && p0Count === 0 && p1Count === 0) {
          const newConsecutive = (system.consecutive_pass_cycles || 0) + 1;
          newMode = newConsecutive >= (system.required_consecutive_passes || 3) ? 'preservation' : 'completion_sprint';
        }

        // Source/deployment parity
        const sourceParityBench = latestResults.find((r: any) => r.benchmark_id && r.benchmark_id.startsWith('SRC-'));
        const deployParityBench = latestResults.find((r: any) => r.benchmark_id && r.benchmark_id.startsWith('DEPLOY-'));
        const sourceParity = sourceParityBench ? (sourceParityBench.status === 'pass' ? 'pass' : 'fail') : 'unknown';
        const deploymentParity = deployParityBench ? (deployParityBench.status === 'pass' ? 'pass' : 'fail') : 'unknown';

        // ── Update FleetSystem ──
        await svc.entities.FleetSystem.update(system.id, {
          total_benchmarks: total,
          passing_benchmarks: passing,
          failing_benchmarks: failing,
          unknown_benchmarks: unknown,
          stale_benchmarks: stale,
          global_score: globalScore,
          distance_to_100: distanceTo100,
          p0_count: p0Count,
          p1_count: p1Count,
          current_mode: newMode,
          last_full_cycle: now,
          next_full_cycle: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          active_repair_jobs: activeRepairs.length,
          pending_approvals: pendingApprovals,
          source_parity: sourceParity as any,
          deployment_parity: deploymentParity as any,
        });

        results.push({
          system_id: system.system_id,
          total,
          passing,
          failing,
          unknown,
          stale,
          global_score: globalScore,
          distance_to_100: distanceTo100,
          p0: p0Count,
          p1: p1Count,
          mode: newMode,
          active_repairs: activeRepairs.length,
          pending_approvals: pendingApprovals,
          open_gaps: openGaps.length,
        });
      } catch (e: any) {
        results.push({ system_id: system.system_id, error: e.message });
      }
    }

    return Response.json({
      ok: true,
      systems_synced: results.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}