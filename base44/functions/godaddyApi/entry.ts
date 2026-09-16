import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ════════════════════════════════════════════════════════════════
// godaddyApi — Full GoDaddy API wrapper for domain management.
// Supports: list/get domains, availability, DNS record CRUD,
// domain purchase, and legal agreements.
//
// Auth: GoDaddy Personal Access Token (PAT) via Bearer header.
// Invoke: base44.functions.invoke('godaddyApi', { action, ... })
// ════════════════════════════════════════════════════════════════

const GODADDY_BASE = 'https://api.godaddy.com/v1';

async function godaddyFetch(path: string, method: string, token: string, body?: any): Promise<any> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const opts: RequestInit = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${GODADDY_BASE}${path}`, opts);
  const text = await res.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    return { _error: true, status: res.status, body: parsed };
  }
  return parsed;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const token = secrets.get('GODADDY_API_KEY');
    if (!token) return Response.json({ error: 'GODADDY_API_KEY secret is not set' }, { status: 500 });

    const body = await req.json();
    const { action } = body;
    if (!action) return Response.json({ error: 'action is required' }, { status: 400 });

    let result: any;

    switch (action) {
      // ── Domain listing & details ──
      case 'listDomains': {
        const statuses = body.statuses ? `?statuses=${encodeURIComponent(body.statuses)}` : '';
        result = await godaddyFetch(`/domains${statuses}`, 'GET', token);
        break;
      }
      case 'getDomain': {
        if (!body.domain) return Response.json({ error: 'domain is required' }, { status: 400 });
        result = await godaddyFetch(`/domains/${body.domain}`, 'GET', token);
        break;
      }

      // ── Availability & purchase ──
      case 'checkAvailability': {
        if (!body.domain) return Response.json({ error: 'domain is required' }, { status: 400 });
        result = await godaddyFetch(`/domains/available?domain=${encodeURIComponent(body.domain)}`, 'GET', token);
        break;
      }
      case 'getAgreements': {
        const tlds = body.tlds || ['com'];
        const privacy = body.forTransfer ? '?privacy=false' : '';
        result = await godaddyFetch(`/legal/agreements/domain/purchase${privacy}`, 'GET', token);
        break;
      }
      case 'purchaseDomain': {
        if (!body.domain) return Response.json({ error: 'domain is required' }, { status: 400 });
        // body should contain: { domain, period: 1, nameServers, contacts: { registrant, tech, admin, billing } }
        const purchaseBody = {
          domain: body.domain,
          period: body.period || 1,
          nameServers: body.nameServers || ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'],
          renewAuto: body.renewAuto !== undefined ? body.renewAuto : true,
          privacy: body.privacy !== undefined ? body.privacy : true,
          contactRegistrant: body.contacts?.registrant || body.contactRegistrant,
          contactTech: body.contacts?.tech || body.contactTech,
          contactAdmin: body.contacts?.admin || body.contactAdmin,
          contactBilling: body.contacts?.billing || body.contactBilling,
        };
        result = await godaddyFetch(`/domains`, 'POST', token, purchaseBody);
        break;
      }

      // ── DNS records ──
      case 'getDnsRecords': {
        if (!body.domain) return Response.json({ error: 'domain is required' }, { status: 400 });
        result = await godaddyFetch(`/domains/${body.domain}/records`, 'GET', token);
        break;
      }
      case 'getDnsRecordsByType': {
        if (!body.domain || !body.type) return Response.json({ error: 'domain and type are required' }, { status: 400 });
        const nameParam = body.name ? `/${encodeURIComponent(body.name)}` : '';
        result = await godaddyFetch(`/domains/${body.domain}/records/${body.type}${nameParam}`, 'GET', token);
        break;
      }
      case 'addDnsRecord': {
        if (!body.domain || !body.type || !body.name || !body.data) {
          return Response.json({ error: 'domain, type, name, and data are required' }, { status: 400 });
        }
        const record = {
          type: body.type,
          name: body.name,
          data: body.data,
          ttl: body.ttl || 3600,
          port: body.port || 1,
          priority: body.priority || 0,
          weight: body.weight || 0,
          service: body.service || 1,
          protocol: body.protocol || 'string',
        };
        result = await godaddyFetch(`/domains/${body.domain}/records`, 'PATCH', token, [record]);
        break;
      }
      case 'replaceDnsRecords': {
        if (!body.domain || !body.type || !body.records) {
          return Response.json({ error: 'domain, type, and records array are required' }, { status: 400 });
        }
        result = await godaddyFetch(`/domains/${body.domain}/records/${body.type}`, 'PUT', token, body.records);
        break;
      }
      case 'deleteDnsRecord': {
        if (!body.domain || !body.type || !body.name) {
          return Response.json({ error: 'domain, type, and name are required' }, { status: 400 });
        }
        result = await godaddyFetch(`/domains/${body.domain}/records/${body.type}/${encodeURIComponent(body.name)}`, 'DELETE', token);
        break;
      }

      // ── Domain forwarding ──
      case 'getForwarding': {
        if (!body.domain) return Response.json({ error: 'domain is required' }, { status: 400 });
        result = await godaddyFetch(`/domains/${body.domain}/forwarding`, 'GET', token);
        break;
      }
      case 'updateForwarding': {
        if (!body.domain || !body.forwarding) return Response.json({ error: 'domain and forwarding config are required' }, { status: 400 });
        result = await godaddyFetch(`/domains/${body.domain}/forwarding`, 'PUT', token, body.forwarding);
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    if (result && result._error) {
      console.error(`[godaddyApi] ${action} failed:`, result.status, JSON.stringify(result.body).slice(0, 500));
      return Response.json({ error: `GoDaddy API error (${result.status})`, action, details: result.body }, { status: 502 });
    }

    return Response.json({ ok: true, action, result });
  } catch (error) {
    console.error('godaddyApi error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}