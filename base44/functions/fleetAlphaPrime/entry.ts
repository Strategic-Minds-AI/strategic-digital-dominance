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

    // ── GOVERN: Fleet governance loop ───────────────────────────────────────
    if (action === "govern") {
      const systems = await base44.asServiceRole.entities.FleetSystem.list("-created_date", 500);

      const priorityOrder: Record<string, number> = {
        blocked: 0, degraded: 1, completion_sprint: 2, bootstrap: 3, preservation: 4,
      };

      const prioritized = systems
        .filter((s: any) => s.active)
        .sort((a: any, b: any) => {
          const p0Diff = (b.p0_count || 0) - (a.p0_count || 0);
          if (p0Diff !== 0) return p0Diff;
          const modeDiff = (priorityOrder[a.current_mode] || 99) - (priorityOrder[b.current_mode] || 99);
          if (modeDiff !== 0) return modeDiff;
          return (a.distance_to_100 || 100) - (b.distance_to_100 || 100);
        });

      // Collect pending operator intents
      const pendingIntents = await base44.asServiceRole.entities.OperatorIntent.filter(
        { status: "pending" },
        "-created_date",
        50
      );

      // Collect pending approvals from repair jobs
      const approvalRepairs = await base44.asServiceRole.entities.RepairJob.filter(
        { approval_required: true, status: "queued" },
        "-created_date",
        50
      );

      return Response.json({
        ok: true,
        fleet_size: systems.length,
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
        pending_intents: pendingIntents.length,
        pending_approvals: approvalRepairs.length,
        approval_items: approvalRepairs.map((r: any) => ({
          repair_id: r.repair_id,
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