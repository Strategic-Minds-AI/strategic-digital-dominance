import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

type Row = Record<string, any>;

const materialStatuses = new Set(["critical", "high"]);
const nowIso = () => new Date().toISOString();

function protectedDomainActions(domains: Row[]) {
  return domains
    .filter((row) => ["available", "purchased", "provisioning"].includes(String(row.status || "")))
    .map((row) => ({
      domain: row.domain,
      status: row.status,
      action_class: "PROTECTED",
      next_action: row.status === "available" ? "REQUEST_PURCHASE_APPROVAL" : "VERIFY_DOMAIN_LIFECYCLE",
    }));
}

function topOpportunities(rows: Row[]) {
  return [...rows]
    .filter((row) => ["VERIFIED", "PARTIAL"].includes(String(row.evidence_status || "")))
    .sort((a, b) => Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0))
    .slice(0, 10)
    .map((row) => ({
      opportunity_id: row.opportunity_id,
      keyword: row.keyword,
      scope_type: row.scope_type,
      scope_id: row.scope_id,
      score: Number(row.opportunity_score || 0),
      evidence_status: row.evidence_status,
      recommended_action: row.recommended_action || "REVIEW",
    }));
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "dry_run");
    if (!new Set(["dry_run", "execute"]).has(mode)) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "INVALID_MODE" }, { status: 400 });
    }
    if (mode === "execute" && body.approved_internal_write !== true) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "EXPLICIT_INTERNAL_WRITE_APPROVAL_REQUIRED" }, { status: 403 });
    }

    const svc = base44.asServiceRole;
    const settled = await Promise.allSettled([
      svc.entities.GeographyRegistry.list(1000),
      svc.entities.ServiceRegistry.list(1000),
      svc.entities.KeywordOpportunity.list("-opportunity_score", 500),
      svc.entities.DomainStrategy.list("-created_date", 500),
      svc.entities.SalesAttribution.list("-occurred_at", 500),
      svc.entities.SwarmAudit.list("-created_date", 200),
      svc.entities.ValidationReceipt.list("-timestamp", 200),
    ]);

    const rows = (index: number) => settled[index].status === "fulfilled" ? settled[index].value : [];
    const blockedSources = settled
      .map((item, index) => item.status === "rejected" ? index : -1)
      .filter((index) => index >= 0);
    const geographies = rows(0);
    const services = rows(1);
    const opportunities = rows(2);
    const domains = rows(3);
    const sales = rows(4);
    const audits = rows(5);
    const validation = rows(6);

    const severeAudits = audits.filter((audit: Row) => materialStatuses.has(String(audit.severity || "")) && !["fixed", "wont_fix", "accepted_risk"].includes(String(audit.status || "")));
    const failedValidation = validation.filter((receipt: Row) => ["FAIL", "BLOCKED", "MISSING_EVIDENCE"].includes(String(receipt.status || "")));
    const verifiedRevenue = sales.reduce((sum: number, row: Row) => sum + (Number.isFinite(Number(row.revenue)) ? Number(row.revenue) : 0), 0);
    const domainApprovals = protectedDomainActions(domains);
    const rankedOpportunities = topOpportunities(opportunities);

    const issues: Row[] = [];
    if (blockedSources.length) issues.push({ kind: "data_quality", severity: "high", summary: `${blockedSources.length} required registry reads are blocked` });
    if (!geographies.length) issues.push({ kind: "data_quality", severity: "high", summary: "Geography registry is empty" });
    if (!services.length) issues.push({ kind: "data_quality", severity: "high", summary: "Service registry is empty" });
    if (!opportunities.length) issues.push({ kind: "opportunity", severity: "medium", summary: "No keyword opportunities are loaded" });
    if (severeAudits.length) issues.push({ kind: "repair", severity: "critical", summary: `${severeAudits.length} critical/high audit findings remain open` });
    if (failedValidation.length) issues.push({ kind: "repair", severity: "high", summary: `${failedValidation.length} recent validation receipts are not PASS` });
    if (domainApprovals.length) issues.push({ kind: "approval", severity: "medium", summary: `${domainApprovals.length} domain lifecycle items require protected-action review` });

    const result = {
      ok: true,
      status: issues.some((issue) => issue.severity === "critical") ? "ATTENTION" : "READY",
      mode,
      action_class: mode === "dry_run" ? "READ" : "PROTECTED_INTERNAL_WRITE",
      generated_at: nowIso(),
      counts: {
        geographies: geographies.length,
        services: services.length,
        keyword_opportunities: opportunities.length,
        domains: domains.length,
        sales_attribution_records: sales.length,
        severe_audits: severeAudits.length,
        failed_validation_receipts: failedValidation.length,
      },
      verified_revenue: verifiedRevenue,
      top_opportunities: rankedOpportunities,
      protected_domain_actions: domainApprovals,
      issues,
      next_actions: [
        "POPULATE_VERIFIED_GEOGRAPHY_AND_SERVICE_REGISTRIES",
        "INGEST_EXACT_GSC_AND_GA4_READ_ONLY_EVIDENCE",
        "RANK_TOP_200_OPPORTUNITIES_PER_APPROVED_SCOPE",
        "GENERATE_SITESPECS_AND_PAGESPECS_AS_DRAFTS",
        "RUN_INDEX_ELIGIBILITY_AND_CANNIBALIZATION_VALIDATION",
      ],
      writes_performed: 0,
    };

    if (mode === "execute") {
      const cycleId = String(body.cycle_id || `nearme-reconcile-${Date.now()}`);
      const insight = await svc.entities.IntelligenceInsight.create({
        insight_id: `${cycleId}-summary`,
        cycle_id: cycleId,
        kind: issues.length ? "repair" : "opportunity",
        severity: issues.some((issue) => issue.severity === "critical") ? "critical" : "medium",
        evidence_status: blockedSources.length ? "PARTIAL" : "VERIFIED",
        title: "NearMe/NearYou reconciliation summary",
        summary: JSON.stringify({ counts: result.counts, issues, verified_revenue: verifiedRevenue }),
        evidence_refs: ["GeographyRegistry", "ServiceRegistry", "KeywordOpportunity", "DomainStrategy", "SalesAttribution", "ValidationReceipt"],
        recommended_actions: result.next_actions,
        status: "open",
        generated_at: result.generated_at,
      });
      return Response.json({ ...result, writes_performed: 1, insight_id: insight?.id || null });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ ok: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR", writes_performed: 0 }, { status: 500 });
  }
}
