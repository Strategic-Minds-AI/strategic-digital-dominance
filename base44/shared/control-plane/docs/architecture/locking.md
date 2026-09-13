# Locking Architecture

## Permanent Atomic Lease

Base44 ControlLease is **temporary**. Permanent authority is Supabase/Postgres.

## control_leases Table

```sql
lock_key TEXT PRIMARY KEY
owner_id TEXT NOT NULL
cycle_id TEXT
acquired_at TIMESTAMPTZ
heartbeat_at TIMESTAMPTZ
lease_expires_at TIMESTAMPTZ NOT NULL
released_at TIMESTAMPTZ
status TEXT (held|released|expired|stale)
version INT DEFAULT 1
idempotency_key TEXT
```

## acquire_control_lease() Function

Transactional semantics:
1. **INSERT new lease** (atomic — PK uniqueness) → acquired
2. If unique_violation: **SELECT FOR UPDATE** existing lease
3. If existing is released/expired/stale or lease_expires_at < NOW(): **UPDATE** with new owner → reacquired
4. If existing is held and not expired: return **LOCK_NOT_ACQUIRED**

Never use application-level SELECT-then-INSERT as the lock authority.

## Concurrency Test

CONTROL-LEASE-CONCURRENCY-001: 10 simultaneous acquisition attempts against the same lock_key. Expected: 1 winner, 9 rejections.

## Two Clocks, One Lock

- Vercel Cron: primary trigger (every 5 minutes)
- Supabase Watchdog (pg_cron): secondary safety (checks heartbeat staleness)
- Both use the same Supabase lease authority