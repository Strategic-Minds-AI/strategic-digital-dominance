# Local Alpha Workflow — Per-System Optimization Cycle

**Runtime:** Vercel Workflow Development Kit (`"use workflow"` / `"use step"`)
**Deploy to:** Vercel control-plane repo (NOT Base44)

## Deployable Code

```typescript
// ════════════════════════════════════════════════════════════════
// Local Alpha Workflow — Per-System Optimization Cycle
// Uses the Vercel Workflow Development Kit ("use workflow" / "use step").
// Trigger: Called by Fleet Supervisor for each high-priority system.
//
// FLOW:
//   LOAD SYSTEM -> LOAD BENCHMARKS -> DISPATCH VALIDATION JOBS
//   -> WAIT FOR ALL JOBS TERMINAL (event-based, not fixed sleep)
//   -> SCORE (missing = UNKNOWN, never PASS)
//   -> UPDATE GAPS -> CREATE REPAIRS -> UPDATE SYSTEM -> WRITE RECEIPT
//
// Never mix benchmarks between systems.
// ════════════════════════════════════════════════════════════════

import { sleep } from "workflow";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface LocalAlphaInput {
  system_id: string;
  organization_id: string;
}

export interface LocalAlphaResult {
  cycle_id: string;
  system_id: string;
  total: number;
  passing: number;
  failing: number;
  unknown: number;
  p0: number;
  p1: number;
  global_score: number;
  mode: string;
}

// ── Step: Load system ──
async function loadSystemStep(system_id: string): Promise<any> {
  "use step";
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("system_id", system_id)
    .limit(1);
  if (error) throw new Error(`loadSystemStep: ${error.message}`);
  if (!data || data.length === 0) throw new Error(`System not found: ${system_id}`);
  return data[0];
}

// ── Step: Load enabled benchmarks for THIS system only ──
async function loadBenchmarksStep(system_id: string): Promise<any[]> {
  "use step";
  const { data, error } = await supabase
    .from("benchmarks")
    .select("*")
    .eq("system_id", system_id)
    .eq("enabled", true);
  if (error) throw new Error(`loadBenchmarksStep: ${error.message}`);
  return data || [];
}

// ── Step: Dispatch validation jobs to queue ──
// Returns the list of expected job_ids for terminal-state tracking.
async function dispatchValidationJobsStep(
  system_id: string,
  organization_id: string,
  cycleId: string,
  benchmarks: any[]
): Promise<string[]> {
  "use step";
  const expectedJobIds: string[] = [];

  for (const bench of benchmarks) {
    const jobId = `audit-${system_id}-${bench.benchmark_id}-${cycleId}`;
    expectedJobIds.push(jobId);

    const { error } = await supabase.rpc("queue_send", {
      p_queue_name: "validation_jobs",
      p_msg: {
        job_id: jobId,
        organization_id,
        system_id,
        job_type: "benchmark_audit",
        benchmark_id: bench.benchmark_id,
        payload: {
          validation_type: bench.data_source?.includes("http") ? "http" : "api",
          target_url: bench.data_source,
          expected_state: bench.target,
          benchmark_id: bench.benchmark_id,
        },
        required_worker_type: "validation",
        attempt: 0,
        max_attempts: 3,
        idempotency_key: `audit-${system_id}-${bench.benchmark_id}-${cycleId}`,
        risk_class: "low",
        approval_required: false,
      },
    });
    if (error) throw new Error(`dispatchValidationJobsStep: ${error.message}`);
  }

  // Persist expected job IDs for traceability
  await supabase.from("jobs").upsert(
    expectedJobIds.map((jid) => ({
      job_id: jid,
      organization_id,
      system_id,
      job_type: "benchmark_audit",
      required_worker_type: "validation",
      idempotency_key: jid,
      status: "queued",
    }))
  );

  return expectedJobIds;
}

// ── Step: Wait for all validation jobs to reach terminal state ──
// Event-based: durable polling with backoff. No fixed 30-second guess.
// Terminal states: verified, failed, dead_letter, blocked
// Timeout: 120 seconds with exponential backoff (2s, 4s, 8s, 16s, ...)
// Missing results after timeout -> UNKNOWN (never PASS)
async function waitForResultsStep(
  system_id: string,
  cycleId: string,
  expectedJobIds: string[]
): Promise<any[]> {
  "use step";

  const terminalStates = ["verified", "failed", "dead_letter", "blocked"];
  const maxWaitMs = 120_000;
  let waitedMs = 0;
  let pollIntervalMs = 2_000;

  while (waitedMs < maxWaitMs) {
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("job_id, status")
      .in("job_id", expectedJobIds)
      .in("status", terminalStates);

    if (error) throw new Error(`waitForResultsStep: ${error.message}`);

    if (jobs && jobs.length === expectedJobIds.length) {
      // All jobs reached terminal state
      break;
    }

    // Durable sleep with backoff
    await sleep(`${pollIntervalMs}ms`);
    waitedMs += pollIntervalMs;
    pollIntervalMs = Math.min(pollIntervalMs * 2, 16_000);
  }

  // Read whatever results exist (missing = UNKNOWN)
  const { data: results, error: resultsError } = await supabase
    .from("benchmark_results")
    .select("*")
    .eq("system_id", system_id)
    .eq("cycle_id", cycleId);

  if (resultsError) throw new Error(`waitForResultsStep results: ${resultsError.message}`);
  return results || [];
}

// ── Step: Score results ──
// Missing result after timeout -> UNKNOWN (never PASS)
async function scoreResultsStep(
  benchmarks: any[],
  results: any[]
): Promise<{
  passing: number;
  failing: number;
  unknown: number;
  p0: number;
  p1: number;
  globalScore: number;
  distanceTo100: number;
  latestByBenchmark: Record<string, any>;
}> {
  "use step";

  let passing = 0, failing = 0, unknown = 0, p0 = 0, p1 = 0;

  const latestByBenchmark: Record<string, any> = {};
  for (const r of results) {
    if (
      !latestByBenchmark[r.benchmark_id] ||
      new Date(r.created_at) > new Date(latestByBenchmark[r.benchmark_id].created_at)
    ) {
      latestByBenchmark[r.benchmark_id] = r;
    }
  }

  for (const bench of benchmarks) {
    const result = latestByBenchmark[bench.benchmark_id];
    // Missing result = UNKNOWN, never PASS
    const status = result ? result.status : "unknown";
    if (!result || status === "unknown") {
      unknown++;
      if (bench.severity === "P0") p0++;
    } else if (status === "pass") {
      passing++;
    } else if (status === "fail") {
      failing++;
      if (bench.severity === "P0") p0++;
      if (bench.severity === "P1") p1++;
    } else if (status === "stale") {
      unknown++;
    }
  }

  const total = benchmarks.length;
  const globalScore = total > 0 ? Math.round((passing / total) * 100) : 0;
  const distanceTo100 = 100 - globalScore;

  return { passing, failing, unknown, p0, p1, globalScore, distanceTo100, latestByBenchmark };
}

// ── Step: Create/update gaps for failing benchmarks ──
async function updateGapsStep(
  system_id: string,
  organization_id: string,
  cycleId: string,
  benchmarks: any[],
  latestByBenchmark: Record<string, any>
): Promise<void> {
  "use step";
  const now = new Date().toISOString();

  for (const bench of benchmarks) {
    const result = latestByBenchmark[bench.benchmark_id];
    if (result && result.status === "fail") {
      const gapId = `${system_id}:${bench.benchmark_id}`;
      const { error } = await supabase.from("optimization_gaps").upsert({
        gap_id: gapId,
        organization_id,
        system_id,
        benchmark_id: bench.benchmark_id,
        cycle_id: cycleId,
        target: bench.target,
        actual: result.actual,
        severity: bench.severity,
        status: "open",
        last_seen: now,
        latest_cycle: cycleId,
        latest_evidence: result.actual,
      });
      if (error) throw new Error(`updateGapsStep: ${error.message}`);
    }
  }
}

// ── Step: Create repair jobs for open gaps ──
// Composite idempotency: system_id + benchmark_id + failure_fingerprint
async function createRepairsStep(
  system_id: string,
  organization_id: string,
  latestByBenchmark: Record<string, any>
): Promise<void> {
  "use step";
  const now = new Date().toISOString();

  const { data: openGaps, error } = await supabase
    .from("optimization_gaps")
    .select("*")
    .eq("system_id", system_id)
    .eq("status", "open");

  if (error) throw new Error(`createRepairsStep: ${error.message}`);

  for (const gap of openGaps || []) {
    const repairId = `repair-${system_id}-${gap.benchmark_id}-${Date.now()}`;
    const fingerprint = `${gap.benchmark_id}:${gap.actual?.slice(0, 100) || "unknown"}`;

    // Check for existing active repair (composite idempotency)
    const { data: existing } = await supabase
      .from("repairs")
      .select("repair_id")
      .eq("system_id", system_id)
      .eq("benchmark_id", gap.benchmark_id)
      .eq("failure_fingerprint", fingerprint)
      .in("status", ["queued", "claimed", "in_progress", "blocked"]);

    if (!existing || existing.length === 0) {
      await supabase.from("repairs").insert({
        repair_id: repairId,
        organization_id,
        system_id,
        benchmark_id: gap.benchmark_id,
        gap_id: gap.gap_id,
        failure_fingerprint: fingerprint,
        root_cause: `Benchmark ${gap.benchmark_id} failed: expected ${gap.target}, got ${gap.actual}`,
        implementation_plan: `Investigate and repair benchmark ${gap.benchmark_id}`,
        status: "queued",
        risk: "low",
        created_at: now,
        updated_at: now,
      });
      await supabase
        .from("optimization_gaps")
        .update({ status: "in_repair", repair_job_id: repairId })
        .eq("gap_id", gap.gap_id);
    }
  }
}

// ── Step: Update system score and mode ──
async function updateSystemStep(
  system: any,
  total: number,
  passing: number,
  failing: number,
  unknown: number,
  p0: number,
  p1: number,
  globalScore: number,
  distanceTo100: number
): Promise<string> {
  "use step";
  const now = new Date().toISOString();

  let newMode = system.current_mode;
  if (p0 > 0 || failing > 0) newMode = "completion_sprint";
  else if (unknown > 0) newMode = "bootstrap";
  else if (failing === 0 && unknown === 0 && p0 === 0 && p1 === 0) {
    const newConsecutive = (system.consecutive_pass_cycles || 0) + 1;
    newMode =
      newConsecutive >= (system.required_consecutive_passes || 3)
        ? "preservation"
        : "completion_sprint";
  }

  const { error } = await supabase
    .from("systems")
    .update({
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
    })
    .eq("system_id", system.system_id);

  if (error) throw new Error(`updateSystemStep: ${error.message}`);
  return newMode;
}

// ── Step: Write evidence receipt ──
async function writeReceiptStep(
  system_id: string,
  organization_id: string,
  cycleId: string,
  total: number,
  passing: number,
  failing: number,
  unknown: number,
  p0: number,
  p1: number,
  globalScore: number,
  mode: string
): Promise<void> {
  "use step";
  const now = new Date().toISOString();
  const receiptId = `receipt-${system_id}-${cycleId}`;

  const { error } = await supabase.from("evidence_receipts").insert({
    receipt_id: receiptId,
    organization_id,
    system_id,
    cycle_id: cycleId,
    evidence_type: "function_output",
    evidence_description: `Local Alpha cycle for ${system_id} -- score ${globalScore}, pass ${passing}/${total}`,
    evidence_data: JSON.stringify({ cycleId, total, passing, failing, unknown, p0, p1, globalScore, mode }),
    verified_at: now,
    verified_by: "local_alpha_workflow",
    worker_id: "vercel-local-alpha",
    valid: true,
  });

  if (error) throw new Error(`writeReceiptStep: ${error.message}`);
}

// ════════════════════════════════════════════════════════════════
// MAIN WORKFLOW
// ════════════════════════════════════════════════════════════════
export async function localAlphaCycle(input: LocalAlphaInput): Promise<LocalAlphaResult> {
  "use workflow";

  const cycleId = `local-alpha-${input.system_id}-${Date.now()}`;

  // Step 1: Load system
  const system = await loadSystemStep(input.system_id);

  // Step 2: Load benchmarks for THIS system only
  const benchmarks = await loadBenchmarksStep(input.system_id);
  const total = benchmarks.length;

  // Step 3: Dispatch validation jobs
  const expectedJobIds = await dispatchValidationJobsStep(
    input.system_id, input.organization_id, cycleId, benchmarks
  );

  // Step 4: Wait for ALL jobs terminal (event-based, not fixed sleep)
  const results = await waitForResultsStep(input.system_id, cycleId, expectedJobIds);

  // Step 5: Score (missing = UNKNOWN, never PASS)
  const scored = await scoreResultsStep(benchmarks, results);

  // Step 6: Update gaps
  await updateGapsStep(input.system_id, input.organization_id, cycleId, benchmarks, scored.latestByBenchmark);

  // Step 7: Create repairs
  await createRepairsStep(input.system_id, input.organization_id, scored.latestByBenchmark);

  // Step 8: Update system
  const newMode = await updateSystemStep(
    system, total, scored.passing, scored.failing, scored.unknown,
    scored.p0, scored.p1, scored.globalScore, scored.distanceTo100
  );

  // Step 9: Write evidence receipt
  await writeReceiptStep(
    input.system_id, input.organization_id, cycleId, total,
    scored.passing, scored.failing, scored.unknown, scored.p0, scored.p1,
    scored.globalScore, newMode
  );

  return {
    cycle_id: cycleId, system_id: input.system_id, total,
    passing: scored.passing, failing: scored.failing, unknown: scored.unknown,
    p0: scored.p0, p1: scored.p1, global_score: scored.globalScore, mode: newMode,
  };
}
```

## Key Fixes Applied

1. **Vercel Workflow SDK**: Uses `"use workflow"` and `"use step"` directives per current Vercel Workflow Development Kit API
2. **Query bug fixed**: `.eq('system_id, system_id)` → `.eq('system_id', system_id)` (was passing column name as value)
3. **Fixed 30-second sleep removed**: Replaced with durable polling with exponential backoff (2s→4s→8s→16s, max 120s timeout)
4. **Event-based completion**: Waits for ALL dispatched jobs to reach terminal state (verified/failed/dead_letter/blocked)
5. **Missing = UNKNOWN**: Missing results after timeout are scored as UNKNOWN, never PASS
6. **Expected job tracking**: Dispatched job IDs are persisted for terminal-state verification
7. **Organization-scoped**: All operations include `organization_id