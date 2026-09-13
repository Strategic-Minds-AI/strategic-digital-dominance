# Phase 9-11 Validation Suite

## VERCEL
- [ ] Workflow resumes after interruption
- [ ] Duplicate trigger idempotency
- [ ] Workflow step retry
- [ ] Timeout handling
- [ ] Receipt generation

## SUPABASE
- [ ] Migration dry-run
- [ ] RLS tests
- [x] 10-way lock race (CONTROL-LEASE-CONCURRENCY-001)
- [ ] Queue visibility test
- [ ] Worker crash test
- [ ] Retry test
- [ ] Dead-letter test
- [ ] Duplicate message test
- [ ] Idempotency test

## RAILWAY
- [ ] Worker restart
- [ ] Worker heartbeat loss
- [ ] Job recovery
- [ ] Lease expiration
- [ ] Duplicate worker claim
- [ ] Graceful shutdown

## COMPLETE SYSTEM
- [x] Vision Cortex → intent → workflow → queue → worker → validator → receipt → score (phase9Proof bridge)

## Enhanced Regression Tests (Base44 Bridge)

| Test ID | Description | Status |
|---------|-------------|--------|
| FLEET-LOCK-RACE-001 | Fixed lock_key, 2 concurrent — exactly 1 winner | ✅ Enhanced |
| CONTROL-LEASE-CONCURRENCY-001 | 10-way lock race — exactly 1 winner | ✅ New |
| CROSS-SYSTEM-001 | Collision fixture — same bench_id, independent repairs | ✅ Enhanced |
| MISSING-RESULT-001 | No escape clause — def exists + no result = UNKNOWN | ✅ Enhanced |
| REPAIR-DEDUPE-001 | Composite idempotency (system:benchmark:fingerprint) | ✅ Existing |
| ORPHAN-INPROGRESS-001 | Zero orphaned in_progress jobs | ✅ Existing |
| STALE-LEASE-001 | Cycle detects stale leases | ✅ Existing |
| WRONG-SYSTEM-ID-001 | Gaps are system-scoped | ✅ Existing |
| PARITY-ROLLUP-001 | Deterministic parity rollup | ✅ Existing |
| ZERO-RESULT-001 | Denominator is definition count | ✅ Existing |
| VISION-CONTEXT-001 | Vision Cortex loads fleet context | ✅ Existing |
| INTENT-CONSUMED-001 | No stale pending intents | ✅ Existing |

## End-to-End Proof (phase9Proof)

The `phase9Proof` function proves the complete execution chain using Base44 as a temporary bridge:

1. Vision Conversation created
2. Vision Message (operator command) created
3. Operator Intent created (pending)
4. Control Lease acquired (Fleet Alpha Prime governance)
5. Intent routed (executing)
6. Swarm Task created (queue job)
7. Worker lease acquired (Railway worker claim)
8. HTTP validation executed (fetch + title extraction)
9. Evidence Receipt created
10. Swarm Task completed
11. Operator Intent completed
12. Fleet System updated
13. Fleet Heartbeat written
14. Lease released

All IDs are captured and returned for audit.