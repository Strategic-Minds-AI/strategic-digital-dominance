# Vercel Durable Orchestration

## Fleet Supervisor Workflow

- **Trigger**: Vercel Cron every 5 minutes + event-driven wakeups
- **Responsibilities**: Acquire Supabase lease, load systems, read intents, route work, write heartbeat, release lease
- **Returns quickly**: The durable workflow continues independently

## Local Alpha Workflow

- **Trigger**: Called by Fleet Supervisor for each high-priority system
- **Loop**: Load system → Read benchmarks → Run audits → Calculate distance → Update gaps → Create repairs → Dispatch jobs → Wait → Validate → Rescore → Write receipt
- **System-scoped**: Never mixes benchmarks between systems

## Intent Execution Workflow

- **State machine**: PENDING → VALIDATING → ROUTED → QUEUED → EXECUTING → VALIDATING_RESULT → COMPLETED (or BLOCKED/FAILED)
- **Durable transitions**: Every state change is persisted

## Key Principle

Vercel orchestrates. It does NOT perform every heavy workload itself. Heavy work goes to Supabase queues → Railway workers.