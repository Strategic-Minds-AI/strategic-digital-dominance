import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// xtremeComms — Full Xtreme Communications platform integration.
// Calls the Xtreme Communications CaaS gateway endpoints (gatewayMessages,
// gatewayCalls, gatewayNumberSearch, managePhoneNumbers, manageCampaignOutreach,
// scrapeLeads, gatewayEmail, gatewayVerify, generateContent, etc.) using the
// tenant API key.
//
// Actions:
//   sendSms, sendMms, sendWhatsApp  — messaging
//   makeCall, startVoiceSession     — voice
//   searchNumbers, buyNumber, listNumbers, portNumber — phone numbers
//   sendCampaign                   — multi-channel campaign blast
//   scrapeLeads                    — lead scraper
//   sendEmail                      — transactional email
//   verifyNumber                   — phone number verification (HLR)
//   generateContent                — AI content generation
//   testConnection                 — test provider connection
//   getStatus                      — check API key validity
//
// Invoke: base44.functions.invoke('xtremeComms', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

import { generateText } from '../../shared/aiGateway.ts';

const API_BASE = 'https://xtreme-communications.com/api/functions';

async function gatewayCall(functionName, payload) {
  const apiKey = secrets.get('XTREME_COMMUNICATION_API_KEY');
  if (!apiKey) throw new Error('XTREME_COMMUNICATION_API_KEY not set');

  const url = `${API_BASE}/${functionName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, api_key: apiKey }),
    signal: AbortSignal.timeout(30000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Xtreme Comms API error (${res.status}): ${data.error || data.detail || data.message || res.statusText}`);
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
      // ── Messaging (sent directly via Telnyx for real delivery) ──
      case 'sendSms': {
        if (!body.to || !body.message) return Response.json({ error: 'to and message are required' }, { status: 400 });
        const telnyxKey = secrets.get('TELNYX_API_KEY');
        if (!telnyxKey) throw new Error('TELNYX_API_KEY not set');
        const fromNum = body.from || '+18337001239'; // toll-free automation line — requires Telnyx toll-free verification
        const txRes = await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${telnyxKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromNum,
            to: body.to,
            text: body.message,
            media_urls: body.mediaUrls || undefined,
          }),
          signal: AbortSignal.timeout(30000),
        });
        const txData = await txRes.json().catch(() => ({}));
        if (!txRes.ok) {
          const errMsg = txData.errors?.[0]?.detail || txData.errors?.[0]?.title || JSON.stringify(txData);
          throw new Error(`Telnyx SMS error (${txRes.status}): ${errMsg}`);
        }
        const msg = txData.data || {};
        result = {
          message_id: msg.id,
          status: msg.status || 'queued',
          routed_via: 'telnyx',
          to: msg.to,
          from: msg.from,
          text: msg.text,
        };
        await logSop(svc, 'sms_sent', `SMS sent to ${body.to} via Telnyx`, body.message.slice(0, 200));
        break;
      }

      case 'sendMms':
        if (!body.to || !body.message) return Response.json({ error: 'to and message are required' }, { status: 400 });
        result = await gatewayCall('gatewayMessages', { channel: 'mms', to: body.to, body: body.message, from: body.from, media_urls: body.mediaUrls, subject: body.subject });
        await logSop(svc, 'mms_sent', `MMS sent to ${body.to}`, body.message.slice(0, 200));
        break;

      case 'sendWhatsApp':
        if (!body.to || !body.message) return Response.json({ error: 'to and message are required' }, { status: 400 });
        result = await gatewayCall('gatewayMessages', { channel: 'whatsapp', to: body.to, body: body.message, from: body.from, template: body.template, media_urls: body.mediaUrls });
        await logSop(svc, 'whatsapp_sent', `WhatsApp sent to ${body.to}`, body.message.slice(0, 200));
        break;

      // ── Voice ──
      case 'makeCall':
        if (!body.to || !body.from) return Response.json({ error: 'to and from are required' }, { status: 400 });
        result = await gatewayCall('gatewayCalls', { to: body.to, from: body.from, agent_id: body.agentId, system_prompt: body.systemPrompt, voice: body.voice });
        await logSop(svc, 'voice_call', `Voice call to ${body.to}`, JSON.stringify({ agentId: body.agentId }));
        break;

      case 'startVoiceSession':
        result = await gatewayCall('orchestrateConversation', { to: body.to, from: body.from, agent_id: body.agentId, system_prompt: body.systemPrompt, context: body.context });
        await logSop(svc, 'voice_session', `Voice session started for ${body.to}`, JSON.stringify({ agentId: body.agentId }));
        break;

      // ── Phone Numbers (gatewayNumberSearch handles search/buy/list) ──
      case 'searchNumbers':
        result = await gatewayCall('gatewayNumberSearch', { action: 'search', country_code: body.country || 'US', area_code: body.areaCode, contains: body.searchPattern, limit: body.limit || 20, features: body.features || 'sms,voice' });
        break;

      case 'buyNumber':
        if (!body.phoneNumber) return Response.json({ error: 'phoneNumber (e164) is required' }, { status: 400 });
        result = await gatewayCall('gatewayNumberSearch', { action: 'buy', e164: body.phoneNumber, country_code: body.country || 'US' });
        await logSop(svc, 'number_purchased', `Purchased ${body.phoneNumber}`, '');
        break;

      case 'listNumbers':
        result = await gatewayCall('gatewayNumberSearch', { action: 'list' });
        break;

      case 'releaseNumber':
        if (!body.phoneNumber) return Response.json({ error: 'phoneNumber is required' }, { status: 400 });
        result = await gatewayCall('managePhoneNumbers', { action: 'release', e164: body.phoneNumber });
        await logSop(svc, 'number_released', `Released ${body.phoneNumber}`, '');
        break;

      // ── List + Validate + Log all my numbers (via Telnyx directly) ──
      case 'getMyNumbers': {
        const telnyxKey = secrets.get('TELNYX_API_KEY');
        if (!telnyxKey) throw new Error('TELNYX_API_KEY not set');

        // List all provisioned numbers from Telnyx
        const telnyxRes = await fetch('https://api.telnyx.com/v2/phone_numbers?status=enabled&records_per_page=50', {
          headers: {
            'Authorization': `Bearer ${telnyxKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!telnyxRes.ok) {
          const errData = await telnyxRes.json().catch(() => ({}));
          throw new Error(`Telnyx API error (${telnyxRes.status}): ${errData.errors?.[0]?.detail || telnyxRes.statusText}`);
        }
        const telnyxData = await telnyxRes.json();
        const rawNumbers = telnyxData.data || [];

        // Validate each number and log to system
        const validated = [];
        for (const num of rawNumbers) {
          const phone = num.phone_number;
          if (!phone) continue;
          const features = num.features ? Object.keys(num.features).filter(k => num.features[k] !== false) : ['sms', 'voice'];
          try {
            // Validate via Telnyx phone number validation API
            const verifyRes = await fetch('https://api.telnyx.com/v2/phone_number_validation', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${telnyxKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ phone_number: phone }),
              signal: AbortSignal.timeout(10000),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            const vr = verifyData.data || {};
            const isValid = vr.valid !== false;
            validated.push({
              phone,
              verified: isValid,
              carrier: vr.carrier?.name || vr.carrier_name || 'unknown',
              status: isValid ? 'valid' : 'invalid',
              country: vr.country_code || num.country_code || 'US',
              features,
              lineType: vr.line_type || 'unknown',
              portability: vr.portability_status || 'unknown',
            });
            await logSop(svc, 'number_validated', `Validated ${phone} — ${isValid ? 'valid' : 'invalid'} (${vr.carrier?.name || 'unknown'})`, JSON.stringify(vr).slice(0, 200));
          } catch (e) {
            validated.push({
              phone,
              verified: false,
              error: e.message,
              country: num.country_code || 'US',
              features,
            });
            await logSop(svc, 'number_validation_failed', `Validation failed for ${phone}`, e.message);
          }
        }

        result = { numbers: validated, total: validated.length, verified_count: validated.filter(n => n.verified).length };
        break;
      }

      // ── Campaigns ──
      case 'sendCampaign':
        if (!body.contacts || !body.message) return Response.json({ error: 'contacts and message are required' }, { status: 400 });
        result = await gatewayCall('manageCampaignOutreach', { contacts: body.contacts, message: body.message, channels: body.channels || ['sms'], schedule_at: body.scheduleAt, campaign_name: body.campaignName });
        await logSop(svc, 'campaign_sent', `Campaign sent to ${body.contacts.length} contacts`, body.message.slice(0, 200));
        break;

      // ── Lead Scraping ──
      case 'scrapeLeads':
        if (!body.industry && !body.keyword) return Response.json({ error: 'industry or keyword is required' }, { status: 400 });
        result = await gatewayCall('scrapeLeads', { industry: body.industry, keyword: body.keyword, location: body.location, radius: body.radius || 25, limit: body.limit || 50 });
        await logSop(svc, 'leads_scraped', `Scraped leads: ${body.industry || body.keyword} in ${body.location || 'all'}`, '');
        break;

      // ── Email ──
      case 'sendEmail':
        if (!body.to || !body.subject) return Response.json({ error: 'to and subject are required' }, { status: 400 });
        result = await gatewayCall('gatewayEmail', { to: body.to, subject: body.subject, body: body.body, html: body.html, from: body.from });
        await logSop(svc, 'email_sent', `Email sent to ${body.to}`, body.subject);
        break;

      // ── Verification (via Telnyx directly) ──
      case 'verifyNumber': {
        if (!body.phoneNumber) return Response.json({ error: 'phoneNumber is required' }, { status: 400 });
        const telnyxKey = secrets.get('TELNYX_API_KEY');
        if (!telnyxKey) throw new Error('TELNYX_API_KEY not set');
        const verifyRes = await fetch('https://api.telnyx.com/v2/phone_number_validation', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${telnyxKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone_number: body.phoneNumber }),
          signal: AbortSignal.timeout(10000),
        });
        const verifyData = await verifyRes.json().catch(() => ({}));
        const vr = verifyData.data || {};
        result = {
          phone: body.phoneNumber,
          verified: vr.valid !== false,
          carrier: vr.carrier?.name || vr.carrier_name || 'unknown',
          status: vr.valid !== false ? 'valid' : 'invalid',
          country: vr.country_code || 'unknown',
          lineType: vr.line_type || 'unknown',
          portability: vr.portability_status || 'unknown',
        };
        await logSop(svc, 'number_validated', `Validated ${body.phoneNumber} — ${result.status}`, JSON.stringify(vr).slice(0, 200));
        break;
      }

      // ── Content Generation ──
      case 'generateContent': {
        if (!body.prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });
        const { text: genContent } = await generateText({
          prompt: body.prompt,
          system_prompt: `You are a content generator for Xtreme Polishing Systems, a premium garage floor coating company. Generate ${body.contentType || 'sms'} content${body.tone ? ` with a ${body.tone} tone` : ''}. Brand: Xtreme Polishing Systems. Phone: 1-833-700-1239. Website: epoxyquotenearme.com. Keep it concise, compelling, and actionable.`,
        });
        result = { content: genContent, content_type: body.contentType || 'sms' };
        await logSop(svc, 'content_generated', `Generated ${body.contentType || 'sms'} content via AI Gateway`, body.prompt.slice(0, 200));
        break;
      }

      // ── Creative Media ──
      case 'generateMedia':
        if (!body.prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });
        result = await gatewayCall('generateCreativeMedia', { prompt: body.prompt, media_type: body.mediaType || 'image', brand_id: body.brandId });
        await logSop(svc, 'media_generated', `Generated ${body.mediaType || 'image'} media`, body.prompt.slice(0, 200));
        break;

      // ── Status (search numbers to validate API key) ──
      case 'getStatus':
        try {
          result = await gatewayCall('gatewayNumberSearch', { action: 'search', country_code: 'US', limit: 1 });
        } catch (e) {
          result = { connected: false, error: e.message };
        }
        break;

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ ok: true, action, result });
  } catch (error) {
    console.error('[xtremeComms] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}