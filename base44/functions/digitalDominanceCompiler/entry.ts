import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { XTREME_DIGITAL_DOMINANCE, XTREME_SOURCE_MANIFEST_VERSION } from '../../shared/xtremeUniversalGeneratorSources.ts';

// DIGITAL DOMINANCE COMPILER
// Compiles canonical Drive workbooks into Base44 machine-readable strategy chunks.
// Default mode is SHADOW. It does NOT publish pages, send outreach, create backlinks,
// spend money, message customers, or deploy production changes.
// Promotion to executable SwarmTasks requires mode=execute AND promote=true.

const normalizeHeader = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'compile';
    const execute = body.mode === 'execute';
    const promote = execute && body.promote === true;

    const { accessToken } = await svc.connectors.getConnection('googlesheets');
    if (!accessToken) return Response.json({ error: 'Google Sheets connector not connected' }, { status: 500 });

    const getSheetTitles = async (spreadsheetId: string) => {
      const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Sheets metadata failed ${r.status}`);
      const j = await r.json();
      return (j.sheets || []).map((s: any) => s.properties?.title).filter(Boolean);
    };

    const getValues = async (spreadsheetId: string, preferredPattern: RegExp) => {
      const titles = await getSheetTitles(spreadsheetId);
      const chosen = titles.find((t: string) => preferredPattern.test(t)) || titles[0];
      if (!chosen) throw new Error(`No worksheets found in ${spreadsheetId}`);
      const range = `'${String(chosen).replace(/'/g, "''")}'!A1:AZ1000`;
      const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Sheets values failed ${r.status}`);
      const j = await r.json();
      return { title: chosen, values: j.values || [] };
    };

    const rowsToObjects = (values: any[][]) => {
      if (!values || values.length < 2) return [];
      const headers = values[0].map(normalizeHeader);
      return values.slice(1)
        .filter((row: any[]) => row.some(v => String(v ?? '').trim() !== ''))
        .map((row: any[]) => {
          const obj: any = {};
          headers.forEach((h: string, i: number) => { if (h) obj[h] = row[i] ?? ''; });
          return obj;
        });
    };

    const workflowSource = XTREME_DIGITAL_DOMINANCE.sources.find(s => s.key === 'autonomous_workflows')!;
    const conceptSource = XTREME_DIGITAL_DOMINANCE.sources.find(s => s.key === 'business_concepts')!;
    const [workflowSheet, conceptSheet] = await Promise.all([
      getValues(workflowSource.drive_id, /workflow/i),
      getValues(conceptSource.drive_id, /concept/i),
    ]);

    const workflows = rowsToObjects(workflowSheet.values);
    const concepts = rowsToObjects(conceptSheet.values);

    const compileSummary = {
      manifest_version: XTREME_SOURCE_MANIFEST_VERSION,
      workflows_sheet: workflowSheet.title,
      business_concepts_sheet: conceptSheet.title,
      workflow_rows: workflows.length,
      business_concept_rows: concepts.length,
      expected_workflows: XTREME_DIGITAL_DOMINANCE.workflow_count_expected,
      expected_business_concepts: XTREME_DIGITAL_DOMINANCE.business_concept_count_expected,
      workflow_count_match: workflows.length >= XTREME_DIGITAL_DOMINANCE.workflow_count_expected,
      business_concept_count_match: concepts.length >= XTREME_DIGITAL_DOMINANCE.business_concept_count_expected,
    };

    if (action === 'status') {
      return Response.json({ ok: true, mode: 'shadow', compileSummary });
    }

    if (action === 'compile') {
      if (!execute) {
        return Response.json({
          ok: true,
          mode: 'dry_run',
          compileSummary,
          sample_workflows: workflows.slice(0, 5),
          sample_business_concepts: concepts.slice(0, 5),
          would_write_strategy_chunks: Math.ceil(workflows.length / 10) + Math.ceil(concepts.length / 10),
          would_promote_tasks: 0,
        });
      }

      // Compile to StrategyDocument chunks to keep each document bounded and auditable.
      const upsertStrategyChunk = async (title: string, type: string, category: string, chunk: any[], tags: string[]) => {
        const existing = await svc.entities.StrategyDocument.filter({ title }, '-created_date', 1);
        const payload = {
          title,
          type,
          category,
          content: JSON.stringify({ manifest_version: XTREME_SOURCE_MANIFEST_VERSION, rows: chunk }, null, 2).slice(0, 49500),
          summary: `${chunk.length} canonical Digital Dominance records compiled from Google Drive source truth.`,
          status: 'active',
          version: 1,
          tags,
        };
        if (existing.length > 0) return await svc.entities.StrategyDocument.update(existing[0].id, payload);
        return await svc.entities.StrategyDocument.create(payload);
      };

      let strategyChunks = 0;
      for (let i = 0; i < workflows.length; i += 10) {
        await upsertStrategyChunk(
          `Digital Dominance Autonomous Workflows ${String(i + 1).padStart(3, '0')}-${String(Math.min(i + 10, workflows.length)).padStart(3, '0')}`,
          'automation',
          'digital_dominance_workflows',
          workflows.slice(i, i + 10),
          ['digital_dominance', 'autonomous_workflow', 'xtreme_universal_generator', 'canonical_drive_source']
        );
        strategyChunks++;
      }
      for (let i = 0; i < concepts.length; i += 10) {
        await upsertStrategyChunk(
          `Digital Dominance Business Concepts ${String(i + 1).padStart(3, '0')}-${String(Math.min(i + 10, concepts.length)).padStart(3, '0')}`,
          'go_to_market',
          'digital_dominance_business_concepts',
          concepts.slice(i, i + 10),
          ['digital_dominance', 'business_concept', 'xtreme_universal_generator', 'canonical_drive_source']
        );
        strategyChunks++;
      }

      let tasksCreated = 0;
      if (promote) {
        // Promotion is intentionally explicit. These are implementation tasks only.
        // Public publishing, customer messaging, paid actions, and destructive actions remain blocked by downstream approval policy.
        const existingTasks = await svc.entities.SwarmTask.filter({ task_type: 'digital_dominance_implementation' }, '-created_date', 500);
        const existingKeys = new Set((existingTasks || []).map((t: any) => t.payload?.params?.workflow_key).filter(Boolean));
        const newTasks: any[] = [];
        for (let i = 0; i < workflows.length; i++) {
          const w: any = workflows[i];
          const key = String(w.workflow_id || w.id || w.workflow || `DD-WF-${String(i + 1).padStart(3, '0')}`);
          if (existingKeys.has(key)) continue;
          const title = String(w.workflow_name || w.name || w.workflow || `Digital Dominance Workflow ${i + 1}`);
          newTasks.push({
            task_type: 'digital_dominance_implementation',
            title: `[DD] ${title}`,
            description: `Compile and implement Digital Dominance workflow ${key} through XTREME Universal Generator contracts. Validate independently before release. Do not publish publicly or message customers without an approved release/communications gate.`,
            priority: 'high',
            status: 'pending',
            assigned_agent: 'alpha_prime_orchestrator',
            created_by_agent: 'xtreme_universal_generator',
            payload: {
              action: 'implement_digital_dominance_workflow',
              entity_type: 'digital_dominance_workflow',
              params: { workflow_key: key, source_drive_id: workflowSource.drive_id, source_row: i + 2, workflow: w },
            },
          });
          if (newTasks.length === 100) {
            const made = await svc.entities.SwarmTask.bulkCreate(newTasks.splice(0, 100));
            tasksCreated += made?.length || 0;
          }
        }
        if (newTasks.length > 0) {
          const made = await svc.entities.SwarmTask.bulkCreate(newTasks);
          tasksCreated += made?.length || 0;
        }
      }

      return Response.json({
        ok: true,
        mode: promote ? 'execute_promoted' : 'execute_compile_only',
        compileSummary,
        strategy_chunks_written: strategyChunks,
        implementation_tasks_created: tasksCreated,
        protected_actions_still_gated: ['public_publish', 'customer_messaging', 'paid_spend', 'dns', 'secret_change', 'destructive_change', 'production_cutover'],
      });
    }

    return Response.json({ error: `Unknown action ${action}` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
