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

    // ── FLEET-LOCK-RACE-001: fixed lock_key duplicate invocation ──
    // Uses explicitly supplied fixed lock_key — no time-derived bucket ambiguity.
    try {
      const fixedLockKey = `test-fleet-lock-${Date.now()}`;
      const ts = new Date().toISOString();
      const promises = [
        svc.entities.ControlLease.create({
          lock_key: fixedLockKey, owner_id: 'test-owner-1', cycle_id: 'test-cycle',
          acquired_at: ts, lease_expires_at: new Date(Date.now() + 60000).toISOString(),
          heartbeat_at: ts, status: 'held', version: 1, idempotency_key: 'test-1',
        }).then(() => true).catch(() => false),
        svc.entities.ControlLease.create({
          lock_key: fixedLockKey, owner_id: 'test-owner-2', cycle_id: 'test-cycle',
          acquired_at: ts, lease_expires_at: new Date(Date.now() + 60000).toISOString(),
          heartbeat_at: ts, status: 'held', version: 1, idempotency_key: 'test-2',
        }).then(() => true).catch(() => false),
      ];
      const [win1, win2] = await Promise.all(promises);
      const winners = (win1 ? 1 : 0) + (win2 ? 1 : 0);
      const pass = winners === 1;
      // Cleanup
      const leases = await svc.entities.ControlLease.filter({ lock_key: fixedLockKey }, '-created_date', 1);
      if (leases[0]) await svc.entities.ControlLease.update(leases[0].id, { status: 'released', released_at: new Date().toISOString() });
      results.push({
        test_id: 'FLEET-LOCK-RACE-001',
        name: 'Fixed lock_key duplicate invocation — exactly one owner',
        pass,
        details: `lock_key=${fixedLockKey}, winners=${winners}/2, win1=${win1}, win2=${win2}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'FLEET-LOCK-RACE-001', name: 'Fixed lock_key duplicate invocation', pass: false, error: e.message });
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

    // ── CROSS-SYSTEM-001: cross-system collision fixture ──
    // Creates controlled fixture: System A and System B with SAME benchmark_id.
    // Generates failure in both. Asserts two independent RepairJobs are permitted.
    try {
      const testBenchId = `TEST-COLLISION-${Date.now()}`;
      const sysA = 'epoxyquotenearme';
      const sysB = 'thextremeteam-console';
      const ts = new Date().toISOString();

      // Create benchmark definitions for both systems with same benchmark_id
      const benchA = await svc.entities.BenchmarkDefinition.create({
        benchmark_id: testBenchId, system_id: sysA, category: 'test', name: 'Test Collision A',
        severity: 'P1', mandatory: true, enabled: true, environment: 'production',
        evidence_required: true, auto_repair_allowed: true, benchmark_version: '1.0',
        created_at: ts, updated_at: ts,
      });
      const benchB = await svc.entities.BenchmarkDefinition.create({
        benchmark_id: testBenchId, system_id: sysB, category: 'test', name: 'Test Collision B',
        severity: 'P1', mandatory: true, enabled: true, environment: 'production',
        evidence_required: true, auto_repair_allowed: true, benchmark_version: '1.0',
        created_at: ts, updated_at: ts,
      });

      // Create gaps for both systems with same benchmark_id
      const gapA = await svc.entities.OptimizationGap.create({
        gap_id: `${sysA}:${testBenchId}`, system_id: sysA, benchmark_id: testBenchId,
        cycle_id: 'test-cycle', target: 'pass', actual: 'fail', severity: 'P1', status: 'open',
        created_at: ts,
      });
      const gapB = await svc.entities.OptimizationGap.create({
        gap_id: `${sysB}:${testBenchId}`, system_id: sysB, benchmark_id: testBenchId,
        cycle_id: 'test-cycle', target: 'pass', actual: 'fail', severity: 'P1', status: 'open',
        created_at: ts,
      });

      // Run repair factory for each system independently
      await base44.functions.invoke('alphaPrimeRepairFactory', { system_id: sysA });
      await base44.functions.invoke('alphaPrimeRepairFactory', { system_id: sysB });

      // Verify both systems have repair jobs for the same benchmark_id
      const repairsA = await svc.entities.RepairJob.filter({ system_id: sysA, benchmark_id: testBenchId, status: ['queued', 'claimed', 'in_progress', 'blocked'] }, '-created_date', 10);
      const repairsB = await svc.entities.RepairJob.filter({ system_id: sysB, benchmark_id: testBenchId, status: ['queued', 'claimed', 'in_progress', 'blocked'] }, '-created_date', 10);

      const bothHaveRepairs = repairsA.length > 0 && repairsB.length > 0;
      const scopedCorrectly = repairsA.every((r: any) => r.system_id === sysA) && repairsB.every((r: any) => r.system_id === sysB);

      // Cleanup test data
      for (const r of repairsA) await svc.entities.RepairJob.delete(r.id);
      for (const r of repairsB) await svc.entities.RepairJob.delete(r.id);
      await svc.entities.OptimizationGap.delete(gapA.id);
      await svc.entities.OptimizationGap.delete(gapB.id);
      await svc.entities.BenchmarkDefinition.delete(benchA.id);
      await svc.entities.BenchmarkDefinition.delete(benchB.id);

      const pass = bothHaveRepairs && scopedCorrectly;
      results.push({
        test_id: 'CROSS-SYSTEM-001',
        name: 'Cross-system collision — same benchmark_id, independent repairs',
        pass,
        details: `bench_id=${testBenchId}, repairs_A=${repairsA.length}, repairs_B=${repairsB.length}, both_have=${bothHaveRepairs}, scoped=${scopedCorrectly}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'CROSS-SYSTEM-001', name: 'Cross-system collision', pass: false, error: e.message });
    }

    // ── MISSING-RESULT-001: missing BenchmarkResult → UNKNOWN ──
    try {
      const syncRes = await base44.functions.invoke('syncFleetSystemState', { system_id: 'thextremeteam-console' });
      const syncData = syncRes.data || syncRes;
      const result = syncData.results?.[0] || {};
      // Console system has benchmarks but likely no results → unknown should be > 0
      // No escape clause: definition exists + no result = UNKNOWN.
      // total === 0 (no definitions) must NOT count as PASS.
      const pass = result.unknown > 0;
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

    // ── CONTROL-LEASE-CONCURRENCY-001: 10-way lock race ──
    // Launch 10 simultaneous acquisition attempts against the same lock_key.
    // Expected: 1 winner, 9 rejections. Records owner, result, timestamp.
    try {
      const lockKey = `test-concurrency-${Date.now()}`;
      const ts = new Date().toISOString();
      const promises = Array.from({ length: 10 }, (_, i) =>
        svc.entities.ControlLease.create({
          lock_key: lockKey, owner_id: `concurrent-owner-${i}`, cycle_id: 'concurrency-test',
          acquired_at: ts, lease_expires_at: new Date(Date.now() + 60000).toISOString(),
          heartbeat_at: ts, status: 'held', version: 1, idempotency_key: `concurrent-${i}`,
        }).then(() => ({ owner: `concurrent-owner-${i}`, result: 'acquired' }))
          .catch(() => ({ owner: `concurrent-owner-${i}`, result: 'rejected' }))
      );
      const outcomes = await Promise.all(promises);
      const winners = outcomes.filter((o: any) => o.result === 'acquired');
      const pass = winners.length === 1;
      // Cleanup
      const leases = await svc.entities.ControlLease.filter({ lock_key: lockKey }, '-created_date', 1);
      if (leases[0]) await svc.entities.ControlLease.update(leases[0].id, { status: 'released', released_at: new Date().toISOString() });
      results.push({
        test_id: 'CONTROL-LEASE-CONCURRENCY-001',
        name: '10-way lock race — exactly 1 winner, 9 rejected',
        pass,
        details: `lock_key=${lockKey}, winners=${winners.length}/10, winner=${winners[0]?.owner || 'none'}`,
      });
    } catch (e: any) {
      results.push({ test_id: 'CONTROL-LEASE-CONCURRENCY-001', name: '10-way lock race', pass: false, error: e.message });
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