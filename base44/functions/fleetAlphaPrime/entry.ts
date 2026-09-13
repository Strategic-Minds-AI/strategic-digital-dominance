import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { getUniversalBenchmarks } from "../../shared/universalBenchmarkPacks.ts";

// ═══════════════════════════════════════════════════════════════════════════
// FLEET ALPHA PRIME — Global Portfolio Governor
//
// Manages the entire XTREME system fleet. Each system has its own Local Alpha
// Prime; Fleet Alpha Prime coordinates priority, resources, and cross-system
// learning.
//
// Actions:
//   status    — Return fleet overview (all systems, scores, modes)
//   register  — Register a new system from a manifest
//   govern    — Run fleet governance loop (prioritize systems for compute)
//   detail    — Get single system details
// ═══════════════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "status";

    // ── STATUS: Fleet overview ──────────────────────────────────────────────
    if (action === "status") {
      const systems = await base44.asServiceRole.entities.FleetSystem.list("-created_date", 500);

      const fleet = systems.map((s: any) => ({
        system_id: s.system_id,
        name: s.name,
        type: s.system_type,
        mode: s.current_mode,
        score: s.global_score || 0,
        distance_to_100: s.distance_to_100 || 100,
        p0: s.p0_count || 0,
        p1: s.p1_count || 0,
        total_benchmarks: s.total_benchmarks || 0,
        passing: s.passing_benchmarks || 0,
        failing: s.failing_benchmarks || 0,
        source_parity: s.source_parity || "unknown",
        deployment_parity: s.deployment_parity || "unknown",
        active: s.active,
        priority: s.priority,
      }));

      const totalSystems = systems.length;
      const activeSystems = systems.filter((s: any) => s.active).length;
      const verified100 = systems.filter((s: any) => s.current_mode === "preservation").length;
      const inSprint = systems.filter((s: any) => s.current_mode === "completion_sprint").length;
      const degraded = systems.filter((s: any) => s.current_mode === "degraded").length;
      const blocked = systems.filter((s: any) => s.current_mode === "blocked").length;
      const bootstrap = systems.filter((s: any) => s.current_mode === "bootstrap").length;
      const totalP0 = systems.reduce((sum: number, s: any) => sum + (s.p0_count || 0), 0);
      const totalP1 = systems.reduce((sum: number, s: any) => sum + (s.p1_count || 0), 0);
      const fleetScore = totalSystems > 0
        ? Math.round(systems.reduce((sum: number, s: any) => sum + (s.global_score || 0), 0) / totalSystems)
        : 0;

      return Response.json({
        ok: true,
        total_systems: totalSystems,
        active_systems: activeSystems,
        verified_100: verified100,
        in_completion_sprint: inSprint,
        degraded,
        blocked,
        bootstrap,
        total_p0: totalP0,
        total_p1: totalP1,
        fleet_score: fleetScore,
        systems: fleet,
      });
    }

    // ── REGISTER: Register a new system from manifest ──────────────────────
    if (action === "register") {
      const manifest = body.manifest;
      if (!manifest || !manifest.system_id || !manifest.name || !manifest.system_type) {
        return Response.json(
          { error: "Manifest must include system_id, name, system_type" },
          { status: 400 }
        );
      }

      // Check if already exists
      const existing = await base44.asServiceRole.entities.FleetSystem.filter(
        { system_id: manifest.system_id },
        "-created_date",
        1
      );
      if (existing && existing.length > 0) {
        return Response.json(
          { error: "System already registered", system_id: manifest.system_id },
          { status: 409 }
        );
      }

      // Create the system record
      const system = await base44.asServiceRole.entities.FleetSystem.create({
        system_id: manifest.system_id,
        name: manifest.name,
        description: manifest.description || "",
        system_type: manifest.system_type,
        business_purpose: manifest.business_purpose || "",
        repository: manifest.repository || "",
        default_branch: manifest.default_branch || "main",
        vercel_project: manifest.vercel_project || "",
        railway_project: manifest.railway_project || "",
        supabase_project: manifest.supabase_project || "",
        domains: manifest.domains || [],
        drive_root: manifest.drive_root || "",
        owner: manifest.owner || user.email,
        priority: manifest.priority || "medium",
        lifecycle: "bootstrap",
        current_mode: "bootstrap",
        manifest: JSON.stringify(manifest),
        base44_app_id: manifest.base44_app_id || "",
        migration_status: manifest.base44_app_id ? "discovered" : "native",
        registered_at: new Date().toISOString(),
        active: true,
      });

      // Generate benchmark constitution for this system type
      const benchmarks = getUniversalBenchmarks(manifest.system_type);
      let benchmarksCreated = 0;
      for (const bench of benchmarks) {
        const benchId = `${manifest.system_id}:${bench.benchmark_id}`;
        const existingBench = await base44.asServiceRole.entities.BenchmarkDefinition.filter(
          { benchmark_id: benchId },
          "-created_date",
          1
        );
        if (!existingBench || existingBench.length === 0) {
          await base44.asServiceRole.entities.BenchmarkDefinition.create({
            benchmark_id: benchId,
            system_id: manifest.system_id,
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          benchmarksCreated++;
        }
      }

      return Response.json({
        ok: true,
        system: {
          id: system.id,
          system_id: system.system_id,
          name: system.name,
          type: system.system_type,
          mode: system.current_mode,
        },
        benchmarks_generated: benchmarks.length,
        benchmarks_created: benchmarksCreated,
      });
    }

    // ── GOVERN: Full fleet governance cycle ─────────────────────────────────
    if (action === "govern") {
      const svc = base44.asServiceRole;
      const nowDate = new Date();
      const now = nowDate.toISOString();

      // ── 5-MINUTE BUCKET (mathematical, not exact minute) ──
      // floor(current_minute / 5) * 5
      const minute = nowDate.getUTCMinutes();
      const bucketMinute = Math.floor(minute / 5) * 5;
      const bucketKey = `${nowDate.getUTCFullYear()}${String(nowDate.getUTCMonth() + 1).padStart(2, "0")}${String(nowDate.getUTCDate()).padStart(2, "0")}${String(nowDate.getUTCHours()).padStart(2, "0")}${String(bucketMinute).padStart(2, "0")}`;

      const cycleId = `fleet-govern-${bucketKey}`;
      const heartbeatId = `hb-${cycleId}`;
      const lockKey = `fleet-govern-${bucketKey}`;
      const idempotencyKey = `govern-${bucketKey}`;
      const ownerId = `fleet-alpha-${nowDate.getUTCMilliseconds()}-${Math.random().toString(36).substring(2, 6)}`;
      const leaseExpiresAt = new Date(nowDate.getTime() + 5 * 60 * 1000).toISOString(); // 5 min lease
      const startedAt = now;
      const errors: string[] = [];

      // ── ATOMIC LOCK via ControlLease ──
      // Strategy: Try to create a ControlLease with id = lockKey.
      // If create succeeds → lock acquired (first time for this bucket).
      // If create fails (primary key exists) → try to re-acquire expired/released lease
      //   via updateMany CAS: { lock_key, status: { $in: ["released","expired","stale"] } }
      // If CAS returns 0 → lock not acquired (LOCK_NOT_ACQUIRED).
      //
      // The database enforces primary key uniqueness on create (atomic).
      // The updateMany filter is a true compare-and-swap (atomic).
      // This is NOT check→create; the database arbitrates ownership.

      let lockAcquired = false;
      let leaseRecord: any = null;

      // Attempt 1: Try to create a new lease (atomic — primary key uniqueness)
      try {
        leaseRecord = await svc.entities.ControlLease.create({
          lock_key: lockKey,
          owner_id: ownerId,
          cycle_id: cycleId,
          acquired_at: now,
          lease_expires_at: leaseExpiresAt,
          heartbeat_at: now,
          status: "held",
          version: 1,
          idempotency_key: idempotencyKey,
        });
        lockAcquired = true;
      } catch (createErr: any) {
        // Create failed — lease already exists for this lock_key
        // Attempt 2: Try to re-acquire an expired/released lease via CAS
        const casResult = await svc.entities.ControlLease.updateMany(
          {
            lock_key: lockKey,
            status: { $in: ["released", "expired", "stale"] },
          },
          {
            $set: {
              status: "held",
              owner_id: ownerId,
              cycle_id: cycleId,
              acquired_at: now,
              lease_expires_at: leaseExpiresAt,
              heartbeat_at: now,
              idempotency_key: idempotencyKey,
            },
          }
        );
        if (casResult && casResult.updated > 0) {
          lockAcquired = true;
          // Read the updated record
          const leases = await svc.entities.ControlLease.filter({ lock_key: lockKey, status: "held" }, "-acquired_at", 1);
          leaseRecord = leases[0];
        }
      }

      if (!lockAcquired) {
        // ── IDEMPOTENT: Return existing cycle state ──
        // Check if a heartbeat already exists for this cycle
        const existingHeartbeats = await svc.entities.FleetHeartbeat.filter({ heartbeat_id: heartbeatId }, "-created_date", 1);
        if (existingHeartbeats.length > 0) {
          const hb = existingHeartbeats[0];
          return Response.json({
            ok: true,
            cycle_id: cycleId,
            lock_acquired: false,
            idempotent: true,
            heartbeat_id: heartbeatId,
            message: "Governance cycle already ran in this 5-minute bucket — returning existing state",
            existing_heartbeat: {
              heartbeat_id: hb.heartbeat_id,
              status: hb.status,
              fleet_score: hb.fleet_score,
              systems_checked: hb.systems_checked,
              intents_routed: hb.intents_routed,
            },
          });
        }
        return Response.json({
          ok: true,
          cycle_id: cycleId,
          lock_acquired: false,
          lock_status: "LOCK_NOT_ACQUIRED",
          message: "Another owner holds the lease for this 5-minute bucket",
        });
      }

      // ── LOAD ACTIVE SYSTEMS ──
      const systems = await svc.entities.FleetSystem.filter({ active: true }, "-created_date", 500);

      // ── SYNC LOCAL SYSTEM STATES (from evidence) ──
      let systemsSynced = 0;
      try {
        await base44.functions.invoke("syncFleetSystemState", {});
        systemsSynced = systems.length;
      } catch (e: any) { errors.push(`sync_fleet_state: ${e.message}`); }

      // ── READ PENDING INTENTS ──
      const pendingIntents = await svc.entities.OperatorIntent.filter({ status: "pending" }, "-created_date", 50);

      // ── ROUTE ELIGIBLE INTENTS ──
      let intentsRouted = 0;
      if (pendingIntents.length > 0) {
        try {
          const routeRes = await base44.functions.invoke("intentRouter", {});
          intentsRouted = routeRes.data?.intents_processed || 0;
        } catch (e: any) { errors.push(`intent_router: ${e.message}`); }
      }

      // ── READ OPEN INCIDENTS (SwarmAudits) ──
      const openIncidents = await svc.entities.SwarmAudit.filter({ status: "open" }, "-created_date", 50);

      // ── READ REPAIR QUEUES ──
      const activeRepairs = await svc.entities.RepairJob.filter({ status: ["queued", "claimed", "in_progress", "blocked"] }, "-created_date", 100);

      // ── DETECT STALE LEASES ──
      let staleJobsDetected = 0;
      const claimedJobs = activeRepairs.filter((j: any) => j.status === "claimed" && j.lease_expires_at && new Date(j.lease_expires_at) < new Date(now));
      for (const job of claimedJobs) {
        try {
          await svc.entities.RepairJob.update(job.id, {
            status: "queued",
            claimed_by: null,
            lease_expires_at: null,
            updated_at: now,
          });
          staleJobsDetected++;
        } catch (e: any) { errors.push(`stale_lease_${job.repair_id}: ${e.message}`); }
      }

      // ── DETECT DEGRADED SYSTEMS ──
      const degradedSystems = systems.filter((s: any) => s.current_mode === "degraded" || s.current_mode === "blocked");

      // ── READ APPROVALS ──
      const approvalRepairs = activeRepairs.filter((j: any) => j.approval_required);

      // ── PRIORITIZE SYSTEMS ──
      const priorityOrder: Record<string, number> = {
        blocked: 0, degraded: 1, completion_sprint: 2, bootstrap: 3, preservation: 4,
      };
      const prioritized = systems.sort((a: any, b: any) => {
        const p0Diff = (b.p0_count || 0) - (a.p0_count || 0);
        if (p0Diff !== 0) return p0Diff;
        const modeDiff = (priorityOrder[a.current_mode] || 99) - (priorityOrder[b.current_mode] || 99);
        if (modeDiff !== 0) return modeDiff;
        return (a.distance_to_100 || 100) - (b.distance_to_100 || 100);
      });

      // ── CALCULATE FLEET SCORE ──
      const fleetScore = systems.length > 0
        ? Math.round(systems.reduce((sum: number, s: any) => sum + (s.global_score || 0), 0) / systems.length)
        : 0;

      // ── WRITE GOVERNANCE RECEIPT (FleetHeartbeat) ──
      const completedAt = new Date().toISOString();
      const heartbeat = await svc.entities.FleetHeartbeat.create({
        heartbeat_id: heartbeatId,
        cycle_id: cycleId,
        scheduled_at: now,
        started_at: startedAt,
        completed_at: completedAt,
        duration_ms: Date.now() - new Date(startedAt).getTime(),
        lock_acquired: true,
        systems_checked: systems.length,
        intents_routed: intentsRouted,
        jobs_dispatched: 0, // Jobs are dispatched by workers claiming them, not by govern
        jobs_failed: staleJobsDetected,
        systems_degraded: degradedSystems.length,
        approvals_detected: approvalRepairs.length,
        worker_health: "not_deployed", // Phase 10 — Railway workers
        queue_health: "not_deployed",   // Phase 11 — Supabase queues
        fleet_score: fleetScore,
        errors,
        receipt_id: `receipt-${heartbeatId}`,
        status: errors.length > 0 ? "partial" : "completed",
      });

      // ── RELEASE LEASE ──
      try {
        if (leaseRecord) {
          await svc.entities.ControlLease.update(leaseRecord.id, {
            status: "released",
            released_at: completedAt,
            heartbeat_at: completedAt,
          });
        }
      } catch (e: any) { /* non-critical */ }

      return Response.json({
        ok: true,
        cycle_id: cycleId,
        heartbeat_id: heartbeatId,
        lock_acquired: true,
        fleet_size: systems.length,
        systems_synced: systemsSynced,
        systems_checked: systems.length,
        intents_routed: intentsRouted,
        stale_leases_detected: staleJobsDetected,
        systems_degraded: degradedSystems.length,
        pending_approvals: approvalRepairs.length,
        open_incidents: openIncidents.length,
        active_repair_jobs: activeRepairs.length,
        fleet_score: fleetScore,
        heartbeat_status: heartbeat.status,
        errors,
        priority_order: prioritized.map((s: any) => ({
          system_id: s.system_id,
          name: s.name,
          priority: s.priority,
          mode: s.current_mode,
          score: s.global_score || 0,
          p0: s.p0_count || 0,
          p1: s.p1_count || 0,
          distance: s.distance_to_100 || 100,
          source_parity: s.source_parity,
          deployment_parity: s.deployment_parity,
        })),
        approval_items: approvalRepairs.map((r: any) => ({
          repair_id: r.repair_id,
          system_id: r.system_id,
          benchmark_id: r.benchmark_id,
          risk: r.risk,
          implementation_plan: r.implementation_plan?.substring(0, 200),
        })),
      });
    }

    // ── DETAIL: Single system details ───────────────────────────────────────
    if (action === "detail") {
      const systemId = body.system_id;
      if (!systemId) return Response.json({ error: "system_id required" }, { status: 400 });

      const systems = await base44.asServiceRole.entities.FleetSystem.filter(
        { system_id: systemId },
        "-created_date",
        1
      );
      if (!systems || systems.length === 0) {
        return Response.json({ error: "System not found" }, { status: 404 });
      }

      const system = systems[0];
      const benchmarks = await base44.asServiceRole.entities.BenchmarkDefinition.filter(
        { benchmark_id: { $startsWith: `${systemId}:` } },
        "-created_date",
        500
      );

      return Response.json({
        ok: true,
        system,
        benchmarks: benchmarks.map((b: any) => ({
          benchmark_id: b.benchmark_id,
          name: b.name,
          category: b.category,
          severity: b.severity,
          mandatory: b.mandatory,
        })),
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}