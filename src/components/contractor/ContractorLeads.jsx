import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronRight, Phone, Mail } from "lucide-react";

const COLUMNS = [
  { key: "NEW ESTIMATE", label: "New", color: "border-blue-500" },
  { key: "CONTACT ATTEMPTED", label: "Contacted", color: "border-amber-500" },
  { key: "CONSULTATION BOOKED", label: "Booked", color: "border-purple-500" },
  { key: "PROPOSAL SENT", label: "Proposal", color: "border-cyan-500" },
  { key: "WON", label: "Won", color: "border-emerald-500" },
];

export default function ContractorLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Lead.list("-created_date", 100);
        setLeads(list || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const moveLead = async (leadId, newStatus) => {
    try {
      await base44.entities.Lead.update(leadId, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-lg font-extrabold text-stone-900">Lead Pipeline</h1>

      <div className="space-y-3">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl border-l-4 ${col.color} bg-white border border-stone-200 overflow-hidden`}>
              <div className="px-3 py-2 flex items-center justify-between bg-stone-50">
                <span className="text-sm font-bold text-stone-900">{col.label}</span>
                <span className="text-xs text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full font-semibold">{colLeads.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[40px]">
                {colLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="w-full text-left rounded-lg bg-stone-50 p-3 hover:bg-amber-50 transition border border-stone-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900 truncate">{lead.first_name} {lead.last_name || ""}</span>
                      {lead.estimate_mid && <span className="text-xs font-bold text-amber-600 shrink-0">${Math.round(lead.estimate_mid / 1000)}k</span>}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 truncate">{lead.city || lead.address || "No address"}</div>
                  </button>
                ))}
                {colLeads.length === 0 && <div className="text-center text-xs text-stone-400 py-2">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setSelected(null)}>
          <div className="w-full bg-white rounded-t-2xl border-t border-stone-200 max-h-[80%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-100 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">{selected.first_name} {selected.last_name || ""}</h3>
              <button onClick={() => setSelected(null)} className="text-stone-500 hover:text-stone-900 text-xs">Close</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex-1 rounded-lg bg-stone-100 py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-stone-700 hover:bg-stone-200">
                    <Phone className="h-4 w-4 text-amber-500" /> Call
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="flex-1 rounded-lg bg-stone-100 py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-stone-700 hover:bg-stone-200">
                    <Mail className="h-4 w-4 text-amber-500" /> Email
                  </a>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <Detail label="Address" value={`${selected.address || ""}, ${selected.city || ""}, ${selected.state || ""}`} />
                <Detail label="Garage Size" value={`${selected.square_footage || "—"} sq ft`} />
                <Detail label="System" value={selected.desired_system || "—"} />
                <Detail label="Color" value={selected.flake_color_name || "—"} />
                <Detail label="Estimate" value={selected.estimate_mid ? money(selected.estimate_mid) : "—"} />
                <Detail label="Status" value={selected.status} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block mb-2">Move to Stage</label>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => { moveLead(selected.id, col.key); setSelected({ ...selected, status: col.key }); }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        selected.status === col.key ? "bg-amber-500 text-white border-amber-500 font-bold" : "border-stone-300 text-stone-600 hover:border-amber-500"
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-stone-500 shrink-0">{label}</span>
      <span className="text-sm text-stone-900 text-right font-semibold">{value}</span>
    </div>
  );
}

function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}