# AGENTS.md

## Project Context
This repository is the Strategic Minds AI Digital Dominance system. Preserve current Base44 compatibility while routing all substantive agent work through the Apex Capability Kernel and Digital Dominance Swarm contracts.

## Mandatory Bootstrap
Before substantive work, read:
- `docs/apex-capability-kernel-v1.md`
- `docs/digital-dominance-swarm-v1.md`

Then resolve source truth, current repo/branch/SHA, active approvals, required tools/skills/connectors, and validation contract. If a mandatory dependency is unavailable, return `CAPABILITY_BOOTSTRAP_BLOCKED`.

## Governance
READ and DRAFT are automatic. Reversible BRANCH_WRITE and PREVIEW_WRITE are allowed within approved scope. Production deploys, protected/default-branch merges, production DB/RLS/schema changes, secrets, DNS/domains, spend, public publishing, customer messaging, permission escalation, destructive operations, and irreversible migrations require explicit operator approval.

Implementers may not certify release-critical work. Independent validation must produce PASS, FAIL, BLOCKED, or UNKNOWN from fresh evidence.

## Base44 Compatibility
Start with `README.md` for setup and environment details.
- Frontend source: `src/`
- Base44 client: `src/api/base44Client.js`
- Vite config: `vite.config.js`
- Local secrets: `.env.local` and never commit them
- Prefer existing Base44 CLI/SDK patterns while migration decisions remain unresolved

## Completion
Every material task must return source references, immutable SHA where applicable, receipt, rollback pointer when applicable, verified/inferred/unknown classification, and next eligible action.
