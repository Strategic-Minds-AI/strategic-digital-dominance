-- ════════════════════════════════════════════════════════════════
-- XTREME Control Plane — Migration 002: Queues + RLS
-- Target: Supabase Postgres + pgmq
-- Status: APPROVAL REQUIRED (production migration)
-- ════════════════════════════════════════════════════════════════

-- ── Durable pgmq Queues ──
-- Do NOT use unlogged/transient queues for critical jobs.
SELECT pgmq.create('discovery_jobs');
SELECT pgmq.create('audit_jobs');
SELECT pgmq.create('research_jobs');
SELECT pgmq.create('coding_jobs');
SELECT pgmq.create('browser_jobs');
SELECT pgmq.create('repair_jobs');
SELECT pgmq.create('validation_jobs');
SELECT pgmq.create('deployment_jobs');
SELECT pgmq.create('knowledge_jobs');
SELECT pgmq.create('incident_jobs');
SELECT pgmq.create('dead_letter');

-- ── cost_events ──
CREATE TABLE IF NOT EXISTS cost_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ── provider_health ──
CREATE TABLE IF NOT EXISTS provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'unknown',
  last_check TIMESTAMPTZ,
  latency_ms INT,
  error_rate NUMERIC DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── knowledge_sources ──
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT,
  source_type TEXT,
  source_url TEXT,
  title TEXT,
  content TEXT,
  provenance TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── memory_events ──
CREATE TABLE IF NOT EXISTS memory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT,
  event_type TEXT,
  key TEXT,
  value JSONB,
  ttl_seconds INT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── failure_patterns ──
CREATE TABLE IF NOT EXISTS failure_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ── validation_runs ──
CREATE TABLE IF NOT EXISTS validation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_id TEXT UNIQUE NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── approvals ──
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id TEXT UNIQUE NOT NULL,
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

-- ── artifacts ──
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id TEXT UNIQUE NOT NULL,
  system_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  url TEXT,
  path TEXT,
  hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════

ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Operator (admin) access: full read/write
CREATE POLICY operator_all ON systems FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON operator_intents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON benchmarks FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON benchmark_results FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON evidence_receipts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON fleet_heartbeats FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON incidents FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY operator_all ON approvals FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Worker (service_role) access: jobs, repairs, validation, artifacts, leases
-- Workers use service_role key — RLS is bypassed for service_role by default.
-- For anon/client access, restrict to read-only on public dashboards:
CREATE POLICY public_read ON systems FOR SELECT USING (true);

-- ════════════════════════════════════════════════════════════════
-- SUPABASE WATCHDOG (pg_cron)
-- Secondary safety mechanism — fires if Vercel Cron misses a cycle.
-- ════════════════════════════════════════════════════════════════
-- Enable pg_cron extension (requires Supabase admin)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('control_plane_watchdog', '*\/5 * * * *', $$
--   SELECT 1 FROM fleet_heartbeats
--   WHERE created_at > NOW() - INTERVAL '15 minutes'
--   LIMIT 1;
--   -- If no recent heartbeat, enqueue CONTROL_PLANE_RECOVERY
-- $$;