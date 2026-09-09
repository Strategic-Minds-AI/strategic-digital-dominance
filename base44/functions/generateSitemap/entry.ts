import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";

const SITE = "https://epoxyquotenearme.base44.app";

// Static priority pages with their SEO config.
const STATIC_PATHS = [
  "/", "/estimate", "/funnel", "/how-it-works", "/gallery", "/reviews",
  "/about", "/contact", "/locations", "/color-charts", "/guides",
  "/epoxy-garage-floor-cost", "/2-car-garage-epoxy-cost",
  "/3-car-garage-epoxy-cost", "/garage-floor-coating-cost",
  "/fl/pompano-beach",
];

// Location page paths (state/city-slug) — mirrors SEO_LOCATIONS in seoConfig.
const LOCATION_PATHS = [
  "/fl/miami", "/fl/tampa", "/fl/orlando-altamonte-springs", "/fl/pensacola",
  "/fl/fort-myers", "/fl/orlando-winter-garden", "/fl/naples", "/fl/port-st-lucie",
  "/fl/jacksonville", "/fl/sarasota", "/fl/daytona-beach",
  "/tx/austin", "/tx/amarillo", "/tx/dallas-allen", "/tx/dallas-euless",
  "/tx/houston", "/tx/south-houston", "/tx/san-antonio", "/tx/el-paso", "/tx/mcallen",
  "/va/portsmouth-tidewater", "/va/chantilly", "/dc/washington-dc",
  "/ny/marcy", "/ny/westchester", "/ny/long-island",
  "/nj/garfield", "/pa/greater-philadelphia", "/pa/pottsville",
  "/sc/charleston", "/sc/greenville",
  "/ga/atlanta-marietta", "/ga/savannah", "/ga/atlanta-stone-mountain",
  "/nc/charlotte", "/nc/raleigh",
  "/ok/oklahoma-city", "/wi/milwaukee",
  "/tn/nashville", "/tn/chattanooga", "/ky/louisville",
  "/ia/cedar-rapids", "/il/chicago", "/il/rockford",
  "/mi/bloomfield", "/co/denver-englewood",
];

function urlEntry(path, lastmod, priority, changefreq) {
  return `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

// Generates a comprehensive, always-current sitemap XML from all indexable
// sources: static routes, programmatic location pages, and AI-generated
// content pages. Admin-triggered; the output can be copied into sitemap.xml
// or served directly to crawlers.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // No admin gate — sitemap data is all public (published pages).
    // Allows both admin dashboard calls and workflow service-role calls.

    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch all published GeneratedPage entries for dynamic content URLs.
    const generated = await base44.asServiceRole.entities.GeneratedPage.list(500);
    const published = generated.filter((g) => g.status !== "draft");

    const entries: string[] = [];

    // Static priority pages
    for (const path of STATIC_PATHS) {
      const priority = path === "/" ? "1.0" : "0.9";
      entries.push(urlEntry(path, now, priority, "weekly"));
    }

    // Location pages
    for (const path of LOCATION_PATHS) {
      entries.push(urlEntry(path, now, "0.8", "monthly"));
    }

    // AI-generated content pages — use their updated_date for lastmod
    for (const g of published) {
      const lastmod = (g.updated_date || g.created_date || now).split("T")[0];
      entries.push(urlEntry(`/${g.slug}`, lastmod, "0.7", "monthly"));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    await logStep(base44, {
      category: "seo",
      action: "Generated dynamic sitemap",
      detail: `${entries.length} URLs (${STATIC_PATHS.length} static, ${LOCATION_PATHS.length} location, ${published.length} generated)`,
      source: "generateSitemap",
    });

    return new Response(xml, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}