import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { engineFetch, createRunAndPoll, createSession, sessionAction, getSession, deleteSession, PRESETS } from "../../shared/railwayEngine.ts";

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

      case "listSessions":
        result = await engineFetch("/sessions");
        break;

      case "debugCreate":
        result = await engineFetch("/sessions", "POST", { target_url: body.target_url || "https://example.com", timeout_ms: 60000 });
        break;

      case "createSession": {
        if (!body.target_url) return Response.json({ error: "target_url required" }, { status: 400 });
        const id = await createSession(body.target_url, { timeout_ms: body.timeout_ms, proxy_id: body.proxy_id });
        result = { session_id: id };
        break;
      }

      case "sessionAction": {
        if (!body.session_id || !body.action_type) return Response.json({ error: "session_id and action_type required" }, { status: 400 });
        result = await sessionAction(body.session_id, { action_type: body.action_type, selector: body.selector, value: body.value });
        break;
      }

      case "getSession": {
        if (!body.session_id) return Response.json({ error: "session_id required" }, { status: 400 });
        result = await getSession(body.session_id);
        break;
      }

      case "deleteSession": {
        if (!body.session_id) return Response.json({ error: "session_id required" }, { status: 400 });
        await deleteSession(body.session_id);
        result = { ok: true };
        break;
      }

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