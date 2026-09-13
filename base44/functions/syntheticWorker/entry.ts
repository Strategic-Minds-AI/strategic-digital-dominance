import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ════════════════════════════════════════════════════════════════
// syntheticWorker
// Proof-of-concept worker that claims a pending SwarmTask, executes it,
// creates an EvidenceReceipt, and marks the task + intent as completed.
// This will be replaced by Railway workers in Phase 11.
//
// Accepts: { task_id } or processes the oldest pending task.
// ════════════════════════════════════════════════════════════════

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const now = new Date().toISOString();
    const body = await req.json().catch(() => ({}));
    const workerId = `synthetic-worker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // ── Find the task to execute ──
    let task: any = null;
    if (body.task_id) {
      const tasks = await svc.entities.SwarmTask.filter({ id: body.task_id }, '-created_date', 1);
      task = tasks[0];
    } else {
      // Claim oldest pending task
      const pendingTasks = await svc.entities.SwarmTask.filter({ status: 'pending' }, 'created_date', 1);
      task = pendingTasks[0];
    }

    if (!task) {
      return Response.json({ ok: false, message: 'No pending tasks to execute' }, { status: 404 });
    }

    // ── CLAIM the task (pending → claimed) ──
    await svc.entities.SwarmTask.update(task.id, {
      status: 'claimed',
      assigned_agent: workerId,
      claimed_at: now,
    });

    // ── EXECUTE (claimed → in_progress) ──
    await svc.entities.SwarmTask.update(task.id, {
      status: 'in_progress',
    });

    // ── Perform the work based on task type ──
    let resultData: any = {};
    let resultSummary = '';

    if (task.task_type === 'research' || task.task_type === 'audit') {
      // For research/audit tasks: count benchmarks for the target system
      const systemId = task.payload?.entity_id || task.payload?.params?.system_id || 'epoxyquotenearme';
      const definitions = await svc.entities.BenchmarkDefinition.filter({ system_id: systemId, enabled: true }, '-created_date', 500);
      const results = await svc.entities.BenchmarkResult.filter({ system_id: systemId }, '-created_date', 500);

      resultData = {
        system_id: systemId,
        benchmark_count: definitions.length,
        results_count: results.length,
        categories: definitions.reduce((acc: any, d: any) => {
          acc[d.category] = (acc[d.category] || 0) + 1;
          return acc;
        }, {}),
      };
      resultSummary = `Audited ${systemId}: ${definitions.length} enabled benchmarks, ${results.length} results recorded`;
    } else {
      resultData = { message: `Executed task type: ${task.task_type}` };
      resultSummary = `Task ${task.title} executed by ${workerId}`;
    }

    // ── Create EvidenceReceipt ──
    const receiptId = `receipt-${task.id}-${Date.now()}`;
    await svc.entities.EvidenceReceipt.create({
      receipt_id: receiptId,
      system_id: task.payload?.params?.system_id || task.payload?.entity_id || 'fleet',
      benchmark_id: `SYNTHETIC-WORKER-${task.task_type}`,
      cycle_id: `acceptance-${Date.now()}`,
      evidence_type: 'function_output',
      evidence_url: `syntheticWorker://task/${task.id}`,
      evidence_description: resultSummary,
      evidence_data: JSON.stringify(resultData).slice(0, 5000),
      verified_at: now,
      verified_by: workerId,
      valid: true,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    // ── Mark task as completed ──
    await svc.entities.SwarmTask.update(task.id, {
      status: 'completed',
      result: resultSummary,
      result_summary: resultSummary,
      completed_at: now,
    });

    // ── Mark associated OperatorIntent as completed ──
    if (task.conversation_id) {
      // Find the intent linked to this conversation
      const conversations = await svc.entities.VisionConversation.filter({ conversation_id: task.conversation_id }, '-started_at', 1);
      const conv = conversations[0];
      if (conv && conv.intent_ids && conv.intent_ids.length > 0) {
        for (const intentId of conv.intent_ids) {
          const intents = await svc.entities.OperatorIntent.filter({ intent_id: intentId, status: ['pending', 'executing'] }, '-created_date', 1);
          const intent = intents[0];
          if (intent) {
            await svc.entities.OperatorIntent.update(intent.id, {
              status: 'completed',
              result: resultSummary,
              executed_at: now,
            });
          }
        }
      }
    }

    return Response.json({
      ok: true,
      worker_id: workerId,
      task_id: task.id,
      task_type: task.task_type,
      receipt_id: receiptId,
      result: resultSummary,
      result_data: resultData,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}