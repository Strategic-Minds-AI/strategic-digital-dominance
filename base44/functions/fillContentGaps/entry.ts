import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";
import { generateText } from "../../shared/aiGateway.ts";

// Closed-loop SEO engine: reads competitor insights that have content_gaps
// filled in, uses AI to extract actionable topic keywords from those gaps,
// then auto-generates SEO pages for each missing topic. This closes the gap
// between "we know what competitors cover that we don't" and "we now cover it."
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    // 1. Gather all competitor insights that have content gaps documented.
    const insights = await base44.asServiceRole.entities.CompetitorInsight.list(200);
    const withGaps = insights.filter((i) => i.content_gaps && i.content_gaps.trim().length > 10);

    if (!withGaps.length) {
      return Response.json({ ok: true, generated: 0, note: "No content gaps found. Run the competitor scanner first." });
    }

    // 2. Collect existing generated page keywords to avoid duplicates.
    const existing = await base44.asServiceRole.entities.GeneratedPage.list(500);
    const existingKeywords = new Set(
      existing.map((g) => (g.keyword || g.slug || "").toLowerCase())
    );

    // 3. Ask AI to extract actionable topic keywords from the combined gaps.
    const gapText = withGaps
      .map((i) => `Competitor ${i.competitor_name}: ${i.content_gaps}`)
      .join("\n");

    const { parsed: res } = await generateText({
      prompt: `You are an SEO strategist for a garage floor coating company. Based on these content gaps identified in competitor analysis, extract 5-10 specific, high-intent topic keywords that we should create content pages for. Each keyword should be something a homeowner would search for (e.g. "polyaspartic vs epoxy durability", "garage floor coating for hot climates"). Return only the keywords as a JSON array of strings.

Content gaps:
${gapText}`,
      response_json_schema: {
        type: "object",
        properties: {
          keywords: { type: "array", items: { type: "string" } },
        },
      },
    });

    const keywords = (res as any)?.keywords || [];

    // 4. Filter out keywords we already have pages for.
    const newKeywords = keywords.filter(
      (k: string) => k && !existingKeywords.has(k.toLowerCase())
    );

    if (!newKeywords.length) {
      await logStep(base44, {
        category: "content",
        action: "Content gap auto-fill: no new topics needed",
        detail: `${keywords.length} topics found, all already covered`,
        source: "fillContentGaps",
      });
      return Response.json({ ok: true, generated: 0, found: keywords.length, note: "All identified topics already have pages." });
    }

    // 5. Generate a page for each new topic keyword (max 5 per run to control cost).
    const toGenerate = newKeywords.slice(0, 5);
    const generated = [];

    for (const keyword of toGenerate) {
      try {
        const pageRes = await base44.functions.invoke("generateSeoPage", { keyword });
        const page = (pageRes as any)?.data || pageRes;
        if (page?.page?.slug) {
          generated.push({ keyword, slug: page.page.slug });
        }
      } catch {
        // Skip failures, continue with next keyword
      }
    }

    await logStep(base44, {
      category: "content",
      action: `Content gap auto-fill: generated ${generated.length} pages`,
      detail: `Topics: ${generated.map((g) => g.keyword).join(", ")}`,
      meta: JSON.stringify({ found: keywords.length, generated: generated.length }),
      source: "fillContentGaps",
    });

    return Response.json({
      ok: true,
      found: keywords.length,
      generated: generated.length,
      pages: generated,
      skipped: keywords.length - newKeywords.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}