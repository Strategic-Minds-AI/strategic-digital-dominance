import test from "node:test";
import assert from "node:assert/strict";
import { validateSitePack } from "../src/lib/digital-dominance-v3/validateSitePack.js";

const validPack = () => ({
  schema_version: "1.0.0",
  pack_id: "sitepack_test_01",
  tenant_id: "tenant_test",
  site: { brand_name: "Example", vertical: "plumbing", country: "US", primary_market: "Sample City", offer: "Request a plumbing quote", canonical_origin: "https://example.com" },
  pages: [{ path: "/sample-city/plumber/", title: "Sample City Plumbing Guide", description: "A helpful plumbing resource", sections: [{ kind: "hero", heading: "Plumbing", body: "A useful introduction for local readers." }, { kind: "cta", heading: "Contact", body: "Request a real quote from a participating contractor." }], facts: [], index_request: false }],
  social: { draft_only: true },
  lead_capture: { enabled: true, test_mode: true, consent_text: "I agree to be contacted about this request." },
  workflow: { mode: "preview", approval_required: true, idempotency_key: "synthetic-idempotency-0001" }
});

test("accepts a synthetic preview-only pack", () => {
  assert.equal(validateSitePack(validPack()).valid, true);
});
test("blocks production and missing approval", () => {
  const pack = validPack(); pack.workflow.mode = "production"; pack.workflow.approval_required = false;
  assert.ok(validateSitePack(pack).errors.some(e => e.code === "PRODUCTION_NOT_ALLOWED"));
});
test("blocks index requests before independent approval", () => {
  const pack = validPack(); pack.pages[0].index_request = true;
  assert.ok(validateSitePack(pack).errors.some(e => e.code === "INDEXING_REQUIRES_INDEPENDENT_APPROVAL"));
});
test("blocks purported proof in generated sections", () => {
  const pack = validPack(); pack.pages[0].sections[0].kind = "proof";
  assert.ok(validateSitePack(pack).errors.some(e => e.code === "PROOF_REQUIRES_MANUAL_VERIFICATION"));
});
test("blocks live leads and public social publishing", () => {
  const pack = validPack(); pack.social.draft_only = false; pack.lead_capture.test_mode = false;
  const codes = validateSitePack(pack).errors.map(e => e.code);
  assert.ok(codes.includes("SOCIAL_PUBLISH_NOT_ALLOWED"));
  assert.ok(codes.includes("LIVE_LEADS_NOT_ALLOWED"));
});
test("blocks missing source on asserted facts", () => {
  const pack = validPack(); pack.pages[0].facts = [{ claim: "Guaranteed one hour response" }];
  assert.ok(validateSitePack(pack).errors.some(e => e.code === "UNSOURCED_FACT"));
});
