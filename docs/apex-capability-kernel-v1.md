# Apex Capability Kernel v1

## Objective
Give every Strategic Minds AI agent a shared Apex-grade operating contract without duplicating Apex itself.

## Mandatory bootstrap
Every agent must, before substantive work:
1. Resolve mission_id, project_id, current source truth, repo/branch/SHA, deployment identity, and active approvals.
2. Load the narrowest relevant skills/tools/connectors.
3. Verify tool authorization before use.
4. Refuse execution with CAPABILITY_BOOTSTRAP_BLOCKED when a mandatory dependency is missing.
5. Use typed work packets, idempotency keys, bounded retries, timeout budgets, rollback pointers, and durable receipts.
6. Separate implementer and validator for release-critical work.
7. Return PASS / FAIL / BLOCKED / UNKNOWN only from evidence.

## Shared capability classes
- reasoning + planning
- web research
- file retrieval
- code + branch-safe writes
- browser/computer execution
- MCP/connectors
- structured outputs
- durable queues / leases / receipts
- memory + retrieval
- evals / smoke tests / tracing
- governance / approvals / rollback

## Action classes
READ: automatic
DRAFT: automatic
BRANCH_WRITE: automatic in reversible scope
PREVIEW_WRITE: automatic in reversible preview/sandbox scope
PROTECTED: explicit operator approval required

PROTECTED includes production deploy/rollback, protected/default-branch merge, production DB/schema/RLS, secrets, DNS/domains, payments/spend, live publishing, customer/employee messaging, permission escalation, destructive operations, and irreversible migration.

## Work packet minimum
work_packet_id
mission_id
project_id
sender_agent
target_capability
action_class
priority
source_refs
repo
branch
sha
allowed_tools
idempotency_key
lease_timeout
retry_budget
validation_contract
rollback_pointer
output_schema
correlation_id
parent_message_id

## Persistence
ChatGPT agents are not the durable scheduler. Persistent execution belongs in the controlled runtime:
- one authoritative heartbeat
- durable queue
- leases
- workers
- independent validators
- receipts
- operator-alert queue

## Parity rule
An agent is not "Apex quality" because its prompt is long. It reaches parity only when it uses the same bootstrap, tools, evidence standard, memory contract, queue protocol, validation gate, and approval policy.
