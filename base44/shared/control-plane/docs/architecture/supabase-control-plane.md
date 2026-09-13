# Supabase Control Plane

## Canonical Runtime Source Truth

Supabase becomes the authoritative owner of: leases, jobs, queue state, heartbeats, receipts, benchmark state, repair state, validation state, fleet state.

Base44 entities become migration donors.

## Core Tables (Migration 001)

systems, operator_intents, jobs, job_attempts, benchmarks, benchmark_results, optimization_gaps, repairs, evidence_receipts, workers, fleet_heartbeats, incidents, regression_tests, control_leases

Every table includes: system_id, created_at, updated_at, environment, source_version, correlation_id.

## Queues (Migration 002)

Durable pgmq queues: discovery_jobs, audit_jobs, research_jobs, coding_jobs, browser_jobs, repair_jobs, validation_jobs, deployment_jobs, knowledge_jobs, incident_jobs, dead_letter

Never use unlogged/transient queues for critical jobs.

## RLS

- Operator (admin): full read/write
- Worker (service_role): jobs, repairs, validation, artifacts, leases
- Public: read-only on systems (dashboard)
- Cross-tenant access tested

## Watchdog

Supabase Cron as secondary watchdog. Watches last successful fleet heartbeat. If stale beyond threshold, enqueues CONTROL_PLANE_RECOVERY. Uses same Supabase lease authority. Two clocks, one lock.