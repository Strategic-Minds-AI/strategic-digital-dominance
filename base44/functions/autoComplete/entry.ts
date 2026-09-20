import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { VALIDATION_CONSTITUTION, getHardGates, computeWeightedScore, isVerified100, PATH_TO_100 } from '../../shared/validationConstitution.ts';
import { getUniversalBenchmarks } from '../../shared/universalBenchmarkPacks.ts';
import { runAllValidators } from '../../shared/autoCompleteValidators.ts';

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

      // ── VALIDATE: Run BASELINE step for a system with REAL validators ──
      case 'validate': {
        if (!body.system_id) return Response.json({ error: 'system_id required' }, { status: 400 });

        const system = (await svc.entities.FleetSystem.filter({ system_id: body.system_id }, '-created_date', 1))[0];
        if (!system) return Response.json({ error: 'System not found' }, { status: 404 });

        const cycleId = `cycle-${Date.now()}`;
        const now = new Date().toISOString();

        // Determine app URL from system domains or base44 app
        const appUrl = system.domains?.[0] || (system.base44_app_slug ? `https://${system.base44_app_slug}.base44.app` : '');

        // Run REAL validators
        const validatorResults = await runAllValidators({
          system_id: body.system_id,
          app_url: appUrl,
          base44_app_id: system.base44_app_id,
          system_type: system.system_type,
          repository: system.repository,
          svc,
        });

        // Map validator results to constitution dimensions and create BenchmarkResults
        const validationResults: any[] = [];
        let gapsCreated = 0;

        for (const dim of VALIDATION_CONSTITUTION) {
          const vr = validatorResults.find(r => r.dimension === dim.dimension) || { status: 'unknown', actual: 'Not measured', details: '', failure_reasons: [] };
          const benchmarkId = `AC-${dim.dimension.toUpperCase()}-${body.system_id}`;

          // Create BenchmarkResult record
          await svc.entities.BenchmarkResult.create({
            benchmark_id: benchmarkId,
            system_id: body.system_id,
            cycle_id: cycleId,
            target: dim.pass_condition,
            actual: vr.actual,
            delta: vr.status === 'pass' ? '0' : 'N/A',
            status: vr.status,
            severity: dim.gate === 'HARD' ? 'P0' : 'P2',
            mandatory: dim.gate === 'HARD',
            evidence_receipt_id: '',
            measured_at: now,
            validator: 'autoComplete',
            details: vr.details,
            failure_reasons: vr.failure_reasons || [],
          });

          // Create OptimizationGap for FAIL/UNKNOWN on mandatory dimensions
          if ((vr.status === 'fail' || vr.status === 'unknown') && dim.gate === 'HARD') {
            const gapId = `${body.system_id}:${benchmarkId}`;
            const existingGap = await svc.entities.OptimizationGap.filter({ gap_id: gapId, status: 'open' }, '-created_date', 1);
            if (!existingGap || existingGap.length === 0) {
              const severity = dim.weight >= 15 ? 'P0' : 'P1';
              const priorityScore = (dim.weight * 10) + (vr.status === 'fail' ? 50 : 20);
              await svc.entities.OptimizationGap.create({
                gap_id: gapId,
                system_id: body.system_id,
                benchmark_id: benchmarkId,
                cycle_id: cycleId,
                target: dim.pass_condition,
                actual: vr.actual,
                delta: vr.details,
                severity: severity as any,
                business_impact: dim.weight >= 15 ? 'critical' : 'high',
                confidence: 0.9,
                estimated_effort: 'medium',
                estimated_cost: 'low',
                change_risk: 'low',
                dependencies: [],
                repair_priority_score: priorityScore,
                status: 'open',
                last_seen: now,
                occurrence_count: 1,
                latest_cycle: cycleId,
                latest_evidence: vr.evidence || vr.actual,
                created_at: now,
              });
              gapsCreated++;
            } else {
              // Update occurrence count on existing gap
              await svc.entities.OptimizationGap.update(existingGap[0].id, {
                last_seen: now,
                occurrence_count: (existingGap[0].occurrence_count || 1) + 1,
                latest_cycle: cycleId,
                latest_evidence: vr.actual,
              });
            }
          }

          validationResults.push({
            dimension: dim.dimension,
            weight: dim.weight,
            gate: dim.gate,
            status: vr.status,
            actual: vr.actual,
            details: vr.details,
            pass_condition: dim.pass_condition,
            failure_reasons: vr.failure_reasons || [],
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
          evidence_url: appUrl,
          evidence_description: `AutoComplete validation cycle for ${body.system_id} — ${validationResults.length} dimensions checked`,
          evidence_data: JSON.stringify({ cycleId, weightedScore, verified, dimensions: validationResults, gapsCreated }),
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
          gaps_created: gapsCreated,
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

          // STEP 4: GAP — Check open gaps and create RepairJobs from P0/P1 gaps
          const openGaps = await svc.entities.OptimizationGap.filter({ system_id: system.system_id, status: 'open' }, '-repair_priority_score', 50);
          const p0Gaps = openGaps.filter(g => g.severity === 'P0');
          const p1Gaps = openGaps.filter(g => g.severity === 'P1');
          let repairsCreated = 0;

          // Create RepairJobs from P0/P1 gaps that don't have one yet
          for (const gap of [...p0Gaps, ...p1Gaps]) {
            if (gap.repair_job_id) continue; // already has a repair job
            const fingerprint = `${gap.system_id}:${gap.benchmark_id}:${gap.gap_id}`;
            const repairId = `repair-${Math.abs(fingerprint.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)).toString(36)}`;
            const existingRepair = await svc.entities.RepairJob.filter({ repair_id: repairId, system_id: gap.system_id }, '-created_date', 1);
            if (existingRepair && existingRepair.length > 0) continue;

            await svc.entities.RepairJob.create({
              repair_id: repairId,
              system_id: gap.system_id,
              benchmark_id: gap.benchmark_id,
              gap_id: gap.gap_id,
              failure_fingerprint: fingerprint,
              root_cause: gap.delta || 'Root cause analysis pending',
              affected_system: gap.system_id,
              affected_files: [],
              affected_entities: [],
              reproduction_steps: `Validate benchmark ${gap.benchmark_id} on system ${gap.system_id}`,
              expected_state: gap.target,
              observed_state: gap.actual,
              implementation_plan: `Fix ${gap.benchmark_id} failure: ${gap.delta || gap.actual}`,
              assigned_specialist: gap.severity === 'P0' ? 'software_engineer' : 'seo_specialist',
              risk: 'low',
              rollback: 'Revert the specific change that caused the failure',
              acceptance_test: `Re-run autoComplete validate for ${gap.benchmark_id} and confirm PASS`,
              regression_test: `Ensure no other benchmarks regress after fix`,
              postcondition_validator: 'autoComplete',
              status: 'queued',
              approval_required: false,
              attempt_count: 0,
              occurrence_count: gap.occurrence_count || 1,
              created_at: now,
              updated_at: now,
            });

            // Link gap to repair job
            await svc.entities.OptimizationGap.update(gap.id, {
              repair_job_id: repairId,
              status: 'in_repair',
            });
            repairsCreated++;
          }

          systemSteps.push({
            step: 'GAP',
            pass: true,
            detail: `${openGaps.length} open gaps (${p0Gaps.length} P0, ${p1Gaps.length} P1), ${repairsCreated} repair jobs created`,
          });

          // STEP 5: REPAIR — Check repair jobs
          const activeRepairs = await svc.entities.RepairJob.filter({ system_id: system.system_id, status: ['queued', 'in_progress', 'blocked'] }, '-created_date', 50);
          systemSteps.push({
            step: 'REPAIR',
            pass: true,
            detail: `${activeRepairs.length} active repair jobs (${repairsCreated} new this cycle)`,
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

      // ── REGISTER_SELF: Register this app as a FleetSystem ──
      case 'register_self': {
        const systemId = body.system_id || 'epoxyquotenearme';
        const existing = await svc.entities.FleetSystem.filter({ system_id: systemId }, '-created_date', 1);

        const data = {
          system_id: systemId,
          name: body.name || 'Epoxy Quote Near Me',
          description: body.description || 'Epoxy garage floor estimate funnel and national dominance platform',
          system_type: body.system_type || 'lead_generation',
          business_purpose: body.business_purpose || 'Generate and convert epoxy garage floor leads nationally',
          repository: body.repository || 'XTREME-SYSTEMS/epoxyquotenearme',
          default_branch: 'main',
          domains: body.domains || ['https://epoxyquotenearme.base44.app'],
          base44_app_id: body.base44_app_id || '6a77f4491f0bf92de9a3ed8b',
          base44_app_slug: body.base44_app_slug || 'epoxyquotenearme',
          priority: 'critical',
          lifecycle: 'completion_sprint',
          current_mode: 'completion_sprint',
          migration_status: 'native',
          local_alpha_controller: 'alphaPrimeOptimizationCycle',
          local_alpha_health: 'unknown',
          active: true,
          registered_at: new Date().toISOString(),
        };

        if (existing && existing.length > 0) {
          await svc.entities.FleetSystem.update(existing[0].id, data);
          return Response.json({ ok: true, action: 'updated', system_id: systemId, id: existing[0].id });
        } else {
          const created = await svc.entities.FleetSystem.create(data);
          return Response.json({ ok: true, action: 'created', system_id: systemId, id: created.id });
        }
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[autoComplete] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}