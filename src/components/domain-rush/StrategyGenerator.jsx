import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, Calendar, Network, FileText, Bot, Server, RefreshCw, CheckCircle2 } from "lucide-react";

export default function StrategyGenerator({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [domain, setDomain] = useState("");
  const [numSites, setNumSites] = useState(100);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setStrategy(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "generateStrategy",
        keyword, city, state, domain,
        niche: selectedNiche?.id,
        numSites,
      });
      setStrategy(res.data?.strategy);
    } catch (e) {
      setError(e.message || "Strategy generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Network className="h-5 w-5 text-amber-500" />
            Programmatic Strategy Generator
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Exhaustive programmatic strategy for URL purchase, timeline, swarm deployment, content generation, AI techniques, Vercel provisioning, and autonomous triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Domain</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="keyword-nearme.com" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Target Sites</label>
            <input type="number" value={numSites} onChange={(e) => setNumSites(Number(e.target.value))} min={10} max={1000} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "Generating exhaustive strategy..." : "Generate Programmatic Strategy"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !strategy && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Generating exhaustive programmatic strategy with swarm deployment plan...</p>
        </div>
      )}

      {strategy && (
        <div className="space-y-4">
          {/* URL Purchase Plan */}
          {strategy.url_purchase_plan?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> URL Purchase Plan
              </h3>
              <ol className="space-y-2">
                {strategy.url_purchase_plan.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Timeline */}
          {strategy.timeline?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-amber-500" /> 12-Month Timeline
              </h3>
              <div className="space-y-3">
                {strategy.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{t.month}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900 mb-1">Milestones:</div>
                      <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5">
                        {t.milestones?.map((m, j) => <li key={j}>{m}</li>)}
                      </ul>
                      {t.kpi_targets?.length > 0 && (
                        <>
                          <div className="text-sm font-medium text-stone-900 mt-2 mb-1">KPI Targets:</div>
                          <ul className="text-xs text-emerald-600 list-disc list-inside space-y-0.5">
                            {t.kpi_targets.map((k, j) => <li key={j}>{k}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Swarm Strategy */}
          {strategy.swarm_strategy && (
            <div className="bg-stone-900 rounded-2xl border border-stone-700 p-5 text-white">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Network className="h-4 w-4 text-amber-400" /> Swarm Strategy — {numSites} Strategic Websites
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-amber-400 font-semibold mb-1">Target Cities ({strategy.swarm_strategy.target_cities?.length || 0}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.swarm_strategy.target_cities?.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-xs">{c}</span>
                    ))}
                  </div>
                </div>
                <div><p className="text-amber-400 font-semibold">Naming Pattern:</p><p className="text-stone-300">{strategy.swarm_strategy.naming_pattern}</p></div>
                <div><p className="text-amber-400 font-semibold">Content Strategy:</p><p className="text-stone-300">{strategy.swarm_strategy.content_strategy}</p></div>
                <div><p className="text-amber-400 font-semibold">Interlinking:</p><p className="text-stone-300">{strategy.swarm_strategy.interlinking}</p></div>
                <div><p className="text-amber-400 font-semibold">Penalty Avoidance:</p><p className="text-stone-300">{strategy.swarm_strategy.penalty_avoidance}</p></div>
              </div>
            </div>
          )}

          {/* Content Generation */}
          {strategy.content_generation?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-amber-500" /> Content Generation (Google's 100+ Requirements)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {strategy.content_generation.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-stone-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Techniques */}
          {strategy.ai_techniques?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-amber-500" /> AI & Technology Techniques
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {strategy.ai_techniques.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50">
                    <Bot className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-stone-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provisioning */}
          {strategy.provisioning?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Server className="h-4 w-4 text-amber-500" /> Vercel Provisioning & Scaling
              </h3>
              <ol className="space-y-2">
                {strategy.provisioning.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Trigger System */}
          {strategy.trigger_system?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <RefreshCw className="h-4 w-4 text-amber-500" /> Autonomous Trigger System (24/7)
              </h3>
              <div className="space-y-2">
                {strategy.trigger_system.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                    <RefreshCw className="h-4 w-4 text-amber-500 mt-0.5 shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
                    <span className="text-xs text-stone-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}