import { compilePreviewWorkPacket } from "./compilePreviewWorkPacket.js";

/**
 * Framework-neutral preview intake. All adapters must be server-side.
 * authenticate() must validate a real token/session and return tenantId.
 * enqueueOnce() must atomically enforce unique (tenantId,idempotencyKey).
 * checkRateLimit() must implement a shared (not process-local) limiter.
 */
export async function acceptPreviewSitePack(request, adapters) {
  const reply = (status, payload) => ({ status, body: payload });
  if (request?.method !== "POST") return reply(405, { error: "METHOD_NOT_ALLOWED" });
  if (!adapters || !["authenticate","checkRateLimit","enqueueOnce"].every(k => typeof adapters[k] === "function")) {
    return reply(503, { error: "BACKEND_NOT_CONFIGURED" });
  }
  const raw = request.body;
  if (typeof raw !== "string" || Buffer.byteLength(raw, "utf8") > 262144) {
    return reply(413, { error: "INVALID_BODY_SIZE" });
  }
  let input;
  try { input = JSON.parse(raw); } catch { return reply(400, { error: "INVALID_JSON" }); }
  let principal;
  try { principal = await adapters.authenticate(request); }
  catch { return reply(401, { error: "UNAUTHENTICATED" }); }
  if (!principal?.subject || !principal?.tenantId) return reply(401, { error: "UNAUTHENTICATED" });
  if (principal.tenantId !== input?.tenant_id) return reply(403, { error: "TENANT_MISMATCH" });
  const result = compilePreviewWorkPacket(input, { authenticated: true, authorizedTenantId: principal.tenantId });
  if (!result.accepted) return reply(422, { error: "INVALID_SITE_PACK", details: result.errors });
  try {
    const allowance = await adapters.checkRateLimit({ tenantId: principal.tenantId, subject: principal.subject });
    if (allowance !== true) return reply(429, { error: "RATE_LIMITED" });
    const enqueue = await adapters.enqueueOnce({
      tenantId: principal.tenantId,
      idempotencyKey: result.packet.idempotency_key,
      packet: result.packet,
      actorId: principal.subject
    });
    if (!enqueue?.jobId || !["created","existing"].includes(enqueue?.state)) throw new Error("Queue adapter contract failure");
    return reply(enqueue.state === "created" ? 202 : 200, {
      job_id: enqueue.jobId, state: enqueue.state, accepted: true, mode: "preview"
    });
  } catch {
    return reply(503, { error: "QUEUE_UNAVAILABLE" });
  }
}
