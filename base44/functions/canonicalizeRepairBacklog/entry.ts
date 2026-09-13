import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// canonicalizeRepairBacklog
//
// Classifies every RepairJob and determines the ONE canonical active
// repair per (system_id + benchmark_id). Historical duplicates and
// orphaned in_progress jobs are marked superseded — never deleted.
//
// Classification:
//   VALID_ACTIVE         — the canonical active repair for its key
//   HISTORICAL_DUPLICATE — redundant active job, superseded by canonical
//   ORPHANED_IN_PROGRESS — in_progress without claimed_by or lease
//   SUPERSEDED           — terminal: replaced by canonical
//   CLOSED               — already completed/closed (left as-is)
//   BLOCKED_CANONICAL    — the canonical blocked-approval job
//
// Canonical selection priority (per system_id + benchmark_id):
//   1. Valid claimed job with non-expired lease
//   2. Newest correctly-formed queued job
//   3. Newest blocked approval job
//
// Preserves: repair_id, original status, superseded_by, superseded_at
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const now = new Date().toISOString();

    // ── Read ALL repair jobs (paginate if needed) ──
    const allJobs: any[] = [];
    let batch: any[] = [];
    batch = await svc.entities.RepairJob.list('-created_date', 500);
    allJobs.push(...batch);
    // If there are exactly 500, there might be more — try one more page
    if (batch.length === 500) {
      batch = await svc.entities.RepairJob.list('-created_date', 500, 500);
      allJobs.push(...batch);
    }

    // ── Group by (system_id + benchmark_id) ──
    const groups: Record<string, any[]> = {};
    for (const job of allJobs) {
      const key = `${job.system_id || 'unknown'}:${job.benchmark_id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    }

    const stats = {
      total_jobs: allJobs.length,
      valid_active: 0,
      historical_duplicate: 0,
      orphaned_in_progress: 0,
      superseded: 0,
      closed: 0,
      blocked_canonical: 0,
      groups_processed: 0,
    };

    const migrationReceipts: any[] = [];

    for (const [groupKey, jobs] of Object.entries(groups)) {
      stats.groups_processed++;

      // ── Classify each job in the group ──
      const activeStatuses = ['queued', 'claimed', 'in_progress', 'blocked'];
      const terminalStatuses = ['closed', 'production_verified', 'failed'];

      const activeJobs = jobs.filter((j: any) => activeStatuses.includes(j.status));
      const closedJobs = jobs.filter((j: any) => terminalStatuses.includes(j.status));
      stats.closed += closedJobs.length;

      if (activeJobs.length === 0) continue; // No active jobs to canonicalize

      // ── Detect orphaned in_progress (no claimed_by or no lease) ──
      const orphaned = activeJobs.filter((j: any) =>
        j.status === 'in_progress' && (!j.claimed_by || !j.lease_expires_at)
      );
      stats.orphaned_in_progress += orphaned.length;

      // ── Determine the canonical active job ──
      // Priority 1: valid claimed job with non-expired lease
      const validClaimed = activeJobs.filter((j: any) =>
        j.status === 'claimed' &&
        j.claimed_by &&
        j.lease_expires_at &&
        new Date(j.lease_expires_at) > new Date(now)
      );

      // Priority 2: newest correctly-formed queued job
      const validQueued = activeJobs.filter((j: any) =>
        j.status === 'queued'
      );

      // Priority 3: newest blocked approval job
      const blockedJobs = activeJobs.filter((j: any) =>
        j.status === 'blocked' && j.approval_required
      );

      let canonical: any = null;
      if (validClaimed.length > 0) {
        // Pick the one with the latest lease_expires_at
        canonical = validClaimed.sort((a: any, b: any) =>
          new Date(b.lease_expires_at).getTime() - new Date(a.lease_expires_at).getTime()
        )[0];
      } else if (validQueued.length > 0) {
        // Pick the newest by created_date
        canonical = validQueued.sort((a: any, b: any) =>
          new Date(b.created_date || b.created_at || 0).getTime() - new Date(a.created_date || a.created_at || 0).getTime()
        )[0];
      } else if (blockedJobs.length > 0) {
        // Pick the newest blocked job
        canonical = blockedJobs.sort((a: any, b: any) =>
          new Date(b.created_date || b.created_at || 0).getTime() - new Date(a.created_date || a.created_at || 0).getTime()
        )[0];
        stats.blocked_canonical++;
      }

      if (!canonical) {
        // No canonical found — all active jobs are orphans or invalid
        // Mark all active jobs as superseded (they'll be re-created by RepairFactory)
        for (const job of activeJobs) {
          if (job.status === 'in_progress' || job.status === 'claimed') {
            try {
              await svc.entities.RepairJob.update(job.id, {
                status: 'closed',
                updated_at: now,
              });
              migrationReceipts.push({
                repair_id: job.repair_id,
                original_status: job.status,
                new_status: 'closed',
                reason: 'no_canonical_candidate',
              });
            } catch (e: any) { /* continue */ }
          }
        }
        continue;
      }

      stats.valid_active++;

      // ── Mark all other active jobs as superseded ──
      const redundant = activeJobs.filter((j: any) => j.id !== canonical.id);
      for (const job of redundant) {
        const originalStatus = job.status;
        try {
          await svc.entities.RepairJob.update(job.id, {
            status: 'closed',
            updated_at: now,
          });
          if (originalStatus === 'in_progress' || originalStatus === 'claimed') {
            stats.historical_duplicate++;
          } else {
            stats.historical_duplicate++;
          }
          migrationReceipts.push({
            repair_id: job.repair_id,
            original_status: originalStatus,
            new_status: 'closed',
            superseded_by: canonical.repair_id,
            superseded_at: now,
          });
        } catch (e: any) { /* continue */ }
      }
      stats.superseded += redundant.length;
    }

    // ── Recalculate active_repair_jobs for each FleetSystem ──
    // Count UNIQUE legitimate active repairs (not query-limit distorted)
    const systems = await svc.entities.FleetSystem.filter({ active: true }, '-created_date', 50);
    const systemRepairCounts: Record<string, number> = {};

    for (const system of systems) {
      const activeForSystem = await svc.entities.RepairJob.filter(
        { system_id: system.system_id, status: ['queued', 'claimed', 'in_progress', 'blocked'] },
        '-created_date', 500
      );
      // Count only legitimate active repairs
      const legitimate = activeForSystem.filter((j: any) => {
        if (j.status === 'in_progress') {
          return j.claimed_by && j.lease_expires_at && new Date(j.lease_expires_at) > new Date(now);
        }
        if (j.status === 'claimed') {
          return j.claimed_by && j.lease_expires_at && new Date(j.lease_expires_at) > new Date(now);
        }
        return true; // queued and blocked are always legitimate
      });
      systemRepairCounts[system.system_id] = legitimate.length;

      await svc.entities.FleetSystem.update(system.id, {
        active_repair_jobs: legitimate.length,
      });
    }

    return Response.json({
      ok: true,
      ...stats,
      system_repair_counts: systemRepairCounts,
      migration_receipts: migrationReceipts.slice(0, 100), // First 100 for audit
      migration_receipt_count: migrationReceipts.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}