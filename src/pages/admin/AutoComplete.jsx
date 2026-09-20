import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Zap, Loader2, Shield, AlertCircle, CheckCircle2, XCircle, Clock, Activity, Target, TrendingUp, ChevronDown, ChevronRight, Cpu, Layers, Gauge } from "lucide-react";

export default function AutoComplete() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [runningRecursive, setRunningRecursive] = useState(false);
  const [cycleResult, setCycleResult] = useState(null);
  const [recursiveResult, setRecursiveResult] = useState(null);
  const [error, setError] = useState("");
  const [expandedSystem, setExpandedSystem] = useState(null);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ["autocomplete-status"],
    queryFn: () => base44.functions.invoke("autoComplete", { action: "status" }),
    refetchInterval: 30000,
  });

  const status = statusData?.data || {};
  const portfolio = status.portfolio || {};
  const systems = status.systems || [];
  const constitution = status.constitution || [];

  const runCycle = async () => {
    setRunning(true);
    setError("");
    setCycleResult(null);
    try {
      const res = await base44.functions.invoke("autoComplete", { action: "cycle" });
      setCycleResult(res.data || res);
      queryClient.invalidateQueries(["autocomplete-status"]);
    } catch (e) {
      setError(e.message || "Cycle failed");
    }
    setRunning(false);
  };

  const runRecursiveHealing = async () => {
    setRunningRecursive(true);
    setError("");
    setRecursiveResult(null);
    try {
      const res = await base44.functions.invoke("recursiveHealingEngine", {
        system_id: "epoxyquotenearme",
        max_iterations: 5,
      });
      setRecursiveResult(res.data || res);
      queryClient.invalidateQueries(["autocomplete-status"]);
    } catch (e) {
      setError(e.message || "Recursive healing failed");
    }
    setRunningRecursive(false);
  };

  const runValidation = async (systemId) => {
    try {
      await base44.functions.invoke("autoComplete", { action: "validate", system_id: systemId });
      queryClient.invalidateQueries(["autocomplete-status"]);
    } catch (e) {
      setError(e.message);
    }
  };

  const avgScore = portfolio.avg_score || 0;
  const verifiedCount = portfolio.verified_systems || 0;
  const totalSystems = portfolio.total_systems || 0;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-black p-6 border border-stone-800">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%)" }} />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-700 shadow-lg shadow-amber-500/20">
                <Zap className="h-5 w-5 text-stone-900" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Autonomous Production Readiness</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">AutoComplete</h1>
            <p className="text-stone-400 mt-2 text-sm max-w-2xl">
              Universal production readiness system. Runs the deterministic cycle:
              <span className="text-amber-400 font-semibold"> REGISTER → CONSTITUTE → BASELINE → GAP → REPAIR → VALIDATE → VERIFY</span>.
              Every 30 minutes autonomously.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={runRecursiveHealing}
              disabled={runningRecursive}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-b from-stone-800 to-black text-amber-400 font-bold text-sm border border-amber-700 shadow-lg shadow-amber-500/20 hover:brightness-125 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningRecursive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
              {runningRecursive ? "Healing..." : "Recursive Healing"}
            </button>
            <button
              onClick={runCycle}
              disabled={running}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-stone-900 font-bold text-sm border border-amber-700 shadow-lg shadow-amber-500/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {running ? "Running..." : "Run Cycle"}
            </button>
          </div>
        </div>

        {/* Inline portfolio score bar */}
        <div className="relative mt-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-stone-400 font-medium">Portfolio Readiness</span>
              <span className="text-amber-400 font-bold">{avgScore}/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-700"
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="text-white font-bold">{verifiedCount}</span>
            <span>/ {totalSystems} verified</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Layers} label="Systems" value={totalSystems} />
        <StatCard icon={CheckCircle2} label="Verified" value={verifiedCount} accent="green" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${avgScore}/100`} accent="gold" />
        <StatCard icon={AlertCircle} label="P0 Gaps" value={portfolio.total_p0 || 0} accent="red" />
        <StatCard icon={Target} label="P1 Gaps" value={portfolio.total_p1 || 0} accent="orange" />
        <StatCard icon={Clock} label="Repairs" value={portfolio.queued_repairs || 0} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation Constitution */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-stone-50 border-b border-stone-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <h2 className="font-bold text-stone-900">Validation Constitution</h2>
            <span className="ml-auto text-xs text-stone-400">{constitution.length} dimensions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-[10px] uppercase tracking-wider text-stone-400">
                  <th className="px-5 py-2.5 font-semibold">Dimension</th>
                  <th className="px-3 py-2.5 font-semibold">Weight</th>
                  <th className="px-3 py-2.5 font-semibold">Gate</th>
                  <th className="px-5 py-2.5 font-semibold">Pass Condition</th>
                </tr>
              </thead>
              <tbody>
                {constitution.map((c) => (
                  <tr key={c.dimension} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition">
                    <td className="px-5 py-2.5 font-semibold text-stone-800">{c.dimension}</td>
                    <td className="px-3 py-2.5 text-stone-500 font-mono text-xs">{c.weight}%</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                        c.gate === 'HARD'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {c.gate}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs text-stone-500">{c.pass_condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last Cycle Result */}
        {cycleResult ? (
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 bg-stone-50 border-b border-stone-200">
              <Activity className="h-4 w-4 text-amber-600" />
              <h2 className="font-bold text-stone-900">Last Cycle Result</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="text-xl font-black text-stone-800">{cycleResult.systems_processed}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Processed</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                  <div className="text-xl font-black text-green-600">{cycleResult.verified_systems}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Verified</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-xl font-black text-amber-600">{cycleResult.avg_score}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Avg Score</div>
                </div>
              </div>
              {cycleResult.results?.length > 0 && (
                <div className="space-y-1.5">
                  {cycleResult.results.map((r) => (
                    <div key={r.system_id} className="flex items-center gap-2.5 text-sm py-1.5">
                      {r.verified_100
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      <span className="font-medium text-stone-700 flex-1 truncate">{r.name}</span>
                      <span className="text-stone-400 text-xs font-mono">{r.weighted_score}/100</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 flex flex-col items-center justify-center p-8 text-center">
            <Cpu className="h-8 w-8 text-stone-300 mb-2" />
            <p className="text-sm text-stone-400 font-medium">No cycle run yet</p>
            <p className="text-xs text-stone-400 mt-1">Run a full cycle to see results</p>
          </div>
        )}
      </div>

      {/* Recursive Healing Result */}
      {recursiveResult && (
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-stone-900 to-stone-800 border-b border-stone-700">
            <Cpu className="h-4 w-4 text-amber-400" />
            <h2 className="font-bold text-white">Recursive Healing Engine</h2>
            <span className="ml-auto text-xs text-stone-400 font-mono">{recursiveResult.engine_id}</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="text-xl font-black text-stone-800">{recursiveResult.iterations_run}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Iterations</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-xl font-black text-amber-600">{recursiveResult.best_score}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Best Score</div>
              </div>
              <div className={`text-center p-3 rounded-xl border ${recursiveResult.verified_100 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`text-xl font-black ${recursiveResult.verified_100 ? 'text-green-600' : 'text-red-600'}`}>
                  {recursiveResult.verified_100 ? 'YES' : 'NO'}
                </div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Verified 100</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="text-xs font-bold text-stone-700 leading-tight">{recursiveResult.final_state?.split('—')[0]?.trim() || 'Unknown'}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Final State</div>
              </div>
            </div>
            <div className="space-y-2">
              {recursiveResult.iterations?.map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-stone-800 text-white text-xs font-bold shrink-0">{it.iteration}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-stone-700">Score: <span className="text-amber-600 font-bold">{it.score_final || it.score_after_autocomplete || 0}</span></span>
                      <span className="text-stone-400">Gaps: P0={it.p0_gaps || 0} P1={it.p1_gaps || 0}</span>
                      <span className="text-stone-400">Repairs: {it.active_repair_jobs || 0}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      AC: {it.steps?.find(s => s.step === 'autocomplete_cycle')?.ok ? '✓' : '✗'} · AP: {it.steps?.find(s => s.step === 'alpha_prime_cycle')?.ok ? '✓' : '✗'} · {it.duration_ms}ms
                    </div>
                  </div>
                  {it.verified_100 && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">{recursiveResult.final_state}</p>
          </div>
        </div>
      )}

      {/* System Scorecard */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 bg-stone-50 border-b border-stone-200">
          <Gauge className="h-4 w-4 text-amber-600" />
          <h2 className="font-bold text-stone-900">Portfolio Scorecard</h2>
          <span className="ml-auto text-xs text-stone-400">{systems.length} active systems</span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        ) : systems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-8 w-8 text-stone-300 mb-2" />
            <p className="text-sm text-stone-400">No active systems registered. Run a cycle to begin.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {systems.map((s) => (
              <div key={s.system_id}>
                <div
                  className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-stone-50 transition"
                  onClick={() => setExpandedSystem(expandedSystem === s.system_id ? null : s.system_id)}
                >
                  {s.verified
                    ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    : s.p0_count > 0
                      ? <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      : <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />}
                  {expandedSystem === s.system_id
                    ? <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-800 truncate">{s.name}</div>
                    <div className="text-xs text-stone-400 font-mono">{s.system_id}</div>
                  </div>
                  <div className="hidden sm:block w-32 h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.score >= 80 ? 'bg-green-500' : s.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-stone-800 w-10 text-right">{s.score}</span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                    s.mode === 'preservation' ? 'bg-green-100 text-green-700' :
                    s.mode === 'completion_sprint' ? 'bg-amber-100 text-amber-700' :
                    s.mode === 'degraded' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{s.mode}</span>
                </div>
                {expandedSystem === s.system_id && (
                  <div className="px-5 pb-5 pt-3 bg-stone-50 border-t border-stone-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <MiniStat label="P0 Gaps" value={s.p0_count} color={s.p0_count > 0 ? 'text-red-600' : 'text-green-600'} />
                      <MiniStat label="P1 Gaps" value={s.p1_count} color={s.p1_count > 0 ? 'text-orange-600' : 'text-green-600'} />
                      <MiniStat label="Open Gaps" value={s.open_gaps} color="text-amber-600" />
                      <MiniStat label="Active Repairs" value={s.active_repairs} color="text-purple-600" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <BenchmarkStat label="Passing" value={s.passing_benchmarks} color="text-green-600" />
                      <BenchmarkStat label="Failing" value={s.failing_benchmarks} color="text-red-600" />
                      <BenchmarkStat label="Unknown" value={s.unknown_benchmarks} color="text-stone-500" />
                    </div>
                    <button
                      onClick={() => runValidation(s.system_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:border-amber-400 hover:text-amber-600 transition"
                    >
                      <Activity className="h-3.5 w-3.5" /> Validate Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400 px-1">
        AutoComplete runs autonomously every 30 minutes. It validates all active systems against the 11-dimension constitution,
        identifies gaps, tracks repair jobs, and verifies production readiness. VERIFIED_100 requires all HARD gates to pass
        with zero mandatory FAIL/UNKNOWN.
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent = "default" }) {
  const accentMap = {
    default: { ring: "border-stone-200", icon: "text-stone-500 bg-stone-100", val: "text-stone-900" },
    green: { ring: "border-green-200", icon: "text-green-600 bg-green-50", val: "text-green-700" },
    gold: { ring: "border-amber-200", icon: "text-amber-600 bg-amber-50", val: "text-amber-700" },
    red: { ring: "border-red-200", icon: "text-red-600 bg-red-50", val: "text-red-700" },
    orange: { ring: "border-orange-200", icon: "text-orange-600 bg-orange-50", val: "text-orange-700" },
    purple: { ring: "border-purple-200", icon: "text-purple-600 bg-purple-50", val: "text-purple-700" },
  };
  const a = accentMap[accent] || accentMap.default;
  return (
    <div className={`rounded-xl border ${a.ring} bg-white p-4`}>
      <div className={`grid place-items-center w-8 h-8 rounded-lg ${a.icon} mb-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className={`text-2xl font-black ${a.val}`}>{value}</div>
      <div className="text-[10px] text-stone-400 uppercase tracking-wide font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="text-center p-2.5 rounded-lg bg-white border border-stone-200">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-stone-400 uppercase tracking-wide font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function BenchmarkStat({ label, value, color }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-stone-200">
      <span className="text-xs text-stone-500 font-medium">{label}</span>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  );
}