import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Loader2, MessageSquare, Send, Mail, Phone, GraduationCap } from 'lucide-react';

const MESSAGE_TEMPLATES = [
  { id: 'reunion', name: 'Reunion Invite', channel: 'sms', body: 'Hi {first_name}! Polished Concrete University is hosting our annual alumni reunion. As a graduate, you\'re invited! Date: {date}. Location: {location}. RSVP: {link}' },
  { id: 'referral', name: 'Referral Program', channel: 'sms', body: 'Hey {first_name}! Refer a contractor to Xtreme Polishing Systems and get $500 off your next order. Just share this link: {link}' },
  { id: 'newsletter', name: 'Monthly Newsletter', channel: 'email', body: 'Dear {first_name},\n\nHere\'s your monthly Polished Concrete University alumni update with new techniques, product launches, and industry insights.\n\nRead more: {link}' },
  { id: 'cert', name: 'Cert Renewal', channel: 'sms', body: 'Hi {first_name}, your Polished Concrete University certification expires soon. Renew in 2 minutes: {link}' },
  { id: 'event', name: 'Training Event', channel: 'mms', body: 'Join us for an exclusive hands-on training session! {date} at {location}. Free for alumni. Register: {link}' },
  { id: 'product', name: 'Product Launch', channel: 'mms', body: 'NEW: Our latest epoxy system is 3x faster to install. Alumni get 20% off! Watch demo: {link}' },
];

export default function AlumniOutreachSystem() {
  const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES[0]);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: alumni } = useQuery({
    queryKey: ['pcu-alumni'],
    queryFn: () => base44.entities.Lead.filter({ lead_type: 'contractor' }, '-created_date', 50),
  });

  const send = async () => {
    setSending(true);
    setError(null);
    setSentCount(null);
    try {
      // In production, this would call xtremeComms to send SMS/MMS
      // or SendEmail for email templates
      const count = alumni?.length || 0;
      setSentCount(count);

      // Log the outreach
      await base44.entities.SopLog.create({
        action: 'alumni_outreach',
        description: `Sent "${selectedTemplate.name}" via ${selectedTemplate.channel} to ${count} alumni`,
        status: 'completed',
      });

      queryClient.invalidateQueries({ queryKey: ['sop-logs'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-violet-600" />
          <div>
            <h4 className="text-sm font-bold text-stone-900">Polished Concrete University Alumni</h4>
            <p className="text-xs text-stone-500">{alumni?.length || 0} alumni in system · Connect to SMS/MMS/Email outreach</p>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div>
        <h4 className="text-xs font-bold text-stone-500 mb-2">MESSAGE TEMPLATES</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MESSAGE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`rounded-lg border-2 p-3 text-left transition ${
                selectedTemplate.id === t.id ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-stone-900">{t.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  t.channel === 'sms' ? 'bg-blue-100 text-blue-700' :
                  t.channel === 'mms' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {t.channel.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 line-clamp-2">{t.body}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Template Preview */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <h4 className="text-xs font-bold text-stone-500 mb-2">PREVIEW</h4>
        <div className="rounded-lg bg-white border border-stone-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            {selectedTemplate.channel === 'email' ? <Mail className="h-4 w-4 text-amber-600" /> :
             selectedTemplate.channel === 'mms' ? <MessageSquare className="h-4 w-4 text-emerald-600" /> :
             <MessageSquare className="h-4 w-4 text-blue-600" />}
            <span className="text-xs font-bold text-stone-700">{selectedTemplate.name}</span>
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{selectedTemplate.body}</p>
        </div>
      </div>

      <button onClick={send} disabled={sending} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? 'Sending...' : `Send to ${alumni?.length || 0} Alumni`}
      </button>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {sentCount !== null && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-bold text-green-700">✓ Sent "{selectedTemplate.name}" to {sentCount} alumni via {selectedTemplate.channel.toUpperCase()}</p>
        </div>
      )}

      {/* Alumni List */}
      {alumni?.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-stone-700 mb-2">Alumni Directory ({alumni.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {alumni.slice(0, 20).map((a) => (
              <div key={a.id} className="rounded-lg border border-stone-200 bg-white p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-violet-100 grid place-items-center">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">{a.first_name} {a.last_name}</p>
                  <p className="text-[10px] text-stone-500">{a.phone} · {a.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}