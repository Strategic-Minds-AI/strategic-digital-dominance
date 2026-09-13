# Railway Worker Fabric

Railway becomes persistent execution muscle.

## Worker Types

| Worker | Capabilities | First Job |
|--------|-------------|----------|
| validation-worker | HTTP, DOM, API, schema, file_hash, Playwright, receipts | Fetch URL, verify HTTP state, extract title, write receipt |
| browser-worker | Playwright/Chromium: navigation, screenshots, DOM, console, network | Full browser automation |
| coding-worker | Isolated branch/worktree/container sandbox | RepairPacket → branch, commit, diff, tests, rollback |
| research-worker | Official docs, tech changes, benchmark sources, market intel | All claims require source provenance |
| document-worker | Knowledge synthesis, document generation | Knowledge articles, reports |

## Universal Worker SDK

All workers use the same SDK with: registerWorker, heartbeat, pollQueue, claimJob, renewLease, startJob, logEvent, uploadArtifact, completeJob, failJob, releaseJob.

## Registration

On startup: register with Supabase. Heartbeat continuously. If heartbeat becomes stale, Fleet Alpha Prime marks worker DEGRADED.

## Validation Separation

The worker implementing a repair CANNOT certify it.

```
CODING WORKER → READY_FOR_VALIDATION → VALIDATION WORKER → VALIDATION RESULT → LOCAL ALPHA → RELEASE AUTHORITY
``