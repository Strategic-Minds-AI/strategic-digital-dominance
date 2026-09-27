# Semrush evidence pilot — partial implementation, live gate BLOCKED

## Source truth (2026-09-27)

- Repository base: `c88bf10945237457c73a76c5c36510fea33f97d5`.
- Gmail `1a0e06a38d8230fd` confirms MCP activation. Activation is not evidence of available units.
- The connected Semrush competitor, backlink and organic discovery tools each returned `no_api_units`, `retryable:false`, even though the outer MCP response had `isError:false`.
- No execute_report calls were made. No domain data or actual billed-unit total was obtained. Provider contracts/rates could not be discovered; no rates or report names have been invented.
- Existing `scanCompetitors` uses LLM research. Existing `seoGenerator` generates content with an LLM. This change does not certify those existing paths as deterministic.

## Implemented boundary

`base44/shared/semrushEvidence.mjs` exposes:

1. `planPilot(domain)`: pure, zero-unit preflight. Available through existing admin-authenticated `seoGenerator` action `semrushEvidencePlan`. It remains BLOCKED pending verified contracts.
2. `collectPilot({contract, now, executeReport, decode, ledger})`: injected server-side MCP transport, verified-schema decoder, four sequential bounded requests, no retry or fallback, 15-second per-call deadline. Errors discard partial evidence; timeouts keep the complete reservation because the provider may still bill.
3. `rankingInputs(snapshot, expectedHash, now)`: hash-pinned, 24-hour freshness-checked, pure input projection. Generator replay never queries Semrush.
4. `scripts/semrush-pilot-ledger.mjs`: exclusive, fsynced reservation and receipt files on a durable private single-host volume. Duplicate/concurrent/restarted pilot runs cannot spend again. No automatic deletion or refund. This is not a multi-region ledger.

Only `epoxyquotenearme.com`, database `us`, is allowed. The proposed maximum is **1,000 units for the entire pilot**, not per heartbeat or per run. At most four provider requests: competitors (3 rows), keyword gap (10), backlinks (10), rankings (10). Total requested rows <=33. These limits are not unit-price estimates. No scheduler or production credentials are added.

## Live adapter contract still required

The `executeReport` callback must bind the authenticated Semrush `execute_report` MCP tool; ChatGPT connector activation does not itself grant the Base44 runtime that connection. Never copy ChatGPT credentials into the app.

After units are available, fetch Semrush discovery and `get_report_schema`. Pin the exact four report names, parameters, field mappings, schema hash, rate evidence hash and expiry into trusted server configuration. Costs must be documented worst-case bounds including minimum/per-request/per-row costs; reserve their sum before dispatch. A request that cannot be provider-capped must remain disabled. Do not derive pricing from the 1,000-unit ceiling.

Contract shape:

```
{ domain, database, expiresAt, schemaHash, rateEvidenceHash, availableUnits,
  requests: [{ operation, report, params, limitParam, maxUnits }, ...] }
```

The contract and decoder are trusted deployment code, never caller/LLM inputs. `params[limitParam]` must equal the operation row limit. Fixed params must bind the pilot domain/database and a reviewed comparison competitor where required. A keyword-gap report must compare target and competitor directly; subtracting two truncated keyword lists does not prove absence. A suitable competitor must be operator-selected or pinned from an earlier verified discovery snapshot. If that requires an additional call, reduce/review the four-call plan explicitly; do not expand it automatically.

Decoder returns `{status:'OK', rows:[...]}` only on explicit provider success. Internal rows:

| Operation | Fields |
|---|---|
| competitors | domain, overlap (normalized 0–1) |
| keywordGap | keyword, competitor, competitorPosition (1–100), targetPosition (1–100 or null) |
| backlinks | sourceUrl, targetUrl, lost (boolean), nofollow (boolean) |
| rankings | keyword, position (1–100), volume (nonnegative integer), url |

Null target position means not observed in the report scope, not globally unranked. Backlinks are provider observations, not verified current links; independent safe page inspection is required before treating a link as live. Ranking observations are Semrush estimates, not Search Console measurements, ranking guarantees, or a prediction score. Empty successful reports remain empty.

Persist the expected snapshot hash through a trusted worker/BuildPacket, not an untrusted HTTP request. The hash proves integrity, not authenticity. Call `rankingInputs` in the evidence preparation stage and pin the returned evidence hash in the BuildPacket. Do not fetch current data while rendering/generating pages. Production generator consumption is intentionally unwired until a live pilot and independent validation pass.

## Validation and release gates

Run `node --test scripts/semrush-evidence.test.mjs` and `npm run test:alpha-prime`.
Tests use explicitly synthetic contracts, rates and rows. They validate adapter behavior, not Semrush compatibility or live domain rankings.

For the live canary:

1. Confirm available units without purchasing or changing subscription. Verify schemas/rates and trusted runtime connection; define the fixed comparison domain.
2. Use one durable reservation root, same for all pilot callers. Account activity outside this adapter is not controlled by this ledger. Do not enable multiple workers until an atomic shared ledger exists.
3. Collect exactly the capped four-report plan for `epoxyquotenearme.com`; preserve raw report evidence privately as allowed, request metadata and provider cost receipts. No retries on ambiguous outcomes.
4. Independent validator checks current branch SHA, input domain/database, report scope, actual usage, normalized samples against provider evidence, backlink flags, hash replay and no-data handling. Empty data validates transport only, not SEO utility.
5. Only then wire the pinned input into generator jobs; broader rollout and production activation require approval. Keep the existing heartbeat; no new cron.

Rollback: remove the opt-in `semrushEvidencePlan` case/import or revert this branch. Preserve any reservation/receipt for cost reconciliation. Existing content, site rendering and scheduling are unchanged.

## Result

VERIFIED: activation email, current source, live no_api_units responses; 14 adapter tests and 9 existing regression checks passed locally.
INFERRED: the pilot domain is an appropriate canary based on its presence in this system and the operator's indexing mission.
COULD NOT VERIFY: report schemas/rates, deployable MCP transport, real domain data, actual billing, whole-app build/typecheck, independent live PASS.
BLOCKERS: Semrush units unavailable; production runtime connection/decoder not verified.
WORKAROUND: bounded adapter and deterministic synthetic tests permit review without spending units or changing production.
NEXT ACTION: restore Semrush unit availability, verify/pin contracts and transport, run the single-domain canary, independently validate before enabling generation or broader rollout.
