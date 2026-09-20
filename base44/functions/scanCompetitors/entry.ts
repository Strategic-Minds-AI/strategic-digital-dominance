import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { generateText } from "../../shared/aiGateway.ts";

// Persistent competitor + backlink research.
// Uses InvokeLLM with web search to find the top garage-floor-coating
// competitors serving Pompano Beach / South Florida and nationally, extract
// their pricing/services/USPs, surface backlink opportunities for our parent
// companies (Xtreme Polishing Systems, National Concrete Polishing, National
// Epoxy Pros), and store everything as CompetitorInsight records.
//
// Invoked by the weekly "Competitor Scanner" workflow, or manually from the
// admin Competitors page.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "full"; // "full" | "competitors" | "backlinks"
    const niche = body.niche || body.keyword || "garage floor epoxy coating";
    const location = body.location || body.city || "Pompano Beach, FL";
    const businessContext = `${niche} business serving ${location}`;

    const created = { competitors: 0, backlinks: 0, errors: [] };

    // ── Competitor scan ──────────────────────────────────────────────────
    if (mode === "full" || mode === "competitors") {
      try {
        const { parsed: res } = await generateText({
          prompt:
            `You are an SEO competitive research analyst. Find the top 6 companies that compete with a residential ${businessContext} (and operating nationally where relevant). For each competitor, extract: company name, website URL, a one-paragraph summary of what they offer, their typical price per square foot range (low and high in USD), the main services they list, their key strengths (USPs), their weaknesses or gaps, any sites/directories that link to them (backlink targets — e.g. Houzz, Angi, HomeAdvisor, BBB, Yelp, manufacturer partner pages, industry directories), content topics they rank for that we don't (content gaps), and one actionable recommendation for how we can outperform them. Be specific and factual, citing only real companies and real URLs you find via search.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string" },
                  summary: { type: "string" },
                  price_per_sqft_low: { type: "number" },
                  price_per_sqft_high: { type: "number" },
                  services: { type: "array", items: { type: "string" } },
                  strengths: { type: "string" },
                  weaknesses: { type: "string" },
                  backlink_targets: { type: "array", items: { type: "string" } },
                  content_gaps: { type: "string" },
                  recommendation: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["competitors"],
        },
      });

      const list = Array.isArray(res?.competitors) ? res.competitors : [];
      const records = list
        .filter((c) => c && c.name)
        .map((c) => ({
          type: "competitor",
          competitor_name: c.name,
          url: c.url || "",
          summary: c.summary || "",
          price_per_sqft_low: c.price_per_sqft_low ?? null,
          price_per_sqft_high: c.price_per_sqft_high ?? null,
          services: c.services || [],
          strengths: c.strengths || "",
          weaknesses: c.weaknesses || "",
          backlink_targets: c.backlink_targets || [],
          content_gaps: c.content_gaps || "",
          recommendation: c.recommendation || "",
        }));
      if (records.length) {
        await base44.asServiceRole.entities.CompetitorInsight.bulkCreate(records);
        created.competitors = records.length;
      }
      } catch (e: any) {
        console.error("[scanCompetitors] competitor scan error:", e.message);
        created.errors.push(`competitors: ${e.message}`);
      }
    }

    // ── Backlink opportunities for parent companies ─────────────────────
    if (mode === "full" || mode === "backlinks") {
      try {
        const { parsed: res } = await generateText({
          prompt:
            `You are an SEO link-building analyst. Our business is a ${niche} lead-gen site serving ${location}. Find 8 real, high-authority websites, directories, industry publications, and partnership opportunities where we could earn backlinks to our site. For each, give: the site name, URL, why it's relevant, the type of link opportunity (directory listing, guest post, resource page, sponsor, partner page, press release, forum/community, manufacturer dealer locator, etc.), and a specific recommended action to get the link. Only include real, well-known sites.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string" },
                  relevance: { type: "string" },
                  opportunity_type: { type: "string" },
                  action: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["opportunities"],
        },
      });

      const list = Array.isArray(res?.opportunities) ? res.opportunities : [];
      const records = list
        .filter((o) => o && o.name)
        .map((o) => ({
          type: "backlink_opportunity",
          competitor_name: o.name,
          url: o.url || "",
          summary: o.relevance || "",
          services: [],
          strengths: o.opportunity_type || "",
          weaknesses: "",
          backlink_targets: [],
          content_gaps: "",
          recommendation: o.action || "",
        }));
      if (records.length) {
        await base44.asServiceRole.entities.CompetitorInsight.bulkCreate(records);
        created.backlinks = records.length;
      }
      } catch (e: any) {
        console.error("[scanCompetitors] backlink scan error:", e.message);
        created.errors.push(`backlinks: ${e.message}`);
      }
    }

    return Response.json({ ok: true, ...created });
  } catch (error) {
    console.error("[scanCompetitors] Fatal error:", error.message);
    return Response.json({ ok: false, error: error.message, competitors: 0, backlinks: 0 }, { status: 500 });
  }
}