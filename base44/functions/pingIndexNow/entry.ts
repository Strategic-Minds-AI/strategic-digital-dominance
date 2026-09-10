import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";

const SITES = ["https://epoxyquotenearme.com", "https://epoxyquotenearme.base44.app"];
const INDEXNOW_KEY = "a3e6350908f1c2d4e6b8a0123456789a";
const HOST = "epoxyquotenearme.com";

// Lightweight IndexNow ping — accepts a single URL or array of URLs and
// submits them to IndexNow (the protocol Bing, Yandex, Seznam & Naver use
// for real-time URL discovery). Called automatically by the Sitemap
// Auto-Update workflow whenever a new GeneratedPage is created, so search
// engines know about the new page within minutes instead of waiting for
// the next crawl cycle.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Accept either { url: "..." } or { urls: [...] }
    let urls: string[] = [];
    if (body.url) urls = [body.url];
    else if (body.urls && Array.isArray(body.urls)) urls = body.urls;
    else return Response.json({ error: "Provide 'url' or 'urls'" }, { status: 400 });

    // Only allow URLs from our own domains (prevent abuse)
    urls = urls.filter((u) => u && SITES.some((s) => u && u.startsWith(s)));
    if (!urls.length) return Response.json({ error: "No valid site URLs" }, { status: 400 });

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://epoxyquotenearme.com/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const post = async (endpoint: string) => {
      try {
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });
        return { status: r.status, ok: r.ok || r.status === 202 };
      } catch (e) {
        return { status: 0, ok: false, error: e.message };
      }
    };

    const [central, yandex] = await Promise.all([
      post("https://api.indexnow.org/IndexNow"),
      post("https://yandex.com/indexnow"),
    ]);

    await logStep(base44, {
      category: "seo",
      action: "IndexNow ping for new page",
      detail: `${urls.length} URL(s): ${urls.join(", ")}`,
      meta: `central:${central.status} yandex:${yandex.status}`,
      source: "pingIndexNow",
    });

    return Response.json({
      ok: true,
      urls: urls.length,
      indexNow: central,
      yandex,
      pingedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}