# Semrush Functional Parity Design

## Goal
Create a deterministic Digital Dominance intelligence layer that supplies the decision outputs currently sought from Semrush without pretending to reproduce Semrush's proprietary database.

## Scope
The parity surface covers: domain overview, organic research, keyword/rank tracking, traffic overview, technical/site audit, competitor intelligence, backlink intelligence, and an optional Semrush verifier. Owned-domain signals use Google Search Console, GA4, technical crawl, and Core Web Vitals. Competitor/backlink signals are only VERIFIED when backed by directly observed pages or Semrush; LLM-researched records remain PARTIAL/INFERRED.

## Architecture
A pure `seoParity.mjs` module normalizes inputs into eight capability modules with explicit provenance and one of VERIFIED, PARTIAL, BLOCKED. The existing `seoGenerator` endpoint gains a `semrushParity` action that reads CanonicalSiteRegistry and SeoContent, invokes existing GA/CWV/technical functions, reads CompetitorInsight, and produces one parity snapshot. The existing bounded Semrush adapter remains optional and fail-closed.

## Constraints
- No new database schema or production secret.
- No new cron; preserve the existing heartbeat.
- No fabricated competitor traffic, backlink counts, keyword volumes, or rankings.
- No paid Semrush call from parity mode while API units are unavailable.
- Only canonical-domain data may be treated as owned VERIFIED evidence.
- Every module must report provenance and coverage status.
- Existing generation behavior must remain unchanged unless `semrushParity` is explicitly invoked.

## Acceptance
- Pure tests prove provenance gating, deterministic aggregation, deduplication, and no-fabrication behavior.
- Existing Semrush adapter tests and Alpha Prime regressions still pass.
- Vercel preview builds the exact branch SHA successfully.
- Preview route/runtime shows no new production errors.
- Production merge/deploy only after the exact final SHA passes the above gates.
