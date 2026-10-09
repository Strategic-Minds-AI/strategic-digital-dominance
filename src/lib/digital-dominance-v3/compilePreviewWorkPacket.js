import { validateSitePack } from "./validateSitePack.js";

/**
 * Pure, safe handoff from a Site Pack to the future durable preview queue.
 * Never persists, deploys, publishes or sends external messages.
 *
 * A server adapter must validate authentication, tenant authorization,
 * rate limits and persist the returned work packet atomically.
 */
export function compilePreviewWorkPacket(pack, context = {}) {
  const validation = validateSitePack(pack);
  if (!validation.valid) return { accepted: false, errors: validation.errors };

  if (context.authenticated !== true || context.authorizedTenantId !== pack.tenant_id) {
    return { accepted: false, errors: [{ code: "TENANT_AUTH_REQUIRED", path: "tenant_id" }] };
  }

  if (context.replayKey && context.replayKey !== pack.workflow.idempotency_key) {
    return { accepted: false, errors: [{ code: "IDEMPOTENCY_MISMATCH", path: "workflow.idempotency_key" }] };
  }

  const pages = pack.pages.map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
    sections: page.sections,
    facts: page.facts,
    seo: {
      robots: "noindex,nofollow",
      sitemapEligible: false,
      canonicalUrl: null
    }
  }));

  return {
    accepted: true,
    errors: [],
    packet: {
      kind: "digital-dominance.preview-build.v1",
      job_id: pack.pack_id,
      tenant_id: pack.tenant_id,
      idempotency_key: pack.workflow.idempotency_key,
      action_class: "PREVIEW_WRITE",
      build_profile: "synthetic-no-publication",
      approval_required: true,
      no_publication: true,
      external_messaging_enabled: false,
      site: pack.site,
      pages,
      lead_capture: { enabled: Boolean(pack.lead_capture?.enabled), test_mode: true },
      social: { enabled: Boolean(pack.social), draft_only: true },
      validation_required: [
        "schema", "tenant-isolation", "seo-indexability", "accessibility",
        "responsive", "forms-synthetic", "visual", "security"
      ]
    }
  };
}
