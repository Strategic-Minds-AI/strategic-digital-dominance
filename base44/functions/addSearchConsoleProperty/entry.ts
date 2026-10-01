import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const registryRows = await base44.asServiceRole.entities.CanonicalSiteRegistry.list(1);
    const registry = registryRows?.[0];
    const domain = String(registry?.canonical_domain || "").trim().toLowerCase();
    if (!domain) return Response.json({ ok: false, status: "BLOCKED", reason: "CANONICAL_DOMAIN_UNKNOWN" }, { status: 409 });

    const configured = String(registry?.google_search_console_property || "").trim();
    const siteUrl = String(body.siteUrl || configured || `https://${domain}/`).trim();
    const allowed = new Set([`sc-domain:${domain}`, `https://${domain}/`, `http://${domain}/`]);
    if (configured && configured !== "UNKNOWN") allowed.add(configured);
    if (!allowed.has(siteUrl)) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "PROPERTY_DOES_NOT_MATCH_CANONICAL_DOMAIN", siteUrl }, { status: 400 });
    }

    if (body.approved_protected_action !== true) {
      return Response.json({
        ok: false,
        status: "APPROVAL_REQUIRED",
        action_class: "PROTECTED",
        siteUrl,
        reason: "SEARCH_CONSOLE_PROPERTY_MUTATION_REQUIRES_OPERATOR_APPROVAL",
      }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ siteUrl }),
    });
    const text = await res.text();
    return Response.json({
      ok: res.ok,
      status: res.ok ? "EXECUTED" : "BLOCKED",
      action_class: "PROTECTED",
      http_status: res.status,
      siteUrl,
      response_excerpt: text.slice(0, 500),
    }, { status: res.ok ? 200 : 502 });
  } catch (error) {
    return Response.json({ ok: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 500 });
  }
}
