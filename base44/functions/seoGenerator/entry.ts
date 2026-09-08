import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// seoGenerator — Integrated SEO automation engine.
// Adapted from the XTREME-SYSTEMS/seo-generator package to run within this app
// using its own entities (SopLog, SeoContent, CompetitorInsight, GeneratedPage)
// and the Google Search Console connector.
//
// Actions:
//   technicalAudit    — scan a URL for technical SEO issues (title, meta, schema, etc.)
//   generateContent   — generate SEO-optimized page content for a keyword
//   monitorCompetitors — fetch competitor pages and detect changes
//   syncSearchConsole — pull latest Search Console query data
//   runFullCycle      — run all of the above in sequence
//
// Invoke: base44.functions.invoke('seoGenerator', { action, url?, keyword?, competitorUrls? })
// ─────────────────────────────────────────────────────────────────────────────

function extractMeta(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}

function extractAll(html, regex) {
  const results = [];
  let m;
  const re = new RegExp(regex.source, regex.flags);
  while ((m = re.exec(html)) !== null) {
    results.push(m[1] ? m[1].trim() : m[0]);
  }
  return results;
}

async function fetchWithTimeout(url, userAgent, timeoutMs = 10000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const html = await res.text();
    return { html, finalUrl: new URL(res.url || url) };
  } catch (e) {
    return { error: e.message };
  }
}

async function logSop(svc, action, description, detail) {
  await svc.entities.SopLog.create({
    category: 'seo',
    action,
    description,
    detail: detail || '',
    source: 'seoGenerator',
  }).catch(() => {});
}

// ── Technical SEO Audit ──
async function technicalAudit(svc, base44, url) {
  const fetched = await fetchWithTimeout(url, 'XtremeSEO-TechnicalAudit/1.0');
  if ('error' in fetched) return { error: fetched.error };

  const { html, finalUrl } = fetched;
  const metaTitle = extractMeta(html, /<title[^>]*>([^<]+)<\/title>/i);
  const metaDescription = extractMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    extractMeta(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const canonical = extractMeta(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogTitle = extractMeta(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const ogImage = extractMeta(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const jsonLdBlocks = extractAll(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const h1s = extractAll(html, /<h1[^>]*>([^<]+)<\/h1>/gi);
  const imgs = html.match(/<img[^>]+src=/gi) || [];
  const imgsNoAlt = (html.match(/<img(?![^>]*\salt=)[^>]*src=/gi) || []).length;
  const internalLinks = (html.match(/href=["']\/[^"']*["']/gi) || []).length;
  const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  let robotsTxt = null, sitemapXml = null;
  try {
    const r = await fetch(finalUrl.origin + '/robots.txt', { signal: AbortSignal.timeout(6000) });
    if (r.ok) robotsTxt = (await r.text()).slice(0, 500);
  } catch {}
  try {
    const s = await fetch(finalUrl.origin + '/sitemap.xml', { signal: AbortSignal.timeout(6000) });
    if (s.ok) sitemapXml = 'present';
  } catch {}

  const issues = [];
  if (!metaTitle) issues.push({ severity: 'critical', issue: 'Missing <title> tag', fix: 'Add a unique, keyword-rich title (<60 chars).' });
  else if (metaTitle.length > 60) issues.push({ severity: 'medium', issue: `Title too long (${metaTitle.length} chars)`, fix: 'Trim to <60 chars.' });
  if (!metaDescription) issues.push({ severity: 'high', issue: 'Missing meta description', fix: 'Add a compelling description (<155 chars).' });
  else if (metaDescription.length > 155) issues.push({ severity: 'medium', issue: `Meta description too long (${metaDescription.length} chars)`, fix: 'Trim to <155 chars.' });
  if (!canonical) issues.push({ severity: 'high', issue: 'Missing canonical tag', fix: 'Add <link rel="canonical"> to prevent duplicates.' });
  if (!ogTitle) issues.push({ severity: 'medium', issue: 'Missing Open Graph title', fix: 'Add og:title for social sharing.' });
  if (!ogImage) issues.push({ severity: 'medium', issue: 'Missing Open Graph image', fix: 'Add og:image for social sharing.' });
  if (jsonLdBlocks.length === 0) issues.push({ severity: 'high', issue: 'No JSON-LD structured data', fix: 'Add LocalBusiness/Service/FAQ schema.' });
  if (h1s.length === 0) issues.push({ severity: 'critical', issue: 'Missing H1 tag', fix: 'Add a single H1 with the primary keyword.' });
  if (h1s.length > 1) issues.push({ severity: 'medium', issue: `Multiple H1 tags (${h1s.length})`, fix: 'Use only one H1 per page.' });
  if (imgs.length > 0 && imgsNoAlt > 0) issues.push({ severity: 'medium', issue: `${imgsNoAlt} images missing alt text`, fix: 'Add descriptive alt attributes to all images.' });
  if (wordCount < 300) issues.push({ severity: 'medium', issue: `Thin content (${wordCount} words)`, fix: 'Expand to 500+ words with valuable content.' });
  if (!robotsTxt) issues.push({ severity: 'low', issue: 'Missing robots.txt', fix: 'Add a robots.txt file.' });
  if (!sitemapXml) issues.push({ severity: 'medium', issue: 'Missing sitemap.xml', fix: 'Generate and submit a sitemap.' });
  if (internalLinks < 5) issues.push({ severity: 'medium', issue: `Few internal links (${internalLinks})`, fix: 'Add more internal links to related pages.' });

  const critical = issues.filter(i => i.severity === 'critical').length;
  const high = issues.filter(i => i.severity === 'high').length;
  const medium = issues.filter(i => i.severity === 'medium').length;
  const low = issues.filter(i => i.severity === 'low').length;
  const score = Math.max(0, 100 - (critical * 25 + high * 10 + medium * 5 + low * 2));

  await logSop(svc, 'technical_audit', `Technical SEO audit for ${url}: score ${score}/100, ${issues.length} issues`,
    JSON.stringify({ score, critical, high, medium, low, issues }));

  return {
    ok: true,
    url,
    finalUrl: finalUrl.href,
    score,
    issues,
    summary: { critical, high, medium, low, total: issues.length },
    meta: { metaTitle, metaDescription, canonical, ogTitle, ogImage },
    counts: { h1s: h1s.length, images: imgs.length, imgsNoAlt, internalLinks, wordCount, jsonLdBlocks: jsonLdBlocks.length },
    robotsTxt: robotsTxt ? 'present' : 'missing',
    sitemapXml,
    auditedAt: new Date().toISOString(),
  };
}

// ── Content Generator ──
async function generateContent(svc, base44, keyword, pageType, industry) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an expert SEO content generator for a garage floor coating company. Generate optimized on-page content for this target:

Target Keyword: ${keyword}
Page Type: ${pageType || 'service'}
Industry: ${industry || 'Garage Floor Coating'}

Generate:
1. **Meta Title** (50-60 chars, include the target keyword naturally)
2. **Meta Description** (150-160 chars, compelling, include keyword)
3. **H1 Heading** (clear, keyword-focused)
4. **Schema Markup** (JSON-LD — use LocalBusiness, FAQPage, or Service as appropriate)
5. **Opening Paragraph** (100-150 words, naturally includes the keyword and related terms)
6. **FAQ Section** (3 questions + answers for long-tail and AI search visibility)

Return as JSON with keys: meta_title, meta_description, h1, schema_markup, opening_paragraph, faq (array of {question, answer}).`,
    response_json_schema: {
      type: 'object',
      properties: {
        meta_title: { type: 'string' },
        meta_description: { type: 'string' },
        h1: { type: 'string' },
        schema_markup: { type: 'string' },
        opening_paragraph: { type: 'string' },
        faq: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' },
            },
          },
        },
      },
    },
  });

  const content = res.data || res;

  await logSop(svc, 'content_generated', `Generated SEO content for keyword "${keyword}"`,
    JSON.stringify({ keyword, meta_title: content.meta_title, h1: content.h1 }));

  return { ok: true, keyword, content };
}

// ── Competitor Monitor ──
async function monitorCompetitors(svc, base44, competitorUrls) {
  const urls = competitorUrls || [];
  if (urls.length === 0) {
    const competitors = await svc.entities.CompetitorInsight.list('-created_date', 10).catch(() => []);
    for (const c of competitors) {
      if (c.url || c.competitor_url) urls.push(c.url || c.competitor_url);
    }
  }

  if (urls.length === 0) return { ok: true, checked: 0, message: 'No competitors configured' };

  const results = [];
  for (const compUrl of urls) {
    const fetched = await fetchWithTimeout(compUrl, 'Mozilla/5.0');
    let contentSummary;
    if ('error' in fetched) {
      // Fallback: LLM with web search
      const llmRes = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this competitor page: ${compUrl}. What's the page title, meta description, H1, word count, and schema markup? What SEO strategies are they using?`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' }, meta_description: { type: 'string' }, h1: { type: 'string' },
            word_count: { type: 'number' }, has_schema: { type: 'boolean' },
            content_summary: { type: 'string' }, seo_strategies: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      contentSummary = llmRes.data || llmRes;
    } else {
      const { html } = fetched;
      const title = extractMeta(html, /<title[^>]*>([^<]+)<\/title>/i);
      const h1 = extractMeta(html, /<h1[^>]*>([^<]+)<\/h1>/i);
      const metaDesc = extractMeta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      const hasSchema = /application\/ld\+json/i.test(html);
      contentSummary = { title, h1, meta_description: metaDesc, word_count: wordCount, has_schema: hasSchema, content_summary: `Fetched directly: ${title}` };
    }

    // Generate counter-strategy
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `A competitor's page was analyzed. Suggest counter-strategies for our garage floor coating business.

Competitor URL: ${compUrl}
Analysis: ${JSON.stringify(contentSummary).slice(0, 2000)}

What SEO strategies are they using? How should we respond to maintain or improve our rankings? Return as JSON: { "detected_strategies": ["..."], "threat_level": "low|medium|high", "counter_strategy": "...", "suggested_actions": ["..."] }`,
      response_json_schema: {
        type: 'object',
        properties: {
          detected_strategies: { type: 'array', items: { type: 'string' } },
          threat_level: { type: 'string' },
          counter_strategy: { type: 'string' },
          suggested_actions: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    const analysisData = analysis.data || analysis;

    await svc.entities.CompetitorInsight.create({
      competitor_url: compUrl,
      competitor_name: contentSummary.title || compUrl,
      insight_type: 'seo_analysis',
      summary: `Threat: ${analysisData.threat_level || 'medium'}. ${analysisData.counter_strategy || ''}`,
      details: JSON.stringify({ content_summary: contentSummary, analysis: analysisData }).slice(0, 4000),
      threat_level: analysisData.threat_level || 'medium',
    }).catch(() => {});

    results.push({ url: compUrl, analysis: analysisData, contentSummary });
  }

  await logSop(svc, 'competitor_monitor', `Monitored ${results.length} competitors`,
    JSON.stringify(results.map(r => ({ url: r.url, threat: r.analysis.threat_level }))));

  return { ok: true, checked: results.length, results };
}

// ── Search Console Sync ──
async function syncSearchConsole(svc, base44) {
  try {
    const res = await base44.functions.invoke('pullSearchConsoleData', { days: 30 });
    await logSop(svc, 'search_console_sync', 'Synced Google Search Console data (30 days)', JSON.stringify(res.data || res));
    return { ok: true, synced: true, data: res.data || res };
  } catch (e) {
    await logSop(svc, 'search_console_sync', `Search Console sync failed: ${e.message}`, '');
    return { ok: false, error: e.message };
  }
}

// ── Main handler ──
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'technicalAudit';

    let result;
    switch (action) {
      case 'technicalAudit':
        result = await technicalAudit(svc, base44, body.url);
        break;
      case 'generateContent':
        result = await generateContent(svc, base44, body.keyword, body.pageType, body.industry);
        break;
      case 'monitorCompetitors':
        result = await monitorCompetitors(svc, base44, body.competitorUrls);
        break;
      case 'syncSearchConsole':
        result = await syncSearchConsole(svc, base44);
        break;
      case 'runFullCycle':
        const audit = body.url ? await technicalAudit(svc, base44, body.url) : { skipped: true };
        const content = body.keyword ? await generateContent(svc, base44, body.keyword, body.pageType, body.industry) : { skipped: true };
        const competitors = await monitorCompetitors(svc, base44, body.competitorUrls);
        const sc = await syncSearchConsole(svc, base44);
        result = { ok: true, audit, content, competitors, searchConsole: sc };
        break;
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('[seoGenerator] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}