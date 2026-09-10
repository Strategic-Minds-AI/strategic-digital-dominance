import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Light check: is the Search Console property for our domain present and verified?
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");
    // Fetch connected account email
    let accountEmail = null;
    try {
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        accountEmail = userData.email || null;
      }
    } catch {}
    const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: "Search Console not reachable", detail: data }, { status: 502 });
    const sites = data.siteEntry || [];
    const match = sites.find((s) => s.siteUrl.toLowerCase().includes("epoxygaragefloorestimate"));
    return Response.json({
      connected: true,
      accountEmail,
      propertyFound: !!match,
      siteUrl: match?.siteUrl || null,
      permissionLevel: match?.permissionLevel || null,
      allSites: sites.map((s) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}