// ════════════════════════════════════════════════════════════════
// Supabase Migration SQL Chunks
// Exports the hardened migration SQL as executable chunks for deployment
// to the canonical Supabase project (Xtreme OS: msnsyhpakeujypqxugpz).
// ════════════════════════════════════════════════════════════════

export const SUPABASE_PROJECT_REF = 'msnsyhpakeujypqxugpz';

export const MIGRATION_CHUNKS: { name: string; sql: string }[] = [
  // ── Chunk 1: Extensions ──
  {
    name: 'extensions',
    sql: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS pgmq;
CREATE EXTENSION IF NOT EXISTS pgmq;`
  },

  // ── Chunk 2: Organization tables ──
  {
    name: 'org_tables',
    sql: `CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner','admin','operator','builder','viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(org_id);`
  },

  // ── Chunk 3: resolve_org_role function ──
  {
    name: 'resolve_org_role',
    sql: `CREATE OR REPLACE FUNCTION public.resolve_org_role(p_org_id TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_role TEXT;
BEGIN
  SELECT om.role INTO v_role FROM public.organization_members om
  WHERE om.org_id = p_org_id AND om.user_id = auth.uid() AND om.status = 'active' LIMIT 1;
  RETURN v_role;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.resolve_org_role(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_org_role(TEXT) TO service_role, authenticated;`
  },

  // ── Chunk 4: Core tables ──
  {
    name: 'core_tables',
    sql: `CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  name TEXT NOT NULL, description TEXT, system_type TEXT NOT NULL DEFAULT 'website',
  business_purpose TEXT, repository TEXT, default_branch TEXT DEFAULT 'main',
  vercel_project TEXT, railway_project TEXT, supabase_project TEXT,
  domains TEXT[] DEFAULT '{}', drive_root TEXT, owner TEXT, priority TEXT DEFAULT 'medium',
  lifecycle TEXT DEFAULT 'bootstrap', current_mode TEXT DEFAULT 'bootstrap',
  global_score NUMERIC DEFAULT 0, distance_to_100 NUMERIC DEFAULT 100,
  p0_count INT DEFAULT 0, p1_count INT DEFAULT 0, total_benchmarks INT DEFAULT 0,
  passing_benchmarks INT DEFAULT 0, failing_benchmarks INT DEFAULT 0, unknown_benchmarks INT DEFAULT 0,
  source_parity TEXT DEFAULT 'unknown', deployment_parity TEXT DEFAULT 'unknown',
  consecutive_pass_cycles INT DEFAULT 0, required_consecutive_passes INT DEFAULT 3,
  last_full_cycle TIMESTAMPTZ, next_full_cycle TIMESTAMPTZ, active BOOLEAN DEFAULT true,
  base44_app_id TEXT, base44_app_slug TEXT, migration_status TEXT DEFAULT 'native',
  manifest TEXT, environment TEXT DEFAULT 'production', source_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_systems_org ON public.systems(organization_id);

CREATE TABLE IF NOT EXISTS operator_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, operator_input TEXT NOT NULL,
  interpreted_objective TEXT, scope TEXT DEFAULT 'query', priority TEXT DEFAULT 'medium',
  constraints TEXT[] DEFAULT '{}', risk TEXT DEFAULT 'low', target_benchmarks TEXT[] DEFAULT '{}',
  approval_policy TEXT DEFAULT 'auto', status TEXT DEFAULT 'pending', result TEXT,
  correlation_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), executed_at TIMESTAMPTZ,
  environment TEXT DEFAULT 'production', source_version TEXT
);
CREATE INDEX IF NOT EXISTS idx_intents_org ON public.operator_intents(organization_id);
CREATE INDEX IF NOT EXISTS idx_intents_status ON public.operator_intents(status);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, job_type TEXT NOT NULL, priority TEXT DEFAULT 'normal',
  payload JSONB DEFAULT '{}', correlation_id TEXT, parent_job_id TEXT,
  intent_id TEXT, repair_id TEXT, benchmark_id TEXT,
  required_worker_type TEXT NOT NULL, required_capabilities TEXT[] DEFAULT '{}',
  attempt INT DEFAULT 0, max_attempts INT DEFAULT 3, timeout_seconds INT DEFAULT 300,
  idempotency_key TEXT NOT NULL, risk_class TEXT DEFAULT 'low', approval_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'queued', claimed_by TEXT, lease_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), available_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(), environment TEXT DEFAULT 'production', source_version TEXT
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_system ON public.jobs(system_id);
CREATE INDEX IF NOT EXISTS idx_jobs_worker_type ON public.jobs(required_worker_type, status);
CREATE INDEX IF NOT EXISTS idx_jobs_org ON public.jobs(organization_id);

CREATE TABLE IF NOT EXISTS job_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL, worker_id TEXT, pgmq_message_id BIGINT,
  attempt INT, status TEXT, error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ, duration_ms INT
);
CREATE INDEX IF NOT EXISTS idx_job_attempts_job ON public.job_attempts(job_id);
CREATE INDEX IF NOT EXISTS idx_job_attempts_worker ON public.job_attempts(worker_id);

CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, benchmark_pack_id TEXT, validator_id TEXT,
  category TEXT NOT NULL, name TEXT NOT NULL, description TEXT,
  target TEXT, measurement TEXT, comparator TEXT, severity TEXT DEFAULT 'P1',
  mandatory BOOLEAN DEFAULT true, environment TEXT DEFAULT 'production',
  data_source TEXT, validator TEXT, evidence_required BOOLEAN DEFAULT true,
  freshness_requirement TEXT, auto_repair_allowed BOOLEAN DEFAULT true,
  benchmark_version TEXT DEFAULT '1.0', standard_source TEXT, enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(benchmark_id, system_id)
);
CREATE INDEX IF NOT EXISTS idx_benchmarks_org ON public.benchmarks(organization_id);

CREATE TABLE IF NOT EXISTS benchmark_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, cycle_id TEXT, target TEXT, actual TEXT, delta TEXT,
  status TEXT DEFAULT 'unknown', severity TEXT, mandatory BOOLEAN DEFAULT true,
  evidence_receipt_id TEXT, measured_at TIMESTAMPTZ DEFAULT NOW(), validator TEXT,
  details TEXT, failure_reasons TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_benchmark_results_system ON public.benchmark_results(system_id, benchmark_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_results_org ON public.benchmark_results(organization_id);

CREATE TABLE IF NOT EXISTS optimization_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, benchmark_id TEXT NOT NULL, cycle_id TEXT,
  target TEXT, actual TEXT, delta TEXT, severity TEXT NOT NULL,
  business_impact TEXT DEFAULT 'medium', confidence NUMERIC DEFAULT 0.5,
  estimated_effort TEXT DEFAULT 'medium', estimated_cost TEXT DEFAULT 'low',
  change_risk TEXT DEFAULT 'low', dependencies TEXT[] DEFAULT '{}',
  repair_priority_score NUMERIC, status TEXT DEFAULT 'open', repair_job_id TEXT,
  last_seen TIMESTAMPTZ, occurrence_count INT DEFAULT 1, latest_cycle TEXT,
  latest_evidence TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gaps_org ON public.optimization_gaps(organization_id);

CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, benchmark_id TEXT NOT NULL, gap_id TEXT,
  failure_fingerprint TEXT, root_cause TEXT, affected_system TEXT,
  affected_files TEXT[] DEFAULT '{}', affected_entities TEXT[] DEFAULT '{}',
  reproduction_steps TEXT, expected_state TEXT, observed_state TEXT,
  implementation_plan TEXT, assigned_specialist TEXT, risk TEXT DEFAULT 'low',
  rollback TEXT, acceptance_test TEXT, regression_test TEXT,
  postcondition_validator TEXT, status TEXT DEFAULT 'queued',
  implementer TEXT, validator TEXT, release_authority TEXT,
  approval_required BOOLEAN DEFAULT false, approval_packet_id TEXT,
  claimed_by TEXT, lease_expires_at TIMESTAMPTZ, attempt_count INT DEFAULT 0,
  last_heartbeat_at TIMESTAMPTZ, occurrence_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_repairs_org ON public.repairs(organization_id);

CREATE TABLE IF NOT EXISTS evidence_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, benchmark_id TEXT, cycle_id TEXT,
  evidence_type TEXT NOT NULL, evidence_url TEXT, evidence_description TEXT,
  evidence_data TEXT, verified_at TIMESTAMPTZ DEFAULT NOW(), verified_by TEXT,
  worker_id TEXT, pgmq_message_id BIGINT, valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_receipts_org ON public.evidence_receipts(organization_id);

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT UNIQUE NOT NULL,
  organization_id TEXT REFERENCES public.organizations(org_id),
  worker_type TEXT NOT NULL, version TEXT, capabilities TEXT[] DEFAULT '{}',
  environment TEXT DEFAULT 'production', status TEXT DEFAULT 'active',
  current_job TEXT, load NUMERIC DEFAULT 0, last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  registered_at TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workers_org ON public.workers(organization_id);

CREATE TABLE IF NOT EXISTS fleet_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heartbeat_id TEXT UNIQUE NOT NULL,
  organization_id TEXT REFERENCES public.organizations(org_id),
  cycle_id TEXT NOT NULL, scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, duration_ms INT,
  lock_acquired BOOLEAN DEFAULT false, systems_checked INT DEFAULT 0,
  intents_routed INT DEFAULT 0, jobs_dispatched INT DEFAULT 0, jobs_failed INT DEFAULT 0,
  systems_degraded INT DEFAULT 0, approvals_detected INT DEFAULT 0,
  worker_health TEXT DEFAULT 'not_deployed', queue_health TEXT DEFAULT 'not_deployed',
  fleet_score NUMERIC DEFAULT 0, errors TEXT[] DEFAULT '{}', receipt_id TEXT,
  status TEXT DEFAULT 'completed', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'open',
  related_job_id TEXT, related_repair_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incidents_org ON public.incidents(organization_id);

CREATE TABLE IF NOT EXISTS regression_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, failure_fingerprint TEXT, benchmark_id TEXT,
  original_test TEXT, repair_id TEXT, regression_test TEXT, affected_benchmark TEXT,
  validator TEXT, status TEXT DEFAULT 'active', last_run_at TIMESTAMPTZ,
  last_result TEXT DEFAULT 'not_run', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS control_leases (
  lock_key TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES public.organizations(org_id),
  owner_id TEXT NOT NULL, cycle_id TEXT,
  acquired_at TIMESTAMPTZ DEFAULT NOW(), heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  lease_expires_at TIMESTAMPTZ NOT NULL, released_at TIMESTAMPTZ,
  status TEXT DEFAULT 'held', version INT DEFAULT 1, idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // ── Chunk 5: Lease functions ──
  {
    name: 'lease_functions',
    sql: `CREATE OR REPLACE FUNCTION public.acquire_control_lease(
  p_lock_key TEXT, p_owner_id TEXT, p_cycle_id TEXT DEFAULT NULL,
  p_lease_duration_seconds INT DEFAULT 300, p_idempotency_key TEXT DEFAULT NULL
) RETURNS TABLE(acquired BOOLEAN, owner_id TEXT, lease_expires_at TIMESTAMPTZ, status TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_expires_at TIMESTAMPTZ := NOW() + make_interval(secs => p_lease_duration_seconds);
  v_existing_status TEXT; v_existing_expires TIMESTAMPTZ; v_existing_owner TEXT;
BEGIN
  BEGIN
    INSERT INTO public.control_leases (lock_key, owner_id, cycle_id, acquired_at, heartbeat_at, lease_expires_at, status, version, idempotency_key)
    VALUES (p_lock_key, p_owner_id, p_cycle_id, NOW(), NOW(), v_expires_at, 'held', 1, p_idempotency_key);
    RETURN QUERY SELECT TRUE, p_owner_id, v_expires_at, 'acquired'::TEXT;
    RETURN;
  EXCEPTION WHEN unique_violation THEN
    SELECT cl.status, cl.lease_expires_at, cl.owner_id INTO v_existing_status, v_existing_expires, v_existing_owner
    FROM public.control_leases cl WHERE cl.lock_key = p_lock_key FOR UPDATE;
    IF v_existing_status IN ('released','expired','stale') OR (v_existing_expires IS NOT NULL AND v_existing_expires < NOW()) THEN
      UPDATE public.control_leases SET owner_id = p_owner_id, cycle_id = p_cycle_id,
        acquired_at = NOW(), heartbeat_at = NOW(), lease_expires_at = v_expires_at,
        status = 'held', version = version + 1, idempotency_key = p_idempotency_key, updated_at = NOW()
      WHERE lock_key = p_lock_key;
      RETURN QUERY SELECT TRUE, p_owner_id, v_expires_at, 'reacquired'::TEXT;
      RETURN;
    ELSE
      RETURN QUERY SELECT FALSE, v_existing_owner, v_existing_expires, 'lock_not_acquired'::TEXT;
      RETURN;
    END IF;
  END;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.acquire_control_lease(TEXT, TEXT, TEXT, INT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_control_lease(TEXT, TEXT, TEXT, INT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.release_control_lease(p_lock_key TEXT, p_owner_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.control_leases SET status = 'released', released_at = NOW(), heartbeat_at = NOW(), updated_at = NOW()
  WHERE lock_key = p_lock_key AND owner_id = p_owner_id AND status = 'held';
  RETURN FOUND;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.release_control_lease(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_control_lease(TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.heartbeat_control_lease(p_lock_key TEXT, p_owner_id TEXT, p_extend_seconds INT DEFAULT 300)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.control_leases SET heartbeat_at = NOW(),
    lease_expires_at = NOW() + make_interval(secs => p_extend_seconds), updated_at = NOW()
  WHERE lock_key = p_lock_key AND owner_id = p_owner_id AND status = 'held';
  RETURN FOUND;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.heartbeat_control_lease(TEXT, TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_control_lease(TEXT, TEXT, INT) TO service_role;

CREATE OR REPLACE FUNCTION public.expire_stale_leases()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_count INT;
BEGIN
  UPDATE public.control_leases SET status = 'expired', updated_at = NOW()
  WHERE status = 'held' AND lease_expires_at < NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.expire_stale_leases() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_leases() TO service_role;`
  },

  // ── Chunk 6: Queue wrapper functions ──
  {
    name: 'queue_wrappers',
    sql: `CREATE OR REPLACE FUNCTION public.queue_send(p_queue_name TEXT, p_msg JSONB)
RETURNS BIGINT LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT pgmq.send(p_queue_name, p_msg);
$$;
REVOKE EXECUTE ON FUNCTION public.queue_send(TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_send(TEXT, JSONB) TO service_role;

CREATE OR REPLACE FUNCTION public.queue_read(p_queue_name TEXT, p_vt_seconds INT DEFAULT 300)
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT row_to_json(t)::jsonb FROM (SELECT * FROM pgmq.read(p_queue_name, p_vt_seconds, 1) LIMIT 1) t;
$$;
REVOKE EXECUTE ON FUNCTION public.queue_read(TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_read(TEXT, INT) TO service_role;

CREATE OR REPLACE FUNCTION public.queue_archive(p_queue_name TEXT, p_msg_id BIGINT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT pgmq.archive(p_queue_name, p_msg_id);
$$;
REVOKE EXECUTE ON FUNCTION public.queue_archive(TEXT, BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.queue_archive(TEXT, BIGINT) TO service_role;`
  },

  // ── Chunk 7: Additional tables ──
  {
    name: 'additional_tables',
    sql: `CREATE TABLE IF NOT EXISTS cost_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, cycle_id TEXT, provider TEXT, model TEXT,
  credits_used NUMERIC DEFAULT 0, cost_usd NUMERIC DEFAULT 0, operation TEXT,
  correlation_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cost_events_org ON public.cost_events(organization_id);

CREATE TABLE IF NOT EXISTS validation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, job_id TEXT, repair_id TEXT, benchmark_id TEXT,
  validation_type TEXT NOT NULL, target_url TEXT, expected_state TEXT, actual_state TEXT,
  status TEXT DEFAULT 'pending', evidence_receipt_id TEXT, details TEXT,
  validated_at TIMESTAMPTZ, validated_by TEXT, worker_id TEXT, pgmq_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_validation_runs_org ON public.validation_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_validation_runs_worker ON public.validation_runs(worker_id);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  action_type TEXT NOT NULL, description TEXT NOT NULL, risk TEXT DEFAULT 'medium',
  payload JSONB DEFAULT '{}', status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(), approved_at TIMESTAMPTZ, approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approvals_org ON public.approvals(organization_id);

CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, artifact_type TEXT NOT NULL,
  url TEXT, path TEXT, hash TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_artifacts_org ON public.artifacts(organization_id);

CREATE TABLE IF NOT EXISTS failure_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL, failure_fingerprint TEXT NOT NULL, benchmark_id TEXT,
  pattern TEXT, occurrence_count INT DEFAULT 1, last_seen TIMESTAMPTZ DEFAULT NOW(),
  root_cause TEXT, resolution TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(system_id, failure_fingerprint)
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT REFERENCES public.organizations(org_id),
  system_id TEXT, source_type TEXT, source_url TEXT, title TEXT, content TEXT,
  provenance TEXT, verified BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT REFERENCES public.organizations(org_id),
  system_id TEXT, event_type TEXT, key TEXT, value JSONB, ttl_seconds INT,
  expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // ── Chunk 8: RLS enable ──
  {
    name: 'rls_enable',
    sql: `ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failure_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regression_tests ENABLE ROW LEVEL SECURITY;`
  },

  // ── Chunk 9: RLS policies (key ones) ──
  {
    name: 'rls_policies',
    sql: `DROP POLICY IF EXISTS org_member_read ON public.organizations;
CREATE POLICY org_member_read ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = organizations.org_id AND om.user_id = auth.uid() AND om.status = 'active')
);
DROP POLICY IF EXISTS systems_org_read ON public.systems;
CREATE POLICY systems_org_read ON public.systems FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = systems.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
);
DROP POLICY IF EXISTS systems_org_write ON public.systems;
CREATE POLICY systems_org_write ON public.systems FOR ALL USING (
  public.resolve_org_role(systems.organization_id) IN ('owner','admin','operator','builder')
) WITH CHECK (
  public.resolve_org_role(systems.organization_id) IN ('owner','admin','operator','builder')
);
DROP POLICY IF EXISTS leases_deny_client ON public.control_leases;
CREATE POLICY leases_deny_client ON public.control_leases FOR ALL USING (false) WITH CHECK (false);`
  },

  // ── Chunk 10: pgmq queues (idempotent) ──
  {
    name: 'queues',
    sql: `DO $$ BEGIN PERFORM pgmq.create('discovery_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('audit_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('research_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('coding_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('browser_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('repair_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('validation_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('deployment_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('knowledge_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('incident_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('dead_letter'); EXCEPTION WHEN OTHERS THEN NULL; END $$;`
  },
];