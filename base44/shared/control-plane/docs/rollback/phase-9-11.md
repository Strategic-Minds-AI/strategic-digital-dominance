# Phase 9-11 Rollback Plan

## Rollback Triggers

1. Supabase migration causes data loss or corruption
2. Railway workers fail to process jobs correctly
3. Vercel workflows miss cycles or produce incorrect results
4. Parity between Base44 and Supabase/Railway fails

## Rollback Steps

### 1. Stop New Work
- Deactivate Vercel workflows (fleet supervisor + local alpha)
- Stop Railway workers (graceful shutdown)
- Pause Supabase queues (no new messages)

### 2. Revert Reads to Base44
- Switch all read operations back to Base44 entities
- Base44 is still the fallback source of truth
- No data loss — Base44 was never modified during dual-write

### 3. Restore Queue State
- Any jobs in Supabase queues that weren't processed: re-enqueue to Base44 SwarmTasks
- Any in-progress jobs: mark as queued in Base44

### 4. Audit
- Compare Base44 state vs Supabase state
- Identify any discrepancies
- Document findings in EvidenceReceipts

### 5. Fix and Retry
- Fix the issue that caused the rollback
- Re-run parity tests
- Re-deploy when ready

## Rollback Safety

- Base44 entities are never deleted during dual-write — only mirrored to Supabase
- Supabase migrations can be rolled back with `DROP TABLE` (data is expendable — Base44 has the originals)
- Railway workers can be stopped without data loss — jobs remain in queues
- Vercel workflows can be deactivated without impact — Base44 bridge functions still work

## No Big-Bang Risk

The gradual migration approach ensures that at any point, Base44 can resume full authority. The worst case is a temporary delay in processing while switching back.