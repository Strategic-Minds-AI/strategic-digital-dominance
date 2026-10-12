# Epoxy Quote Near Me: 1 -> 10 -> 200 preview factory

STATUS: SOURCE-LINKED PREVIEW IMPLEMENTATION. Not a public deployment, not 200 independently hosted sites, and not an approved SEO rollout.

## Verified source context

- Base44 original: DIGITAL DOMINANCE V.1, app ID 6a77f4491f0bf92de9a3ed8b, domain epoxyquotenearme.com.
- GitHub candidate source mirror: Strategic-Minds-AI/strategic-digital-dominance at baseline main SHA ca78546518599afc7701e6cba072f3d246d0b34d. Canonical Base44 registry still reports the authoritative GitHub source as UNKNOWN. Reconcile before release.
- Existing EpoxyContractorTemplate React component and home-page components drive the visual preview, not a new generic design.
- The original WebsiteFactory deploy action only waits two seconds and updates entity status: it does NOT perform a real deployment. Do not use its live status as proof.
- Canonical site registry reported data quarantine and a 15/100 health score on October 12, 2026; there were zero independent SiteValidationReceipt records.

## Branch contents

- site-factory/rollouts/epoxy-200.preview.json: 200 distinct original WebsiteTemplate candidates, original IDs, candidate paths and explicit publication blocks. No new production website entities were created.
- site-factory/rollouts/epoxy-first-pompano.sitepack.json: first preview SitePack, supported primary market Pompano Beach; design approval remains provisional.
- src/pages/seo/FactoryPreviewPage.jsx: visual catalog and 200 source-linked preview routes rendering the original EpoxyContractorTemplate.
- The original contractor template now supports previewMode to skip production page-view telemetry and hide the final CTA. The preview shell blocks pointer interactions and form submission.
- Index route: /site-previews/epoxy
- Canary: /site-previews/epoxy/fl/pompano-beach
- All 200: /site-previews/epoxy/{state}/{city}.
- site-factory/tests/epoxy-200-preview.test.mjs: source-linked manifest and safety regression tests.

## Execute static and build checks

At repository root, run these in an isolated staging checkout:

    node --test site-factory/tests/epoxy-200-preview.test.mjs
    npm ci
    npm run build

Do not mark a gate PASS until the exact branch SHA completes it. Production Base44 data must never be altered to test a preview.

## Graduation gates

1. Canary: resolve authoritative source SHA; approve visual reference; verify true preview URL, browser screenshots, metadata/noindex, no runtime errors, no submitted leads.
2. Ten: individually verify serviceability, local content, phone/CRM mapping, accessibility and exact previews. Never manufacture claims for unserved cities.
3. Two hundred: require genuinely useful geographic differences, unique content, real service reach, functional tracking and consent, SEO canonical policy, independent validation receipts, cost controls, deployment IDs, rollback and explicit operator release approval.

Do not publish thin city swaps, fabricated locations or reviews, irrelevant local pages, or hidden doorway pages. Google does not require generating multiple domains to perform SEO. No rankings are guaranteed.

No scheduler, paid resource, production deployment, DNS change, new secrets, live publishing, or customer messages were executed by this branch.
