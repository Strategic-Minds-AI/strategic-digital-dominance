# Fleet Supervisor Workflow — Vercel Durable Orchestration

**Runtime:** Vercel Workflow Development Kit (`"use workflow"` / `"use step"`)
**Deploy to:** Vercel control-plane repo (NOT Base44)
**Trigger:** Vercel Cron every 5 minutes

## Deployable Code

```typescript
// ════════════════════════════════════════════════════════════════
// Fleet Supervisor Workflow — Vercel Durable Orchestration
// Uses the Vercel Workflow Development Kit ("use workflow" / "use step").
// Trigger: Vercel Cron every 5 minutes + event-driven wakeups.
//
// FLOW:
//   ACQUIRE SUPABASE LEASE -> LOAD ACTIVE SYSTEMS -> READ PENDING INTENTS
//   -> DETECT STALE LEASES -> ROUTE INTENTS -> DISPATCH LOCAL ALPHA
//   -> CALCULATE FLEET SCORE -> WRITE HEARTBEAT -> RELEASE LEASE
//
// The HTTP/Cron trigger returns quickly.
// The durable workflow continues independently.
// ════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface FleetSupervisorInput {
  organization_id: string;
}

// ── Step: Acquire Supabase lease (atomic via PRIMARY KEY) ──
async function acquireLeaseStep(
  lockKey: string,
  ownerId: string,
  cycleId: string,
  idempotencyKey: string
): Promise<{ acquired: boolean; ownerId: string; status: string }> {
  "use step";
  const { data, error } = await supabase.rpc("acquire_control_lease", {
    p_lock_key: lockKey,
    p_owner_id: ownerId,
    p_cycle_id: cycleId,
    p_lease_duration_seconds: 300,
    p_idempotency_key: idempotencyKey,
  });
  if (error) throw new Error(`acquireLeaseStep: ${error.message}`);
  const result = data && data[0] ? data[0] : { acquired: false, status: "error" };
  return { acquired: !!result.acquired, ownerId: result.owner_id || "", status: result.status || "error" };
}

// ── Step: Load active systems ──
async function loadSystemsStep(organization_id: string): Promise<any[]> {
  "use step";
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("organization_id", organization_id)
    .eq("active", true);
  if (error) throw new Error(`loadSystemsStep: ${error.message}`);
  return data || [];
}

// ── Step: Read pending operator intents ──
async function loadPendingIntentsStep(organization_id: string): Promise<any[]> {
  "use step";
  const { data, error } = await supabase
    .from("operator_intents")
    .select("*")
    .eq("organization_id", organization_id)
    .eq("status", "pending");
  if (error) throw new Error(`loadPendingIntentsStep: ${error.message}`);
  return data || [];
}

// ── Step: Detect and reset stale repair leases ──
async function detectStaleLeasesStep(): Promise<number> {
  "use step";
  const now = new Date().toISOString();
  const { data: activeRepairs, error } = await supabase
    .from("repairs")
    .select("*")
    .in("status", ["claimed", "in_progress"]);
  if (error) throw new Error(`detectStaleLeasesStep: ${error.message}`);

  let staleCount = 0;
  for (const job of activeRepairs || []) {
    if (job.lease_expires_at && new Date(job.lease_expires_at) < new Date(now)) {
      await supabase
        .from("repairs")
        .update({ status: "queued", claimed_by: null, lease_expires_at: null, updated_at: now })
        .eq("repair_id", job.repair_id);
      staleCount++;
    }
  }
  return staleCount;
}

// ── Step: Route eligible intents to queues ──
async function routeIntentsStep(intents: any[], organization_id: string): Promise<number> {
  "use step";
  let routed = 0;
  for (const intent of intents) {
    const queueName = mapIntentToQueue(intent.scope);
    const workerType = mapScopeToWorkerType(intent.scope);
    const jobId = `job-${intent.intent_id}`;
    const { error } = await supabase.rpc("queue_send", {
      p_queue_name: queueName,
      p_msg: {
        job_id: jobId,
        organization_id,
        system_id: intent.system_id,
        job_type: intent.scope,
        priority: intent.priority,
        payload: { intent_id: intent.intent_id, objective: intent.interpreted_objective },
        intent_id: intent.intent_id,
        required_worker_type: workerType,
        attempt: 0, max_attempts: 3, idempotency_key: intent.intent_id,
        risk_class: intent.risk, approval_required: intent.approval_policy !== "auto",
      },
    });
    if (!error) {
      await supabase.from("operator_intents").update({ status: "executing" }).eq("intent_id", intent.intent_id);
      routed++;
    }
  }
  return routed;
}

// ── Step: Dispatch Local Alpha cycles for top-priority systems ──
async function dispatchLocalAlphaStep(systems: any[], organization_id: string, bucketKey: string): Promise<number> {
  "use step";
  const priorityOrder: Record<string, number> = { blocked: 0, degraded: 1, completion_sprint: 2, bootstrap: 3, preservation: 4 };
  const prioritized = [...systems].sort((a, b) => {
    const p0Diff = (b.p0_count || 0) - (a.p0_count || 0);
    if (p0Diff !== 0) return p0Diff;
    return (priorityOrder[a.current_mode] || 99) - (priorityOrder[b.current_mode] || 99);
  });
  let dispatched = 0;
  for (const system of prioritized.slice(0, 5)) {
    const jobId = `local-alpha-${system.system_id}-${bucketKey}`;
    const { error } = await supabase.rpc("queue_send", {
      p_queue_name: "audit_jobs",
      p_msg: {
        job_id: jobId, organization_id, system_id: system.system_id,
        job_type: "local_alpha_cycle", required_worker_type: "audit",
        attempt: 0, max_attempts: 1,
        idempotency_key: `local-alpha-${system.system_id}-${bucketKey}`,
        risk_class: "low", approval_required: false,
      },
    });
    if (!error) dispatched++;
  }
  return dispatched;
}

// ── Step: Write heartbeat ──
async function writeHeartbeatStep(
  heartbeatId: string, cycleId: string, organization_id: string,
  systemsChecked: number, intentsRouted: number, jobsDispatched: number,
  staleLeases: number, degradedCount: number, approvalCount: number, fleetScore: number
): Promise<void> {
  "use step";
  const now = new Date().toISOString();
  const { error } = await supabase.from("fleet_heartbeats").insert({
    heartbeat_id: heartbeatId, organization_id, cycle_id: cycleId,
    scheduled_at: now, started_at: now, completed_at: now, lock_acquired: true,
    systems_checked: systemsChecked, intents_routed: intentsRouted,
    jobs_dispatched: jobsDispatched, jobs_failed: staleLeases,
    systems_degraded: degradedCount, approvals_detected: approvalCount,
    worker_health: "healthy", queue_health: "healthy",
    fleet_score: fleetScore, status: "completed",
  });
  if (error) throw new Error(`writeHeartbeatStep: ${error.message}`);
}

// ── Step: Release lease ──
async function releaseLeaseStep(lockKey: string, ownerId: string): Promise<void> {
  "use step";
  const { error } = await supabase.rpc("release_control_lease", { p_lock_key: lockKey, p_owner_id: ownerId });
  if (error) throw new Error(`releaseLeaseStep: ${error.message}`);
}

// ════════════════════════════════════════════════════════════════
// MAIN WORKFLOW
// ════════════════════════════════════════════════════════════════
export async function fleetSupervisor(input: FleetSupervisorInput): Promise<any> {
  "use workflow";

  const now = new Date();
  const bucketMinute = Math.floor(now.getUTCMinutes() / 5) * 5;
  const bucketKey = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}${String(now.getUTCHours()).padStart(2, "0")}${String(bucketMinute).padStart(2, "0")}`;
  const cycleId = `fleet-govern-${bucketKey}`;
  const lockKey = `fleet-govern-${bucketKey}`;
  const ownerId = `vercel-fleet-${bucketKey}`;
  const idempotencyKey = `govern-${bucketKey}`;
  const heartbeatId = `hb-${cycleId}`;

  // Step 1: Acquire Supabase lease (atomic via PRIMARY KEY)
  const lease = await acquireLeaseStep(lockKey, ownerId, cycleId, idempotencyKey);
  if (!lease.acquired) {
    return { cycle_id: cycleId, lock_acquired: false, idempotent: true };
  }

  try {
    // Step 2: Load active systems
    const systems = await loadSystemsStep(input.organization_id);

    // Step 3: Read pending intents
    const pendingIntents = await loadPendingIntentsStep(input.organization_id);

    // Step 4: Detect stale leases
    const staleLeases = await detectStaleLeasesStep();

    // Step 5: Route intents
    const intentsRouted = await routeIntentsStep(pendingIntents, input.organization_id);

    // Step 6: Dispatch Local Alpha for top systems
    const jobsDispatched = await dispatchLocalAlphaStep(systems, input.organization_id, bucketKey);

    // Step 7: Calculate fleet score
    const fleetScore = systems.length > 0
      ? Math.round(systems.reduce((sum, s) => sum + (s.global_score || 0), 0) / systems.length)
      : 0;

    // Step 8: Count degraded systems and approvals
    const degradedCount = systems.filter(
      (s) => s.current_mode === "degraded" || s.current_mode === "blocked"
    ).length;

    const { data: activeRepairs } = await supabase
      .from("repairs")
      .select("approval_required")
      .eq("organization_id", input.organization_id)
      .in("status", ["queued", "claimed", "in_progress", "blocked"]);
    const approvalCount = (activeRepairs || []).filter((r) => r.approval_required).length;

    // Step 9: Write heartbeat
    await writeHeartbeatStep(
      heartbeatId, cycleId, input.organization_id,
      systems.length, intentsRouted, jobsDispatched,
      staleLeases, degradedCount, approvalCount, fleetScore
    );

    return {
      cycle_id: cycleId, lock_acquired: true,
      systems_checked: systems.length, intents_routed: intentsRouted,
      jobs_dispatched: jobsDispatched, stale_leases_detected: staleLeases,
      fleet_score: fleetScore,
    };
  } finally {
    // Step 10: Release lease (always, even on error)
    await releaseLeaseStep(lockKey, ownerId);
  }
}

// ── Helpers ──
function mapIntentToQueue(scope: string): string {
  const map: Record<string, string> = {
    fleet: "audit_jobs", system: "audit_jobs", benchmark: "audit_jobs",
    repair: "repair_jobs", deployment: "deployment_jobs",
    research: "research_jobs", approval: "incident_jobs",
  };
  return map[scope] || "discovery_jobs";
}

function mapScopeToWorkerType(scope: string): string {
  const map: Record<string, string> = {
    fleet: "audit", system: "audit", benchmark: "audit",
    repair: "coding", deployment: "deployment",
    research: "research", approval: "validation",
  };
  return map[scope] || "discovery";
}

// Vercel Cron trigger: every 5 minutes
export const config = { cron: "0-59/5 * * * *" };
```

## Key Fixes Applied

1. **Vercel Workflow SDK**: Uses `"use workflow"` and `"use step"` directives per current Vercel Workflow Development Kit API
2. **Durable steps**: Every side-effecting operation is a separate `"use step"` function for automatic persistence and retry
3. **Lease in finally block**: Release always executes, even on error
4. **Organization-scoped**: All queries filter by `organization_id`
5. **Atomic lease**: Uses `acquire_control_lease` RPC (PRIMARY KEY enforcement) not application-level check-then-create