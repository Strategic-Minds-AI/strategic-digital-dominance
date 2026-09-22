import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ============================================================
// AUTONOMOUS REFACTOR ENGINE
// 5-Phase Cycle: SCAN → PLAN → EXECUTE → VALIDATE → CONVERGE
// ============================================================

const KNOWN_FUNCTIONS = [
  "agentBuilderEngine", "agentRouter", "agentRunner", "aiAssist", "alphaPrimeAudit",
  "alphaPrimeBenchmarkGenerator", "alphaPrimeHeartbeat", "alphaPrimeOptimizationCycle",
  "alphaPrimeRepairFactory", "apiKeyManager", "autoComplete", "autonomousCodingEngine",
  "autonomousSeoDominance", "autonomousSprint", "bookEstimate", "builderLibrarySeeder",
  "calculateDistanceTo100", "canonicalizeRepairBacklog", "checkGoogleStatus",
  "checkQuestionnaireCompliance", "closedLoopTester", "companyIntel", "companyOrchestrator",
  "convergenceEngine", "cryptoCreator", "dailyLeadEngine", "digitalDominanceCompiler",
  "domainGoldRush", "dominanceEngine", "enrichLead", "fetchCoreWebVitals", "fillContentGaps",
  "fleetAlphaPrime", "generateRss", "generateSeoPage", "generateSitemap", "generateSop",
  "githubSync", "godaddyApi", "googleAnalytics", "googleVerifierConnectUrl",
  "googleVerifierExchange", "googleWorkspaceSync", "graphEngine", "intelligenceSync",
  "intentRouter", "llmRouter", "massIngestionEngine", "memoryRouter", "metaAgent",
  "metaArchitecture", "notifySeoUpdates", "optimizeSeo", "phase9Proof", "pingIndexNow",
  "postconditionValidator", "predictionEngine", "propertyLookup", "pullSearchConsoleData",
  "pushLeadToHubspot", "ragPipeline", "railwayScraper", "rebrandGenerator", "rebrandStudio",
  "recursiveHealingEngine", "regressionTestSuite", "runContractorSimulation",
  "runtimeAcceptanceMission", "scanCompetitors", "selfReflectionEngine", "sendEstimateEmail",
  "sendFollowUpEmail", "sendReviewRequest", "seoAeoSimulator", "seoGenerator", "seoSimSync",
  "shadowBrowse", "siteHealthChecker", "skipTrace", "socialStudio", "strategicMindsSetup",
  "submitToIndexers", "supabaseConcurrencyTest", "supabaseMigrationDeploy", "supabaseUpload",
  "swarmOrchestrator", "syncContentCalendar", "syncContractorWorkflow", "syncFleetSystemState",
  "syncLeadToSheet", "syncWorkflowToSwarm", "syntheticWorker", "systemAuditor",
  "systemOrchestrator", "telnyxAutonomousSetup", "telnyxManager", "topSitesBenchmarkScanner",
  "tradeCrystalBall", "vercelAiGateway", "vercelDeploy", "vercelManager", "verifySearchConsole",
  "visionCortexRouter", "visionEngine", "voiceAssistant", "xtremeComms",
  "xtremeUniversalGeneratorBridge"
];

const SAFE_TEST_PAYLOADS: Record<string, any> = {
  status: { action: "status" },
  stats: { action: "stats" },
  list: { action: "list" },
  default: { action: "status" },
};

function getTestPayload(funcName: string): any {
  const lower = funcName.toLowerCase();
  if (lower.includes("status") || lower.includes("audit") || lower.includes("scan")) return SAFE_TEST_PAYLOADS.status;
  if (lower.includes("stats") || lower.includes("metric")) return SAFE_TEST_PAYLOADS.stats;
  if (lower.includes("list") || lower.includes("engine")) return SAFE_TEST_PAYLOADS.list;
  return SAFE_TEST_PAYLOADS.default;
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// PHASE 1: SCAN
// ============================================================
async function scanSystem(base44: any): Promise<any> {
  const svc = base44.asServiceRole;
  const cycleId = genId("cycle");
  const results: any[] = [];
  const errors: any[] = [];
  const slow: any[] = [];

  for (const funcName of KNOWN_FUNCTIONS) {
    const payload = getTestPayload(funcName);
    const start = Date.now();
    try {
      const response = await base44.functions.invoke(funcName, payload);
      const elapsed = Date.now() - start;
      results.push({ function: funcName, status: "ok", elapsed_ms: elapsed });
      if (elapsed > 3000) slow.push({ function: funcName, elapsed_ms: elapsed });
    } catch (err: any) {
      const elapsed = Date.now() - start;
      errors.push({ function: funcName, error: (err?.message || String(err)).slice(0, 500), elapsed_ms: elapsed });
    }
  }

  const scanSummary = {
    total_tested: KNOWN_FUNCTIONS.length,
    successful: results.length,
    failed: errors.length,
    slow_functions: slow,
    errors: errors.slice(0, 20),
    all_functions: KNOWN_FUNCTIONS,
  };

  const llmResponse = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous code refactoring analyst. Analyze this backend function scan results and identify the TOP refactoring opportunities.

SCAN RESULTS:
${JSON.stringify(scanSummary, null, 2)}

For each opportunity, return a JSON object with:
- target_name: the function name
- issue_type: one of [broken_function, performance, consolidation, duplicated_code, dead_code, complex_logic, missing_error_handling, inconsistent_pattern]
- issue_description: what's wrong and why it needs refactoring
- severity: critical | high | medium | low
- refactor_action: specific action to take
- priority: critical | high | normal | low

Rules:
- Functions that returned errors are "broken_function" severity critical
- Functions that took >3000ms are "performance" severity high
- Functions with similar names/purposes are "consolidation" opportunities
- Identify groups of functions that could be merged

Return a JSON object: { "opportunities": [ ... ], "summary": "brief summary" }
Return at most 15 opportunities, sorted by severity (critical first).`,
    response_json_schema: {
      type: "object",
      properties: {
        opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              target_name: { type: "string" },
              issue_type: { type: "string" },
              issue_description: { type: "string" },
              severity: { type: "string" },
              refactor_action: { type: "string" },
              priority: { type: "string" },
            },
          },
        },
        summary: { type: "string" },
      },
    },
  });

  const jobsCreated: any[] = [];
  const ownerId = base44.user?.id || "system";
  for (const opp of (llmResponse as any).opportunities || []) {
    const jobId = genId("refactor");
    const job = await svc.entities.RefactorJob.create({
      owner_id: ownerId,
      job_id: jobId,
      cycle_id: cycleId,
      job_type: "scan",
      target_type: "backend_function",
      target_name: opp.target_name,
      issue_type: opp.issue_type,
      issue_description: opp.issue_description,
      severity: opp.severity,
      status: "identified",
      priority: opp.priority,
      scan_data: JSON.stringify({ refactor_action: opp.refactor_action, cycle_id: cycleId }),
      created_at: new Date().toISOString(),
    });
    jobsCreated.push({ id: job.id, job_id: job.job_id, target: job.target_name, issue: job.issue_type, severity: job.severity });
  }

  return {
    ok: true,
    cycle_id: cycleId,
    summary: (llmResponse as any).summary,
    scan_stats: { total_tested: scanSummary.total_tested, successful: scanSummary.successful, failed: scanSummary.failed, slow_count: slow.length },
    jobs_created: jobsCreated.length,
    jobs: jobsCreated,
  };
}

// ============================================================
// PHASE 2: PLAN
// ============================================================
async function planRefactor(base44: any, jobId: string): Promise<any> {
  const svc = base44.asServiceRole;
  const jobs = await svc.entities.RefactorJob.filter({ job_id: jobId });
  if (!jobs || jobs.length === 0) throw new Error("RefactorJob not found: " + jobId);
  const job = jobs[0];

  await svc.entities.RefactorJob.update(job.id, { status: "planning" });

  const planResponse = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous refactoring planner. Generate a detailed refactoring plan for this issue:

TARGET: ${job.target_name} (${job.target_type})
ISSUE TYPE: ${job.issue_type}
SEVERITY: ${job.severity}
ISSUE DESCRIPTION: ${job.issue_description}
SCAN DATA: ${job.scan_data || "N/A"}

Generate a specific, actionable refactoring plan. Return a JSON object with:
{
  "plan_summary": "1-2 sentence summary",
  "steps": ["step 1", "step 2", ...],
  "files_to_modify": ["file path 1", ...],
  "files_to_create": [{"path": "file path", "purpose": "what it does"}],
  "estimated_improvement": "what improves",
  "risk_level": "low | medium | high",
  "rollback_strategy": "how to undo"
}`,
    response_json_schema: {
      type: "object",
      properties: {
        plan_summary: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
        files_to_modify: { type: "array", items: { type: "string" } },
        files_to_create: { type: "array", items: { type: "object", properties: { path: { type: "string" }, purpose: { type: "string" } } } },
        estimated_improvement: { type: "string" },
        risk_level: { type: "string" },
        rollback_strategy: { type: "string" },
      },
    },
  });

  const plan = planResponse as any;
  await svc.entities.RefactorJob.update(job.id, { status: "planned", refactor_plan: JSON.stringify(plan) });
  return { ok: true, job_id: jobId, plan };
}

// ============================================================
// PHASE 3: EXECUTE
// ============================================================
async function executeRefactor(base44: any, jobId: string): Promise<any> {
  const svc = base44.asServiceRole;
  const jobs = await svc.entities.RefactorJob.filter({ job_id: jobId });
  if (!jobs || jobs.length === 0) throw new Error("RefactorJob not found: " + jobId);
  const job = jobs[0];
  if (!job.refactor_plan) throw new Error("No plan found. Run plan phase first.");

  await svc.entities.RefactorJob.update(job.id, { status: "executing" });

  const codeResponse = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous code refactoring executor. Based on this refactoring plan, generate the refactored code.

TARGET: ${job.target_name} (${job.target_type})
ISSUE: ${job.issue_type} — ${job.issue_description}
PLAN: ${job.refactor_plan}

Generate the complete refactored code. Return a JSON object:
{
  "primary_file_path": "the main file path",
  "refactored_code": "the complete refactored code",
  "new_files": [{"path": "file path", "code": "the code"}],
  "changes_summary": "brief summary",
  "lines_before": 0,
  "lines_after": 0
}`,
    response_json_schema: {
      type: "object",
      properties: {
        primary_file_path: { type: "string" },
        refactored_code: { type: "string" },
        new_files: { type: "array", items: { type: "object", properties: { path: { type: "string" }, code: { type: "string" } } } },
        changes_summary: { type: "string" },
        lines_before: { type: "number" },
        lines_after: { type: "number" },
      },
    },
  });

  const code = codeResponse as any;
  await svc.entities.RefactorJob.update(job.id, {
    status: "executed",
    refactored_code: (code.refactored_code || "").slice(0, 50000),
    new_files: JSON.stringify(code.new_files || []),
  });
  return { ok: true, job_id: jobId, changes_summary: code.changes_summary, lines_before: code.lines_before, lines_after: code.lines_after };
}

// ============================================================
// PHASE 4: VALIDATE
// ============================================================
async function validateRefactor(base44: any, jobId: string): Promise<any> {
  const svc = base44.asServiceRole;
  const jobs = await svc.entities.RefactorJob.filter({ job_id: jobId });
  if (!jobs || jobs.length === 0) throw new Error("RefactorJob not found: " + jobId);
  const job = jobs[0];
  if (!job.refactored_code) throw new Error("No refactored code found. Run execute phase first.");

  await svc.entities.RefactorJob.update(job.id, { status: "validating" });

  const validationResponse = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an autonomous code validation engine. Validate this refactored code.

ORIGINAL ISSUE: ${job.issue_type} — ${job.issue_description}
REFACTORED CODE (first 8000 chars):
${(job.refactored_code || "").slice(0, 8000)}

Return:
{
  "passed": true/false,
  "score": 0-100,
  "syntax_valid": true/false,
  "functionality_preserved": true/false,
  "issue_resolved": true/false,
  "issues_found": ["issue 1", ...],
  "improvements": ["improvement 1", ...],
  "recommendation": "deploy | needs_revision | reject"
}`,
    response_json_schema: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        score: { type: "number" },
        syntax_valid: { type: "boolean" },
        functionality_preserved: { type: "boolean" },
        issue_resolved: { type: "boolean" },
        issues_found: { type: "array", items: { type: "string" } },
        improvements: { type: "array", items: { type: "string" } },
        recommendation: { type: "string" },
      },
    },
  });

  const validation = validationResponse as any;
  await svc.entities.RefactorJob.update(job.id, {
    status: validation.recommendation === "deploy" ? "validated" : "failed",
    validation_result: JSON.stringify(validation),
    validation_passed: validation.passed || false,
    validation_score: validation.score || 0,
    improvement_score: validation.score || 0,
  });
  return { ok: true, job_id: jobId, validation };
}

// ============================================================
// PHASE 5: FULL CYCLE
// ============================================================
async function fullCycle(base44: any): Promise<any> {
  const scanResult = await scanSystem(base44);
  if (!scanResult.jobs || scanResult.jobs.length === 0) {
    return { ok: true, message: "No refactoring opportunities found. System is clean.", scan: scanResult };
  }

  const processed: any[] = [];
  const maxJobs = Math.min(scanResult.jobs.length, 5);
  for (const jobInfo of scanResult.jobs.slice(0, maxJobs)) {
    try {
      await planRefactor(base44, jobInfo.job_id);
      await executeRefactor(base44, jobInfo.job_id);
      const validationResult = await validateRefactor(base44, jobInfo.job_id);
      processed.push({
        job_id: jobInfo.job_id,
        target: jobInfo.target,
        issue: jobInfo.issue,
        severity: jobInfo.severity,
        validated: validationResult.validation?.passed || false,
        score: validationResult.validation?.score || 0,
      });
    } catch (err: any) {
      processed.push({ job_id: jobInfo.job_id, target: jobInfo.target, error: (err.message || "").slice(0, 200) });
    }
  }

  return {
    ok: true,
    scan: { total_tested: scanResult.scan_stats.total_tested, successful: scanResult.scan_stats.successful, failed: scanResult.scan_stats.failed, jobs_created: scanResult.jobs_created },
    processed,
    summary: scanResult.summary,
  };
}

// ============================================================
// STATUS
// ============================================================
async function getStatus(base44: any): Promise<any> {
  const svc = base44.asServiceRole;
  const allJobs = await svc.entities.RefactorJob.list("-created_date", 500);

  const byStatus: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byIssueType: Record<string, number> = {};
  for (const job of allJobs) {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1;
    bySeverity[job.severity] = (bySeverity[job.severity] || 0) + 1;
    byIssueType[job.issue_type] = (byIssueType[job.issue_type] || 0) + 1;
  }

  const validated = allJobs.filter((j: any) => j.status === "validated");
  const avgScore = validated.length > 0
    ? Math.round(validated.reduce((sum: number, j: any) => sum + (j.validation_score || 0), 0) / validated.length)
    : 0;

  return {
    ok: true,
    total_jobs: allJobs.length,
    by_status: byStatus,
    by_severity: bySeverity,
    by_issue_type: byIssueType,
    validated_count: validated.length,
    avg_validation_score: avgScore,
    recent_jobs: allJobs.slice(0, 10).map((j: any) => ({
      id: j.id, job_id: j.job_id, target: j.target_name, issue: j.issue_type, severity: j.severity, status: j.status, score: j.validation_score,
    })),
  };
}

// ============================================================
// MAIN HANDLER
// ============================================================
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'status';
    const jobId = body.job_id;

    let result: any;
    switch (action) {
      case 'scan': result = await scanSystem(base44); break;
      case 'plan': result = await planRefactor(base44, jobId); break;
      case 'execute': result = await executeRefactor(base44, jobId); break;
      case 'validate': result = await validateRefactor(base44, jobId); break;
      case 'full_cycle': result = await fullCycle(base44); break;
      case 'status': result = await getStatus(base44); break;
      default: result = { ok: false, error: 'Unknown action: ' + action };
    }
    return Response.json(result);
  } catch (err: any) {
    return Response.json({
      ok: false,
      error: err.message || String(err),
      stack: err.stack?.split('\n').slice(0, 5).join('\n'),
    }, { status: 500 });
  }
}