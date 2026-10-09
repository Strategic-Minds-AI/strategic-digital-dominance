import { createHash } from "node:crypto";

/**
 * X1 staging queue mapper. No database/network effects.
 * The authenticated server must resolve the tenant UUID independently;
 * client-supplied tenant IDs must never be treated as authorization.
 */
export function mapPreviewToX1Queue(packet, { tenantUuid, actorId, sourceSha } = {}) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const sha = /^[0-9a-f]{40}$/;
  if (!packet || packet.kind !== "digital-dominance.preview-build.v1" || packet.no_publication !== true ||
      packet.action_class !== "PREVIEW_WRITE" || !packet.idempotency_key || !packet.tenant_id ||
      !uuid.test(tenantUuid || "") || !actorId || (sourceSha && !sha.test(sourceSha))) {
    return { valid: false, errors: ["INVALID_QUEUE_MAPPING"] };
  }
  if (!Array.isArray(packet.pages) || packet.pages.length === 0 ||
      packet.pages.some(p => p.seo?.sitemapEligible !== false || p.seo?.robots !== "noindex,nofollow")) {
    return { valid: false, errors: ["PUBLICATION_GATE_FAILED"] };
  }
  const idem = createHash("sha256")
    .update(["dd-v3", tenantUuid.toLowerCase(), packet.idempotency_key].join(":"))
    .digest("hex");
  return {
    valid: true,
    record: {
      tenant_id: tenantUuid,
      work_packet_id: packet.job_id,
      task_id: packet.job_id,
      requested_by: actorId,
      action_class: "NON_PRODUCTION_MUTATION",
      required_capabilities: ["dd_v3_preview_renderer"],
      payload: { ...packet, tenant_id: tenantUuid, external_tenant_ref: packet.tenant_id },
      source_sha: sourceSha || null,
      idempotency_key: idem,
      status: "PENDING",
      priority: 100,
      max_attempts: 3,
      mission_id: "DIGITAL-DOMINANCE-V3"
    }
  };
}
