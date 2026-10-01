import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";

type JsonMap = Record<string, any>;

const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,63}$/;
const cleanDomain = (value: unknown) => String(value || "").trim().toLowerCase().replace(/^https?:\\/\\//, "").replace(/\\/$/, "");
const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

function requireDomain(value: unknown): string {
  const domain = cleanDomain(value);
  if (!DOMAIN_RE.test(domain)) throw new Error("INVALID_DOMAIN");
  return domain;
}

function exactGscProperty(sites: JsonMap[], domain: string): JsonMap | null {
  const candidates = new Set([`sc-domain:${domain}`, `https://${domain}/`, `http://${domain}/`]);
  return sites.find((site) => candidates.has(String(site.siteUrl || "").toLowerCase())) || null;
}

async function listGsc(base44: any) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");
  const response = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`GSC_LIST_FAILED_${response.status}`);
  const payload = await response.json();
  return { accessToken, sites: payload.siteEntry || [] };
}

async function listGa4(base44: any) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");
  const response = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(`GA4_LIST_FAILED_${response.status}`);
  const payload = await response.json();
  const properties = [];
  for (const account of payload.accountSummaries || []) {
    for (const property of account.propertySummaries || []) {
      properties.push({
        property_id: String(property.property || "").replace(/^properties\\//, ""),
        display_name: property.displayName || "",
        account_name: account.displayName || "",
      });
    }
  }
  return { accessToken, properties };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "discover");

    if (action === "discover") {
      const [gsc, ga4] = await Promise.allSettled([listGsc(base44), listGa4(base44)]);
      return Response.json({
        ok: true,
        mode: "READ_ONLY",
        search_console: gsc.status === "fulfilled" ? { connected: true, properties: gsc.value.sites } : { connected: false, error: String(gsc.reason?.message || gsc.reason) },
        ga4: ga4.status === "fulfilled" ? { connected: true, properties: ga4.value.properties } : { connected: false, error: String(ga4.reason?.message || ga4.reason) },
      });
    }

    if (action === "gscSearchAnalytics") {
      const domain = requireDomain(body.domain);
      const days = Math.min(Math.max(Number(body.days || 28), 1), 90);
      const { accessToken, sites } = await listGsc(base44);
      const matched = exactGscProperty(sites, domain);
      if (!matched) {
        return Response.json({ ok: false, status: "BLOCKED", reason: "EXACT_GSC_PROPERTY_NOT_FOUND", domain }, { status: 404 });
      }
      const end = new Date();
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - (days - 1));
      const siteUrl = String(matched.siteUrl);
      const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: dateOnly(start),
          endDate: dateOnly(end),
          dimensions: ["query", "page"],
          rowLimit: Math.min(Math.max(Number(body.row_limit || 1000), 1), 25000),
        }),
      });
      if (!response.ok) throw new Error(`GSC_QUERY_FAILED_${response.status}`);
      const payload = await response.json();
      return Response.json({ ok: true, mode: "READ_ONLY", domain, siteUrl, date_range: { start: dateOnly(start), end: dateOnly(end) }, rows: payload.rows || [] });
    }

    if (action === "ga4Report") {
      const propertyId = String(body.property_id || "").replace(/^properties\\//, "");
      if (!/^\\d+$/.test(propertyId)) return Response.json({ ok: false, status: "BLOCKED", reason: "EXACT_GA4_PROPERTY_ID_REQUIRED" }, { status: 400 });
      const days = Math.min(Math.max(Number(body.days || 28), 1), 90);
      const { accessToken, properties } = await listGa4(base44);
      if (!properties.some((property) => property.property_id === propertyId)) {
        return Response.json({ ok: false, status: "BLOCKED", reason: "GA4_PROPERTY_NOT_AVAILABLE", property_id: propertyId }, { status: 404 });
      }
      const end = new Date();
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - (days - 1));
      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: dateOnly(start), endDate: dateOnly(end) }],
          dimensions: [{ name: "landingPagePlusQueryString" }, { name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }, { name: "keyEvents" }],
          limit: Math.min(Math.max(Number(body.row_limit || 1000), 1), 10000),
        }),
      });
      if (!response.ok) throw new Error(`GA4_QUERY_FAILED_${response.status}`);
      const payload = await response.json();
      return Response.json({ ok: true, mode: "READ_ONLY", property_id: propertyId, date_range: { start: dateOnly(start), end: dateOnly(end) }, rows: payload.rows || [] });
    }

    return Response.json({ ok: false, error: "Unknown action. Use discover, gscSearchAnalytics, or ga4Report" }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 500 });
  }
}
