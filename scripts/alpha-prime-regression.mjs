import fs from 'node:fs';

const checks = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const check = (name, pass, detail) => checks.push({ name, pass: Boolean(pass), detail });

const audit = read('base44/functions/alphaPrimeAudit/entry.ts');
const heartbeat = read('base44/functions/alphaPrimeHeartbeat/entry.ts');
const swarm = read('base44/functions/swarmOrchestrator/entry.ts');
const leadSchema = read('base44/entities/Lead.jsonc');
const funnelSchema = read('base44/entities/FunnelEvent.jsonc');
const swarmAuditSchema = read('base44/entities/SwarmAudit.jsonc');

check(
  'FunnelEvent schema uses event field',
  /"event"\s*:\s*\{/.test(funnelSchema) && !/"event_type"\s*:\s*\{/.test(funnelSchema),
  'Analytics source-truth field must be event.'
);

check(
  'Alpha Prime audit reads FunnelEvent.event',
  audit.includes('e.event === "funnel_started"') && !audit.includes('e.event_type === "funnel_started"'),
  'Prevents 500/500 false undefined event findings.'
);

check(
  'Connector auth is not mislabeled SYNC healthy',
  heartbeat.includes('CONNECTED_AUTH_OK') && !heartbeat.includes('connectorFreshness[type] = "VERIFIED_HEALTHY"'),
  'getConnection only proves authenticated connection, not end-to-end sync.'
);

check(
  'Sitemap validator performs set reconciliation',
  heartbeat.includes('registryMissingFromSitemap') && heartbeat.includes('nonCanonicalLocationUrls'),
  'Prevents domain-string-only sitemap false greens.'
);

check(
  'autoFix cannot self-certify fixed',
  swarm.includes("Only an independent postcondition validator may promote an audit to `fixed`") &&
    !swarm.includes("actuallyFixed ? 'fixed' : 'failed'"),
  'Remediation must enter retesting and await postcondition validation.'
);

check(
  'autoHeal reports requeue, not healed',
  swarm.includes('requeued_count') && !swarm.includes('healed_count'),
  'Retrying a failed task is not proof it healed.'
);

check(
  'Stale audit age cannot auto-close wont_fix',
  swarm.includes('Stale audit escalation') && !swarm.includes("status: 'wont_fix', fix_result: 'Auto-hardened: audit open for >7 days'"),
  'Old unresolved findings must escalate rather than disappear.'
);

check(
  'Lead PII read/update/delete are admin-gated',
  leadSchema.includes('"rls"') &&
    leadSchema.includes('"read"') &&
    leadSchema.includes('"update"') &&
    leadSchema.includes('"delete"') &&
    leadSchema.includes('"role": "admin"'),
  'Static schema guard; runtime authorization canary is still required.'
);

check(
  'SwarmAudit supports retest/regression states',
  swarmAuditSchema.includes('"retesting"') && swarmAuditSchema.includes('"regression_testing"'),
  'Allows deterministic postcondition and regression workflow.'
);

const failed = checks.filter((c) => !c.pass);
for (const c of checks) {
  console.log(`${c.pass ? 'PASS' : 'FAIL'} | ${c.name} | ${c.detail}`);
}
console.log(`\nAlpha Prime regression: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
