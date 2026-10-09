/**
 * Digital Dominance V3 Site Pack admission guard.
 * Pure, dependency-free guard for preview-intake; NOT an auth check.
 */
export function validateSitePack(pack) {
  const errors = [];
  const reject = (code, path) => errors.push({ code, path });
  if (!pack || typeof pack !== "object" || Array.isArray(pack)) {
    return { valid: false, errors: [{ code: "INVALID_PACK", path: "$" }] };
  }
  if (pack.schema_version !== "1.0.0") reject("UNSUPPORTED_VERSION", "schema_version");
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(pack.pack_id || "")) reject("INVALID_PACK_ID", "pack_id");
  if (typeof pack.tenant_id !== "string" || pack.tenant_id.length < 3) reject("INVALID_TENANT", "tenant_id");
  if (pack.workflow?.mode !== "preview" || pack.workflow?.approval_required !== true) {
    reject("PRODUCTION_NOT_ALLOWED", "workflow");
  }
  if (typeof pack.workflow?.idempotency_key !== "string" || pack.workflow.idempotency_key.length < 12) {
    reject("IDEMPOTENCY_REQUIRED", "workflow.idempotency_key");
  }
  if (!pack.site || typeof pack.site !== "object") reject("SITE_REQUIRED", "site");
  if (!Array.isArray(pack.pages) || pack.pages.length < 1 || pack.pages.length > 200) reject("INVALID_PAGES", "pages");
  for (const [index, page] of (Array.isArray(pack.pages) ? pack.pages : []).entries()) {
    const loc = `pages[${index}]`;
    if (!/^\/(?:[a-z0-9-]+\/)*$/.test(page?.path || "")) reject("INVALID_PATH", `${loc}.path`);
    if (!Array.isArray(page?.sections) || page.sections.length < 2) reject("INSUFFICIENT_CONTENT", `${loc}.sections`);
    if (page?.index_request === true) {
      reject("INDEXING_REQUIRES_INDEPENDENT_APPROVAL", `${loc}.index_request`);
    }
    if (page?.testimonials?.length || page?.reviews?.length) {
      reject("UNVERIFIED_SOCIAL_PROOF", loc);
    }
    for (const [j, section] of (Array.isArray(page?.sections) ? page.sections : []).entries()) {
      if (section?.kind === "proof") reject("PROOF_REQUIRES_MANUAL_VERIFICATION", `${loc}.sections[${j}]`);
      if (!section?.heading || !section?.body) reject("INCOMPLETE_SECTION", `${loc}.sections[${j}]`);
    }
    for (const [j, fact] of (Array.isArray(page?.facts) ? page.facts : []).entries()) {
      if (!fact?.claim || !/^https:\/\//.test(fact?.source_url || "") || !fact?.verified_at) {
        reject("UNSOURCED_FACT", `${loc}.facts[${j}]`);
      }
    }
  }
  if (pack.social && pack.social.draft_only !== true) reject("SOCIAL_PUBLISH_NOT_ALLOWED", "social");
  if (pack.lead_capture?.enabled && (!pack.lead_capture.consent_text || pack.lead_capture.test_mode !== true)) {
    reject("LIVE_LEADS_NOT_ALLOWED", "lead_capture");
  }
  return { valid: errors.length === 0, errors };
}
