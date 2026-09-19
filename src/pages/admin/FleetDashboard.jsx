import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Globe, Server, Activity, AlertTriangle, CheckCircle2, XCircle,
  Clock, Target, Gauge, Zap, ShieldCheck, Rocket, Plus, RefreshCw,
  Loader2, ArrowRight, Cpu, Database, Cloud, GitBranch, Eye, EyeOff,
  TrendingUp, Layers, Layout, BarChart3, Settings
} from "lucide-react";
import SectionCard from "@/components/admin/SectionCard";

const SYSTEM_TYPE_ICONS = {
  website: Globe,
  saas: Server,
  pwa: Globe,
  communications: Activity,
  lead_generation: Target,
  marketplace: Layers,
  ai_product: Cpu,
  data_system: Database,
  browser_system: Eye,
  financial: TrendingUp,
  crm: Server,
  automation: Zap,
  research: Eye,
  agent_platform: Cpu,
  construction: ShieldCheck,
  control_plane: Cpu,
  unknown: Globe,
};

const MODE_STYLES = {
  bootstrap: { label: "BOOTSTRAP", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300", icon: Rocket },
  completion_sprint: { label: "COMPLETION SPRINT", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", icon: Zap },
  preservation: { label: "PRESERVATION", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", icon: ShieldCheck },
  degraded: { label: "DEGRADED", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300", icon: AlertTriangle },
  blocked: { label: "BLOCKED", color: "text-red-600", bg: "bg-red-50", border: "border-red-300", icon: XCircle },
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "priority", label: "Priority Order", icon: TrendingUp },
  { id: "approvals", label: "Approvals", icon: ShieldCheck },
  { id: "systems", label: "Systems", icon: Server },
];

export default function FleetDashboard() {
  const [showRegister, setShowRegister] = useState(false);
  const [manifestText, setManifestText] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // ── Fleet status ──
  const { data: fleet, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["fleetStatus"],
    queryFn: async () => {
      const res = await base44.functions.invoke("fleetAlphaPrime", { action: "status" });
      return res.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ── Fleet governance ──
  const { data: governance } = useQuery({
    queryKey: ["fleetGovernance"],
    queryFn: async () => {
      const res = await base44.functions.invoke("fleetAlphaPrime", { action: "govern" });
      return res.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ── Register system ──
  const registerMutation = useMutation({
    mutationFn: async (manifest) => {
      const res = await base44.functions.invoke("fleetAlphaPrime", {
        action: "register",
        manifest,
      });
      return res.data;
    },
    onSuccess: () => {
      setShowRegister(false);
      setManifestText("");
      refetch();
    },
  });

  const handleRegister = () => {
    try {
      const manifest = JSON.parse(manifestText);
      registerMutation.mutate(manifest);
    } catch (e) {
      alert("Invalid JSON manifest");
    }
  };

  const loadSampleManifest = () => {
    setManifestText(JSON.stringify({
      system_id: "epoxyquotenearme",
      name: "Epoxy Garage Floor Estimates",
      description: "National lead-generation platform for garage floor coating contractors",
      system_type: "lead_generation",
      business_purpose: "Generate homeowner leads for garage floor coating contractors nationwide",
      repository: "XTREME-SYSTEMS/epoxyquotenearme",
      default_branch: "main",
      vercel_project: "epoxyquotenearme",
      supabase_project: "epoxyquotenearme",
      domains: ["epoxyquotenearme.com"],
      owner: "operator@thextremeteam.com",
      priority: "critical",
      base44_app_id: "epoxyquotenearme",
    }, null, 2));
  };

  const pendingApprovals = governance?.pending_approvals || 0;

  return (
    <div className="flex gap-5">
      {/* === LEFT SIDEBAR / TOOLBAR === */}
      <div className="w-64 shrink-0 space-y-4">
        {/* Brand header */}
        <div className="rounded-2xl bg-gradient-to-br from-stone-950 to-stone-900 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 rounded-xl p-2">
              <Layers className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-[0.18em] text-amber-500 uppercase">Fleet Alpha Prime</div>
              <h1 className="text-base font-bold text-white tracking-tight">Fleet Dashboard</h1>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {fleet?.total_systems || 0} systems registered
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl border border-stone-200 p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.id === "approvals" && pendingApprovals > 0 ? pendingApprovals : null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition text-left ${
                  isActive
                    ? "bg-amber-500/10 text-amber-600 border border-amber-300"
                    : "text-stone-600 hover:bg-stone-50 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick stats in sidebar */}
        {!isLoading && fleet && (
          <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-2">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Fleet Health</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Fleet Score</span>
              <span className="text-lg font-black text-amber-600">{fleet.fleet_score}<span className="text-xs text-stone-400">/100</span></span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${fleet.fleet_score}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="text-center bg-emerald-50 rounded-lg p-1.5 border border-emerald-200">
                <div className="text-sm font-bold text-emerald-600">{fleet.verified_100}</div>
                <div className="text-[10px] text-stone-500">Verified</div>
              </div>
              <div className="text-center bg-amber-50 rounded-lg p-1.5 border border-amber-200">
                <div className="text-sm font-bold text-amber-600">{fleet.in_completion_sprint}</div>
                <div className="text-[10px] text-stone-500">Sprint</div>
              </div>
              <div className="text-center bg-orange-50 rounded-lg p-1.5 border border-orange-200">
                <div className="text-sm font-bold text-orange-600">{fleet.degraded}</div>
                <div className="text-[10px] text-stone-500">Degraded</div>
              </div>
              <div className="text-center bg-red-50 rounded-lg p-1.5 border border-red-200">
                <div className="text-sm font-bold text-red-600">{fleet.blocked}</div>
                <div className="text-[10px] text-stone-500">Blocked</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50 transition"
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 transition"
          >
            <Plus className="h-4 w-4" />
            Register System
          </button>
        </div>
      </div>

      {/* === RIGHT CONTENT === */}
      <div className="flex-1 min-w-0 space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-3 text-stone-500 text-sm">Loading fleet status...</span>
          </div>
        ) : fleet ? (
          <>
            {/* === OVERVIEW TAB === */}
            {activeTab === "overview" && (
              <>
                {/* Fleet Metrics */}
                <SectionCard
                  icon={BarChart3}
                  title="Fleet Metrics"
                  subtitle="Real-time portfolio health at a glance"
                  accent="amber"
                  noPadding
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px bg-stone-100">
                    <FleetMetric icon={Gauge} label="Fleet Score" value={`${fleet.fleet_score}/100`} color="text-amber-600" />
                    <FleetMetric icon={Server} label="Total Systems" value={fleet.total_systems} color="text-stone-700" />
                    <FleetMetric icon={CheckCircle2} label="Verified 100" value={fleet.verified_100} color="text-emerald-600" />
                    <FleetMetric icon={Zap} label="In Sprint" value={fleet.in_completion_sprint} color="text-amber-600" />
                    <FleetMetric icon={AlertTriangle} label="Degraded" value={fleet.degraded} color="text-orange-600" />
                    <FleetMetric icon={XCircle} label="Blocked" value={fleet.blocked} color="text-red-600" />
                    <FleetMetric icon={AlertTriangle} label="Total P0" value={fleet.total_p0} color={fleet.total_p0 > 0 ? "text-red-600" : "text-emerald-600"} />
                    <FleetMetric icon={AlertTriangle} label="Total P1" value={fleet.total_p1} color={fleet.total_p1 > 0 ? "text-orange-600" : "text-emerald-600"} />
                  </div>
                </SectionCard>

                {/* Priority Order preview (top 5) */}
                {governance && governance.priority_order && governance.priority_order.length > 0 && (
                  <SectionCard
                    icon={TrendingUp}
                    title="Top Priority Systems"
                    subtitle="Highest compute allocation ranking"
                    accent="amber"
                    action={
                      <button onClick={() => setActiveTab("priority")} className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
                        View all <ArrowRight className="h-3 w-3" />
                      </button>
                    }
                  >
                    <div className="space-y-2">
                      {governance.priority_order.slice(0, 5).map((sys, idx) => {
                        const modeStyle = MODE_STYLES[sys.mode] || MODE_STYLES.bootstrap;
                        const TypeIcon = SYSTEM_TYPE_ICONS[sys.type] || Globe;
                        return (
                          <div key={sys.system_id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200 hover:border-amber-300 transition">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                            <TypeIcon className="h-5 w-5 text-stone-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-stone-900 truncate">{sys.name}</span>
                                <span className="text-xs text-stone-400">{sys.system_id}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${modeStyle.bg} ${modeStyle.color} ${modeStyle.border} border`}>
                                  {modeStyle.label}
                                </span>
                                {sys.p0 > 0 && <span className="text-xs text-red-600 font-semibold">P0: {sys.p0}</span>}
                                {sys.p1 > 0 && <span className="text-xs text-orange-600 font-semibold">P1: {sys.p1}</span>}
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="text-sm font-bold text-amber-600">{sys.score}/100</div>
                              <div className="text-xs text-stone-400">{sys.distance} pts to 100</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                )}
              </>
            )}

            {/* === PRIORITY ORDER TAB === */}
            {activeTab === "priority" && governance && governance.priority_order && (
              <SectionCard
                icon={TrendingUp}
                title="Fleet Priority Order"
                subtitle="Compute allocation ranking — all systems"
                accent="amber"
              >
                <div className="space-y-2">
                  {governance.priority_order.map((sys, idx) => {
                    const ModeIcon = MODE_STYLES[sys.mode]?.icon || Activity;
                    const modeStyle = MODE_STYLES[sys.mode] || MODE_STYLES.bootstrap;
                    const TypeIcon = SYSTEM_TYPE_ICONS[sys.type] || Globe;
                    return (
                      <div key={sys.system_id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200 hover:border-amber-300 transition">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <TypeIcon className="h-5 w-5 text-stone-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-900 truncate">{sys.name}</span>
                            <span className="text-xs text-stone-400">{sys.system_id}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${modeStyle.bg} ${modeStyle.color} ${modeStyle.border} border`}>
                              {modeStyle.label}
                            </span>
                            {sys.p0 > 0 && <span className="text-xs text-red-600 font-semibold">P0: {sys.p0}</span>}
                            {sys.p1 > 0 && <span className="text-xs text-orange-600 font-semibold">P1: {sys.p1}</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm font-bold text-amber-600">{sys.score}/100</div>
                          <div className="text-xs text-stone-400">{sys.distance} pts to 100</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* === APPROVALS TAB === */}
            {activeTab === "approvals" && (
              <>
                {pendingApprovals > 0 ? (
                  <SectionCard
                    icon={ShieldCheck}
                    title="Protected Actions Awaiting Approval"
                    subtitle={`${pendingApprovals} items need review`}
                    accent="red"
                  >
                    <div className="space-y-2">
                      {governance.approval_items?.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-stone-900">{item.benchmark_id}</div>
                            <div className="text-xs text-stone-600 mt-0.5">{item.implementation_plan}</div>
                            <div className="text-xs text-red-600 mt-1">Risk: {item.risk}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                ) : (
                  <SectionCard icon={ShieldCheck} title="No Pending Approvals" subtitle="All protected actions have been reviewed" accent="emerald" noPadding>
                    <div className="py-12 text-center">
                      <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-sm text-stone-500">Everything is clear — no actions awaiting approval.</p>
                    </div>
                  </SectionCard>
                )}
              </>
            )}

            {/* === SYSTEMS TAB === */}
            {activeTab === "systems" && (
              <SectionCard
                icon={Server}
                title="Registered Systems"
                subtitle={`${fleet.systems?.length || 0} systems in fleet`}
                accent="amber"
                action={
                  <button
                    onClick={() => setShowRegister(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add System
                  </button>
                }
              >
                {fleet.systems?.length === 0 ? (
                  <div className="text-center py-12">
                    <Server className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                    <div className="text-sm text-stone-500 mb-4">No systems registered yet.</div>
                    <button
                      onClick={() => setShowRegister(true)}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400"
                    >
                      Register First System
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fleet.systems.map((sys) => {
                      const TypeIcon = SYSTEM_TYPE_ICONS[sys.type] || Globe;
                      const modeStyle = MODE_STYLES[sys.mode] || MODE_STYLES.bootstrap;
                      const ModeIcon = modeStyle.icon;
                      return (
                        <div key={sys.system_id} className="xa-electric-hover rounded-xl border border-stone-200 p-4 bg-stone-50">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-white rounded-lg p-2 border border-stone-200 shrink-0">
                              <TypeIcon className="h-6 w-6 text-stone-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-stone-900 truncate">{sys.name}</div>
                              <div className="text-xs text-stone-500">{sys.system_id} · {sys.type}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${modeStyle.bg} ${modeStyle.color} ${modeStyle.border} border flex items-center gap-1`}>
                              <ModeIcon className="h-3 w-3" />
                              {modeStyle.label}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-white rounded-lg p-2 border border-stone-200">
                              <div className="text-lg font-bold text-amber-600">{sys.score}</div>
                              <div className="text-xs text-stone-500">Score</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-stone-200">
                              <div className={`text-lg font-bold ${sys.p0 > 0 ? "text-red-600" : "text-emerald-600"}`}>{sys.p0}</div>
                              <div className="text-xs text-stone-500">P0</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-stone-200">
                              <div className={`text-lg font-bold ${sys.p1 > 0 ? "text-orange-600" : "text-emerald-600"}`}>{sys.p1}</div>
                              <div className="text-xs text-stone-500">P1</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-stone-200">
                              <div className="text-lg font-bold text-stone-700">{sys.passing}</div>
                              <div className="text-xs text-stone-500">Pass</div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded ${sys.source_parity === "pass" ? "bg-emerald-100 text-emerald-700" : sys.source_parity === "fail" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-500"}`}>
                              SRC: {sys.source_parity?.toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded ${sys.deployment_parity === "pass" ? "bg-emerald-100 text-emerald-700" : sys.deployment_parity === "fail" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-500"}`}>
                              DEPLOY: {sys.deployment_parity?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            )}
          </>
        ) : null}
      </div>

      {/* === REGISTER MODAL === */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRegister(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-900">Register System — Manifest</h2>
              <button onClick={() => setShowRegister(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={loadSampleManifest} className="text-xs px-2 py-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200">
                  Load Sample Manifest
                </button>
              </div>
              <textarea
                value={manifestText}
                onChange={e => setManifestText(e.target.value)}
                placeholder="Paste system manifest JSON here..."
                className="w-full h-80 p-3 border border-stone-200 rounded-xl font-mono text-xs focus:border-amber-500 outline-none"
              />
              {registerMutation.isError && (
                <div className="mt-2 text-sm text-red-600">
                  Error: {registerMutation.error?.response?.data?.error || registerMutation.error?.message}
                </div>
              )}
              {registerMutation.isSuccess && registerMutation.data && (
                <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                  ✓ Registered {registerMutation.data.system.name} — {registerMutation.data.benchmarks_created} benchmarks created
                </div>
              )}
            </div>
            <div className="p-4 border-t border-stone-200 flex justify-end gap-2">
              <button onClick={() => setShowRegister(false)} className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 font-semibold text-sm">
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={!manifestText.trim() || registerMutation.isPending}
                className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
              >
                {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Register System
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FleetMetric({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white p-4 flex flex-col gap-1.5">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}