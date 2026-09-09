import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';
import OpenAI from 'npm:openai@6.45.0';

// ─────────────────────────────────────────────────────────────────────────────
// rebrandStudio — Intelligent rebrand engine for the website factory.
// Generates transparent-background logos via the Base44 AI gateway and
// scans the live site to identify every piece of content that must change
// to rebrand the template for a new customer.
//
// Actions:
//   generateLogo  — AI logo with transparent PNG background
//   scanSite      — scrape + LLM analysis of rebrand-replaceable content
//
// Invoke: base44.functions.invoke('rebrandStudio', { action, ...params })
// ─────────────────────────────────────────────────────────────────────────────

async function simpleScrape(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { url, content: text.slice(0, 30000) };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'generateLogo';

    switch (action) {
      case 'generateLogo': {
        const { companyName, tagline, style } = body;
        if (!companyName) return Response.json({ error: 'companyName is required' }, { status: 400 });

        const { baseURL, token } = svc.aiGateway.connection();
        const client = new OpenAI({ baseURL, apiKey: token });

        const prompt = `A professional, minimalist emblem logo for a garage floor epoxy coating company named "${companyName}"${tagline ? ` with the tagline "${tagline}"` : ''}. ${style || 'Modern, bold, industrial-luxury aesthetic with metallic gold and charcoal accents.'} Clean vector-style mark, centered, high contrast, no photographic background, suitable as a website header badge. Transparent background, no border, no card.`;

        const { data } = await client.images.generate({
          model: 'gpt_image_1',
          prompt,
          n: 1,
          aspect_ratio: '1:1',
          resolution: '1K',
          output_format: 'png',
          background: 'transparent',
          response_format: 'url',
        });

        return Response.json({ ok: true, logo_url: data[0].url });
      }

      case 'scanSite': {
        const url = body.url || 'https://epoxyquotenearme.base44.app';
        let scraped;
        try {
          scraped = await simpleScrape(url);
        } catch (e) {
          scraped = { url, content: '', error: e.message };
        }

        const scanRes = await svc.integrations.Core.InvokeLLM({
          prompt: `Analyze this scraped website content and identify everything that must change to rebrand the site for a new epoxy flooring company. URL: ${url}. Content: ${(scraped.content || '').slice(0, 12000) || 'N/A'}. Identify: current company name, logo presence, phone, email, address, service area, color scheme, key pages and what changes each needs, SEO keywords, CTAs, and the minimum set of content changes required to launch under a new brand. Format as JSON.`,
          response_json_schema: {
            type: 'object',
            properties: {
              company_name: { type: 'string' },
              logo_found: { type: 'boolean' },
              phone: { type: 'string' },
              email: { type: 'string' },
              address: { type: 'string' },
              service_area: { type: 'string' },
              color_scheme: { type: 'string' },
              pages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    page: { type: 'string' },
                    content_summary: { type: 'string' },
                    changes_needed: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
              keywords: { type: 'array', items: { type: 'string' } },
              ctas: { type: 'array', items: { type: 'string' } },
              minimum_changes: { type: 'array', items: { type: 'string' } },
              launch_readiness: { type: 'string' },
            },
          },
          model: 'claude-sonnet-5',
        });

        return Response.json({ ok: true, scan: scanRes, source_url: url });
      }

      case 'massProduce': {
        const { brand: b, logoUrl: lu, cities, rootDomain } = body;
        if (!b?.company_name || !cities?.length) return Response.json({ error: 'brand.company_name and cities are required' }, { status: 400 });
        const root = (rootDomain || b.domain || '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        const baseSlug = (b.company_name || 'epoxy').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const created = [];
        for (const c of cities) {
          const city = String(c.city || '').trim();
          const state = String(c.state || '').trim();
          if (!city) continue;
          const citySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const tpl = await svc.entities.WebsiteTemplate.create({
            name: `${b.company_name} — ${city}`,
            slug: `${baseSlug}-${citySlug}`,
            config: {
              company_name: b.company_name, phone: b.phone, email: b.email,
              domain: root ? `${citySlug}.${root}` : (b.domain || ''),
              service_area: `${city}, ${state}`,
              primary_city: city, primary_state: state,
              color_scheme: b.color_scheme || 'amber', pricing_tier: 'standard',
              hero_image_url: lu || '',
            },
            generated_url: root ? `https://${citySlug}.${root}` : '',
            status: 'configured', pwa_enabled: true, launch_mode: 'manual',
          });
          created.push({ id: tpl.id, city, state });
        }
        const campaign = await svc.entities.LaunchCampaign.create({
          name: `${b.company_name} — Mass Production (${created.length} cities)`,
          status: 'planning', mode: 'manual',
          target_states: [...new Set(created.map((t) => t.state))],
          target_cities: created.map((t) => ({ city: t.city, state: t.state, status: 'pending' })),
          template_ids: created.map((t) => t.id),
          auto_deploy: false,
          metrics: { sites_deployed: 0, leads_generated: 0, appointments_booked: 0, revenue: 0 },
          spent: 0,
        });
        return Response.json({ ok: true, templates_created: created.length, campaign_id: campaign.id });
      }

      case 'bulkPublish': {
        // Push shared brand fields (company_name, phone, email, color_scheme,
        // logo) to ALL WebsiteTemplate records at once. City-specific fields
        // (slug, primary_city, primary_state, service_area, domain) are preserved.
        const { brand: b, logoUrl: lu } = body;
        if (!b?.company_name) return Response.json({ error: 'brand.company_name is required' }, { status: 400 });

        const templates = await svc.entities.WebsiteTemplate.list(500);
        const updates = templates.map((t) => ({
          id: t.id,
          config: {
            ...t.config,
            company_name: b.company_name,
            phone: b.phone,
            email: b.email,
            color_scheme: b.color_scheme || t.config?.color_scheme || 'amber',
            hero_image_url: lu || t.config?.hero_image_url || '',
          },
        }));

        if (updates.length > 0) {
          await svc.entities.WebsiteTemplate.bulkUpdate(updates);
        }
        return Response.json({ ok: true, updated: updates.length });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[rebrandStudio] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}