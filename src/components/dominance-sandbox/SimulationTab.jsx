import React, { useState, useEffect, useCallback } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity, Loader2, CheckCircle2, Save, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSandbox } from "./SandboxContext";
import SandboxCard from "./SandboxCard";

const WEEKS = [1, 2, 3, 4, 8, 12, 26, 52];

const DEFAULTS = {
  contentVolume: 50,
  postingFrequency: 3,
  backlinkRate: 10,
  competitionLevel: 50,
  cpc: 12,
  conversionRate: 4,
  orderValue: 2500,
  budget: 500,
};

export default function SimulationTab() {
  const { campaign, updateCampaign, markTabComplete, setActiveTab } = useSandbox();
  const [vars, setVars] = useState(DEFAULTS);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);

  const runSimulation = useCallback(async () => {
    setSimulating(true);
    try {
      let seoScore = 30;
      try {
        const res = await base44.functions.invoke("seoAeoSimulator", {
          keyword: campaign.keyword,
          city: campaign.city,
        });
        seoScore = res?.data?.score || res?.score || 30;
      } catch {}

      // Statistical projection model
      const baseTraffic = (campaign.economicGate?.monthlySearches || 500) * 0.02;
      const contentBoost = Math.min(vars.contentVolume * 0.3, 40);
      const socialBoost = Math.min(vars.postingFrequency * 2, 15);
      const backlinkBoost = Math.min(vars.backlinkRate * 0.5, 20);
      const competitionDrag = vars.competitionLevel * 0.3;
      const budgetBoost = Math.min(vars.budget / 50, 15);

      const weeklyData = WEEKS.map((week) => {
        const growthFactor = Math.log(week + 1) / Math.log(53);
        const trafficMultiplier = 1 + (contentBoost + socialBoost + backlinkBoost + budgetBoost - competitionDrag) / 100;
        const trafficMid = Math.round(baseTraffic * growthFactor * trafficMultiplier);
        const trafficLow = Math.round(trafficMid * 0.5);
        const trafficHigh = Math.round(trafficMid * 1.8);

        const clicksMid = Math.round(trafficMid * 0.35);
        const leadsMid = Math.round(clicksMid * (vars.conversionRate / 100));
        const revenueMid = Math.round(leadsMid * vars.orderValue * 0.3);

        const timeToRank = Math.max(1, Math.round(52 - (contentBoost + backlinkBoost + budgetBoost) * 0.8));

        return {
          week,
          trafficLow,
          trafficMid,
          trafficHigh,
          clicks: clicksMid,
          leads: leadsMid,
          revenue: revenueMid,
          timeToRank,
        };
      });

      const frontPageWeek = weeklyData.find((w) => w.trafficMid > baseTraffic * 3)?.week || 26;

      setResults({
        weeklyData,
        frontPageWeek,
        totalLeads: weeklyData.reduce((a, w) => a + w.leads, 0),
        totalRevenue: weeklyData.reduce((a, w) => a + w.revenue, 0),
        seoScore,
      });

      updateCampaign({ simConfig: vars });
    } catch {
      // fallback
    } finally {
      setSimulating(false);
    }
  }, [campaign, vars, updateCampaign]);

  useEffect(() => {
    const timer = setTimeout(() => runSimulation(), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vars.contentVolume, vars.postingFrequency, vars.backlinkRate, vars.competitionLevel, vars.budget]);

  const saveScenario = () => {
    setSavedScenarios((prev) => [...prev, { vars: { ...vars }, results }]);
  };

  const advance = () => {
    markTabComplete("simulation");
    setActiveTab("launch");
  };

  const chartData = results?.weeklyData.map((d) => ({
    week: `W${d.week}`,
    Low: d.trafficLow,
    Mid: d.trafficMid,
    High: d.trafficHigh,
  })) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Variable controls */}
        <SandboxCard title="Simulation Variables" icon={Activity} subtitle="Adjust to model outcomes">
          <div className="space-y-3">
            <Slider label="Content Volume" value={vars.contentVolume} min={10} max={500} step={10} onChange={(v) => setVars({ ...vars, contentVolume: v })} suffix=" pages" />
            <Slider label="Posting Frequency" value={vars.postingFrequency} min={1} max={10} step={1} onChange={(v) => setVars({ ...vars, postingFrequency: v })} suffix="x/day" />
            <Slider label="Backlink Rate" value={vars.backlinkRate} min={0} max={50} step={1} onChange={(v) => setVars({ ...vars, backlinkRate: v })} suffix="/mo" />
            <Slider label="Competition Level" value={vars.competitionLevel} min={0} max={100} step={5} onChange={(v) => setVars({ ...vars, competitionLevel: v })} suffix="%" />
            <Slider label="CPC" value={vars.cpc} min={1} max={50} step={1} onChange={(v) => setVars({ ...vars, cpc: v })} prefix="$" />
            <Slider label="Conversion Rate" value={vars.conversionRate} min={1} max={20} step={0.5} onChange={(v) => setVars({ ...vars, conversionRate: v })} suffix="%" />
            <Slider label="Order Value" value={vars.orderValue} min={500} max={10000} step={100} onChange={(v) => setVars({ ...vars, orderValue: v })} prefix="$" />
            <Slider label="Monthly Budget" value={vars.budget} min={0} max={2000} step={50} onChange={(v) => setVars({ ...vars, budget: v })} prefix="$" />
          </div>
        </SandboxCard>

        {/* Chart */}
        <div className="lg:col-span-2 space-y-4">
          <SandboxCard title="Week-by-Week Traffic Projection" icon={TrendingUp} subtitle="Low / Mid / High confidence range">
            {simulating ? (
              <div className="flex items-center justify-center h-64 text-stone-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Running simulation...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#71717A" />
                  <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="#71717A" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4, border: "1px solid #E4E4E7" }} />
                  <Area type="monotone" dataKey="High" stroke="#16A34A" fill="none" strokeDasharray="4 4" name="High" />
                  <Area type="monotone" dataKey="Mid" stroke="#D97706" fill="url(#trafficGrad)" name="Mid" strokeWidth={2} />
                  <Area type="monotone" dataKey="Low" stroke="#DC2626" fill="none" strokeDasharray="4 4" name="Low" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </SandboxCard>

          {/* Outcome summary */}
          {results && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SandboxCard>
                <div className="ds-label text-stone-500 mb-1">Front Page ETA</div>
                <div className="ds-font-mono text-xl font-bold text-amber-600">Wk {results.frontPageWeek}</div>
              </SandboxCard>
              <SandboxCard>
                <div className="ds-label text-stone-500 mb-1">Total Leads (1yr)</div>
                <div className="ds-font-mono text-xl font-bold text-stone-900">{results.totalLeads.toLocaleString()}</div>
              </SandboxCard>
              <SandboxCard>
                <div className="ds-label text-stone-500 mb-1">Total Revenue (1yr)</div>
                <div className="ds-font-mono text-xl font-bold text-green-600">${results.totalRevenue.toLocaleString()}</div>
              </SandboxCard>
              <SandboxCard>
                <div className="ds-label text-stone-500 mb-1">SEO Score</div>
                <div className="ds-font-mono text-xl font-bold text-stone-900">{results.seoScore}/100</div>
              </SandboxCard>
            </div>
          )}
        </div>
      </div>

      {/* Week-by-week table */}
      {results && (
        <SandboxCard title="Detailed Weekly Outcomes" icon={Activity} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="ds-label text-stone-500 text-left px-4 py-2">Week</th>
                  <th className="ds-label text-stone-500 text-right px-4 py-2">Traffic (Low-Mid-High)</th>
                  <th className="ds-label text-stone-500 text-right px-4 py-2">Clicks</th>
                  <th className="ds-label text-stone-500 text-right px-4 py-2">Leads</th>
                  <th className="ds-label text-stone-500 text-right px-4 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {results.weeklyData.map((w) => (
                  <tr key={w.week} className="border-b border-stone-100">
                    <td className="ds-font-mono text-stone-900 px-4 py-2 font-semibold">W{w.week}</td>
                    <td className="ds-font-mono text-stone-600 px-4 py-2 text-right">
                      {w.trafficLow} — <span className="text-amber-600 font-semibold">{w.trafficMid}</span> — {w.trafficHigh}
                    </td>
                    <td className="ds-font-mono text-stone-600 px-4 py-2 text-right">{w.clicks}</td>
                    <td className="ds-font-mono text-stone-600 px-4 py-2 text-right">{w.leads}</td>
                    <td className="ds-font-mono text-green-600 px-4 py-2 text-right font-semibold">${w.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SandboxCard>
      )}

      <div className="flex justify-between">
        <button onClick={saveScenario} className="ds-btn-ghost">
          <Save className="h-4 w-4" /> Save Scenario ({savedScenarios.length})
        </button>
        <button onClick={advance} disabled={!results} className="ds-btn-primary">
          <CheckCircle2 className="h-4 w-4" /> Accept Simulation & Advance to Launch
        </button>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, prefix, suffix }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="ds-label text-stone-500">{label}</span>
        <span className="ds-font-mono text-sm font-semibold text-stone-900">
          {prefix}{value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-600"
      />
    </div>
  );
}