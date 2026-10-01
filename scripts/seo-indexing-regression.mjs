import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

const robots = read('public/robots.txt');
const seo = read('src/components/Seo.jsx');
const notFound = read('src/lib/PageNotFound.jsx');
const location = read('src/pages/seo/LocationSeoPage.jsx');
const shell = read('scripts/server-seo-shells.mjs');
const shellTest = read('scripts/server-seo-shells.test.mjs');
const vercel = JSON.parse(read('vercel.json'));
const googleStatus = read('base44/functions/checkGoogleStatus/entry.ts');
const addGsc = read('base44/functions/addSearchConsoleProperty/entry.ts');
const verifyGsc = read('base44/functions/verifySearchConsole/entry.ts');
const notifier = read('base44/functions/notifySeoUpdates/entry.ts');
const indexers = read('base44/functions/submitToIndexers/entry.ts');
const googleAdapter = read('base44/functions/nearmeGoogleAdapter/entry.ts');
const heartbeatWorkflow = read('base44/workflows/Alpha Prime Heartbeat.jsonc');

check('robots blocks admin', robots.includes('Disallow: /admin'));
check('robots blocks API', robots.includes('Disallow: /api/'));
check('robots lets noindex app routes be crawled', !robots.includes('Disallow: /download') && !robots.includes('Disallow: /questionnaire'));
check('robots has exactly one sitemap', (robots.match(/^Sitemap:/gm) || []).length === 1);
check('robots retires legacy sitemap', !robots.includes('sitemap-epn.xml'));

check('RouteSeo has explicit noindex policy', seo.includes('shouldNoIndex(path'));
check('RouteSeo respects runtime 404 marker', seo.includes('dataset.pageNotFound === "true"'));
check('RouteSeo removes canonical on noindex', seo.includes('if (noIndex) removeCanonical()'));
check('RouteSeo suppresses structured data on noindex', seo.includes('noIndex ? [] : buildJsonLd'));

check('404 sets noindex', notFound.includes('noindex, nofollow'));
check('404 removes canonical', notFound.includes('link[rel="canonical"]'));
check('404 sets runtime marker', notFound.includes("dataset.pageNotFound = 'true'"));

check('legacy full-state route uses document navigation', location.includes('window.location.replace(canonicalPath)'));
check('legacy full-state route sets noindex', location.includes('noindex, follow'));

check('server shells derive from verified store source', shell.includes('XPS_LOCATIONS') && shell.includes("location.status !== 'coming_soon'"));
check('server shells generate sitemap from emitted routes', shell.includes("fs.writeFileSync(path.join(distDir, 'sitemap.xml')"));
check('server shell regression excludes aliases', shellTest.includes('full-state aliases must not be in sitemap'));
check('server shell regression excludes noindex download route', shellTest.includes('noindex app route must not be in sitemap'));

const finalRoute = vercel.routes?.[vercel.routes.length - 1];
check('Vercel unknown routes fail with real 404', finalRoute?.status === 404 && finalRoute?.src === '/.*');
check('Vercel admin route is noindex', JSON.stringify(vercel).includes('noindex, nofollow'));
check('Vercel filesystem routes are resolved before catch-all', vercel.routes?.[0]?.handle === 'filesystem');

check('Google status uses CanonicalSiteRegistry', googleStatus.includes('CanonicalSiteRegistry'));
check('Google status checks exact domain property', googleStatus.includes('expectedDomainProperty') && googleStatus.includes('sc-domain:${domain}'));
check('Google status has no legacy estimate domain', !googleStatus.includes('epoxygaragefloorestimate'));

check('Search Console add uses CanonicalSiteRegistry', addGsc.includes('CanonicalSiteRegistry'));
check('Search Console add is approval gated', addGsc.includes('approved_protected_action') && addGsc.includes('PROTECTED'));
check('Search Console add has no legacy domain fallback', !addGsc.includes('epoxygaragefloorestimate'));

check('Search Console verification uses canonical registry', verifyGsc.includes('CanonicalSiteRegistry'));
check('Search Console verification is approval gated', verifyGsc.includes('approved_protected_action'));
check('Search Console verification does not echo token', !verifyGsc.includes('token: verifyToken') && !verifyGsc.includes('verifyToken,'));

check('SEO notifier defaults to dry-run', notifier.includes('body.mode || "dry_run"'));
check('SEO notifier requires approved external write', notifier.includes('approved_external_write'));
check('SEO notifier rejects Base44 preview host', notifier.includes('domain.endsWith(".base44.app")'));

check('IndexNow submission uses canonical registries', indexers.includes('CanonicalSiteRegistry') && indexers.includes('CanonicalLocationRegistry'));
check('IndexNow submission defaults to dry-run', indexers.includes('body.mode || "dry_run"'));
check('IndexNow submission requires approval', indexers.includes('approved_external_write'));
check('IndexNow submission has no Base44 production host', !indexers.includes('epoxyquotenearme.base44.app'));

check('NearMe Google adapter remains read-only', googleAdapter.includes('mode: "READ_ONLY"'));
check('NearMe Google adapter has no GSC property mutation', !googleAdapter.includes('sites.add') && !googleAdapter.includes('create_gsc_property'));
check('no Google Indexing API is used for service pages', ![notifier, indexers, googleAdapter].some((source) => source.includes('indexing.googleapis.com')));

check('one five-minute workflow remains canonical', (heartbeatWorkflow.match(/cron_expression/g) || []).length === 1 && heartbeatWorkflow.includes('"*/5 * * * *"'));
check('NearMe reconciliation remains dry-run in heartbeat', heartbeatWorkflow.includes('"function_name": "nearmeReconcile"') && heartbeatWorkflow.includes('"mode": "dry_run"'));

const failed = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'}  ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
if (failed.length) {
  console.error(`\n${failed.length} SEO/index eligibility regression check(s) failed.`);
  process.exit(1);
}
console.log(`\n${checks.length} SEO/index eligibility regression checks passed.`);
