import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { SUPABASE_PROJECT_REF } from '../../shared/supabaseMigrationSql.ts';

// ════════════════════════════════════════════════════════════════
// autonomousSprint
// The permanent invariant executor.
//
// IF SYSTEM < VERIFIED_100
// AND NO ELIGIBLE WORK IS QUEUED
// THEN LOCAL ALPHA PRIME MUST GENERATE THE NEXT ELIGIBLE
// VALIDATION, REPAIR, RESEARCH OR OPTIMIZATION JOB.
//
// Called every 5 minutes by the Fleet Supervisor workflow.
// All state persists in canonical Supabase (Xtreme OS).
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');
    if (!accessToken) return Response.json({ error: 'Supabase not connected' }, { status: 500 });

    const supabaseApiBase = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`;
    const now = new Date().toISOString();
    const ts = Date.now();

    const execSql = async (sql: string) => {
      const res = await fetch(`${supabaseApiBase}/database/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`SQL: ${JSON.stringify(data).slice(0, 300)}`);
      return Array.isArray(data) ? data : (data.rows || [data]);
    };

    // ── 1. Load all active systems that are NOT at 100 ──
    const systems = await execSql(`SELECT * FROM public.systems WHERE active = true AND global_score < 100;`);

    let jobsGenerated = 0;
    let systemsProcessed = 0;
    const actions: any[] = [];

    for (const system of systems) {
      systemsProcessed++;
      const sysId = system.system_id;
      const orgId = system.organization_id;

      // ── 2. Check if eligible work is already queued for this system ──
      const queuedJobs = await execSql(`SELECT COUNT(*) as count FROM public.jobs
        WHERE system_id = '${sysId}' AND status IN ('queued','claimed','in_progress');`);
      const queuedCount = parseInt(queuedJobs[0]?.count || '0');

      if (queuedCount > 0) {
        actions.push({ system_id: sysId, action: 'skip', reason: `${queuedCount} jobs already queued` });
        continue;
      }

      // ── 3. INVARIANT: System < 100 AND no work queued → GENERATE WORK ──

      // Find benchmarks that don't have recent results (stale or missing)
      const staleBenchmarks = await execSql(`SELECT b.benchmark_id, b.name, b.data_source, b.severity
        FROM public.benchmarks b
        WHERE b.system_id = '${sysId}' AND b.enabled = true
        AND NOT EXISTS (
          SELECT 1 FROM public.benchmark_results br
          WHERE br.benchmark_id = b.benchmark_id
          AND br.system_id = '${sysId}'
          AND br.created_at > NOW() - INTERVAL '15 minutes'
        )
        LIMIT 1;`);

      if (staleBenchmarks && staleBenchmarks.length > 0) {
        // Generate a validation job for the stale benchmark
        const bench = staleBenchmarks[0];
        const jobId = `job-auto-${sysId}-${ts}`;
        const cycleId = `sprint-${ts}`;

        // Insert job
        await execSql(`INSERT INTO public.jobs
          (job_id, organization_id, system_id, job_type, priority, payload,
           benchmark_id, required_worker_type, attempt, max_attempts,
           idempotency_key, risk_class, approval_required, status, created_at, available_at)
          VALUES ('${jobId}', '${orgId}', '${sysId}', 'benchmark_audit', 'normal',
          '{"validation_type":"http","target_url":"${bench.data_source || ''}","benchmark_id":"${bench.benchmark_id}"}'::jsonb,
          '${bench.benchmark_id}', 'validation', 0, 3, '${jobId}', 'low', false, 'queued', '${now}', '${now}');`);

        // Send to queue
        const queueMsg = {
          job_id: jobId, organization_id: orgId, system_id: sysId,
          job_type: 'benchmark_audit', benchmark_id: bench.benchmark_id,
          payload: { validation_type: 'http', target_url: bench.data_source, benchmark_id: bench.benchmark_id },
          required_worker_type: 'validation', attempt: 0, max_attempts: 3,
          idempotency_key: jobId, risk_class: 'low', approval_required: false,
        };
        await execSql(`SELECT public.queue_send('validation_jobs', '${JSON.stringify(queueMsg).replace(/'/g, "''")}'::jsonb);`);

        jobsGenerated++;
        actions.push({ system_id: sysId, action: 'generated_validation', job_id: jobId, benchmark: bench.benchmark_id });
      } else {
        // No stale benchmarks — check for open gaps that need repair
        const openGaps = await execSql(`SELECT * FROM public.optimization_gaps
          WHERE system_id = '${sysId}' AND status = 'open' LIMIT 1;`);

        if (openGaps && openGaps.length > 0) {
          const gap = openGaps[0];
          const repairId = `repair-auto-${sysId}-${ts}`;
          const repairJobId = `job-repair-${sysId}-${ts}`;
          const failureFingerprint = `gap:${sysId}:${gap.benchmark_id}:${gap.gap_id}`;

          // Create a repair packet with correctly aligned fields.
          await execSql(`INSERT INTO public.repairs
            (repair_id, organization_id, system_id, benchmark_id, gap_id, failure_fingerprint,
             root_cause, implementation_plan, status, risk, created_at, updated_at)
            VALUES ('${repairId}', '${orgId}', '${sysId}', '${gap.benchmark_id}', '${gap.gap_id}',
            '${failureFingerprint}', 'Benchmark gap ${gap.gap_id} remains unresolved',
            'Diagnose root cause, implement the smallest reversible repair, run the acceptance test, then run independent regression validation.',
            'queued', 'low', '${now}', '${now}');`);

          // Repairs are real work only when they also exist as a claimable Job and queue message.
          await execSql(`INSERT INTO public.jobs
            (job_id, organization_id, system_id, job_type, priority, payload, repair_id, benchmark_id,
             required_worker_type, attempt, max_attempts, idempotency_key, risk_class,
             approval_required, status, created_at, available_at)
            VALUES ('${repairJobId}', '${orgId}', '${sysId}', 'repair', 'high',
            '${JSON.stringify({ repair_id: repairId, gap_id: gap.gap_id, benchmark_id: gap.benchmark_id }).replace(/'/g, "''")}'::jsonb,
            '${repairId}', '${gap.benchmark_id}', 'repair', 0, 3,
            '${failureFingerprint}', 'low', false, 'queued', '${now}', '${now}');`);

          const repairQueueMsg = {
            job_id: repairJobId, organization_id: orgId, system_id: sysId,
            job_type: 'repair', repair_id: repairId, benchmark_id: gap.benchmark_id,
            payload: { repair_id: repairId, gap_id: gap.gap_id, benchmark_id: gap.benchmark_id },
            required_worker_type: 'repair', attempt: 0, max_attempts: 3,
            idempotency_key: failureFingerprint, risk_class: 'low', approval_required: false,
          };
          await execSql(`SELECT public.queue_send('repair_jobs', '${JSON.stringify(repairQueueMsg).replace(/'/g, "''")}'::jsonb);`);
          await execSql(`UPDATE public.optimization_gaps SET status = 'in_repair', repair_job_id = '${repairJobId}' WHERE gap_id = '${gap.gap_id}';`);
          jobsGenerated++;
          actions.push({ system_id: sysId, action: 'generated_repair', repair_id: repairId, job_id: repairJobId, gap: gap.gap_id });
        } else {
          // BELOW 100 MUST NEVER IDLE. If no validation/repair work exists, generate discovery work.
          // This also fixes the 0/0 system dead-end by creating a constitution-discovery job.
          const discoveryJobId = `job-discovery-${sysId}-${ts}`;
          const discoveryType = Number(system.total_benchmarks || 0) === 0 ? 'benchmark_constitution_discovery' : 'optimization_discovery';
          const discoveryPayload = {
            discovery_type: discoveryType,
            system_id: sysId,
            reason: Number(system.total_benchmarks || 0) === 0
              ? 'System has no benchmark constitution. Discover and compile mandatory benchmarks.'
              : 'System remains below VERIFIED_100 with no eligible validation or repair work. Discover the next measurable gap.',
          };
          await execSql(`INSERT INTO public.jobs
            (job_id, organization_id, system_id, job_type, priority, payload,
             required_worker_type, attempt, max_attempts, idempotency_key, risk_class,
             approval_required, status, created_at, available_at)
            VALUES ('${discoveryJobId}', '${orgId}', '${sysId}', '${discoveryType}', 'normal',
            '${JSON.stringify(discoveryPayload).replace(/'/g, "''")}'::jsonb,
            'research', 0, 3, '${discoveryJobId}', 'low', false, 'queued', '${now}', '${now}');`);
          const discoveryQueueMsg = {
            job_id: discoveryJobId, organization_id: orgId, system_id: sysId,
            job_type: discoveryType, payload: discoveryPayload,
            required_worker_type: 'research', attempt: 0, max_attempts: 3,
            idempotency_key: discoveryJobId, risk_class: 'low', approval_required: false,
          };
          await execSql(`SELECT public.queue_send('discovery_jobs', '${JSON.stringify(discoveryQueueMsg).replace(/'/g, "''")}'::jsonb);`);
          jobsGenerated++;
          actions.push({ system_id: sysId, action: 'generated_discovery', job_id: discoveryJobId, discovery_type: discoveryType });
        }
      }
    }

    // ── 4. Write evidence-derived sprint heartbeat ──
    const workerRows = await execSql(`SELECT COUNT(*)::int AS count FROM public.workers
      WHERE status IN ('active','idle','busy') AND last_heartbeat > NOW() - INTERVAL '15 minutes';`);
    const fleetRows = await execSql(`SELECT COALESCE(AVG(global_score),0)::numeric(5,2) AS score FROM public.systems
      WHERE active=true AND system_id NOT LIKE 'synthetic-%';`);
    const activeWorkerCount = Number(workerRows[0]?.count || 0);
    const fleetScore = Number(fleetRows[0]?.score || 0);
    const workerHealth = activeWorkerCount > 0 ? 'healthy' : 'degraded';
    const queueHealth = 'healthy'; // queue_send calls above are authoritative; any failure aborts this cycle.

    const heartbeatId = `sprint-hb-${ts}`;
    await execSql(`INSERT INTO public.fleet_heartbeats
      (heartbeat_id, cycle_id, scheduled_at, started_at, completed_at,
       lock_acquired, systems_checked, jobs_dispatched, worker_health, queue_health, fleet_score, status)
      VALUES ('${heartbeatId}', 'sprint-${ts}', '${now}', '${now}', '${now}',
       true, ${systemsProcessed}, ${jobsGenerated}, '${workerHealth}', '${queueHealth}', ${fleetScore}, 'completed');`);

    return Response.json({
      ok: true,
      invariant: 'IF SYSTEM < 100 AND NO WORK QUEUED THEN GENERATE WORK',
      systems_processed: systemsProcessed,
      jobs_generated: jobsGenerated,
      heartbeat_id: heartbeatId,
      actions,
      supabase_project: SUPABASE_PROJECT_REF,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}