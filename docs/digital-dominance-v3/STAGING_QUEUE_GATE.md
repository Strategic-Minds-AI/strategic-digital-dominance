# Digital Dominance V3 staging queue integration gate
Date: 2026-10-08
Status: BLOCKED from live enqueue, branch-safe contract tests ongoing.

## Verified evidence
- Staging project: X1 AI Hub Staging (Supabase project ref uvdkzsbjackpjvpoxtyk).
- Existing public tables x1_work_queue, x1_task_leases, x1_execution_ledger, x1_audit_receipts have RLS enabled.
- x1_work_queue requires UUID tenant_id, action_class in READ_ONLY/NON_PRODUCTION_MUTATION/PROTECTED_MUTATION/PRODUCTION_RELEASE and SHA-256 hex idempotency_key, globally unique.
- Existing capability matches: agent:smai:13-digital-dominance, artifact-producer:digital-dominance, digital_dominance.seo_parity_analysis.
- The required dd_v3_preview_renderer capability is NOT among the matching staging registry results, so actual queue submission remains disabled.
- GitHub status for previous commit b54f6a3: Vercel success. V3 contract CI workflow committed after this check; test outcome remains UNKNOWN.

## Required steps before enabling staging enqueue
1. Run isolated contract tests in GitHub Actions and obtain a passing receipt.
2. Register and independently test a dd_v3_preview_renderer worker in safe preview scope, or map to an existing worker only after verifying its contract. Do not duplicate cron.
3. Bind authenticated server identity to the X1 tenant UUID; never accept the UUID from client input.
4. Verify X1 staging RLS and service permissions, queue insert/write surface and strict one-tenant isolation.
5. Implement atomic insert-on-conflict with tenant-scoped SHA256 idempotency and replay payload mismatch rejection.
6. Emit queue receipt and independent validation work after render completion.
7. Smoke test one synthetic site and preview URL; maintain noindex, no sitemap, no external messaging.
8. Obtain separate approval for secrets/environment changes, migrations, production release and live publishing.

## Current implementation files
- src/lib/digital-dominance-v3/validateSitePack.js
- src/lib/digital-dominance-v3/compilePreviewWorkPacket.js
- src/lib/digital-dominance-v3/acceptPreviewSitePack.js
- src/lib/digital-dominance-v3/mapPreviewToX1Queue.js
- .github/workflows/dd-v3-contract-tests.yml

No live job has been queued by this development packet. No runtime mutation was made.
