import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { engineFetch, createRunAndPoll, PRESETS } from "../../shared/railwayEngine.ts";

// ─────────────────────────────────────────────────────────────────────────────
// railwayScraper — manual testing endpoint for the Railway cloud-browser engine.
// Actions:
//   health        — GET /health
//   runPreset     — { preset: "homeowner_leads" | "b2b_contractors" }
//   createAndRun  — { job: { name, start_url, steps } }
//   listJobs      — GET /jobs
//   getJob        — { job_id } -> GET /jobs/:id/results
// Invoke: base44.functions.invoke('railwayScraper', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "health";
    let result;

    switch (action) {
      case "health":
        result = await engineFetch("/health");
        break;

      case "runPreset": {
        const preset = PRESETS[body.preset];
        if (!preset) return Response.json({ error: "Unknown preset" }, { status: 400 });
        result = await createRunAndPoll(preset, body.timeoutMs || 300000);
        break;
      }

      case "createAndRun": {
        if (!body.job?.start_url) return Response.json({ error: "job.start_url required" }, { status: 400 });
        result = await createRunAndPoll(body.job, body.timeoutMs || 300000);
        break;
      }

      case "listJobs":
        result = await engineFetch("/jobs");
        break;

      case "getJob": {
        if (!body.job_id) return Response.json({ error: "job_id required" }, { status: 400 });
        result = await engineFetch(`/jobs/${body.job_id}/results`);
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await base44.asServiceRole.entities.SopLog.create({
      category: "integration",
      action: "railway_scraper",
      description: `${action}${body.preset ? `:${body.preset}` : ""}`,
      source: "railwayScraper",
    }).catch(() => {});

    return Response.json({ ok: true, action, result });
  } catch (error) {
    console.error("[railwayScraper] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}