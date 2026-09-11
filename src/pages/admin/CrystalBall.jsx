import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, TrendingUp, Loader2, Award, Database, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const VERDICT_COLORS = {
  "Skyrocketing": "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  "Strong Growth": "bg-lime-500/20 text-lime-400 border-lime-500/40",
  "Steady": "bg-amber-500/20 text-amber-400 border-amber-500/40",
  "Stagnant": "bg-orange-500/20 text-orange-400 border-orange-500/40",
  "Declining": "bg-red-500/20 text-red-400 border-red-500/40",
  "No Data": "bg-stone-700/20 text-stone-500 border-stone-700",
};

const CHART_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function CrystalBall() {
  const [years, setYears] = useState(5);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["crystalBall", years],
    queryFn: async () => {
      const res = await base44.functions.invoke("tradeCrystalBall", { action: "analyze", years });
      return res.data;
    },
    staleTime: 300000,
  });

  const industries = data?.industries || [];

  const chartData = useMemo(() => {
    if (!industries.length) return [];
    const top5 = industries.slice(0, 5);
    const allYears = new Set();
    top5.forEach((ind) => {
      ind.history.forEach((h) => allYears.add(h.year));
      ind.projection.forEach((p) => allYears.add(p.year));
    });
    const sortedYears = Array.from(allYears).sort();
    return sortedYears.map((year) => {
      const row = { year };
      top5.forEach((ind) => {
        const hist = ind.history.find((h) => h.year === year);
        const proj = ind.projection.find((p) => p.year === year);
        if (hist) row[ind.name] = hist.employment;
        else if (proj) row[ind.name] = proj.employment;
      });
      return row;
    });
  }, [industries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Trade Industry Crystal Ball
          </h1>
          <p className="text-stone-500 text-sm mt-1 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Real BLS employment data + deterministic CAGR projections — no AI, no guessing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-3 py-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Project</label>
            <input type="range" min="1" max="15" value={years} onChange={(e) => setYears(parseInt(e.target.value))} className="w-24 accent-amber-500" />
            <span className="text-sm font-bold text-stone-900 w-8">{years}yr</span>
          </div>
          <button onClick={() => refetch()} disabled={isFetching} className="px-3 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-stone-800 disabled:opacity-60">
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-3 text-stone-500 text-sm">Fetching real BLS data...</span>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard label="Industries Analyzed" value={data.summary.total_analyzed} icon={Database} color="text-stone-700" />
            <SummaryCard label="Skyrocketing" value={data.summary.skyrocketing_count} icon={TrendingUp} color="text-emerald-600" />
            <SummaryCard label="Strong Growth" value={data.summary.strong_growth_count} icon={Award} color="text-lime-600" />
            <SummaryCard label="Avg CAGR" value={`${data.summary.avg_employment_cagr}%`} icon={TrendingUp} color="text-amber-600" />
            <SummaryCard label="Top Industry" value={data.summary.top_industry.split(" ")[0]} icon={Sparkles} color="text-amber-600" />
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">Top 5 Industries — Historical + Projected Employment</h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid #44403c", borderRadius: 8, color: "#fff" }} labelStyle={{ color: "#fbbf24" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {industries.slice(0, 5).map((ind, i) => (
                    <Line key={ind.naics} type="monotone" dataKey={ind.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-stone-400 mt-2">Historical BLS data + projected forward {years} years via CAGR</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Industry Rankings — by Growth Velocity Score</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold">#</th>
                    <th className="text-left px-4 py-3 font-bold">Industry</th>
                    <th className="text-right px-4 py-3 font-bold">Emp (K)</th>
                    <th className="text-right px-4 py-3 font-bold">10yr CAGR</th>
                    <th className="text-right px-4 py-3 font-bold">3yr Growth</th>
                    <th className="text-right px-4 py-3 font-bold">Wage CAGR</th>
                    <th className="text-right px-4 py-3 font-bold">{years}yr Proj</th>
                    <th className="text-right px-4 py-3 font-bold">Score</th>
                    <th className="text-center px-4 py-3 font-bold">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {industries.map((ind, i) => (
                    <tr key={ind.naics} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-bold text-stone-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900">{ind.name}</div>
                        <div className="text-xs text-stone-400">
                          {ind.category} · NAICS {ind.naics}
                          {ind.proxy_of && <span className="text-amber-600"> · proxy: {ind.proxy_of}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{ind.current_employment.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className={ind.employment_10yr_cagr >= 2 ? "text-emerald-600 font-bold" : ind.employment_10yr_cagr >= 0 ? "text-amber-600" : "text-red-600"}>
                          {ind.employment_10yr_cagr > 0 ? "+" : ""}{ind.employment_10yr_cagr}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-stone-600">{ind.employment_3yr_growth > 0 ? "+" : ""}{ind.employment_3yr_growth}%</td>
                      <td className="px-4 py-3 text-right font-mono text-stone-600">{ind.wage_10yr_cagr}%</td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className="text-stone-900 font-semibold">{ind.projected_employment.toFixed(1)}K</span>
                        <span className={`text-xs ml-1 ${ind.projected_growth_pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          ({ind.projected_growth_pct > 0 ? "+" : ""}{ind.projected_growth_pct}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900">{ind.growth_velocity_score}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${VERDICT_COLORS[ind.verdict] || VERDICT_COLORS["No Data"]}`}>
                          {ind.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-stone-900 rounded-2xl p-4 flex items-start gap-3">
            <Database className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-400 space-y-1">
              <div><span className="font-bold text-stone-300">Data Source:</span> {data.data_source}</div>
              <div><span className="font-bold text-stone-300">Fetched:</span> {new Date(data.fetched_at).toLocaleString()}</div>
              <div><span className="font-bold text-stone-300">Method:</span> 10-year CAGR from real BLS CES employment data, projected forward {years} years deterministically. No AI — pure math on government data.</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}