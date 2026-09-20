// ═══════════════════════════════════════════════════════════════════════════
// convergenceConstitution.ts — The 56-category benchmark constitution for the
// XTREME Autonomous Convergence Engine.
//
// Every system must be scored against ALL mandatory categories.
// A system with zero benchmarks can NEVER receive a perfect score.
// ═══════════════════════════════════════════════════════════════════════════

export interface BenchmarkCategory {
  id: string;
  name: string;
  weight: number;
  gate: 'HARD' | 'SOFT';
  mandatory: boolean;
  description: string;
  pass_condition: string;
  archetype_applicability?: string[];
}

// ── 56 Universal Benchmark Categories ──────────────────────────────────────
export const CONVERGENCE_CONSTITUTION: BenchmarkCategory[] = [
  // Source Truth
  { id: 'SRC-001', name: 'Source Truth — Canonical Repository', weight: 3, gate: 'HARD', mandatory: true, description: 'System has a canonical repository with known SHA', pass_condition: 'repository != null && source_sha verified' },
  { id: 'SRC-002', name: 'Source Truth — Source/Deployment Parity', weight: 3, gate: 'HARD', mandatory: true, description: 'Deployed code matches canonical source SHA', pass_condition: 'source_parity == PASS' },
  { id: 'SRC-003', name: 'Source Truth — Deployment Parity', weight: 2, gate: 'HARD', mandatory: true, description: 'Deployment identity is verified and matches expected', pass_condition: 'deployment_parity == PASS' },

  // Architecture
  { id: 'ARCH-001', name: 'Architecture — System Manifest Exists', weight: 3, gate: 'HARD', mandatory: true, description: 'SystemManifest is created and current', pass_condition: 'manifest exists && discovery_status == discovered' },
  { id: 'ARCH-002', name: 'Architecture — Archetype Classified', weight: 2, gate: 'SOFT', mandatory: true, description: 'System archetype is classified', pass_condition: 'system_archetype != other' },
  { id: 'ARCH-003', name: 'Architecture — Dependency Graph Built', weight: 2, gate: 'SOFT', mandatory: false, description: 'Component dependency/impact graph exists', pass_condition: 'dependency_graph exists' },

  // Build & Quality
  { id: 'BUILD-001', name: 'Build — Compiles Successfully', weight: 3, gate: 'HARD', mandatory: true, description: 'Production build completes without errors', pass_condition: 'build_exit_code == 0' },
  { id: 'LINT-001', name: 'Lint — No Lint Errors', weight: 1, gate: 'SOFT', mandatory: false, description: 'No linting errors in codebase', pass_condition: 'lint_error_count == 0' },
  { id: 'TYPE-001', name: 'Types — No Type Errors', weight: 2, gate: 'HARD', mandatory: true, description: 'No TypeScript type errors', pass_condition: 'type_error_count == 0' },

  // Testing
  { id: 'TEST-001', name: 'Unit Tests — Passing', weight: 3, gate: 'HARD', mandatory: true, description: 'All unit tests pass', pass_condition: 'unit_test_pass_rate == 100%' },
  { id: 'TEST-002', name: 'Integration Tests — Passing', weight: 2, gate: 'SOFT', mandatory: false, description: 'Integration tests pass', pass_condition: 'integration_test_pass_rate == 100%' },
  { id: 'TEST-003', name: 'API Contracts Tests — Passing', weight: 2, gate: 'SOFT', mandatory: false, description: 'API contract tests pass', pass_condition: 'api_contract_tests_pass' },
  { id: 'TEST-004', name: 'E2E/Browser Tests — Passing', weight: 2, gate: 'SOFT', mandatory: false, description: 'Browser/E2E tests pass', pass_condition: 'e2e_tests_pass' },
  { id: 'TEST-005', name: 'Business Logic Tests — Passing', weight: 2, gate: 'HARD', mandatory: true, description: 'Business logic tests pass', pass_condition: 'business_logic_tests_pass' },

  // UI & UX
  { id: 'UI-001', name: 'UI States — All States Render', weight: 1, gate: 'SOFT', mandatory: false, description: 'Loading, empty, error, success states render', pass_condition: 'all_ui_states_render' },
  { id: 'UI-002', name: 'Responsive Behavior — Works at All Viewports', weight: 2, gate: 'HARD', mandatory: true, description: 'Responsive at mobile, tablet, desktop', pass_condition: 'responsive_test_pass' },
  { id: 'UI-003', name: 'Mobile Behavior — Mobile-Optimized', weight: 2, gate: 'SOFT', mandatory: true, description: 'Mobile experience is functional', pass_condition: 'mobile_test_pass' },
  { id: 'UI-004', name: 'PWA Behavior — Installable & Offline', weight: 1, gate: 'SOFT', mandatory: false, description: 'PWA features work if applicable', pass_condition: 'pwa_test_pass', archetype_applicability: ['mobile_pwa'] },
  { id: 'UI-005', name: 'Accessibility — WCAG Compliant', weight: 2, gate: 'HARD', mandatory: true, description: 'WCAG 2.1 AA compliance', pass_condition: 'accessibility_audit_pass' },

  // Auth & Security
  { id: 'AUTH-001', name: 'Authentication — Login/Logout Works', weight: 3, gate: 'HARD', mandatory: true, description: 'Authentication system is functional', pass_condition: 'auth_flow_pass' },
  { id: 'AUTH-002', name: 'Authorization — Role Permissions Enforced', weight: 3, gate: 'HARD', mandatory: true, description: 'Authorization model is enforced', pass_condition: 'authz_test_pass' },
  { id: 'AUTH-003', name: 'Tenant Isolation — Multi-Tenant Safe', weight: 2, gate: 'HARD', mandatory: false, description: 'Tenant isolation enforced', pass_condition: 'tenant_isolation_pass', archetype_applicability: ['saas', 'marketplace'] },
  { id: 'SEC-001', name: 'RLS/Data Isolation — Row-Level Security', weight: 3, gate: 'HARD', mandatory: true, description: 'RLS policies are configured and enforced', pass_condition: 'rls_test_pass' },
  { id: 'SEC-002', name: 'Security — No Critical Vulnerabilities', weight: 3, gate: 'HARD', mandatory: true, description: 'No critical/high security vulnerabilities', pass_condition: 'security_scan_pass' },
  { id: 'SEC-003', name: 'Security — Secret Handling Safe', weight: 2, gate: 'HARD', mandatory: true, description: 'No secrets leaked in code or client bundles', pass_condition: 'secret_scan_pass' },
  { id: 'SEC-004', name: 'Dependency Security — No Known CVEs', weight: 1, gate: 'SOFT', mandatory: false, description: 'No known dependency vulnerabilities', pass_condition: 'dependency_scan_pass' },

  // Data
  { id: 'DATA-001', name: 'Schema Integrity — Schemas Valid', weight: 2, gate: 'HARD', mandatory: true, description: 'All entity schemas are valid', pass_condition: 'schema_validation_pass' },
  { id: 'DATA-002', name: 'Migrations — Applied & Current', weight: 2, gate: 'SOFT', mandatory: false, description: 'Database migrations are applied', pass_condition: 'migration_status == current' },
  { id: 'DATA-003', name: 'Storage — File Storage Works', weight: 1, gate: 'SOFT', mandatory: false, description: 'File upload/storage functional', pass_condition: 'storage_test_pass' },

  // Queue & Workflow
  { id: 'QUEUE-001', name: 'Queue Operation — Jobs Drain', weight: 2, gate: 'HARD', mandatory: false, description: 'Queue jobs are being processed', pass_condition: 'queue_drain_rate > 0' },
  { id: 'QUEUE-002', name: 'Job Leases — Atomic & Expiring', weight: 2, gate: 'HARD', mandatory: false, description: 'Job leases are atomic with expiry', pass_condition: 'lease_test_pass' },
  { id: 'QUEUE-003', name: 'Idempotency — No Duplicate Processing', weight: 2, gate: 'HARD', mandatory: false, description: 'Jobs are idempotent', pass_condition: 'idempotency_test_pass' },
  { id: 'QUEUE-004', name: 'Retries & DLQ — Bounded', weight: 1, gate: 'SOFT', mandatory: false, description: 'Retries are bounded with DLQ', pass_condition: 'dlq_test_pass' },
  { id: 'WF-001', name: 'Workflows — All Active Workflows Functional', weight: 2, gate: 'HARD', mandatory: false, description: 'Active workflows are executing', pass_condition: 'workflow_health_pass' },

  // Agents
  { id: 'AGENT-001', name: 'Agent Behavior — Agents Respond Correctly', weight: 1, gate: 'SOFT', mandatory: false, description: 'AI agents respond as expected', pass_condition: 'agent_test_pass' },
  { id: 'AGENT-002', name: 'Agent Tool Permissions — Properly Scoped', weight: 2, gate: 'HARD', mandatory: false, description: 'Agent tool permissions are properly scoped', pass_condition: 'agent_permission_audit_pass' },

  // Performance & Reliability
  { id: 'PERF-001', name: 'Performance — Page Speed Acceptable', weight: 1, gate: 'SOFT', mandatory: false, description: 'Core Web Vitals are acceptable', pass_condition: 'cwv_pass' },
  { id: 'PERF-002', name: 'Load/Concurrency — Handles Expected Load', weight: 1, gate: 'SOFT', mandatory: false, description: 'System handles expected concurrency', pass_condition: 'load_test_pass' },
  { id: 'RES-001', name: 'Resilience — Recovers from Failure', weight: 2, gate: 'HARD', mandatory: false, description: 'System recovers from injected failures', pass_condition: 'resilience_test_pass' },
  { id: 'RES-002', name: 'Self-Healing — Auto-Repair Works', weight: 2, gate: 'SOFT', mandatory: false, description: 'Self-healing engine detects and repairs', pass_condition: 'self_heal_test_pass' },
  { id: 'RES-003', name: 'Chaos Recovery — Survives Chaos', weight: 2, gate: 'SOFT', mandatory: false, description: 'System survives chaos tests', pass_condition: 'chaos_test_pass' },
  { id: 'RES-004', name: 'Backup — Backup Proven', weight: 1, gate: 'SOFT', mandatory: false, description: 'Backup is proven via restore', pass_condition: 'backup_restore_pass' },
  { id: 'RES-005', name: 'Rollback — Rollback Proven', weight: 2, gate: 'HARD', mandatory: false, description: 'Rollback is proven in non-production', pass_condition: 'rollback_test_pass' },

  // Observability & Evidence
  { id: 'OBS-001', name: 'Observability — Logs & Metrics Available', weight: 1, gate: 'SOFT', mandatory: false, description: 'Logs and metrics are available', pass_condition: 'observability_check_pass' },
  { id: 'OBS-002', name: 'Evidence Lineage — Receipts Traceable', weight: 2, gate: 'HARD', mandatory: true, description: 'Evidence receipts are traceable and fresh', pass_condition: 'evidence_freshness_pass' },

  // Cost
  { id: 'COST-001', name: 'Cost Controls — Within Budget', weight: 1, gate: 'SOFT', mandatory: false, description: 'System is within cost budget', pass_condition: 'cost_within_budget' },

  // Documentation
  { id: 'DOC-001', name: 'Documentation — Current & Complete', weight: 1, gate: 'SOFT', mandatory: false, description: 'Documentation is current', pass_condition: 'doc_completeness_pass' },
  { id: 'DOC-002', name: 'Runbooks — Operational Runbooks Exist', weight: 1, gate: 'SOFT', mandatory: false, description: 'Operational runbooks exist', pass_condition: 'runbook_exists' },

  // Human User
  { id: 'USER-001', name: 'Human User Journeys — Critical Paths Work', weight: 2, gate: 'HARD', mandatory: true, description: 'Critical user journeys work end-to-end', pass_condition: 'user_journey_test_pass' },
  { id: 'USER-002', name: 'Error Handling — Errors Handled Gracefully', weight: 1, gate: 'SOFT', mandatory: true, description: 'Errors are handled gracefully', pass_condition: 'error_handling_pass' },
  { id: 'USER-003', name: 'Edge Cases — Boundary Input Handled', weight: 1, gate: 'SOFT', mandatory: false, description: 'Edge cases and boundary input handled', pass_condition: 'edge_case_test_pass' },

  // Industry
  { id: 'IND-001', name: 'Industry-Specific Requirements Met', weight: 2, gate: 'SOFT', mandatory: false, description: 'Industry-specific requirements are met', pass_condition: 'industry_req_pass' },

  // Business Outcome
  { id: 'BIZ-001', name: 'Customer/Business Outcomes Measurable', weight: 2, gate: 'SOFT', mandatory: false, description: 'Business outcomes are measurable', pass_condition: 'business_outcome_verified' },
];

// ── VERIFIED_100 Definition ──────────────────────────────────────────────
export function isVerified100(results: { status: string; gate: string; mandatory: boolean }[]): boolean {
  const mandatoryResults = results.filter(r => r.mandatory);
  const allHardPass = mandatoryResults.every(r => r.gate !== 'HARD' || r.status === 'pass');
  const noMandatoryFail = mandatoryResults.every(r => r.status !== 'fail' && r.status !== 'unknown' && r.status !== 'blocked');
  return allHardPass && noMandatoryFail;
}

// ── Compute Weighted Score ────────────────────────────────────────────────
export function computeConvergenceScore(results: { status: string; weight: number; gate: string; mandatory: boolean }[]): number {
  const mandatoryResults = results.filter(r => r.mandatory);
  if (mandatoryResults.length === 0) return 0;

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const r of mandatoryResults) {
    totalWeight += r.weight;
    if (r.status === 'pass') {
      earnedWeight += r.weight;
    }
  }

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

// ── Get Hard Gates ─────────────────────────────────────────────────────────
export function getHardGates(): BenchmarkCategory[] {
  return CONVERGENCE_CONSTITUTION.filter(c => c.gate === 'HARD' && c.mandatory);
}

// ── Get Applicable Categories for Archetype ────────────────────────────────
export function getApplicableCategories(archetype: string): BenchmarkCategory[] {
  return CONVERGENCE_CONSTITUTION.filter(c => {
    if (!c.archetype_applicability || c.archetype_applicability.length === 0) return true;
    return c.archetype_applicability.includes(archetype);
  });
}

// ── Canonical Convergence Loop Phases ─────────────────────────────────────
export const CONVERGENCE_PHASES = [
  'DISCOVER',
  'MODEL',
  'AUDIT',
  'SCORE',
  'DIAGNOSE',
  'PLAN',
  'REPAIR',
  'TEST',
  'VALIDATE',
  'HARDEN',
  'OPTIMIZE',
  'CHAOS_TEST',
  'RESCORE',
  'PRESERVE',
] as const;

// ── Deterministic Priority Order ───────────────────────────────────────────
export const PRIORITY_ORDER = [
  'P0_SECURITY_DATA_LOSS',
  'EXECUTION_FABRIC_FAILURE',
  'SOURCE_TRUTH_DRIFT',
  'AUTHORIZATION_SECURITY',
  'DATA_INTEGRITY',
  'QUEUE_WORKFLOW_CORRECTNESS',
  'BUILD_RUNTIME_FAILURE',
  'USER_BLOCKING_FUNCTIONALITY',
  'REGRESSION_FAILURES',
  'OBSERVABILITY_GAPS',
  'RESILIENCE',
  'PERFORMANCE',
  'USABILITY',
  'OPTIMIZATION',
  'COSMETIC_IMPROVEMENTS',
] as const;

// ── Repair Escalation Levels ──────────────────────────────────────────────
export const REPAIR_LEVELS = {
  L1_MICRO: 'Smallest possible patch',
  L2_COMPONENT: 'Repair component contract or configuration',
  L3_REBUILD: 'Recreate failing component from verified interface',
  L4_SUBSYSTEM: 'Rebuild bounded subsystem preserving verified contracts',
  L5_ARCHITECTURAL: 'Replace faulty architecture with approved target model',
} as const;

// ── Component Disposition Classifications ─────────────────────────────────
export const DISPOSITION_CLASSES = [
  'PRESERVE',
  'REPAIR',
  'HARDEN',
  'OPTIMIZE',
  'REPLACE',
  'REBUILD',
  'QUARANTINE',
  'RETIRE',
] as const;

// ── Evidence Classification ───────────────────────────────────────────────
export type EvidenceClassification = 'VERIFIED' | 'INFERRED' | 'COULD_NOT_VERIFY' | 'BLOCKED';

// ── Stagnation Detection Thresholds ───────────────────────────────────────
export const STAGNATION_THRESHOLDS = {
  MAX_SAME_FINGERPRINT_REPEATS: 3,
  MAX_CYCLES_WITHOUT_SCORE_IMPROVEMENT: 5,
  MAX_QUEUE_DEPTH_BEFORE_FREEZE: 100,
  MAX_QUEUE_AGE_SECONDS: 3600,
  MAX_IDENTICAL_REPAIR_APPROACHES: 3,
};