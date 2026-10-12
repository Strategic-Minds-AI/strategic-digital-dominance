# Digital Dominance: multi-industry template and release contract

Date: 2026-10-12
Stage: Development branch, PREVIEW ONLY, NOT AUTHORIZED FOR PUBLIC RELEASE.

## Original source, not a second factory

- Keep the existing Base44 epoxy application (ID 6a77f4491f0bf92de9a3ed8b) and its UniversalSiteBuilder, IndustryPicker, BrandingStudio, ContentStudio, TemplateManager, TemplateLibrary and WebsiteQueue as the operator interface.
- The GitHub mirror is Strategic-Minds-AI/strategic-digital-dominance. The source-to-Base44 identity was not independently reconciled as authoritative; do not treat GitHub branch writes as edits to live Base44.
- The original WebsiteFactory "Deploy" button only simulates deploying. It sleeps and marks the record live. It is not a provider deployment.
- The existing UniversalSiteBuilder PipelineLauncher currently defaults several protected actions on: domain purchase, Vercel deployment, SEO page generation, social, and automated workers. Do not use it for production without a backend approval and exact-provider receipt gate.
- Existing 200-location preview catalog (noindex): /site-previews/epoxy; Pompano Beach canary: /site-previews/epoxy/fl/pompano-beach.
- Vercel preview project: strategic-digital-dominance (Strategic Minds Advisory), READY build dpl_AsExuME4UqqesV1XWHBCnKycHp21, commit 95ae2edf6cd97a84e58d84e9a92483ab9da81570.
- Live epoxyquotenearme.com uses GoDaddy nameservers and A 216.24.57.1, not an attached custom domain of this Vercel project. DNS changes require explicit approval.
- Existing 343 CanonicalLocationRegistry records are unvalidated with local_value_score 0. Reclassify evidence before enabling indexation.

## Architecture: the same code, different data and modular components

Existing 20-industry catalog -> BrandTemplate / TemplateLibrary -> SitePack compiler -> preview renderer -> independent validation -> release approval -> existing X1 queue / authorized Vercel deployment -> measured analytics and leads.

The current src/data/topIndustries.js provides industry IDs, suggested services and possible page types. Its revenue, search-volume, pricing and "licensed" marketing claims are NOT verified by this package. Never transplant them into production content unreviewed.

site-factory/industry/compile.mjs is a portable, side-effect-free SitePack compiler for all 20 currently configured industry IDs. Each SitePack contains:
- industry_id, suggestions, distinct optional modules and intake field schema
- brand/layout reference and design-approval status
- verified business identity and service-area requirements
- optional user-submitted services only, not unsupported capabilities
- content and proof fields, default empty for testimonials/pricing/FAQ
- conversion CTA with submissions disabled in preview
- SEO noindex + sitemap exclusion
- source commit and deployment identity provenance
- approval and independent-review evidence contract

Examples:
- Epoxy garage: floor estimator, size/condition intake, verified installation service reach.
- Personal injury law: jurisdictional intake, independently verified attorney licensing, no fabricated settlements or success rates, review legal privacy disclaimers.
- Emergency dentistry: appointment request, clinician licensing, health-data/privacy controls, no false "available now" claims.
Other existing catalog niches use the same base component contract with per-industry fields and required review. A visual shell does not make the industry-specific widgets functional.

Compiler entry points:
- INDUSTRY_OPTIONS: 20 existing industries (label, suggested service list, page types)
- compileDraftSitePack(input): generate an industry-specific noindex draft with no external side effects
- cloneDraftSitePack(source, overrides): clone without inheriting approvals, domains, location verification, prices, testimonials or live lead endpoints
- compilePreviewBatch(base, locations): deterministic identities with duplicate rejection
- evaluateProductionReadiness(pack, receipts): fail-closed preflight; returns blockers and never publishes

## Hosting plan: choose a model

MODEL A: ONE BUSINESS / 200 ROUTES. Prefer for Epoxy Quote Near Me. One site repository, one Vercel production project, one actual domain, route set based on independently approved/verified local service areas. Dynamic pages share templates but have truthful meaningful local value. A 200-route app is not 200 independently provisioned websites.

MODEL B: DIFFERENT CLIENTS / 200 WEBSITES. Use the same source templates but isolate each client's business identity, privacy, lead destination, analytics and verified domain. Deploy on one validated multi-tenant Vercel platform keyed by verified hostname or separately on existing authorized project infrastructure as genuinely needed. No automatic purchase of 200 domains. One live site must have a verified deployment identity, HTTPS, correct legal operator and functioning conversion path.

## Exact publication procedure (NO production mutation by this document)

1. Select hosting model A or B and actual offer/brand. Lock approved source design and source SHA.
2. Prove real market coverage and useful original content. Keep unverified routes noindex/excluded from sitemap.
3. Fill business identity, services actually available, contact details, consent, photographs/claims, jurisdictional disclosures and proper lead destination.
4. Connect industry-specific modules, not only industry text replacement. Validate real form/booking/estimate behavior against a synthetic staging destination.
5. Record source SHA, noindex preview deployment ID/URL, screenshots desktop/tablet/mobile, 404, accessibility, analytics, privacy/RLS, SEO and rollback proof. A PREVIEW READY build alone is insufficient.
6. Guardian independently signs the EXACT release candidate, separate from author/builder. Obtain explicit operator production/domain/payment authorization.
7. Stage a Vercel production build WITHOUT automatic domain assignment (if enabled in this project). Verify exact artifact, authenticated backend environment, real key routes and rollback. No production DB migration or secret change without separately scoped authorization.
8. Assign approved domain to that approved build. For the existing GoDaddy apex this may require changing its existing DNS records; preserve previous records and rollback. Do not change DNS during preview.
9. After production HTTP, functional and lead checks, enable indexability and sitemap only for verified, genuinely useful pages. Submit sitemaps via owned Search Console, monitor errors and leads, attribute revenue.
10. Advance gated batches 1 -> 10 -> 200. Record one receipt per location or distinct site. Stop/revert failures rather than simply setting status='live'.

## Acceptance: fail closed

Required evidence IDs for each distinct released site/route:
source_commit; template_approval; verified_service_area; unique_local_value;
qualified_business; truthful_claims; privacy_and_consent; lead_delivery_test;
functional_e2e; responsive_accessibility; security_checks; indexing_and_canonical;
deployment_identity; rollback_receipt; independent_guardian; operator_release_approval.

The compiler cannot authenticate evidence IDs. Validation MUST be implemented within an authorized server/backend with proof from the real systems. Do not allow clients to self-certify by setting JSON booleans.

Keep real prod releases, merges, DNS, domain purchases, billing and customer messages blocked without operator approval.

## Benchmark research (current vendor documentation)

1. Duda Connected Templates: reusable site widgets map to a content library and dynamic collections, permitting site creation from a template alias through API. This is a useful reference for separating site identity from reusable components, not an instruction to switch vendors.
   https://developer.duda.co/docs/setting-up-a-custom-template-with-connected-data
2. Webflow CMS Collection pages: one reusable template renders many data-backed entries with separate per-entry content, and page-level publishing controls.
   https://help.webflow.com/hc/en-us/articles/33961277976467-Structure-and-style-Collection-pages
3. WordPress Multisite: one network can host multiple sites/subdomains/subdirectories; it would duplicate the management stack here, so reuse current React/Vercel/Supabase deployment instead.
   https://wordpress.org/documentation/article/tools-network-screen/
4. Google Search spam policies: reject scaled, unoriginal content/doorway pages built mainly for search manipulation.
   https://developers.google.com/search/docs/essentials/spam-policies

## Current gaps

UNVERIFIED: real, current Vercel-to-Base44 source binding; exact deployment secrets and production environment; full original existing funnel/CRM parity; 99% design parity; test execution of this new compiler; legal/medical and local market approvals; any conversion/traffic/revenue for the proposed 200. No release or authoritative queue changes were made by this package.
