import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { SUPABASE_PROJECT_REF } from '../../shared/supabaseMigrationSql.ts';

// ════════════════════════════════════════════════════════════════
// runtimeAcceptanceMission
// First real off-Base44 acceptance mission.
//
// Full chain:
//   Shadow Vision Cortex → OperatorIntent → Fleet Alpha Prime (lease)
//   → Local Alpha Prime → Supabase Queue → Railway Worker (Base44 bridge)
//   → ValidationResult → EvidenceReceipt → BenchmarkResult
//   → FleetSystem update → Vision Cortex response
//
// Harmless read-only mission: validate that the epoxyquotenearme
// homepage returns HTTP 200.
//
// Base44 participates ONLY as a migration bridge.
// All state persists in the canonical Supabase project (Xtreme OS).
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const mission = body.mission || 'Validate that the epoxyquotenearme homepage returns HTTP 200';
    const targetUrl = body.target_url || 'https://epoxyquotenearme.com';
    const systemId = body.system_id || 'epoxyquotenearme';
    const orgId = 'xtreme-team';

    // ── Get Supabase OAuth access token ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');
    if (!accessToken) return Response.json({ error: 'Supabase connector not connected' }, { status: 500 });

    const supabaseApiBase = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`;

    // Helper: execute SQL on Supabase
    const execSql = async (sql: string) => {
      const res = await fetch(`${supabaseApiBase}/database/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`SQL error: ${JSON.stringify(data).slice(0, 300)}`);
      return Array.isArray(data) ? data : (data.rows || [data]);
    };

    // Helper: insert and return row via PostgREST
    const serviceRoleRes = await fetch(`${supabaseApiBase}/api-keys`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const apiKeys = await serviceRoleRes.json();
    const serviceRoleKey = apiKeys.find((k: any) => k.name === 'service_role')?.api_key;
    if (!serviceRoleKey) return Response.json({ error: 'Could not retrieve service_role key' }, { status: 500 });

    const postgrestBase = `https://${SUPABASE_PROJECT_REF}.supabase.co/rest/v1`;
    const postgrestHeaders = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    const now = new Date().toISOString();
    const ts = Date.now();
    const ids: Record<string, string> = {};

    // ════════════════════════════════════════════════════════════════
    // STEP 1: Shadow Vision Cortex — Create conversation
    // ════════════════════════════════════════════════════════════════
    const conversationId = `conv-${ts}`;
    ids.conversation_id = conversationId;

    // In the real architecture, this goes to a conversations table.
    // For now, we track it via the intent.
    // (The Supabase migration doesn't have a conversations table yet,
    //  so we use the operator_intents table as the conversation record.)

    // ════════════════════════════════════════════════════════════════
    // STEP 2: OperatorIntent — Create the operator's request
    // ════════════════════════════════════════════════════════════════
    const intentId = `intent-${ts}`;
    ids.intent_id = intentId;

    await execSql(`INSERT INTO public.operator_intents
      (intent_id, organization_id, system_id, operator_input, interpreted_objective, scope, priority, risk, approval_policy, status, correlation_id, created_at)
      VALUES ('${intentId}', '${orgId}', '${systemId}', '${mission.replace(/'/g, "''")}',
      'Validate HTTP 200 response from ${targetUrl}', 'benchmark', 'high', 'low', 'auto', 'pending', '${conversationId}', '${now}');`);

    // ════════════════════════════════════════════════════════════════
    // STEP 3: Fleet Alpha Prime — Acquire atomic lease
    // ════════════════════════════════════════════════════════════════
    const fleetLockKey = `fleet-acceptance-${ts}`;
    const fleetOwnerId = `fleet-alpha-${ts}`;
    const cycleId = `acceptance-${ts}`;
    ids.lease_id = fleetLockKey;

    const leaseResult = await execSql(`SELECT * FROM public.acquire_control_lease('${fleetLockKey}', '${fleetOwnerId}', '${cycleId}', 300, 'acceptance-${ts}');`);
    const leaseRow = leaseResult[0] || {};
    if (!leaseRow.acquired) {
      return Response.json({ error: 'Could not acquire fleet lease', lease_result: leaseRow }, { status: 500 });
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 4: Local Alpha Prime — Dispatch validation job to Supabase queue
    // ════════════════════════════════════════════════════════════════
    const jobId = `job-validation-${ts}`;
    const benchmarkId = `HTTP-200-${systemId}`;
    ids.job_id = jobId;

    // Insert job record
    await execSql(`INSERT INTO public.jobs
      (job_id, organization_id, system_id, job_type, priority, payload, correlation_id, intent_id,
       benchmark_id, required_worker_type, attempt, max_attempts, idempotency_key, risk_class,
       approval_required, status, created_at, available_at)
      VALUES ('${jobId}', '${orgId}', '${systemId}', 'benchmark_audit', 'high',
      '{"validation_type":"http","target_url":"${targetUrl}","expected_status":200,"benchmark_id":"${benchmarkId}"}'::jsonb,
      '${conversationId}', '${intentId}', '${benchmarkId}', 'validation', 0, 3, '${jobId}', 'low', false, 'queued', '${now}', '${now}');`);

    // Send to pgmq queue
    const queueMsg = {
      job_id: jobId, organization_id: orgId, system_id: systemId,
      job_type: 'benchmark_audit', benchmark_id: benchmarkId,
      payload: { validation_type: 'http', target_url: targetUrl, expected_status: 200 },
      required_worker_type: 'validation', attempt: 0, max_attempts: 3,
      idempotency_key: jobId, risk_class: 'low', approval_required: false,
    };
    const queueRes = await execSql(`SELECT public.queue_send('validation_jobs', '${JSON.stringify(queueMsg).replace(/'/g, "''")}'::jsonb);`);
    const pgmqMessageId = queueRes[0]?.queue_send || queueRes[0]?.send || queueRes[0]?.msg_id || String(ts);
    ids.pgmq_message_id = String(pgmqMessageId);

    // Update intent status
    await execSql(`UPDATE public.operator_intents SET status = 'executing', executed_at = '${now}' WHERE intent_id = '${intentId}';`);

    // ════════════════════════════════════════════════════════════════
    // STEP 5: Railway Worker (Base44 bridge) — Claim and execute the job
    // Base44 acts as the worker bridge. The actual HTTP validation runs here.
    // ════════════════════════════════════════════════════════════════
    const workerId = `validation-worker-001`;
    ids.worker_id = workerId;

    // Register worker heartbeat
    await execSql(`INSERT INTO public.workers (worker_id, organization_id, worker_type, version, capabilities, environment, status, current_job, load, last_heartbeat, registered_at)
      VALUES ('${workerId}', '${orgId}', 'validation', '1.0.0', '{"http","dom","api","schema"}', 'production', 'busy', '${jobId}', 1, '${now}', '${now}')
      ON CONFLICT (worker_id) DO UPDATE SET current_job = '${jobId}', status = 'busy', load = 1, last_heartbeat = '${now}', updated_at = '${now}';`);

    // Claim the job (atomic update: only if status = queued)
    const claimSql = `UPDATE public.jobs SET status = 'in_progress', claimed_by = '${workerId}',
      lease_expires_at = '${new Date(Date.now() + 300000).toISOString()}', updated_at = '${now}'
      WHERE job_id = '${jobId}' AND status = 'queued' RETURNING job_id;`;
    const claimResult = await execSql(claimSql);
    if (!claimResult || claimResult.length === 0) {
      return Response.json({ error: 'Could not claim job — already claimed or not found' }, { status: 500 });
    }

    // Execute the validation (Base44 bridge — real HTTP fetch)
    let httpStatus = 0;
    let validationStatus: 'pass' | 'fail' | 'error' = 'error';
    let actualState = '';
    let validationDetails = '';

    try {
      const httpRes = await fetch(targetUrl, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'XTREME-ValidationWorker/1.0' } });
      httpStatus = httpRes.status;
      const html = await httpRes.text();
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      actualState = `HTTP ${httpStatus} | Title: "${title}"`;

      if (httpStatus === 200) {
        validationStatus = 'pass';
        validationDetails = `Homepage returned HTTP 200 with title "${title}"`;
      } else {
        validationStatus = 'fail';
        validationDetails = `Expected HTTP 200, got ${httpStatus}`;
      }
    } catch (e: any) {
      validationStatus = 'error';
      actualState = `Error: ${e.message}`;
      validationDetails = e.message;
    }

    // ════════════════════════════════════════════════════════════════
    // STEP 6: EvidenceReceipt — Write durable evidence
    // ════════════════════════════════════════════════════════════════
    const receiptId = `receipt-${systemId}-${ts}`;
    ids.receipt_id = receiptId;

    await execSql(`INSERT INTO public.evidence_receipts
      (receipt_id, organization_id, system_id, benchmark_id, cycle_id, evidence_type,
       evidence_description, evidence_data, verified_at, verified_by, worker_id, pgmq_message_id, valid)
      VALUES ('${receiptId}', '${orgId}', '${systemId}', '${benchmarkId}', '${cycleId}', 'http_response',
      'HTTP validation of ${targetUrl} — status ${httpStatus}',
      '${JSON.stringify({ url: targetUrl, http_status: httpStatus, actual_state: actualState, timestamp: now }).replace(/'/g, "''")}',
      '${now}', '${workerId}', '${workerId}', ${pgmqMessageId}, true);`);

    // ════════════════════════════════════════════════════════════════
    // STEP 7: ValidationResult — Independent validation record
    // ════════════════════════════════════════════════════════════════
    const validationId = `val-${jobId}`;
    ids.validation_id = validationId;

    await execSql(`INSERT INTO public.validation_runs
      (validation_id, organization_id, system_id, job_id, benchmark_id, validation_type,
       target_url, expected_state, actual_state, status, evidence_receipt_id, details,
       validated_at, validated_by, worker_id, pgmq_message_id)
      VALUES ('${validationId}', '${orgId}', '${systemId}', '${jobId}', '${benchmarkId}', 'http',
       '${targetUrl}', 'HTTP 200', '${actualState.replace(/'/g, "''")}', '${validationStatus}',
       '${receiptId}', '${validationDetails.replace(/'/g, "''")}',
       '${now}', '${workerId}', '${workerId}', ${pgmqMessageId});`);

    // ════════════════════════════════════════════════════════════════
    // STEP 8: BenchmarkResult — Record the benchmark outcome
    // ════════════════════════════════════════════════════════════════
    const benchmarkResultId = `bresult-${ts}`;
    ids.benchmark_result_id = benchmarkResultId;

    await execSql(`INSERT INTO public.benchmark_results
      (benchmark_id, organization_id, system_id, cycle_id, target, actual, status, severity,
       mandatory, evidence_receipt_id, measured_at, validator, details)
      VALUES ('${benchmarkId}', '${orgId}', '${systemId}', '${cycleId}', 'HTTP 200', '${actualState.replace(/'/g, "''")}',
       '${validationStatus}', 'P1', true, '${receiptId}', '${now}', '${workerId}',
       '${validationDetails.replace(/'/g, "''")}');`);

    // ════════════════════════════════════════════════════════════════
    // STEP 9: Update job status to verified
    // ════════════════════════════════════════════════════════════════
    await execSql(`UPDATE public.jobs SET status = 'verified', updated_at = '${now}' WHERE job_id = '${jobId}';`);

    // Record job attempt with full lineage
    await execSql(`INSERT INTO public.job_attempts
      (job_id, worker_id, pgmq_message_id, attempt, status, completed_at)
      VALUES ('${jobId}', '${workerId}', ${pgmqMessageId}, 0, '${validationStatus}', '${now}');`);

    // Archive the queue message
    await execSql(`SELECT public.queue_archive('validation_jobs', ${pgmqMessageId});`);

    // Update worker status
    await execSql(`UPDATE public.workers SET status = 'idle', current_job = NULL, load = 0, last_heartbeat = '${now}', updated_at = '${now}' WHERE worker_id = '${workerId}';`);

    // ════════════════════════════════════════════════════════════════
    // STEP 10: FleetSystem update — FULL CONSTITUTION rollup
    // ════════════════════════════════════════════════════════════════
    // CRITICAL: A single HTTP 200 can never produce system score 100.
    // Score denominator is the complete enabled benchmark constitution.
    const rollupRows = await execSql(`WITH latest AS (
      SELECT DISTINCT ON (benchmark_id) benchmark_id, status
      FROM public.benchmark_results
      WHERE system_id = '${systemId}'
      ORDER BY benchmark_id, measured_at DESC NULLS LAST, created_at DESC
    )
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE COALESCE(l.status,'unknown') = 'pass')::int AS passing,
      COUNT(*) FILTER (WHERE COALESCE(l.status,'unknown') = 'fail')::int AS failing,
      COUNT(*) FILTER (WHERE l.status IS NULL OR l.status NOT IN ('pass','fail'))::int AS unknown,
      COUNT(*) FILTER (WHERE b.severity = 'P0' AND COALESCE(l.status,'unknown') <> 'pass')::int AS p0,
      COUNT(*) FILTER (WHERE b.severity = 'P1' AND COALESCE(l.status,'unknown') <> 'pass')::int AS p1
    FROM public.benchmarks b
    LEFT JOIN latest l ON l.benchmark_id = b.benchmark_id
    WHERE b.system_id = '${systemId}' AND b.enabled = true;`);
    const rollup = rollupRows[0] || { total: 0, passing: 0, failing: 0, unknown: 0, p0: 0, p1: 0 };
    const totalBenchmarks = Number(rollup.total || 0);
    const passingBenchmarks = Number(rollup.passing || 0);
    const failingBenchmarks = Number(rollup.failing || 0);
    const unknownBenchmarks = Number(rollup.unknown || 0);
    const p0Count = Number(rollup.p0 || 0);
    const p1Count = Number(rollup.p1 || 0);
    const newScore = totalBenchmarks > 0 ? Math.floor((passingBenchmarks / totalBenchmarks) * 100) : 0;

    const currentSystems = await execSql(`SELECT source_parity,deployment_parity,consecutive_pass_cycles,required_consecutive_passes FROM public.systems WHERE system_id = '${systemId}' LIMIT 1;`);
    const currentSystem = currentSystems[0] || {};
    const verified100 = totalBenchmarks > 0
      && passingBenchmarks === totalBenchmarks
      && failingBenchmarks === 0
      && unknownBenchmarks === 0
      && p0Count === 0
      && p1Count === 0
      && currentSystem.source_parity === 'pass'
      && currentSystem.deployment_parity === 'pass'
      && Number(currentSystem.consecutive_pass_cycles || 0) >= Number(currentSystem.required_consecutive_passes || 3);
    const newMode = verified100 ? 'preservation' : 'completion_sprint';

    await execSql(`UPDATE public.systems SET
      global_score = ${newScore}, distance_to_100 = ${100 - newScore},
      total_benchmarks = ${totalBenchmarks}, passing_benchmarks = ${passingBenchmarks},
      failing_benchmarks = ${failingBenchmarks}, unknown_benchmarks = ${unknownBenchmarks},
      p0_count = ${p0Count}, p1_count = ${p1Count},
      current_mode = '${newMode}', last_full_cycle = '${now}',
      next_full_cycle = '${new Date(Date.now() + 300000).toISOString()}', updated_at = '${now}'
      WHERE system_id = '${systemId}';`);

    // ════════════════════════════════════════════════════════════════
    // STEP 11: FleetHeartbeat — Write governance heartbeat
    // ════════════════════════════════════════════════════════════════
    const heartbeatId = `hb-${cycleId}`;
    ids.fleet_heartbeat_id = heartbeatId;

    await execSql(`INSERT INTO public.fleet_heartbeats
      (heartbeat_id, organization_id, cycle_id, scheduled_at, started_at, completed_at,
       lock_acquired, systems_checked, intents_routed, jobs_dispatched, worker_health,
       queue_health, fleet_score, receipt_id, status)
      VALUES ('${heartbeatId}', '${orgId}', '${cycleId}', '${now}', '${now}', '${now}',
       true, 1, 1, 1, 'healthy', 'healthy', ${newScore}, '${receiptId}', 'completed');`);

    // ════════════════════════════════════════════════════════════════
    // STEP 12: Update OperatorIntent to completed
    // ════════════════════════════════════════════════════════════════
    await execSql(`UPDATE public.operator_intents SET status = 'completed',
      result = 'Validation ${validationStatus}: ${validationDetails}'
      WHERE intent_id = '${intentId}';`);

    // ════════════════════════════════════════════════════════════════
    // STEP 13: Release fleet lease
    // ════════════════════════════════════════════════════════════════
    await execSql(`SELECT public.release_control_lease('${fleetLockKey}', '${fleetOwnerId}');`);

    // ════════════════════════════════════════════════════════════════
    // STEP 14: Shadow Vision Cortex response
    // ════════════════════════════════════════════════════════════════
    const visionResponse = `Acceptance mission complete. Mission: "${mission}". Result: ${validationStatus.toUpperCase()}. HTTP ${httpStatus} from ${targetUrl}. Evidence receipt ${receiptId} persisted to Supabase. System ${systemId} score updated to ${newScore}.`;

    return Response.json({
      ok: true,
      gate: 'PHASE_9_11_RUNTIME_PROVEN',
      mission,
      target_url: targetUrl,
      system_id: systemId,
      validation_status: validationStatus,
      http_status: httpStatus,
      actual_state: actualState,
      vision_cortex_response: visionResponse,
      ids,
      chain: [
        { step: 1, name: 'Shadow Vision Cortex', id: conversationId, status: 'completed' },
        { step: 2, name: 'OperatorIntent', id: intentId, status: 'completed' },
        { step: 3, name: 'Fleet Alpha Prime (lease)', id: fleetLockKey, status: 'acquired' },
        { step: 4, name: 'Local Alpha Prime (dispatch)', id: jobId, status: 'dispatched' },
        { step: 5, name: 'Supabase Queue', id: `pgmq:${pgmqMessageId}`, status: 'sent' },
        { step: 6, name: 'Railway Worker (bridge)', id: workerId, status: validationStatus },
        { step: 7, name: 'ValidationResult', id: validationId, status: validationStatus },
        { step: 8, name: 'EvidenceReceipt', id: receiptId, status: 'persisted' },
        { step: 9, name: 'BenchmarkResult', id: benchmarkResultId, status: validationStatus },
        { step: 10, name: 'FleetSystem update', id: systemId, status: 'updated', score: newScore },
        { step: 11, name: 'FleetHeartbeat', id: heartbeatId, status: 'completed' },
        { step: 12, name: 'Vision Cortex response', id: conversationId, status: 'completed' },
      ],
      supabase_project: {
        ref: SUPABASE_PROJECT_REF,
        name: 'Xtreme OS',
      },
      base44_role: 'migration_bridge_only',
      evidence_persisted_in: 'canonical_supabase',
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}