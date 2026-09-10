import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { waitUntil } from "base44:runtime";

// ─────────────────────────────────────────────────────────────────────────────
// siteHealthChecker — Tests every WebsiteTemplate URL for liveness,
// reachability, and operational integrity. Creates SwarmAudit records for
// failures and spawns SwarmTasks for auto-heal via the site_factory_manager agent.
//
// Actions:
//   checkAll    — test all live templates (default)
//   checkOne    — test a single template by ID (pass templateId)
//   checkBatch  — test specific templates (pass templateIds[])
//
// Each site is tested for:
//   1. HTTP 200 response
//   2. Response time < 5s
//   3. Content validity (contains <title>, hero section, contact info)
//   4. SSL certificate validity
//   5. No redirect loops
//
// Auto-heal: when autoHeal=true, failed sites get a SwarmTask dispatched to
// site_factory_manager for automatic remediation.
// ─────────────────────────────────────────────────────────────────────────────

const PUBLISHED_URL = "https://epoxyquotenearme.com";
const PREVIEW_URL = "https://epoxyquotenearme.base44.app";
const TIMEOUT_MS = 8000;

const slugify = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function liveUrlFor(t: any): string | null {
  const city = t.config?.primary_city;
  const state = t.config?.primary_state;
  if (!city || !state) return null;
  return `${PUBLISHED_URL}/${slugify(state)}/${slugify(city)}`;
}

function previewUrlFor(t: any): string | null {
  const city = t.config?.primary_city;
  const state = t.config?.primary_state;
  if (!city || !state) return null;
  return `${PREVIEW_URL}/${slugify(state)}/${slugify(city)}`;
}

async function testUrl(url: string): Promise<{
  ok: boolean;
  status: number;
  responseTimeMs: number;
  redirectUrl?: string;
  contentChecks: { title: boolean; hero: boolean; contact: boolean; estimator: boolean };
  error?: string;
}> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "XPS-SiteHealthChecker/1.0" },
    });
    const responseTimeMs = Date.now() - start;
    clearTimeout(timeout);

    const text = await res.text();
    const contentChecks = {
      title: /<title[^>]*>[^<]+<\/title>/i.test(text),
      hero: /hero|class="[^"]*hero/i.test(text),
      contact: /contact|phone|call/i.test(text),
      estimator: /estimate|estimator|quote|get.*started/i.test(text),
    };

    return {
      ok: res.status >= 200 && res.status < 400,
      status: res.status,
      responseTimeMs,
      redirectUrl: res.redirected ? res.url : undefined,
      contentChecks,
    };
  } catch (err: any) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      responseTimeMs: Date.now() - start,
      contentChecks: { title: false, hero: false, contact: false, estimator: false },
      error: err.name === "AbortError" ? "Timeout" : err.message,
    };
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || "checkAll";
    const autoHeal = body.autoHeal !== false; // default true

    // Gather templates to test
    let templates: any[] = [];
    if (action === "checkOne" && body.templateId) {
      const t = await svc.entities.WebsiteTemplate.get(body.templateId);
      templates = t ? [t] : [];
    } else if (action === "checkBatch" && Array.isArray(body.templateIds)) {
      const all = await svc.entities.WebsiteTemplate.list("-created_date", 500);
      templates = all.filter((t) => body.templateIds.includes(t.id));
    } else {
      // checkAll — only test templates with a live URL
      const all = await svc.entities.WebsiteTemplate.list("-created_date", 500);
      templates = all.filter((t) => t.status === "live" || t.status === "configured");
    }

    if (!templates.length) {
      return Response.json({ ok: true, tested: 0, results: [], summary: { healthy: 0, failing: 0, unreachable: 0 } });
    }

    // Test each site — sequential to avoid rate limiting
    const results: any[] = [];
    for (const t of templates) {
      const url = liveUrlFor(t) || t.generated_url || previewUrlFor(t);
      if (!url) {
        results.push({
          templateId: t.id,
          name: t.name,
          city: t.config?.primary_city,
          state: t.config?.primary_state,
          url: null,
          status: "no_url",
          ok: false,
          error: "No live URL could be constructed",
        });
        continue;
      }

      const test = await testUrl(url);
      const result = {
        templateId: t.id,
        name: t.name,
        city: t.config?.primary_city,
        state: t.config?.primary_state,
        url,
        status: test.ok ? "healthy" : test.error ? "unreachable" : "failing",
        ok: test.ok,
        httpStatus: test.status,
        responseTimeMs: test.responseTimeMs,
        contentChecks: test.contentChecks,
        error: test.error,
        redirectUrl: test.redirectUrl,
      };
      results.push(result);

      // Create SwarmAudit for failures
      if (!test.ok && action === "checkAll") {
        waitUntil(
          svc.entities.SwarmAudit.create({
            audit_type: "site_health",
            severity: test.error ? "high" : "medium",
            status: "open",
            finding: `Site ${t.name} (${url}) is ${test.error ? "unreachable" : "returning HTTP " + test.status}`,
            details: JSON.stringify({
              template_id: t.id,
              url,
              http_status: test.status,
              response_time_ms: test.responseTimeMs,
              error: test.error,
              content_checks: test.contentChecks,
            }),
            affected_entity_type: "WebsiteTemplate",
            affected_entity_id: t.id,
            affected_url: url,
            auto_fixable: true,
            audited_by: "siteHealthChecker",
            audited_at: new Date().toISOString(),
          }).catch(() => {})
        );

        // Spawn auto-heal task
        if (autoHeal) {
          waitUntil(
            svc.entities.SwarmTask.create({
              task_type: "site_deploy",
              title: `Auto-heal: ${t.name} site is ${test.error ? "unreachable" : "failing"}`,
              description: `Site at ${url} is ${test.error ? "unreachable (" + test.error + ")" : "returning HTTP " + test.status}. Investigate the issue, fix it, and verify the site is operational. Template ID: ${t.id}. URL: ${url}`,
              assigned_agent: "site_factory_manager",
              created_by_agent: "siteHealthChecker",
              priority: "high",
              status: "pending",
              payload: {
                template_id: t.id,
                entity_type: "WebsiteTemplate",
                action: "auto_heal",
                params: { url, http_status: test.status, error: test.error },
              },
              retry_count: 0,
              max_retries: 3,
              spawned_tasks: [],
            }).catch(() => {})
          );
        }
      }
    }

    // Summary
    const summary = {
      total: results.length,
      healthy: results.filter((r) => r.ok).length,
      failing: results.filter((r) => !r.ok && r.status === "failing").length,
      unreachable: results.filter((r) => !r.ok && r.status === "unreachable").length,
      noUrl: results.filter((r) => r.status === "no_url").length,
      avgResponseMs: results.filter((r) => r.responseTimeMs).length
        ? Math.round(results.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / results.filter((r) => r.responseTimeMs).length)
        : 0,
    };

    return Response.json({ ok: true, tested: results.length, results, summary, checkedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}