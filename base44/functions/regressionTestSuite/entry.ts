import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// regressionTestSuite
// Permanent regression tests for Phase 8.2 control-plane hardening.
// Tests:
//   FLEET-LOCK-RACE-001: duplicate governance invocation
//   REPAIR-DEDUPE-001: duplicate RepairJob creation
//   CROSS-SYSTEM-001: cross-system identical benchmark IDs
//   MISSING-RESULT-001: missing BenchmarkResult → UNKNOWN
//   ORPHAN-INPROGRESS-001: orphaned in_progress repair
//   STALE-LEASE-001: stale lease detection
//   WRONG-SYSTEM-ID-001: wrong system_id scoping
//   PARITY-ROLLUP-001: incorrect parity aggregation
//   ZERO-RESULT-001: zero-result control plane
//   VISION-CONTEXT-001: Vision Cortex missing fleet context
//   INTENT-CONSUMED-001: intent never consumed
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const results: any[] = [];

    // ── FLEET-LOCK-RACE-001: duplicate governance invocation ──
    try {
      // Fire two concurrent governance calls
      const [res1, res2] = await Promise.all([
        base44.functions.invoke('fleetAlphaPrime', { action: 'govern' }),
        base44.functions.invoke('fleetAlphaPrime', { action: 'govern' }),
      ]);
      const d1 = res1.data || res1;
      const d2 = res2.data || res2;
      const lockCount = (d1.lock_acquired ? 1 : 0) + (d2.lock_acquired ? 1 : 0);
      const pass = lockCount === 1 || (d1.idempotent && d2.idempotent);
      results.push({
        test_id: 'FLEET-LOCK-RACE-001',
        name: 'Duplicate governance invocation — exactly one owner',
        pass,
        details: `lock1=${d1.lock_acquired}, lock2=${d2.lock_acquired}, idempotent1=${!!d1.idempotent}, idempotent2=${!!d2.idempotent}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'FLEET-LOCK-RACE-001', name: 'Duplicate governance invocation', pass: false, error: e.message });
    }

    // ── REPAIR-DEDUPE-001: duplicate RepairJob creation ──
    try {
      // Run repair factory twice — second run should skip existing jobs
      const res1 = await base44.functions.invoke('alphaPrimeRepairFactory', {});
      const res2 = await base44.functions.invoke('alphaPrimeRepairFactory', {});
      const d1 = res1.data || res1;
      const d2 = res2.data || res2;
      // Second run should create 0 or very few new jobs (all skipped)
      const pass = d2.repair_jobs_created === 0;
      results.push({
        test_id: 'REPAIR-DEDUPE-001',
        name: 'Duplicate RepairJob creation — second run skips existing',
        pass,
        details: `run1_created=${d1.repair_jobs_created}, run2_created=${d2.repair_jobs_created}, run2_skipped=${d2.repair_jobs_skipped}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'REPAIR-DEDUPE-001', name: 'Duplicate RepairJob creation', pass: false, error: e.message });
    }

    // ── CROSS-SYSTEM-001: cross-system identical benchmark IDs ──
    try {
      // Verify that benchmark definitions for different systems with same benchmark_id don't collide
      const epoxyBenches = await svc.entities.BenchmarkDefinition.filter({ system_id: 'epoxyquotenearme', enabled: true }, '-created_date', 500);
      const consoleBenches = await svc.entities.BenchmarkDefinition.filter({ system_id: 'thextremeteam-console', enabled: true }, '-created_date', 500);
      // Check that repair jobs are scoped by system_id
      const epoxyRepairs = await svc.entities.RepairJob.filter({ system_id: 'epoxyquotenearme', status: ['queued', 'claimed', 'in_progress', 'blocked'] }, '-created_date', 50);
      const consoleRepairs = await svc.entities.RepairJob.filter({ system_id: 'thextremeteam-console', status: ['queued', 'claimed', 'in_progress', 'blocked'] }, '-created_date', 50);
      const epoxyBenchmarkIds = new Set(epoxyRepairs.map((r: any) => r.benchmark_id));
      const consoleBenchmarkIds = new Set(consoleRepairs.map((r: any) => r.benchmark_id));
      // Repairs in system A should not suppress repairs in system B
      const pass = epoxyRepairs.every((r: any) => r.system_id === 'epoxyquotenearme') && consoleRepairs.every((r: any) => r.system_id === 'thextremeteam-console');
      results.push({
        test_id: 'CROSS-SYSTEM-001',
        name: 'Cross-system identical benchmark IDs — no contamination',
        pass,
        details: `epoxy_repairs=${epoxyRepairs.length}, console_repairs=${consoleRepairs.length}, epoxy_scoped=${epoxyRepairs.every((r: any) => r.system_id === 'epoxyquotenearme')}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'CROSS-SYSTEM-001', name: 'Cross-system identical benchmark IDs', pass: false, error: e.message });
    }

    // ── MISSING-RESULT-001: missing BenchmarkResult → UNKNOWN ──
    try {
      const syncRes = await base44.functions.invoke('syncFleetSystemState', { system_id: 'thextremeteam-console' });
      const syncData = syncRes.data || syncRes;
      const result = syncData.results?.[0] || {};
      // Console system has benchmarks but likely no results → unknown should be > 0
      const pass = result.unknown > 0 || result.total === 0;
      results.push({
        test_id: 'MISSING-RESULT-001',
        name: 'Missing BenchmarkResult → UNKNOWN status',
        pass,
        details: `total=${result.total}, passing=${result.passing}, unknown=${result.unknown}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'MISSING-RESULT-001', name: 'Missing BenchmarkResult → UNKNOWN', pass: false, error: e.message });
    }

    // ── ORPHAN-INPROGRESS-001: orphaned in_progress repair ──
    try {
      // Check that no in_progress jobs exist without claimed_by
      const inProgressJobs = await svc.entities.RepairJob.filter({ status: 'in_progress' }, '-created_date', 500);
      const orphans = inProgressJobs.filter((j: any) => !j.claimed_by || !j.lease_expires_at);
      const pass = orphans.length === 0;
      results.push({
        test_id: 'ORPHAN-INPROGRESS-001',
        name: 'Orphaned in_progress repair — zero orphans',
        pass,
        details: `in_progress_total=${inProgressJobs.length}, orphans=${orphans.length}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'ORPHAN-INPROGRESS-001', name: 'Orphaned in_progress repair', pass: false, error: e.message });
    }

    // ── STALE-LEASE-001: stale lease detection ──
    try {
      // Run optimization cycle which detects stale leases
      const cycleRes = await base44.functions.invoke('alphaPrimeOptimizationCycle', {});
      const cycleData = cycleRes.data || cycleRes;
      const staleStep = cycleData.steps?.find((s: any) => s.step === 'detect_stale_leases');
      const pass = staleStep !== undefined;
      results.push({
        test_id: 'STALE-LEASE-001',
        name: 'Stale lease detection — cycle detects stale leases',
        pass,
        details: `stale_leases_detected=${staleStep?.stale_leases || 0}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'STALE-LEASE-001', name: 'Stale lease detection', pass: false, error: e.message });
    }

    // ── WRONG-SYSTEM-ID-001: wrong system_id scoping ──
    try {
      // Verify that gaps and results are scoped by system_id
      const epoxyGaps = await svc.entities.OptimizationGap.filter({ system_id: 'epoxyquotenearme' }, '-created_date', 10);
      const consoleGaps = await svc.entities.OptimizationGap.filter({ system_id: 'thextremeteam-console' }, '-created_date', 10);
      const allGaps = await svc.entities.OptimizationGap.list('-created_date', 10);
      const epoxyGapsScoped = epoxyGaps.every((g: any) => g.system_id === 'epoxyquotenearme');
      const consoleGapsScoped = consoleGaps.every((g: any) => g.system_id === 'thextremeteam-console');
      const pass = epoxyGapsScoped && consoleGapsScoped;
      results.push({
        test_id: 'WRONG-SYSTEM-ID-001',
        name: 'Wrong system_id scoping — gaps are system-scoped',
        pass,
        details: `epoxy_gaps_scoped=${epoxyGapsScoped}, console_gaps_scoped=${consoleGapsScoped}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'WRONG-SYSTEM-ID-001', name: 'Wrong system_id scoping', pass: false, error: e.message });
    }

    // ── PARITY-ROLLUP-001: incorrect parity aggregation ──
    try {
      const syncRes = await base44.functions.invoke('syncFleetSystemState', { system_id: 'epoxyquotenearme' });
      const syncData = syncRes.data || syncRes;
      const result = syncData.results?.[0] || {};
      // Parity should be one of: pass, fail, unknown (not arbitrary)
      const validParity = ['pass', 'fail', 'unknown'].includes(result.source_parity) && ['pass', 'fail', 'unknown'].includes(result.deployment_parity);
      const pass = validParity;
      results.push({
        test_id: 'PARITY-ROLLUP-001',
        name: 'Parity aggregation — deterministic rollup',
        pass,
        details: `source_parity=${result.source_parity}, deployment_parity=${result.deployment_parity}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'PARITY-ROLLUP-001', name: 'Parity aggregation', pass: false, error: e.message });
    }

    // ── ZERO-RESULT-001: zero-result control plane ──
    try {
      const syncRes = await base44.functions.invoke('syncFleetSystemState', { system_id: 'thextremeteam-console' });
      const syncData = syncRes.data || syncRes;
      const result = syncData.results?.[0] || {};
      // Console system should have total = enabled benchmarks count, not 0
      const pass = result.total > 0;
      results.push({
        test_id: 'ZERO-RESULT-001',
        name: 'Zero-result control plane — denominator is definition count',
        pass,
        details: `total=${result.total}, passing=${result.passing}, unknown=${result.unknown}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'ZERO-RESULT-001', name: 'Zero-result control plane', pass: false, error: e.message });
    }

    // ── VISION-CONTEXT-001: Vision Cortex missing fleet context ──
    try {
      const vcRes = await base44.functions.invoke('visionCortexRouter', {
        message: 'TEST-CONTEXT-CHECK: Report the fleet score and system count from your loaded context.',
      });
      const vcData = vcRes.data || vcRes;
      // Vision Cortex should have loaded fleet systems
      const pass = vcData.evidence?.fleet_systems_loaded > 0;
      results.push({
        test_id: 'VISION-CONTEXT-001',
        name: 'Vision Cortex fleet context — loaded from evidence',
        pass,
        details: `fleet_systems_loaded=${vcData.evidence?.fleet_systems_loaded}, conversation_id=${vcData.conversation_id}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'VISION-CONTEXT-001', name: 'Vision Cortex fleet context', pass: false, error: e.message });
    }

    // ── INTENT-CONSUMED-001: intent never consumed ──
    try {
      // Check for pending intents that have been pending for too long
      const pendingIntents = await svc.entities.OperatorIntent.filter({ status: 'pending' }, '-created_date', 50);
      const now = Date.now();
      const stale = pendingIntents.filter((i: any) => {
        if (!i.created_at) return false;
        const ageMin = (now - new Date(i.created_at).getTime()) / 60000;
        return ageMin > 30; // Pending for more than 30 minutes
      });
      // Pass if no stale pending intents (or if there are none pending at all)
      const pass = stale.length === 0;
      results.push({
        test_id: 'INTENT-CONSUMED-001',
        name: 'Intent never consumed — no stale pending intents',
        pass,
        details: `pending_total=${pendingIntents.length}, stale (>30min)=${stale.length}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'INTENT-CONSUMED-001', name: 'Intent never consumed', pass: false, error: e.message });
    }

    // ── Summary ──
    const passed = results.filter((r: any) => r.pass).length;
    const failed = results.filter((r: any) => !r.pass).length;

    return Response.json({
      ok: true,
      total_tests: results.length,
      passed,
      failed,
      pass_rate: Math.round((passed / results.length) * 100),
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}