import test from "node:test";
import assert from "node:assert/strict";
import { acceptPreviewSitePack } from "../src/lib/digital-dominance-v3/acceptPreviewSitePack.js";

function pack() {
 return {
  schema_version:"1.0.0",pack_id:"preview_test_002",tenant_id:"tenant_alpha",
  site:{brand_name:"Example",vertical:"plumbing",country:"US",primary_market:"Sample City",offer:"Request a plumbing quote",canonical_origin:"https://example.com"},
  pages:[{path:"/sample-city/",title:"Sample City Plumbing",description:"Synthetic content",sections:[{kind:"hero",heading:"Local help",body:"Find useful local plumbing information."},{kind:"cta",heading:"Request a quote",body:"Contact a participating licensed professional."}],facts:[],index_request:false}],
  workflow:{mode:"preview",approval_required:true,idempotency_key:"preview-idempotency-002"}
 };
}
const post = p => ({method:"POST",body:JSON.stringify(p)});
function adapters(overrides={}) {
 let count=0;
 return {
  authenticate: async()=>({subject:"user_1",tenantId:"tenant_alpha"}),
  checkRateLimit: async()=>true,
  enqueueOnce: async()=>({jobId:"job_"+(++count),state:"created"}),
  ...overrides
 };
}
test("rejects missing dependencies rather than accepting without auth",async()=>{
 const r=await acceptPreviewSitePack(post(pack()),{});
 assert.equal(r.status,503);
});
test("rejects cross-tenant payload",async()=>{
 const p=pack();p.tenant_id="tenant_other";
 assert.equal((await acceptPreviewSitePack(post(p),adapters())).status,403);
});
test("rejects invalid JSON and oversized payload",async()=>{
 assert.equal((await acceptPreviewSitePack({method:"POST",body:"{"},adapters())).status,400);
 assert.equal((await acceptPreviewSitePack({method:"POST",body:"x".repeat(262145)},adapters())).status,413);
});
test("requires caller authentication",async()=>{
 const r=await acceptPreviewSitePack(post(pack()),adapters({authenticate:async()=>null}));
 assert.equal(r.status,401);
});
test("enqueues exactly an accepted preview packet",async()=>{
 let saved;
 const r=await acceptPreviewSitePack(post(pack()),adapters({enqueueOnce:async p=>{saved=p;return {jobId:"job_1",state:"created"};}}));
 assert.equal(r.status,202);
 assert.equal(saved.packet.pages[0].seo.robots,"noindex,nofollow");
 assert.equal(saved.packet.no_publication,true);
});
test("supports idempotent replay response contract",async()=>{
 const r=await acceptPreviewSitePack(post(pack()),adapters({enqueueOnce:async()=>({jobId:"job_same",state:"existing"})}));
 assert.equal(r.status,200);
 assert.equal(r.body.job_id,"job_same");
});
test("rate-limits and fails closed if queue unavailable",async()=>{
 assert.equal((await acceptPreviewSitePack(post(pack()),adapters({checkRateLimit:async()=>false}))).status,429);
 assert.equal((await acceptPreviewSitePack(post(pack()),adapters({enqueueOnce:async()=>{throw Error("offline")}}))).status,503);
});
