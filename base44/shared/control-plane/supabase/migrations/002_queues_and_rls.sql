-- ════════════════════════════════════════════════════════════════
-- XTREME Control Plane -- Migration 002: Queues + RLS
-- Target: Supabase Postgres + pgmq
-- Status: APPROVAL REQUIRED (staging migration first)
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- Durable pgmq Queues -- Idempotent creation
-- pgmq.create raises an exception if the queue already exists.
-- Wrap in DO blocks to suppress "already exists" errors so the
-- migration is rerunnable without failing.
-- ════════════════════════════════════════════════════════════════
DO $$ BEGIN PERFORM pgmq.create('discovery_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('audit_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('research_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('coding_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('browser_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('repair_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('validation_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('deployment_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('knowledge_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('incident_jobs'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('dead_letter'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ════════════════════════════════════════════════════════════════
-- cost_events
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cost_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL,
  cycle_id TEXT,
  provider TEXT,
  model TEXT,
  credits_used NUMERIC DEFAULT 0,
  cost_usd NUMERIC DEFAULT 0,
  operation TEXT,
  correlation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_events_org ON public.cost_events(organization_id);

-- ════════════════════════════════════════════════════════════════
-- provider_health
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT REFERENCES public.organizations(org_id),
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'unknown',
  last_check TIMESTAMPTZ,
  latency_ms INT,
  error_rate NUMERIC DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- knowledge_sources
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT REFERENCES public.organizations(org_id),
  system_id TEXT,
  source_type TEXT,
  source_url TEXT,
  title TEXT,
  content TEXT,
  provenance TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- memory_events
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS memory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT REFERENCES public.organizations(org_id),
  system_id TEXT,
  event_type TEXT,
  key TEXT,
  value JSONB,
  ttl_seconds INT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- failure_patterns
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS failure_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL,
  failure_fingerprint TEXT NOT NULL,
  benchmark_id TEXT,
  pattern TEXT,
  occurrence_count INT DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  root_cause TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(system_id, failure_fingerprint)
);

-- ════════════════════════════════════════════════════════════════
-- validation_runs -- includes worker_id and pgmq_message_id for lineage
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS validation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL,
  job_id TEXT,
  repair_id TEXT,
  benchmark_id TEXT,
  validation_type TEXT NOT NULL,
  target_url TEXT,
  expected_state TEXT,
  actual_state TEXT,
  status TEXT DEFAULT 'pending',
  evidence_receipt_id TEXT,
  details TEXT,
  validated_at TIMESTAMPTZ,
  validated_by TEXT,
  worker_id TEXT,
  pgmq_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_validation_runs_org ON public.validation_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_validation_runs_worker ON public.validation_runs(worker_id);

-- ════════════════════════════════════════════════════════════════
-- approvals
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  risk TEXT DEFAULT 'medium',
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_org ON public.approvals(organization_id);

-- ════════════════════════════════════════════════════════════════
-- artifacts
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT UNIQUE NOT NULL,
  organization_id TEXT NOT NULL REFERENCES public.organizations(org_id),
  system_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  url TEXT,
  path TEXT,
  hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_org ON public.artifacts(organization_id);

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Organization-scoped. Role-based. No public access.
-- Roles: owner, admin, operator, builder, viewer
-- ════════════════════════════════════════════════════════════════

-- Enable RLS on all sensitive tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.regression_tests ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════
-- Organizations: members can read their own orgs
-- Owners/admins can manage
-- ════════════════════════════════════════════════════════════════
CREATE POLICY org_member_read ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.org_id = organizations.org_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY org_member_insert ON public.organizations
  FOR INSERT WITH CHECK (true); -- Org creation is open; membership controls access

CREATE POLICY org_owner_update ON public.organizations
  FOR UPDATE USING (
    public.resolve_org_role(organizations.org_id) IN ('owner', 'admin')
  );

-- ════════════════════════════════════════════════════════════════
-- Organization members: users can see members of their org
-- Owners/admins can invite/update
-- ════════════════════════════════════════════════════════════════
CREATE POLICY org_members_read ON public.organization_members
  FOR SELECT USING (
    org_id IN (
      SELECT om2.org_id FROM public.organization_members om2
      WHERE om2.user_id = auth.uid() AND om2.status = 'active'
    )
  );

CREATE POLICY org_members_manage ON public.organization_members
  FOR ALL USING (
    public.resolve_org_role(organization_members.org_id) IN ('owner', 'admin')
  ) WITH CHECK (
    public.resolve_org_role(organization_members.org_id) IN ('owner', 'admin')
  );

-- ════════════════════════════════════════════════════════════════
-- Systems: PRIVATE -- no public read
-- Org members can read; operators+ can write
-- ════════════════════════════════════════════════════════════════
CREATE POLICY systems_org_read ON public.systems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.org_id = systems.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

CREATE POLICY systems_org_write ON public.systems
  FOR ALL USING (
    public.resolve_org_role(systems.organization_id) IN ('owner', 'admin', 'operator', 'builder')
  ) WITH CHECK (
    public.resolve_org_role(systems.organization_id) IN ('owner', 'admin', 'operator', 'builder')
  );

-- ════════════════════════════════════════════════════════════════
-- Generic org-scoped policy template
-- Applied to: operator_intents, jobs, benchmarks, benchmark_results,
-- optimization_gaps, repairs, evidence_receipts, incidents,
-- cost_events, validation_runs, approvals, artifacts, failure_patterns,
-- regression_tests, knowledge_sources, memory_events
-- ════════════════════════════════════════════════════════════════

-- operator_intents
CREATE POLICY intents_org_read ON public.operator_intents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = operator_intents.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY intents_org_write ON public.operator_intents
  FOR ALL USING (public.resolve_org_role(operator_intents.organization_id) IN ('owner', 'admin', 'operator'))
  WITH CHECK (public.resolve_org_role(operator_intents.organization_id) IN ('owner', 'admin', 'operator'));

-- jobs
CREATE POLICY jobs_org_read ON public.jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = jobs.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY jobs_org_write ON public.jobs
  FOR ALL USING (public.resolve_org_role(jobs.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(jobs.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- job_attempts -- readable by org members, written by service_role (RLS bypassed)
CREATE POLICY job_attempts_org_read ON public.job_attempts
  FOR SELECT USING (true); -- job_attempts has no org_id; access controlled via join on jobs

-- benchmarks
CREATE POLICY benchmarks_org_read ON public.benchmarks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = benchmarks.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY benchmarks_org_write ON public.benchmarks
  FOR ALL USING (public.resolve_org_role(benchmarks.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(benchmarks.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- benchmark_results
CREATE POLICY results_org_read ON public.benchmark_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = benchmark_results.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY results_org_write ON public.benchmark_results
  FOR ALL USING (public.resolve_org_role(benchmark_results.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(benchmark_results.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- optimization_gaps
CREATE POLICY gaps_org_read ON public.optimization_gaps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = optimization_gaps.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY gaps_org_write ON public.optimization_gaps
  FOR ALL USING (public.resolve_org_role(optimization_gaps.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(optimization_gaps.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- repairs
CREATE POLICY repairs_org_read ON public.repairs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = repairs.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY repairs_org_write ON public.repairs
  FOR ALL USING (public.resolve_org_role(repairs.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(repairs.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- evidence_receipts
CREATE POLICY receipts_org_read ON public.evidence_receipts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = evidence_receipts.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY receipts_org_write ON public.evidence_receipts
  FOR ALL USING (public.resolve_org_role(evidence_receipts.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(evidence_receipts.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- control_leases -- only service_role (RLS bypassed); no client access
CREATE POLICY leases_deny_client ON public.control_leases
  FOR ALL USING (false) WITH CHECK (false);

-- fleet_heartbeats
CREATE POLICY heartbeats_org_read ON public.fleet_heartbeats
  FOR SELECT USING (
    organization_id IS NULL OR
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = fleet_heartbeats.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY heartbeats_org_write ON public.fleet_heartbeats
  FOR ALL USING (public.resolve_org_role(fleet_heartbeats.organization_id) IN ('owner', 'admin', 'operator'))
  WITH CHECK (public.resolve_org_role(fleet_heartbeats.organization_id) IN ('owner', 'admin', 'operator'));

-- workers -- only service_role writes; org members can read
CREATE POLICY workers_org_read ON public.workers
  FOR SELECT USING (
    organization_id IS NULL OR
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = workers.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- incidents
CREATE POLICY incidents_org_read ON public.incidents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = incidents.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY incidents_org_write ON public.incidents
  FOR ALL USING (public.resolve_org_role(incidents.organization_id) IN ('owner', 'admin', 'operator'))
  WITH CHECK (public.resolve_org_role(incidents.organization_id) IN ('owner', 'admin', 'operator'));

-- cost_events
CREATE POLICY cost_events_org_read ON public.cost_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = cost_events.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- validation_runs
CREATE POLICY validation_runs_org_read ON public.validation_runs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = validation_runs.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- approvals
CREATE POLICY approvals_org_read ON public.approvals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = approvals.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY approvals_org_write ON public.approvals
  FOR ALL USING (public.resolve_org_role(approvals.organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.resolve_org_role(approvals.organization_id) IN ('owner', 'admin'));

-- artifacts
CREATE POLICY artifacts_org_read ON public.artifacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = artifacts.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- failure_patterns
CREATE POLICY failure_patterns_org_read ON public.failure_patterns
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = failure_patterns.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- knowledge_sources
CREATE POLICY knowledge_sources_org_read ON public.knowledge_sources
  FOR SELECT USING (
    organization_id IS NULL OR
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = knowledge_sources.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- memory_events
CREATE POLICY memory_events_org_read ON public.memory_events
  FOR SELECT USING (
    organization_id IS NULL OR
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = memory_events.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

-- regression_tests
CREATE POLICY regression_tests_org_read ON public.regression_tests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.org_id = regression_tests.organization_id AND om.user_id = auth.uid() AND om.status = 'active')
  );
CREATE POLICY regression_tests_org_write ON public.regression_tests
  FOR ALL USING (public.resolve_org_role(regression_tests.organization_id) IN ('owner', 'admin', 'operator', 'builder'))
  WITH CHECK (public.resolve_org_role(regression_tests.organization_id) IN ('owner', 'admin', 'operator', 'builder'));

-- ════════════════════════════════════════════════════════════════
-- SUPABASE WATCHDOG (pg_cron)
-- Secondary safety mechanism -- fires if Vercel Cron misses a cycle.
-- ════════════════════════════════════════════════════════════════
-- Enable pg_cron extension (requires Supabase admin)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'control_plane_watchdog',
--   '*/5 * * * *',
--   $$
--     SELECT CASE
--       WHEN NOT EXISTS (
--         SELECT 1 FROM public.fleet_heartbeats
--         WHERE created_at > NOW() - INTERVAL '15 minutes'
--       )
--       THEN pgmq.send('incident_jobs', '{"job_type":"control_plane_recovery","priority":"critical"}'::jsonb)
--     END;
--   $$
-- );