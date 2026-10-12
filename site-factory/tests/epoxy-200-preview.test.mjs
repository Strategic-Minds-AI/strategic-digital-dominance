import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testsDir, "../..");
const loadText = (p) => readFile(path.join(repoRoot, p), "utf8");
const getPack = async () => JSON.parse(await loadText("site-factory/rollouts/epoxy-200.preview.json"));

test("Exactly 200 source-linked, unique site candidates, no fabricated URLs", async () => {
  const manifest = await getPack();
  assert.equal(manifest.schema_version, "epoxy-site-factory-candidate-v1");
  assert.equal(manifest.lifecycle, "PREVIEW_CANDIDATES_ONLY");
  assert.equal(manifest.locations.length, 200);
  const keys = new Set();
  const routes = new Set();
  for (const [i, loc] of manifest.locations.entries()) {
    assert.equal(loc.sequence, i + 1);
    assert.match(loc.location_key, /^[a-z]{2}-[a-z0-9-]+$/);
    assert.match(loc.candidate_route, /^\/[a-z]{2}\/[a-z0-9-]+$/);
    assert.match(loc.original_record_id, /^[a-f0-9]{24}$/);
    assert.ok(loc.city && loc.state_code && loc.city_slug);
    assert.equal(keys.has(loc.location_key), false, "duplicate key");
    assert.equal(routes.has(loc.candidate_route), false, "duplicate route");
    keys.add(loc.location_key);
    routes.add(loc.candidate_route);
  }
  assert.equal(manifest.locations[0].location_key, "fl-pompano-beach");
});

test("All 200 candidates are gated against search indexing and publishing", async () => {
  const manifest = await getPack();
  assert.equal(manifest.safeguards.mode, "preview");
  assert.equal(manifest.safeguards.require_owner_approval_for_publication, true);
  assert.equal(manifest.safeguards.noindex_until_validated, true);
  assert.equal(manifest.objective.live_sites_verified, 0);
  assert.equal(manifest.objective.live_deployments_authorized, false);
  for (const loc of manifest.locations) {
    assert.equal(loc.preview_noindex, true);
    assert.equal(loc.publish_approved, false);
    assert.equal(loc.original_local_content_validated, false);
    assert.equal(loc.lead_routing_validated, false);
  }
});

test("Preview page uses the existing epoxy component and suppresses user actions", async () => {
  const preview = await loadText("src/pages/seo/FactoryPreviewPage.jsx");
  const original = await loadText("src/components/seo/EpoxyContractorTemplate.jsx");
  const app = await loadText("src/App.jsx");
  assert.match(preview, /import EpoxyContractorTemplate from/);
  assert.match(preview, /<EpoxyContractorTemplate/);
  assert.match(preview, /previewMode/);
  assert.match(preview, /noindex,nofollow,noarchive/);
  assert.match(preview, /pointerEvents: "none"/);
  assert.match(preview, /onClickCapture=\{suppressAction\}/);
  assert.match(preview, /onSubmitCapture=\{suppressAction\}/);
  assert.match(original, /if \(previewMode\) return;/);
  assert.match(original, /\{!previewMode && <FinalCta/);
  assert.match(app, /path="\/site-previews\/epoxy"/);
  assert.match(app, /path="\/site-previews\/epoxy\/:state\/:citySlug"/);
});

test("No production credentials, new schedulers or external publishing operations added", async () => {
  const content = await loadText("src/pages/seo/FactoryPreviewPage.jsx");
  const data = await loadText("site-factory/rollouts/epoxy-200.preview.json");
  assert.doesNotMatch(content, /fetch\s*\(/);
  assert.doesNotMatch(content, /vercelDeploy|WebsiteTemplate\.update|\.bulkCreate\(/);
  assert.doesNotMatch(data, /Bearer |sk-proj-|SUPABASE_SERVICE_ROLE|VERCEL_API_TOKEN/);
});
