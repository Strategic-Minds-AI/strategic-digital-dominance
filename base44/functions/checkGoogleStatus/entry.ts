import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

function acceptedProperties(domain: string, configured?: string) {
  const values = new Set([
    `sc-domain:${domain}`,
    `https://${domain}/`,
    `http://${domain}/`,
  ]);
  if (configured && configured !== "UNKNOWN") values.add(configured);
  return values;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const registryRows = await base44.asServiceRole.entities.CanonicalSiteRegistry.list(1);
    const registry = registryRows?.[0];
    const domain = String(registry?.canonical_domain || "").trim().toLowerCase();
    if (!domain) return Response.json({ connected: false, status: "BLOCKED", reason: "CANONICAL_DOMAIN_UNKNOWN" }, { status: 409 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");
    const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ connected: false, status: "BLOCKED", reason: "SEARCH_CONSOLE_UNREACHABLE", http_status: res.status }, { status: 502 });

    const expectedDomainProperty = `sc-domain:${domain}`;
    const allowed = acceptedProperties(domain, registry?.google_search_console_property);
    const sites = data.siteEntry || [];
    const match = sites.find((site: any) => allowed.has(String(site.siteUrl || "").toLowerCase()));

    return Response.json({
      connected: true,
      mode: "READ_ONLY",
      canonical_domain: domain,
      expectedDomainProperty,
      configured_property: registry?.google_search_console_property || "UNKNOWN",
      propertyFound: Boolean(match),
      siteUrl: match?.siteUrl || null,
      permissionLevel: match?.permissionLevel || null,
      available_properties: sites.map((site: any) => ({ siteUrl: site.siteUrl, permissionLevel: site.permissionLevel })),
    });
  } catch (error) {
    return Response.json({ connected: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, { status: 500 });
  }
}
