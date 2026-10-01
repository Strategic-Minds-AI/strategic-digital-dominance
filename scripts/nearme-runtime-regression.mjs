import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

const workflow = read('base44/workflows/Alpha Prime Heartbeat.jsonc');
const google = read('base44/functions/nearmeGoogleAdapter/entry.ts');
const reconcile = read('base44/functions/nearmeReconcile/entry.ts');
const keyword = read('base44/entities/KeywordOpportunity.jsonc');
const sales = read('base44/entities/SalesAttribution.jsonc');
const lineReceipt = read('base44/entities/LineValidationReceipt.jsonc');

check('single workflow keeps 5-minute cadence', workflow.includes('"cron_expression": "*/5 * * * *"'));
check('single workflow chains existing heartbeat', workflow.includes('"function_name": "alphaPrimeHeartbeat"'));
check('single workflow chains NearMe dry-run', workflow.includes('"function_name": "nearmeReconcile"') && workflow.includes('"mode": "dry_run"'));
check('no second scheduler is introduced', !workflow.includes('15 * * * *') && (workflow.match(/cron_expression/g) || []).length === 1);
check('Google adapter is read-only', google.includes('mode: "READ_ONLY"'));
check('GSC property matching is exact', google.includes('exactGscProperty') && google.includes('sc-domain:${domain}'));
check('GA4 requires exact property id', google.includes('EXACT_GA4_PROPERTY_ID_REQUIRED'));
check('Google adapter has no Search Console property create', !google.includes('sites.add') && !google.includes('create_gsc_property'));
check('Google adapter has no sitemap submit', !google.includes('/sitemaps/') && !google.includes('submitSitemap'));
check('reconcile defaults dry-run', reconcile.includes('body.mode || "dry_run"'));
check('execute path requires explicit approval', reconcile.includes('EXPLICIT_INTERNAL_WRITE_APPROVAL_REQUIRED'));
check('dry-run reports zero writes', reconcile.includes('writes_performed: 0'));
check('domain lifecycle remains protected', reconcile.includes('action_class: "PROTECTED"'));
check('verified revenue comes from SalesAttribution', reconcile.includes('SalesAttribution') && reconcile.includes('verifiedRevenue'));
check('keyword evidence states remain explicit', keyword.includes('"VERIFIED"') && keyword.includes('"PARTIAL"') && keyword.includes('"INFERRED"') && keyword.includes('"BLOCKED"'));
check('keyword source distinguishes GSC from estimates', keyword.includes('"search_console"') && keyword.includes('"provider_estimate"'));
check('sales revenue source is explicit', sales.includes('"crm"') && sales.includes('"order"') && sales.includes('"manual_verified"'));
check('line receipt fails closed', lineReceipt.includes('"PASS"') && lineReceipt.includes('"FAIL"') && lineReceipt.includes('"BLOCKED"'));

const failed = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'}  ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
if (failed.length) {
  console.error(`\n${failed.length} NearMe runtime regression check(s) failed.`);
  process.exit(1);
}
console.log(`\n${checks.length} NearMe runtime regression checks passed.`);
