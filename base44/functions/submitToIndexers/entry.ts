import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { logStep } from "../../shared/sopLog.ts";

const STATIC_PUBLIC_ROUTES = [
  "/", "/estimate", "/how-it-works", "/gallery", "/reviews", "/about", "/contact",
  "/locations", "/color-charts", "/guides", "/epoxy-garage-floor-cost",
  "/2-car-garage-epoxy-cost", "/3-car-garage-epoxy-cost",
  "/garage-floor-coating-cost", "/polyaspartic-vs-epoxy-garage-floor",
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "dry_run");
    if (!new Set(["dry_run", "execute"]).has(mode)) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "INVALID_MODE" }, { status: 400 });
    }

    const registryRows = await svc.entities.CanonicalSiteRegistry.list(1);
    const registry = registryRows?.[0];
    const domain = String(registry?.canonical_domain || "").trim().toLowerCase();
    if (!domain || domain.endsWith(".base44.app")) {
      return Response.json({ ok: false, status: "BLOCKED", reason: "CANONICAL_DOMAIN_UNAVAILABLE" }, { status: 409 });
    }
    const site = `https://${domain}`;
    const locationRows = await svc.entities.CanonicalLocationRegistry.list(1000);
    const verifiedLocations = locationRows
      .filter((row: any) => row.validation_status === "passed" && row.sitemap_status !== "stale" && row.canonical_url)
      .map((row: any) => String(row.canonical_url).replace(/\/$/, ""))
      .filter((url: string) => url.startsWith(site + "/"));

    const urls = [...new Set([
      ...STATIC_PUBLIC_ROUTES.map((route) => route === "/" ? site + "/" : site + route),
      ...verifiedLocations,
    ])];

    const plan = {
      ok: true,
      mode,
      action_class: mode === "execute" ? "PROTECTED" : "READ",
      canonical_domain: domain,
      sitemap: `${site}/sitemap.xml`,
      urls_planned: urls.length,
      sample_urls: urls.slice(0, 10),
      registry_locations_used: verifiedLocations.length,
    };
    if (mode === "dry_run") return Response.json({ ...plan, writes_performed: 0 });
    if (body.approved_external_write !== true) {
      return Response.json({ ...plan, ok: false, status: "APPROVAL_REQUIRED", reason: "INDEXNOW_SUBMISSION_REQUIRES_OPERATOR_APPROVAL", writes_performed: 0 }, { status: 403 });
    }

    const key = process.env.INDEXNOW_KEY || "";
    if (!key) return Response.json({ ...plan, ok: false, status: "BLOCKED", reason: "INDEXNOW_KEY_UNAVAILABLE", writes_performed: 0 }, { status: 409 });

    const response = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: domain,
        key,
        keyLocation: `${site}/${key}.txt`,
        urlList: urls.slice(0, 1000),
      }),
    });

    await logStep(base44, {
      category: "seo",
      action: "Approved IndexNow submission",
      detail: `${urls.length} canonical URL(s) submitted`,
      meta: `status:${response.status} host:${domain}`,
      source: "submitToIndexers",
    });

    return Response.json({
      ...plan,
      ok: response.ok || response.status === 202,
      status: response.ok || response.status === 202 ? "EXECUTED" : "BLOCKED",
      writes_performed: response.ok || response.status === 202 ? 1 : 0,
      indexNow: { status: response.status, ok: response.ok || response.status === 202 },
    }, { status: response.ok || response.status === 202 ? 200 : 502 });
  } catch (error) {
    return Response.json({ ok: false, status: "BLOCKED", error: error instanceof Error ? error.message : "UNKNOWN_ERROR", writes_performed: 0 }, { status: 500 });
  }
}
