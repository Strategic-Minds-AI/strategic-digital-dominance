# Digital Dominance V3: Factory Plan
Status: PLAN / DISCOVERY. No production authorization inferred.
Source: Digital Dominance Lead URL Opportunity Workbook (78 opportunities, hypothesis queue), existing repository, current Vercel projects.

## Mission
Create one tenant-aware website and funnel factory operated via ChatGPT and a typed Site Pack contract. Replace compulsory Base44 execution progressively, without losing live functionality. Reuse existing website builder, Social Studio, SEO tools, orchestrator and lead components after source audit.

## TODO / Phases
- [x] Identify canonical working repository and current Vercel projects.
- [x] Create isolated feature branch.
- [ ] Audit existing routes, entities, auth, deployment and social code against V3 contract.
- [ ] Research and benchmark 3 live comparable factory/lead platforms before visual design.
- [ ] Implement authenticated, rate-limited, idempotent Site Pack intake in staging.
- [ ] Implement queue -> lease -> worker -> independent validator -> receipt.
- [ ] Create tenant-aware site renderer with preview-only first output.
- [ ] Wire lead forms, consent, attribution and buyer validation.
- [ ] Add per-page SEO eligibility and programmatic sitemap control.
- [ ] Integrate social drafts/media asset generation and channel-compliant schedulers.
- [ ] Add vetted distribution opportunities and editorial outreach drafts; forbid automated mass form/link spam.
- [ ] Execute lint, type checks, tests, browser, SEO and security evaluation on preview.
- [ ] Stage operator-approved release after independent validation.

## Non-negotiable guardrails
- No guarantee of page-one ranking, rapid indexing or passive income.
- Launch a small cohort of unique useful pages first, not thin city/domain variants.
- Default all unverified/placeholder pages to noindex and preview-only.
- Reject fake listings, fake reviews, misleading location claims, plagiarized content, unsupported schema, keyword stuffing and link spam.
- Every indexable page needs verified local/service usefulness, working conversion path and evidence.
- Live posting, messaging, DNS, payments, secrets, production changes and default branch merge require separate approval.
- Maintain one authoritative heartbeat; do not create competing scheduler loops.

## Architecture
ChatGPT/App Pack -> authenticated Site Pack ingestion -> validation -> durable queue -> worker -> tenant config and assets -> preview renderer -> independent QA -> approval gate -> published version -> Search Console/social measurement -> attributed leads/revenue -> scoring feedback.

Recommended components (verify before implementing): Vercel app and previews; Supabase Postgres, RLS, objects and durable jobs; GitHub versioned code; AI Gateway for generation; Railway only where persistent workers are justified.

## Definition of Done for V3 proof
One synthetic market + one verified real service/market cohort; one authenticated Site Pack; one reproducible preview; validator receipt; working test lead and opt-in routing in staging; measurable impression/click/lead attribution once legitimately published with approval; social draft assets and approval workflow; negative tests for duplicate submissions, cross-tenant access, unsupported SEO facts and publish-without-approval.

## Commercial sequencing
1. Emergency service leads: plumbing/HVAC/roof leaks/storm restoration, subject to real buyer validation.
2. Commercial contract leads: HVAC, flooring, generator, janitorial.
3. Instant-estimate differentiated pages, with sourced ranges and disclaimers.
4. White-label subscriptions only after proven fulfillment and support economics.

## Current source-truth evidence (2026-10-08)
GitHub repository: Strategic-Minds-AI/strategic-digital-dominance (default main); authenticated Primary GitHub connection has push scope. A second GitHub connection is read-only. Alternate repo strategic-digital-dominance-v2 exists and has size 0. Vercel projects discovered: digital-dominance-2-0; strategic-digital-dominance; strategic-digital-dominance-v2. 'digital-dominance-2-0' latest production-target deployment reports READY, but functional browser validation has not been done. Existing source search surfaced UniversalSiteBuilder, ContentStudio, SEO Generator, Social Studio, AutonomousWorkflows, and Base44 coupling. Current release readiness = UNKNOWN.

## Next actionable engineering work
Compare the existing builder API/entity contracts and active deployment source bindings before adding any new worker, scheduler, tenant data model or backend. Keep Base44 as donor/optional adapter until extraction is proven. No public release from this branch.
