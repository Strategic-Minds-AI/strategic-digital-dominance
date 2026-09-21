import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Building2, Cpu, Rocket, CheckCircle2, AlertCircle, Clock,
  Activity, Zap, Target, Users, Globe, Database, Cloud, Monitor,
  MessageSquare, Mail, BarChart3, Play, RefreshCw, Loader2,
  Server, Shield, GitBranch, Box, ArrowRight, Sparkles, Brain,
  Network, Wrench, Eye, TestTube, Crown, ExternalLink
} from "lucide-react";

const DEPT_ICONS = {
  executive: Crown,
  engineering: Cpu,
  qa: TestTube,
  marketing: BarChart3,
  sales: Target,
  communications: MessageSquare,
  reputation: Shield,
  operations: Network,
  infrastructure: Server,
  product: Brain,
  custom: Box
};

const STATUS_COLORS = {
  healthy: "bg-green-100 text-green-700 border-green-300",
  degraded: "bg-amber-100 text-amber-700 border-amber-300",
  unhealthy: "bg-red-100 text-red-700 border-red-300",
  unknown: "bg-stone-100 text-stone-500 border-stone-300"
};

const SESSION_STATUS_COLORS = {
  planning: "bg-stone-100 text-stone-600",
  generating: "bg-blue-100 text-blue-700",
  testing: "bg-purple-100 text-purple-700",
  validating: "bg-amber-100 text-amber-700",
  deploying: "bg-cyan-100 text-cyan-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  needs_repair: "bg-orange-100 text-orange-700",
  repairing: "bg-orange-100 text-orange-700"
};

const INTEGRATION_ICONS = {
  supabase: Database,
  vercel: Cloud,
  drive: Globe,
  xtreme_comms: MessageSquare,
  cloud_browser: Monitor,
  gmail: Mail,
  hubspot: BarChart3,
  github: GitBranch,
  railway: Server,
  telnyx: MessageSquare,
  google_workspace: Globe,
  xtreme_cloud_browser: Monitor
};

export default function X1Company() {
  const queryClient = useQueryClient();
  const [vision, setVision] = useState("");
  const [strategies, setStrategies] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [infraResult, setInfraResult] = useState(null);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["x1-company-status"],
    queryFn: () => base44.functions.invoke("companyOrchestrator", { action: "get_company_status" }),
    refetchInterval: 15000
  });

  const { data: deptsData } = useQuery({
    queryKey: ["x1-departments"],
    queryFn: () => base44.functions.invoke("companyOrchestrator", { action: "get_departments" })
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["x1-sessions"],
    queryFn: () => base44.functions.invoke("autonomousCodingEngine", { action: "list_sessions", limit: 20 }),
    refetchInterval: 5000
  });

  const { data: healthData } = useQuery({
    queryKey: ["x1-health"],
    queryFn: () => base44.functions.invoke("closedLoopTester", { action: "run_health_check" }),
    refetchInterval: 30000
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["x1-company-status"] });
    queryClient.invalidateQueries({ queryKey: ["x1-departments"] });
    queryClient.invalidateQueries({ queryKey: ["x1-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["x1-health"] });
  };

  const handleSeed = async () => {
    setActionLoading("seed");
    try {
      await base44.functions.invoke("strategicMindsSetup", { action: "seed_company" });
      refresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleVerifyInfra = async () => {
    setActionLoading("verify");
    setInfraResult(null);
    try {
      const res = await base44.functions.invoke("strategicMindsSetup", { action: "verify_infrastructure" });
      setInfraResult(res?.data);
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleAnalyzeVision = async () => {
    if (!vision.trim()) return;
    setActionLoading("analyze");
    setStrategies(null);
    setSelectedStrategy(null);
    setExecutionResult(null);
    try {
      const res = await base44.functions.invoke("companyOrchestrator", { action: "analyze_vision", vision });
      setStrategies(res?.data);
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleExecuteStrategy = async () => {
    if (!selectedStrategy) return;
    setActionLoading("execute");
    setExecutionResult(null);
    try {
      const res = await base44.functions.invoke("companyOrchestrator", {
        action: "execute_strategy",
        vision,
        strategy: selectedStrategy
      });
      setExecutionResult(res?.data);
      refresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleRunCycle = async () => {
    setActionLoading("cycle");
    try {
      await base44.functions.invoke("companyOrchestrator", { action: "run_company_cycle" });
      refresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const handleRunPipeline = async () => {
    setActionLoading("pipeline");
    setPipelineResult(null);
    try {
      const res = await base44.functions.invoke("autonomousCodingEngine", {
        action: "run_full_pipeline",
        task_description: "Create a React dashboard widget that shows real-time system metrics with animated counters and a health score gauge.",
        task_type: "create_component",
        department_id: "DEPT-ENG",
        file_path: "src/components/SystemMetricsWidget.jsx"
      });
      setPipelineResult(res?.data);
      refresh();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const status = statusData?.data;
  const departments = deptsData?.data?.departments || [];
  const sessions = sessionsData?.data?.sessions || [];
  const health = healthData?.data;
  const company = status?.company || {};
  const pipeline = status?.pipeline || {};
  const integrations = status?.integrations || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 text-white border border-amber-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-500 grid place-items-center">
              <Building2 className="h-7 w-7 text-stone-950" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Strategic Minds AI LLC</h1>
              <p className="text-amber-500 text-xs font-bold tracking-wide mt-0.5">AUTONOMOUS AI SOFTWARE • MARKETING • DATA ACQUISITION</p>
              <p className="text-stone-400 text-sm mt-0.5">Owned by @Strategic-Minds • GitHub • Supabase • Vercel • Railway • Telnyx • XtremeCloudBrowser</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 bg-stone-900/50">
                <Activity className={`h-5 w-5 ${health.overall_status === "healthy" ? "text-green-400" : "text-amber-400"}`} />
                <div>
                  <div className="text-2xl font-bold text-amber-400">{health.overall_score}%</div>
                  <div className="text-[10px] uppercase tracking-wide text-stone-500">System Health</div>
                </div>
              </div>
            )}
            <button onClick={refresh} className="p-2 rounded-lg border border-stone-700 hover:border-amber-500 transition">
              <RefreshCw className="h-5 w-5 text-stone-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon={Building2} label="Departments" value={company.total_departments || 0} tone="amber" />
        <StatCard icon={Users} label="Agent Employees" value={company.total_agents || 0} tone="blue" />
        <StatCard icon={Target} label="Total Tasks" value={company.total_tasks || 0} tone="purple" />
        <StatCard icon={CheckCircle2} label="Completed" value={company.completed_tasks || 0} tone="green" />
        <StatCard icon={Rocket} label="Deployments" value={pipeline.total_deployments || 0} tone="cyan" />
        <StatCard icon={Activity} label="Active Sessions" value={pipeline.active_sessions || 0} tone="stone" />
      </div>

      {/* Infrastructure Verification */}
      {infraResult && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-amber-500" /> Strategic Minds AI — Infrastructure Verification
            <span className={`text-xs font-bold px-2 py-1 rounded border ${infraResult.all_connected ? "bg-green-100 text-green-700 border-green-300" : "bg-amber-100 text-amber-700 border-amber-300"}`}>
              {infraResult.all_connected ? "ALL VERIFIED" : "NEEDS ATTENTION"}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(infraResult.connections).map(([key, conn]) => {
              const Icon = INTEGRATION_ICONS[key] || Server;
              return (
                <div key={key} className={`rounded-xl border p-3 ${conn.connected ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${conn.connected ? "text-green-600" : "text-red-600"}`} />
                    <span className="text-sm font-bold text-stone-900 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className={`ml-auto h-2 w-2 rounded-full ${conn.connected ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                  <p className="text-xs text-stone-500">{conn.details}</p>
                  {conn.verify_url && (
                    <a href={conn.verify_url} target="_blank" rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
                      <ExternalLink className="h-3 w-3" /> Open Account
                    </a>
                  )}
                  {conn.repos_found !== undefined && <p className="text-xs text-stone-400 mt-1">{conn.repos_found} repos found</p>}
                  {conn.projects_found !== undefined && <p className="text-xs text-stone-400 mt-1">{conn.projects_found} projects</p>}
                  {conn.phone_numbers !== undefined && <p className="text-xs text-stone-400 mt-1">{conn.phone_numbers} phone numbers</p>}
                  {conn.repo_names && conn.repo_names.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {conn.repo_names.map((r, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">{r}</span>
                      ))}
                    </div>
                  )}
                  {conn.project_names && conn.project_names.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {conn.project_names.map((p, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">{p}</span>
                      ))}
                    </div>
                  )}
                  {conn.number_samples && conn.number_samples.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {conn.number_samples.map((n, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 rounded-lg bg-stone-900 text-amber-400 text-sm font-mono">
            {infraResult.proof}
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-500" /> Autonomous Control Panel
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vision → Orchestrator → Strategy */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-amber-500" /> Submit a Vision — Orchestrator generates strategies
            </label>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="e.g. Build an autonomous lead generation system that scrapes contractor listings, enriches them with property data, and sends personalized SMS outreach..."
              className="w-full h-20 px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none resize-none"
            />
            <button
              onClick={handleAnalyzeVision}
              disabled={actionLoading === "analyze" || !vision.trim()}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-60"
            >
              {actionLoading === "analyze" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Analyze Vision
            </button>

            {/* Strategy Options */}
            {strategies?.strategies && strategies.strategies.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-stone-500 italic">{strategies.vision_summary}</div>
                <div className="text-sm font-semibold text-stone-700 mt-2">Choose a Strategy:</div>
                {strategies.strategies.map((s) => {
                  const isSelected = selectedStrategy?.strategy_id === s.strategy_id;
                  const approachColors = {
                    agile: "border-blue-300 bg-blue-50",
                    comprehensive: "border-purple-300 bg-purple-50",
                    innovative: "border-amber-300 bg-amber-50"
                  };
                  return (
                    <button
                      key={s.strategy_id}
                      onClick={() => setSelectedStrategy(s)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition ${isSelected ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200" : (approachColors[s.approach] || "border-stone-200 bg-white") + " hover:border-amber-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-stone-900">{s.name}</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-900 text-white">{s.approach}</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">{s.risk_level} risk</span>
                        <span className="ml-auto text-xs text-stone-400">{s.timeline}</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">{s.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.departments?.map((d, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 font-medium">{d}</span>
                        ))}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        <span className="font-semibold">Phases:</span> {s.phases?.join(" → ")}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1">
                        <span className="font-semibold">Outcome:</span> {s.expected_outcome}
                      </div>
                    </button>
                  );
                })}
                {selectedStrategy && (
                  <button
                    onClick={handleExecuteStrategy}
                    disabled={actionLoading === "execute"}
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-stone-900 text-amber-400 text-sm font-bold hover:bg-stone-800 disabled:opacity-60"
                  >
                    {actionLoading === "execute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    Execute "{selectedStrategy.name}"
                  </button>
                )}
              </div>
            )}

            {/* Execution Result */}
            {executionResult && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-700">Strategy Executed — {executionResult.total_tasks} tasks routed</span>
                </div>
                <p className="text-xs text-stone-600 mb-2">{executionResult.execution_plan}</p>
                <div className="space-y-1">
                  {executionResult.sessions?.map((s, i) => (
                    <div key={i} className="text-xs text-stone-700 flex items-center gap-2">
                      <span className="text-amber-500">→</span>
                      <span className="font-semibold">{s.department}</span>
                      <span className="text-stone-400">—</span>
                      <span>{s.task}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-600">{s.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Autonomous Actions</label>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton onClick={handleVerifyInfra} loading={actionLoading === "verify"} icon={Server} label="Verify Infrastructure" />
              <ActionButton onClick={handleSeed} loading={actionLoading === "seed"} icon={Building2} label="Seed Company" />
              <ActionButton onClick={handleRunCycle} loading={actionLoading === "cycle"} icon={RefreshCw} label="Run Company Cycle" />
              <ActionButton onClick={handleRunPipeline} loading={actionLoading === "pipeline"} icon={Cpu} label="Run Coding Pipeline" />
            </div>
            {pipelineResult && (
              <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-700">Pipeline {pipelineResult.status}</span>
                  {pipelineResult.session?.validation_score && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800">Score: {pipelineResult.session.validation_score}/100</span>
                  )}
                </div>
                <p className="text-stone-600 text-xs">{pipelineResult.session?.task_description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-amber-500" /> Company Departments
          <span className="text-sm font-normal text-stone-400">({departments.length} departments, {company.total_agents || 0} agent employees)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {departments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-stone-400">
              <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No departments yet. Click "Seed Departments" to create the company org chart.</p>
            </div>
          ) : departments.map((dept) => {
            const Icon = DEPT_ICONS[dept.type] || Box;
            return (
              <div key={dept.id} className="rounded-xl border border-stone-200 p-4 hover:border-amber-400 transition group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-200 grid place-items-center group-hover:bg-amber-100 transition">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-900 truncate">{dept.name}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide">{dept.type}</div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-2 line-clamp-2">{dept.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {dept.agents?.map((a, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">{a}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {dept.task_count || 0} tasks</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {dept.completed_count || 0} done</span>
                </div>
                {dept.integrations?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dept.integrations.map((intg, i) => {
                      const IntIcon = INTEGRATION_ICONS[intg] || Globe;
                      return <IntIcon key={i} className="h-3 w-3 text-stone-400" />;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sandbox Pipeline */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
          <Cpu className="h-5 w-5 text-amber-500" /> Autonomous Coding Sandbox
          <span className="text-sm font-normal text-stone-400">({sessions.length} sessions)</span>
        </h2>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <Cpu className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No coding sessions yet. Route a goal or run the coding pipeline to start.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s) => (
              <div key={s.id || s.session_id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:border-amber-300 transition">
                <div className={`h-2 w-2 rounded-full ${s.status === "completed" ? "bg-green-500" : s.status === "failed" ? "bg-red-500" : "bg-blue-500 animate-pulse"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-900 truncate">{s.task_description}</div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2">
                    <span>{s.department_id}</span>
                    <span>•</span>
                    <span>{s.task_type}</span>
                    {s.repair_attempts > 0 && <><span>•</span><span className="text-orange-500">{s.repair_attempts} repairs</span></>}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${SESSION_STATUS_COLORS[s.status] || "bg-stone-100 text-stone-600"}`}>
                  {s.status?.toUpperCase()}
                </span>
                {s.validation_score > 0 && (
                  <span className="text-xs font-bold text-stone-600">{s.validation_score}/100</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Health */}
      {health && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5 text-amber-500" /> Integration Health
            <span className={`text-xs font-bold px-2 py-1 rounded border ${STATUS_COLORS[health.overall_status]}`}>
              {health.overall_score}% — {health.overall_status?.toUpperCase()}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {health.checks?.map((check, i) => {
              const Icon = INTEGRATION_ICONS[check.name.toLowerCase().split(" ")[0]] || Server;
              return (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg border border-stone-200">
                  <Icon className="h-4 w-4 text-stone-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-stone-700 truncate">{check.name}</div>
                    <div className="text-[10px] text-stone-400 truncate">{check.details}</div>
                  </div>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${check.status === "healthy" ? "bg-green-500" : check.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline Architecture */}
      <div className="rounded-2xl border border-stone-900 bg-stone-950 p-6 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-500">
          <Sparkles className="h-5 w-5" /> Closed-Loop Pipeline Architecture
        </h2>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {[
            { label: "Vision Input", icon: Target, color: "text-amber-400" },
            { label: "Orchestrator", icon: Brain, color: "text-amber-400" },
            { label: "Choose Strategy", icon: Sparkles, color: "text-purple-400" },
            { label: "Route to Depts", icon: Building2, color: "text-blue-400" },
            { label: "Sandbox Session", icon: Box, color: "text-cyan-400" },
            { label: "Generate Code", icon: Cpu, color: "text-cyan-400" },
            { label: "Validate (8 dims)", icon: TestTube, color: "text-green-400" },
            { label: "Deploy", icon: Rocket, color: "text-amber-400" },
            { label: "Monitor Health", icon: Activity, color: "text-pink-400" },
            { label: "Repair Loop", icon: Wrench, color: "text-orange-400" }
          ].map((step, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-700 bg-stone-900">
                <step.icon className={`h-4 w-4 ${step.color}`} />
                <span className="text-stone-300 font-medium">{step.label}</span>
              </div>
              {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-stone-600" />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-stone-700 bg-stone-900 p-3">
            <Eye className="h-4 w-4 text-amber-500 mb-1" />
            <div className="text-sm font-bold text-white mb-0.5">Deterministic Builds</div>
            <div className="text-xs text-stone-400">Same task + same model = same output. Strategy locked before generation, cached via session hash.</div>
          </div>
          <div className="rounded-lg border border-stone-700 bg-stone-900 p-3">
            <Shield className="h-4 w-4 text-amber-500 mb-1" />
            <div className="text-sm font-bold text-white mb-0.5">8-Dimension Validation</div>
            <div className="text-xs text-stone-400">Syntax, imports, logic, React, security, performance, requirements, standards — adversarial model review.</div>
          </div>
          <div className="rounded-lg border border-stone-700 bg-stone-900 p-3">
            <RefreshCw className="h-4 w-4 text-amber-500 mb-1" />
            <div className="text-sm font-bold text-white mb-0.5">Self-Healing Loop</div>
            <div className="text-xs text-stone-400">Failed validation → repair instructions → regenerate → re-validate. Up to 3 repair attempts per session.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-green-200 bg-green-50 text-green-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    stone: "border-stone-200 bg-stone-50 text-stone-700"
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.stone}`}>
      <Icon className="h-5 w-5 mb-2 opacity-80" />
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

function ActionButton({ onClick, loading, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 h-10 rounded-lg border border-stone-200 text-stone-700 text-sm font-semibold hover:border-amber-400 hover:text-amber-600 disabled:opacity-60 transition"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}