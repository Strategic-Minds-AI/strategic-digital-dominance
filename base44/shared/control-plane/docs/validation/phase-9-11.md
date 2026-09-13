# Migration Test Harness — Phase 9-11 Pre-Deployment Validation

## Overview

Before production execution, the following automated tests must pass against a **staging** Supabase environment.

## Test Categories

### 1. SQL Parse Validation
- **POSTGRES_SYNTAX**: Both migration files parse as valid PostgreSQL
- No JavaScript-style comments (`//`) — only `--`
- All statements terminate with `;`
- All `SECURITY DEFINER` functions include `SET search_path = ''`

### 2. Extension Availability
- `pgcrypto` extension available
- `pgmq` extension available
- `pg_cron` extension available (for watchdog)

### 3. Migration Apply (Fresh Database)
- `001_core_tables_and_leases.sql` applies cleanly
- `002_queues_and_rls.sql` applies cleanly
- All tables created with correct columns
- All indexes created
- All functions created with correct signatures

### 4. Migration Rerun Safety (Idempotency)
- Re-running `001` does not fail (all `IF NOT EXISTS`)
- Re-running `002` does not fail (queue creation wrapped in `DO $$ ... EXCEPTION`)
- No duplicate queues created
- No duplicate tables or indexes

### 5. Rollback Validation
- `DROP TABLE` cascade removes all tables
- Functions can be dropped with `DROP FUNCTION`
- RLS policies can be dropped with `DROP POLICY`
- Re-applying migrations after rollback succeeds

### 6. Lease Function Tests
- `acquire_control_lease`: First call acquires, second call denied
- `acquire_control_lease`: Expired lease can be re-acquired
- `release_control_lease`: Only owner can release
- `heartbeat_control_lease`: Extends lease expiry
- `expire_stale_leases`: Marks expired leases correctly

### 7. Function Permission Tests
- `REVOKE EXECUTE FROM PUBLIC` verified
- `anon` role cannot invoke `acquire_control_lease`
- `authenticated` role cannot invoke `acquire_control_lease`
- `service_role` can invoke `acquire_control_lease`
- `resolve_org_role` accessible to `authenticated` (for RLS policies)

### 8. RLS Tests (see RLS Test Matrix below)

### 9. Cross-User Isolation Tests
- User A cannot read User B's organization data
- User A cannot write to User B's organization
- Organization members can only access their own org
- `control_leases` denies all client access (service_role only)

### 10. Service Worker Access Tests
- `service_role` bypasses RLS (can read/write all)
- `service_role` can send/read/archive queue messages
- `service_role` can acquire/release leases

### 11. Queue Tests
- `queue_send` inserts message into pgmq
- `queue_read` reads message with visibility timeout
- `queue_archive` archives processed message
- Dead letter queue receives exhausted messages

## RLS Test Matrix

For each table, test the following roles:

| Role | systems | jobs | control_leases | evidence_receipts | workers |
|------|---------|------|----------------|-------------------|---------|
| ANON | DENY | DENY | DENY | DENY | DENY |
| AUTHENTICATED (no org) | DENY | DENY | DENY | DENY | DENY |
| AUTHENTICATED (viewer) | READ | READ | DENY | READ | READ |
| AUTHENTICATED (operator) | READ+WRITE | READ+WRITE | DENY | READ+WRITE | READ |
| AUTHENTICATED (admin) | READ+WRITE | READ+WRITE | DENY | READ+WRITE | READ |
| AUTHENTICATED (owner) | READ+WRITE | READ+WRITE | DENY | READ+WRITE | READ |
| SERVICE_ROLE | ALL | ALL | ALL | ALL | ALL |

### Negative Tests Required
- Viewer cannot INSERT into systems
- Viewer cannot UPDATE systems
- Operator cannot DELETE approvals
- Non-org member cannot READ systems from another org
- `control_leases` denies ALL client access (only service_role via RLS bypass)

## Validation Results

| Test | Status |
|------|--------|
| POSTGRES_SYNTAX | PASS — all `//` replaced with `--`, all `SET search_path = ''` |
| SECURITY_DEFINER_HARDENING | PASS — all 4 lease functions + 3 queue wrappers hardened |
| FUNCTION_GRANTS | PASS — REVOKE FROM PUBLIC, GRANT TO service_role only |
| RLS_MATRIX | PASS — org-scoped policies, no public_read, role-based |
| SUPABASE_QUERY_CONTRACT | PASS — `.eq('system_id', system_id)` not `.eq('system_id, system_id')` |
| VERCEL_WORKFLOW_CURRENT_API | PASS — `"use workflow"` / `"use step"` directives, `sleep` from `workflow` |
| LOCAL_ALPHA_EVENT_WAIT | PASS — durable polling with backoff, no fixed 30s sleep |
| QUEUE_MIGRATION_IDEMPOTENCY | PASS — `DO $$ ... EXCEPTION WHEN OTHERS` wrapping |
| PGMQ_LINEAGE_FIELDS | PASS — `pgmq_message_id` in job_attempts, validation_runs, evidence_receipts |
| BASE44_IDEMPOTENCY_TEST | PASS — CONTROL-LEASE-IDEMPOTENCY-001: 1 winner, 9 idempotent |
| SUPABASE_CONCURRENCY_TEST_STATUS | PENDING — requires Supabase staging infrastructure |
| MIGRATION_DRY_RUN | PENDING — requires Supabase staging |
| ROLLBACK_DRY_RUN | PENDING — requires Supabase staging |

## Phase Gates

| Gate | Status |
|------|--------|
| PHASE_9_11_BRIDGE_PROVEN | PASS — Base44 simulated the architecture |
| PHASE_9_11_ARTIFACTS_HARDENED | PASS — SQL, workflows, workers, contracts hardened |
| PHASE_9_11_INFRASTRUCTURE_DEPLOYED | PENDING — Supabase/Railway/Vercel staging |
| PHASE_9_11_RUNTIME_PROVEN | PENDING — actual off-Base44 execution |
| PHASE_9_11_PARITY_PROVEN | PENDING — new and old systems agree |
| CUTOVER_READY | PENDING — all release gates satisfied |

## Status Language

| Term | Meaning |
|------|---------|
| BRIDGE_PROVEN | Base44 simulated the architecture |
| ARTIFACTS_HARDENED | SQL/workflows/workers pass static audit |
| INFRASTRUCTURE_DEPLOYED | Supabase/Vercel/Railway exist in staging |
| RUNTIME_PROVEN | Actual off-Base44 execution succeeded |
| PARITY_PROVEN | New and old systems agree |
| CUTOVER_READY | All release gates satisfied |

## Three Approval Packets

### APPROVAL A — Supabase Staging
1. Create/apply schema in NON-PRODUCTION Supabase environment
2. Run migrations (001 + 002)
3. Run RLS tests
4. Run atomic lease concurrency (10+ simultaneous transactions)
5. Run queue tests

### APPROVAL B — Railway Staging Worker
1. Deploy ONLY validation-worker initially
2. Connect to staging Supabase
3. Prove real queue claim + receipt
4. Verify worker_id and pgmq_message_id lineage

### APPROVAL C — Vercel Staging Workflow
1. Deploy actual current Workflow SDK implementation
2. Connect to staging Supabase and Railway
3. Prove durable interruption/resume
4. No customer traffic

## Required Progression

```
BASE44 BRIDGE
  → ARTIFACTS HARDENED (current)
  → SUPABASE STAGING (Approval A)
  → RAILWAY STAGING (Approval B)
  → VERCEL STAGING (Approval C)
  → END-TO-END STAGING
  → PARITY PROVEN
  → PRODUCTION APPROVAL
``