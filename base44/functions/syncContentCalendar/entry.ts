import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// syncContentCalendar — pushes scheduled social posts + SEO content dates to
// the builder's Google Calendar so the content schedule is visible in one view.
//
// Uses events:import with a deterministic iCalUID per record so re-running
// the sync is idempotent (409 = already exists, no duplicate).
//
// Color coding: social posts = yellow (5), SEO content = green (2)
//
// Invoke: base44.functions.invoke('syncContentCalendar', { action: 'sync' })

const CAL_API = 'https://www.googleapis.com/calendar/v3';
const COLOR_SOCIAL = '5'; // yellow
const COLOR_SEO = '2';    // green

function addDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'sync';

    const conn = await svc.connectors.getConnection('googlecalendar');
    if (!conn?.accessToken) {
      return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }
    const authHeader = { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' };

    if (action === 'sync') {
      let synced = 0;
      let skipped = 0;
      let errors = 0;

      // Dedup: list existing events we've already synced (marked via shared
      // extendedProperties) so we don't create duplicates on re-runs.
      const existingIds = new Set<string>();
      let pageToken = '';
      for (let i = 0; i < 10; i++) {
        let url = `${CAL_API}/calendars/primary/events?maxResults=2500&sharedExtendedProperties=source%3Depoxyquotenearme`;
        if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
        const listRes = await fetch(url, { headers: authHeader });
        if (!listRes.ok) break;
        const listData = await listRes.json();
        for (const ev of listData.items || []) {
          const rid = ev.extendedProperties?.shared?.recordId;
          if (rid) existingIds.add(rid);
        }
        if (!listData.nextPageToken) break;
        pageToken = listData.nextPageToken;
      }

      // Helper: create an all-day event with a shared extendedProperty for dedup.
      const createEvent = async (recordId: string, summary: string, description: string, date: string, colorId: string) => {
        if (existingIds.has(recordId)) { skipped++; return; }
        const event = {
          summary,
          description: description.slice(0, 1000),
          start: { date },
          end: { date: addDay(date) },
          colorId,
          transparency: 'transparent',
          extendedProperties: {
            shared: { source: 'epoxyquotenearme', recordId },
          },
        };
        const res = await fetch(`${CAL_API}/calendars/primary/events`, {
          method: 'POST', headers: authHeader, body: JSON.stringify(event),
        });
        if (res.ok) { synced++; existingIds.add(recordId); return; }
        errors++;
        console.error('[syncContentCalendar] insert:', res.status, (await res.text()).slice(0, 200));
      };

      // 1. Scheduled social posts → yellow all-day events
      const posts = await svc.entities.SocialPost.filter({ status: 'scheduled' }, '-scheduled_at', 100);
      for (const post of posts) {
        if (!post.scheduled_at) continue;
        const date = post.scheduled_at.slice(0, 10);
        await createEvent(`social-${post.id}`, `📱 Social: ${post.page_name || 'Facebook'}`, post.content || '', date, COLOR_SOCIAL);
      }

      // 2. SEO content pages with a real optimized_at date → green all-day events.
      //    (Skips bulk-created pages that only have updated_date — no meaningful schedule date.)
      const seoPages = await svc.entities.SeoContent.list(200);
      let seoWithDate = 0;
      for (const page of seoPages) {
        if (!page.optimized_at) continue; // only pages that were actually SEO-optimized
        seoWithDate++;
        const date = new Date(page.optimized_at).toISOString().slice(0, 10);
        await createEvent(`seo-${page.id}`, `📝 SEO: ${page.title || page.route}`, `Route: ${page.route}\n${page.description || ''}`, date, COLOR_SEO);
      }

      return Response.json({
        ok: true,
        synced,
        skipped,
        errors,
        social_posts: posts.length,
        seo_pages: seoWithDate,
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[syncContentCalendar] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}