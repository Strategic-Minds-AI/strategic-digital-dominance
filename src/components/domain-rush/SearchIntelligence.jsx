import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, TrendingUp, AlertTriangle, Globe, BarChart3, Target, Layers, Brain } from "lucide-react";

export default function SearchIntelligence({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState(null);
  const [error, setError] = useState("");

  const handleResearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setResearch(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "researchSearchTerms",
        keyword,
        city,
        state,
        niche: selectedNiche?.id,
      });
      setResearch(res.data?.research);
    } catch (e) {
      setError(e.message || "Research failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Brain className="h-5 w-5 text-amber-500" />
            Search Intelligence Engine
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Live web research for top searches, search volumes, lost clicks, TLD patterns, competitor analysis, and other platforms with search data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="epoxy garage floor"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City (optional)</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Orlando"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">State (optional)</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none uppercase"
            />
          </div>
        </div>

        <button
          onClick={handleResearch}
          disabled={loading || !keyword.trim()}
          className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Researching live search data..." : "Run Search Intelligence Research"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !research && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Researching top searches, volumes, lost clicks, TLD patterns, and competitors...</p>
          <p className="text-xs text-stone-400">This uses live web search to gather real search intelligence data.</p>
        </div>
      )}

      {research && (
        <div className="space-y-4">
          {/* Top Searches */}
          {research.top_searches && research.top_searches.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-amber-500" /> Top Search Queries
              </h3>
              <div className="space-y-2">
                {research.top_searches.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-stone-900">"{s.query}"</p>
                      <p className="text-xs text-stone-500">{s.intent} intent · {s.competition} competition</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{s.monthly_volume}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lost Clicks */}
          {research.lost_clicks && research.lost_clicks.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" /> Lost Clicks — Opportunity Gaps
              </h3>
              <div className="space-y-2">
                {research.lost_clicks.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-900">"{c.query}"</p>
                      <p className="text-xs text-red-600">Gap: {c.gap_reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-red-700">{c.volume}</span>
                      <p className="text-xs text-stone-500">Score: {c.opportunity_score}/10</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tail Word Analysis */}
          {research.tail_word_analysis && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-amber-500" /> Tail Word Analysis (nearme, nearyou, etc.)
              </h3>
              <div className="space-y-2">
                {research.tail_word_analysis.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-stone-900 w-32">"{t.tail_word}"</span>
                    <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t.search_share}%` }} />
                    </div>
                    <span className="text-sm font-bold text-amber-600 w-12 text-right">{t.search_share}%</span>
                    <span className="text-xs text-stone-500 w-24 text-right">{t.intent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Analysis */}
          {research.competitor_analysis && research.competitor_analysis.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" /> Top Competitors
              </h3>
              <div className="space-y-2">
                {research.competitor_analysis.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{c.domain}</p>
                      <p className="text-xs text-stone-500">{c.ranking_keywords} ranking keywords</p>
                    </div>
                    <span className="text-sm font-bold text-stone-700">{c.est_traffic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Platforms */}
          {research.other_platforms && research.other_platforms.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-amber-500" /> Other Platforms with Search Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {research.other_platforms.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                    <BarChart3 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">{p.platform}</p>
                      <p className="text-xs text-stone-500">{p.data_available}</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">{p.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Intent Breakdown */}
          {research.search_intent_breakdown && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 mb-3">Search Intent Breakdown</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-2xl font-black text-emerald-600">{research.search_intent_breakdown.transactional}%</div>
                  <div className="text-xs text-emerald-700">Transactional (ready to buy)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-2xl font-black text-blue-600">{research.search_intent_breakdown.informational}%</div>
                  <div className="text-xs text-blue-700">Informational (researching)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="text-2xl font-black text-stone-600">{research.search_intent_breakdown.navigational}%</div>
                  <div className="text-xs text-stone-700">Navigational (specific biz)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}