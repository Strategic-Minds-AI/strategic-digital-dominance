# Failure Recovery

## Job Failure

1. Worker catches error → calls failJob()
2. If attempt < max_attempts: re-enqueue with attempt+1
3. If attempt >= max_attempts: move to dead_letter queue + create Incident
4. Never silently discard failed jobs

## Stale Lease Detection

1. Fleet Supervisor checks claimed jobs with lease_expires_at < NOW()
2. Returns stale jobs to queued status (claimed_by = null, lease_expires_at = null)
3. Another worker can claim the job

## Worker Crash

1. Worker heartbeat stops → Fleet Alpha Prime marks worker DEGRADED
2. Jobs claimed by crashed worker have stale leases
3. Stale lease detection returns them to queue
4. Another worker picks them up

## Control Plane Recovery

1. Supabase Watchdog checks last fleet heartbeat
2. If heartbeat is stale beyond threshold → enqueue CONTROL_PLANE_RECOVERY
3. Recovery job re-acquires fleet lease and runs governance cycle

## Rollback

Every RepairPacket includes a rollback plan. If a repair fails validation, the rollback is executed. The repair is marked FAILED and the gap is reopened.