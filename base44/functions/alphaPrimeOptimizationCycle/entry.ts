import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// alphaPrimeOptimizationCycle
// The main autonomous cycle orchestrator.
// Runs: generate benchmarks → measure distance → create repairs →
//       dispatch safe repairs → validate → recalculate → update mode
// This is the function that the 5-minute heartbeat workflow calls.
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const cycleStart = Date.now();
    const now = new Date().toISOString();
    const cycleId = `opt-cycle-${now.slice(0, 16).replace(/[-T:]/g, '')}`;

    const steps: any[] = [];

    // ── Step 1: Ensure benchmarks exist ──
    try {
      const benchRes = await base44.functions.invoke('alphaPrimeBenchmarkGenerator', {});
      steps.push({ step: 'benchmark_generator', result: benchRes.data });
    } catch (e: any) { steps.push({ step: 'benchmark_generator', error: e.message }); }

    // ── Step 2: Calculate distance to 100 ──
    let distanceResult: any = null;
    try {
      const distRes = await base44.functions.invoke('calculateDistanceTo100', {});
      distanceResult = distRes.data;
      steps.push({ step: 'distance_to_100', result: distRes.data });
    } catch (e: any) { steps.push({ step: 'distance_to_100', error: e.message }); }

    // ── Step 3: Create repair jobs for open gaps ──
    let repairResult: any = null;
    try {
      const repairRes = await base44.functions.invoke('alphaPrimeRepairFactory', {});
      repairResult = repairRes.data;
      steps.push({ step: 'repair_factory', result: repairRes.data });
    } catch (e: any) { steps.push({ step: 'repair_factory', error: e.message }); }

    // ── Step 4: Validate implemented repairs ──
    let validationResult: any = null;
    try {
      const valRes = await base44.functions.invoke('postconditionValidator', {});
      validationResult = valRes.data;
      steps.push({ step: 'postcondition_validator', result: valRes.data });
    } catch (e: any) { steps.push({ step: 'postcondition_validator', error: e.message }); }

    // ── Step 5: Detect stale leases (DO NOT auto-dispatch — workers must claim via lease) ──
    // Repair jobs are NOT moved to in_progress here. A worker must claim them
    // using a lease (claimed_by, lease_expires_at). This prevents false dispatch
    // where jobs appear "in progress" but no worker is actually executing them.
    let staleLeasesDetected = 0;
    try {
      const claimedJobs = await svc.entities.RepairJob.filter({ status: 'claimed' }, '-created_date', 50);
      for (const job of claimedJobs) {
        if (job.lease_expires_at && new Date(job.lease_expires_at) < new Date(now)) {
          // Lease expired — return to queued so another worker can claim it
          await svc.entities.RepairJob.update(job.id, {
            status: 'queued',
            claimed_by: null,
            lease_expires_at: null,
            updated_at: now,
          });
          staleLeasesDetected++;
        }
      }
      steps.push({ step: 'detect_stale_leases', stale_leases: staleLeasesDetected });
    } catch (e: any) { steps.push({ step: 'detect_stale_leases', error: e.message }); }

    // ── Step 5b: Sync fleet system state after cycle ──
    try {
      await base44.functions.invoke('syncFleetSystemState', { system_id: 'epoxyquotenearme' });
      steps.push({ step: 'sync_fleet_state', result: 'synced' });
    } catch (e: any) { steps.push({ step: 'sync_fleet_state', error: e.message }); }

    // Predeclare finalDistance before linkage calculations so health updates cannot hit the let temporal-dead-zone.
    let finalDistance: any = null;

    // ── Step 5c: Update Local Alpha linkage fields on FleetSystem ──
    try {
      const fleetSystems = await svc.entities.FleetSystem.filter({ system_id: 'epoxyquotenearme' }, '-created_date', 1);
      if (fleetSystems.length > 0) {
        const fs = fleetSystems[0];
        // Find the SystemMode record for this system
        const modeRecords = await svc.entities.SystemMode.filter({ mode_id: 'current' }, '-created_date', 1);
        const modeRecord = modeRecords[0];
        const finalResultForHealth = finalDistance || distanceResult;
        const health = (finalResultForHealth?.p0 || 0) === 0 && (finalResultForHealth?.p1 || 0) === 0
          ? 'healthy'
          : (finalResultForHealth?.fail || 0) > 0
          ? 'degraded'
          : 'unknown';

        await svc.entities.FleetSystem.update(fs.id, {
          local_alpha_controller: 'alphaPrimeOptimizationCycle',
          local_alpha_mode_record: modeRecord?.id || null,
          last_local_cycle_id: cycleId,
          last_local_cycle_at: now,
          local_alpha_health: health,
          benchmark_pack_version: 'universal_core_v1',
        });
        steps.push({ step: 'update_local_alpha_linkage', result: 'updated' });
      }
    } catch (e: any) { steps.push({ step: 'update_local_alpha_linkage', error: e.message }); }

    // ── Step 6: Recalculate distance after repairs ──
    if (validationResult?.verified > 0 || staleLeasesDetected > 0) {
      try {
        const reDistRes = await base44.functions.invoke('calculateDistanceTo100', {});
        finalDistance = reDistRes.data;
        steps.push({ step: 'recalculate_distance', result: reDistRes.data });
      } catch (e: any) { steps.push({ step: 'recalculate_distance', error: e.message }); }
    }

    const durationMs = Date.now() - cycleStart;

    // ── Write AuditLedger entry ──
    const finalResult = finalDistance || distanceResult;
    try {
      await svc.entities.AlphaPrimeAuditLedger.create({
        cycle_id: cycleId,
        trigger: 'optimization_cycle',
        scope: 'lightweight_5min',
        started_at: new Date(cycleStart).toISOString(),
        completed_at: now,
        duration_ms: durationMs,
        systems_scanned: finalResult?.total_benchmarks || 0,
        tests_run: finalResult?.total_benchmarks || 0,
        tests_passed: finalResult?.pass || 0,
        tests_failed: finalResult?.fail || 0,
        tests_unknown: finalResult?.unknown || 0,
        tests_stale: finalResult?.stale || 0,
        score_before: 0,
        score_after: finalResult?.global_score || 0,
        findings_created: finalResult?.gaps_created || 0,
        findings_closed: validationResult?.verified || 0,
        repairs_attempted: repairResult?.repair_jobs_created || 0,
        repairs_passed: validationResult?.verified || 0,
        repairs_failed: validationResult?.failed || 0,
        rollbacks: 0,
        cost_credits: 0,
        source_version: 'base44-live',
        deployment_version: 'current',
        final_state: (finalResult?.p0 || 0) === 0 && (finalResult?.p1 || 0) === 0 ? 'STABLE_GREEN' : (finalResult?.fail || 0) > 0 ? 'DEGRADED' : 'BLOCKED',
        audit_suites: ['benchmark_generator', 'distance_to_100', 'repair_factory', 'postcondition_validator'],
        false_greens_detected: 0,
        unknown_states: [],
        blocked_actions: repairResult?.repair_jobs?.filter((j: any) => j.approval_required).map((j: any) => j.benchmark_id) || [],
        approvals_required: repairResult?.repair_jobs?.filter((j: any) => j.approval_required).map((j: any) => j.benchmark_id) || [],
      });
    } catch (e: any) {
      // Non-critical — continue
    }

    return Response.json({
      ok: true,
      cycle_id: cycleId,
      duration_ms: durationMs,
      steps,
      final_state: {
        global_score: finalResult?.global_score || 0,
        distance_to_100: finalResult?.distance_to_100 || 100,
        total_benchmarks: finalResult?.total_benchmarks || 0,
        pass: finalResult?.pass || 0,
        fail: finalResult?.fail || 0,
        unknown: finalResult?.unknown || 0,
        p0: finalResult?.p0 || 0,
        p1: finalResult?.p1 || 0,
        current_mode: finalResult?.current_mode || 'completion_sprint',
        consecutive_pass_cycles: finalResult?.consecutive_pass_cycles || 0,
        repairs_dispatched: 0,
        stale_leases_detected: staleLeasesDetected,
        repairs_verified: validationResult?.verified || 0,
        repairs_failed: validationResult?.failed || 0,
        regression_tests_created: validationResult?.regression_tests_created || 0,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}