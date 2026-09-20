// ═══════════════════════════════════════════════════════════════════════════
// brokenTwinScenarios.ts — The 40 deterministic fault scenarios for the
// Broken Twin Validation Lab.
//
// Each fault has a deterministic seed, expected detector, expected repair path,
// and expected validation. The repair engine is NOT told the solution — it must
// discover, classify, repair, validate, and document it.
// ═══════════════════════════════════════════════════════════════════════════

export interface FaultScenario {
  fault_id: string;
  scenario: string;
  deterministic_seed: string;
  expected_detector: string;
  expected_classification: string;
  expected_repair_path: string;
  expected_validation: string;
  expected_recovery: string;
  expected_rollback_behavior: string;
  expected_score_impact: number;
  layer: 'build' | 'lint' | 'types' | 'unit_test' | 'api' | 'frontend' | 'navigation' | 'form' | 'responsive' | 'accessibility' | 'evidence' | 'migration' | 'schema' | 'rls' | 'authorization' | 'queue' | 'idempotency' | 'lease' | 'worker' | 'provider' | 'database' | 'deployment' | 'validator' | 'retry' | 'dlq' | 'config' | 'source_drift' | 'deploy_mismatch' | 'performance' | 'dependency_security' | 'observability' | 'cost' | 'rollback' | 'backup' | 'visual' | 'scheduler' | 'security';
}

export const BROKEN_TWIN_SCENARIOS: FaultScenario[] = [
  // 1-5: Build & Code Quality
  { fault_id: 'BT-001', scenario: 'Broken build — syntax error in entry file', deterministic_seed: 'bt-build-001', expected_detector: 'build_validator', expected_classification: 'P0_BUILD_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'build_exit_code == 0', expected_recovery: 'Build passes', expected_rollback_behavior: 'Revert syntax fix', expected_score_impact: -10, layer: 'build' },
  { fault_id: 'BT-002', scenario: 'Lint failure — unused imports and variables', deterministic_seed: 'bt-lint-002', expected_detector: 'lint_validator', expected_classification: 'P2_LINT_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'lint_error_count == 0', expected_recovery: 'Lint passes', expected_rollback_behavior: 'Revert lint fixes', expected_score_impact: -2, layer: 'lint' },
  { fault_id: 'BT-003', scenario: 'Type error — incompatible type assignment', deterministic_seed: 'bt-type-003', expected_detector: 'type_validator', expected_classification: 'P1_TYPE_ERROR', expected_repair_path: 'L1_MICRO', expected_validation: 'type_error_count == 0', expected_recovery: 'Type check passes', expected_rollback_behavior: 'Revert type fix', expected_score_impact: -5, layer: 'types' },
  { fault_id: 'BT-004', scenario: 'Unit test failure — incorrect assertion', deterministic_seed: 'bt-unit-004', expected_detector: 'unit_test_validator', expected_classification: 'P1_TEST_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'unit_test_pass_rate == 100%', expected_recovery: 'All tests pass', expected_rollback_behavior: 'Revert test fix', expected_score_impact: -5, layer: 'unit_test' },
  { fault_id: 'BT-005', scenario: 'API contract mismatch — response schema changed', deterministic_seed: 'bt-api-005', expected_detector: 'api_contract_validator', expected_classification: 'P1_API_CONTRACT', expected_repair_path: 'L2_COMPONENT', expected_validation: 'api_contract_tests_pass', expected_recovery: 'API contract restored', expected_rollback_behavior: 'Revert API change', expected_score_impact: -5, layer: 'api' },

  // 6-10: Frontend & Navigation
  { fault_id: 'BT-006', scenario: 'Broken frontend route — missing import causes blank page', deterministic_seed: 'bt-route-006', expected_detector: 'route_validator', expected_classification: 'P0_ROUTE_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'route_renders', expected_recovery: 'Route renders correctly', expected_rollback_behavior: 'Revert import fix', expected_score_impact: -10, layer: 'frontend' },
  { fault_id: 'BT-007', scenario: 'Broken navigation — dead link to removed page', deterministic_seed: 'bt-nav-007', expected_detector: 'navigation_validator', expected_classification: 'P1_NAVIGATION_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'navigation_links_valid', expected_recovery: 'Navigation works', expected_rollback_behavior: 'Revert link fix', expected_score_impact: -3, layer: 'navigation' },
  { fault_id: 'BT-008', scenario: 'Invalid form behavior — required field not validated', deterministic_seed: 'bt-form-008', expected_detector: 'form_validator', expected_classification: 'P1_FORM_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'form_validation_pass', expected_recovery: 'Form validates correctly', expected_rollback_behavior: 'Revert form fix', expected_score_impact: -3, layer: 'form' },
  { fault_id: 'BT-009', scenario: 'Responsive layout regression — overflow at mobile width', deterministic_seed: 'bt-resp-009', expected_detector: 'responsive_validator', expected_classification: 'P1_RESPONSIVE_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'responsive_test_pass', expected_recovery: 'Layout responsive at all widths', expected_rollback_behavior: 'Revert CSS fix', expected_score_impact: -3, layer: 'responsive' },
  { fault_id: 'BT-010', scenario: 'Accessibility defect — missing ARIA labels on interactive elements', deterministic_seed: 'bt-a11y-010', expected_detector: 'accessibility_validator', expected_classification: 'P1_ACCESSIBILITY_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'accessibility_audit_pass', expected_recovery: 'Accessibility audit passes', expected_rollback_behavior: 'Revert ARIA additions', expected_score_impact: -3, layer: 'accessibility' },

  // 11-15: Evidence & Data
  { fault_id: 'BT-011', scenario: 'Stale evidence — receipt timestamp exceeds freshness requirement', deterministic_seed: 'bt-evid-011', expected_detector: 'evidence_freshness_validator', expected_classification: 'P1_STALE_EVIDENCE', expected_repair_path: 'L1_MICRO', expected_validation: 'evidence_freshness_pass', expected_recovery: 'Evidence refreshed', expected_rollback_behavior: 'Revert evidence refresh', expected_score_impact: -3, layer: 'evidence' },
  { fault_id: 'BT-012', scenario: 'Missing migration — new entity has no migration', deterministic_seed: 'bt-mig-012', expected_detector: 'migration_validator', expected_classification: 'P1_MISSING_MIGRATION', expected_repair_path: 'L2_COMPONENT', expected_validation: 'migration_status == current', expected_recovery: 'Migration applied', expected_rollback_behavior: 'Revert migration', expected_score_impact: -5, layer: 'migration' },
  { fault_id: 'BT-013', scenario: 'Schema mismatch — entity field type changed without migration', deterministic_seed: 'bt-schema-013', expected_detector: 'schema_validator', expected_classification: 'P0_SCHEMA_MISMATCH', expected_repair_path: 'L2_COMPONENT', expected_validation: 'schema_validation_pass', expected_recovery: 'Schema valid', expected_rollback_behavior: 'Revert schema change', expected_score_impact: -10, layer: 'schema' },
  { fault_id: 'BT-014', scenario: 'Simulated RLS policy defect — admin-only entity allows user reads', deterministic_seed: 'bt-rls-014', expected_detector: 'rls_validator', expected_classification: 'P0_RLS_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'rls_test_pass', expected_recovery: 'RLS enforced', expected_rollback_behavior: 'Revert RLS fix', expected_score_impact: -10, layer: 'rls' },
  { fault_id: 'BT-015', scenario: 'Authorization failure — non-admin can access admin route', deterministic_seed: 'bt-authz-015', expected_detector: 'authz_validator', expected_classification: 'P0_AUTHZ_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'authz_test_pass', expected_recovery: 'Authorization enforced', expected_rollback_behavior: 'Revert authz fix', expected_score_impact: -10, layer: 'authorization' },

  // 16-20: Queue & Worker
  { fault_id: 'BT-016', scenario: 'Duplicate queue delivery — same job processed twice', deterministic_seed: 'bt-queue-016', expected_detector: 'idempotency_validator', expected_classification: 'P1_IDEMPOTENCY_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'idempotency_test_pass', expected_recovery: 'No duplicate processing', expected_rollback_behavior: 'Revert idempotency fix', expected_score_impact: -5, layer: 'idempotency' },
  { fault_id: 'BT-017', scenario: 'Missing idempotency — retry creates duplicate records', deterministic_seed: 'bt-idem-017', expected_detector: 'idempotency_validator', expected_classification: 'P1_IDEMPOTENCY_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'idempotency_test_pass', expected_recovery: 'Idempotency enforced', expected_rollback_behavior: 'Revert idempotency key', expected_score_impact: -5, layer: 'idempotency' },
  { fault_id: 'BT-018', scenario: 'Expired lease — job claimed but lease expired without completion', deterministic_seed: 'bt-lease-018', expected_detector: 'lease_validator', expected_classification: 'P1_LEASE_EXPIRY', expected_repair_path: 'L2_COMPONENT', expected_validation: 'lease_test_pass', expected_recovery: 'Stale lease recovered', expected_rollback_behavior: 'Revert lease fix', expected_score_impact: -3, layer: 'lease' },
  { fault_id: 'BT-019', scenario: 'Worker death — worker claimed job but crashed mid-execution', deterministic_seed: 'bt-worker-019', expected_detector: 'worker_health_validator', expected_classification: 'P1_WORKER_DEATH', expected_repair_path: 'L2_COMPONENT', expected_validation: 'worker_health_pass', expected_recovery: 'Job re-queued and completed', expected_rollback_behavior: 'Revert worker restart', expected_score_impact: -3, layer: 'worker' },
  { fault_id: 'BT-020', scenario: 'Stale worker heartbeat — heartbeat not updated within TTL', deterministic_seed: 'bt-hb-020', expected_detector: 'heartbeat_validator', expected_classification: 'P1_STALE_HEARTBEAT', expected_repair_path: 'L2_COMPONENT', expected_validation: 'heartbeat_fresh', expected_recovery: 'Heartbeat restored', expected_rollback_behavior: 'Revert heartbeat fix', expected_score_impact: -2, layer: 'worker' },

  // 21-25: Provider & Infrastructure
  { fault_id: 'BT-021', scenario: 'Provider HTTP 429 — rate limited by external API', deterministic_seed: 'bt-429-021', expected_detector: 'provider_health_validator', expected_classification: 'P2_RATE_LIMITED', expected_repair_path: 'L2_COMPONENT', expected_validation: 'backoff_and_retry_succeeds', expected_recovery: 'Request succeeds after backoff', expected_rollback_behavior: 'Revert backoff fix', expected_score_impact: -2, layer: 'provider' },
  { fault_id: 'BT-022', scenario: 'Provider HTTP 500 — external API server error', deterministic_seed: 'bt-500-022', expected_detector: 'provider_health_validator', expected_classification: 'P2_PROVIDER_ERROR', expected_repair_path: 'L2_COMPONENT', expected_validation: 'fallback_or_retry_succeeds', expected_recovery: 'Fallback or retry succeeds', expected_rollback_behavior: 'Revert fallback', expected_score_impact: -2, layer: 'provider' },
  { fault_id: 'BT-023', scenario: 'Model provider outage — LLM API unavailable', deterministic_seed: 'bt-llm-023', expected_detector: 'provider_health_validator', expected_classification: 'P1_MODEL_OUTAGE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'model_failover_works', expected_recovery: 'Failover model used', expected_rollback_behavior: 'Revert failover config', expected_score_impact: -3, layer: 'provider' },
  { fault_id: 'BT-024', scenario: 'Database interruption — connection dropped mid-query', deterministic_seed: 'bt-db-024', expected_detector: 'resilience_validator', expected_classification: 'P1_DB_FAILURE', expected_repair_path: 'L2_COMPONENT', expected_validation: 'db_reconnect_succeeds', expected_recovery: 'Connection restored', expected_rollback_behavior: 'Revert reconnect fix', expected_score_impact: -5, layer: 'database' },
  { fault_id: 'BT-025', scenario: 'Queue backlog — jobs accumulating faster than draining', deterministic_seed: 'bt-backlog-025', expected_detector: 'queue_drain_validator', expected_classification: 'P1_QUEUE_BACKLOG', expected_repair_path: 'L3_REBUILD', expected_validation: 'queue_drain_rate > 0', expected_recovery: 'Queue draining', expected_rollback_behavior: 'Revert scaling fix', expected_score_impact: -5, layer: 'queue' },

  // 26-30: Deployment & Validation
  { fault_id: 'BT-026', scenario: 'Failed deployment health check — app returns 500', deterministic_seed: 'bt-deploy-026', expected_detector: 'deployment_validator', expected_classification: 'P0_DEPLOYMENT_FAILURE', expected_repair_path: 'L1_MICRO', expected_validation: 'deployment_health_pass', expected_recovery: 'Deployment healthy', expected_rollback_behavior: 'Rollback to previous release', expected_score_impact: -10, layer: 'deployment' },
  { fault_id: 'BT-027', scenario: 'Validator failure after implementation success — validator has a bug', deterministic_seed: 'bt-val-027', expected_detector: 'meta_validator', expected_classification: 'P1_VALIDATOR_BUG', expected_repair_path: 'L3_REBUILD', expected_validation: 'validator_self_test_pass', expected_recovery: 'Validator fixed', expected_rollback_behavior: 'Revert validator fix', expected_score_impact: -5, layer: 'validator' },
  { fault_id: 'BT-028', scenario: 'Retry exhaustion — max retries reached without success', deterministic_seed: 'bt-retry-028', expected_detector: 'retry_validator', expected_classification: 'P1_RETRY_EXHAUSTION', expected_repair_path: 'L2_COMPONENT', expected_validation: 'dlq_entry_created', expected_recovery: 'Job moved to DLQ', expected_rollback_behavior: 'Revert DLQ routing', expected_score_impact: -3, layer: 'retry' },
  { fault_id: 'BT-029', scenario: 'DLQ creation — failed job correctly dead-lettered', deterministic_seed: 'bt-dlq-029', expected_detector: 'dlq_validator', expected_classification: 'P2_DLQ_CREATED', expected_repair_path: 'L2_COMPONENT', expected_validation: 'dlq_test_pass', expected_recovery: 'DLQ entry processed', expected_rollback_behavior: 'Revert DLQ processing', expected_score_impact: -1, layer: 'dlq' },
  { fault_id: 'BT-030', scenario: 'Configuration corruption — env var set to invalid value', deterministic_seed: 'bt-config-030', expected_detector: 'config_validator', expected_classification: 'P1_CONFIG_CORRUPTION', expected_repair_path: 'L1_MICRO', expected_validation: 'config_valid', expected_recovery: 'Config restored', expected_rollback_behavior: 'Revert config fix', expected_score_impact: -3, layer: 'config' },

  // 31-35: Drift & Performance
  { fault_id: 'BT-031', scenario: 'Source SHA drift — deployed code differs from source', deterministic_seed: 'bt-drift-031', expected_detector: 'source_parity_validator', expected_classification: 'P0_SOURCE_DRIFT', expected_repair_path: 'L2_COMPONENT', expected_validation: 'source_parity == PASS', expected_recovery: 'Source/deployment parity restored', expected_rollback_behavior: 'Redeploy from source', expected_score_impact: -10, layer: 'source_drift' },
  { fault_id: 'BT-032', scenario: 'Deployment/source mismatch — different versions deployed', deterministic_seed: 'bt-mismatch-032', expected_detector: 'deployment_parity_validator', expected_classification: 'P0_DEPLOY_MISMATCH', expected_repair_path: 'L2_COMPONENT', expected_validation: 'deployment_parity == PASS', expected_recovery: 'Deployment matches source', expected_rollback_behavior: 'Redeploy correct version', expected_score_impact: -10, layer: 'deploy_mismatch' },
  { fault_id: 'BT-033', scenario: 'Performance regression — page load time doubled', deterministic_seed: 'bt-perf-033', expected_detector: 'performance_validator', expected_classification: 'P2_PERFORMANCE_REGRESSION', expected_repair_path: 'L2_COMPONENT', expected_validation: 'cwv_pass', expected_recovery: 'Performance restored', expected_rollback_behavior: 'Revert perf fix', expected_score_impact: -2, layer: 'performance' },
  { fault_id: 'BT-034', scenario: 'Simulated dependency/security finding — vulnerable dependency', deterministic_seed: 'bt-dep-034', expected_detector: 'dependency_security_validator', expected_classification: 'P1_DEPENDENCY_VULNERABILITY', expected_repair_path: 'L2_COMPONENT', expected_validation: 'dependency_scan_pass', expected_recovery: 'Dependency patched', expected_rollback_behavior: 'Revert dependency upgrade', expected_score_impact: -5, layer: 'dependency_security' },
  { fault_id: 'BT-035', scenario: 'Missing observability — no logs for critical operation', deterministic_seed: 'bt-obs-035', expected_detector: 'observability_validator', expected_classification: 'P2_MISSING_OBSERVABILITY', expected_repair_path: 'L1_MICRO', expected_validation: 'observability_check_pass', expected_recovery: 'Logging added', expected_rollback_behavior: 'Revert logging', expected_score_impact: -1, layer: 'observability' },

  // 36-40: Cost, Rollback, Backup, Visual, Scheduler
  { fault_id: 'BT-036', scenario: 'Cost limit breach — daily credit spend exceeds budget', deterministic_seed: 'bt-cost-036', expected_detector: 'cost_validator', expected_classification: 'P2_COST_BREACH', expected_repair_path: 'L2_COMPONENT', expected_validation: 'cost_within_budget', expected_recovery: 'Cost controls restored', expected_rollback_behavior: 'Revert cost fix', expected_score_impact: -2, layer: 'cost' },
  { fault_id: 'BT-037', scenario: 'Rollback requirement — failed change needs rollback', deterministic_seed: 'bt-rollback-037', expected_detector: 'rollback_validator', expected_classification: 'P1_ROLLBACK_REQUIRED', expected_repair_path: 'L2_COMPONENT', expected_validation: 'rollback_test_pass', expected_recovery: 'Rollback executed', expected_rollback_behavior: 'Rollback is the fix', expected_score_impact: -3, layer: 'rollback' },
  { fault_id: 'BT-038', scenario: 'Backup restore test — backup exists but restore fails', deterministic_seed: 'bt-backup-038', expected_detector: 'backup_validator', expected_classification: 'P1_BACKUP_FAILURE', expected_repair_path: 'L3_REBUILD', expected_validation: 'backup_restore_pass', expected_recovery: 'Restore works', expected_rollback_behavior: 'Revert backup fix', expected_score_impact: -5, layer: 'backup' },
  { fault_id: 'BT-039', scenario: 'Visual regression — approved component layout changed', deterministic_seed: 'bt-visual-039', expected_detector: 'visual_validator', expected_classification: 'P2_VISUAL_REGRESSION', expected_repair_path: 'L1_MICRO', expected_validation: 'visual_parity_pass', expected_recovery: 'Visual parity restored', expected_rollback_behavior: 'Revert visual fix', expected_score_impact: -2, layer: 'visual' },
  { fault_id: 'BT-040', scenario: 'Duplicated scheduler trigger — two cron jobs fire same function', deterministic_seed: 'bt-sched-040', expected_detector: 'scheduler_validator', expected_classification: 'P1_DUPLICATE_SCHEDULER', expected_repair_path: 'L2_COMPONENT', expected_validation: 'single_canonical_scheduler', expected_recovery: 'Single scheduler active', expected_rollback_behavior: 'Revert scheduler fix', expected_score_impact: -3, layer: 'scheduler' },
];

// ── Generate Broken Twin Fault Manifest ───────────────────────────────────
export function generateFaultManifest(systemId: string, scenarioIds?: string[]): any[] {
  const scenarios = scenarioIds
    ? BROKEN_TWIN_SCENARIOS.filter(s => scenarioIds.includes(s.fault_id))
    : BROKEN_TWIN_SCENARIOS;

  const now = new Date().toISOString();

  return scenarios.map((s, idx) => ({
    fault_id: s.fault_id,
    deterministic_seed: `${s.deterministic_seed}-${systemId}`,
    injection_timestamp: new Date(Date.now() + idx * 1000).toISOString(),
    scenario: s.scenario,
    expected_detector: s.expected_detector,
    expected_classification: s.expected_classification,
    expected_repair_path: s.expected_repair_path,
    expected_validation: s.expected_validation,
    expected_recovery: s.expected_recovery,
    expected_rollback_behavior: s.expected_rollback_behavior,
    expected_score_impact: s.expected_score_impact,
    detected: false,
    detected_at: null,
    repair_attempted: false,
    repair_succeeded: false,
    validated: false,
    rollback_proven: false,
    actual_detector: null,
    actual_classification: null,
    actual_repair_path: null,
    ttd_seconds: null,
    ttdg_seconds: null,
    ttr_seconds: null,
    ttv_seconds: null,
  }));
}

// ── Evaluate Broken Twin Results ──────────────────────────────────────────
export function evaluateBrokenTwin(twin: any): {
  passed: boolean;
  detected_count: number;
  repaired_count: number;
  validated_count: number;
  missed_count: number;
  false_verified: number;
  final_score: number;
  twin_reached_verified_100: boolean;
} {
  const manifest = twin.fault_manifest || [];
  const total = manifest.length;
  const detected = manifest.filter((f: any) => f.detected).length;
  const repaired = manifest.filter((f: any) => f.repair_succeeded).length;
  const validated = manifest.filter((f: any) => f.validated).length;
  const missed = total - detected;
  const falseVerified = manifest.filter((f: any) => f.repair_succeeded && !f.validated).length;

  // Calculate score: start at 100, subtract impact of unrepaired faults
  let score = 100;
  for (const fault of manifest) {
    if (!fault.detected || !fault.repair_succeeded || !fault.validated) {
      score += fault.expected_score_impact || -2;
    }
  }
  score = Math.max(0, Math.min(100, score));

  const passed = detected === total && missed === 0 && falseVerified === 0 && score >= 100;

  return {
    passed,
    detected_count: detected,
    repaired_count: repaired,
    validated_count: validated,
    missed_count: missed,
    false_verified: falseVerified,
    final_score: score,
    twin_reached_verified_100: passed,
  };
}