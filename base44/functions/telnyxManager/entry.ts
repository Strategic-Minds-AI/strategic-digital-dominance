import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// telnyxManager — Direct Telnyx API integration for phone number management,
// messaging, and messaging profile setup.
//
// Actions:
//   listNumbers          — list all provisioned phone numbers
//   searchNumbers        — search available phone numbers to buy
//   buyNumber            — purchase a phone number
//   releaseNumber        — release (delete) a phone number
//   getNumberDetail      — get details for a specific number
//   sendSms              — send an SMS message
//   listMessages         — list recent messages (history)
//   getMessage           — get a specific message's delivery status
//   verifyNumber          — validate a phone number (HLR lookup)
//   listProfiles         — list messaging profiles
//   createProfile         — create a messaging profile
//   updateProfile         — update a messaging profile
//   assignNumberProfile   — assign a number to a messaging profile
//
// Invoke: base44.functions.invoke('telnyxManager', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.telnyx.com/v2';

async function telnyxFetch(path: string, options: any = {}) {
  const apiKey = secrets.get('TELNYX_API_KEY');
  if (!apiKey) throw new Error('TELNYX_API_KEY not set — add it in Settings → Secrets');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(options.timeout || 30000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data.errors?.[0];
    throw new Error(err?.detail || err?.title || `Telnyx API error (${res.status})`);
  }
  return data;
}

function logSop(svc: any, action: string, description: string, detail = '') {
  return svc.entities.SopLog.create({
    category: 'integration',
    action,
    description,
    detail,
    source: 'telnyxManager',
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
    const action = body.action || 'listNumbers';

    let result;

    switch (action) {
      // ── Phone Number Management ──
      case 'listNumbers': {
        const data = await telnyxFetch('/phone_numbers?records_per_page=100');
        const numbers = (data.data || []).map((n: any) => ({
          id: n.id,
          phone_number: n.phone_number,
          formatted: n.phone_number,
          status: n.status,
          country_code: n.country_code,
          features: n.features ? Object.keys(n.features).filter((k: string) => n.features[k] !== false) : [],
          messaging_profile_id: n.messaging_profile_id || n.messaging_product?.messaging_profile_id || null,
          messaging_profile_name: n.messaging_profile_name || null,
          connection_id: n.connection_id || null,
          purchased_at: n.created_at,
        }));
        result = { numbers, total: numbers.length };
        break;
      }

      case 'getNumberDetail': {
        if (!body.numberId) return Response.json({ error: 'numberId is required' }, { status: 400 });
        const data = await telnyxFetch(`/phone_numbers/${body.numberId}`);
        result = data.data;
        break;
      }

      case 'searchNumbers': {
        const params = new URLSearchParams();
        params.set('limit', String(body.limit || 20));
        if (body.countryCode) params.set('country_code', body.countryCode || 'US');
        if (body.areaCode) params.set('area_code', body.areaCode);
        if (body.contains) params.set('contains', body.contains);
        if (body.features) params.set('features', body.features); // e.g. 'sms,voice'
        const data = await telnyxFetch(`/available_phone_numbers?${params.toString()}`);
        result = {
          numbers: (data.data || []).map((n: any) => ({
            phone_number: n.phone_number,
            country_code: n.country_code,
            features: n.features ? Object.keys(n.features) : [],
            cost: n.cost,
            monthly_cost: n.monthly_cost || null,
          })),
          total: (data.data || []).length,
        };
        break;
      }

      case 'buyNumber': {
        if (!body.phoneNumber) return Response.json({ error: 'phoneNumber (e164) is required' }, { status: 400 });
        const data = await telnyxFetch('/actions/buy', {
          method: 'POST',
          body: JSON.stringify({
            phone_number: body.phoneNumber,
            messaging_profile_id: body.messagingProfileId || undefined,
          }),
        });
        result = data.data;
        await logSop(svc, 'number_purchased', `Purchased ${body.phoneNumber}`, JSON.stringify(data.data).slice(0, 200));
        break;
      }

      case 'releaseNumber': {
        if (!body.numberId) return Response.json({ error: 'numberId is required' }, { status: 400 });
        await telnyxFetch(`/phone_numbers/${body.numberId}`, { method: 'DELETE' });
        result = { released: true, numberId: body.numberId };
        await logSop(svc, 'number_released', `Released number ${body.numberId}`, '');
        break;
      }

      // ── Messaging ──
      case 'sendSms': {
        if (!body.to || !body.text) return Response.json({ error: 'to and text are required' }, { status: 400 });
        const data = await telnyxFetch('/messages', {
          method: 'POST',
          body: JSON.stringify({
            from: body.from,
            to: body.to,
            text: body.text,
            media_urls: body.mediaUrls || undefined,
            messaging_profile_id: body.messagingProfileId || undefined,
          }),
        });
        result = {
          message_id: data.data?.id,
          status: data.data?.status,
          to: data.data?.to,
          from: data.data?.from,
          text: data.data?.text,
        };
        await logSop(svc, 'sms_sent', `SMS sent to ${body.to} from ${body.from}`, body.text.slice(0, 200));
        break;
      }

      case 'listMessages': {
        const params = new URLSearchParams();
        params.set('records_per_page', String(body.limit || 25));
        if (body.pageNumber) params.set('page_number', String(body.pageNumber));
        if (body.direction) params.set('direction', body.direction); // 'inbound' | 'outbound'
        const data = await telnyxFetch(`/messages?${params.toString()}`);
        result = {
          messages: (data.data || []).map((m: any) => ({
            id: m.id,
            direction: m.direction,
            from: m.from,
            to: m.to?.[0]?.phone_number || m.to,
            text: m.text,
            status: m.to?.[0]?.status || m.status,
            cost: m.cost,
            segments: m.segments,
            created_at: m.created_at,
            error: m.errors?.[0]?.detail || null,
          })),
          total: data.meta?.total_count || (data.data || []).length,
        };
        break;
      }

      case 'getMessage': {
        if (!body.messageId) return Response.json({ error: 'messageId is required' }, { status: 400 });
        const data = await telnyxFetch(`/messages/${body.messageId}`);
        result = data.data;
        break;
      }

      // ── Verification ──
      case 'verifyNumber': {
        if (!body.phoneNumber) return Response.json({ error: 'phoneNumber is required' }, { status: 400 });
        const data = await telnyxFetch('/phone_number_validation', {
          method: 'POST',
          body: JSON.stringify({ phone_number: body.phoneNumber }),
        });
        const vr = data.data || {};
        result = {
          phone: body.phoneNumber,
          valid: vr.valid !== false,
          carrier: vr.carrier?.name || vr.carrier_name || 'unknown',
          country_code: vr.country_code || 'unknown',
          line_type: vr.line_type || 'unknown',
          portability: vr.portability_status || 'unknown',
        };
        await logSop(svc, 'number_validated', `Validated ${body.phoneNumber} — ${vr.valid !== false ? 'valid' : 'invalid'}`, JSON.stringify(vr).slice(0, 200));
        break;
      }

      // ── Messaging Profiles (required for SMS to work) ──
      case 'listProfiles': {
        const data = await telnyxFetch('/messaging_profiles?records_per_page=50');
        result = {
          profiles: (data.data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            enabled: p.enabled,
            record_type: p.record_type,
            created_at: p.created_at,
          })),
        };
        break;
      }

      case 'createProfile': {
        if (!body.name) return Response.json({ error: 'name is required' }, { status: 400 });
        const data = await telnyxFetch('/messaging_profiles', {
          method: 'POST',
          body: JSON.stringify({
            name: body.name,
            enabled: body.enabled !== false,
            webhook_url: body.webhookUrl || undefined,
            webhook_failover_url: body.webhookFailoverUrl || undefined,
          }),
        });
        result = data.data;
        await logSop(svc, 'profile_created', `Created messaging profile "${body.name}"`, JSON.stringify(data.data).slice(0, 200));
        break;
      }

      case 'updateProfile': {
        if (!body.profileId) return Response.json({ error: 'profileId is required' }, { status: 400 });
        const updateBody: any = {};
        if (body.name) updateBody.name = body.name;
        if (body.enabled !== undefined) updateBody.enabled = body.enabled;
        if (body.webhookUrl !== undefined) updateBody.webhook_url = body.webhookUrl;
        const data = await telnyxFetch(`/messaging_profiles/${body.profileId}`, {
          method: 'PATCH',
          body: JSON.stringify(updateBody),
        });
        result = data.data;
        await logSop(svc, 'profile_updated', `Updated messaging profile ${body.profileId}`, JSON.stringify(updateBody));
        break;
      }

      case 'assignNumberProfile': {
        if (!body.numberId || !body.profileId) return Response.json({ error: 'numberId and profileId are required' }, { status: 400 });
        const data = await telnyxFetch(`/phone_numbers/${body.numberId}`, {
          method: 'PATCH',
          body: JSON.stringify({ messaging_product: { messaging_profile_id: body.profileId } }),
        });
        result = data.data;
        await logSop(svc, 'number_assigned', `Assigned number ${body.numberId} to profile ${body.profileId}`, '');
        break;
      }

      // ── Compliance Audit ──
      case 'getAudit': {
        const numbersRes = await telnyxFetch('/phone_numbers?records_per_page=100');
        const profilesRes = await telnyxFetch('/messaging_profiles?records_per_page=50');
        const brandsRes = await telnyxFetch('/10dlc/brand');

        const numbers = (numbersRes.data || []).map((n: any) => ({
          id: n.id, phone: n.phone_number, type: n.phone_number_type, status: n.status,
          messaging_profile_id: n.messaging_profile_id, messaging_profile_name: n.messaging_profile_name,
          country: n.country_iso_alpha2,
        }));
        const profiles = (profilesRes.data || []).map((p: any) => ({ id: p.id, name: p.name, enabled: p.enabled, webhook_url: p.webhook_url }));
        const brands = (brandsRes.records || brandsRes.data?.records || []).map((b: any) => ({
          brandId: b.brandId, tcrBrandId: b.tcrBrandId, companyName: b.companyName, displayName: b.displayName,
          identityStatus: b.identityStatus, status: b.status, assignedCampaignsCount: b.assignedCampaignsCount,
        }));

        // Campaigns for verified brands
        const verifiedBrands = brands.filter((b: any) => b.identityStatus === 'VERIFIED');
        let campaigns: any[] = [];
        for (const brand of verifiedBrands) {
          try {
            const campRes = await telnyxFetch(`/10dlc/campaign?brandId=${brand.brandId}&records_per_page=50`);
            campaigns.push(...(campRes.records || campRes.data?.records || []).map((c: any) => ({
              campaignId: c.campaignId, tcrCampaignId: c.tcrCampaignId, usecase: c.usecase, status: c.status,
            })));
          } catch { /* skip */ }
        }

        // Toll-free verifications
        let tollfreeVerifications: any[] = [];
        try {
          const tfvRes = await telnyxFetch('/messaging_tollfree/verification/requests?page=1&page_size=50');
          tollfreeVerifications = (tfvRes.records || tfvRes.data?.records || []).map((v: any) => ({
            id: v.id, businessName: v.businessName, verificationStatus: v.verificationStatus,
            reason: v.reason, phoneNumbers: (v.phoneNumbers || []).map((p: any) => p.phoneNumber),
          }));
        } catch { /* skip */ }

        result = { numbers, profiles, brands, verifiedBrands, campaigns, tollfreeVerifications };
        break;
      }

      // ── 10DLC Campaign ──
      case 'createCampaign': {
        if (!body.brandId) return Response.json({ error: 'brandId is required' }, { status: 400 });
        const data = await telnyxFetch('/10dlc/campaignBuilder', {
          method: 'POST',
          body: JSON.stringify({ brandId: body.brandId, ...body.campaignData }),
        });
        result = data.data;
        await logSop(svc, 'campaign_created', `Created 10DLC campaign`, JSON.stringify(body.campaignData).slice(0, 200));
        break;
      }

      case 'assignNumberToCampaign': {
        if (!body.phoneNumber || !body.campaignId) return Response.json({ error: 'phoneNumber and campaignId are required' }, { status: 400 });
        const data = await telnyxFetch('/10dlc/phoneNumberCampaign', {
          method: 'POST',
          body: JSON.stringify({ phoneNumber: body.phoneNumber, campaignId: body.campaignId }),
        });
        result = data.data;
        await logSop(svc, 'number_assigned_campaign', `Assigned ${body.phoneNumber} to campaign ${body.campaignId}`, '');
        break;
      }

      // ── Toll-Free Verification ──
      case 'listTollFreeVerifications': {
        const data = await telnyxFetch('/messaging_tollfree/verification/requests?page=1&page_size=50');
        result = {
          verifications: (data.data?.records || []).map((v: any) => ({
            id: v.id, businessName: v.businessName, verificationStatus: v.verificationStatus,
            reason: v.reason, phoneNumbers: (v.phoneNumbers || []).map((p: any) => p.phoneNumber),
            useCase: v.useCase, createdAt: v.createdAt,
          })),
        };
        break;
      }

      case 'submitTollFreeVerification': {
        const data = await telnyxFetch('/messaging_tollfree/verification/requests', {
          method: 'POST',
          body: JSON.stringify(body.verificationData),
        });
        result = data.data;
        await logSop(svc, 'tfv_submitted', 'Submitted toll-free verification', JSON.stringify(body.verificationData).slice(0, 200));
        break;
      }

      case 'updateTollFreeVerification': {
        if (!body.verificationId) return Response.json({ error: 'verificationId is required' }, { status: 400 });
        const data = await telnyxFetch(`/messaging_tollfree/verification/requests/${body.verificationId}`, {
          method: 'PATCH',
          body: JSON.stringify(body.verificationData),
        });
        result = data.data;
        await logSop(svc, 'tfv_updated', `Updated toll-free verification ${body.verificationId}`, JSON.stringify(body.verificationData).slice(0, 200));
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ ok: true, action, result });
  } catch (error) {
    console.error('[telnyxManager] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}