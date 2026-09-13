import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { getBenchmarkPacks } from '../../shared/benchmarkPacks.ts';

// ════════════════════════════════════════════════════════════════
// alphaPrimeBenchmarkGenerator
// Generates/updates the BenchmarkDefinition constitution from the
// machine-readable benchmark packs.
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const packs = getBenchmarkPacks();
    const now = new Date().toISOString();

    // Read existing benchmarks
    const existing = await svc.entities.BenchmarkDefinition.list(500);
    const existingMap = new Map(existing.map((b: any) => [b.benchmark_id, b]));

    let created = 0;
    let updated = 0;

    for (const pack of packs) {
      const existingDef = existingMap.get(pack.benchmark_id);
      if (existingDef) {
        // Update existing
        await svc.entities.BenchmarkDefinition.update(existingDef.id, {
          category: pack.category,
          name: pack.name,
          description: pack.description,
          target: pack.target,
          measurement: pack.measurement,
          comparator: pack.comparator,
          severity: pack.severity,
          mandatory: pack.mandatory,
          environment: pack.environment,
          data_source: pack.data_source,
          validator: pack.validator,
          evidence_required: pack.evidence_required,
          freshness_requirement: pack.freshness_requirement,
          auto_repair_allowed: pack.auto_repair_allowed,
          applicable_routes: pack.applicable_routes || [],
          applicable_workflows: pack.applicable_workflows || [],
          applicable_entities: pack.applicable_entities || [],
          benchmark_version: '1.0',
          standard_source: pack.standard_source,
          enabled: true,
          updated_at: now,
        });
        updated++;
      } else {
        // Create new
        await svc.entities.BenchmarkDefinition.create({
          benchmark_id: pack.benchmark_id,
          category: pack.category,
          name: pack.name,
          description: pack.description,
          target: pack.target,
          measurement: pack.measurement,
          comparator: pack.comparator,
          severity: pack.severity,
          mandatory: pack.mandatory,
          environment: pack.environment,
          data_source: pack.data_source,
          validator: pack.validator,
          evidence_required: pack.evidence_required,
          freshness_requirement: pack.freshness_requirement,
          auto_repair_allowed: pack.auto_repair_allowed,
          applicable_routes: pack.applicable_routes || [],
          applicable_workflows: pack.applicable_workflows || [],
          applicable_entities: pack.applicable_entities || [],
          benchmark_version: '1.0',
          standard_source: pack.standard_source,
          enabled: true,
          created_at: now,
          updated_at: now,
        });
        created++;
      }
    }

    // Count by category
    const byCategory: Record<string, number> = {};
    for (const p of packs) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    }

    return Response.json({
      ok: true,
      benchmark_version: '1.0',
      total_benchmarks: packs.length,
      created,
      updated,
      by_category: byCategory,
      mandatory: packs.filter((p) => p.mandatory).length,
      by_severity: {
        P0: packs.filter((p) => p.severity === 'P0').length,
        P1: packs.filter((p) => p.severity === 'P1').length,
        P2: packs.filter((p) => p.severity === 'P2').length,
        P3: packs.filter((p) => p.severity === 'P3').length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}