// ════════════════════════════════════════════════════════════════
// Local Alpha Workflow — Per-System Optimization Cycle
// Trigger: Called by Fleet Supervisor for each high-priority system.
// Reference implementation for the permanent Vercel layer.
// ════════════════════════════════════════════════════════════════
//
// FLOW:
//   LOAD SYSTEM → LOAD MANIFEST → READ BENCHMARKS
//   → RUN REQUIRED AUDITS → CALCULATE DISTANCE TO 100
//   → UPDATE GAPS → CREATE/UPDATE REPAIRS
//   → DISPATCH ELIGIBLE JOBS → WAIT FOR RESULTS
//   → VALIDATE → RESCORE → WRITE RECEIPT
//
// Never mix benchmarks between systems.
// ════════════════════════════════════════════════════════════════

/*
import { workflow } from '@vercel/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export const localAlphaWorkflow = workflow(
  async (ctx, { system_id }) => {
    const cycleId = `local-alpha-${system_id}-${Date.now()}`;
    const now = new Date().toISOString();

    // ── Step 1: Load system ──
    const { data: systems } = await supabase.from('systems').select('*').eq('system_id', system_id).limit(1);
    if (!systems || systems.length === 0) return { error: 'System not found' };
    const system = systems[0];

    // ── Step 2: Load manifest ──
    const manifest = system.manifest ? JSON.parse(system.manifest) : {};

    // ── Step 3: Read enabled benchmarks for THIS system only ──
    const { data: benchmarks } = await supabase.from('benchmarks')
      .select('*').eq('system_id', system_id).eq('enabled', true);

    const total = benchmarks.length;

    // ── Step 4: Run required audits (dispatch to validation queue) ──
    for (const bench of benchmarks) {
      await supabase.rpc('pgmq_send', {
        queue_name: 'validation_jobs',
        message: {
          job_id: `audit-${system_id}-${bench.benchmark_id}-${cycleId}`,
          system_id,
          job_type: 'benchmark_audit',
          benchmark_id: bench.benchmark_id,
          payload: {
            validation_type: bench.data_source?.includes('http') ? 'http' : 'api',
            target_url: bench.data_source,
            expected_state: bench.target,
            benchmark_id: bench.benchmark_id,
          },
          required_worker_type: 'validation',
          attempt: 0,
          max_attempts: 3,
          idempotency_key: `audit-${system_id}-${bench.benchmark_id}-${cycleId}`,
          risk_class: 'low',
          approval_required: false,
        },
      });
    }

    // ── Step 5: Wait for results (durable wait) ──
    await ctx.sleep(30); // Wait 30s for validation workers to process

    // ── Step 6: Read results ──
    const { data: results } = await supabase.from('benchmark_results')
      .select('*').eq('system_id', system_id).eq('cycle_id', cycleId);

    // ── Step 7: Calculate distance to 100 ──
    let passing = 0, failing = 0, unknown = 0, p0 = 0, p1 = 0;
    const latestByBenchmark: Record<string, any> = {};
    for (const r of results || []) {
      if (!latestByBenchmark[r.benchmark_id] || new Date(r.created_at) > new Date(latestByBenchmark[r.benchmark_id].created_at)) {
        latestByBenchmark[r.benchmark_id] = r;
      }
    }

    for (const bench of benchmarks) {
      const result = latestByBenchmark[bench.benchmark_id];
      const status = result ? result.status : 'unknown';
      if (!result || status === 'unknown') {
        unknown++;
        if (bench.severity === 'P0') p0++;
      } else if (status === 'pass') {
        passing++;
      } else if (status === 'fail') {
        failing++;
        if (bench.severity === 'P0') p0++;
        if (bench.severity === 'P1') p1++;
      }
    }

    const globalScore = total > 0 ? Math.round((passing / total) * 100) : 0;
    const distanceTo100 = 100 - globalScore;

    // ── Step 8: Create/update gaps for failing benchmarks ──
    for (const bench of benchmarks) {
      const result = latestByBenchmark[bench.benchmark_id];
      if (result && result.status === 'fail') {
        const gapId = `${system_id}:${bench.benchmark_id}`;
        await supabase.from('optimization_gaps').upsert({
          gap_id: gapId,
          system_id,
          benchmark_id: bench.benchmark_id,
          cycle_id: cycleId,
          target: bench.target,
          actual: result.actual,
          severity: bench.severity,
          status: 'open',
          last_seen: now,
          latest_cycle: cycleId,
          latest_evidence: result.actual,
        });
      }
    }

    // ── Step 9: Create repair jobs for open gaps ──
    const { data: openGaps } = await supabase.from('optimization_gaps')
      .select('*').eq('system_id, system_id).eq('status', 'open');

    for (const gap of openGaps || []) {
      const repairId = `repair-${system_id}-${gap.benchmark_id}-${Date.now()}`;
      const fingerprint = `${gap.benchmark_id}:${gap.actual?.slice(0, 100) || 'unknown'}`;

      // Check for existing active repair (composite idempotency)
      const { data: existing } = await supabase.from('repairs')
        .select('repair_id').eq('system_id', system_id).eq('benchmark_id', gap.benchmark_id)
        .eq('failure_fingerprint', fingerprint).in('status', ['queued', 'claimed', 'in_progress', 'blocked']);

      if (!existing || existing.length === 0) {
        await supabase.from('repairs').insert({
          repair_id: repairId,
          system_id,
          benchmark_id: gap.benchmark_id,
          gap_id: gap.gap_id,
          failure_fingerprint: fingerprint,
          root_cause: `Benchmark ${gap.benchmark_id} failed: expected ${gap.target}, got ${gap.actual}`,
          implementation_plan: `Investigate and repair benchmark ${gap.benchmark_id}`,
          status: 'queued',
          risk: 'low',
          created_at: now,
          updated_at: now,
        });
        await supabase.from('optimization_gaps').update({ status: 'in_repair', repair_job_id: repairId }).eq('gap_id', gap.gap_id);
      }
    }

    // ── Step 10: Update system score ──
    let newMode = system.current_mode;
    if (p0 > 0 || failing > 0) newMode = 'completion_sprint';
    else if (unknown > 0) newMode = 'bootstrap';
    else if (failing === 0 && unknown === 0 && p0 === 0 && p1 === 0) {
      const newConsecutive = (system.consecutive_pass_cycles || 0) + 1;
      newMode = newConsecutive >= (system.required_consecutive_passes || 3) ? 'preservation' : 'completion_sprint';
    }

    await supabase.from('systems').update({
      total_benchmarks: total,
      passing_benchmarks: passing,
      failing_benchmarks: failing,
      unknown_benchmarks: unknown,
      global_score: globalScore,
      distance_to_100: distanceTo100,
      p0_count: p0,
      p1_count: p1,
      current_mode: newMode,
      last_full_cycle: now,
      next_full_cycle: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      updated_at: now,
    }).eq('system_id', system_id);

    // ── Step 11: Write evidence receipt ──
    const receiptId = `receipt-${system_id}-${cycleId}`;
    await supabase.from('evidence_receipts').insert({
      receipt_id: receiptId,
      system_id,
      cycle_id: cycleId,
      evidence_type: 'function_output',
      evidence_description: `Local Alpha cycle for ${system_id} — score ${globalScore}, pass ${passing}/${total}`,
      evidence_data: JSON.stringify({ cycleId, total, passing, failing, unknown, p0, p1, globalScore, mode: newMode }),
      verified_at: now,
      verified_by: 'local_alpha_workflow',
      valid: true,
    });

    return { cycle_id: cycleId, system_id, total, passing, failing, unknown, p0, p1, global_score: globalScore, mode: newMode };
  },
  { schema: 'local_alpha' }
);
*/