import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ─────────────────────────────────────────────────────────────────────────────
// seoSimSync — Unified sync + generator for the SEO/AEO Simulator.
//
// SYNC (parallel):   Pull real data from Google Search Console, Google
//                    Analytics, and Facebook Pages simultaneously, then map
//                    it to simulator module updates the UI can merge in.
//
// GENERATOR (sequential): Run a fixed pipeline of optimization steps in order
//                    — inspect URL, submit sitemap, ping IndexNow, submit to
//                    indexers, check CWV, generate sitemap, optimize content,
//                    scan competitors — returning a step-by-step execution log.
//
// Actions:
//   syncAll       — pull from all 3 connectors in parallel
//   syncGSC       — pull Google Search Console data (keyword perf, sitemaps, URL inspection)
//   syncGA        — pull Google Analytics traffic/engagement
//   syncFacebook  — pull Facebook Pages insights
//   inspectUrl    — inspect a single URL's indexing status in GSC
//   submitSitemap — submit a sitemap to GSC
//   generate      — run the full sequential generator pipeline
//   runStep       — run a single generator step
//
// Invoke: base44.functions.invoke('seoSimSync', { action: 'syncAll', keyword, url })
// ─────────────────────────────────────────────────────────────────────────────

function dateStr(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC: Google Search Console
// ═══════════════════════════════════════════════════════════════════════════

async function syncGSC(base44: any, keyword?: string, url?: string) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

  // List sites
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!sitesRes.ok) {
    const err = await sitesRes.json().catch(() => ({}));
    throw new Error(`GSC sites list failed: ${err.error?.message || sitesRes.statusText}`);
  }
  const sitesData = await sitesRes.json();
  const siteEntries = sitesData.siteEntry || [];

  // Query each site (limit 5) for keyword performance + sitemaps
  const siteResults = await Promise.all(siteEntries.slice(0, 5).map(async (site: any) => {
    const siteUrl = site.siteUrl;
    const encoded = encodeURIComponent(siteUrl);

    // Search analytics for keyword (or top queries if no keyword)
    const searchBody: any = {
      startDate: dateStr(28),
      endDate: dateStr(0),
      dimensions: ['query'],
      rowLimit: 20,
    };
    if (keyword) {
      searchBody.dimensionFilterGroups = [{
        filters: [{ dimension: 'query', expression: keyword }],
      }];
    }
    const searchRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(searchBody),
    });
    const searchData = await searchRes.json().catch(() => ({}));

    // Sitemaps
    const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encoded}/sitemaps`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const sitemapsData = await sitemapsRes.json().catch(() => ({}));

    return {
      site_url: siteUrl,
      keyword_rows: (searchData.rows || []).map((r: any) => ({
        query: r.keys?.[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: Math.round((r.ctr || 0) * 10000) / 100,
        position: Math.round((r.position || 0) * 10) / 10,
      })),
      sitemaps: (sitemapsData.sitemap || []).map((s: any) => ({
        path: s.path,
        lastSubmitted: s.lastSubmitted,
        processed: s.isProcessed,
        errors: s.errors,
        warnings: s.warnings,
      })),
    };
  }));

  // URL inspection (if URL provided)
  let inspection = null;
  if (url && siteEntries.length > 0) {
    const inspectRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: url, siteUrl: siteEntries[0].siteUrl }),
    });
    const inspectData = await inspectRes.json().catch(() => ({}));
    inspection = inspectData?.inspectionResult?.indexStatusResult || null;
  }

  return { sites: siteResults, inspection };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC: Google Analytics (GA4)
// ═══════════════════════════════════════════════════════════════════════════

async function syncGA(base44: any) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');

  // List GA4 properties
  const propsRes = await fetch('https://analyticsdata.googleapis.com/v1beta/properties', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!propsRes.ok) {
    const err = await propsRes.json().catch(() => ({}));
    throw new Error(`GA properties list failed: ${err.error?.message || propsRes.statusText}`);
  }
  const propsData = await propsRes.json();
  const properties = propsData.properties || [];

  if (properties.length === 0) {
    return { properties: [], message: 'No GA4 properties found — set up GA4 first.' };
  }

  // Run a 28-day report on the first property
  const propertyId = properties[0].name.split('/')[1];
  const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: dateStr(28), endDate: dateStr(0) }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
      ],
    }),
  });
  const report = await reportRes.json().catch(() => ({}));
  const row = report.rows?.[0]?.metricValues || [];

  return {
    properties: properties.map((p: any) => ({ id: p.name, displayName: p.displayName })),
    metrics: {
      sessions: Number(row[0]?.value) || 0,
      users: Number(row[1]?.value) || 0,
      bounce_rate: Math.round((Number(row[2]?.value) || 0) * 100) / 100,
      avg_session_duration: Math.round(Number(row[3]?.value) || 0),
      page_views: Number(row[4]?.value) || 0,
      engagement_rate: Math.round((Number(row[5]?.value) || 0) * 10000) / 100,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC: Facebook Pages
// ═══════════════════════════════════════════════════════════════════════════

async function syncFacebook(base44: any) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('facebook_pages');

  const pagesRes = await fetch('https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token,picture,fan_count,followers_count', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!pagesRes.ok) {
    const err = await pagesRes.json().catch(() => ({}));
    throw new Error(`Facebook pages list failed: ${err.error?.message || pagesRes.statusText}`);
  }
  const pagesData = await pagesRes.json();
  const pages = pagesData.data || [];

  const since = Math.floor((Date.now() - 28 * 86400000) / 1000);

  const pageResults = await Promise.all(pages.slice(0, 3).map(async (page: any) => {
    // Recent posts
    const postsRes = await fetch(
      `https://graph.facebook.com/v25.0/${page.id}/posts?fields=id,message,created_time,insights.metric(post_impressions,post_engaged_users)&since=${since}&limit=100`,
      { headers: { Authorization: `Bearer ${page.access_token}` } },
    );
    const postsData = await postsRes.json().catch(() => ({}));
    const posts = postsData.data || [];

    let totalImpressions = 0;
    let totalEngaged = 0;
    posts.forEach((p: any) => {
      const imp = p.insights?.data?.find((d: any) => d.name === 'post_impressions');
      const eng = p.insights?.data?.find((d: any) => d.name === 'post_engaged_users');
      totalImpressions += imp?.values?.[0]?.value || 0;
      totalEngaged += eng?.values?.[0]?.value || 0;
    });

    return {
      id: page.id,
      name: page.name,
      fan_count: page.fan_count || 0,
      followers: page.followers_count || 0,
      posts_last_28_days: posts.length,
      posts_per_week: Math.round((posts.length / 4) * 10) / 10,
      total_impressions: totalImpressions,
      total_engaged: totalEngaged,
      engagement_rate: totalImpressions > 0 ? Math.round((totalEngaged / totalImpressions) * 1000) / 10 : 0,
    };
  }));

  return { pages: pageResults };
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS: GSC inspect + sitemap submit + IndexNow ping
// ═══════════════════════════════════════════════════════════════════════════

async function inspectUrlAction(base44: any, url: string, siteUrl: string) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');
  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Inspection failed (${res.status})`);
  return data?.inspectionResult?.indexStatusResult || data;
}

async function submitSitemapAction(base44: any, siteUrl: string, sitemapUrl: string) {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');
  const encodedSite = encodeURIComponent(siteUrl);
  const feedUrl = sitemapUrl.startsWith('http') ? sitemapUrl : `${siteUrl.replace(/\/$/, '')}/${sitemapUrl.replace(/^\//, '')}`;
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodeURIComponent(feedUrl)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Sitemap submit failed (${res.status})`);
  }
  return { submitted: true, sitemapUrl: feedUrl };
}

async function pingIndexNow(url: string, key: string = 'epoxyquotenearme') {
  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: new URL(url).host,
      key,
      keyLocation: `https://${new URL(url).host}/${key}.txt`,
      urlList: [url],
    }),
  });
  return { ok: res.ok, status: res.status };
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATOR: sequential pipeline
// ═══════════════════════════════════════════════════════════════════════════

const GENERATOR_STEPS = [
  { id: 'inspect_url', title: 'Inspect URL in Google Search Console', description: 'Check current indexing status and coverage state' },
  { id: 'submit_sitemap', title: 'Submit Sitemap to GSC', description: 'Ensure Google knows about all your pages' },
  { id: 'ping_indexnow', title: 'Ping IndexNow', description: 'Notify Bing, Yandex, and other engines of changes instantly' },
  { id: 'submit_indexers', title: 'Submit to Indexers', description: 'Submit URL to additional indexing services' },
  { id: 'fetch_cwv', title: 'Check Core Web Vitals', description: 'Get real page speed and CWV field scores' },
  { id: 'generate_sitemap', title: 'Generate Sitemap', description: 'Create or update the XML sitemap' },
  { id: 'optimize_seo', title: 'Optimize SEO Content', description: 'AI-optimize page content for the target keyword' },
  { id: 'scan_competitors', title: 'Scan Competitors', description: 'Analyze competitor pages ranking for the target keyword' },
];

async function runStep(base44: any, stepId: string, params: any): Promise<any> {
  const { url, siteUrl, sitemapUrl, keyword } = params;

  switch (stepId) {
    case 'inspect_url':
      return await inspectUrlAction(base44, url, siteUrl);

    case 'submit_sitemap':
      return await submitSitemapAction(base44, siteUrl, sitemapUrl);

    case 'ping_indexnow':
      return await pingIndexNow(url);

    case 'submit_indexers':
      return (await base44.functions.invoke('submitToIndexers', { url })).data;

    case 'fetch_cwv':
      return (await base44.functions.invoke('fetchCoreWebVitals', { url })).data;

    case 'generate_sitemap':
      return (await base44.functions.invoke('generateSitemap', { siteUrl })).data;

    case 'optimize_seo':
      return (await base44.functions.invoke('optimizeSeo', { url, keyword })).data;

    case 'scan_competitors':
      return (await base44.functions.invoke('scanCompetitors', { keyword })).data;

    default:
      throw new Error(`Unknown step: ${stepId}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'syncAll';

    // ── syncAll: parallel sync from all connectors ──
    if (action === 'syncAll') {
      const results = await Promise.allSettled([
        syncGSC(base44, body.keyword, body.url),
        syncGA(base44),
        syncFacebook(base44),
      ]);

      const gsc = results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message };
      const ga = results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message };
      const fb = results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message };

      // Map live data → simulator module updates
      const moduleUpdates: any = {};

      if (gsc && !gsc.error) {
        const hasSitemap = gsc.sites?.some((s: any) => s.sitemaps?.length > 0);
        moduleUpdates.technical = { ...(moduleUpdates.technical || {}), has_sitemap: !!hasSitemap };
        if (gsc.inspection) {
          moduleUpdates.technical.has_schema = !!gsc.inspection.richResultsResult?.verdict;
        }
      }

      if (fb && !fb.error && fb.pages?.length > 0) {
        const page = fb.pages[0];
        moduleUpdates.social = {
          facebook: true,
          posting_frequency: Math.max(page.posts_per_week, 1),
          engagement_rate: Math.min(page.engagement_rate, 100),
        };
      }

      return Response.json({
        ok: true,
        google_search_console: gsc,
        google_analytics: ga,
        facebook_pages: fb,
        module_updates: moduleUpdates,
        synced_at: new Date().toISOString(),
      });
    }

    // ── Individual sync actions ──
    if (action === 'syncGSC') {
      try { return Response.json({ ok: true, ...(await syncGSC(base44, body.keyword, body.url)) }); }
      catch (e: any) { return Response.json({ error: e.message }, { status: 502 }); }
    }

    if (action === 'syncGA') {
      try { return Response.json({ ok: true, ...(await syncGA(base44)) }); }
      catch (e: any) { return Response.json({ error: e.message }, { status: 502 }); }
    }

    if (action === 'syncFacebook') {
      try { return Response.json({ ok: true, ...(await syncFacebook(base44)) }); }
      catch (e: any) { return Response.json({ error: e.message }, { status: 502 }); }
    }

    // ── Individual actions ──
    if (action === 'inspectUrl') {
      try { return Response.json({ ok: true, ...(await inspectUrlAction(base44, body.url, body.siteUrl)) }); }
      catch (e: any) { return Response.json({ error: e.message }, { status: 502 }); }
    }

    if (action === 'submitSitemap') {
      try { return Response.json({ ok: true, ...(await submitSitemapAction(base44, body.siteUrl, body.sitemapUrl)) }); }
      catch (e: any) { return Response.json({ error: e.message }, { status: 502 }); }
    }

    // ── Generator: list steps ──
    if (action === 'listSteps') {
      return Response.json({ ok: true, steps: GENERATOR_STEPS });
    }

    // ── Generator: run single step ──
    if (action === 'runStep') {
      try {
        const result = await runStep(base44, body.step, { url: body.url, siteUrl: body.siteUrl, sitemapUrl: body.sitemapUrl, keyword: body.keyword });
        return Response.json({ ok: true, step: body.step, result });
      } catch (e: any) {
        return Response.json({ ok: false, step: body.step, error: e.message });
      }
    }

    // ── Generator: run full pipeline sequentially ──
    if (action === 'generate') {
      const params = { url: body.url, siteUrl: body.siteUrl, sitemapUrl: body.sitemapUrl, keyword: body.keyword };
      const steps: any[] = [];

      for (const stepDef of GENERATOR_STEPS) {
        const stepResult: any = { ...stepDef, status: 'running', started_at: new Date().toISOString() };
        steps.push(stepResult);
        try {
          const result = await runStep(base44, stepDef.id, params);
          stepResult.status = 'completed';
          stepResult.result = result;
        } catch (e: any) {
          stepResult.status = 'failed';
          stepResult.error = e.message;
        }
        stepResult.completed_at = new Date().toISOString();
      }

      const completed = steps.filter(s => s.status === 'completed').length;
      const failed = steps.filter(s => s.status === 'failed').length;

      return Response.json({
        ok: true,
        steps,
        summary: { total: steps.length, completed, failed },
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[seoSimSync] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}