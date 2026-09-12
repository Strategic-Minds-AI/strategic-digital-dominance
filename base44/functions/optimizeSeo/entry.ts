import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";
import { generateText } from "../../shared/aiGateway.ts";

// AI-driven persistent SEO optimizer — Alpha Prime Phase 6B
// P0 FIX: Removed hardcoded "epoxygaragefloorestimate.com" and "Pompano Beach, FL and South Florida"
// P0 FIX: Uses CanonicalSiteRegistry for canonical domain
// P0 FIX: Uses CanonicalLocationRegistry for location-specific context
// P0 FIX: A Texas page no longer inherits South Florida optimization context
// P0 FIX: Uses page-specific Search Console query evidence (not global top_queries)

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const onlyRoute = body?.route;

    // Read canonical domain from CanonicalSiteRegistry
    const registryResults = await base44.asServiceRole.entities.CanonicalSiteRegistry.list(1);
    const registry = registryResults[0];
    const canonicalDomain = registry?.canonical_domain || "epoxyquotenearme.com";

    // Load location registry for location-specific context
    const locations = await base44.asServiceRole.entities.CanonicalLocationRegistry.list(500);
    const locationByPath = new Map();
    for (const loc of locations) {
      if (loc.canonical_path) {
        locationByPath.set(loc.canonical_path, loc);
      }
    }

    let records = await base44.asServiceRole.entities.SeoContent.list(200);
    if (onlyRoute) records = records.filter((r) => r.route === onlyRoute);

    const improved = [];
    for (const rec of records) {
      const perf = rec.performance_snapshot || {};
      const hasPerf = perf.impressions || perf.clicks || perf.avg_position;
      if (!rec.title && !hasPerf) continue;

      // Determine location from route — location pages have paths like /fl/miami
      const routeLocation = locationByPath.get(rec.route);
      const isLocationPage = !!routeLocation;

      // Build location-specific context — NO hardcoded South Florida
      let locationContext = "";
      if (isLocationPage) {
        locationContext = `This page targets ${routeLocation.canonical_city}, ${routeLocation.state_abbreviation} (${routeLocation.canonical_state}). Optimize for this specific local market only. Do not reference other cities, states, or regions.`;
      } else {
        locationContext = `This is a national/general page on ${canonicalDomain}. Optimize for a nationwide audience. Do not hardcode any specific city or state.`;
      }

      // Build page-specific query evidence from Search Console (NOT global)
      const pageQueries = (perf.top_queries || []).slice(0, 10);
      const queryEvidence = pageQueries.length > 0
        ? pageQueries.map(q => `- "${q.query}" (${q.impressions} impressions, ${q.clicks} clicks, position ${q.position?.toFixed(1)})`).join("\n")
        : "No query data yet for this page.";

      const prompt = `You are an elite SEO and AEO specialist optimizing a page on ${canonicalDomain} — a garage floor coating lead-generation site. Goal: rank on the first page of Google and win answer-engine citations.

${locationContext}

Route: ${rec.route}
Current title: ${rec.title || "(none — write a new one)"}
Current description: ${rec.description || "(none — write a new one)"}
Current FAQ: ${JSON.stringify(rec.faq || [])}

Google Search Console performance (last 28 days) — page-specific query attribution:
- Impressions: ${perf.impressions || 0}
- Clicks: ${perf.clicks || 0}
- Click-through rate: ${((perf.ctr || 0) * 100).toFixed(1)}%
- Average ranking position: ${perf.avg_position ? perf.avg_position.toFixed(1) : "no data yet"}
- Queries showing this page (page-specific, not global):
${queryEvidence}

Write an improved, click-optimized, keyword-rich title tag (max 60 characters) and meta description (max 155 characters) that will lift CTR and rankings for this route's intent. Also produce 5 concise FAQ Q&As optimized for AI answer engines (AEO) — each answer factual and specific to garage floor coatings, under 60 words. Keep all content accurate; do not invent prices outside $4–$12/sq ft. Return only JSON.`;

      let out;
      try {
        const { parsed: res } = await generateText({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              faq: {
                type: "array",
                items: {
                  type: "object",
                  properties: { q: { type: "string" }, a: { type: "string" } },
                },
              },
              notes: { type: "string" },
            },
          },
        });
        out = res;
      } catch (e) {
        improved.push({ route: rec.route, error: e.message });
        continue;
      }

      const newTitle = (out.title || rec.title || "").slice(0, 65);
      const newDesc = (out.description || rec.description || "").slice(0, 160);
      const newFaq = Array.isArray(out.faq) ? out.faq.slice(0, 8) : rec.faq;

      await base44.asServiceRole.entities.SeoContent.update(rec.id, {
        title: newTitle,
        description: newDesc,
        faq: newFaq,
        version: (rec.version || 1) + 1,
        optimized_at: new Date().toISOString(),
        optimization_notes: out.notes || "",
      });
      improved.push({ route: rec.route, title: newTitle, notes: out.notes });
    }

    await logStep(base44, {
      category: "seo",
      action: "Ran AI SEO optimizer with location-specific context",
      detail: `${improved.length} pages optimized`,
      source: "optimizeSeo",
    });

    return Response.json({ ok: true, improved: improved.length, items: improved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}