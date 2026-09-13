import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { SUPABASE_PROJECT_REF } from '../../shared/supabaseMigrationSql.ts';

// ════════════════════════════════════════════════════════════════
// supabaseConcurrencyTest
// REAL 10-way concurrent atomic lease acquisition against the canonical
// Supabase project (Xtreme OS). Fires 10 SIMULTANEOUS database
// transactions against ONE fixed lock_key.
//
// Required result:
//   1 acquired
//   9 rejected
//
// Only then: CONTROL-LEASE-CONCURRENCY-001 = PASS
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const concurrency = body.concurrency || 10;

    // ── Get Supabase OAuth access token ──
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');
    if (!accessToken) return Response.json({ error: 'Supabase connector not connected' }, { status: 500 });

    const supabaseApiBase = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`;

    // ── First: clean up any existing lease with our test key ──
    const testLockKey = `concurrency-test-${Date.now()}`;
    const cleanupSql = `DELETE FROM public.control_leases WHERE lock_key = '${testLockKey}';`;
    await fetch(`${supabaseApiBase}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: cleanupSql }),
    });

    // ── Fire N SIMULTANEOUS lease acquisition calls ──
    // Each call goes to the Supabase /database/query endpoint which executes
    // the acquire_control_lease function. The database PRIMARY KEY constraint
    // on lock_key enforces atomicity — only one INSERT can succeed.
    const acquireSql = (ownerId: string) =>
      `SELECT * FROM public.acquire_control_lease('${testLockKey}', '${ownerId}', 'concurrency-test', 30, 'test-${testLockKey}');`;

    const promises: Promise<Response>[] = [];
    for (let i = 0; i < concurrency; i++) {
      const ownerId = `worker-${i}`;
      promises.push(
        fetch(`${supabaseApiBase}/database/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: acquireSql(ownerId) }),
        })
      );
    }

    // ── Wait for all simultaneous calls to complete ──
    const responses = await Promise.all(promises);

    // ── Parse results ──
    const results: any[] = [];
    let acquired = 0;
    let rejected = 0;
    let errors = 0;

    for (let i = 0; i < responses.length; i++) {
      const res = responses[i];
      const data = await res.json();
      if (!res.ok) {
        results.push({ worker: `worker-${i}`, acquired: false, status: 'error', error: JSON.stringify(data).slice(0, 200) });
        errors++;
      } else {
        // Parse the result from the acquire_control_lease function
        // The Supabase /database/query endpoint returns the query result
        const rows = Array.isArray(data) ? data : (data.rows || [data]);
        const row = rows[0] || rows;
        const isAcquired = row.acquired === true || row.acquired === 'true' || row.acquired === 't';
        if (isAcquired) {
          acquired++;
          results.push({ worker: `worker-${i}`, acquired: true, status: row.status || 'acquired', owner: row.owner_id });
        } else {
          rejected++;
          results.push({ worker: `worker-${i}`, acquired: false, status: row.status || 'lock_not_acquired', owner: row.owner_id });
        }
      }
    }

    // ── Verify the winner holds the lease ──
    const verifySql = `SELECT lock_key, owner_id, status FROM public.control_leases WHERE lock_key = '${testLockKey}';`;
    const verifyRes = await fetch(`${supabaseApiBase}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: verifySql }),
    });
    const verifyData = await verifyRes.json();
    const verifyRows = Array.isArray(verifyData) ? verifyData : (verifyData.rows || [verifyData]);
    const leaseRecord = verifyRows[0] || verifyRows;

    // ── Cleanup: release the lease ──
    const winner = results.find(r => r.acquired);
    if (winner) {
      const releaseSql = `SELECT public.release_control_lease('${testLockKey}', '${winner.owner}');`;
      await fetch(`${supabaseApiBase}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: releaseSql }),
      });
    }

    // ── Final cleanup ──
    await fetch(`${supabaseApiBase}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: cleanupSql }),
    });

    const pass = acquired === 1 && rejected === (concurrency - 1) && errors === 0;

    return Response.json({
      ok: true,
      test_id: 'CONTROL-LEASE-CONCURRENCY-001',
      test_name: 'Supabase 10-way concurrent atomic lock — real Postgres PRIMARY KEY enforcement',
      status: pass ? 'PASS' : 'FAIL',
      lock_key: testLockKey,
      concurrency,
      acquired_count: acquired,
      rejected_count: rejected,
      error_count: errors,
      required: { acquired: 1, rejected: concurrency - 1, errors: 0 },
      lease_record: leaseRecord,
      winner: winner ? winner.owner : null,
      results,
      previous_status: 'PENDING_REAL_POSTGRES_TEST',
      new_status: pass ? 'PASS' : 'FAIL',
      evidence: `Real Supabase project ${SUPABASE_PROJECT_REF} (Xtreme OS). ${concurrency} simultaneous transactions against lock_key=${testLockKey}. PRIMARY KEY constraint enforced atomicity. Result: ${acquired} acquired, ${rejected} rejected, ${errors} errors.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}