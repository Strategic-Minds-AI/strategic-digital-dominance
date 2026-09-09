import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, MessageCircle, Building2, ExternalLink, RefreshCw, Send, Sparkles, ChevronDown, ChevronRight } from "lucide-react";

export default function LeadsTable({ onSelectionChange }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);
  const [source, setSource] = useState("all");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["scraper-leads", source],
    queryFn: () => base44.entities.Lead.filter(
      source === "all" ? { lead_source: { $regex: "railway" } } : { lead_source: `railway:${source}` },
      "-created_date", 100
    ),
  });

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    onSelectionChange?.(next);
  };

  const pushCrm = async (id) => {
    setBusy(`crm-${id}`);
    try {
      await base44.functions.invoke("pushLeadToHubspot", { lead_id: id });
      queryClient.invalidateQueries({ queryKey: ["scraper-leads", source] });
    } finally { setBusy(null); }
  };

  const enrich = async (id) => {
    setBusy(`enrich-${id}`);
    try {
      await base44.functions.invoke("enrichLead", { lead_id: id });
      queryClient.invalidateQueries({ queryKey: ["scraper-leads", source] });
    } finally { setBusy(null); }
  };

  const outreach = async (channel, lead) => {
    setBusy(`${channel}-${lead.id}`);
    try {
      const msg = `Hi ${lead.first_name}, this is XPS — we'd love to give you a free estimate on a premium epoxy garage floor. Reply or call (877) 958-5264. — Xtreme Polishing Systems`;
      if (channel === "email" && lead.email) {
        await base44.functions.invoke("xtremeComms", { action: "sendEmail", to: lead.email, subject: "Free garage floor estimate — XPS", body: msg });
      } else if (channel === "sms" && lead.phone) {
        await base44.functions.invoke("xtremeComms", { action: "sendSms", to: lead.phone, message: msg });
      } else if (channel === "whatsapp" && lead.phone) {
        await base44.functions.invoke("xtremeComms", { action: "sendWhatsApp", to: lead.phone, message: msg });
      }
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-900 flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-500" /> Scraped Leads</h3>
        <div className="flex gap-1.5">
          <button onClick={() => setSource("all")} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${source === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>All</button>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["scraper-leads"] })} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Refresh</button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-stone-400">Loading leads…</div>}

      <div className="space-y-2">
        {(leads || []).map((lead) => (
          <div key={lead.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggle(lead.id)} className="h-4 w-4 accent-amber-500" />
              <button onClick={() => setExpanded(expanded === lead.id ? null : lead.id)} className="flex-1 flex items-center gap-2 text-left min-w-0">
                {expanded === lead.id ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-stone-900 truncate">{lead.first_name} {lead.last_name}</div>
                  <div className="text-xs text-stone-500 truncate">{lead.lead_source} · {[lead.city, lead.state].filter(Boolean).join(", ")}</div>
                </div>
              </button>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => enrich(lead.id)} disabled={busy === `enrich-${lead.id}`} title="Enrich" className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:border-amber-500">
                  {busy === `enrich-${lead.id}` ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                </button>
                {lead.email && <button onClick={() => outreach("email", lead)} disabled={busy === `email-${lead.id}`} title="Email" className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:border-amber-500">
                  {busy === `email-${lead.id}` ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                </button>}
                {lead.phone && <button onClick={() => outreach("sms", lead)} disabled={busy === `sms-${lead.id}`} title="SMS" className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:border-amber-500">
                  {busy === `sms-${lead.id}` ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                </button>}
                {lead.phone && <button onClick={() => outreach("whatsapp", lead)} disabled={busy === `whatsapp-${lead.id}`} title="WhatsApp" className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-amber-600 hover:border-amber-500">
                  {busy === `whatsapp-${lead.id}` ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
                </button>}
                <button onClick={() => pushCrm(lead.id)} disabled={busy === `crm-${lead.id}`} title="Push to HubSpot" className="h-8 px-2 rounded-lg bg-stone-900 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-50">
                  {busy === `crm-${lead.id}` ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} CRM
                </button>
              </div>
            </div>

            {expanded === lead.id && (
              <div className="border-t border-stone-100 p-3 space-y-2 bg-stone-50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-stone-400">Email:</span> <span className="text-stone-700">{lead.email || "—"}</span></div>
                  <div><span className="text-stone-400">Phone:</span> <span className="text-stone-700">{lead.phone || "—"}</span></div>
                  <div><span className="text-stone-400">Address:</span> <span className="text-stone-700">{[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(", ") || "—"}</span></div>
                  <div><span className="text-stone-400">Source:</span> <span className="text-stone-700">{lead.lead_source}</span></div>
                </div>
                {lead.notes && <div className="text-xs text-stone-600"><span className="text-stone-400">Notes:</span> {lead.notes}</div>}
                {lead.enrichment ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-stone-700 whitespace-pre-wrap">{lead.enrichment}</div>
                ) : (
                  <button onClick={() => enrich(lead.id)} className="text-xs text-amber-600 font-semibold flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Run AI enrichment</button>
                )}
              </div>
            )}
          </div>
        ))}
        {(!leads || leads.length === 0) && !isLoading && <p className="text-sm text-stone-400">No scraped leads yet — run a source above.</p>}
      </div>
    </div>
  );
}