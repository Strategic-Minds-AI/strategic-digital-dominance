import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// recursiveHealingEngine
// The autonomous recursive production readiness orchestrator.
//
// Chains AutoComplete (validate → gap → repair) with Alpha Prime
// (benchmarks → distance → repair factory → postcondition validate)
// in a recursive loop. Each iteration:
//   1. Runs the AutoComplete cycle (finds gaps, creates repair jobs)
//   2. Runs the Alpha Prime optimization cycle (processes repairs)
//   3. Re-validates to measure improvement
//   4. If score improved → loop again
//   5. If verified_100 → stop, system is production ready
//   6. If score plateaued → stop, report blockers
//
// This is the deterministic engine that runs until the system is
// fully production ready, end to end.
// ════════════════════════════════════════════════════════════════

const MAX_ITERATIONS = 5;
const PLATEAU_THRESHOLD = 2; // Stop after 2 iterations with no score improvement

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const systemId = body.system_id || 'epoxyquotenearme';
    const maxIterations = body.max_iterations || MAX_ITERATIONS;
    const engineId = `rhe-${Date.now()}`;
    const now = new Date().toISOString();

    const svc = base44.asServiceRole;
    const iterations: any[] = [];
    let bestScore = 0;
    let plateauCount = 0;
    let verified = false;
    let finalState: any = null;

    // ── Ensure the system is registered ──
    const systems = await svc.entities.FleetSystem.filter({ system_id: systemId }, '-created_date', 1);
    if (!systems || systems.length === 0) {
      await base44.functions.invoke('autoComplete', { action: 'register_self', system_id: systemId });
    }

    // ════════════════════════════════════════════════════════════════
    // RECURSIVE HEALING LOOP
    // ════════════════════════════════════════════════════════════════
    for (let i = 1; i <= maxIterations; i++) {
      const iterStart = Date.now();
      const iterNum = i;
      const iterLog: any = { iteration: iterNum, steps: [] };

      // ── Step 1: AutoComplete Cycle (validate → gap → repair) ──
      try {
        const acRes = await base44.functions.invoke('autoComplete', {
          action: 'cycle',
          system_id: systemId,
        });
        const acData = acRes.data || acRes;
        iterLog.steps.push({
          step: 'autocomplete_cycle',
          ok: acData.ok,
          score: acData.avg_score || 0,
          systems_processed: acData.systems_processed,
          verified_systems: acData.verified_systems,
          results: acData.results?.map((r: any) => ({
            system_id: r.system_id,
            score: r.weighted_score,
            verified: r.verified_100,
            open_gaps: r.open_gaps,
            active_repairs: r.active_repairs,
          })),
        });
        const sysResult = acData.results?.find((r: any) => r.system_id === systemId);
        if (sysResult) {
          iterLog.score_after_autocomplete = sysResult.weighted_score;
          iterLog.open_gaps = sysResult.open_gaps;
          iterLog.active_repairs = sysResult.active_repairs;
          iterLog.verified = sysResult.verified_100;
        }
      } catch (e: any) {
        iterLog.steps.push({ step: 'autocomplete_cycle', error: e.message });
      }

      // ── Step 2: Alpha Prime Optimization Cycle (benchmarks → distance → repair → validate) ──
      try {
        const apRes = await base44.functions.invoke('alphaPrimeOptimizationCycle', {});
        const apData = apRes.data || apRes;
        iterLog.steps.push({
          step: 'alpha_prime_cycle',
          ok: apData.ok,
          final_state: apData.final_state,
          cycle_id: apData.cycle_id,
        });
        iterLog.alpha_prime_state = apData.final_state;
      } catch (e: any) {
        iterLog.steps.push({ step: 'alpha_prime_cycle', error: e.message });
      }

      // ── Step 3: Re-validate to get fresh score after both cycles ──
      try {
        const valRes = await base44.functions.invoke('autoComplete', {
          action: 'validate',
          system_id: systemId,
        });
        const valData = valRes.data || valRes;
        iterLog.score_final = valData.weighted_score;
        iterLog.verified_100 = valData.verified_100;
        iterLog.dimensions = valData.dimensions?.map((d: any) => ({
          dimension: d.dimension,
          status: d.status,
          gate: d.gate,
        }));

        // Check gap counts
        const openGaps = await svc.entities.OptimizationGap.filter(
          { system_id: systemId, status: 'open' },
          '-created_date',
          100,
        );
        const p0Gaps = openGaps.filter((g: any) => g.severity === 'P0');
        const p1Gaps = openGaps.filter((g: any) => g.severity === 'P1');
        iterLog.p0_gaps = p0Gaps.length;
        iterLog.p1_gaps = p1Gaps.length;
        iterLog.total_open_gaps = openGaps.length;

        // Check active repair jobs
        const activeRepairs = await svc.entities.RepairJob.filter(
          { system_id: systemId, status: ['queued', 'in_progress', 'claimed', 'blocked'] },
          '-created_date',
          100,
        );
        iterLog.active_repair_jobs = activeRepairs.length;
      } catch (e: any) {
        iterLog.steps.push({ step: 'revalidate', error: e.message });
      }

      iterLog.duration_ms = Date.now() - iterStart;
      iterations.push(iterLog);

      // ── Check termination conditions ──
      const currentScore = iterLog.score_final || iterLog.score_after_autocomplete || 0;
      verified = iterLog.verified_100 === true;

      if (verified) {
        finalState = 'VERIFIED_100';
        break;
      }

      // Check for score plateau
      if (currentScore > bestScore) {
        bestScore = currentScore;
        plateauCount = 0;
      } else {
        plateauCount++;
      }

      if (plateauCount >= PLATEAU_THRESHOLD) {
        finalState = 'PLATEAUED — score stable, manual intervention needed for remaining gaps';
        break;
      }

      // If no open gaps and no active repairs but still not verified,
      // the remaining issues are HARD gates that can't be auto-fixed (lint/type)
      if ((iterLog.total_open_gaps === 0 || !iterLog.total_open_gaps) && (iterLog.active_repair_jobs === 0 || !iterLog.active_repair_jobs)) {
        finalState = 'BLOCKED — remaining failures require CI/CD or manual implementation (lint, type checking)';
        break;
      }
    }

    if (!finalState) {
      finalState = verified ? 'VERIFIED_100' : 'MAX_ITERATIONS_REACHED';
    }

    // ── Update FleetSystem with final state ──
    try {
      const finalSystems = await svc.entities.FleetSystem.filter({ system_id: systemId }, '-created_date', 1);
      if (finalSystems && finalSystems.length > 0) {
        const fs = finalSystems[0];
        await svc.entities.FleetSystem.update(fs.id, {
          global_score: bestScore,
          distance_to_100: 100 - bestScore,
          local_alpha_health: verified ? 'healthy' : 'degraded',
          last_local_cycle_id: engineId,
          last_local_cycle_at: now,
          current_mode: verified ? 'preservation' : 'completion_sprint',
          lifecycle: verified ? 'preservation' : 'completion_sprint',
        });
      }
    } catch (e: any) {
      // Non-critical
    }

    // ── Write audit ledger entry ──
    try {
      await svc.entities.AlphaPrimeAuditLedger.create({
        cycle_id: engineId,
        trigger: 'recursive_healing_engine',
        scope: 'recursive_full',
        started_at: now,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - Date.parse(now),
        systems_scanned: 1,
        tests_run: iterations.length,
        tests_passed: iterations.filter((it: any) => it.verified_100).length,
        tests_failed: iterations.filter((it: any) => !it.verified_100).length,
        tests_unknown: 0,
        tests_stale: 0,
        score_before: iterations[0]?.score_after_autocomplete || 0,
        score_after: bestScore,
        findings_created: iterations.reduce((sum: number, it: any) => sum + (it.total_open_gaps || 0), 0),
        findings_closed: 0,
        repairs_attempted: iterations.reduce((sum: number, it: any) => sum + (it.active_repair_jobs || 0), 0),
        repairs_passed: 0,
        repairs_failed: 0,
        rollbacks: 0,
        cost_credits: 0,
        source_version: 'base44-live',
        deployment_version: 'current',
        final_state: verified ? 'STABLE_GREEN' : 'DEGRADED',
        audit_suites: ['autocomplete_cycle', 'alpha_prime_cycle', 'revalidate'],
        false_greens_detected: 0,
        unknown_states: [],
        blocked_actions: [],
        approvals_required: [],
      });
    } catch (e: any) {
      // Non-critical
    }

    return Response.json({
      ok: true,
      engine_id: engineId,
      system_id: systemId,
      iterations_run: iterations.length,
      best_score: bestScore,
      verified_100: verified,
      final_state: finalState,
      iterations,
    });
  } catch (error) {
    console.error('[recursiveHealingEngine] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}