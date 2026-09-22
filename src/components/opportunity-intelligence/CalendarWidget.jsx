import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, RefreshCw, Loader2, Video, MapPin, Clock, Users } from 'lucide-react';

const SYNC_EMAILS = [
  'info@strategicmindsai.com',
  'info@leadgenerationnearyou.com',
  'info@thevisioncortex.com',
  'jeremy@thextremeteam.com',
];

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` ${time}`;
}

function getDayLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric' });
}

function getMonthLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

export default function CalendarWidget() {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('opportunityIntelligenceEngine', { action: 'calendar_events' });
      const data = res.data || res;
      if (data.error) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data.events || []);
        setCalendars(data.calendars || []);
        setError('');
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-stone-950 to-stone-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 grid place-items-center">
            <Calendar className="h-5 w-5 text-stone-950" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Google Calendar</h2>
            <p className="text-xs text-stone-400">Synced to {SYNC_EMAILS.length} accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 hidden md:block">
            {events.length} upcoming events
          </span>
          <button
            onClick={loadEvents}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Sync emails */}
      <div className="flex flex-wrap gap-1.5 px-5 py-2.5 bg-stone-50 border-b border-stone-200">
        {SYNC_EMAILS.map((email) => (
          <span key={email} className="text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
            {email}
          </span>
        ))}
      </div>

      {/* Events */}
      <div className="max-h-[320px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        ) : error ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-red-500 font-medium mb-2">{error}</p>
            <p className="text-xs text-stone-400">Make sure the Google Calendar connector is connected.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Calendar className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-400">No upcoming events in the next 30 days.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50 transition">
                {/* Date badge */}
                <div className="flex flex-col items-center justify-center w-12 shrink-0 rounded-lg bg-stone-100 border border-stone-200 py-1">
                  <span className="text-[9px] font-bold text-stone-500 leading-none">{getMonthLabel(ev.start)}</span>
                  <span className="text-lg font-black text-stone-900 leading-none mt-0.5">{getDayLabel(ev.start)}</span>
                </div>
                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">{ev.summary}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(ev.start)}
                    </span>
                    {ev.location && (
                      <span className="text-xs text-stone-500 flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {ev.location}
                      </span>
                    )}
                    {ev.hangoutLink && (
                      <a href={ev.hangoutLink} target="_blank" rel="noopener" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                        <Video className="h-3 w-3" />
                        Join
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">{ev.calendar}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}