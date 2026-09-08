import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// xtremeComms — Multi-channel communication gateway.
// Integrates with the Xtreme Communications platform (xtreme-communications.com)
// for SMS, MMS, WhatsApp, voice calls, and campaign management.
//
// Actions:
//   sendSms       — send an SMS message
//   sendWhatsApp  — send a WhatsApp business message
//   makeCall      — initiate an AI voice call
//   buyNumber     — purchase a phone number
//   listNumbers   — list purchased phone numbers
//   sendCampaign  — send a multi-channel campaign blast
//   getStatus     — check API connection status
//
// Invoke: base44.functions.invoke('xtremeComms', { action, to, message, ... })
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://xtreme-communications.com/api';

async function apiCall(endpoint, method, payload) {
  const apiKey = secrets.get('XTREME_COMMUNICATION_API_KEY');
  if (!apiKey) throw new Error('XTREME_COMMUNICATION_API_KEY not set');

  const url = `${API_BASE}${endpoint}`;
  const options: any = {
    method: method || 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(30000),
  };
  if (payload && method !== 'GET') {
    options.body = JSON.stringify(payload);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Xtreme Comms API error (${res.status}): ${data.error || data.message || res.statusText}`);
  }
  return data;
}

async function logSop(svc, action, description, detail) {
  await svc.entities.SopLog.create({
    category: 'integration',
    action,
    description,
    detail: detail || '',
    source: 'xtremeComms',
  }).catch(() => {});
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'getStatus';

    let result;

    switch (action) {
      case 'sendSms': {
        if (!body.to || !body.message) return Response.json({ error: 'to and message are required' }, { status: 400 });
        result = await apiCall('/sms/send', 'POST', {
          to: body.to,
          message: body.message,
          from: body.from || undefined,
          media_urls: body.mediaUrls || undefined,
        });
        await logSop(svc, 'sms_sent', `SMS sent to ${body.to}`, body.message.slice(0, 200));
        break;
      }

      case 'sendWhatsApp': {
        if (!body.to || !body.message) return Response.json({ error: 'to and message are required' }, { status: 400 });
        result = await apiCall('/whatsapp/send', 'POST', {
          to: body.to,
          message: body.message,
          template: body.template || undefined,
          media_url: body.mediaUrl || undefined,
        });
        await logSop(svc, 'whatsapp_sent', `WhatsApp message sent to ${body.to}`, body.message.slice(0, 200));
        break;
      }

      case 'makeCall': {
        if (!body.to) return Response.json({ error: 'to is required' }, { status: 400 });
        result = await apiCall('/voice/call', 'POST', {
          to: body.to,
          from: body.from || undefined,
          agent_id: body.agentId || undefined,
          system_prompt: body.systemPrompt || undefined,
          voice: body.voice || undefined,
        });
        await logSop(svc, 'voice_call', `Voice call initiated to ${body.to}`, JSON.stringify({ agentId: body.agentId }));
        break;
      }

      case 'buyNumber': {
        if (!body.areaCode && !body.country) return Response.json({ error: 'areaCode or country is required' }, { status: 400 });
        result = await apiCall('/numbers/buy', 'POST', {
          area_code: body.areaCode || undefined,
          country: body.country || 'US',
          search_pattern: body.searchPattern || undefined,
        });
        await logSop(svc, 'number_purchased', `Purchased phone number`, JSON.stringify(result).slice(0, 500));
        break;
      }

      case 'listNumbers': {
        result = await apiCall('/numbers', 'GET', null);
        break;
      }

      case 'sendCampaign': {
        if (!body.contacts || !body.message) return Response.json({ error: 'contacts and message are required' }, { status: 400 });
        result = await apiCall('/campaigns/send', 'POST', {
          contacts: body.contacts,
          message: body.message,
          channels: body.channels || ['sms'],
          schedule_at: body.scheduleAt || undefined,
        });
        await logSop(svc, 'campaign_sent', `Campaign sent to ${body.contacts.length} contacts via ${JSON.stringify(body.channels || ['sms'])}`,
          body.message.slice(0, 200));
        break;
      }

      case 'getStatus': {
        try {
          result = await apiCall('/account/status', 'GET', null);
        } catch (e) {
          result = { connected: false, error: e.message };
        }
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ ok: true, action, result });
  } catch (error) {
    console.error('[xtremeComms] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}