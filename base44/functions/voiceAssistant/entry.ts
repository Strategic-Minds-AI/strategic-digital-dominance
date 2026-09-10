import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// voiceAssistant — AI Voice Assistant powered by Telnyx.
//
// Creates and manages a Telnyx AI Assistant that answers phone calls when the
// user is unavailable. The user sets up conditional call forwarding from their
// personal number to a Telnyx number; when they don't answer, the AI picks up.
//
// Actions (admin auth required):
//   getStatus       — Check current setup status
//   createAssistant — Create a Telnyx AI Assistant
//   updateAssistant — Update assistant instructions/greeting/voice
//   searchNumbers   — Search available Telnyx phone numbers
//   buyNumber       — Buy a Telnyx phone number
//   listNumbers     — List purchased Telnyx numbers
//   getRecentCalls  — Get recent call sessions
//   updateForwarding — Save user's forwarding number + carrier
//
// Webhook (no auth — called by Telnyx):
//   Telnyx sends call.initiated events to this function. The function detects
//   webhooks by checking for data.event_type in the request body (no action field).
// ─────────────────────────────────────────────────────────────────────────────

const TELNYX_BASE = 'https://api.telnyx.com/v2';
const APP_URL = 'https://epoxyquotenearme.base44.app';
const WEBHOOK_URL = `${APP_URL}/functions/voiceAssistant`;

async function telnyxFetch(path: string, method: string, apiKey: string, body?: any) {
  const res = await fetch(`${TELNYX_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errDetail = JSON.stringify(data).slice(0, 500);
    throw new Error(`Telnyx API error (${res.status}): ${errDetail}`);
  }
  return data;
}

async function getActiveAssistant(svc: any) {
  const assistants = await svc.entities.VoiceAssistant.list('-created_date', 1);
  return assistants[0] || null;
}

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));

    // ── Telnyx Webhook Handler (no auth — Telnyx sends these) ──
    // Telnyx webhooks have data.event_type but no action field.
    if (!body.action && body.data?.event_type) {
      return await handleWebhook(req, body);
    }

    // ── Management Actions (admin auth required) ──
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const apiKey = secrets.get('TELNYX_API_KEY');
    if (!apiKey) return Response.json({ error: 'TELNYX_API_KEY secret not set' }, { status: 500 });

    const action = body.action || 'getStatus';
    let result;

    switch (action) {
      // ── Status ──
      case 'getStatus': {
        const va = await getActiveAssistant(svc);
        result = {
          configured: !!va,
          status: va?.status || 'not_setup',
          assistant_name: va?.assistant_name || null,
          phone_number: va?.phone_number || null,
          assistant_id: va?.assistant_id || null,
          enabled: va?.enabled ?? false,
          total_calls: va?.total_calls || 0,
          last_call_at: va?.last_call_at || null,
          forwarding_number: va?.forwarding_number || null,
          carrier: va?.carrier || null,
        };
        break;
      }

      // ── Create AI Assistant ──
      case 'createAssistant': {
        const { assistant_name, system_prompt, greeting, voice, model, language } = body;
        if (!assistant_name || !system_prompt) {
          return Response.json({ error: 'assistant_name and system_prompt are required' }, { status: 400 });
        }

        // Create the assistant on Telnyx
        // Note: Telnyx uses its own model names for inference — we omit the model
        // field to use Telnyx's default (GPT-4 class). The Vercel AI Gateway models
        // (anthropic/claude-opus-4.7 etc.) are NOT valid Telnyx model names.
        const assistantPayload: any = {
          name: assistant_name,
          instructions: system_prompt,
          greeting: greeting || 'Hello, thank you for calling. How can I help you today?',
        };
        // Only add model if it's a Telnyx-supported model (not a Vercel AI Gateway model)
        if (model && !model.includes('/')) {
          assistantPayload.model = model;
        }

        const telnyxRes = await telnyxFetch('/ai/assistants', 'POST', apiKey, assistantPayload);

        const assistantId = telnyxRes.data?.id || telnyxRes.id;

        // Save to our database
        const va = await svc.entities.VoiceAssistant.create({
          assistant_name,
          assistant_id: assistantId,
          system_prompt,
          greeting: greeting || 'Hello, thank you for calling. How can I help you today?',
          voice: voice || 'female',
          model: model || 'anthropic/claude-opus-4.7',
          language: language || 'en-US',
          enabled: true,
          status: 'assistant_created',
        });

        result = { ok: true, assistant_id: assistantId, voice_assistant_id: va.id };
        break;
      }

      // ── Update Assistant ──
      case 'updateAssistant': {
        const va = await getActiveAssistant(svc);
        if (!va) return Response.json({ error: 'No voice assistant found. Create one first.' }, { status: 400 });

        const updates: any = {};
        if (body.system_prompt) updates.instructions = body.system_prompt;
        if (body.greeting) updates.greeting = body.greeting;
        if (body.voice) updates.voice = body.voice;
        if (body.model) updates.model = body.model;

        // Update on Telnyx
        await telnyxFetch(`/ai/assistants/${va.assistant_id}`, 'PATCH', apiKey, updates);

        // Update our database
        const updated = await svc.entities.VoiceAssistant.update(va.id, {
          system_prompt: body.system_prompt || va.system_prompt,
          greeting: body.greeting || va.greeting,
          voice: body.voice || va.voice,
          model: body.model || va.model,
          enabled: body.enabled !== undefined ? body.enabled : va.enabled,
        });

        result = { ok: true, voice_assistant: updated };
        break;
      }

      // ── Search Available Numbers ──
      case 'searchNumbers': {
        const { area_code, contains, limit } = body;
        const params = new URLSearchParams({
          'filter[country_code]': 'US',
          'filter[features]': 'voice',
          'page[size]': String(limit || 20),
        });
        if (area_code) params.set('filter[starts_with]', area_code);
        if (contains) params.set('filter[contains]', contains);

        const data = await telnyxFetch(`/available_phone_numbers?${params}`, 'GET', apiKey);
        result = { numbers: data.data || [], count: (data.data || []).length };
        break;
      }

      // ── Buy Number ──
      case 'buyNumber': {
        const { phone_number } = body;
        if (!phone_number) return Response.json({ error: 'phone_number is required' }, { status: 400 });

        const va = await getActiveAssistant(svc);
        if (!va) return Response.json({ error: 'Create an assistant first' }, { status: 400 });

        // Buy the number
        const orderRes = await telnyxFetch('/number_orders', 'POST', apiKey, {
          phone_numbers: [phone_number],
        });

        const purchasedNumber = orderRes.data?.phone_numbers?.[0];
        const numberId = purchasedNumber?.id;

        // Create a Call Control Application with webhook
        const appRes = await telnyxFetch('/call_control_applications', 'POST', apiKey, {
          name: `AI Voice Assistant — ${va.assistant_name}`,
          webhook_url: WEBHOOK_URL,
          application_type: 'webhook',
        });
        const connectionId = appRes.data?.id || appRes.id;

        // Assign the number to the Call Control Application
        if (numberId) {
          await telnyxFetch(`/phone_numbers/${numberId}`, 'PATCH', apiKey, {
            connection_id: connectionId,
          });
        }

        // Update our database
        await svc.entities.VoiceAssistant.update(va.id, {
          phone_number,
          connection_id: connectionId,
          status: 'configured',
        });

        result = { ok: true, phone_number, connection_id: connectionId };
        break;
      }

      // ── List Purchased Numbers ──
      case 'listNumbers': {
        const data = await telnyxFetch('/phone_numbers?page[size]=50', 'GET', apiKey);
        result = { numbers: data.data || [] };
        break;
      }

      // ── Get Recent Calls ──
      case 'getRecentCalls': {
        const calls = await svc.entities.AiVoiceSession.list('-created_date', 20);
        result = { calls };
        break;
      }

      // ── Update Forwarding Info ──
      case 'updateForwarding': {
        const va = await getActiveAssistant(svc);
        if (!va) return Response.json({ error: 'No voice assistant found' }, { status: 400 });

        await svc.entities.VoiceAssistant.update(va.id, {
          forwarding_number: body.forwarding_number || va.forwarding_number,
          carrier: body.carrier || va.carrier,
        });

        result = { ok: true };
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ ok: true, action, result });
  } catch (error) {
    console.error('[voiceAssistant] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Telnyx Webhook Handler ──
// Handles call.initiated events: answers the call and starts the AI assistant.
async function handleWebhook(req: Request, body: any): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const apiKey = secrets.get('TELNYX_API_KEY');

    const eventType = body.data?.event_type;
    const callControlId = body.data?.call_control_id;
    const fromNumber = body.data?.from;
    const toNumber = body.data?.to;

    console.log(`[voiceAssistant] Webhook: ${eventType} from ${fromNumber} to ${toNumber}`);

    if (eventType === 'call.initiated' && apiKey) {
      // Get the active assistant
      const va = await getActiveAssistant(svc);
      if (!va || !va.assistant_id || !va.enabled) {
        console.log('[voiceAssistant] No active/enabled assistant — ignoring call');
        return Response.json({ ok: true, ignored: true });
      }

      // Log the incoming call
      await svc.entities.AiVoiceSession.create({
        conversation_id: callControlId,
        persona_id: va.id,
        persona_name: va.assistant_name,
        to_number: toNumber,
        from_number: fromNumber,
        status: 'streaming',
        started_at: new Date().toISOString(),
      }).catch(() => {});

      // Update call count
      await svc.entities.VoiceAssistant.update(va.id, {
        total_calls: (va.total_calls || 0) + 1,
        last_call_at: new Date().toISOString(),
      }).catch(() => {});

      // Answer the call
      try {
        await telnyxFetch(`/calls/${callControlId}/actions/answer`, 'POST', apiKey, {});
        console.log('[voiceAssistant] Call answered');
      } catch (e) {
        console.error('[voiceAssistant] Answer failed:', e.message);
      }

      // Start the AI assistant on the call
      try {
        await telnyxFetch(`/calls/${callControlId}/actions/ai_assistant_start`, 'POST', apiKey, {
          assistant: { id: va.assistant_id },
        });
        console.log('[voiceAssistant] AI assistant started');
      } catch (e) {
        console.error('[voiceAssistant] AI assistant start failed:', e.message);
      }
    }

    // Handle call end
    if (eventType === 'call.hangup' && callControlId) {
      await svc.entities.AiVoiceSession.updateMany(
        { conversation_id: callControlId },
        { $set: { status: 'ended', ended_at: new Date().toISOString() } }
      ).catch(() => {});
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[voiceAssistant] Webhook error:', error.message);
    // Always return 200 so Telnyx doesn't retry
    return Response.json({ ok: true, error: error.message });
  }
}