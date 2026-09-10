import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Activity, AlertTriangle, CheckCircle2, TrendingUp, Zap, Target,
  ArrowRight, Loader2, Gauge, Database, Brain, Network, Bot, Workflow,
  Users, Globe, Eye, DollarSign, Lightbulb, ChevronRight, AlertCircle,
  Rocket, Wrench
} from "lucide-react";

const SUBSYSTEM_META = {
  data_quality: { icon: Database, label: "Data Quality", color: "text-blue-600", bg: "bg-blue-50" },
  rag_quality: { icon: Brain, label: "RAG Quality", color: "text-purple-600", bg: "bg-purple-50" },
  graph_quality: { icon: Network, label: "Graph Quality", color: "text-amber-600", bg: "bg-amber-50" },
  agents: { icon: Bot, label: "Agents", color: "text-indigo-600", bg: "bg-indigo-50" },
  automation: { icon: Workflow, label: "Automation", color: "text-cyan-600", bg: "bg-cyan-50" },
  lead_generation: { icon: Users, label: "Lead Generation", color: "text-emerald-600", bg: "bg-emerald-50" },
  website_factory: { icon: Globe, label: "Website Factory", color: "text-orange-600", bg: "bg-orange-50" },
  observability: { icon: Eye, label: "Observability", color: "text-stone-600", bg: "bg-stone-50" },
  cost_efficiency: { icon: DollarSign, label: "Cost Efficiency", color: "text-green-600", bg: "bg-green-50" },
};

const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
  info: "bg-stone-100 text-stone-600 border-stone-200",
};

const IMPACT_COLORS = {
  critical: "text-red-600",
  high: "text-orange-600",
  medium: "text-amber-600",
  low: "text-blue-600",
};

function scoreColor(s) {
  if (s >= 80) return "text-emerald-600";
  if (s >= 60) return "text-amber-600";
  if (s >= 40) return "text-orange-600";
  return "text-red-600";
}
function scoreBar(s) {
  if (s >= 80) return "bg-emerald-500";
  if (s >= 60) return "bg-amber-500";
  if (s >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export default function SystemHealth() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);

  const { data: latestData, isLoading } = useQuery({
    queryKey: ["systemHealthLatest"],
    queryFn: async () => {
      const res = await base44.functions.invoke("systemAuditor", { action: "getLatest" });
      return res.data;
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ["systemHealthHistory"],
    queryFn: async () => {
      const res = await base44.functions.invoke("systemAuditor", { action: "getHistory" });
      return res.data;
    },
  });

  const runAudit = useMutation({
    mutationFn: () => base44.functions.invoke("systemAuditor", { action: "fullAudit", triggered_by: "manual" }),
    onMutate: () => setRunning(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemHealthLatest"] });
      queryClient.invalidateQueries({ queryKey: ["systemHealthHistory"] });
      setRunning(false);
    },
    onError: () => setRunning(false),
  });

  const audit = latestData?.audit;
  const history = historyData?.audits || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!audit && !running) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-amber-500" /> System Health & Intelligence Auditor
            </h1>
            <p className="text-stone-500 mt-1">
              The permanent subsystem that continuously inspects the entire platform, calculates a System
              Optimality Score, and identifies the next best action.
            </p>
          </div>
          <Button onClick={() => runAudit.mutate()} disabled={running} className="bg-amber-500 hover:bg-amber-400 text-stone-950">
            {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Run Full Audit
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Gauge className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-stone-900">No audit has been run yet</h2>
          <p className="text-stone-500 mt-1">Run the first comprehensive system audit to establish a baseline.</p>
          <Button onClick={() => runAudit.mutate()} disabled={running} className="mt-4 bg-amber-500 hover:bg-amber-400 text-stone-950">
            {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Run Full System Audit
          </Button>
        </div>
      </div>
    );
  }

  const scores = audit?.subsystem_scores || {};
  const findings = audit?.findings || [];
  const improvements = audit?.next_improvements || [];
  const metrics = audit?.metrics || {};
  const ec = metrics.entity_counts || {};
  const lq = metrics.lead_quality || {};
  const wf = metrics.website_factory || {};
  const au = metrics.automation || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-amber-500" /> System Health & Intelligence Auditor
          </h1>
          <p className="text-stone-500 mt-1">
            Continuous optimization dashboard — the system inspects itself, scores its own health, and
            recommends its own next improvement.
          </p>
        </div>
        <Button onClick={() => runAudit.mutate()} disabled={running} className="bg-amber-500 hover:bg-amber-400 text-stone-950">
          {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
          {running ? "Auditing..." : "Run Full Audit"}
        </Button>
      </div>

      {/* Overall Score + Bottleneck + Next Action */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl p-6 text-white flex flex-col items-center justify-center">
          <Gauge className="h-8 w-8 text-amber-400 mb-2" />
          <div className={`text-6xl font-black ${scoreColor(audit?.overall_score || 0)}`}>
            {audit?.overall_score ?? "—"}
          </div>
          <div className="text-sm text-stone-400 mt-1 tracking-wide">SYSTEM OPTIMALITY SCORE</div>
          <div className="text-xs text-stone-500 mt-2">
            {audit?.duration_ms ? `Audited in ${(audit.duration_ms / 1000).toFixed(1)}s` : ""}
          </div>
        </div>

        {/* Bottleneck */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-stone-900">Current Bottleneck</h3>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">{audit?.bottleneck || "—"}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Lowest-scoring subsystem — highest impact improvement target
          </div>
        </div>

        {/* Next Best Action */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-stone-900">Next Best Action</h3>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">{audit?.next_best_action || "—"}</p>
        </div>
      </div>

      {/* Subsystem Scores */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-amber-500" /> Subsystem Scores
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
          {Object.entries(SUBSYSTEM_META).map(([key, meta]) => {
            const score = scores[key] ?? 0;
            const Icon = meta.icon;
            return (
              <div key={key} className={`${meta.bg} rounded-xl p-3 border border-stone-100`}>
                <Icon className={`h-4 w-4 ${meta.color} mb-1.5`} />
                <div className={`text-2xl font-black ${scoreColor(score)}`}>{score}</div>
                <div className="text-[10px] text-stone-500 font-medium leading-tight">{meta.label}</div>
                <div className="mt-2 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div className={`h-full ${scoreBar(score)} rounded-full transition-all`} style={{ width: `${score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard icon={Users} label="Leads" value={ec.leads || 0} color="text-emerald-600" />
        <MetricCard icon={Globe} label="Sites Deployed" value={`${wf.deployed || 0}/${wf.total || 0}`} color="text-orange-600" />
        <MetricCard icon={CheckCircle2} label="Tasks Done" value={au.completed || 0} color="text-cyan-600" />
        <MetricCard icon={AlertTriangle} label="Tasks Failed" value={au.failed || 0} color="text-red-600" />
        <MetricCard icon={Zap} label="Competitors" value={ec.competitors || 0} color="text-amber-600" />
        <MetricCard icon={Brain} label="Strategy Docs" value={ec.strategy_docs || 0} color="text-purple-600" />
        <MetricCard icon={Target} label="Conversion" value={`${lq.conversion_rate || 0}%`} color="text-blue-600" />
        <MetricCard icon={Activity} label="SOP Logs" value={ec.sop_logs || 0} color="text-stone-600" />
      </div>

      {/* Findings + Improvements */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Findings */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Audit Findings ({findings.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {findings.length === 0 && (
              <div className="text-center py-6 text-stone-400">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                No issues found — all systems operational.
              </div>
            )}
            {findings.map((f, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-start gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border shrink-0 ${SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.info}`}>
                    {f.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 font-medium">{f.finding}</p>
                    {f.recommendation && (
                      <p className="text-xs text-stone-500 mt-1 flex items-start gap-1">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0" />
                        {f.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Improvements */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Top Improvements (ranked by impact)
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {improvements.map((imp, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-3 flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-stone-400 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 font-medium">{imp.action}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-medium ${IMPACT_COLORS[imp.impact] || ""}`}>
                      {imp.impact} impact
                    </span>
                    <span className="text-xs text-stone-400">{imp.effort} effort</span>
                    {imp.score_delta > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">+{imp.score_delta} pts</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" /> Audit History ({history.length})
          </h2>
          <div className="space-y-2">
            {history.slice(0, 10).map((h, i) => (
              <div key={h.id || i} className="flex items-center gap-3 text-sm border-b border-stone-100 last:border-0 py-2">
                <span className={`text-lg font-bold ${scoreColor(h.overall_score || 0)}`}>{h.overall_score}</span>
                <span className="text-stone-500">{new Date(h.created_date).toLocaleString()}</span>
                <span className="text-stone-400 text-xs ml-auto">{h.bottleneck}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}