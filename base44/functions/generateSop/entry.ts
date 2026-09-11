import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";
import { generateText } from "../../shared/aiGateway.ts";

// Autonomous SOP synthesizer — pulls recent SopLog entries (the system's
// memory), asks the LLM to turn them into a reusable Standard Operating
// Procedure, and persists it to the Sop entity.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const category = (body.category || "").trim();
    const title = (body.title || "").trim();

    let logs = await base44.asServiceRole.entities.SopLog.list(200);
    logs.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    if (category) logs = logs.filter((l) => l.category === category);

    if (!logs.length) {
      return Response.json({ error: "No log entries found to synthesize. Run some operations first." }, { status: 400 });
    }

    const logSummary = logs.slice(0, 150).map((l, i) =>
      `${i + 1}. [${l.category}] ${l.action}${l.detail ? " — " + l.detail : ""}${l.source ? " (src: " + l.source + ")" : ""}`
    ).join("\n");

    const prompt = `You are an operations analyst. Below is an append-only log of steps performed by an autonomous system running a garage floor coating lead-generation website (EpoxyGarageFloorEstimate.com). Synthesize these raw log entries into a clear, reusable Standard Operating Procedure (SOP) that a human operator could follow to reproduce what the system did.

Log entries (most recent first):
${logSummary}

${category ? `Focus area: ${category}.` : "Cover the full system."}

Produce:
- A concise title for the SOP.
- A one-paragraph summary.
- An ordered list of steps, each with a short imperative title and a detail sentence explaining what to do.
Return only JSON.`;

    const { parsed: res } = await generateText({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: { step: { type: "string" }, detail: { type: "string" } },
            },
          },
        },
      },
    });

    const out = res.data || res;
    const sopTitle = title || out.title || (category ? `${category} SOP` : "System SOP");

    const created = await base44.asServiceRole.entities.Sop.create({
      title: sopTitle,
      category: category || "system",
      summary: (out.summary || "").slice(0, 1000),
      steps: Array.isArray(out.steps) ? out.steps.slice(0, 30) : [],
      source_log_count: logs.length,
      version: 1,
      generated_at: new Date().toISOString(),
    });

    await logStep(base44, { category: "ops", action: "Generated SOP", detail: sopTitle, meta: `${logs.length} log entries synthesized`, source: "generateSop" });

    return Response.json({ ok: true, sop: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}