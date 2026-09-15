import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { VALIDATION_CONSTITUTION, getHardGates, computeWeightedScore, isVerified100, PATH_TO_100 } from '../../shared/validationConstitution.ts';
import { getUniversalBenchmarks } from '../../shared/universalBenchmarkPacks.ts';

// ═══════════════════════════════════════════════════════════════════════════
// autoComplete — Universal AutoComplete orchestrator.
//
// Runs the full deterministic cycle for a system (or all active systems):
//   REGISTER → CONSTITUTE → BASELINE → GAP → REPAIR → VALIDATE → VERIFY
//
// Actions:
//   cycle    — run the full cycle for a system_id (or all active systems)
//   status   — get the current AutoComplete status for the portfolio
//   validate — run validation only (BASELINE step) for a system_id
//   gates    — get the validation constitution gates
//
// Invoke: base44.functions.invoke('autoComplete', { action, system_id? })
// ═══════════════════════════════════════════════════════════════════════════

function deterministicId(...parts: string[]): string {
  const combined = parts.join('|').toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  return `ac_${Math.abs(hash).toString(36)}`;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'status';

    switch (action) {
      // ── GATES: Return the validation constitution ──
      case 'gates': {
        return Response.json({
          ok: true,
          constitution: VALIDATION_CONSTITUTION,
          hard_gates: getHardGates().map(g => g.dimension),
          path_to_100: PATH_TO_100,
        });
      }

      // ── STATUS: Portfolio-wide AutoComplete status ──
      case 'status': {
        const [systems, gaps, repairJobs, results, receipts] = await Promise.all([
          svc.entities.FleetSystem.filter({ active: true }, '-global_score', 50),
          svc.entities.OptimizationGap.filter({ status: 'open' }, '-repair_priority_score', 50),
          svc.entities.RepairJob.filter({ status: ['queued', 'in_progress', 'blocked', 'validating'] }, '-created_date', 50),
          svc.entities.BenchmarkResult.list('-created_date', 200),
          svc.entities.EvidenceReceipt.list('-created_date', 50),
        ]);

        const p0Gaps = gaps.filter(g => g.severity === 'P0').length;
        const p1Gaps = gaps.filter(g => g.severity === 'P1').length;
        const queuedRepairs = repairJobs.filter(r => r.status === 'queued').length;
        const inProgressRepairs = repairJobs.filter(r => r.status === 'in_progress').length;
        const validatingRepairs = repairJobs.filter(r => r.status === 'validating').length;

        // Per-system status
        const systemStatuses = systems.map(s => {
          const systemGaps = gaps.filter(g => g.system_id === s.system_id);
          const systemRepairs = repairJobs.filter(r => r.system_id === s.system_id);
          const systemResults = results.filter(r => r.system_id === s.system_id);
          const passing = systemResults.filter(r => r.status === 'pass').length;
          const failing = systemResults.filter(r => r.status === 'fail').length;
          const unknown = systemResults.filter(r => r.status === 'unknown' || r.status === 'stale').length;

          return {
            system_id: s.system_id,
            name: s.name,
            score: s.global_score,
            distance_to_100: s.distance_to_100,
            mode: s.current_mode,
            health: s.local_alpha_health,
            p0_count: s.p0_count,
            p1_count: s.p1_count,
            total_benchmarks: s.total_benchmarks,
            passing_benchmarks: s.passing_benchmarks,
            failing_benchmarks: s.failing_benchmarks,
            unknown_benchmarks: s.unknown_benchmarks,
            open_gaps: systemGaps.length,
            active_repairs: systemRepairs.length,
            verified: s.global_score >= 100 && s.p0_count === 0 && s.p1_count === 0,
          };
        });

        return Response.json({
          ok: true,
          portfolio: {
            total_systems: systems.length,
            verified_systems: systemStatuses.filter(s => s.verified).length,
            avg_score: systems.length > 0 ? Math.round(systems.reduce((sum, s) => sum + s.global_score, 0) / systems.length) : 0,
            total_p0: p0Gaps,
            total_p1: p1Gaps,
            queued_repairs: queuedRepairs,
            in_progress_repairs: inProgressRepairs,
            validating_repairs: validatingRepairs,
            total_gaps: gaps.length,
            total_receipts: receipts.length,
          },
          systems: systemStatuses,
          constitution: VALIDATION_CONSTITUTION.map(d => ({
            dimension: d.dimension,
            weight: d.weight,
            gate: d.gate,
            pass_condition: d.pass_condition,
          })),
        });
      }

      // ── VALIDATE: Run BASELINE step for a system ──
      case 'validate': {
        if (!body.system_id) return Response.json({ error: 'system_id required' }, { status: 400 });

        const system = (await svc.entities.FleetSystem.filter({ system_id: body.system_id }, '-created_date', 1))[0];
        if (!system) return Response.json({ error: 'System not found' }, { status: 404 });

        const cycleId = `cycle-${Date.now()}`;
        const now = new Date().toISOString();
        const validationResults: any[] = [];

        // Run each validation dimension
        for (const dim of VALIDATION_CONSTITUTION) {
          const benchmarkId = `AC-${dim.dimension.toUpperCase()}-${body.system_id}`;
          let status = 'unknown';
          let actual = 'Not yet measured';
          let details = '';

          // Check existing benchmark results for this dimension
          const existing = await svc.entities.BenchmarkResult.filter({
            benchmark_id: benchmarkId,
            system_id: body.system_id,
          }, '-created_date', 1);

          if (existing && existing.length > 0) {
            const lastResult = existing[0];
            const ageHours = (Date.now() - new Date(lastResult.measured_at || lastResult.created_date).getTime()) / 3600000;
            const maxAge = dim.freshness_default.includes('h') ? parseInt(dim.freshness_default) : 24;
            if (ageHours > maxAge) {
              status = 'stale';
              actual = lastResult.actual || 'Stale evidence';
              details = `Evidence ${ageHours.toFixed(1)}h old (max ${maxAge}h)`;
            } else {
              status = lastResult.status;
              actual = lastResult.actual || '';
              details = lastResult.details || '';
            }
          }

          validationResults.push({
            dimension: dim.dimension,
            weight: dim.weight,
            gate: dim.gate,
            status,
            actual,
            details,
            pass_condition: dim.pass_condition,
          });
        }

        const weightedScore = computeWeightedScore(validationResults);
        const verified = isVerified100(validationResults);

        // Create evidence receipt for this validation cycle
        const receiptId = `receipt-ac-${body.system_id}-${Date.now()}`;
        await svc.entities.EvidenceReceipt.create({
          receipt_id: receiptId,
          system_id: body.system_id,
          benchmark_id: `AC-VALIDATION-${body.system_id}`,
          cycle_id: cycleId,
          evidence_type: 'function_output',
          evidence_url: '',
          evidence_description: `AutoComplete validation cycle for ${body.system_id}`,
          evidence_data: JSON.stringify({ cycleId, weightedScore, verified, dimensions: validationResults }),
          verified_at: now,
          verified_by: 'autoComplete',
          valid: true,
          expires_at: new Date(Date.now() + 12 * 3600000).toISOString(),
        });

        return Response.json({
          ok: true,
          system_id: body.system_id,
          cycle_id: cycleId,
          weighted_score: weightedScore,
          verified_100: verified,
          dimensions: validationResults,
          receipt_id: receiptId,
        });
      }

      // ── CYCLE: Run the full AutoComplete cycle ──
      case 'cycle': {
        const systemId = body.system_id;
        const cycleId = `ac-${Date.now()}`;
        const now = new Date().toISOString();
        const steps: any[] = [];

        // Determine target systems
        let systems;
        if (systemId) {
          systems = await svc.entities.FleetSystem.filter({ system_id: systemId }, '-created_date', 1);
          if (!systems || systems.length === 0) {
            return Response.json({ error: `System not found: ${systemId}` }, { status: 404 });
          }
        } else {
          systems = await svc.entities.FleetSystem.filter({ active: true }, '-global_score', 50);
        }

        const results: any[] = [];

        for (const system of systems) {
          const systemSteps: any[] = [];

          // STEP 1: REGISTER — Check system has canonical source truth
          const hasManifest = system.repository || system.base44_app_id;
          systemSteps.push({
            step: 'REGISTER',
            pass: !!hasManifest,
            detail: hasManifest ? `repo=${system.repository || 'none'}, base44=${system.base44_app_id || 'none'}` : 'BLOCKED_SOURCE_TRUTH — no repo or Base44 app ID',
          });

          // STEP 2: CONSTITUTE — Check benchmark coverage, auto-generate if missing
          let benchmarks = await svc.entities.BenchmarkDefinition.filter({ system_id: system.system_id, enabled: true }, '-created_date', 200);
          let mandatoryCount = benchmarks.filter(b => b.mandatory).length;

          if (mandatoryCount === 0) {
            // AUTO-CONSTITUTE: Generate benchmark constitution from universal packs
            const universalBenchmarks = getUniversalBenchmarks(system.system_type);
            let created = 0;
            for (const bench of universalBenchmarks) {
              const benchId = `${system.system_id}:${bench.benchmark_id}`;
              const existingBench = await svc.entities.BenchmarkDefinition.filter({ benchmark_id: benchId }, '-created_date', 1);
              if (!existingBench || existingBench.length === 0) {
                await svc.entities.BenchmarkDefinition.create({
                  benchmark_id: benchId,
                  system_id: system.system_id,
                  benchmark_pack_id: bench.category,
                  validator_id: bench.validator || bench.data_source || 'manual',
                  category: bench.category,
                  name: bench.name,
                  description: bench.description,
                  target: bench.target,
                  measurement: bench.measurement,
                  comparator: bench.comparator,
                  severity: bench.severity,
                  mandatory: bench.mandatory,
                  environment: bench.environment,
                  data_source: bench.data_source,
                  validator: bench.validator,
                  evidence_required: bench.evidence_required,
                  freshness_requirement: bench.freshness_requirement,
                  auto_repair_allowed: bench.auto_repair_allowed,
                  benchmark_version: bench.benchmark_version,
                  standard_source: bench.standard_source,
                  enabled: bench.enabled,
                  applicable_entities: [],
                  created_at: now,
                  updated_at: now,
                });
                created++;
              }
            }
            // Re-read benchmarks after constitution
            benchmarks = await svc.entities.BenchmarkDefinition.filter({ system_id: system.system_id, enabled: true }, '-created_date', 200);
            mandatoryCount = benchmarks.filter(b => b.mandatory).length;
            systemSteps.push({
              step: 'CONSTITUTE',
              pass: mandatoryCount > 0,
              detail: `AUTO-CONSTITUTED ${created} benchmarks (${mandatoryCount} mandatory) from universal pack for type="${system.system_type}"`,
            });
          } else {
            systemSteps.push({
              step: 'CONSTITUTE',
              pass: true,
              detail: `${mandatoryCount} mandatory benchmarks defined`,
            });
          }

          // STEP 3: BASELINE — Run validation
          const validationRes = await base44.functions.invoke('autoComplete', { action: 'validate', system_id: system.system_id });
          const validation = validationRes.data || validationRes;
          systemSteps.push({
            step: 'BASELINE',
            pass: validation.ok,
            detail: `weighted_score=${validation.weighted_score}, verified=${validation.verified_100}`,
          });

          // STEP 4: GAP — Check open gaps
          const openGaps = await svc.entities.OptimizationGap.filter({ system_id: system.system_id, status: 'open' }, '-repair_priority_score', 50);
          const p0Gaps = openGaps.filter(g => g.severity === 'P0');
          const p1Gaps = openGaps.filter(g => g.severity === 'P1');
          systemSteps.push({
            step: 'GAP',
            pass: true,
            detail: `${openGaps.length} open gaps (${p0Gaps.length} P0, ${p1Gaps.length} P1)`,
          });

          // STEP 5: REPAIR — Check repair jobs
          const activeRepairs = await svc.entities.RepairJob.filter({ system_id: system.system_id, status: ['queued', 'in_progress', 'blocked'] }, '-created_date', 50);
          systemSteps.push({
            step: 'REPAIR',
            pass: true,
            detail: `${activeRepairs.length} active repair jobs`,
          });

          // STEP 6: VALIDATE — Check validated repairs
          const validatingRepairs = await svc.entities.RepairJob.filter({ system_id: system.system_id, status: 'validating' }, '-created_date', 50);
          systemSteps.push({
            step: 'VALIDATE',
            pass: validatingRepairs.length === 0,
            detail: validatingRepairs.length > 0 ? `${validatingRepairs.length} repairs awaiting validation` : 'No pending validations',
          });

          // STEP 7: VERIFY — Check for VERIFIED_100
          const allHardPass = validation.dimensions?.every((d: any) => d.gate !== 'HARD' || d.status === 'pass');
          const noMandatoryFail = validation.dimensions?.every((d: any) => d.status !== 'fail' && d.status !== 'unknown' && d.status !== 'blocked');
          const verified = allHardPass && noMandatoryFail && p0Gaps.length === 0 && p1Gaps.length === 0;
          systemSteps.push({
            step: 'VERIFY',
            pass: verified,
            detail: verified ? 'VERIFIED_100' : `Score=${validation.weighted_score}, P0=${p0Gaps.length}, P1=${p1Gaps.length}`,
          });

          // Update system score
          const newScore = validation.weighted_score;
          const distanceTo100 = 100 - newScore;
          await svc.entities.FleetSystem.update(system.id, {
            global_score: newScore,
            distance_to_100: distanceTo100,
            p0_count: p0Gaps.length,
            p1_count: p1Gaps.length,
            total_benchmarks: benchmarks.length,
            passing_benchmarks: validation.dimensions?.filter((d: any) => d.status === 'pass').length || 0,
            failing_benchmarks: validation.dimensions?.filter((d: any) => d.status === 'fail').length || 0,
            unknown_benchmarks: validation.dimensions?.filter((d: any) => d.status === 'unknown' || d.status === 'stale').length || 0,
            last_full_cycle: now,
            local_alpha_health: verified ? 'healthy' : (p0Gaps.length > 0 ? 'blocked' : 'degraded'),
          });

          results.push({
            system_id: system.system_id,
            name: system.name,
            steps: systemSteps,
            weighted_score: newScore,
            verified_100: verified,
            open_gaps: openGaps.length,
            active_repairs: activeRepairs.length,
          });
        }

        // Create fleet heartbeat
        const heartbeatId = `hb-ac-${Date.now()}`;
        await svc.entities.FleetHeartbeat.create({
          heartbeat_id: heartbeatId,
          cycle_id: cycleId,
          scheduled_at: now,
          started_at: now,
          completed_at: new Date().toISOString(),
          systems_checked: systems.length,
          intents_routed: 0,
          jobs_dispatched: 0,
          jobs_failed: 0,
          systems_degraded: results.filter(r => !r.verified_100).length,
          approvals_detected: 0,
          fleet_score: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.weighted_score, 0) / results.length) : 0,
          errors: [],
          receipt_id: '',
          status: 'completed',
        });

        return Response.json({
          ok: true,
          cycle_id: cycleId,
          systems_processed: results.length,
          verified_systems: results.filter(r => r.verified_100).length,
          avg_score: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.weighted_score, 0) / results.length) : 0,
          results,
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[autoComplete] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}