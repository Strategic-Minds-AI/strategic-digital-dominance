import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// syncLeadToSheet — auto-creates a Google Sheet and appends every new lead.
// The spreadsheet ID is stored in AppSettings.google_sheets_lead_id.
//
// Actions:
//   ensureSheet — create the spreadsheet (if missing) and return its URL
//   appendLead — append a single lead row (called from the funnel after lead creation)
//
// Invoke: base44.functions.invoke('syncLeadToSheet', { action, lead_id })

const SHEETS_API = 'https://sheets.googleapis.com/v4';

const HEADERS = [
  'Date', 'First Name', 'Last Name', 'Email', 'Phone',
  'Address', 'City', 'State', 'ZIP',
  'Garage Size (sqft)', 'Floor Condition', 'Desired System',
  'Flake Color', 'Color Name',
  'Estimate Low', 'Estimate Mid', 'Estimate High',
  'Lead Score', 'Status', 'Source',
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'appendLead';

    const conn = await svc.connectors.getConnection('googlesheets');
    if (!conn?.accessToken) {
      return Response.json({ error: 'Google Sheets not connected' }, { status: 400 });
    }
    const headers = { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' };

    // Resolve or create the spreadsheet ID from AppSettings
    const settingsRows = await svc.entities.AppSettings.list(1);
    let settings = settingsRows[0] || null;
    let sheetId = settings?.google_sheets_lead_id || null;

    if (!sheetId) {
      const createRes = await fetch(`${SHEETS_API}/spreadsheets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          properties: { title: 'Epoxy Garage Floor — Leads (All Locations)' },
          sheets: [{ properties: { title: 'Leads' } }],
        }),
      });
      if (!createRes.ok) {
        console.error('[syncLeadToSheet] create failed:', await createRes.text());
        return Response.json({ error: 'Failed to create spreadsheet' }, { status: 500 });
      }
      const created = await createRes.json();
      sheetId = created.spreadsheetId;

      // Write header row
      await fetch(`${SHEETS_API}/spreadsheets/${sheetId}/values/Leads!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [HEADERS] }),
      });

      // Persist the sheet ID
      if (settings) {
        await svc.entities.AppSettings.update(settings.id, { google_sheets_lead_id: sheetId });
      } else {
        await svc.entities.AppSettings.create({ google_sheets_lead_id: sheetId });
      }
    }

    if (action === 'ensureSheet') {
      return Response.json({ ok: true, sheet_id: sheetId, url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit` });
    }

    if (action === 'appendLead') {
      if (!body.lead_id) return Response.json({ error: 'lead_id required' }, { status: 400 });

      const lead = await svc.entities.Lead.get(body.lead_id);
      const row = [
        new Date(lead.created_date || Date.now()).toLocaleString('en-US'),
        lead.first_name || '', lead.last_name || '', lead.email || '', lead.phone || '',
        lead.address || '', lead.city || '', lead.state || '', lead.zip || '',
        lead.square_footage || '',
        (lead.floor_condition || []).join(', '),
        lead.desired_system || '', lead.flake_color || '', lead.flake_color_name || '',
        lead.estimate_low || '', lead.estimate_mid || '', lead.estimate_high || '',
        lead.lead_score || 0, lead.status || '', lead.lead_source || 'website',
      ];

      const res = await fetch(
        `${SHEETS_API}/spreadsheets/${sheetId}/values/Leads!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        { method: 'POST', headers, body: JSON.stringify({ values: [row] }) },
      );
      if (!res.ok) {
        console.error('[syncLeadToSheet] append failed:', await res.text());
        return Response.json({ error: 'Append failed' }, { status: 500 });
      }
      return Response.json({ ok: true, sheet_id: sheetId, lead_id: lead.id });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[syncLeadToSheet] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}