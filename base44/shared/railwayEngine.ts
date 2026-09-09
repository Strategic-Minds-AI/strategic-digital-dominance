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
  let url = secrets.get("CLOUD_BROWSER_ENGINE_URL");
  if (!url) throw new Error("CLOUD_BROWSER_ENGINE_URL not set");
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  // Strip a trailing /health or trailing slashes if the user pasted the full health URL
  url = url.replace(/\/(health)?\/+$/i, "");
  return url;
}

export function engineKey(): string {
  const key = secrets.get("ENGINE_API_KEY");
  if (!key) throw new Error("ENGINE_API_KEY not set");
  return key;
}

export async function engineFetch(path: string, method = "GET", body?: any): Promise<any> {
  const res = await fetch(`${engineBase()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": engineKey(),
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

// ── Session-based scraping (engine v3.x) ──
export async function createSession(targetUrl: string, opts: any = {}): Promise<string> {
  const data = await engineFetch("/sessions", "POST", {
    target_url: targetUrl,
    viewport: opts.viewport || { width: 1280, height: 800 },
    proxy_id: opts.proxy_id,
    timeout_ms: opts.timeout_ms || 120000,
  });
  const id = data?.sessionId || data?.session?.id || data?.id;
  if (!id) throw new Error("Engine did not return a session id");
  return id;
}

export async function sessionAction(id: string, step: any): Promise<any> {
  return engineFetch(`/sessions/${id}/execute`, "POST", {
    action_type: step.action_type,
    selector: step.selector || "",
    value: step.value || "",
    options: step.options || {},
  });
}

export async function getSession(id: string): Promise<any> {
  return engineFetch(`/sessions/${id}`);
}

export async function deleteSession(id: string): Promise<void> {
  await engineFetch(`/sessions/${id}`, "DELETE").catch(() => {});
}

// Run a preset: create a session at start_url, execute each step, read the
// final session state (which holds extracted data), then clean up.
export async function createRunAndPoll(jobConfig: any, timeoutMs = 300000): Promise<{ session_id: string; results: any }> {
  const sessionId = await createSession(jobConfig.start_url, { timeout_ms: timeoutMs });
  const extracted: any[] = [];
  for (const step of jobConfig.steps || []) {
    try {
      const res = await sessionAction(sessionId, step);
      if (step.action_type === "extract" && res?.data) {
        const vals = Array.isArray(res.data) ? res.data : [res.data];
        extracted.push(...vals);
      }
    } catch (e) {
      // continue running remaining steps even if one fails
    }
  }
  const finalState = await getSession(sessionId);
  await deleteSession(sessionId);
  const results = extracted.length ? extracted : finalState?.session?.extracted_data || finalState?.session?.data || finalState?.results || [];
  return { session_id: sessionId, results };
}

// Legacy job-based polling (kept for engines that support /jobs).
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
// Each preset targets a lead source the user requested. Steps use the engine's
// action_type/selector/value schema (navigate / wait / click / extract / screenshot).
export const PRESETS: Record<string, any> = {
  // ── Homeowner / residential property leads ──
  homeowner_leads: {
    name: "Homeowner property leads",
    start_url: "https://www.estately.com/search?for=sale",
    steps: [
      { action_type: "wait", value: "2500" },
      { action_type: "extract", selector: "[class*=listing]", value: "listings" },
    ],
  },
  // ── Local social media groups (Facebook, local pages) ──
  facebook_groups: {
    name: "Facebook local groups — epoxy/flooring",
    start_url: "https://www.facebook.com/search/groups/?q=garage%20flooring%20epoxy",
    steps: [
      { action_type: "wait", value: "3000" },
      { action_type: "extract", selector: "[role=article], [data-visualcompletion=ignore]", value: "group_posts" },
    ],
  },
  // ── Craigslist housing / services ──
  craigslist: {
    name: "Craigslist — housing + services",
    start_url: "https://www.craigslist.org/search/hhh",
    steps: [
      { action_type: "wait", value: "2000" },
      { action_type: "extract", selector: ".cl-static-search-result, .result-row", value: "listings" },
    ],
  },
  // ── Local businesses: epoxy & decorative concrete ──
  epoxy_businesses: {
    name: "Local epoxy flooring businesses",
    start_url: "https://www.google.com/search?q=epoxy+flooring+company+near+me",
    steps: [
      { action_type: "wait", value: "2500" },
      { action_type: "extract", selector: "[class*=business], .rllt__link, .dbg0pd", value: "businesses" },
    ],
  },
  decorative_concrete: {
    name: "Local decorative concrete businesses",
    start_url: "https://www.google.com/search?q=decorative+concrete+contractor+near+me",
    steps: [
      { action_type: "wait", value: "2500" },
      { action_type: "extract", selector: "[class*=business], .rllt__link, .dbg0pd", value: "businesses" },
    ],
  },
  // ── Local contractors & flooring companies ──
  local_contractors: {
    name: "Local general contractors",
    start_url: "https://www.google.com/search?q=general+contractor+near+me",
    steps: [
      { action_type: "wait", value: "2500" },
      { action_type: "extract", selector: "[class*=business], .rllt__link, .dbg0pd", value: "contractors" },
    ],
  },
  flooring_companies: {
    name: "Local flooring companies",
    start_url: "https://www.google.com/search?q=flooring+company+near+me",
    steps: [
      { action_type: "wait", value: "2500" },
      { action_type: "extract", selector: "[class*=business], .rllt__link, .dbg0pd", value: "flooring" },
    ],
  },
  // ── B2B contractor leads (national) ──
  b2b_contractors: {
    name: "B2B garage floor epoxy contractors",
    start_url: "https://www.google.com/search?q=garage+floor+epoxy+contractor",
    steps: [
      { action_type: "wait", value: "2500" },
      { action_type: "extract", selector: "[class*=business], .rllt__link", value: "contractors" },
    ],
  },
};

export const PRESET_LIST = Object.keys(PRESETS).map((k) => ({ key: k, ...PRESETS[k] }));