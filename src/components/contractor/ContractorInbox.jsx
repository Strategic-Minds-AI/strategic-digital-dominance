import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, MessageSquare, Phone, Mail, Send } from "lucide-react";

export default function ContractorInbox() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Lead.filter({ status: "PROPOSAL SENT" }, "-created_date", 50);
        setLeads(list || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || !selected?.email) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: selected.email,
        subject: `Update on your garage floor project — ${selected.first_name}`,
        body: message,
      });
      setMessage("");
    } catch {}
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="p-4 pb-2">
        <h1 className="text-lg font-extrabold text-stone-900">Inbox</h1>
        <p className="text-xs text-stone-500 mt-0.5">Customers awaiting response</p>
      </div>

      {!selected ? (
        <div className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
          {leads.length === 0 && (
            <div className="rounded-xl bg-white border border-stone-200 text-center py-12">
              <MessageSquare className="h-8 w-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">No messages. Proposals sent to customers will appear here.</p>
            </div>
          )}
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelected(lead)}
              className="w-full rounded-xl bg-white border border-stone-200 p-3 flex items-center gap-3 hover:border-amber-400 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-stone-700">{(lead.first_name || "?").charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-stone-900 truncate">{lead.first_name} {lead.last_name || ""}</div>
                <div className="text-xs text-stone-500 truncate">Proposal sent · {lead.estimate_mid ? `$${Math.round(lead.estimate_mid / 1000)}k` : "—"}</div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {lead.phone && <Phone className="h-4 w-4 text-stone-400" />}
                {lead.email && <Mail className="h-4 w-4 text-stone-400" />}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-4 py-3 bg-white border-b border-stone-200 flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="text-stone-500 hover:text-stone-900 text-xs font-bold">← Back</button>
            <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-stone-700">{(selected.first_name || "?").charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-stone-900 truncate">{selected.first_name} {selected.last_name || ""}</div>
              <div className="text-xs text-stone-500 truncate">{selected.email || selected.phone || ""}</div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="rounded-2xl bg-stone-100 p-3 max-w-[80%]">
              <p className="text-sm text-stone-700">Your proposal for {selected.desired_system || "epoxy flooring"} ({selected.square_footage || "—"} sq ft) has been sent. Estimated range: {selected.estimate_mid ? money(selected.estimate_mid) : "—"}.</p>
              <span className="text-[10px] text-stone-400 mt-1 block">Proposal sent</span>
            </div>
          </div>

          {/* Reply input */}
          <div className="p-3 bg-white border-t border-stone-200">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-11 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-500"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold px-4 flex items-center gap-1.5 disabled:opacity-50 active:scale-95 transition"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}