import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';
import { generateText } from '../../shared/aiGateway.ts';

// ═══════════════════════════════════════════════════════════════════════════
// skipTrace — Ultra-advanced skip tracing system.
//
// Finds property owner contact info (name, phone, email, mailing address)
// from a property address using multi-source cross-referencing:
//   1. RentCast API — county tax-assessor records (owner name, mailing address)
//   2. AI Web Search (Gemini) — public records, directories, social media
//   3. Cross-validation + confidence scoring
//
// Actions:
//   trace  — skip trace a single address or lead_id
//   batch  — process all leads with addresses but no phone/email (autonomous batch)
//   list   — list recent traces
//   stats  — dashboard stats
//
// Invoke: base44.functions.invoke('skipTrace', { action, address?, lead_id?, limit? })
// ═══════════════════════════════════════════════════════════════════════════

const RENTCAST_URL = 'https://api.rentcast.io/v1/properties';

function normalizeAddress(addr: string): string {
  return (addr || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/#/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function deterministicId(addr: string): string {
  const normalized = normalizeAddress(addr);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `st_${Math.abs(hash).toString(36)}`;
}

// ── Source 1: RentCast property records ──────────────────────────────────
async function rentcastTrace(address: string, apiKey: string): Promise<any> {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = `${RENTCAST_URL}?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'X-Api-Key': apiKey },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const prop = Array.isArray(data) ? data[0] : data;
    if (!prop) return null;

    // RentCast returns owner info in the 'owner' object when available
    const owner = prop.owner || {};
    const ownerName = (owner.name || prop.ownerName || '').trim();
    const mailingAddress = (owner.mailingAddress || prop.ownerMailingAddress || '').trim();

    return {
      source: 'rentcast',
      owner_name: ownerName || null,
      owner_mailing_address: mailingAddress || null,
      property_type: prop.propertyType || null,
      year_built: prop.yearBuilt || null,
      sqft: prop.squareFootage || null,
      county: prop.county || null,
      matched_address: prop.formattedAddress || null,
      latitude: prop.latitude || null,
      longitude: prop.longitude || null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Source 2: AI Web Search ──────────────────────────────────────────────
async function webSearchTrace(address: string, ownerName: string | null): Promise<any> {
  try {
    const searchQuery = ownerName
      ? `"${ownerName}" ${address} phone OR email OR contact`
      : `${address} property owner contact phone`;

    const { parsed: res } = await generateText({
      prompt: `You are an ultra-advanced skip tracing AI. Find the property owner's contact information for this address: "${address}".
${ownerName ? `The county tax records say the owner is: "${ownerName}".` : ''}

Search public records, people search directories, social media, and any available online sources to find:
1. Owner's full name (confirm or correct)
2. Owner's phone number(s)
3. Owner's email address(es)
4. Owner's mailing address (if different from property — absentee owner)

Be factual. Only return contact info you have reasonable confidence in. If you cannot find something, return null for that field.

Return JSON with:
- owner_name: confirmed/corrected owner name or null
- phone_numbers: array of phone numbers found
- emails: array of email addresses found
- mailing_address: mailing address if different from property or null
- confidence: "high" (multiple sources agree), "medium" (single source), "low" (uncertain), "none"
- sources: array of source types used (e.g. "public_records", "social_media", "people_directory")`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          owner_name: { type: 'string' },
          phone_numbers: { type: 'array', items: { type: 'string' } },
          emails: { type: 'array', items: { type: 'string' } },
          mailing_address: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low', 'none'] },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return {
      source: 'web_search',
      owner_name: (res as any)?.owner_name || null,
      phone_numbers: (res as any)?.phone_numbers || [],
      emails: (res as any)?.emails || [],
      mailing_address: (res as any)?.mailing_address || null,
      confidence: (res as any)?.confidence || 'none',
      search_sources: (res as any)?.sources || [],
    };
  } catch {
    return null;
  }
}

// ── Cross-validate and merge sources ─────────────────────────────────────
function mergeResults(rentcast: any, web: any): any {
  const sourcesFound: string[] = [];
  if (rentcast) sourcesFound.push('rentcast');
  if (web) sourcesFound.push('web_search');

  // Owner name: prefer RentCast (tax records), fall back to web
  const ownerName = rentcast?.owner_name || web?.owner_name || null;

  // Mailing address: prefer RentCast, fall back to web
  const mailingAddress = rentcast?.owner_mailing_address || web?.mailing_address || null;

  // Phone: from web search only (RentCast doesn't provide phone)
  const phoneNumbers = web?.phone_numbers || [];

  // Email: from web search only
  const emails = web?.emails || [];

  // Property details from RentCast
  const propertyDetails = rentcast ? JSON.stringify({
    property_type: rentcast.property_type,
    year_built: rentcast.year_built,
    sqft: rentcast.sqft,
    county: rentcast.county,
    matched_address: rentcast.matched_address,
    latitude: rentcast.latitude,
    longitude: rentcast.longitude,
  }) : null;

  // Confidence scoring
  let confidence = 'none';
  if (phoneNumbers.length > 0 && emails.length > 0 && ownerName) {
    confidence = 'high';
  } else if ((phoneNumbers.length > 0 || emails.length > 0) && ownerName) {
    confidence = 'medium';
  } else if (ownerName || mailingAddress) {
    confidence = 'low';
  }

  const status = (phoneNumbers.length > 0 || emails.length > 0) ? 'traced' : (ownerName ? 'traced' : 'not_found');

  return {
    owner_name: ownerName,
    owner_mailing_address: mailingAddress,
    phone_numbers: phoneNumbers,
    emails,
    property_details: propertyDetails,
    confidence,
    sources_found: sourcesFound,
    status,
  };
}

// ── Single trace ──────────────────────────────────────────────────────────
async function doTrace(base44: any, address: string, leadId: string | null): Promise<any> {
  const svc = base44.asServiceRole;
  const traceId = deterministicId(address);
  const normalized = normalizeAddress(address);

  // Check cache
  const existing = await svc.entities.SkipTrace.filter({ trace_id: traceId }, '-created_date', 1);
  if (existing && existing.length > 0 && existing[0].status === 'traced') {
    return { ...existing[0], cached: true };
  }

  // Create/update pending record
  let traceRecord = existing?.[0];
  if (!traceRecord) {
    traceRecord = await svc.entities.SkipTrace.create({
      trace_id: traceId,
      address: normalized,
      lead_id: leadId,
      status: 'pending',
    });
  }

  const rentcastKey = secrets.get('RENTCAST_API_KEY');

  const [rentcast, web] = await Promise.all([
    rentcastTrace(address, rentcastKey).catch(() => null),
    webSearchTrace(address, rentcast?.owner_name || null).catch(() => null),
  ]);

  const merged = mergeResults(rentcast, web);

  await svc.entities.SkipTrace.update(traceRecord.id, {
    owner_name: merged.owner_name,
    owner_mailing_address: merged.owner_mailing_address,
    phone_numbers: merged.phone_numbers,
    emails: merged.emails,
    property_details: merged.property_details,
    confidence: merged.confidence,
    sources_found: merged.sources_found,
    status: merged.status,
    traced_at: new Date().toISOString(),
  });

  // If linked to a lead, update the lead with found contact info
  if (leadId && (merged.phone_numbers.length > 0 || merged.emails.length > 0)) {
    try {
      const lead = await svc.entities.Lead.get(leadId);
      if (lead) {
        const update: any = {};
        if (!lead.phone && merged.phone_numbers.length > 0) update.phone = merged.phone_numbers[0];
        if (!lead.email && merged.emails.length > 0) update.email = merged.emails[0];
        if (Object.keys(update).length > 0) {
          await svc.entities.Lead.update(leadId, update);
        }
      }
    } catch {}
  }

  return { trace_id: traceId, address: normalized, ...merged, cached: false };
}

// ── Batch trace (autonomous) ──────────────────────────────────────────────
async function doBatch(base44: any, limit: number = 25): Promise<any> {
  const svc = base44.asServiceRole;
  const batchId = `batch-${Date.now()}`;
  const now = new Date().toISOString();

  // Find leads with an address but no phone AND no email — these need skip tracing
  const leads = await svc.entities.Lead.list(500);
  const needsTrace = leads.filter((l: any) => {
    const hasAddress = l.address || (l.city && l.state);
    const hasContact = l.phone || l.email;
    return hasAddress && !hasContact;
  }).slice(0, limit);

  const results: any[] = [];
  let traced = 0;
  let notFound = 0;
  let errors = 0;

  for (const lead of needsTrace) {
    const address = lead.address || `${lead.city}, ${lead.state}`;
    try {
      const result = await doTrace(base44, address, lead.id);
      results.push({
        lead_id: lead.id,
        lead_name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
        address,
        status: result.status,
        confidence: result.confidence,
        phones_found: result.phone_numbers?.length || 0,
        emails_found: result.emails?.length || 0,
      });
      if (result.status === 'traced') traced++;
      else notFound++;
    } catch (e: any) {
      errors++;
      results.push({ lead_id: lead.id, address, status: 'error', error: e.message });
    }
  }

  return {
    batch_id: batchId,
    started_at: now,
    completed_at: new Date().toISOString(),
    total_queued: needsTrace.length,
    traced,
    not_found: notFound,
    errors,
    results,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'trace';

    switch (action) {
      case 'trace': {
        if (!body.address && !body.lead_id) {
          return Response.json({ error: 'address or lead_id required' }, { status: 400 });
        }
        let address = body.address;
        let leadId = body.lead_id || null;
        if (!address && leadId) {
          const lead = await base44.asServiceRole.entities.Lead.get(leadId);
          if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });
          address = lead.address || `${lead.city}, ${lead.state}`;
        }
        const result = await doTrace(base44, address, leadId);
        return Response.json({ ok: true, ...result });
      }

      case 'batch': {
        const limit = Math.min(body.limit || 25, 50);
        const result = await doBatch(base44, limit);
        return Response.json({ ok: true, ...result });
      }

      case 'list': {
        const traces = await base44.asServiceRole.entities.SkipTrace.list(
          '-traced_at',
          body.limit || 50
        );
        return Response.json({ ok: true, traces });
      }

      case 'stats': {
        const all = await base44.asServiceRole.entities.SkipTrace.list(500);
        const traced = all.filter((t: any) => t.status === 'traced').length;
        const notFound = all.filter((t: any) => t.status === 'not_found').length;
        const pending = all.filter((t: any) => t.status === 'pending').length;
        const withPhone = all.filter((t: any) => (t.phone_numbers || []).length > 0).length;
        const withEmail = all.filter((t: any) => (t.emails || []).length > 0).length;
        const highConfidence = all.filter((t: any) => t.confidence === 'high').length;

        // Count leads needing trace
        const leads = await base44.asServiceRole.entities.Lead.list(500);
        const needsTrace = leads.filter((l: any) => {
          const hasAddress = l.address || (l.city && l.state);
          const hasContact = l.phone || l.email;
          return hasAddress && !hasContact;
        }).length;

        return Response.json({
          ok: true,
          total_traces: all.length,
          traced,
          not_found: notFound,
          pending,
          with_phone: withPhone,
          with_email: withEmail,
          high_confidence: highConfidence,
          leads_needing_trace: needsTrace,
        });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[skipTrace] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}