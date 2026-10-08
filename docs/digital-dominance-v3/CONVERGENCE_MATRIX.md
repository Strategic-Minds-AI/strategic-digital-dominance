# V3 Convergence Matrix | 2026-10-08

Current state: source-inspected, NOT merged/deployed.

| Component | Donor / source | Treatment | Evidence and dependency | Next check |
|---|---|---|---|---|
| ChatGPT-like command shell | XTREME-SYSTEMS/vision-cortex-V2 dev/max-tier-vision-cortex-v1, src/pages/MaxTierDevPreview.jsx | EXTRACT | UI tabs Intake, Projects, Agents, Create, Growth, Health; has browser localStorage and links | isolate shell from auth/routing and protect tenancy |
| Mobile dock | same donor commit f3851af7c88b79368cb959dc617d24f79c0d2b8c | PRESERVE | mobile dock and branding changes verified in commit diff | keyboard / responsive / touch tests |
| Login and auth | Vision Cortex App.jsx, AuthProvider, ProtectedRoute | REFACTOR | inherited Base44 SDK and auth dependencies | map auth claims to Supabase or approved identity provider |
| Website builder | Strategic-Minds-AI/strategic-digital-dominance src/components/site-builder | PRESERVE + REFACTOR | existing generator calls base44.integrations.Core.InvokeLLM | introduce AI Gateway adapter behind server auth |
| Existing content prompts | ContentStudio.jsx | QUARANTINE until modified | asks LLM to invent testimonial entries; must not become public proof | replace with source-backed proof request and explicit no-testimonials default |
| Social tools | existing AutonomousWorkflows and admin tools | EXTRACT after review | workflow references discovered, not runtime-proven | verify permissions and social API policies |
| Site Pack schema | docs/digital-dominance-v3/site-pack-v1.schema.json | NEW / V3 authority | preview only; no production publish | formal schema and policy check |
| Preview admission guard | src/lib/digital-dominance-v3/validateSitePack.js | NEW | reject unsafe publication, unsupported generated proof and live customer modes | execute isolated tests and independent review |
| Durable worker + queues | Supabase/Vercel/Railway | UNKNOWN | no confirmed singleton or live integration for V3 | inventory existing leases before adding worker |
| Vercel Vision Cortex preview | vision-cortex-chatgpt-parity-preview | PRESERVE | Vercel project READY does not imply functional E2E | browser check latest deployment identity |
| Vercel Digital Dominance 2.0 | digital-dominance-2-0 | PRESERVE | production-target READY status only | trace source commit, routes, API behavior |

## Integration decision
Canonical target repository: Strategic-Minds-AI/strategic-digital-dominance. Donor code stays in XTREME-SYSTEMS/vision-cortex-V2 until independently validated copy/extraction. Never overwrite current UI, deploy production, add cron duplication, bind secrets or change DNS from this plan.

## Verification and release gates
1. Module tests and JSON Schema check.
2. Content policy / provenance review.
3. Auth / tenant isolation tests.
4. Idempotent server-side intake and durable queue tests.
5. Preview browser and 3 responsive viewport QA.
6. Independent validation and signed release gate.

## Next work packet
Develop an authenticated, rate-limited Site Pack intake endpoint against existing V3 schema, with durable idempotency and preview-only queue. Patch legacy content generator to request source-backed case studies instead of fabricated testimonials. Keep this change branch-scoped and preserve rollback to main.
