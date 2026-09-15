import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Zap, Loader2, Shield, AlertCircle, CheckCircle2, XCircle, Clock, Activity, Target, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AutoComplete() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [cycleResult, setCycleResult] = useState(null);
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

  const runValidation = async (systemId) => {
    try {
      await base44.functions.invoke("autoComplete", { action: "validate", system_id: systemId });
      queryClient.invalidateQueries(["autocomplete-status"]);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-600" /> AutoComplete
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            Universal production readiness system. Runs the deterministic cycle: REGISTER → CONSTITUTE → BASELINE → GAP → REPAIR → VALIDATE → VERIFY. Every 30 minutes autonomously.
          </p>
        </div>
        <Button onClick={runCycle} disabled={running} size="lg">
          {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          {running ? "Running Cycle..." : "Run Full Cycle"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Portfolio Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon={Activity} label="Systems" value={portfolio.total_systems || 0} color="text-blue-600" />
        <StatCard icon={CheckCircle2} label="Verified" value={portfolio.verified_systems || 0} color="text-green-600" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${portfolio.avg_score || 0}/100`} color="text-amber-600" />
        <StatCard icon={AlertCircle} label="P0 Gaps" value={portfolio.total_p0 || 0} color="text-red-600" />
        <StatCard icon={Target} label="P1 Gaps" value={portfolio.total_p1 || 0} color="text-orange-600" />
        <StatCard icon={Clock} label="Repairs" value={portfolio.queued_repairs || 0} color="text-purple-600" />
      </div>

      {/* Validation Constitution */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Validation Constitution</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-stone-500">
                <th className="pb-2 pr-4">Dimension</th>
                <th className="pb-2 pr-4">Weight</th>
                <th className="pb-2 pr-4">Gate</th>
                <th className="pb-2 pr-4">Pass Condition</th>
              </tr>
            </thead>
            <tbody>
              {constitution.map((c) => (
                <tr key={c.dimension} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{c.dimension}</td>
                  <td className="py-2 pr-4">{c.weight}%</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.gate === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.gate}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-stone-600">{c.pass_condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cycle Result */}
      {cycleResult && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Last Cycle Result</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-stone-50">
              <div className="text-2xl font-bold">{cycleResult.systems_processed}</div>
              <div className="text-xs text-stone-500">Systems Processed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">{cycleResult.verified_systems}</div>
              <div className="text-xs text-stone-500">Verified</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50">
              <div className="text-2xl font-bold text-amber-600">{cycleResult.avg_score}</div>
              <div className="text-xs text-stone-500">Avg Score</div>
            </div>
          </div>
          {cycleResult.results?.length > 0 && (
            <div className="space-y-2">
              {cycleResult.results.map((r) => (
                <div key={r.system_id} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                  {r.verified_100 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="font-medium flex-1">{r.name}</span>
                  <span className="text-stone-500 text-xs">{r.weighted_score}/100</span>
                  <span className="text-stone-500 text-xs">{r.open_gaps} gaps</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* System Scorecard */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Portfolio Scorecard</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-stone-400" /></div>
        ) : systems.length === 0 ? (
          <p className="text-sm text-stone-400">No active systems registered. Run a cycle to begin.</p>
        ) : (
          <div className="space-y-2">
            {systems.map((s) => (
              <div key={s.system_id} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50"
                  onClick={() => setExpandedSystem(expandedSystem === s.system_id ? null : s.system_id)}
                >
                  {s.verified ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> :
                    s.p0_count > 0 ? <XCircle className="h-4 w-4 text-red-500 shrink-0" /> :
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                  {expandedSystem === s.system_id ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
                  <span className="font-medium flex-1">{s.name}</span>
                  <span className="text-xs text-stone-500">{s.system_id}</span>
                  <div className="w-24 h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div className={`h-full rounded-full ${s.score >= 80 ? 'bg-green-500' : s.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{s.score}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    s.mode === 'preservation' ? 'bg-green-100 text-green-700' :
                    s.mode === 'completion_sprint' ? 'bg-amber-100 text-amber-700' :
                    s.mode === 'degraded' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{s.mode}</span>
                </div>
                {expandedSystem === s.system_id && (
                  <div className="px-6 pb-4 pt-2 bg-stone-50 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <MiniStat label="P0 Gaps" value={s.p0_count} color={s.p0_count > 0 ? 'text-red-600' : 'text-green-600'} />
                      <MiniStat label="P1 Gaps" value={s.p1_count} color={s.p1_count > 0 ? 'text-orange-600' : 'text-green-600'} />
                      <MiniStat label="Open Gaps" value={s.open_gaps} color="text-amber-600" />
                      <MiniStat label="Active Repairs" value={s.active_repairs} color="text-purple-600" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                      <div><span className="text-stone-500">Passing:</span> <span className="font-bold text-green-600">{s.passing_benchmarks}</span></div>
                      <div><span className="text-stone-500">Failing:</span> <span className="font-bold text-red-600">{s.failing_benchmarks}</span></div>
                      <div><span className="text-stone-500">Unknown:</span> <span className="font-bold text-stone-500">{s.unknown_benchmarks}</span></div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => runValidation(s.system_id)}>
                      <Activity className="h-3.5 w-3.5 mr-1.5" /> Validate Now
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400">
        AutoComplete runs autonomously every 30 minutes. It validates all active systems against the 11-dimension constitution (Build, Lint, Type, Security, Data, E2E, Mobile, Performance, SEO, Accessibility, Documentation), identifies gaps, tracks repair jobs, and verifies production readiness. VERIFIED_100 requires all HARD gates to pass with zero mandatory FAIL/UNKNOWN.
      </p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div className="text-xs text-stone-500">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="text-center p-2 rounded-lg bg-white border">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}