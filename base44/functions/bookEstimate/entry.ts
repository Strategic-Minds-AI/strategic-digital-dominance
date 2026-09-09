import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// bookEstimate — Google Calendar integration for the consultation booking step.
//
// Actions:
//   getSlots { date }      → returns available time slots for the date (checks
//                            the builder's Google Calendar for conflicts)
//   book    { lead_id, date, time } → creates a calendar event with the lead's
//                            info, creates an Appointment record, and updates
//                            the Lead status to IN-HOME ESTIMATE BOOKED
//
// The customer is NOT authenticated — authorization is the lead_id (a UUID
// that's hard to guess). The calendar connection is the builder's shared
// Google Calendar connector.

const CAL_API = 'https://www.googleapis.com/calendar/v3';
const TIMEZONE = 'America/New_York';
const SLOT_DURATION_MIN = 60;

const SLOTS = [
  { time: '09:00', label: '9:00 AM' },
  { time: '10:30', label: '10:30 AM' },
  { time: '12:00', label: '12:00 PM' },
  { time: '13:30', label: '1:30 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:30', label: '4:30 PM' },
];

function addDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Compute the UTC offset for a specific date in the target timezone.
// Returns a string like "-04:00" or "-05:00" (handles DST).
function tzOffsetFor(dateStr: string, tz: string): string {
  const utcDate = new Date(dateStr + 'T12:00:00Z');
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const parts = fmt.formatToParts(utcDate);
  const get = (type) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
  const tzDate = new Date(Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second')));
  const diffMin = Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
  const sign = diffMin >= 0 ? '+' : '-';
  const abs = Math.abs(diffMin);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function formatTimeLabel(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    let conn;
    try {
      conn = await svc.connectors.getConnection('googlecalendar');
    } catch {}
    if (!conn?.accessToken) {
      return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }
    const authHeader = { Authorization: `Bearer ${conn.accessToken}`, 'Content-Type': 'application/json' };

    // ── getSlots: return available time slots for a date ──
    if (action === 'getSlots') {
      const { date } = body;
      if (!date) return Response.json({ error: 'date required (YYYY-MM-DD)' }, { status: 400 });

      const offset = tzOffsetFor(date, TIMEZONE);
      const timeMin = `${date}T00:00:00${offset}`;
      const timeMax = `${addDay(date)}T00:00:00${offset}`;

      const url = `${CAL_API}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&timeZone=${TIMEZONE}&singleEvents=true&orderBy=startTime`;
      const res = await fetch(url, { headers: authHeader });
      if (!res.ok) {
        console.error('[bookEstimate] list failed:', res.status, (await res.text()).slice(0, 300));
        return Response.json({ error: 'Calendar query failed' }, { status: 502 });
      }
      const data = await res.json();

      const busyPeriods = (data.items || []).map((ev) => {
        if (ev.start?.dateTime) {
          return { start: new Date(ev.start.dateTime), end: new Date(ev.end.dateTime) };
        }
        // All-day event — block the whole day
        return { start: new Date(ev.start.date + 'T00:00:00' + offset), end: new Date(ev.end.date + 'T00:00:00' + offset) };
      });

      const available = SLOTS.filter((slot) => {
        const slotStart = new Date(`${date}T${slot.time}:00${offset}`);
        const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MIN * 60000);
        return !busyPeriods.some((bp) => slotStart < bp.end && bp.start < slotEnd);
      });

      return Response.json({ ok: true, slots: available });
    }

    // ── book: create calendar event + appointment + update lead ──
    if (action === 'book') {
      const { lead_id, date, time } = body;
      if (!lead_id || !date || !time) {
        return Response.json({ error: 'lead_id, date, and time required' }, { status: 400 });
      }

      const lead = await svc.entities.Lead.get(lead_id);
      if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

      const offset = tzOffsetFor(date, TIMEZONE);
      const startDateTime = `${date}T${time}:00${offset}`;
      const endDateTime = `${date}T${addMinutesToTime(time, SLOT_DURATION_MIN)}:00${offset}`;

      const summary = `🏠 In-Home Estimate: ${lead.first_name || ''} ${lead.last_name || ''}`.trim();
      const description = [
        `Lead: ${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
        lead.phone ? `Phone: ${lead.phone}` : '',
        lead.email ? `Email: ${lead.email}` : '',
        `Address: ${[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ')}`,
        lead.garage_size ? `Garage Size: ${lead.garage_size}` : '',
        lead.square_footage ? `Square Footage: ${lead.square_footage} sq ft` : '',
        lead.desired_system ? `Desired System: ${lead.desired_system}` : '',
        lead.flake_color_name ? `Color: ${lead.flake_color_name}` : '',
        lead.estimate_low && lead.estimate_high ? `Estimate Range: $${lead.estimate_low} – $${lead.estimate_high}` : '',
        lead.timeline ? `Timeline: ${lead.timeline}` : '',
        '',
        `Lead ID: ${lead.id}`,
      ].filter(Boolean).join('\n');

      const event = {
        summary,
        description,
        start: { dateTime: startDateTime, timeZone: TIMEZONE },
        end: { dateTime: endDateTime, timeZone: TIMEZONE },
        extendedProperties: { shared: { source: 'epoxyquotenearme', leadId: lead.id } },
      };

      const res = await fetch(`${CAL_API}/calendars/primary/events`, {
        method: 'POST', headers: authHeader, body: JSON.stringify(event),
      });
      if (!res.ok) {
        console.error('[bookEstimate] create failed:', res.status, (await res.text()).slice(0, 300));
        return Response.json({ error: 'Calendar booking failed' }, { status: 502 });
      }
      const calEvent = await res.json();

      const appt = await svc.entities.Appointment.create({
        lead_id: lead.id,
        type: 'IN-HOME ESTIMATE',
        date,
        time: formatTimeLabel(time),
        status: 'booked',
        notes: `Google Calendar: ${calEvent.htmlLink || calEvent.id}`,
      });

      await svc.entities.Lead.update(lead.id, {
        status: 'IN-HOME ESTIMATE BOOKED',
        appointment_status: 'in-home-booked',
      });

      return Response.json({
        ok: true,
        appointment_id: appt.id,
        event_id: calEvent.id,
        event_link: calEvent.htmlLink,
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[bookEstimate] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}