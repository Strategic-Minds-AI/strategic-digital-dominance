import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, RefreshCw, Users, Home, Building2, MessageCircle, Newspaper, Hammer, Layers } from "lucide-react";

const SOURCES = [
  { key: "homeowner_leads", label: "Homeowner property leads", icon: Home },
  { key: "facebook_groups", label: "Facebook local groups", icon: MessageCircle },
  { key: "craigslist", label: "Craigslist housing/services", icon: Newspaper },
  { key: "epoxy_businesses", label: "Local epoxy businesses", icon: Building2 },
  { key: "decorative_concrete", label: "Decorative concrete businesses", icon: Building2 },
  { key: "local_contractors", label: "Local contractors", icon: Hammer },
  { key: "flooring_companies", label: "Local flooring companies", icon: Layers },
  { key: "b2b_contractors", label: "B2B epoxy contractors", icon: Users },
];

export default function ScraperPanel({ onScraped }) {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async (preset) => {
    setRunning(preset);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("railwayScraper", { action: "runPreset", preset });
      setResult(res.data?.result);
      onScraped?.(preset);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setRunning(null);
    }
  };

  const runAll = async () => {
    setRunning("all");
    setError(null);
    try {
      const res = await base44.functions.invoke("dailyLeadEngine", { presets: Object.keys(SOURCES).map((s) => s.key) });
      setResult(res.data);
      onScraped?.("all");
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-900 flex items-center gap-2"><Search className="h-5 w-5 text-amber-500" /> Lead Scraper Engine</h3>
        <button onClick={runAll} disabled={running !== null} className="h-9 px-3 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold disabled:opacity-50 flex items-center gap-1.5">
          {running === "all" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Run Full Pipeline
        </button>
      </div>
      <p className="text-sm text-stone-500">Run the cloud-browser engine against any lead source. Results are saved as Lead records, pushed to HubSpot CRM, and routed to Xtreme Comms for outreach.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {SOURCES.map((s) => (
          <button key={s.key} onClick={() => run(s.key)} disabled={running !== null}
            className="xa-electric-btn rounded-xl border border-stone-200 bg-white p-3 text-left disabled:opacity-50">
            <s.icon className="h-5 w-5 text-amber-600 mb-1.5" />
            <div className="text-xs font-bold text-stone-900 leading-tight">{s.label}</div>
            {running === s.key && <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> scraping…</div>}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="text-xs font-bold text-stone-500 mb-2">ENGINE RESPONSE</div>
          <pre className="text-xs text-stone-700 overflow-x-auto max-h-64 overflow-y-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}