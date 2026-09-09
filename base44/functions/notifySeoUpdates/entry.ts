import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { logStep } from '../../shared/sopLog.ts';

// ─────────────────────────────────────────────────────────────────────────────
// notifySeoUpdates — notifies Google the moment page titles / meta descriptions
// change, so updated pages get re-indexed faster instead of waiting for the next
// organic crawl. Runs on a schedule (SEO Update Notifier workflow, every 30 min).
//
// What it does:
//   1. Resolves the canonical site URL from AppSettings (seo.site_url), falling
//      back to the published app URL.
//   2. Finds SeoContent records whose title/description changed within the
//      configured window (default 35 min — slightly wider than the 30-min cron
//      to catch edge-case timing).
//   3. Pings IndexNow (Bing/Yandex instant indexing) with every changed URL.
//   4. Re-submits the sitemap to Google Search Console via the Search Console
//      API connector (best-effort — skipped if the connector isn't connected).
//   5. Logs a SopLog receipt for provenance.
//
// Invoke: base44.functions.invoke('notifySeoUpdates', { window_minutes?: 35 })
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_SITE = "https://epoxyquotenearme.base44.app";
const INDEXNOW_KEY = "a3e6350908f1c2d4e6b8a0123456789a";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const windowMin = Number(body.window_minutes) || 35;

    // 1. Resolve canonical site URL from AppSettings (custom domain), else published URL.
    let siteUrl = FALLBACK_SITE;
    try {
      const settings = await svc.entities.AppSettings.list(1);
      const s = settings[0];
      if (s?.seo?.site_url) siteUrl = String(s.seo.site_url).replace(/\/+$/, "");
    } catch (e) {
      console.error("[notifySeoUpdates] AppSettings read failed:", e.message);
    }
    const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");

    // 2. Find recently-updated SeoContent (title/description changed within window).
    const since = new Date(Date.now() - windowMin * 60 * 1000).toISOString();
    const all = await svc.entities.SeoContent.list(700);
    const recent = all.filter((p) => {
      const upd = p.updated_date || p.created_date || "";
      return upd && upd >= since;
    });

    const urls = recent.map((p) => {
      const route = p.route || (p.slug ? `/${p.slug}` : "") || "";
      const clean = route.startsWith("/") ? route : `/${route}`;
      return `${siteUrl}${clean}`;
    }).filter((u) => u && u !== siteUrl + "/");

    // 3. IndexNow ping (Bing / Yandex instant indexing) — batched to avoid rate limits.
    let indexNow: any = { status: 0, ok: false, detail: "no urls" };
    if (urls.length) {
      const BATCH = 200;
      const results: any[] = [];
      for (let i = 0; i < urls.length; i += BATCH) {
        const chunk = urls.slice(i, i + BATCH);
        try {
          const r = await fetch("https://api.indexnow.org/IndexNow", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              host,
              key: INDEXNOW_KEY,
              keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
              urlList: chunk,
            }),
          });
          results.push({ status: r.status, ok: r.ok || r.status === 202, count: chunk.length });
        } catch (e) {
          results.push({ status: 0, ok: false, count: chunk.length, error: e.message });
        }
      }
      const okBatches = results.filter((r) => r.ok).length;
      indexNow = {
        status: results[0]?.status || 0,
        ok: okBatches > 0,
        detail: `${okBatches}/${results.length} batches ok (${results.map((r) => r.status).join(",")})`,
      };
    }

    // 4. GSC sitemap re-submission via the Search Console API connector (best-effort).
    //    Tries the URL-prefix property first, then the sc-domain: form, so it works
    //    whichever way the site is verified in Search Console.
    let gsc: any = { status: 0, ok: false, detail: "skipped" };
    try {
      const conn = await svc.connectors.getConnection("google_search_console");
      if (conn?.accessToken) {
        const feedEnc = encodeURIComponent("sitemap.xml");
        const candidates = [
          encodeURIComponent(siteUrl.endsWith("/") ? siteUrl : siteUrl + "/"),
          encodeURIComponent(`sc-domain:${host}`),
        ];
        for (const siteEnc of candidates) {
          const r = await fetch(
            `https://www.googleapis.com/webmasters/v3/sites/${siteEnc}/sitemaps/${feedEnc}`,
            { method: "PUT", headers: { Authorization: `Bearer ${conn.accessToken}` } }
          );
          if (r.ok) {
            gsc = { status: r.status, ok: true, detail: `sitemap submitted (${decodeURIComponent(siteEnc)})` };
            break;
          }
          gsc = {
            status: r.status,
            ok: false,
            detail: (await r.text().catch(() => "")).slice(0, 200),
            property: decodeURIComponent(siteEnc),
          };
        }
      } else {
        gsc = { status: 0, ok: false, detail: "connector not connected" };
      }
    } catch (e) {
      gsc = { status: 0, ok: false, detail: e.message };
    }

    // 5. Log receipt.
    await logStep(base44, {
      category: "seo",
      action: "GSC + IndexNow notification for SEO updates",
      detail: `${recent.length} recently-updated page(s) in last ${windowMin} min · ${urls.length} URLs notified`,
      meta: `indexNow:${indexNow.status} gsc:${gsc.status} host:${host}`,
      source: "notifySeoUpdates",
    });

    return Response.json({
      ok: true,
      site_url: siteUrl,
      host,
      window_minutes: windowMin,
      recent_pages: recent.length,
      urls_notified: urls.length,
      sample_urls: urls.slice(0, 5),
      indexNow,
      gsc,
      notifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[notifySeoUpdates] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}