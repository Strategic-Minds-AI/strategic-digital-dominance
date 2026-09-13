import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Activity, AlertTriangle, CheckCircle2, XCircle, Clock, Target,
  Gauge, Wrench, ShieldCheck, FileCheck, TrendingUp, Zap, RefreshCw,
  Loader2, ArrowRight, Eye, Cpu
} from "lucide-react";

export default function ControlCenter() {
  const [showFailed, setShowFailed] = useState(false);
  const [showUnknown, setShowUnknown] = useState(false);
  const [showStale, setShowStale] = useState(false);

  // ── System Mode ──
  const { data: mode, isLoading: modeLoading } = useQuery({
    queryKey: ["systemMode"],
    queryFn: async () => {
      const res = await base44.entities.SystemMode.filter({ mode_id: "current" }, "-created_date", 1);
      return res[0] || null;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // ── Benchmark Results (latest cycle) ──
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["benchmarkResults"],
    queryFn: async () => {
      const res = await base44.entities.BenchmarkResult.list("-created_date", 200);
      return res;
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // ── Optimization Gaps ──
  const { data: gaps } = useQuery({
    queryKey: ["optimizationGaps"],
    queryFn: async () => {
      return await base44.entities.OptimizationGap.filter({ status: "open" }, "-repair_priority_score", 100);
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // ── Repair Jobs ──
  const { data: repairJobs } = useQuery({
    queryKey: ["repairJobs"],
    queryFn: async () => {
      return await base44.entities.RepairJob.list("-created_date", 100);
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // ── Regression Tests ──
  const { data: regressionTests } = useQuery({
    queryKey: ["regressionTests"],
    queryFn: async () => {
      return await base44.entities.RegressionTest.filter({ status: "active" }, "-created_date", 100);
    },
    staleTime: 60000,
  });

  // ── Run optimization cycle ──
  const runCycleMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("alphaPrimeOptimizationCycle", {});
      return res.data;
    },
  });

  // ── Run benchmark generator ──
  const generateBenchmarksMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("alphaPrimeBenchmarkGenerator", {});
      return res.data;
    },
  });

  if (modeLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        <span className="ml-2 text-sm text-stone-500">Loading 100% Control Center...</span>
      </div>
    );
  }

  const globalScore = mode?.global_score || 0;
  const distanceTo100 = mode?.distance_to_100 || 100;
  const currentMode = mode?.current_mode || "completion_sprint";
  const consecutivePasses = mode?.consecutive_pass_cycles || 0;
  const requiredPasses = mode?.required_consecutive_passes || 3;

  // Group results by status
  const passing = results?.filter((r) => r.status === "pass").length || 0;
  const failing = results?.filter((r) => r.status === "fail").length || 0;
  const unknown = results?.filter((r) => r.status === "unknown").length || 0;
  const stale = results?.filter((r) => r.status === "stale").length || 0;
  const total = results?.length || 0;

  // Repair queue
  const queuedRepairs = repairJobs?.filter((j) => j.status === "queued").length || 0;
  const inProgressRepairs = repairJobs?.filter((j) => j.status === "in_progress").length || 0;
  const validatingRepairs = repairJobs?.filter((j) => j.status === "validating" || j.status === "implemented").length || 0;
  const verifiedRepairs = repairJobs?.filter((j) => j.status === "closed").length || 0;
  const blockedRepairs = repairJobs?.filter((j) => j.status === "blocked").length || 0;

  // Top 20 gaps (fastest path to 100)
  const topGaps = (gaps || []).slice(0, 20);

  const MODE_STYLES = {
    completion_sprint: { label: "COMPLETION SPRINT", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", icon: Zap },
    preservation: { label: "PRESERVATION MODE", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", icon: ShieldCheck },
    degraded: { label: "DEGRADED", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300", icon: AlertTriangle },
    blocked: { label: "BLOCKED", color: "text-red-600", bg: "bg-red-50", border: "border-red-300", icon: XCircle },
  };
  const modeStyle = MODE_STYLES[currentMode] || MODE_STYLES.completion_sprint;
  const ModeIcon = modeStyle.icon;

  return (
    <div className="space-y-4">
      {/* ── GLOBAL SCORE + DISTANCE + MODE ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="xa-electric-hover rounded-2xl bg-gradient-to-br from-stone-950 to-stone-900 p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-bold tracking-wide text-stone-400 uppercase">Global Score</span>
          </div>
          <div className="text-4xl font-black text-amber-500">{globalScore}<span className="text-lg text-stone-500">/100</span></div>
          <div className="mt-2 h-2 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all" style={{ width: `${globalScore}%` }} />
          </div>
        </div>

        <div className="xa-electric-hover rounded-2xl bg-white border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-stone-600" />
            <span className="text-xs font-bold tracking-wide text-stone-500 uppercase">Distance to 100</span>
          </div>
          <div className="text-4xl font-black text-stone-900">{distanceTo100}<span className="text-lg text-stone-400"> pts</span></div>
          <div className="text-xs text-stone-500 mt-2">{passing} of {total} benchmarks passing</div>
        </div>

        <div className={`xa-electric-hover rounded-2xl border-2 p-5 ${modeStyle.bg} ${modeStyle.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <ModeIcon className={`h-5 w-5 ${modeStyle.color}`} />
            <span className="text-xs font-bold tracking-wide text-stone-500 uppercase">Current Mode</span>
          </div>
          <div className={`text-xl font-black ${modeStyle.color}`}>{modeStyle.label}</div>
          <div className="text-xs text-stone-500 mt-2">
            {consecutivePasses}/{requiredPasses} consecutive passes to preservation
          </div>
        </div>

        <div className="xa-electric-hover rounded-2xl bg-white border border-stone-200 p-5 flex flex-col justify-center">
          <button
            onClick={() => runCycleMutation.mutate()}
            disabled={runCycleMutation.isPending}
            className="w-full px-4 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {runCycleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Run Optimization Cycle
          </button>
          <button
            onClick={() => generateBenchmarksMutation.mutate()}
            disabled={generateBenchmarksMutation.isPending}
            className="w-full mt-2 px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generateBenchmarksMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileCheck className="h-3 w-3" />}
            Regenerate Benchmarks
          </button>
        </div>
      </div>

      {/* ── BENCHMARK SUMMARY ── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <SummaryCard icon={CheckCircle2} label="Pass" value={passing} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard icon={XCircle} label="Fail" value={failing} color="text-red-600" bg="bg-red-50" />
        <SummaryCard icon={Eye} label="Unknown" value={unknown} color="text-stone-600" bg="bg-stone-100" />
        <SummaryCard icon={Clock} label="Stale" value={stale} color="text-orange-600" bg="bg-orange-50" />
        <SummaryCard icon={AlertTriangle} label="Open P0" value={mode?.p0_count || 0} color="text-red-600" bg="bg-red-50" />
        <SummaryCard icon={AlertTriangle} label="Open P1" value={mode?.p1_count || 0} color="text-orange-600" bg="bg-orange-50" />
      </div>

      {/* ── FASTEST PATH TO 100 ── */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-stone-900">Fastest Path to 100</h2>
          <span className="text-xs text-stone-500 ml-auto">Ordered by deterministic priority score</span>
        </div>
        {topGaps.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <div className="font-bold text-emerald-800">All mandatory benchmarks passing.</div>
              <div className="text-sm text-emerald-700">System is at 100%. Preservation mode will activate after {requiredPasses - consecutivePasses} more consecutive passes.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {topGaps.map((gap, idx) => (
              <div key={gap.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200 hover:border-amber-300 transition">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${gap.severity === "P0" ? "bg-red-500 text-white" : gap.severity === "P1" ? "bg-orange-500 text-white" : "bg-stone-400 text-white"}`}>
                      {gap.severity}
                    </span>
                    <span className="text-sm font-semibold text-stone-900 truncate">{gap.benchmark_id}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">Target: {gap.target} → Actual: {gap.actual}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-amber-600">{gap.repair_priority_score}</div>
                  <div className="text-xs text-stone-400">priority</div>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── REPAIR + VALIDATION QUEUE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-stone-900">Repair Queue</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <QueueStat label="Queued" value={queuedRepairs} color="text-stone-600" />
            <QueueStat label="In Progress" value={inProgressRepairs} color="text-blue-600" />
            <QueueStat label="Validating" value={validatingRepairs} color="text-amber-600" />
            <QueueStat label="Verified (Closed)" value={verifiedRepairs} color="text-emerald-600" />
            <QueueStat label="Blocked (Approval)" value={blockedRepairs} color="text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-stone-900">Regression Coverage</h2>
          </div>
          <div className="text-3xl font-black text-stone-900">{regressionTests?.length || 0}</div>
          <div className="text-xs text-stone-500 mt-1">active regression tests preventing defect recurrence</div>
          {regressionTests && regressionTests.length > 0 && (
            <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
              {regressionTests.slice(0, 5).map((rt) => (
                <div key={rt.id} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-stone-600 truncate">{rt.benchmark_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── LAST + NEXT CYCLE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-stone-500" />
            <span className="text-xs font-bold text-stone-500 uppercase">Last Full Cycle</span>
          </div>
          <div className="text-sm font-semibold text-stone-900">
            {mode?.last_full_cycle ? new Date(mode.last_full_cycle).toLocaleString() : "Never"}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-stone-500" />
            <span className="text-xs font-bold text-stone-500 uppercase">Next Full Cycle</span>
          </div>
          <div className="text-sm font-semibold text-stone-900">
            {mode?.next_full_cycle ? new Date(mode.next_full_cycle).toLocaleString() : "Pending"}
          </div>
        </div>
      </div>

      {/* ── CYCLE RESULT ── */}
      {runCycleMutation.data && (
        <div className="bg-stone-950 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">Last Cycle Result</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><span className="text-stone-400">Score:</span> <span className="font-bold text-amber-500">{runCycleMutation.data.final_state?.global_score}/100</span></div>
            <div><span className="text-stone-400">Pass:</span> <span className="font-bold text-emerald-400">{runCycleMutation.data.final_state?.pass}</span></div>
            <div><span className="text-stone-400">Fail:</span> <span className="font-bold text-red-400">{runCycleMutation.data.final_state?.fail}</span></div>
            <div><span className="text-stone-400">P0:</span> <span className="font-bold text-red-400">{runCycleMutation.data.final_state?.p0}</span></div>
            <div><span className="text-stone-400">P1:</span> <span className="font-bold text-orange-400">{runCycleMutation.data.final_state?.p1}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl border border-stone-200 p-3`}>
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-xl font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-600">{label}</div>
    </div>
  );
}

function QueueStat({ label, value, color }) {
  return (
    <div className="bg-stone-50 rounded-lg p-2 border border-stone-200">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}