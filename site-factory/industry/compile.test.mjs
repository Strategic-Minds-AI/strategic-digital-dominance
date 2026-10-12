import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  INDUSTRY_OPTIONS, compileDraftSitePack, cloneDraftSitePack,
  compilePreviewBatch, evaluateProductionReadiness
} from "./compile.mjs";

const make = (id, other = {}) => compileDraftSitePack({
  industry_id: id, business_name: "Synthetic Example Company",
  city: "Pompano Beach", region: "FL", ...other
});
const fixture = new URL("../rollouts/epoxy-200.preview.json", import.meta.url);

test("Reuses all 20 existing industry identifiers without unverified market statistics", () => {
  assert.equal(INDUSTRY_OPTIONS.length, 20);
  assert.equal(new Set(INDUSTRY_OPTIONS.map(i => i.id)).size, 20);
  for (const option of INDUSTRY_OPTIONS) {
    const draft = make(option.id);
    assert.equal(draft.industry.id, option.id);
    assert.equal(draft.status, "DRAFT");
    assert.equal(draft.environment, "preview");
    assert.deepEqual(draft.business.company_specific_proof, []);
    assert.deepEqual(draft.content.prices, []);
    assert.deepEqual(draft.content.testimonials, []);
    assert.equal(draft.seo.sitemap_include, false);
    assert.match(draft.seo.robots, /^noindex/);
    assert.equal(draft.conversion.active_submissions, false);
    assert.equal(draft.release.approved, false);
    assert.equal(evaluateProductionReadiness(draft).passed, false);
  }
});

test("Uses industry-specific intake, modules and regulated compliance without inventing credentials", () => {
  const epoxy = make("epoxy_garage");
  assert.ok(epoxy.components.industry_modules_requested.includes("floor_estimator"));
  assert.ok(epoxy.conversion.intake_fields.includes("garage_size"));
  const lawyer = make("personal_injury");
  assert.ok(lawyer.components.industry_modules_requested.includes("case_intake"));
  assert.ok(lawyer.industry.regulated_review_items.includes("jurisdiction_and_bar_license"));
  assert.ok(lawyer.conversion.intake_fields.includes("jurisdiction"));
  assert.equal(lawyer.business.verified_business, false);
  const dentist = make("emergency_dentist");
  assert.ok(dentist.industry.regulated_review_items.includes("health_data_privacy"));
  assert.ok(dentist.components.industry_modules_requested.includes("appointment_request"));
});

test("Clone starts a new draft and cannot inherit approvals, claims, forms, domains or receipts", () => {
  const original = make("epoxy_garage", { accent_color: "#2563EB" });
  original.release.approved = true;
  original.design.status = "approved";
  original.seo.sitemap_include = true;
  original.business.verified_business = true;
  original.conversion.active_submissions = true;
  original.deployment.production_url = "https://not-a-real-live-site.example";
  const copy = cloneDraftSitePack(original, { city: "Miami", region: "FL" });
  assert.match(copy.id, /miami-v/);
  assert.equal(copy.design.accent_color, "#2563EB");
  assert.equal(copy.release.approved, false);
  assert.equal(copy.design.status, "provisional");
  assert.equal(copy.seo.sitemap_include, false);
  assert.equal(copy.conversion.active_submissions, false);
  assert.equal(copy.business.verified_business, false);
  assert.equal(copy.deployment.production_url, null);
  assert.equal(copy.geography.service_area_verified, false);
  assert.equal(copy.content.local_details_verified, false);
});

test("Invalid, unknown, non-preview and bogus service configurations fail closed", () => {
  assert.throws(() => compileDraftSitePack({industry_id:"unknown",business_name:"Example",city:"Miami",region:"FL"}), /UNKNOWN_INDUSTRY/);
  assert.throws(() => make("epoxy_garage", { mode:"production" }), /ONLY_PREVIEW_MODE_SUPPORTED/);
  assert.throws(() => make("epoxy_garage", { services:["Guaranteed legal victory"] }), /SERVICE_NOT_IN_INDUSTRY_CATALOG/);
  assert.throws(() => make("epoxy_garage", { business_name:"" }), /BUSINESS_NAME_REQUIRED/);
  assert.throws(() => make("epoxy_garage", { city:"" }), /LOCATION_REQUIRED/);
});

test("Compiles 200 distinct existing source locations as unpublishable drafts", async () => {
  const manifest = JSON.parse(await readFile(fixture, "utf8"));
  const all = compilePreviewBatch(
    { industry_id:"epoxy_garage", business_name:"Epoxy Quote Near Me" },
    manifest.locations.map(x=>({city:x.city, region:x.state_code.toUpperCase()}))
  );
  assert.equal(all.length, 200);
  assert.equal(new Set(all.map(x=>x.id)).size, 200);
  assert.equal(all.filter(x=>evaluateProductionReadiness(x).passed).length, 0);
  assert.throws(()=>compilePreviewBatch(
    {industry_id:"epoxy_garage",business_name:"Example"},
    [{city:"Miami",region:"FL"},{city:"Miami",region:"FL"}]
  ),/DUPLICATE_SITE_IDENTITY/);
});

test("Cannot treat the previous 357 live status labels as actual deployment proof", () => {
  const draft = make("epoxy_garage");
  draft.original_website_template_status = "live";
  assert.equal(evaluateProductionReadiness(draft).passed, false);
  assert.ok(evaluateProductionReadiness(draft).blockers.includes("missing_deployment_identity"));
});

test("Simulated receipts must match exact source SHA, approved visual and independent reviewer", () => {
  const draft = make("epoxy_garage", { source_commit_sha:"0000000000000000000000000000000000000000" });
  const required = Object.keys(draft.verification);
  const receipts = Object.fromEntries(required.map(k=>[k,"receipt:test-"+k]));
  receipts.source_commit = draft.source.source_commit_sha;
  receipts.operator_release_approval = "approved:synthetic-test-fixture";
  receipts.independent_guardian = "guardian-test-fixture";
  receipts.builder_identity = "builder-test-fixture";
  assert.equal(evaluateProductionReadiness(draft, receipts).passed, false);
  draft.geography.service_area_verified = true;
  draft.content.local_details_verified = true;
  draft.components.modules_functionally_verified = true;
  draft.design.status = "approved";
  draft.business.verified_business = true;
  draft.conversion.active_submissions = true;
  draft.conversion.lead_delivery_destination = "synthetic-destination";
  // This tests boolean logic only; it is NOT a real validation receipt.
  assert.equal(evaluateProductionReadiness(draft, receipts).passed, true);
  assert.ok(evaluateProductionReadiness(draft,{...receipts,source_commit:"drift"}).blockers.includes("source_sha_drift"));
  assert.ok(evaluateProductionReadiness(draft,{...receipts,independent_guardian:"builder-test-fixture"}).blockers.includes("self_certification"));
  assert.ok(evaluateProductionReadiness(draft,{...receipts,operator_release_approval:"unapproved"}).blockers.includes("approval_not_proven"));
});
