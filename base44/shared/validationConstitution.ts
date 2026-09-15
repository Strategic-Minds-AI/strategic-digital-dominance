// ═══════════════════════════════════════════════════════════════════════════
// validationConstitution.ts
// The weighted validation constitution for AutoComplete.
// Every system must pass all HARD gates and achieve 100% mandatory coverage
// to reach VERIFIED_100. Weighted score is informative, not authoritative.
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationDimension {
  dimension: string;
  weight: number;
  gate: 'HARD' | 'SOFT';
  required_test: string;
  pass_condition: string;
  auto_repair_class: string;
  evidence_artifact: string;
  freshness_default: string;
  verified_100_rule: string;
}

export const VALIDATION_CONSTITUTION: ValidationDimension[] = [
  { dimension: 'Build', weight: 15, gate: 'HARD', required_test: 'npm/pnpm build or platform build', pass_condition: '0 blockers', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'build_receipt.json', freshness_default: 'source/deploy revision scoped', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'Lint', weight: 5, gate: 'HARD', required_test: 'eslint/ruff/etc', pass_condition: '0 errors', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'lint_receipt.json', freshness_default: 'source/deploy revision scoped', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'Type', weight: 5, gate: 'HARD', required_test: 'tsc/mypy/static type', pass_condition: '0 errors', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'type_receipt.json', freshness_default: 'source/deploy revision scoped', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'Security', weight: 15, gate: 'HARD', required_test: 'security scan + RLS audit', pass_condition: 'no high/critical unresolved', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'security_receipt.json', freshness_default: '24h', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'Data', weight: 10, gate: 'HARD', required_test: 'schema/RLS/migration validation', pass_condition: 'all entities have RLS; no exposed tables', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'data_receipt.json', freshness_default: '24h', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'E2E', weight: 10, gate: 'HARD', required_test: 'critical user journeys', pass_condition: 'all critical journeys pass', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'e2e_receipt.json', freshness_default: '12h', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'Mobile', weight: 10, gate: 'HARD', required_test: 'responsive + PWA validation', pass_condition: 'no horizontal overflow; PWA manifest valid', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'mobile_receipt.json', freshness_default: '24h', verified_100_rule: 'MANDATORY PASS' },
  { dimension: 'Performance', weight: 10, gate: 'SOFT', required_test: 'Core Web Vitals', pass_condition: 'LCP < 2.5s; CLS < 0.1; INP < 200ms', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'perf_receipt.json', freshness_default: '12h', verified_100_rule: 'INFORMATIVE' },
  { dimension: 'SEO', weight: 10, gate: 'SOFT', required_test: 'meta/sitemap/robots/canonical', pass_condition: 'all pages have meta; sitemap valid', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'seo_receipt.json', freshness_default: '24h', verified_100_rule: 'INFORMATIVE' },
  { dimension: 'Accessibility', weight: 5, gate: 'SOFT', required_test: 'WCAG 2.1 AA audit', pass_condition: 'no critical violations', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'a11y_receipt.json', freshness_default: '24h', verified_100_rule: 'INFORMATIVE' },
  { dimension: 'Documentation', weight: 5, gate: 'SOFT', required_test: 'README/docs coverage', pass_condition: 'README exists; key flows documented', auto_repair_class: 'AUTO_BRANCH', evidence_artifact: 'docs_receipt.json', freshness_default: '7d', verified_100_rule: 'INFORMATIVE' },
];

export const TOTAL_WEIGHT = VALIDATION_CONSTITUTION.reduce((sum, d) => sum + d.weight, 0);

// The deterministic path to VERIFIED_100 — the state machine every system follows
export const PATH_TO_100 = [
  { step: 1, state: 'REGISTER', action: 'Resolve SystemManifest: canonical repo/branch/SHA, runtime, data plane, domains, owner, risk.', output: 'Versioned SystemManifest', pass_condition: 'All source authority fields known or explicit blocker', if_fail: 'BLOCKED_SOURCE_TRUTH', auto: true, executor: 'Discovery agent', validator: 'Deterministic registry validator' },
  { step: 2, state: 'CONSTITUTE', action: 'Compile mandatory BenchmarkConstitution for archetype + industry + app-specific requirements.', output: 'BenchmarkConstitution', pass_condition: 'Mandatory definition coverage = 100%; total mandatory > 0', if_fail: 'UNBENCHMARKED', auto: true, executor: 'Constitution compiler', validator: 'Schema validator' },
  { step: 3, state: 'BASELINE', action: 'Run static/runtime/security/data/browser/mobile tests.', output: 'BenchmarkResults + gaps', pass_condition: '100% mandatory evidence coverage or explicit failures', if_fail: 'COMPLETION_SPRINT', auto: true, executor: 'Validation workers', validator: 'Independent validator' },
  { step: 4, state: 'GAP', action: 'Create typed OptimizationGaps from every FAIL/UNKNOWN with root cause + repair priority.', output: 'OptimizationGaps', pass_condition: 'Every FAIL has a gap; every gap has a fingerprint', if_fail: 'INCOMPLETE_GAPS', auto: true, executor: 'Gap analyst', validator: 'Gap validator' },
  { step: 5, state: 'REPAIR', action: 'Create RepairJobs from gaps; claim via lease; implement in branch/sandbox.', output: 'RepairJobs', pass_condition: 'Every P0/P1 gap has a repair job', if_fail: 'UNREPAIRED', auto: true, executor: 'Repair implementer', validator: 'Independent validator' },
  { step: 6, state: 'VALIDATE', action: 'Independent validator runs acceptance test + regression test against the repair.', output: 'ValidationResults', pass_condition: 'Acceptance test passes; regression test passes', if_fail: 'VALIDATION_FAILED', auto: false, executor: 'Independent validator', validator: 'Release authority' },
  { step: 7, state: 'VERIFY', action: 'Check all HARD gates pass; zero mandatory UNKNOWN/FAIL/BLOCKED.', output: 'VERIFIED_100 or BLOCKED', pass_condition: 'All HARD gates PASS; zero mandatory FAIL/UNKNOWN', if_fail: 'NOT_VERIFIED', auto: false, executor: 'Release authority', validator: 'Release authority' },
];

// The install checklist
export const INSTALL_CHECKLIST = [
  { order: 1, item: 'SystemManifest', target: 'App/admin', action: 'Register canonical repo/branch/SHA, Base44 ID, runtime, data plane, domains, owner, risk', expected: 'Stable system_id + revision', safe_default: 'READ ONLY', validation: 'manifest schema pass' },
  { order: 2, item: 'BenchmarkConstitution', target: 'Xtreme OS', action: 'Compile universal + archetype + industry + app packs', expected: 'Mandatory benchmark set >0', safe_default: 'READ/DRAFT', validation: 'definition coverage 100%' },
  { order: 3, item: 'SchedulingConstitution', target: 'Xtreme OS', action: 'Register all existing schedulers; designate Vercel 5-min reconcile as primary', expected: 'No overlapping responsibility', safe_default: 'DRY RUN', validation: 'duplicate-trigger fault test' },
  { order: 4, item: 'ValidationWorkers', target: 'Railway', action: 'Deploy validation workers for each dimension', expected: 'Workers heartbeating', safe_default: 'STAGING', validation: 'heartbeat + queue consumption' },
  { order: 5, item: 'AutoCompleteAdmin', target: 'Each app /admin/autocomplete', action: 'Install admin dashboard module', expected: 'Operator can see score, gaps, queue, gate', safe_default: 'READ ONLY', validation: 'UI smoke test' },
  { order: 6, item: 'EvidenceStore', target: 'Xtreme OS', action: 'Configure evidence receipt storage + freshness rules', expected: 'Receipts created on every test', safe_default: 'READ ONLY', validation: 'receipt lineage test' },
  { order: 7, item: 'ReleaseGate', target: 'Each app', action: 'Configure protected release approval', expected: 'No release without gate approval', safe_default: 'DENY ALL', validation: 'gate denial test' },
];

// Prompt library for the agent roles
export const PROMPT_LIBRARY = [
  { id: 'AC-001', role: 'System Auditor', when: 'Initial/baseline/revision audit', prompt: 'Audit the registered system against its current BenchmarkConstitution. Do not infer PASS. For every mandatory benchmark emit PASS/FAIL/UNKNOWN/BLOCKED with evidence, freshness, failure fingerprint, root cause hypothesis, and exact next test. Create no production mutations.', allowed: 'Read; test preview/sandbox; create findings/receipts', forbidden: 'No prod mutation; no self-certification' },
  { id: 'AC-002', role: 'Repair Planner', when: 'After validated FAIL', prompt: 'Given one canonical failure fingerprint, produce the smallest reversible RepairPlan. Identify affected files/entities, reproduction steps, expected state, implementation diff scope, acceptance test, dependent regressions, risk class, rollback, budget, and required approval. Do not broaden scope.', allowed: 'Plan/draft work packet', forbidden: 'No unrelated redesign; no protected execute' },
  { id: 'AC-003', role: 'Repair Implementer', when: 'Claimed repair job', prompt: 'Execute only the approved RepairPlan in the assigned branch/sandbox. Preserve source SHA lineage. Do not mark the repair successful. Return artifact identifiers, diff summary, commands/tests run, errors, and rollback pointer for independent validation.', allowed: 'Branch/sandbox write + harmless tests', forbidden: 'No prod; no release; no validator role' },
  { id: 'AC-004', role: 'Independent Validator', when: 'After repair implementation', prompt: 'Independently validate the claimed repair. Run the acceptance test and regression test. Do not trust the implementer claim. Emit PASS/FAIL with evidence. If FAIL, reopen the gap with the failure fingerprint.', allowed: 'Read; test; create receipts; reopen gaps', forbidden: 'No implement role; no self-cert' },
  { id: 'AC-005', role: 'Release Authority', when: 'Before any production release', prompt: 'Verify all HARD gates pass. Verify zero mandatory UNKNOWN/FAIL/BLOCKED. Verify evidence is fresh. Verify no self-certification. Only then approve release. If any gate fails, deny and return to the appropriate lane.', allowed: 'Approve/deny release', forbidden: 'No bypass; no average-score loophole' },
];

export function getHardGates(): ValidationDimension[] {
  return VALIDATION_CONSTITUTION.filter(d => d.gate === 'HARD');
}

export function getSoftGates(): ValidationDimension[] {
  return VALIDATION_CONSTITUTION.filter(d => d.gate === 'SOFT');
}

export function computeWeightedScore(results: { dimension: string; status: string }[]): number {
  let score = 0;
  for (const dim of VALIDATION_CONSTITUTION) {
    const result = results.find(r => r.dimension === dim.dimension);
    if (result?.status === 'pass') {
      score += dim.weight;
    } else if (result?.status === 'unknown' || result?.status === 'stale') {
      score += dim.weight * 0.3;
    }
  }
  return Math.round(score);
}

export function isVerified100(results: { dimension: string; status: string }[]): boolean {
  const hardGates = getHardGates();
  for (const gate of hardGates) {
    const result = results.find(r => r.dimension === gate.dimension);
    if (!result || result.status !== 'pass') return false;
  }
  // Also check no mandatory FAIL/UNKNOWN
  const mandatoryFail = results.some(r => r.status === 'fail' || r.status === 'unknown' || r.status === 'blocked');
  return !mandatoryFail;
}