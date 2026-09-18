import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, Crown, TrendingUp, Clock, Bot } from "lucide-react";

export default function DominanceGenerator({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [numMethods, setNumMethods] = useState(50);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "generateDominancePlan",
        keyword,
        numMethods,
      });
      setPlan(res.data?.dominance_plan);
    } catch (e) {
      setError(e.message || "Plan generation failed");
    } finally {
      setLoading(false);
    }
  };

  const categories = plan?.methods ? [...new Set(plan.methods.map(m => m.category))] : [];
  const filteredMethods = filter === "all" ? plan?.methods : plan?.methods?.filter(m => m.category === filter);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Digital Dominance Generator
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Generates every technologically capable and possible method using AI, automation, and autonomous systems to show up on every first page of Google when someone searches "near me", "near you", or related tail words.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Number of Methods</label>
            <input type="number" value={numMethods} onChange={(e) => setNumMethods(Number(e.target.value))} min={20} max={100} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
          {loading ? "Generating dominance plan..." : "Generate Digital Dominance Plan"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !plan && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Generating {numMethods}+ methods for first-page domination...</p>
        </div>
      )}

      {plan?.methods && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="text-2xl font-black text-stone-900">{plan.methods.length}</div>
              <div className="text-xs text-stone-500">Total Methods</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <Bot className="h-5 w-5 text-emerald-500 mb-1" />
              <div className="text-2xl font-black text-emerald-600">{plan.methods.filter(m => m.automation_level === "fully_autonomous").length}</div>
              <div className="text-xs text-emerald-700">Fully Autonomous</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <TrendingUp className="h-5 w-5 text-amber-500 mb-1" />
              <div className="text-2xl font-black text-amber-600">{Math.round(plan.methods.reduce((s, m) => s + (m.impact_score || 0), 0) / plan.methods.length)}</div>
              <div className="text-xs text-amber-700">Avg Impact Score</div>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${filter === "all" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}>
              All ({plan.methods.length})
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${filter === cat ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}>
                {cat} ({plan.methods.filter(m => m.category === cat).length})
              </button>
            ))}
          </div>

          {/* Methods */}
          <div className="space-y-2">
            {filteredMethods?.map((m, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{m.category}</span>
                      <h3 className="font-bold text-stone-900 text-sm">{m.technique}</h3>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">{m.implementation}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-400">Impact:</span>
                      <span className="text-sm font-bold text-amber-600">{m.impact_score}/10</span>
                    </div>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {m.time_to_results}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.automation_level === "fully_autonomous" ? "bg-emerald-100 text-emerald-700" : m.automation_level === "semi_autonomous" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
                    {m.automation_level.replace(/_/g, " ")}
                  </span>
                  {m.tools_needed?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.tools_needed.map((t, j) => (
                        <span key={j} className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}