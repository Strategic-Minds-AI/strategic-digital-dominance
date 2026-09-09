import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Sparkles, RefreshCw, UserCheck } from "lucide-react";

export default function AgentPanel({ selectedLeadIds }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);

  const { data: personas } = useQuery({
    queryKey: ["agent-personas-scraper"],
    queryFn: () => base44.entities.AgentPersona.filter({ active: true }, "-created_date", 20),
  });

  const assign = async (personaId) => {
    if (!selectedLeadIds?.length) return;
    setBusy("assign");
    try {
      await base44.entities.Lead.updateMany(
        { id: { $in: selectedLeadIds } },
        { $set: { assigned_agent_id: personaId } }
      );
      setResult({ assigned: selectedLeadIds.length, personaId });
      queryClient.invalidateQueries({ queryKey: ["scraper-leads"] });
    } catch (e) {
      setResult({ error: e.message });
    } finally { setBusy(null); }
  };

  const enrich = async () => {
    if (!selectedLeadIds?.length) return;
    setBusy("enrich");
    try {
      const results = [];
      for (const id of selectedLeadIds) {
        const r = await base44.functions.invoke("enrichLead", { lead_id: id }).catch((e) => ({ error: e.message }));
        results.push({ id, ok: !!r.data?.ok });
      }
      setResult({ enriched: results.filter((r) => r.ok).length, total: results.length });
      queryClient.invalidateQueries({ queryKey: ["scraper-leads"] });
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-stone-900 flex items-center gap-2"><Bot className="h-5 w-5 text-amber-500" /> AI Agent & Enrichment</h3>
      <p className="text-sm text-stone-500">Assign an AI persona to automate outreach, or enrich selected leads with background data (business info, social profiles, reviews).</p>

      <div className="flex flex-wrap gap-2">
        {(personas || []).map((p) => (
          <button key={p.id} onClick={() => assign(p.id)} disabled={!selectedLeadIds?.length || busy !== null}
            className="xa-electric-btn rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.avatar_color || "#ff6b00" }} />
            {p.name}
          </button>
        ))}
        {(!personas || personas.length === 0) && <span className="text-xs text-stone-400">No active personas — create one in Xtreme Comms → AI Agents.</span>}
      </div>

      <div className="flex gap-2">
        <button onClick={enrich} disabled={!selectedLeadIds?.length || busy !== null}
          className="h-9 px-3 rounded-lg bg-stone-900 text-white text-sm font-bold disabled:opacity-50 flex items-center gap-1.5">
          {busy === "enrich" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Enrich {selectedLeadIds?.length || 0} leads
        </button>
        <button onClick={() => assign("")} disabled={!selectedLeadIds?.length || busy !== null}
          className="h-9 px-3 rounded-lg border border-stone-200 text-stone-600 text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5">
          <UserCheck className="h-4 w-4" /> Unassign
        </button>
      </div>

      {result && <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">{JSON.stringify(result)}</div>}
    </div>
  );
}