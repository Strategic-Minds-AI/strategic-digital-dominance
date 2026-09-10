import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const GA_ADMIN_URL = 'https://analyticsadmin.googleapis.com/v1beta';
const GA_DATA_URL = 'https://analyticsdata.googleapis.com/v1beta';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    const body = await req.json().catch(() => ({}));
    const { action, property_id, days = 30 } = body;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const fmt = (d) => d.toISOString().split('T')[0];

    switch (action) {
      case 'listProperties': {
        const res = await fetch(`${GA_ADMIN_URL}/accountSummaries`, { headers });
        const data = await res.json();
        const properties = [];
        for (const acc of data.accountSummaries || []) {
          for (const prop of acc.propertySummaries || []) {
            properties.push({
              property_id: prop.property.replace('properties/', ''),
              display_name: prop.displayName,
              account: acc.displayName,
            });
          }
        }
        return Response.json({ ok: true, properties });
      }

      case 'getOverview': {
        const res = await fetch(`${GA_DATA_URL}/properties/${property_id}:runReport`, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
            metrics: [
              { name: 'sessions' }, { name: 'totalUsers' },
              { name: 'screenPageViews' }, { name: 'newUsers' },
            ],
          }),
        });
        const data = await res.json();
        const totals = data.rows?.[0]?.metricValues || [];
        return Response.json({
          ok: true,
          overview: {
            sessions: Number(totals[0]?.value || 0),
            users: Number(totals[1]?.value || 0),
            page_views: Number(totals[2]?.value || 0),
            new_users: Number(totals[3]?.value || 0),
          },
        });
      }

      case 'getTrafficByPage': {
        const res = await fetch(`${GA_DATA_URL}/properties/${property_id}:runReport`, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'totalUsers' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 50,
          }),
        });
        const data = await res.json();
        const pages = (data.rows || []).map((r) => ({
          path: r.dimensionValues[0].value,
          page_views: Number(r.metricValues[0].value || 0),
          sessions: Number(r.metricValues[1].value || 0),
          users: Number(r.metricValues[2].value || 0),
        }));
        return Response.json({ ok: true, pages });
      }

      case 'getDailyEstimatorUsage': {
        const res = await fetch(`${GA_DATA_URL}/properties/${property_id}:runReport`, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'totalUsers' }],
            dimensionFilter: {
              orGroup: {
                expressions: [
                  { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'CONTAINS', value: 'estimate' } } },
                  { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'CONTAINS', value: 'funnel' } } },
                ],
              },
            },
            orderBys: [{ dimension: { dimensionName: 'date' } }],
            limit: 365,
          }),
        });
        const data = await res.json();
        const daily = (data.rows || []).map((r) => ({
          date: r.dimensionValues[0].value,
          page_views: Number(r.metricValues[0].value || 0),
          sessions: Number(r.metricValues[1].value || 0),
          users: Number(r.metricValues[2].value || 0),
        }));
        return Response.json({ ok: true, daily });
      }

      case 'getDailyTraffic': {
        const res = await fetch(`${GA_DATA_URL}/properties/${property_id}:runReport`, {
          method: 'POST', headers,
          body: JSON.stringify({
            dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
            limit: 365,
          }),
        });
        const data = await res.json();
        const daily = (data.rows || []).map((r) => ({
          date: r.dimensionValues[0].value,
          sessions: Number(r.metricValues[0].value || 0),
          users: Number(r.metricValues[1].value || 0),
          page_views: Number(r.metricValues[2].value || 0),
        }));
        return Response.json({ ok: true, daily });
      }

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[googleAnalytics] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}