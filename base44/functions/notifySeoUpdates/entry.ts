import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { logStep } from '../../shared/sopLog.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "dry_run");
    if (!new Set(["dry_run", "execute"]).has(mode)) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "INVALID_MODE" }, { status: 400 });
    }

    const registryRows = await svc.entities.CanonicalSiteRegistry.list(1);
    const registry = registryRows?.[0];
    const domain = String(registry?.canonical_domain || "").trim().toLowerCase();
    if (!domain || domain.endsWith(".base44.app")) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "CANONICAL_DOMAIN_UNAVAILABLE" }, { status: 409 });
    }
    const siteUrl = `https://${domain}`;
    const windowMin = Math.min(Math.max(Number(body.window_minutes) || 35, 1), 1440);
    const since = new Date(Date.now() - windowMin * 60 * 1000).toISOString();
    const all = await svc.entities.SeoContent.list(700);
    const recent = all.filter((page: any) => {
      const updated = page.updated_date || page.created_date || "";
      return updated && updated >= since;
    });
    const urls = [...new Set(recent.map((page: any) => {
      const route = page.route || (page.slug ? `/${page.slug}` : "");
      if (!route) return null;
      const clean = route.startsWith("/") ? route : `/${route}`;
      return siteUrl + clean;
    }).filter(Boolean))];

    const plan = {
      ok: true,
      mode,
      action_class: mode === "execute" ? "PROTECTED" : "READ",
      site_url: siteUrl,
      window_minutes: windowMin,
      recent_pages: recent.length,
      urls_planned: urls.length,
      sample_urls: urls.slice(0, 10),
      sitemap: `${siteUrl}/sitemap.xml`,
    };

    if (mode === "dry_run") return Response.json({ ...plan, writes_performed: 0 });
    if (body.approved_external_write !== true) {
      return Response.json({ ...plan, ok: false, status: "APPROVAL_REQUIRED", reason: "INDEX_NOTIFICATION_REQUIRES_OPERATOR_APPROVAL", writes_performed: 0 }, { status: 403 });
    }

    const indexNowKey = process.env.INDEXNOW_KEY || "";
    let indexNow: any = { ok: false, status: 0, detail: "INDEXNOW_KEY_UNAVAILABLE" };
    if (urls.length && indexNowKey) {
      const response = await fetch("https://api.indexnow.org/IndexNow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: domain,
          key: indexNowKey,
          keyLocation: `${siteUrl}/${indexNowKey}.txt`,
          urlList: urls.slice(0, 1000),
        }),
      });
      indexNow = { ok: response.ok || response.status === 202, status: response.status };
    }

    let gsc: any = { ok: false, status: 0, detail: "GSC_CONNECTOR_UNAVAILABLE" };
    try {
      const conn = await svc.connectors.getConnection("google_search_console");
      const configured = String(registry?.google_search_console_property || "").trim();
      const property = configured && configured !== "UNKNOWN" ? configured : `sc-domain:${domain}`;
      const feed = `${siteUrl}/sitemap.xml`;
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(feed)}`,
        { method: "PUT", headers: { Authorization: `Bearer ${conn.accessToken}` } }
      );
      gsc = { ok: response.ok, status: response.status, property };
    } catch (error) {
      gsc = { ok: false, status: 0, detail: error instanceof Error ? error.message : "GSC_SUBMISSION_FAILED" };
    }

    await logStep(base44, {
      category: "seo",
      action: "Approved SEO notification execution",
      detail: `${urls.length} URL(s) evaluated for external notification`,
      meta: `indexNow:${indexNow.status} gsc:${gsc.status} host:${domain}`,
      source: "notifySeoUpdates",
    });

    return Response.json({ ...plan, status: "EXECUTED", writes_performed: Number(indexNow.ok) + Number(gsc.ok), indexNow, gsc });
  } catch (error) {
    return Response.json({ ok: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR", writes_performed: 0 }, { status: 500 });
  }
}
