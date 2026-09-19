import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { CAPABILITIES, AGENTS, FUNCTIONS, WORKFLOWS, LIBRARY_SUMMARY } from '../../shared/builderLibrary.ts';

// ═══════════════════════════════════════════════════════════════════════════
// BUILDER LIBRARY SEEDER
// Seeds the BuilderLibrary entity with the complete deterministic catalog
// of 47 capabilities, 11 agents, 31 functions, and 7 workflows extracted
// from the Xtreme Auto Builder system. Idempotent — only creates missing
// items, updates existing ones with latest definitions.
// ═══════════════════════════════════════════════════════════════════════════

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    // 1. Load existing items to avoid duplicates
    const existing = await base44.asServiceRole.entities.BuilderLibrary.list('-created_date', 200);
    const existingIds = new Set((existing || []).map((e: any) => e.item_id));

    const toCreate: any[] = [];
    let updatedCount = 0;

    // 2. Seed capabilities
    for (const cap of CAPABILITIES) {
      if (existingIds.has(cap.capability_id)) {
        // Update existing with latest definition
        const ex = (existing || []).find((e: any) => e.item_id === cap.capability_id);
        if (ex) {
          await base44.asServiceRole.entities.BuilderLibrary.update(ex.id, {
            name: cap.name,
            phase: cap.phase,
            description: cap.description,
            acceptance_test_id: cap.acceptance_test_id,
            generator_function: cap.generator_function,
            validator_function: cap.validator_function,
            dependencies: cap.dependencies,
            output_artifact: cap.output_artifact,
          });
          updatedCount++;
        }
      } else {
        toCreate.push({
          item_id: cap.capability_id,
          item_type: 'capability',
          name: cap.name,
          phase: cap.phase,
          description: cap.description,
          status: cap.status,
          acceptance_test_id: cap.acceptance_test_id,
          generator_function: cap.generator_function,
          validator_function: cap.validator_function,
          dependencies: cap.dependencies,
          output_artifact: cap.output_artifact,
          order: parseInt(cap.capability_id.split('-')[1]) || 0,
        });
      }
    }

    // 3. Seed agents
    for (const agent of AGENTS) {
      if (existingIds.has(agent.agent_id)) {
        const ex = (existing || []).find((e: any) => e.item_id === agent.agent_id);
        if (ex) {
          await base44.asServiceRole.entities.BuilderLibrary.update(ex.id, {
            name: agent.name,
            phase: 'orchestrator',
            description: `Agent role: ${agent.role}. Model policy: ${agent.model_policy}. Memory scope: ${agent.memory_scope}. Tools: ${agent.tools.join(', ')}. Permissions: ${agent.permissions.join(', ')}.`,
            model_policy: agent.model_policy,
            tools: agent.tools,
            permissions: agent.permissions,
            status: agent.is_active ? 'active' : 'pending',
          });
          updatedCount++;
        }
      } else {
        toCreate.push({
          item_id: agent.agent_id,
          item_type: 'agent',
          name: agent.name,
          phase: 'orchestrator',
          description: `Agent role: ${agent.role}. Model policy: ${agent.model_policy}. Memory scope: ${agent.memory_scope}. Tools: ${agent.tools.join(', ')}. Permissions: ${agent.permissions.join(', ')}. Budget: ${agent.budget.max_tokens} tokens, $${agent.budget.max_cost} max cost.`,
          status: agent.is_active ? 'active' : 'pending',
          model_policy: agent.model_policy,
          tools: agent.tools,
          permissions: agent.permissions,
          order: parseInt(agent.agent_id.split('-')[1]) || 0,
        });
      }
    }

    // 4. Seed functions
    for (const fn of FUNCTIONS) {
      if (existingIds.has(fn.function_id)) {
        const ex = (existing || []).find((e: any) => e.item_id === fn.function_id);
        if (ex) {
          await base44.asServiceRole.entities.BuilderLibrary.update(ex.id, {
            name: fn.name,
            phase: fn.category,
            description: fn.description,
            trigger: fn.trigger,
            generator_function: fn.name,
          });
          updatedCount++;
        }
      } else {
        toCreate.push({
          item_id: fn.function_id,
          item_type: 'function',
          name: fn.name,
          phase: fn.category,
          description: fn.description,
          status: 'active',
          trigger: fn.trigger,
          generator_function: fn.name,
          order: parseInt(fn.function_id.split('-')[1]) || 0,
        });
      }
    }

    // 5. Seed workflows
    for (const wf of WORKFLOWS) {
      if (existingIds.has(wf.workflow_id)) {
        const ex = (existing || []).find((e: any) => e.item_id === wf.workflow_id);
        if (ex) {
          await base44.asServiceRole.entities.BuilderLibrary.update(ex.id, {
            name: wf.name,
            phase: 'orchestrator',
            description: `Steps: ${wf.steps.join(' → ')}. Cadence: ${wf.cadence}.`,
            trigger: wf.trigger,
          });
          updatedCount++;
        }
      } else {
        toCreate.push({
          item_id: wf.workflow_id,
          item_type: 'workflow',
          name: wf.name,
          phase: 'orchestrator',
          description: `Steps: ${wf.steps.join(' → ')}. Cadence: ${wf.cadence}.`,
          status: 'active',
          trigger: wf.trigger,
          order: parseInt(wf.workflow_id.split('-')[1]) || 0,
        });
      }
    }

    // 6. Bulk create new items
    let createdCount = 0;
    if (toCreate.length > 0) {
      // Batch in groups of 100
      for (let i = 0; i < toCreate.length; i += 100) {
        const batch = toCreate.slice(i, i + 100);
        await base44.asServiceRole.entities.BuilderLibrary.bulkCreate(batch);
        createdCount += batch.length;
      }
    }

    // 7. Return summary
    const totalItems = await base44.asServiceRole.entities.BuilderLibrary.list('-created_date', 200);
    return Response.json({
      status: 'success',
      created: createdCount,
      updated: updatedCount,
      total_in_library: totalItems.length,
      summary: LIBRARY_SUMMARY,
    });
  } catch (error: any) {
    console.error('[builderLibrarySeeder] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}