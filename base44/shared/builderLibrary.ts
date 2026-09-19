// ═══════════════════════════════════════════════════════════════════════════
// XTREME AUTO BUILDER — DETERMINISTIC LIBRARY CATALOG
// ═══════════════════════════════════════════════════════════════════════════
// Complete registry of every capability, agent, function, template, and
// workflow extracted from the Xtreme Auto Builder system. Organized into
// 7 deterministic phases with stable IDs for reproducible execution.
// ═══════════════════════════════════════════════════════════════════════════

export type CapabilityPhase =
  | 'foundation'
  | 'backend_data'
  | 'frontend_ui'
  | 'ai_agents'
  | 'integrations'
  | 'security_testing'
  | 'delivery_provisioning';

export type CapabilityStatus = 'pending' | 'generating' | 'validating' | 'completed' | 'failed';

export interface Capability {
  capability_id: string;
  name: string;
  phase: CapabilityPhase;
  description: string;
  acceptance_test_id: string;
  status: CapabilityStatus;
  generator_function: string;
  validator_function: string;
  dependencies: string[];
  output_artifact: string;
}

export interface AgentDefinition {
  agent_id: string;
  name: string;
  role: string;
  model_policy: 'reasoning' | 'coding';
  tools: string[];
  permissions: string[];
  memory_scope: string;
  budget: { max_tokens: number; max_cost: number };
  is_active: boolean;
}

export interface FunctionDefinition {
  function_id: string;
  name: string;
  category: 'orchestrator' | 'executor' | 'validator' | 'provisioner' | 'generator' | 'intelligence' | 'delivery';
  description: string;
  trigger: 'manual' | 'cron' | 'entity' | 'webhook' | 'event';
  entry_point: string;
}

export interface WorkflowDefinition {
  workflow_id: string;
  name: string;
  trigger: string;
  steps: string[];
  cadence: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const PHASES: Record<CapabilityPhase, { label: string; order: number; color: string; icon: string }> = {
  foundation: { label: 'Foundation', order: 1, color: 'amber', icon: 'Compass' },
  backend_data: { label: 'Backend & Data', order: 2, color: 'blue', icon: 'Database' },
  frontend_ui: { label: 'Frontend & UI', order: 3, color: 'purple', icon: 'Layout' },
  ai_agents: { label: 'AI & Agents', order: 4, color: 'green', icon: 'Bot' },
  integrations: { label: 'Integrations & Workflows', order: 5, color: 'cyan', icon: 'Workflow' },
  security_testing: { label: 'Security & Testing', order: 6, color: 'red', icon: 'Shield' },
  delivery_provisioning: { label: 'Delivery & Provisioning', order: 7, color: 'orange', icon: 'Rocket' },
};

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY CATALOG — 42 capabilities across 7 phases
// ═══════════════════════════════════════════════════════════════════════════

export const CAPABILITIES: Capability[] = [
  // ── Phase 1: Foundation ──────────────────────────────────────────────
  { capability_id: 'CAP-001', name: 'App creation from prompt', phase: 'foundation', description: 'Takes a natural-language app description and returns a structured app spec (name, type, pages, entities, components). Parse prompt, extract intent, generate scaffold plan with validation.', acceptance_test_id: 'TEST-001', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'architectureValidator', dependencies: [], output_artifact: 'AppSpec' },
  { capability_id: 'CAP-002', name: 'Website creation from prompt', phase: 'foundation', description: 'Converts a website prompt into a page list with sections, layout type, and content placeholders. Parse prompt, infer page structure, return JSON spec.', acceptance_test_id: 'TEST-002', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'architectureValidator', dependencies: [], output_artifact: 'PageSpec' },
  { capability_id: 'CAP-003', name: 'Plan mode', phase: 'foundation', description: 'Plan/discuss mode toggle — accepts a user goal, returns a step-by-step plan with milestones, estimates, and risks. No code generation, only planning output.', acceptance_test_id: 'TEST-003', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'PlanDocument' },
  { capability_id: 'CAP-004', name: 'URL import', phase: 'foundation', description: 'Accepts a URL, fetches its HTML, extracts metadata (title, description, headings, links), and returns a structured site summary.', acceptance_test_id: 'TEST-004', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'SiteSummary' },
  { capability_id: 'CAP-005', name: 'Figma import', phase: 'foundation', description: 'Accepts a Figma file key, parses Figma JSON response, extracts frames/layers, and maps them to component specs with layout properties.', acceptance_test_id: 'TEST-005', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'ComponentSpec' },
  { capability_id: 'CAP-006', name: 'GitHub repository sync', phase: 'foundation', description: 'Syncs a local app state with a GitHub repo — clone, pull changes, push changes, list branches, detect conflicts.', acceptance_test_id: 'TEST-006', status: 'pending', generator_function: 'githubSync', validator_function: 'validationAgent', dependencies: [], output_artifact: 'SyncState' },

  // ── Phase 2: Backend & Data ──────────────────────────────────────────
  { capability_id: 'CAP-007', name: 'App templates (community + workspace)', phase: 'backend_data', description: 'Template registry — list templates, get by id, filter by category/industry, apply template to create app scaffold. Community vs workspace sources.', acceptance_test_id: 'TEST-007', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'architectureValidator', dependencies: ['CAP-001'], output_artifact: 'TemplateRegistry' },
  { capability_id: 'CAP-008', name: 'AI Chat — Build mode', phase: 'backend_data', description: 'Build-mode chat — accept user message + app context, return build instructions (create page, add component, modify entity). Parse intent, generate action list.', acceptance_test_id: 'TEST-008', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-001'], output_artifact: 'BuildInstructions' },
  { capability_id: 'CAP-009', name: 'AI Chat — Discuss mode', phase: 'backend_data', description: 'Discuss-mode chat — accept user message, return conversational responses with suggestions and clarifying questions. No side effects.', acceptance_test_id: 'TEST-009', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'ChatResponse' },
  { capability_id: 'CAP-010', name: 'AI Chat — Edit mode (visual editor)', phase: 'backend_data', description: 'Edit-mode — accept element selection + modification request, return property changes (style, text, layout). Track selected element, apply diffs.', acceptance_test_id: 'TEST-010', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-008'], output_artifact: 'EditDiff' },
  { capability_id: 'CAP-011', name: 'Automatic model selection (Auto mode)', phase: 'backend_data', description: 'Selects an AI model based on task type — classify prompt (coding, reasoning, research), map to model, return model id with rationale.', acceptance_test_id: 'TEST-011', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'ModelSelection' },
  { capability_id: 'CAP-012', name: 'Manual model selection', phase: 'backend_data', description: 'Manages available AI models — list models with capabilities/pricing, get model by id, validate user selection.', acceptance_test_id: 'TEST-012', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-011'], output_artifact: 'ModelCatalog' },
  { capability_id: 'CAP-013', name: 'AI Controls (custom instructions, freeze files)', phase: 'backend_data', description: 'Per-app AI controls — set custom instructions, get instructions, manage freeze files (add/remove frozen sections).', acceptance_test_id: 'TEST-013', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'AIControls' },
  { capability_id: 'CAP-014', name: 'Design suggestions (visual options)', phase: 'backend_data', description: 'Generates visual design options — accept a component type, return 3-4 style variations (color palette, spacing, typography).', acceptance_test_id: 'TEST-014', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'DesignOptions' },

  // ── Phase 3: Frontend & UI ───────────────────────────────────────────
  { capability_id: 'CAP-015', name: 'Prompt/message queue', phase: 'frontend_ui', description: 'Message queue — enqueue messages, dequeue in order, peek, clear, track pending count. FIFO queue with priority support.', acceptance_test_id: 'TEST-015', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'MessageQueue' },
  { capability_id: 'CAP-016', name: 'Attachments', phase: 'frontend_ui', description: 'Chat attachments — upload, list by message, delete, validate file type/size. Attachment store with metadata.', acceptance_test_id: 'TEST-016', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-015'], output_artifact: 'AttachmentStore' },
  { capability_id: 'CAP-017', name: 'Voice input', phase: 'frontend_ui', description: 'Voice input — start recording, stop, transcribe, return transcript text. Track recording state and duration.', acceptance_test_id: 'TEST-017', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-015'], output_artifact: 'Transcript' },
  { capability_id: 'CAP-018', name: 'Theme panel (colors, fonts)', phase: 'frontend_ui', description: 'App themes — create, update, list, apply theme. Support color tokens (primary, secondary, background) and font families.', acceptance_test_id: 'TEST-018', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'ThemeConfig' },
  { capability_id: 'CAP-019', name: 'Workspace design system (brand)', phase: 'frontend_ui', description: 'Workspace brand settings — set brand colors, logo URL, typography defaults. Get/apply brand across apps.', acceptance_test_id: 'TEST-019', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-018'], output_artifact: 'BrandConfig' },
  { capability_id: 'CAP-020', name: 'Component library', phase: 'frontend_ui', description: 'Component library — register components with props schema, list by category, get by name, search.', acceptance_test_id: 'TEST-020', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationValidator', dependencies: [], output_artifact: 'ComponentRegistry' },
  { capability_id: 'CAP-021', name: 'Canvas (multi-page view, notes, collaboration)', phase: 'frontend_ui', description: 'Canvas — add pages, position pages on grid, add notes, track collaborators (cursor positions).', acceptance_test_id: 'TEST-021', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-020'], output_artifact: 'CanvasState' },
  { capability_id: 'CAP-022', name: 'Comments (pin to elements, threads)', phase: 'frontend_ui', description: 'Comments — create comment pinned to element, reply (threads), resolve, list by page. Track comment status and author.', acceptance_test_id: 'TEST-022', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-021'], output_artifact: 'CommentThread' },

  // ── Phase 4: AI & Agents ─────────────────────────────────────────────
  { capability_id: 'CAP-023', name: 'Pages management + navigation', phase: 'ai_agents', description: 'App pages — create, update, delete, reorder, set navigation order. Track page routes and nav structure.', acceptance_test_id: 'TEST-023', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-001'], output_artifact: 'PageStore' },
  { capability_id: 'CAP-024', name: 'Media management (images, videos, files)', phase: 'ai_agents', description: 'Media assets — upload, list, delete, organize into folders, search by name/type.', acceptance_test_id: 'TEST-024', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'MediaLibrary' },
  { capability_id: 'CAP-025', name: 'NPM packages', phase: 'ai_agents', description: 'NPM package dependencies — add, remove, list installed, search available. Track package versions and install status.', acceptance_test_id: 'TEST-025', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'PackageManifest' },
  { capability_id: 'CAP-026', name: 'Entities (schemas, CRUD)', phase: 'ai_agents', description: 'Entity schemas — create entity with fields, update schema, list entities, generate CRUD operations.', acceptance_test_id: 'TEST-026', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'architectureValidator', dependencies: [], output_artifact: 'EntitySchema' },
  { capability_id: 'CAP-027', name: 'Test data environment', phase: 'ai_agents', description: 'Test data — seed entities with sample records, reset to clean state, list seeded data.', acceptance_test_id: 'TEST-027', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-026'], output_artifact: 'TestDataStore' },
  { capability_id: 'CAP-028', name: 'Testing Agent (E2E browser tests)', phase: 'ai_agents', description: 'Test runner — register test cases, run tests, report pass/fail with logs. Track test results and coverage.', acceptance_test_id: 'TEST-028', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'TestResults' },
  { capability_id: 'CAP-029', name: 'Data version history', phase: 'ai_agents', description: 'Data changes — record snapshots, list versions, restore to previous version, diff between versions.', acceptance_test_id: 'TEST-029', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-026'], output_artifact: 'VersionHistory' },
  { capability_id: 'CAP-030', name: 'Email sending', phase: 'ai_agents', description: 'Email sending — compose, queue, send, track delivery status. Support templates and recipient lists.', acceptance_test_id: 'TEST-030', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'EmailOutbox' },

  // ── Phase 5: Integrations & Workflows ─────────────────────────────────
  { capability_id: 'CAP-031', name: 'In-app AI agents', phase: 'integrations', description: 'In-app AI agents — create agent with system prompt, list agents, invoke agent, track conversation history.', acceptance_test_id: 'TEST-031', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'AgentRegistry' },
  { capability_id: 'CAP-032', name: 'Workflows (triggers, schedules, conditions)', phase: 'integrations', description: 'Workflows — create workflow with trigger + steps, list, activate, deactivate. Support trigger types (entity, schedule, connector).', acceptance_test_id: 'TEST-032', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'WorkflowStore' },
  { capability_id: 'CAP-033', name: 'Automations (scheduled backend work)', phase: 'integrations', description: 'Scheduled automations — create cron job, list, pause/resume, execute due jobs. Track last run and next run time.', acceptance_test_id: 'TEST-033', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-032'], output_artifact: 'CronJobStore' },
  { capability_id: 'CAP-034', name: 'Developer tools + Activity Monitor', phase: 'integrations', description: 'Developer activity — log actions, list recent activity, filter by type, export activity log.', acceptance_test_id: 'TEST-034', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'ActivityFeed' },
  { capability_id: 'CAP-035', name: 'Payments — Wix/Base44 Payments', phase: 'integrations', description: 'Wix Payments integration — create checkout session, process payment, list transactions, handle webhooks.', acceptance_test_id: 'TEST-035', status: 'pending', generator_function: 'create-checkout', validator_function: 'validationAgent', dependencies: [], output_artifact: 'PaymentStore' },
  { capability_id: 'CAP-036', name: 'Payments — Stripe', phase: 'integrations', description: 'Stripe integration — create payment intent, confirm, list charges, handle refunds.', acceptance_test_id: 'TEST-036', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'StripeStore' },

  // ── Phase 6: Security & Testing ──────────────────────────────────────
  { capability_id: 'CAP-037', name: 'Payments tracking (transactions, subscriptions)', phase: 'security_testing', description: 'Payment records — record transaction, list by status, manage subscriptions (create, cancel, update), reconcile.', acceptance_test_id: 'TEST-037', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-035', 'CAP-036'], output_artifact: 'PaymentLedger' },
  { capability_id: 'CAP-038', name: 'Mobile experience (PWA, install)', phase: 'security_testing', description: 'PWA settings — set manifest, icons, theme color, install prompt state. Track install status and display mode.', acceptance_test_id: 'TEST-038', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'PWAConfig' },
  { capability_id: 'CAP-039', name: 'App store packaging (iOS + Android)', phase: 'security_testing', description: 'App store packaging — create build config, track build status, list builds, download.', acceptance_test_id: 'TEST-039', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-038'], output_artifact: 'BuildQueue' },
  { capability_id: 'CAP-040', name: 'Domain connection (custom domain)', phase: 'security_testing', description: 'Custom domains — add domain, verify DNS, set primary, list domains. Track verification status and SSL state.', acceptance_test_id: 'TEST-040', status: 'pending', generator_function: 'urlProvisioning', validator_function: 'validationAgent', dependencies: [], output_artifact: 'DomainRegistry' },
  { capability_id: 'CAP-041', name: 'Domain purchase (Wix, GoDaddy, IONOS)', phase: 'security_testing', description: 'Domain purchases — search availability, purchase, list purchased domains, transfer.', acceptance_test_id: 'TEST-041', status: 'pending', generator_function: 'godaddyApi', validator_function: 'validationAgent', dependencies: ['CAP-040'], output_artifact: 'DomainPurchase' },
  { capability_id: 'CAP-042', name: 'External domain connection (DNS)', phase: 'security_testing', description: 'External DNS — configure A/CNAME records, verify propagation, list DNS settings.', acceptance_test_id: 'TEST-042', status: 'pending', generator_function: 'urlProvisioning', validator_function: 'validationAgent', dependencies: ['CAP-040'], output_artifact: 'DNSConfig' },

  // ── Phase 7: Delivery & Provisioning ──────────────────────────────────
  { capability_id: 'CAP-043', name: 'Custom domain email', phase: 'delivery_provisioning', description: 'Custom domain email — set up email forwarding, create mailboxes, list, delete.', acceptance_test_id: 'TEST-043', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-040'], output_artifact: 'EmailConfig' },
  { capability_id: 'CAP-044', name: 'Branches (parallel work, merge)', phase: 'delivery_provisioning', description: 'Git branches — create, list, switch, merge, delete. Track branch parent and merge status.', acceptance_test_id: 'TEST-044', status: 'pending', generator_function: 'githubSync', validator_function: 'validationAgent', dependencies: ['CAP-006'], output_artifact: 'BranchStore' },
  { capability_id: 'CAP-045', name: 'Version history (restore, revert, publish older)', phase: 'delivery_provisioning', description: 'Version history — create version snapshot, list versions, restore, revert, publish specific version.', acceptance_test_id: 'TEST-045', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: ['CAP-029'], output_artifact: 'VersionStore' },
  { capability_id: 'CAP-046', name: 'MCP connections', phase: 'delivery_provisioning', description: 'MCP server connections — add connection, list, test connection, remove. Track connection status and capabilities.', acceptance_test_id: 'TEST-046', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'MCPRegistry' },
  { capability_id: 'CAP-047', name: 'Connectors (shared + per-user OAuth)', phase: 'delivery_provisioning', description: 'OAuth connectors — register connector, list, authorize, revoke. Support shared and per-user modes.', acceptance_test_id: 'TEST-047', status: 'pending', generator_function: 'buildOrchestrator', validator_function: 'validationAgent', dependencies: [], output_artifact: 'ConnectorStore' },
];

// ═══════════════════════════════════════════════════════════════════════════
// AGENT REGISTRY — 11 specialized agents
// ═══════════════════════════════════════════════════════════════════════════

export const AGENTS: AgentDefinition[] = [
  { agent_id: 'AGENT-001', name: 'architect', role: 'architect', model_policy: 'reasoning', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'global', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-002', name: 'engineer', role: 'engineer', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-003', name: 'qa_validator', role: 'qa_validator', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-004', name: 'security_auditor', role: 'security_auditor', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-005', name: 'deployment_specialist', role: 'deployment_specialist', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-006', name: 'provisioning_agent', role: 'provisioning_agent', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-007', name: 'discovery_agent', role: 'discovery_agent', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-008', name: 'documentation_agent', role: 'documentation_agent', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-009', name: 'monitoring_agent', role: 'monitoring_agent', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-010', name: 'council_member', role: 'council_member', model_policy: 'reasoning', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
  { agent_id: 'AGENT-011', name: 'team_manager', role: 'team_manager', model_policy: 'coding', tools: ['entity_crud', 'function_invoke', 'file_upload'], permissions: ['read', 'create', 'update'], memory_scope: 'project', budget: { max_tokens: 100000, max_cost: 5 }, is_active: true },
];

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTION REGISTRY — 31 backend functions
// ═══════════════════════════════════════════════════════════════════════════

export const FUNCTIONS: FunctionDefinition[] = [
  { function_id: 'FN-001', name: 'buildOrchestrator', category: 'orchestrator', description: 'Autonomous loop controller — picks the next capability to build, calls buildModule, tracks progress in BuildJob.', trigger: 'manual', entry_point: 'buildOrchestrator/entry.ts' },
  { function_id: 'FN-002', name: 'autonomousBuilder', category: 'orchestrator', description: 'Autonomous build loop — continuously builds capabilities until all are complete.', trigger: 'cron', entry_point: 'autonomousBuilder/entry.ts' },
  { function_id: 'FN-003', name: 'canaryExecutor', category: 'executor', description: 'WP-CANARY-001 — Vercel OIDC + Sandbox + GitHub Connect. Real code generation, commits, and CI tests.', trigger: 'manual', entry_point: 'canaryExecutor/entry.ts' },
  { function_id: 'FN-004', name: 'canaryVerifier', category: 'validator', description: 'Verifies canary deployments — checks CI test results, validates code quality.', trigger: 'manual', entry_point: 'canaryVerifier/entry.ts' },
  { function_id: 'FN-005', name: 'codingAgent', category: 'generator', description: 'AI code generation agent — reads ingestion results, watches work via cloud browser, signals completion.', trigger: 'cron', entry_point: 'codingAgent/entry.ts' },
  { function_id: 'FN-006', name: 'codingAgent2', category: 'generator', description: 'Parallel coding agent — picks up sections the primary agent has not completed.', trigger: 'event', entry_point: 'codingAgent2/entry.ts' },
  { function_id: 'FN-007', name: 'packetExecutor', category: 'executor', description: 'Real implementation engine — GitHub branch creation, AI code generation, Git Data API commits, CI workflows.', trigger: 'manual', entry_point: 'packetExecutor/entry.ts' },
  { function_id: 'FN-008', name: 'executeWorkPacket', category: 'executor', description: 'Work packet execution wrapper — validates packet, delegates to packetExecutor.', trigger: 'manual', entry_point: 'executeWorkPacket/entry.ts' },
  { function_id: 'FN-009', name: 'provisionInfrastructure', category: 'provisioner', description: 'Checkbox-driven provisioning — Drive folder, Supabase, Railway, GitHub repo, Vercel project, domain purchase.', trigger: 'manual', entry_point: 'provisionInfrastructure/entry.ts' },
  { function_id: 'FN-010', name: 'provisionProjectStorage', category: 'provisioner', description: 'Project storage provisioning — creates Drive folders and Supabase tables for a new project.', trigger: 'manual', entry_point: 'provisionProjectStorage/entry.ts' },
  { function_id: 'FN-011', name: 'generateDeliveryPackage', category: 'delivery', description: 'Scans entire system, creates capabilities summary via LLM, generates professional PDF delivery package.', trigger: 'manual', entry_point: 'generateDeliveryPackage/entry.ts' },
  { function_id: 'FN-012', name: 'sendClientDelivery', category: 'delivery', description: 'Sends delivery package to client via email, SMS, and WhatsApp.', trigger: 'manual', entry_point: 'sendClientDelivery/entry.ts' },
  { function_id: 'FN-013', name: 'gptAssetPipeline', category: 'generator', description: 'GPT creates images and builder docs — generates custom diagrams via GenerateImage, refines docs via InvokeLLM.', trigger: 'manual', entry_point: 'gptAssetPipeline/entry.ts' },
  { function_id: 'FN-014', name: 'generateSiteContent', category: 'generator', description: 'Site content generation — creates page content from architecture specs.', trigger: 'manual', entry_point: 'generateSiteContent/entry.ts' },
  { function_id: 'FN-015', name: 'ingestAssetPack', category: 'generator', description: 'Asset pack ingestion — uploads and analyzes brand/web/logo packs.', trigger: 'manual', entry_point: 'ingestAssetPack/entry.ts' },
  { function_id: 'FN-016', name: 'ingestDriveImages', category: 'generator', description: 'Drive image ingestion — imports images from Google Drive folders.', trigger: 'manual', entry_point: 'ingestDriveImages/entry.ts' },
  { function_id: 'FN-017', name: 'listDriveImages', category: 'intelligence', description: 'Lists images in a Google Drive folder for ingestion.', trigger: 'manual', entry_point: 'listDriveImages/entry.ts' },
  { function_id: 'FN-018', name: 'urlProvisioning', category: 'provisioner', description: 'URL/domain provisioning — domain search, purchase, DNS configuration, SSL setup.', trigger: 'manual', entry_point: 'urlProvisioning/entry.ts' },
  { function_id: 'FN-019', name: 'watchdog5Min', category: 'orchestrator', description: '5-minute watchdog — monitors build jobs, triggers retries, fires coding agents.', trigger: 'cron', entry_point: 'watchdog5Min/entry.ts' },
  { function_id: 'FN-020', name: 'runSiteWorker', category: 'executor', description: 'Site worker execution — runs background site processing tasks.', trigger: 'manual', entry_point: 'runSiteWorker/entry.ts' },
  { function_id: 'FN-021', name: 'exportToDrive', category: 'delivery', description: 'Exports project artifacts to Google Drive folder.', trigger: 'manual', entry_point: 'exportToDrive/entry.ts' },
  { function_id: 'FN-022', name: 'architectureValidator', category: 'validator', description: 'Validates architecture compliance — checks all sections against architecture manifest.', trigger: 'manual', entry_point: 'architectureValidator/entry.ts' },
  { function_id: 'FN-023', name: 'validationAgent', category: 'validator', description: 'Validation agent — runs security, syntax, execution, and accuracy validation on generated code.', trigger: 'manual', entry_point: 'validationAgent/entry.ts' },
  { function_id: 'FN-024', name: 'verifySiteBuild', category: 'validator', description: 'Verifies site build — checks deployment, SSL, and content.', trigger: 'manual', entry_point: 'verifySiteBuild/entry.ts' },
  { function_id: 'FN-025', name: 'verifyWorkPacket', category: 'validator', description: 'Verifies work packet — checks CI test results and code quality.', trigger: 'manual', entry_point: 'verifyWorkPacket/entry.ts' },
  { function_id: 'FN-026', name: 'submitWorkQueue', category: 'orchestrator', description: 'Submits work packets to the execution queue.', trigger: 'manual', entry_point: 'submitWorkQueue/entry.ts' },
  { function_id: 'FN-027', name: 'submitSiteQueue', category: 'orchestrator', description: 'Submits site builds to the deployment queue.', trigger: 'manual', entry_point: 'submitSiteQueue/entry.ts' },
  { function_id: 'FN-028', name: 'shadowBrowse', category: 'intelligence', description: 'Covert cloud browser — drives isolated session through proxy pool, returns page content only to caller.', trigger: 'manual', entry_point: 'shadowBrowse/entry.ts' },
  { function_id: 'FN-029', name: 'shadowClone', category: 'intelligence', description: 'Shadow cloning — clones site structure and content for analysis.', trigger: 'manual', entry_point: 'shadowClone/entry.ts' },
  { function_id: 'FN-030', name: 'shadowForcefield', category: 'intelligence', description: 'Shadow forcefield — anti-detection layer for covert browsing operations.', trigger: 'manual', entry_point: 'shadowForcefield/entry.ts' },
  { function_id: 'FN-031', name: 'qa3dAgent', category: 'validator', description: '3D QA agent — validates 3D models and visual assets.', trigger: 'manual', entry_point: 'qa3dAgent/entry.ts' },
];

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW REGISTRY — Deterministic execution flows
// ═══════════════════════════════════════════════════════════════════════════

export const WORKFLOWS: WorkflowDefinition[] = [
  { workflow_id: 'WF-001', name: 'Autonomous Build Loop', trigger: 'cron (5 min)', steps: ['watchdog5Min fires', 'buildOrchestrator picks next pending capability', 'codingAgent generates code via AI Gateway', 'codingAgent2 parallel-claims remaining sections', 'validationAgent validates output', 'BuildJob status updated'], cadence: 'every 5 minutes' },
  { workflow_id: 'WF-002', name: 'Canary Execution', trigger: 'manual', steps: ['canaryExecutor creates Vercel Sandbox via OIDC', 'GitHub Connect getToken for repo access', 'Clone repo + create child branch', 'AI Gateway generates canary module', 'Write files via Git Data API', 'Push branch + GitHub Actions CI', 'canaryVerifier checks CI results'], cadence: 'on-demand' },
  { workflow_id: 'WF-003', name: 'Work Packet Execution', trigger: 'manual', steps: ['submitWorkQueue enqueues packet', 'packetExecutor gets main SHA from GitHub', 'Creates isolated branch build/wp-XXXX', 'AI Gateway generates source + tests', 'Writes files via Git Data API', 'Writes GitHub Actions workflow', 'Commits and pushes', 'Returns canonical receipt'], cadence: 'on-demand' },
  { workflow_id: 'WF-004', name: 'Infrastructure Provisioning', trigger: 'manual', steps: ['provisionInfrastructure receives project + options', 'Creates Google Drive folder', 'Provisions Supabase backend', 'Creates Railway service', 'Creates GitHub repo', 'Creates Vercel frontend project', 'Optionally purchases domain'], cadence: 'on-demand' },
  { workflow_id: 'WF-005', name: 'Client Delivery', trigger: 'manual', steps: ['generateDeliveryPackage scans system entities', 'LLM creates capabilities summary', 'jsPDF generates professional PDF', 'DeliveryPackage record created', 'sendClientDelivery sends via email/SMS/WhatsApp', 'ClientRating tracks feedback'], cadence: 'on-demand' },
  { workflow_id: 'WF-006', name: 'GPT Asset Pipeline', trigger: 'manual/cron', steps: ['gptAssetPipeline iterates architecture sections', 'GenerateImage creates custom diagram per section', 'InvokeLLM refines builder doc with JSON schema', 'AssetPack packaged and linked', 'Architecture section image_url + content updated'], cadence: 'manual or watchdog' },
  { workflow_id: 'WF-007', name: 'Architecture Validation', trigger: 'manual', steps: ['architectureValidator loads manifest', 'Checks all sections against requirements', 'Validates coding_status + validation_score', 'Reports gaps and failures', 'Triggers repair if auto_repair_allowed'], cadence: 'on-demand' },
];

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export const LIBRARY_SUMMARY = {
  total_capabilities: CAPABILITIES.length,
  total_agents: AGENTS.length,
  total_functions: FUNCTIONS.length,
  total_workflows: WORKFLOWS.length,
  total_phases: Object.keys(PHASES).length,
  capabilities_by_phase: Object.keys(PHASES).reduce((acc, phase) => {
    acc[phase] = CAPABILITIES.filter(c => c.phase === phase).length;
    return acc;
  }, {} as Record<string, number>),
  functions_by_category: {
    orchestrator: FUNCTIONS.filter(f => f.category === 'orchestrator').length,
    executor: FUNCTIONS.filter(f => f.category === 'executor').length,
    validator: FUNCTIONS.filter(f => f.category === 'validator').length,
    provisioner: FUNCTIONS.filter(f => f.category === 'provisioner').length,
    generator: FUNCTIONS.filter(f => f.category === 'generator').length,
    intelligence: FUNCTIONS.filter(f => f.category === 'intelligence').length,
    delivery: FUNCTIONS.filter(f => f.category === 'delivery').length,
  },
};