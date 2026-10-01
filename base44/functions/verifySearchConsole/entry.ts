import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

async function getAccessToken(base44: any) {
  const list = await base44.asServiceRole.entities.AppSettings.list(1);
  const refreshToken = list[0]?.google_refresh_token;
  if (!refreshToken) throw new Error("GOOGLE_REFRESH_TOKEN_UNAVAILABLE");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GOOGLE_OAUTH_CONFIGURATION_UNAVAILABLE");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("TOKEN_REFRESH_FAILED");
  return data.access_token;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const registryRows = await base44.asServiceRole.entities.CanonicalSiteRegistry.list(1);
    const registry = registryRows?.[0];
    const domain = String(registry?.canonical_domain || "").trim().toLowerCase();
    if (!domain) return Response.json({ ok: false, status: "BLOCKED", reason: "CANONICAL_DOMAIN_UNKNOWN" }, { status: 409 });

    const siteUrl = `https://${domain}`;
    if (body.approved_protected_action !== true) {
      return Response.json({
        ok: false,
        status: "APPROVAL_REQUIRED",
        action_class: "PROTECTED",
        siteUrl,
        reason: "SEARCH_CONSOLE_OWNERSHIP_VERIFICATION_REQUIRES_OPERATOR_APPROVAL",
      }, { status: 403 });
    }

    const accessToken = await getAccessToken(base44);
    const tokenRes = await fetch("https://www.googleapis.com/siteVerification/v1/token?verificationMethod=META", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ site: { type: "SITE", identifier: siteUrl } }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.token) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "VERIFICATION_TOKEN_REQUEST_FAILED", http_status: tokenRes.status }, { status: 502 });
    }

    const verifyToken = tokenData.token;
    const settings = await base44.asServiceRole.entities.AppSettings.list(1);
    const current = settings[0];
    if (current?.id) {
      await base44.asServiceRole.entities.AppSettings.update(current.id, { google_site_verification: verifyToken });
    } else {
      await base44.asServiceRole.entities.AppSettings.create({ google_site_verification: verifyToken });
    }

    const verifyRes = await fetch("https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=META", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ site: { type: "SITE", identifier: siteUrl } }),
    });
    const verifyData = await verifyRes.json();
    const verified = verifyRes.ok && Boolean(verifyData?.ownershipLevel);

    let propertyAdded = false;
    if (verified) {
      const property = registry?.google_search_console_property && registry.google_search_console_property !== "UNKNOWN"
        ? registry.google_search_console_property
        : siteUrl + "/";
      const addRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: property }),
      });
      propertyAdded = addRes.ok;
    }

    return Response.json({
      ok: verified,
      status: verified ? "VERIFIED" : "BLOCKED",
      action_class: "PROTECTED",
      siteUrl,
      verified,
      propertyAdded,
      verification_token_stored: true,
    }, { status: verified ? 200 : 502 });
  } catch (error) {
    return Response.json({ ok: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 500 });
  }
}
