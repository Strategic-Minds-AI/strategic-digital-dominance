import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';
import { COMPANY_FACTS } from '../../shared/companyIntel.ts';
import { generateText } from '../../shared/aiGateway.ts';

// ─────────────────────────────────────────────────────────────────────────────
// companyIntel — Exhaustive company & industry intelligence scraper.
// Uses the Browserbase cloud browser to scrape the Xtreme Polishing Systems
// family of sites (xtremepolishingsystems.com + nationalconcretepolishing.net)
// and synthesizes a comprehensive IntelligenceReport: company facts, years in
// business, locations, ratings, philosophies, product lines, and industry
// context — purpose-built to give the AI agent a grounded knowledge base that
// eliminates hallucination and ambiguity in customer conversations.
//
// Invoke: base44.functions.invoke('companyIntel', { action, ...params })
//   action: 'scrape'       — run the full scrape + synthesize report
//   action: 'getFacts'     — return the canonical COMPANY_FACTS
// ─────────────────────────────────────────────────────────────────────────────

const BROWSERBASE_FETCH_URL = 'https://api.browserbase.com/v1/fetch';

const SCRAPE_TARGETS = [
  { name: 'xps_about', url: 'https://xtremepolishingsystems.com/pages/about-xps' },
  { name: 'xps_locations', url: 'https://xtremepolishingsystems.com/pages/locations' },
  { name: 'xps_testimonials', url: 'https://xtremepolishingsystems.com/pages/customer-testimonials' },
  { name: 'xps_home', url: 'https://xtremepolishingsystems.com/' },
  { name: 'ncp_home', url: 'https://nationalconcretepolishing.net/' },
  { name: 'ncp_about', url: 'https://nationalconcretepolishing.net/about/' },
];

async function bbFetch(apiKey: string, url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(BROWSERBASE_FETCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-BB-API-Key': apiKey },
      body: JSON.stringify({ url, proxies: true, allowRedirects: true }),
      signal: controller.signal,
    });
    if (!res.ok) return { url, content: '', error: `HTTP ${res.status}` };
    const data: any = await res.json();
    return { url, content: (data.content || data.text || '').toString().slice(0, 20000) };
  } catch (e: any) {
    return { url, content: '', error: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

async function logSop(svc: any, action: string, description: string, detail = '') {
  await svc.entities.SopLog.create({
    category: 'integration',
    action,
    description,
    detail,
    source: 'companyIntel',
  }).catch(() => {});
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'scrape';

    if (action === 'getFacts') {
      return Response.json({ ok: true, company: COMPANY_FACTS });
    }

    if (action !== 'scrape') {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const apiKey = secrets.get('BROWSERBASE_API_KEY');
    if (!apiKey) return Response.json({ error: 'BROWSERBASE_API_KEY not set' }, { status: 500 });

    // 1. Scrape every target in parallel via Browserbase.
    const scraped = await Promise.all(SCRAPE_TARGETS.map((t) => bbFetch(apiKey, t.url)));

    const corpus = scraped
      .map((s) => `### ${s.url}\n${s.content || s.error || '(empty)'}`)
      .join('\n\n');

    // 2. Synthesize a structured intelligence report with the LLM, grounded in
    //    the canonical COMPANY_FACTS + the freshly scraped site content.
    const { parsed: synthesis } = await generateText({
      prompt: `You are a senior business intelligence analyst preparing a grounded knowledge base for an AI customer-service agent at Xtreme Polishing Systems (XPS). The agent will use ONLY this report to answer homeowner questions about epoxy garage floors, decorative concrete, pricing, process, warranties, locations, and company reputation — so every fact must be specific, accurate, and sourced. Eliminate ambiguity and hallucination.

CANONICAL COMPANY FACTS (verified, authoritative — use these as ground truth):
${JSON.stringify(COMPANY_FACTS, null, 2)}

FRESHLY SCRAPED SITE CONTENT (xtremepolishingsystems.com + nationalconcretepolishing.net):
${corpus.slice(0, 40000)}

Synthesize a comprehensive company & industry intelligence report. Extract and confirm:
- Company overview (name, years in business, HQ, business model, philosophy/mission)
- Locations (count, states covered, notable training locations)
- Ratings & reputation (Google, Trustpilot, BBB, Apple Maps — with counts)
- Product & service lines (epoxy systems, equipment, chemicals, training)
- Pricing context (residential garage epoxy per sqft ranges, package tiers, what drives price)
- Installation process (prep, base coat, flake, topcoat, curing times)
- Warranties & guarantees
- Competitive positioning (vs big-box DIY kits, vs other contractors)
- Industry context (decorative concrete + epoxy market trends, residential demand drivers)
- Key rebuttals (price, DIY, timing, competitor) the agent should use
- Escalation triggers (when to hand off to a human)

Return strict JSON matching the schema. Quote real numbers and real review text where available. If something is not in the canonical facts or the scraped content, mark it "not found" rather than inventing it.`,
      model: 'claude-sonnet-5',
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          company_overview: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              years_in_business: { type: 'string' },
              headquarters: { type: 'string' },
              business_model: { type: 'string' },
              philosophy: { type: 'string' },
            },
          },
          locations: {
            type: 'object',
            properties: {
              count: { type: 'string' },
              states: { type: 'array', items: { type: 'string' } },
              training_locations: { type: 'array', items: { type: 'string' } },
            },
          },
          ratings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                score: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
          product_lines: { type: 'array', items: { type: 'string' } },
          pricing_context: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                service: { type: 'string' },
                low: { type: 'number' },
                high: { type: 'number' },
                unit: { type: 'string' },
              },
            },
          },
          installation_process: { type: 'array', items: { type: 'string' } },
          warranties: { type: 'string' },
          competitive_positioning: { type: 'string' },
          industry_context: { type: 'string' },
          key_rebuttals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                objection: { type: 'string' },
                response: { type: 'string' },
              },
            },
          },
          escalation_triggers: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // 3. Persist as an IntelligenceReport so the admin + AI agent can query it.
    const report = await svc.entities.IntelligenceReport.create({
      title: `Company Intelligence — Xtreme Polishing Systems (${new Date().toLocaleDateString()})`,
      report_type: 'company_audit',
      sector: 'all',
      service_category: 'epoxy_flooring, decorative_concrete, polished_concrete',
      geography: 'National (HQ Pompano Beach, FL)',
      findings: [
        { insight: 'Company overview', data_point: JSON.stringify(synthesis.company_overview || {}), source: 'xtremepolishingsystems.com', confidence: 'high' },
        { insight: 'Locations', data_point: JSON.stringify(synthesis.locations || {}), source: 'xtremepolishingsystems.com/pages/locations', confidence: 'high' },
        { insight: 'Ratings & reputation', data_point: JSON.stringify(synthesis.ratings || []), source: 'Trustindex / Trustpilot / BBB', confidence: 'high' },
        { insight: 'Pricing context', data_point: JSON.stringify(synthesis.pricing_context || []), source: 'industry + site', confidence: 'medium' },
        { insight: 'Key rebuttals', data_point: JSON.stringify(synthesis.key_rebuttals || []), source: 'synthesized', confidence: 'medium' },
        { insight: 'Escalation triggers', data_point: JSON.stringify(synthesis.escalation_triggers || []), source: 'synthesized', confidence: 'high' },
      ],
      pricing_data: (synthesis.pricing_context || []).map((p: any) => ({
        service: p.service, low_price: p.low, high_price: p.high, avg_price: Math.round((p.low + p.high) / 2), unit: p.unit, source: 'companyIntel scrape',
      })),
      sources: SCRAPE_TARGETS.map((t) => t.url),
      summary: synthesis.summary || JSON.stringify(synthesis.company_overview || {}),
      status: 'complete',
    });

    await logSop(svc, 'company_intel_scrape', `Scraped ${SCRAPE_TARGETS.length} sites and generated intelligence report`, report.id);

    return Response.json({ ok: true, report, synthesis, scraped: scraped.map((s) => ({ url: s.url, length: s.content?.length || 0 })) });
  } catch (error: any) {
    console.error('[companyIntel] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}