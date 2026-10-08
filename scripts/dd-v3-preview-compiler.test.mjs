import test from "node:test";
import assert from "node:assert/strict";
import { compilePreviewWorkPacket } from "../src/lib/digital-dominance-v3/compilePreviewWorkPacket.js";

function pack() {
  return {
    schema_version: "1.0.0",
    pack_id: "preview_test_001",
    tenant_id: "example_tenant",
    site: { brand_name: "Example", vertical: "plumbing", country: "US", primary_market: "Sample City", offer: "Get a plumbing quote", canonical_origin: "https://example.com" },
    pages: [{ path: "/sample-city/", title: "Plumbing", description: "Sample only", sections: [{ kind: "hero", heading: "Example", body: "A synthetic plumbing page for preview." }, { kind: "cta", heading: "Contact", body: "Contact a verified participating company." }], facts: [], index_request: false }],
    social: { draft_only: true },
    workflow: { mode: "preview", approval_required: true, idempotency_key: "site-pack-test-001" }
  };
}

test("rejects anonymous pack", () => {
  assert.equal(compilePreviewWorkPacket(pack()).accepted, false);
});
test("rejects cross-tenant request", () => {
  assert.equal(compilePreviewWorkPacket(pack(), { authenticated: true, authorizedTenantId: "other" }).accepted, false);
});
test("compiles safe preview and excludes indexable metadata", () => {
  const result = compilePreviewWorkPacket(pack(), { authenticated: true, authorizedTenantId: "example_tenant" });
  assert.equal(result.accepted, true);
  assert.equal(result.packet.pages[0].seo.robots, "noindex,nofollow");
  assert.equal(result.packet.pages[0].seo.sitemapEligible, false);
  assert.equal(result.packet.no_publication, true);
  assert.equal(result.packet.social.draft_only, true);
});
test("rejects idempotency mismatch", () => {
  const result = compilePreviewWorkPacket(pack(), { authenticated: true, authorizedTenantId: "example_tenant", replayKey: "wrong" });
  assert.equal(result.accepted, false);
});
test("rejects production site packs", () => {
  const input = pack(); input.workflow.mode = "production";
  assert.equal(compilePreviewWorkPacket(input, { authenticated: true, authorizedTenantId: "example_tenant" }).accepted, false);
});
