import test from "node:test";
import assert from "node:assert/strict";
import { mapPreviewToX1Queue } from "../src/lib/digital-dominance-v3/mapPreviewToX1Queue.js";
const context={tenantUuid:"123e4567-e89b-42d3-a456-426614174000",actorId:"synthetic-test"};
const packet=()=>({
 kind:"digital-dominance.preview-build.v1",job_id:"pack-test-01",
 tenant_id:"tenant_test",idempotency_key:"idempotency-key-001",
 action_class:"PREVIEW_WRITE",no_publication:true,
 pages:[{path:"/sample/",seo:{sitemapEligible:false,robots:"noindex,nofollow"}}]
});
test("maps safe preview into existing X1 work queue contract",()=>{
 const result=mapPreviewToX1Queue(packet(),context);
 assert.equal(result.valid,true);
 assert.equal(result.record.action_class,"NON_PRODUCTION_MUTATION");
 assert.match(result.record.idempotency_key,/^[0-9a-f]{64}$/);
 assert.equal(result.record.tenant_id,context.tenantUuid);
 assert.equal(result.record.payload.no_publication,true);
});
test("deterministic tenant-scoped idempotency",()=>{
 const a=mapPreviewToX1Queue(packet(),context).record.idempotency_key;
 const b=mapPreviewToX1Queue(packet(),context).record.idempotency_key;
 assert.equal(a,b);
 assert.notEqual(a,mapPreviewToX1Queue(packet(),{...context,tenantUuid:"123e4567-e89b-42d3-a456-426614174001"}).record.idempotency_key);
});
test("rejects client tenant string as database uuid",()=>{
 assert.equal(mapPreviewToX1Queue(packet(),{tenantUuid:"tenant_test",actorId:"synthetic-test"}).valid,false);
});
test("blocks indexable or public pages",()=>{
 const p=packet();p.pages[0].seo.sitemapEligible=true;
 assert.equal(mapPreviewToX1Queue(p,context).valid,false);
 p.pages[0].seo.sitemapEligible=false;p.no_publication=false;
 assert.equal(mapPreviewToX1Queue(p,context).valid,false);
});
