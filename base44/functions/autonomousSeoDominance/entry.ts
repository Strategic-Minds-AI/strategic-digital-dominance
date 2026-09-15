import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { logStep } from '../../shared/sopLog.ts';
import { generateText } from '../../shared/aiGateway.ts';

// ═══════════════════════════════════════════════════════════════════════════
// autonomousSeoDominance
// The aggressive, persistent, autonomous SEO/AEO dominance engine.
//
// Runs the full closed-loop cycle:
//   1. Pull fresh Google Search Console data (page+query attributed)
//   2. Discover opportunity keywords (impressions > threshold, position > 10 = page 2+)
//   3. For NEW keywords → auto-generate SEO pages targeting them
//   4. For EXISTING underperforming pages → re-optimize titles/meta/FAQ
//   5. Submit all changed/new URLs to IndexNow for instant crawling
//   6. Return a dominance report
//
// Invoke: base44.functions.invoke('autonomousSeoDominance', { max_new_pages?: 5 })
// ═══════════════════════════════════════════════════════════════════════════

const INDEXNOW_KEY = 'a3e6350908f1c2d4e6b8a0123456789a';
const INDEXNOW_SITE = 'epoxyquotenearme.base44.app';

function slugify(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function pingIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: INDEXNOW_SITE,
        key: INDEXNOW_KEY,
        keyLocation: `https://${INDEXNOW_SITE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {}
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const maxNewPages = Math.min(body.max_new_pages || 5, 10);
    const now = new Date().toISOString();

    const report: any = {
      started_at: now,
      steps: [],
      opportunities_found: 0,
      pages_generated: 0,
      pages_reoptimized: 0,
      urls_submitted: 0,
      errors: [],
    };

    // ── STEP 1: Pull fresh Google Search Console data ──
    try {
      const scRes = await base44.functions.invoke('pullSearchConsoleData', {});
      const scData = scRes.data || scRes;
      report.steps.push({
        step: 'pull_search_console',
        ok: !scData.error,
        impressions: scData.totals?.impressions || 0,
        clicks: scData.totals?.clicks || 0,
        pages: scData.totals?.pages || 0,
      });
      if (scData.error) {
        report.errors.push(`Search Console pull failed: ${scData.error}`);
      }
    } catch (e: any) {
      report.steps.push({ step: 'pull_search_console', ok: false, error: e.message });
      report.errors.push(`Search Console pull error: ${e.message}`);
    }

    // ── STEP 2: Discover opportunity keywords from GSC data ──
    // Opportunity = query with impressions > 10 AND avg position > 10 (page 2+)
    // These are keywords Google already shows us for, but we're not on page 1.
    const seoContents = await svc.entities.SeoContent.list(200);
    const allQueries: any[] = [];

    for (const rec of seoContents) {
      const perf = rec.performance_snapshot || {};
      const topQueries = perf.top_queries || [];
      for (const q of topQueries) {
        if ((q.impressions || 0) >= 10 && (q.position || 100) > 10) {
          allQueries.push({
            query: q.query,
            impressions: q.impressions,
            clicks: q.clicks,
            position: q.position,
            route: rec.route,
            has_page: true,
          });
        }
      }
    }

    // Also use AI to discover NEW keyword opportunities we're not yet targeting
    let newKeywords: string[] = [];
    if (allQueries.length > 0 || seoContents.length > 0) {
      try {
        const existingKeywords = seoContents.map((r) => r.route).join(', ');
        const queryData = allQueries.slice(0, 15).map(q => `"${q.query}" (${q.impressions} impr, pos ${q.position?.toFixed(1)})`).join('\n');

        const { parsed: kwRes } = await generateText({
          prompt: `You are an aggressive SEO strategist for a garage floor coating company. Based on these Google Search Console queries where we appear on page 2+ (not page 1), and our existing pages, identify 5-10 NEW high-intent keyword opportunities we should create content pages for to capture more first-page rankings.

Current page-2+ queries (opportunities to improve):
${queryData || 'No GSC data yet — suggest foundational garage floor coating keywords.'}

Existing pages: ${existingKeywords || 'None yet'}

Return only JSON: { "keywords": ["keyword 1", "keyword 2", ...] }
Each keyword should be a specific long-tail phrase a homeowner would search (e.g. "polyaspartic vs epoxy garage floor", "garage floor coating for hot climates", "how long does epoxy garage floor last").`,
          response_json_schema: {
            type: 'object',
            properties: {
              keywords: { type: 'array', items: { type: 'string' } },
            },
          },
        });
        newKeywords = (kwRes as any)?.keywords || [];
      } catch (e: any) {
        report.errors.push(`Keyword discovery error: ${e.message}`);
      }
    }

    report.opportunities_found = allQueries.length + newKeywords.length;
    report.steps.push({
      step: 'discover_opportunities',
      ok: true,
      page2_plus_queries: allQueries.length,
      new_keyword_ideas: newKeywords.length,
    });

    // ── STEP 3: Auto-generate pages for NEW keywords ──
    const existingPages = await svc.entities.GeneratedPage.list(500);
    const existingSlugs = new Set(existingPages.map((p) => p.slug?.toLowerCase()));
    const existingKeywordsSet = new Set(existingPages.map((p) => (p.keyword || '').toLowerCase()));

    const urlsToSubmit: string[] = [];
    const generatedPages: any[] = [];

    for (const keyword of newKeywords.slice(0, maxNewPages)) {
      const kwLower = keyword.toLowerCase();
      if (existingKeywordsSet.has(kwLower)) continue;

      try {
        const pageRes = await base44.functions.invoke('generateSeoPage', { keyword });
        const page = pageRes.data || pageRes;
        if (page?.page?.slug) {
          generatedPages.push({ keyword, slug: page.page.slug });
          urlsToSubmit.push(`https://${INDEXNOW_SITE}/${page.page.slug}`);
          existingSlugs.add(page.page.slug.toLowerCase());
          existingKeywordsSet.add(kwLower);
        }
      } catch (e: any) {
        report.errors.push(`Page generation failed for "${keyword}": ${e.message}`);
      }
    }

    report.pages_generated = generatedPages.length;
    report.steps.push({
      step: 'generate_new_pages',
      ok: true,
      generated: generatedPages.length,
      keywords: generatedPages.map((g) => g.keyword),
    });

    // ── STEP 4: Re-optimize underperforming existing pages ──
    // Pages with position > 10 or CTR < 2% or no performance data
    const underperforming = seoContents.filter((rec) => {
      const perf = rec.performance_snapshot || {};
      const hasData = perf.impressions || perf.clicks || perf.avg_position;
      if (!hasData) return false; // skip pages with no data
      const pos = perf.avg_position || 100;
      const ctr = perf.ctr || 0;
      return pos > 10 || ctr < 0.02;
    });

    let reoptimized = 0;
    if (underperforming.length > 0) {
      try {
        const optRes = await base44.functions.invoke('optimizeSeo', {});
        const optData = optRes.data || optRes;
        reoptimized = optData.improved || 0;
        report.steps.push({
          step: 'reoptimize_underperforming',
          ok: !optData.error,
          reoptimized,
          underperforming_count: underperforming.length,
        });
      } catch (e: any) {
        report.steps.push({ step: 'reoptimize_underperforming', ok: false, error: e.message });
        report.errors.push(`Re-optimization error: ${e.message}`);
      }
    } else {
      report.steps.push({ step: 'reoptimize_underperforming', ok: true, reoptimized: 0, underperforming_count: 0 });
    }

    report.pages_reoptimized = reoptimized;

    // ── STEP 5: Submit all changed/new URLs to IndexNow ──
    // Also submit the underperforming pages that were re-optimized
    for (const rec of underperforming.slice(0, 20)) {
      const path = rec.route || '';
      if (path) {
        urlsToSubmit.push(`https://${INDEXNOW_SITE}${path}`);
      }
    }

    // Deduplicate URLs
    const uniqueUrls = [...new Set(urlsToSubmit)];
    await pingIndexNow(uniqueUrls);

    report.urls_submitted = uniqueUrls.length;
    report.steps.push({
      step: 'submit_to_indexers',
      ok: true,
      urls_submitted: uniqueUrls.length,
    });

    // ── STEP 6: Run content gap analysis if competitor data exists ──
    try {
      const gapRes = await base44.functions.invoke('fillContentGaps', {});
      const gapData = gapRes.data || gapRes;
      report.steps.push({
        step: 'fill_content_gaps',
        ok: !gapData.error,
        found: gapData.found || 0,
        generated: gapData.generated || 0,
      });
    } catch (e: any) {
      // Non-fatal — skip if no competitor data
      report.steps.push({ step: 'fill_content_gaps', ok: false, skipped: true, error: e.message });
    }

    report.completed_at = new Date().toISOString();

    await logStep(base44, {
      category: 'seo',
      action: 'Autonomous SEO Dominance cycle completed',
      detail: `Opportunities: ${report.opportunities_found}, Pages generated: ${report.pages_generated}, Re-optimized: ${report.pages_reoptimized}, URLs submitted: ${report.urls_submitted}`,
      meta: JSON.stringify({ steps: report.steps.length, errors: report.errors.length }),
      source: 'autonomousSeoDominance',
    });

    return Response.json({ ok: true, ...report });
  } catch (error) {
    console.error('[autonomousSeoDominance] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}