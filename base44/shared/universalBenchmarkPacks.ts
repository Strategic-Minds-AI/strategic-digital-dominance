// ═══════════════════════════════════════════════════════════════════════════
// XTREME UNIVERSAL BENCHMARK CONSTITUTION
// Generates benchmarks for ANY system type — website, SaaS, PWA, communications,
// AI product, marketplace, data system, browser system, financial, CRM, etc.
//
// Four layers:
//   LAYER 1 — Universal Core (applies to ALL systems)
//   LAYER 2 — System Type (applies to systems of a specific type)
//   LAYER 3 — System-Specific (from system manifest critical workflows)
//   LAYER 4 — External Standards (Google, OWASP, WCAG, Vercel, etc.)
// ═══════════════════════════════════════════════════════════════════════════

export interface UniversalBenchmarkDef {
  benchmark_id: string;
  category: string;
  name: string;
  description: string;
  target: string;
  measurement: string;
  comparator: string;
  severity: "P0" | "P1" | "P2" | "P3";
  mandatory: boolean;
  environment: "production" | "staging" | "preview";
  data_source: string;
  validator: string;
  evidence_required: boolean;
  freshness_requirement: string;
  auto_repair_allowed: boolean;
  benchmark_version: string;
  standard_source: string;
  enabled: boolean;
}

// ── LAYER 1: UNIVERSAL CORE ───────────────────────────────────────────────
// These benchmarks apply to EVERY system in the fleet, regardless of type.
const UNIVERSAL_CORE: UniversalBenchmarkDef[] = [
  // Architecture
  { benchmark_id: "UNI-ARCH-001", category: "universal_core", name: "System Manifest Exists", description: "System has a valid .xtreme/system.manifest.yaml", target: "manifest exists", measurement: "Check FleetSystem.manifest field", comparator: "exists", severity: "P0", mandatory: true, environment: "production", data_source: "FleetSystem", validator: "systemFactory", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
  { benchmark_id: "UNI-ARCH-002", category: "universal_core", name: "Repository Connected", description: "GitHub repository is connected and accessible", target: "repo accessible", measurement: "Check GitHub API for repo", comparator: "exists", severity: "P1", mandatory: true, environment: "production", data_source: "GitHub API", validator: "githubSync", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "GitHub", enabled: true },

  // Build
  { benchmark_id: "UNI-BUILD-001", category: "universal_core", name: "Build Passes", description: "System builds without errors", target: "build success", measurement: "Run build command", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "staging", data_source: "CI/CD", validator: "buildValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },

  // Tests
  { benchmark_id: "UNI-TEST-001", category: "universal_core", name: "Unit Tests Pass", description: "All unit tests pass", target: "100% pass", measurement: "Run test suite", comparator: "threshold", severity: "P1", mandatory: true, environment: "staging", data_source: "CI/CD", validator: "testValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },

  // Security
  { benchmark_id: "UNI-SEC-001", category: "universal_core", name: "No Secrets In Code", description: "No API keys, tokens, or secrets in source code", target: "0 secrets", measurement: "Scan repo for secret patterns", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "GitHub API", validator: "securityScanner", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "OWASP", enabled: true },
  { benchmark_id: "UNI-SEC-002", category: "universal_core", name: "RLS Enabled", description: "Row-level security is enabled on all data entities", target: "RLS on all entities", measurement: "Check entity schemas for RLS config", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "Entity schemas", validator: "rlsValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "OWASP", enabled: true },
  { benchmark_id: "UNI-SEC-003", category: "universal_core", name: "Authorization Enforced", description: "All write operations require proper authorization", target: "all writes authorized", measurement: "Audit write paths", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "API audit", validator: "authValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "OWASP", enabled: true },

  // Data Integrity
  { benchmark_id: "UNI-DATA-001", category: "universal_core", name: "No Duplicate Records", description: "No duplicate data records that should be unique", target: "0 duplicates", measurement: "Scan for duplicates", comparator: "exact_equality", severity: "P1", mandatory: true, environment: "production", data_source: "Database", validator: "dataQualityValidator", evidence_required: true, freshness_requirement: "6h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },

  // Observability
  { benchmark_id: "UNI-OBS-001", category: "universal_core", name: "Error Tracking Active", description: "Runtime errors are being tracked", target: "error tracking active", measurement: "Check for error tracking integration", comparator: "exists", severity: "P2", mandatory: false, environment: "production", data_source: "Logs", validator: "observabilityValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },

  // Source Parity
  { benchmark_id: "UNI-PARITY-001", category: "universal_core", name: "Source Parity", description: "Deployed code matches repository source", target: "source = deployed", measurement: "Compare deployed version to repo SHA", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "Deployment API + GitHub", validator: "sourceParityValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },

  // Deployment Parity
  { benchmark_id: "UNI-DEPLOY-001", category: "universal_core", name: "Deployment Parity", description: "Production deployment matches latest validated source", target: "production = latest validated", measurement: "Compare production deployment to latest release", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "Deployment API", validator: "deploymentParityValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "Vercel", enabled: true },

  // Rollback
  { benchmark_id: "UNI-ROLLBACK-001", category: "universal_core", name: "Rollback Capability", description: "System can be rolled back to previous version", target: "rollback possible", measurement: "Verify rollback mechanism exists", comparator: "exists", severity: "P1", mandatory: true, environment: "production", data_source: "Deployment API", validator: "rollbackValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },

  // Documentation
  { benchmark_id: "UNI-DOC-001", category: "universal_core", name: "System Documented", description: "System has architecture documentation", target: "docs exist", measurement: "Check for architecture docs", comparator: "exists", severity: "P2", mandatory: false, environment: "production", data_source: "Google Drive", validator: "docValidator", evidence_required: true, freshness_requirement: "7d", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
];

// ── LAYER 2: SYSTEM TYPE BENCHMARKS ─────────────────────────────────────────

const WEBSITE_BENCHMARKS: UniversalBenchmarkDef[] = [
  { benchmark_id: "WEB-SEO-001", category: "web", name: "Canonical URLs Correct", description: "All pages have correct canonical URLs", target: "0 non-canonical", measurement: "Scan pages for canonical tags", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "DOM scan", validator: "seoValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "Google", enabled: true },
  { benchmark_id: "WEB-SEO-002", category: "web", name: "Sitemap Valid", description: "Sitemap.xml is valid and up to date", target: "valid sitemap", measurement: "Fetch and parse sitemap", comparator: "exists", severity: "P1", mandatory: true, environment: "production", data_source: "HTTP", validator: "sitemapValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "Google", enabled: true },
  { benchmark_id: "WEB-SEO-003", category: "web", name: "Robots.txt Correct", description: "Robots.txt is correctly configured", target: "valid robots.txt", measurement: "Fetch robots.txt", comparator: "exists", severity: "P1", mandatory: true, environment: "production", data_source: "HTTP", validator: "robotsValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "Google", enabled: true },
  { benchmark_id: "WEB-PERF-001", category: "web", name: "LCP Under 2.5s", description: "Largest Contentful Paint under 2.5 seconds", target: "<2500ms", measurement: "Core Web Vitals", comparator: "threshold", severity: "P1", mandatory: true, environment: "production", data_source: "Core Web Vitals API", validator: "performanceValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "Google", enabled: true },
  { benchmark_id: "WEB-PERF-002", category: "web", name: "CLS Under 0.1", description: "Cumulative Layout Shift under 0.1", target: "<0.1", measurement: "Core Web Vitals", comparator: "threshold", severity: "P1", mandatory: true, environment: "production", data_source: "Core Web Vitals API", validator: "performanceValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "Google", enabled: true },
  { benchmark_id: "WEB-A11Y-001", category: "web", name: "WCAG 2.1 AA Compliance", description: "Pages meet WCAG 2.1 AA accessibility standards", target: "0 violations", measurement: "Accessibility scan", comparator: "threshold", severity: "P2", mandatory: false, environment: "production", data_source: "Browser scan", validator: "accessibilityValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "WCAG", enabled: true },
];

const SAAS_BENCHMARKS: UniversalBenchmarkDef[] = [
  { benchmark_id: "SAAS-AUTH-001", category: "saas", name: "Multi-Tenant Isolation", description: "Tenant data is properly isolated", target: "0 cross-tenant leaks", measurement: "RLS audit", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "Database", validator: "rlsValidator", evidence_required: true, freshness_requirement: "24h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "OWASP", enabled: true },
  { benchmark_id: "SAAS-BILL-001", category: "saas", name: "Billing Integration Active", description: "Payment processing is functional", target: "payments working", measurement: "Test checkout flow", comparator: "exists", severity: "P0", mandatory: true, environment: "production", data_source: "Payment API", validator: "billingValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: false, benchmark_version: "1.0", standard_source: "Stripe/Wix", enabled: true },
];

const COMMUNICATIONS_BENCHMARKS: UniversalBenchmarkDef[] = [
  { benchmark_id: "COMM-DELIVERY-001", category: "communications", name: "Message Delivery Rate", description: "Messages are delivered successfully", target: ">99% delivery", measurement: "Check delivery receipts", comparator: "threshold", severity: "P0", mandatory: true, environment: "production", data_source: "Message API", validator: "deliveryValidator", evidence_required: true, freshness_requirement: "5min", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
  { benchmark_id: "COMM-LATENCY-001", category: "communications", name: "Message Latency", description: "Message delivery latency under threshold", target: "<30s", measurement: "Measure delivery time", comparator: "threshold", severity: "P1", mandatory: true, environment: "production", data_source: "Message API", validator: "latencyValidator", evidence_required: true, freshness_requirement: "5min", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
];

const AI_PRODUCT_BENCHMARKS: UniversalBenchmarkDef[] = [
  { benchmark_id: "AI-COST-001", category: "ai_product", name: "Cost Tracking Active", description: "AI model costs are tracked per system", target: "cost tracked", measurement: "Check cost events", comparator: "exists", severity: "P1", mandatory: true, environment: "production", data_source: "Cost events", validator: "costValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
  { benchmark_id: "AI-HALLUC-001", category: "ai_product", name: "Hallucination Prevention", description: "AI outputs are validated against source data", target: "0 hallucinations", measurement: "Output validation tests", comparator: "threshold", severity: "P0", mandatory: true, environment: "production", data_source: "Validation tests", validator: "hallucinationValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
];

const LEAD_GEN_BENCHMARKS: UniversalBenchmarkDef[] = [
  { benchmark_id: "LEAD-PIPELINE-001", category: "lead_generation", name: "Lead Capture Functional", description: "Lead capture forms are working", target: "leads being captured", measurement: "Check for recent leads", comparator: "exists", severity: "P0", mandatory: true, environment: "production", data_source: "Lead entity", validator: "leadValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
  { benchmark_id: "LEAD-FOLLOWUP-001", category: "lead_generation", name: "Lead Follow-Up Active", description: "Leads are being followed up within SLA", target: "<24h follow-up", measurement: "Check follow-up times", comparator: "threshold", severity: "P1", mandatory: true, environment: "production", data_source: "Lead entity", validator: "followUpValidator", evidence_required: true, freshness_requirement: "1h", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
];

const CONTROL_PLANE_BENCHMARKS: UniversalBenchmarkDef[] = [
  { benchmark_id: "CTRL-HEARTBEAT-001", category: "control_plane", name: "Fleet Heartbeat Active", description: "Fleet Alpha Prime heartbeat is firing", target: "<5min interval", measurement: "Check last heartbeat", comparator: "threshold", severity: "P0", mandatory: true, environment: "production", data_source: "Heartbeat entity", validator: "heartbeatValidator", evidence_required: true, freshness_requirement: "5min", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
  { benchmark_id: "CTRL-FLEET-001", category: "control_plane", name: "All Systems Registered", description: "All active systems are registered in fleet", target: "all systems registered", measurement: "Compare active systems to registry", comparator: "exact_equality", severity: "P0", mandatory: true, environment: "production", data_source: "FleetSystem entity", validator: "fleetValidator", evidence_required: true, freshness_requirement: "5min", auto_repair_allowed: true, benchmark_version: "1.0", standard_source: "XTREME", enabled: true },
];

// ── BENCHMARK GENERATOR ─────────────────────────────────────────────────────

export function getUniversalBenchmarks(systemType: string): UniversalBenchmarkDef[] {
  const benchmarks = [...UNIVERSAL_CORE];

  switch (systemType) {
    case "website":
    case "pwa":
      benchmarks.push(...WEBSITE_BENCHMARKS);
      break;
    case "saas":
      benchmarks.push(...SAAS_BENCHMARKS, ...WEBSITE_BENCHMARKS);
      break;
    case "communications":
      benchmarks.push(...COMMUNICATIONS_BENCHMARKS);
      break;
    case "ai_product":
    case "agent_platform":
      benchmarks.push(...AI_PRODUCT_BENCHMARKS);
      break;
    case "lead_generation":
      benchmarks.push(...LEAD_GEN_BENCHMARKS, ...WEBSITE_BENCHMARKS);
      break;
    case "control_plane":
      benchmarks.push(...CONTROL_PLANE_BENCHMARKS);
      break;
    case "marketplace":
      benchmarks.push(...SAAS_BENCHMARKS, ...WEBSITE_BENCHMARKS, ...LEAD_GEN_BENCHMARKS);
      break;
    default:
      // Universal core only
      break;
  }

  return benchmarks;
}

export function getBenchmarkCategories(systemType: string): string[] {
  const benchmarks = getUniversalBenchmarks(systemType);
  return [...new Set(benchmarks.map((b) => b.category))];
}