import { secrets } from "base44:runtime";

// ─────────────────────────────────────────────────────────────────────────────
// Railway Cloud Browser engine client (shared).
// Engine API contract (from the cloud-browser package):
//   Auth:  Authorization: Bearer <RAILWAY_ENGINE_API_KEY>  (cb_live_ / cb_test_ prefixed)
//   GET    /health
//   POST   /jobs            { name, start_url, steps } -> { job: { id, status } }
//   POST   /jobs/:id/run    -> { status }
//   GET    /jobs/:id/results -> { job: { status }, results: [...] }
// ─────────────────────────────────────────────────────────────────────────────

export function engineBase(): string {
  const url = secrets.get("RAILWAY_ENGINE_URL");
  if (!url) throw new Error("RAILWAY_ENGINE_URL not set");
  return url.replace(/\/+$/, "");
}

export function engineKey(): string {
  const key = secrets.get("RAILWAY_ENGINE_API_KEY");
  if (!key) throw new Error("RAILWAY_ENGINE_API_KEY not set");
  return key;
}

export async function engineFetch(path: string, method = "GET", body?: any): Promise<any> {
  const res = await fetch(`${engineBase()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${engineKey()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Engine ${res.status}: ${data.error || data.detail || data.message || res.statusText}`);
  }
  return data;
}

// Create a job, run it, and poll for results until complete or timeout.
export async function createRunAndPoll(jobConfig: any, timeoutMs = 300000): Promise<{ job_id: string; results: any }> {
  const created = await engineFetch("/jobs", "POST", {
    name: jobConfig.name,
    start_url: jobConfig.start_url,
    steps: jobConfig.steps || [],
  });
  const jobId = created?.job?.id || created?.id;
  if (!jobId) throw new Error("Engine did not return a job id");
  await engineFetch(`/jobs/${jobId}/run`, "POST");
  const results = await pollResults(jobId, timeoutMs);
  return { job_id: jobId, results };
}

export async function pollResults(jobId: string, timeoutMs: number): Promise<any> {
  const deadline = Date.now() + timeoutMs;
  const done = ["completed", "done", "succeeded", "finished"];
  const failed = ["failed", "error"];
  while (Date.now() < deadline) {
    const data = await engineFetch(`/jobs/${jobId}/results`);
    const status = data?.job?.status || data?.status;
    if (done.includes(status)) return data;
    if (failed.includes(status)) throw new Error(`Engine job failed: ${JSON.stringify(data).slice(0, 500)}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Engine job timed out");
}

// Preset job configs — edit these to match your engine's step schema and target sites.
export const PRESETS: Record<string, any> = {
  homeowner_leads: {
    name: "Daily homeowner property leads",
    start_url: "https://www.estately.com/search?for=sale",
    steps: [
      { action_type: "wait", value: "2000" },
      { action_type: "extract", selector: "[class*=listing]", value: "listings" },
    ],
  },
  b2b_contractors: {
    name: "Daily B2B contractor leads",
    start_url: "https://www.google.com/search?q=garage+floor+epoxy+contractor",
    steps: [
      { action_type: "wait", value: "2000" },
      { action_type: "extract", selector: "[class*=business], .rllt__link", value: "contractors" },
    ],
  },
};