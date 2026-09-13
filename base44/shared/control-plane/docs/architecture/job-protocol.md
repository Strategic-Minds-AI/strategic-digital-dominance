# Job Protocol

## Universal Job Envelope

Every queued job contains: job_id, system_id, job_type, priority, payload, correlation_id, parent_job_id, intent_id, repair_id, benchmark_id, required_worker_type, required_capabilities, created_at, available_at, attempt, max_attempts, timeout_seconds, idempotency_key, risk_class, approval_required.

Never place secrets directly inside queue messages. Use secret references.

## Job State Model

Canonical: QUEUED → CLAIMED → IN_PROGRESS → READY_FOR_VALIDATION → VALIDATING → VERIFIED → CLOSED

Failure paths: RETRY → BLOCKED → FAILED → SUPERSEDED → DEAD_LETTER

Do NOT use IN_PROGRESS unless a real worker owns a valid lease.

## Queue Processing Contract

1. Worker reads message
2. Claims job (atomic UPDATE WHERE status = 'queued')
3. Records worker_id + lease
4. Starts execution
5. Heartbeats + renews lease
6. Writes result
7. Moves job to READY_FOR_VALIDATION
8. Archives/deletes queue message only on confirmed job transition

All handlers must be idempotent.

## Dead Letter System

When attempt >= max_attempts or non-retryable failure: move to dead-letter state. Create Incident when severity requires it. Never silently discard failed jobs.