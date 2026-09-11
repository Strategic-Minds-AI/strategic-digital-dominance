import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { generateText } from "../../shared/aiGateway.ts";

// ─────────────────────────────────────────────────────────────────────────────
// enrichLead — AI-enriches a scraped lead with background data using web search.
// Looks up the business/person online and fills in: business description, social
// profiles, reviews, revenue estimate, years in business, and outreach hooks.
// Invoke: base44.functions.invoke('enrichLead', { lead_id })
// ─────────────────────────────────────────────────────────────────────────────

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (!body.lead_id) return Response.json({ error: "lead_id required" }, { status: 400 });

    const lead = await base44.asServiceRole.entities.Lead.get(body.lead_id);
    if (!lead) return Response.json({ error: "Lead not found" }, { status: 404 });

    const query = [lead.first_name, lead.last_name, lead.city, lead.state, lead.notes?.replace("Website: ", "")]
      .filter(Boolean).join(" ");

    const { parsed: res } = await generateText({
      prompt: `Research this lead for a garage floor epoxy / decorative concrete coating company (Xtreme Polishing Systems) and return enriched background data. Lead: ${query}. Phone: ${lead.phone || "n/a"}. Email: ${lead.email || "n/a"}. If this is a business, find: business description, years in business, services offered, Google rating + review count, social media profiles (Facebook, Instagram, LinkedIn), estimated revenue range, and a personalized outreach hook. If this is a homeowner, find: property details, neighborhood, and a personalized outreach hook about garage floor coating. Be factual; if you can't find something, say "Not found".`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string", description: "1-2 sentence background summary" },
          business_info: { type: "string", description: "Business description, years, services" },
          ratings: { type: "string", description: "Google rating + review count if available" },
          social_profiles: { type: "array", items: { "type": "string" } },
          revenue_estimate: { type: "string" },
          outreach_hook: { type: "string", description: "Personalized opening line for outreach" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["summary", "outreach_hook", "confidence"],
      },
    });

    const enrichment = [
      `Summary: ${res.summary || ""}`,
      res.business_info ? `Business: ${res.business_info}` : "",
      res.ratings ? `Ratings: ${res.ratings}` : "",
      (res.social_profiles || []).length ? `Social: ${(res.social_profiles || []).join(", ")}` : "",
      res.revenue_estimate ? `Revenue: ${res.revenue_estimate}` : "",
      `Outreach hook: ${res.outreach_hook || ""}`,
      `Confidence: ${res.confidence || "low"}`,
    ].filter(Boolean).join("\n");

    await base44.asServiceRole.entities.Lead.update(body.lead_id, { enrichment });

    return Response.json({ ok: true, lead_id: body.lead_id, enrichment });
  } catch (error) {
    console.error("[enrichLead] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}