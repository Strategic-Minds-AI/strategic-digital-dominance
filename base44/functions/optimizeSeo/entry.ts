import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";
import { generateText } from "../../shared/aiGateway.ts";

// AI-driven persistent SEO optimizer.
// For each SeoContent record that has Search Console performance data,
// ask the LLM to rewrite the title, meta description, and FAQ to improve
// CTR and rankings, then persist the improved version.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const onlyRoute = body?.route;

    let records = await base44.asServiceRole.entities.SeoContent.list(200);
    if (onlyRoute) records = records.filter((r) => r.route === onlyRoute);

    const improved = [];
    for (const rec of records) {
      const perf = rec.performance_snapshot || {};
      const hasPerf = perf.impressions || perf.clicks || perf.avg_position;
      if (!rec.title && !hasPerf) continue;

      const prompt = `You are an elite SEO and AEO specialist optimizing a page on epoxygaragefloorestimate.com — a garage floor coating lead-generation site serving Pompano Beach, FL and South Florida. Goal: rank on the first page of Google and win answer-engine citations.

Route: ${rec.route}
Current title: ${rec.title || "(none — write a new one)"}
Current description: ${rec.description || "(none — write a new one)"}
Current FAQ: ${JSON.stringify(rec.faq || [])}

Google Search Console performance (last 28 days):
- Impressions: ${perf.impressions || 0}
- Clicks: ${perf.clicks || 0}
- Click-through rate: ${((perf.ctr || 0) * 100).toFixed(1)}%
- Average ranking position: ${perf.avg_position ? perf.avg_position.toFixed(1) : "no data yet"}
- Top queries showing this page: ${JSON.stringify((perf.top_queries || []).map((q) => q.query))}

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

    await logStep(base44, { category: "seo", action: "Ran AI SEO optimizer", detail: `${improved.length} pages optimized`, source: "optimizeSeo" });

    return Response.json({ ok: true, improved: improved.length, items: improved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}