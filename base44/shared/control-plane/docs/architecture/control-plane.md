# XTREME Universal Operating Fabric — Control Plane Architecture

## Overview

The control plane is the permanent, deterministic, evidence-driven orchestration architecture for managing the complete XTREME technology portfolio.

## Four-Tier Swarm

1. **Shadow Vision Cortex** — Operator interface (natural language → structured intent)
2. **Fleet Alpha Prime** — Global portfolio governor (priority, resources, cross-system learning)
3. **Local Alpha Prime** — Per-system intelligence (benchmarks, gaps, repairs, validation)
4. **Specialist Swarms** — Role-based workers (coding, browser, validation, research, document)

## Execution Flow

```
VERCEL CRON / EVENT
  → FLEET SUPERVISOR WORKFLOW
  → FLEET ALPHA PRIME
  → LOCAL ALPHA PRIME
  → SUPABASE WORK QUEUE
  → RAILWAY WORKER
  → RESULT / ARTIFACT
  → INDEPENDENT VALIDATOR
  → RECEIPT
  → BENCHMARK / FLEET STATE
```

## Infrastructure

| Layer | Technology | Role |
|-------|-----------|------|
| Console | thextremeteam.com | Web console |
| Orchestration | Vercel | Durable workflows + cron |
| Persistent Workers | Railway | Job execution muscle |
| Durable Nervous System | Supabase | Postgres + queues + RLS |

## Authority Migration

Base44 ControlLease is **temporary**. Permanent authority moves to Supabase/Postgres using:
- Database-enforced uniqueness constraint (PRIMARY KEY on lock_key)
- Transactional acquisition via `acquire_control_lease()` function
- No application-level SELECT-then-INSERT

## Key Principles

- **Evidence-based**: Every state change requires an EvidenceReceipt
- **System-scoped**: All records are scoped by system_id to prevent cross-contamination
- **Composite idempotency**: system_id + benchmark_id + failure_fingerprint
- **5-minute math**: floor(current_minute / 5) * 5 for all heartbeats
- **Separation of concerns**: Implementer ≠ Validator ≠ Release Authority
- **Two clocks, one lock**: Vercel Cron + Supabase Watchdog, single Supabase lease authority