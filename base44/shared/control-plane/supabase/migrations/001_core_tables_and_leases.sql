-- ════════════════════════════════════════════════════════════════
-- XTREME Control Plane — Migration 001: Core Tables + Atomic Lease
-- Target: Supabase Postgres
-- Status: APPROVAL REQUIRED (production migration)
-- ════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgmq" SCHEMA "pgmq";

-- ── systems ──
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_type TEXT NOT NULL DEFAULT 'website',
  business_purpose TEXT,
  repository TEXT,
  default_branch TEXT DEFAULT 'main',
  vercel_project TEXT,
  railway_project TEXT,
  supabase_project TEXT,
  domains TEXT[] DEFAULT '{}',
  drive_root TEXT,
  owner TEXT,
  priority TEXT DEFAULT 'medium',
  lifecycle TEXT DEFAULT 'bootstrap',
  current_mode TEXT DEFAULT 'bootstrap',
  global_score NUMERIC DEFAULT 0,
  distance_to_100 NUMERIC DEFAULT 100,
  p0_count INT DEFAULT 0,
  p1_count INT DEFAULT 0,
  total_benchmarks INT DEFAULT 0,
  passing_benchmarks INT DEFAULT 0,
  failing_benchmarks INT DEFAULT 0,
  unknown_benchmarks INT DEFAULT 0,
  source_parity TEXT DEFAULT 'unknown',
  deployment_parity TEXT DEFAULT 'unknown',
  consecutive_pass_cycles INT DEFAULT 0,
  required_consecutive_passes INT DEFAULT 3,
  last_full_cycle TIMESTAMPTZ,
  next_full_cycle TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  base44_app_id TEXT,
  base44_app_slug TEXT,
  migration_status TEXT DEFAULT 'native',
  manifest TEXT,
  environment TEXT DEFAULT 'production',
  source_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── operator_intents ──
CREATE TABLE IF NOT EXISTS operator_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  operator_input TEXT NOT NULL,
  interpreted_objective TEXT,
  scope TEXT DEFAULT 'query',
  priority TEXT DEFAULT 'medium',
  constraints TEXT[] DEFAULT '{}',
  risk TEXT DEFAULT 'low',
  target_benchmarks TEXT[] DEFAULT '{}',
  approval_policy TEXT DEFAULT 'auto',
  status TEXT DEFAULT 'pending',
  result TEXT,
  correlation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  environment TEXT DEFAULT 'production',
  source_version TEXT
);

-- ── jobs ──
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  payload JSONB DEFAULT '{}',
  correlation_id TEXT,
  parent_job_id TEXT,
  intent_id TEXT,
  repair_id TEXT,
  benchmark_id TEXT,
  required_worker_type TEXT NOT NULL,
  required_capabilities TEXT[] DEFAULT '{}',
  attempt INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  timeout_seconds INT DEFAULT 300,
  idempotency_key TEXT NOT NULL,
  risk_class TEXT DEFAULT 'low',
  approval_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'queued',
  claimed_by TEXT,
  lease_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  available_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  environment TEXT DEFAULT 'production',
  source_version TEXT
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_system ON jobs(system_id);
CREATE INDEX IF NOT EXISTS idx_jobs_worker_type ON jobs(required_worker_type, status);

-- ── job_attempts ──
CREATE TABLE IF NOT EXISTS job_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL,
  worker_id TEXT,
  attempt INT,
  status TEXT,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT
);

-- ── benchmarks ──
CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id TEXT NOT NULL,
  system_id TEXT NOT NULL,
  benchmark_pack_id TEXT,
  validator_id TEXT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target TEXT,
  measurement TEXT,
  comparator TEXT,
  severity TEXT DEFAULT 'P1',
  mandatory BOOLEAN DEFAULT true,
  environment TEXT DEFAULT 'production',
  data_source TEXT,
  validator TEXT,
  evidence_required BOOLEAN DEFAULT true,
  freshness_requirement TEXT,
  auto_repair_allowed BOOLEAN DEFAULT true,
  benchmark_version TEXT DEFAULT '1.0',
  standard_source TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(benchmark_id, system_id)
);

-- ── benchmark_results ──
CREATE TABLE IF NOT EXISTS benchmark_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id TEXT NOT NULL,
  system_id TEXT NOT NULL,
  cycle_id TEXT,
  target TEXT,
  actual TEXT,
  delta TEXT,
  status TEXT DEFAULT 'unknown',
  severity TEXT,
  mandatory BOOLEAN DEFAULT true,
  evidence_receipt_id TEXT,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  validator TEXT,
  details TEXT,
  failure_reasons TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmark_results_system ON benchmark_results(system_id, benchmark_id);

-- ── optimization_gaps ──
CREATE TABLE IF NOT EXISTS optimization_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  benchmark_id TEXT NOT NULL,
  cycle_id TEXT,
  target TEXT,
  actual TEXT,
  delta TEXT,
  severity TEXT NOT NULL,
  business_impact TEXT DEFAULT 'medium',
  confidence NUMERIC DEFAULT 0.5,
  estimated_effort TEXT DEFAULT 'medium',
  estimated_cost TEXT DEFAULT 'low',
  change_risk TEXT DEFAULT 'low',
  dependencies TEXT[] DEFAULT '{}',
  repair_priority_score NUMERIC,
  status TEXT DEFAULT 'open',
  repair_job_id TEXT,
  last_seen TIMESTAMPTZ,
  occurrence_count INT DEFAULT 1,
  latest_cycle TEXT,
  latest_evidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── repairs ──
CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  benchmark_id TEXT NOT NULL,
  gap_id TEXT,
  failure_fingerprint TEXT,
  root_cause TEXT,
  affected_system TEXT,
  affected_files TEXT[] DEFAULT '{}',
  affected_entities TEXT[] DEFAULT '{}',
  reproduction_steps TEXT,
  expected_state TEXT,
  observed_state TEXT,
  implementation_plan TEXT,
  assigned_specialist TEXT,
  risk TEXT DEFAULT 'low',
  rollback TEXT,
  acceptance_test TEXT,
  regression_test TEXT,
  postcondition_validator TEXT,
  status TEXT DEFAULT 'queued',
  implementer TEXT,
  validator TEXT,
  release_authority TEXT,
  approval_required BOOLEAN DEFAULT false,
  approval_packet_id TEXT,
  claimed_by TEXT,
  lease_expires_at TIMESTAMPTZ,
  attempt_count INT DEFAULT 0,
  last_heartbeat_at TIMESTAMPTZ,
  occurrence_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── evidence_receipts ──
CREATE TABLE IF NOT EXISTS evidence_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  benchmark_id TEXT,
  cycle_id TEXT,
  evidence_type TEXT NOT NULL,
  evidence_url TEXT,
  evidence_description TEXT,
  evidence_data TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── workers ──
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT UNIQUE NOT NULL,
  worker_type TEXT NOT NULL,
  version TEXT,
  capabilities TEXT[] DEFAULT '{}',
  environment TEXT DEFAULT 'production',
  status TEXT DEFAULT 'active',
  current_job TEXT,
  load NUMERIC DEFAULT 0,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── fleet_heartbeats ──
CREATE TABLE IF NOT EXISTS fleet_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heartbeat_id TEXT UNIQUE NOT NULL,
  cycle_id TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  lock_acquired BOOLEAN DEFAULT false,
  systems_checked INT DEFAULT 0,
  intents_routed INT DEFAULT 0,
  jobs_dispatched INT DEFAULT 0,
  jobs_failed INT DEFAULT 0,
  systems_degraded INT DEFAULT 0,
  approvals_detected INT DEFAULT 0,
  worker_health TEXT DEFAULT 'not_deployed',
  queue_health TEXT DEFAULT 'not_deployed',
  fleet_score NUMERIC DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  receipt_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── incidents ──
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  related_job_id TEXT,
  related_repair_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── regression_tests ──
CREATE TABLE IF NOT EXISTS regression_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  failure_fingerprint TEXT,
  benchmark_id TEXT,
  original_test TEXT,
  repair_id TEXT,
  regression_test TEXT,
  affected_benchmark TEXT,
  validator TEXT,
  status TEXT DEFAULT 'active',
  last_run_at TIMESTAMPTZ,
  last_result TEXT DEFAULT 'not_run',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- PERMANENT ATOMIC LEASE — control_leases
// ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS control_leases (
  lock_key TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  cycle_id TEXT,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  lease_expires_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  status TEXT DEFAULT 'held',
  version INT DEFAULT 1,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- acquire_control_lease — Transactional Atomic Lock Acquisition
-- Never use application-level SELECT-then-INSERT.
// ════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION acquire_control_lease(
  p_lock_key TEXT,
  p_owner_id TEXT,
  p_cycle_id TEXT DEFAULT NULL,
  p_lease_duration_seconds INT DEFAULT 300,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS TABLE(acquired BOOLEAN, owner_id TEXT, lease_expires_at TIMESTAMPTZ, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expires_at TIMESTAMPTZ := NOW() + make_interval(secs => p_lease_duration_seconds);
  v_existing control_leases%ROWTYPE;
BEGIN
  -- Attempt 1: INSERT new lease (atomic — PK uniqueness)
  BEGIN
    INSERT INTO control_leases (lock_key, owner_id, cycle_id, acquired_at, heartbeat_at, lease_expires_at, status, version, idempotency_key)
    VALUES (p_lock_key, p_owner_id, p_cycle_id, NOW(), NOW(), v_expires_at, 'held', 1, p_idempotency_key);

    RETURN QUERY SELECT TRUE, p_owner_id, v_expires_at, 'acquired'::TEXT;
    RETURN;
  EXCEPTION WHEN unique_violation THEN
    -- Lock exists — check if re-acquirable
    SELECT * INTO v_existing FROM control_leases WHERE lock_key = p_lock_key FOR UPDATE;

    IF v_existing.status IN ('released', 'expired', 'stale')
       OR (v_existing.lease_expires_at IS NOT NULL AND v_existing.lease_expires_at < NOW()) THEN
      -- Re-acquire expired/released lease
      UPDATE control_leases
      SET owner_id = p_owner_id, cycle_id = p_cycle_id, acquired_at = NOW(),
          heartbeat_at = NOW(), lease_expires_at = v_expires_at, status = 'held',
          version = version + 1, idempotency_key = p_idempotency_key, updated_at = NOW()
      WHERE lock_key = p_lock_key AND ctid = v_existing.ctid;

      RETURN QUERY SELECT TRUE, p_owner_id, v_expires_at, 'reacquired'::TEXT;
      RETURN;
    ELSE
      -- Lock held by another owner
      RETURN QUERY SELECT FALSE, v_existing.owner_id, v_existing.lease_expires_at, 'lock_not_acquired'::TEXT;
      RETURN;
    END IF;
  END;
END;
$$;

-- Release lease
CREATE OR REPLACE FUNCTION release_control_lease(p_lock_key TEXT, p_owner_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE control_leases
  SET status = 'released', released_at = NOW(), heartbeat_at = NOW(), updated_at = NOW()
  WHERE lock_key = p_lock_key AND owner_id = p_owner_id AND status = 'held';
  RETURN FOUND;
END;
$$;

-- Heartbeat lease
CREATE OR REPLACE FUNCTION heartbeat_control_lease(p_lock_key TEXT, p_owner_id TEXT, p_extend_seconds INT DEFAULT 300)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE control_leases
  SET heartbeat_at = NOW(), lease_expires_at = NOW() + make_interval(secs => p_extend_seconds), updated_at = NOW()
  WHERE lock_key = p_lock_key AND owner_id = p_owner_id AND status = 'held';
  RETURN FOUND;
END;
$$;

-- Auto-expire stale leases
CREATE OR REPLACE FUNCTION expire_stale_leases()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE control_leases
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'held' AND lease_expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;