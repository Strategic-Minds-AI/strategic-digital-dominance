import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";

const SITE = "https://epoxyquotenearme.base44.app";
const SITEMAP = `${SITE}/sitemap.xml`;
// IndexNow key — the matching key file is hosted at /a3e6350908f1c2d4e6b8a0123456789a.txt
const INDEXNOW_KEY = "a3e6350908f1c2d4e6b8a0123456789a";

const URLS = [
  `${SITE}/`,
  `${SITE}/estimate`,
  `${SITE}/funnel`,
  `${SITE}/how-it-works`,
  `${SITE}/gallery`,
  `${SITE}/reviews`,
  `${SITE}/about`,
  `${SITE}/contact`,
  `${SITE}/locations`,
  `${SITE}/color-charts`,
  `${SITE}/guides`,
  `${SITE}/epoxy-garage-floor-cost`,
  `${SITE}/2-car-garage-epoxy-cost`,
  `${SITE}/3-car-garage-epoxy-cost`,
  `${SITE}/garage-floor-coating-cost`,
  `${SITE}/fl/pompano-beach`,
  `${SITE}/fl/miami`, `${SITE}/fl/tampa`, `${SITE}/fl/orlando-altamonte-springs`,
  `${SITE}/fl/pensacola`, `${SITE}/fl/fort-myers`, `${SITE}/fl/orlando-winter-garden`,
  `${SITE}/fl/naples`, `${SITE}/fl/port-st-lucie`, `${SITE}/fl/jacksonville`,
  `${SITE}/fl/sarasota`, `${SITE}/fl/daytona-beach`,
  `${SITE}/tx/austin`, `${SITE}/tx/amarillo`, `${SITE}/tx/dallas-allen`,
  `${SITE}/tx/dallas-euless`, `${SITE}/tx/houston`, `${SITE}/tx/south-houston`,
  `${SITE}/tx/san-antonio`, `${SITE}/tx/el-paso`, `${SITE}/tx/mcallen`,
  `${SITE}/va/portsmouth-tidewater`, `${SITE}/va/chantilly`, `${SITE}/dc/washington-dc`,
  `${SITE}/ny/marcy`, `${SITE}/ny/westchester`, `${SITE}/ny/long-island`,
  `${SITE}/nj/garfield`, `${SITE}/pa/greater-philadelphia`, `${SITE}/pa/pottsville`,
  `${SITE}/sc/charleston`, `${SITE}/sc/greenville`,
  `${SITE}/ga/atlanta-marietta`, `${SITE}/ga/savannah`, `${SITE}/ga/atlanta-stone-mountain`,
  `${SITE}/nc/charlotte`, `${SITE}/nc/raleigh`,
  `${SITE}/ok/oklahoma-city`, `${SITE}/wi/milwaukee`,
  `${SITE}/tn/nashville`, `${SITE}/tn/chattanooga`, `${SITE}/ky/louisville`,
  `${SITE}/ia/cedar-rapids`, `${SITE}/il/chicago`, `${SITE}/il/rockford`,
  `${SITE}/mi/bloomfield`, `${SITE}/co/denver-englewood`,
];

async function indexNowPost(endpoint) {
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "epoxyquotenearme.base44.app",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: URLS,
      }),
    });
    return { status: r.status, ok: r.ok || r.status === 202 };
  } catch (e) { return { status: 0, ok: false, error: e.message }; }
}

export default async function (req: Request): Promise<Response> {
  try {
    // Require an authenticated admin caller.
    const base44 = createClientFromRequest(req);

    // IndexNow is the single protocol consumed by Bing, Yandex, Seznam & Naver.
    // Hit the central endpoint plus Yandex's own endpoint for redundancy.
    const [central, yandex] = await Promise.all([
      indexNowPost("https://api.indexnow.org/IndexNow"),
      indexNowPost("https://yandex.com/indexnow"),
    ]);

    await logStep(base44, { category: "seo", action: "Submitted URLs to indexers", detail: `${URLS.length} URLs via IndexNow`, meta: `central:${central.status} yandex:${yandex.status}`, source: "submitToIndexers" });

    return Response.json({
      ok: true,
      urls: URLS.length,
      sitemap: SITEMAP,
      indexNow: central,
      yandex,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}