# Base44 Exit Migration Plan

## Principle

No big-bang shutdown. Gradual, evidence-based migration.

## Phases

### 1. BASE44 CURRENT (✅ Complete)
- Base44 is the sole runtime for entities, functions, and orchestration
- All Phase 8.2 hardening is validated

### 2. DUAL WRITE / MIRROR (In Progress)
- Supabase migrations created (pending approval)
- Base44 functions write to both Base44 entities and Supabase tables
- Read from Base44 (authoritative), mirror to Supabase

### 3. SHADOW EXECUTION
- Railway workers deployed alongside Base44 bridge functions
- Both execute the same jobs
- Compare results for parity

### 4. PARITY
- Run regression tests against both Base44 and Supabase/Railway
- Verify identical results
- All evidence receipts match

### 5. NEW CONTROL PLANE AUTHORITATIVE
- Switch reads from Supabase (now authoritative)
- Base44 becomes read-only mirror
- Railway workers handle all job execution

### 6. BASE44 READ-ONLY
- Base44 entities serve as historical archive
- No new writes to Base44
- All operations go through Supabase/Railway

### 7. DECOMMISSION CANDIDATE
- After sustained parity (30 days)
- Base44 can be safely decommissioned
- All data migrated to Supabase

## Current Status

| Phase | Status |
|-------|--------|
| Base44 Current | ✅ Complete |
| Dual Write | 🔄 Architecture ready, migrations pending approval |
| Shadow Execution | ⏳ Pending Railway deployment |
| Parity | ⏳ Pending |
| New Authoritative | ⏳ Pending |
| Base44 Read-Only | ⏳ Pending |
| Decommission | ⏳ Pending |

## Approval Packets Required

1. **Production Supabase migrations** — Execute 001_core_tables_and_leases.sql + 002_queues_and_rls.sql
2. **Railway services** — Provision validation-worker, browser-worker, coding-worker
3. **Vercel deployment** — Deploy fleet-supervisor and local-alpha workflows
4. **Secret movement** — Move SUPABASE_URL, SUPABASE_SERVICE_KEY to Railway/Vercel
5. **Production cutover** — Switch reads from Base44 to Supabase