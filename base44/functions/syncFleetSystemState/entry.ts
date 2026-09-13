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
        // ── Read all ENABLED benchmark DEFINITIONS for this system ──
        // The denominator is COUNT(enabled BenchmarkDefinition), NOT COUNT(BenchmarkResult).
        const definitions = await svc.entities.BenchmarkDefinition.filter({ system_id: system.system_id, enabled: true }, '-created_date', 500);
        const total = definitions.length; // ← correct denominator

        // ── Read latest BenchmarkResults for this system ──
        const allResults = await svc.entities.BenchmarkResult.filter({ system_id: system.system_id }, '-created_date', 500);

        // Deduplicate: keep only the latest result per benchmark_id
        const latestByBenchmark: Record<string, any> = {};
        for (const r of allResults) {
          if (!latestByBenchmark[r.benchmark_id] || new Date(r.created_date) > new Date(latestByBenchmark[r.benchmark_id].created_date)) {
            latestByBenchmark[r.benchmark_id] = r;
          }
        }

        // ── For every BenchmarkDefinition, find latest valid result; if none → UNKNOWN ──
        let passing = 0;
        let failing = 0;
        let unknown = 0;
        let stale = 0;
        let p0Count = 0;
        let p1Count = 0;

        // Track parity-relevant results for deterministic rollup
        const sourceParityResults: any[] = [];
        const deployParityResults: any[] = [];

        for (const def of definitions) {
         const result = latestByBenchmark[def.benchmark_id];
         const status = result ? result.status : 'unknown';

         if (!result) {
           // Definition exists but no current usable result → UNKNOWN
           unknown++;
           if (def.severity === 'P0') p0Count++; // Mandatory UNKNOWN prevents VERIFIED_100
         } else if (result.status === 'pass') {
           passing++;
         } else if (result.status === 'fail') {
           failing++;
           if (def.severity === 'P0') p0Count++;
           if (def.severity === 'P1') p1Count++;
         } else if (result.status === 'stale') {
           stale++;
         } else {
           unknown++;
         }

         // Collect parity-relevant results by CATEGORY (not prefix matching)
         // source_parity category: repository identity, accessibility, SHA validation
         if (def.category === 'source_parity') {
           sourceParityResults.push({ benchmark_id: def.benchmark_id, status, mandatory: def.mandatory });
         }
         // deployment category: deployment identity, production SHA, release SHA
         if (def.category === 'deployment') {
           deployParityResults.push({ benchmark_id: def.benchmark_id, status, mandatory: def.mandatory });
         }
        }

        const globalScore = total > 0 ? Math.round((passing / total) * 100) : 0;
        const distanceTo100 = 100 - globalScore;

        // ── DETERMINISTIC PARITY ROLLUP ──
        // SOURCE PARITY: depends on repository identity, accessibility, expected SHA, source SHA, validated SHA
        // DEPLOYMENT PARITY: depends on deployment identity, production SHA, validated release SHA
        // Rules:
        //   - If any mandatory component FAILS → aggregate FAIL
        //   - If none fail but one required component is UNKNOWN → aggregate UNKNOWN
        //   - Only all required PASS → aggregate PASS

        const rollupParity = (parityResults: any[]): string => {
          if (parityResults.length === 0) return 'unknown';
          const mandatoryResults = parityResults.filter((r: any) => r.mandatory !== false);
          const hasFail = mandatoryResults.some((r: any) => r.status === 'fail');
          const hasUnknown = mandatoryResults.some((r: any) => r.status === 'unknown' || r.status === 'stale' || !r.status);
          const allPass = mandatoryResults.every((r: any) => r.status === 'pass');
          if (hasFail) return 'fail';
          if (hasUnknown || !allPass) return 'unknown';
          return 'pass';
        };

        const sourceParity = rollupParity(sourceParityResults);
        const deploymentParity = rollupParity(deployParityResults);

        // ── Active repair jobs (count UNIQUE legitimate active repairs) ──
        const activeRepairs = await svc.entities.RepairJob.filter({ system_id: system.system_id, status: ['queued', 'claimed', 'in_progress', 'blocked'] }, '-created_date', 500);
        // Filter out orphaned in_progress (no claimed_by or expired lease)
        const legitimateActive = activeRepairs.filter((j: any) => {
          if (j.status === 'in_progress' || j.status === 'claimed') {
            return j.claimed_by && j.lease_expires_at && new Date(j.lease_expires_at) > new Date(now);
          }
          return true;
        });
        const pendingApprovals = legitimateActive.filter((j: any) => j.approval_required).length;

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
          active_repair_jobs: legitimateActive.length,
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
          active_repairs: legitimateActive.length,
          pending_approvals: pendingApprovals,
          open_gaps: openGaps.length,
          source_parity: sourceParity,
          deployment_parity: deploymentParity,
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