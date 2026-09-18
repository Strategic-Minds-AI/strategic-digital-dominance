import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, TrendingUp, DollarSign, Target, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SimulationEngine({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [domain, setDomain] = useState("");
  const [scenarios, setScenarios] = useState(5);
  const [iterations, setIterations] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSimulate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "runSimulation",
        keyword,
        city,
        state,
        domain,
        niche: selectedNiche?.id,
        scenarios,
        iterations,
      });
      setResult(res.data);
    } catch (e) {
      setError(e.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Play className="h-5 w-5 text-amber-500" />
            Simulation & Prediction Engine
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Runs multiple parallel predictions using deterministic, programmatic, and analytic data combined with economic data, business data, and search psychology. Includes probability of success and estimated revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="epoxy garage floor" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City (optional)</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Orlando" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Domain (optional)</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="epoxygaragenearme.com" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Scenarios (parallel)</label>
            <input type="number" value={scenarios} onChange={(e) => setScenarios(Math.min(Number(e.target.value), 10))} min={1} max={10} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Iterations</label>
            <input type="number" value={iterations} onChange={(e) => setIterations(Math.min(Number(e.target.value), 500))} min={10} max={500} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
        </div>

        <button onClick={handleSimulate} disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "Running parallel simulations..." : "Run Parallel Simulations"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !result && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Running {scenarios} parallel simulations with {iterations} iterations each...</p>
          <p className="text-xs text-stone-400">Analyzing search volume, CTR, conversion rates, competition, economics, and search psychology.</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Aggregate */}
          {result.aggregate && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <Target className="h-5 w-5 text-amber-500 mb-1" />
                <div className="text-2xl font-black text-amber-600">{result.aggregate.avg_probability}%</div>
                <div className="text-xs text-amber-700 mt-0.5">Avg Probability of Success</div>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                <DollarSign className="h-5 w-5 text-emerald-500 mb-1" />
                <div className="text-2xl font-black text-emerald-600">${(result.aggregate.avg_annual_revenue / 1000).toFixed(0)}K</div>
                <div className="text-xs text-emerald-700 mt-0.5">Avg Annual Revenue</div>
              </div>
              <div className="bg-stone-900 rounded-xl border border-stone-700 p-4 text-white">
                <TrendingUp className="h-5 w-5 text-amber-400 mb-1" />
                <div className="text-2xl font-black text-amber-400">${(result.aggregate.best_scenario_revenue / 1000).toFixed(0)}K</div>
                <div className="text-xs text-stone-300 mt-0.5">Best Scenario Revenue</div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <RefreshCw className="h-5 w-5 text-stone-400 mb-1" />
                <div className="text-2xl font-black text-stone-900">{result.aggregate.iterations_simulated}</div>
                <div className="text-xs text-stone-500 mt-0.5">Iterations Simulated</div>
              </div>
            </div>
          )}

          {/* Individual scenarios */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Simulation Scenarios ({result.scenarios?.length || 0})</h3>
            {result.scenarios?.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{s.scenario_name}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">{s.assumptions}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${s.confidence_level === "high" ? "bg-emerald-100 text-emerald-700" : s.confidence_level === "medium" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
                    {s.confidence_level} confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Prob. of Success</p>
                    <p className="font-bold text-amber-600 text-base">{s.probability_of_success}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Monthly Traffic</p>
                    <p className="font-bold text-stone-900">{s.estimated_monthly_traffic?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Monthly Leads</p>
                    <p className="font-bold text-stone-900">{s.estimated_monthly_leads}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Monthly Revenue</p>
                    <p className="font-bold text-emerald-600">${s.estimated_monthly_revenue?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Annual Revenue</p>
                    <p className="font-bold text-emerald-600">${s.estimated_annual_revenue?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Profit Margin</p>
                    <p className="font-bold text-stone-900">{s.estimated_profit_margin}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">Break Even</p>
                    <p className="font-bold text-stone-900">{s.time_to_break_even} months</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50">
                    <p className="text-stone-500">12-Mo ROI</p>
                    <p className="font-bold text-emerald-600">{s.roi_12_month}%</p>
                  </div>
                </div>

                {s.key_risks?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-3 w-3" /> Key Risks
                    </p>
                    <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5">
                      {s.key_risks.map((r, j) => <li key={j}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {s.key_opportunities?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="h-3 w-3" /> Key Opportunities
                    </p>
                    <ul className="text-xs text-stone-600 list-disc list-inside space-y-0.5">
                      {s.key_opportunities.map((o, j) => <li key={j}>{o}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}