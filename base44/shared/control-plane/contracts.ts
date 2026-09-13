// ════════════════════════════════════════════════════════════════
// XTREME Universal Operating Fabric -- Contracts Package
// Shared by Vercel, Supabase, Railway, web console, and agents.
// Runtime schema validation enforced at every boundary.
// ════════════════════════════════════════════════════════════════

export type SystemType = 'website' | 'saas' | 'pwa' | 'communications' | 'lead_generation' | 'marketplace' | 'ai_product' | 'data_system' | 'browser_system' | 'financial' | 'crm' | 'automation' | 'research' | 'agent_platform' | 'construction' | 'control_plane' | 'unknown';
export type Severity = 'P0' | 'P1' | 'P2' | 'P3';
export type RiskClass = 'low' | 'medium' | 'high';
export type Environment = 'production' | 'staging' | 'preview';
export type LifecycleMode = 'bootstrap' | 'completion_sprint' | 'preservation' | 'degraded' | 'blocked';
export type OrgRole = 'owner' | 'admin' | 'operator' | 'builder' | 'viewer';
export type PhaseGate = 'BRIDGE_PROVEN' | 'ARTIFACTS_HARDENED' | 'INFRASTRUCTURE_DEPLOYED' | 'RUNTIME_PROVEN' | 'PARITY_PROVEN' | 'CUTOVER_READY';

// ════════════════════════════════════════════════════════════════
// Organization Model -- Multi-tenant access control
// ════════════════════════════════════════════════════════════════

export interface Organization {
  org_id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  org_id: string;
  user_id: string;
  role: OrgRole;
  status: 'pending' | 'active' | 'revoked';
  invited_at: string;
  joined_at?: string;
}

// ════════════════════════════════════════════════════════════════
// System Manifest
// ════════════════════════════════════════════════════════════════

export interface SystemManifest {
  system_id: string;
  organization_id: string;
  name: string;
  description?: string;
  system_type: SystemType;
  business_purpose?: string;
  repository?: string;
  default_branch?: string;
  vercel_project?: string;
  railway_project?: string;
  supabase_project?: string;
  domains?: string[];
  drive_root?: string;
  owner?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  base44_app_id?: string;
  base44_app_slug?: string;
  manifest_version?: string;
}

// ════════════════════════════════════════════════════════════════
// Operator Intents
// ════════════════════════════════════════════════════════════════

export interface OperatorIntent {
  intent_id: string;
  organization_id: string;
  system_id: string;
  operator_input: string;
  interpreted_objective?: string;
  scope: 'fleet' | 'system' | 'workflow' | 'agent' | 'benchmark' | 'repair' | 'deployment' | 'research' | 'approval' | 'query';
  priority: 'critical' | 'high' | 'medium' | 'low';
  constraints?: string[];
  risk: RiskClass;
  target_benchmarks?: string[];
  approval_policy: 'auto' | 'operator_required' | 'operator_required_protected';
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'rejected' | 'blocked' | 'validating' | 'validating_result' | 'routed' | 'queued' | 'failed';
  result?: string;
  correlation_id?: string;
  created_at: string;
  executed_at?: string;
}

// ════════════════════════════════════════════════════════════════
// Jobs -- includes pgmq_message_id for full lineage tracking
// ════════════════════════════════════════════════════════════════

export type JobStatus = 'queued' | 'claimed' | 'in_progress' | 'ready_for_validation' | 'validating' | 'verified' | 'closed' | 'retry' | 'blocked' | 'failed' | 'superseded' | 'dead_letter';

export interface Job {
  job_id: string;
  organization_id: string;
  system_id: string;
  job_type: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  payload: Record<string, any>;
  correlation_id?: string;
  parent_job_id?: string;
  intent_id?: string;
  repair_id?: string;
  benchmark_id?: string;
  required_worker_type: string;
  required_capabilities?: string[];
  created_at: string;
  available_at?: string;
  attempt: number;
  max_attempts: number;
  timeout_seconds?: number;
  idempotency_key: string;
  risk_class: RiskClass;
  approval_required: boolean;
  status: JobStatus;
  claimed_by?: string;
  lease_expires_at?: string;
  pgmq_message_id?: number;
}

export interface JobResult {
  result_id: string;
  job_id: string;
  organization_id: string;
  system_id: string;
  worker_id: string;
  pgmq_message_id?: number;
  status: 'success' | 'failure' | 'partial';
  output?: Record<string, any>;
  artifacts?: ArtifactReference[];
  error?: string;
  duration_ms: number;
  completed_at: string;
}

// ════════════════════════════════════════════════════════════════
// Workers -- server-side identity, no client credentials
// ════════════════════════════════════════════════════════════════

export interface WorkerRegistration {
  worker_id: string;
  organization_id?: string;
  worker_type: string;
  version: string;
  capabilities: string[];
  environment: Environment;
  status: 'active' | 'idle' | 'busy' | 'degraded' | 'offline';
  current_job?: string;
  load: number;
  last_heartbeat: string;
  registered_at: string;
}

// ════════════════════════════════════════════════════════════════
// Benchmarks
// ════════════════════════════════════════════════════════════════

export interface BenchmarkDefinition {
  benchmark_id: string;
  organization_id: string;
  system_id: string;
  benchmark_pack_id?: string;
  validator_id?: string;
  category: string;
  name: string;
  description?: string;
  target: string;
  measurement?: string;
  comparator?: string;
  severity: Severity;
  mandatory: boolean;
  environment: Environment;
  data_source?: string;
  validator?: string;
  evidence_required: boolean;
  freshness_requirement?: string;
  auto_repair_allowed: boolean;
  benchmark_version: string;
  standard_source?: string;
  enabled: boolean;
}

export interface BenchmarkResult {
  benchmark_id: string;
  organization_id: string;
  system_id: string;
  cycle_id: string;
  target: string;
  actual: string;
  delta?: string;
  status: 'pass' | 'fail' | 'unknown' | 'stale';
  severity: Severity;
  mandatory: boolean;
  evidence_receipt_id?: string;
  measured_at: string;
  validator?: string;
  details?: string;
  failure_reasons?: string[];
}

// ════════════════════════════════════════════════════════════════
// Optimization Gaps + Repairs
// ════════════════════════════════════════════════════════════════

export interface OptimizationGap {
  gap_id: string;
  organization_id: string;
  system_id: string;
  benchmark_id: string;
  cycle_id: string;
  target: string;
  actual: string;
  delta?: string;
  severity: Severity;
  business_impact?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  status: 'open' | 'in_repair' | 'validated' | 'closed' | 'blocked';
  repair_job_id?: string;
  repair_priority_score?: number;
}

export interface RepairPacket {
  repair_id: string;
  organization_id: string;
  system_id: string;
  benchmark_id: string;
  gap_id?: string;
  failure_fingerprint: string;
  root_cause: string;
  implementation_plan: string;
  affected_files?: string[];
  affected_entities?: string[];
  risk: RiskClass;
  rollback?: string;
  acceptance_test?: string;
  regression_test?: string;
  postcondition_validator?: string;
  approval_required: boolean;
  status: string;
}

// ════════════════════════════════════════════════════════════════
// Validation -- includes worker_id and pgmq_message_id for lineage
// ════════════════════════════════════════════════════════════════

export interface ValidationRequest {
  validation_id: string;
  organization_id: string;
  system_id: string;
  job_id: string;
  repair_id?: string;
  benchmark_id?: string;
  validation_type: 'http' | 'dom' | 'api' | 'schema' | 'file_hash' | 'playwright' | 'behavioral';
  target_url?: string;
  expected_state?: string;
  validator_id: string;
  worker_id?: string;
  pgmq_message_id?: number;
}

export interface ValidationResult {
  validation_id: string;
  organization_id: string;
  system_id: string;
  job_id: string;
  status: 'pass' | 'fail' | 'error';
  actual_state?: string;
  evidence_receipt_id?: string;
  details?: string;
  validated_at: string;
  validated_by: string;
  worker_id?: string;
  pgmq_message_id?: number;
}

// ════════════════════════════════════════════════════════════════
// Evidence Receipts -- includes worker_id and pgmq_message_id
// ════════════════════════════════════════════════════════════════

export interface EvidenceReceipt {
  receipt_id: string;
  organization_id: string;
  system_id: string;
  benchmark_id?: string;
  cycle_id?: string;
  evidence_type: 'http_response' | 'dom_snapshot' | 'entity_record' | 'function_output' | 'connector_status' | 'file_content' | 'log_entry' | 'screenshot' | 'validation_result';
  evidence_url?: string;
  evidence_description: string;
  evidence_data?: string;
  verified_at: string;
  verified_by: string;
  worker_id?: string;
  pgmq_message_id?: number;
  valid: boolean;
  expires_at?: string;
}

// ════════════════════════════════════════════════════════════════
// Control Lease -- atomic, database-enforced
// ════════════════════════════════════════════════════════════════

export interface ControlLease {
  lock_key: string;
  organization_id?: string;
  owner_id: string;
  cycle_id?: string;
  acquired_at: string;
  heartbeat_at?: string;
  lease_expires_at: string;
  released_at?: string;
  status: 'held' | 'released' | 'expired' | 'stale';
  version: number;
  idempotency_key?: string;
}

// ════════════════════════════════════════════════════════════════
// Incidents, Approvals, Artifacts, Heartbeats
// ════════════════════════════════════════════════════════════════

export interface Incident {
  incident_id: string;
  organization_id: string;
  system_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description?: string;
  status: 'open' | 'investigating' | 'remediation_queued' | 'remediating' | 'retesting' | 'resolved' | 'accepted_risk';
  related_job_id?: string;
  related_repair_id?: string;
  created_at: string;
}

export interface ApprovalPacket {
  approval_id: string;
  organization_id: string;
  action_type: 'supabase_staging' | 'supabase_production' | 'railway_staging' | 'railway_production' | 'vercel_staging' | 'vercel_production' | 'dns' | 'secret_movement' | 'production_cutover';
  description: string;
  risk: RiskClass;
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ArtifactReference {
  artifact_id: string;
  organization_id: string;
  system_id: string;
  artifact_type: 'branch' | 'commit' | 'diff' | 'screenshot' | 'log' | 'report' | 'file' | 'receipt';
  url?: string;
  path?: string;
  hash?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface FleetHeartbeat {
  heartbeat_id: string;
  organization_id?: string;
  cycle_id: string;
  scheduled_at: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  lock_acquired: boolean;
  systems_checked: number;
  intents_routed: number;
  jobs_dispatched: number;
  systems_degraded: number;
  fleet_score: number;
  status: 'completed' | 'failed' | 'partial' | 'skipped';
}

export interface AgentDefinition {
  agent_id: string;
  name: string;
  role: string;
  capabilities: string[];
  system_prompt?: string;
  model?: string;
  tools?: string[];
  max_concurrent_tasks?: number;
}

// ════════════════════════════════════════════════════════════════
// Job Lineage -- Full traceability chain
// QUEUE MESSAGE -> JOB -> WORKER -> RESULT -> VALIDATOR -> RECEIPT
// ════════════════════════════════════════════════════════════════

export interface JobLineage {
  pgmq_message_id: number;
  job_id: string;
  system_id: string;
  organization_id: string;
  correlation_id?: string;
  idempotency_key: string;
  worker_id?: string;
  attempt: number;
  validation_id?: string;
  evidence_receipt_id?: string;
}