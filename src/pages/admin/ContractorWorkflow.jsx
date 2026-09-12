import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ExternalLink,
  Search,
  Download,
  TrendingUp,
  DollarSign,
  Heart,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
  Brain,
} from "lucide-react";
import { WORKFLOW_STAGES, WORKFLOW_DAYS, WORKFLOW_SUMMARY } from "@/data/contractorWorkflow";
import { base44 } from "@/api/base44Client";
import { LOGO_URL } from "@/components/Logo";

export default function ContractorWorkflow() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [swarmSyncing, setSwarmSyncing] = useState(false);
  const [swarmResult, setSwarmResult] = useState(null);

  const filteredDays = useMemo(() => {
    let days = WORKFLOW_DAYS;
    if (selectedStage) {
      days = days.filter((d) => d.stage === selectedStage);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      days = days.filter(
        (d) =>
          d.withoutAi.toLowerCase().includes(q) ||
          d.withAi.toLowerCase().includes(q) ||
          d.tool.toLowerCase().includes(q)
      );
    }
    return days;
  }, [selectedStage, searchQuery]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke("syncContractorWorkflow", {});
      setSyncResult({ success: true, url: res.data?.sheetUrl, message: res.data?.message });
    } catch (err) {
      setSyncResult({ success: false, error: err?.message || "Sync failed" });
    }
    setSyncing(false);
  };

  const handleSwarmSync = async () => {
    setSwarmSyncing(true);
    setSwarmResult(null);
    try {
      const res = await base44.functions.invoke("syncWorkflowToSwarm", {});
      setSwarmResult({ success: true, ...res.data });
    } catch (err) {
      setSwarmResult({ success: false, error: err?.message || "Swarm sync failed" });
    }
    setSwarmSyncing(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="XPS" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-xl font-extrabold font-heading tracking-tight text-black">
                  60-Day Contractor Workflow
                </h1>
                <p className="text-xs text-amber-600 font-semibold tracking-wider uppercase">
                  Before vs After Xtreme AI — Interactive Comparison
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/workflow-findings")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-black text-sm font-semibold text-black hover:bg-black hover:text-white transition"
              >
                <FileText className="h-4 w-4" /> Findings
              </button>
              <button
                onClick={handleSwarmSync}
                disabled={swarmSyncing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-black text-black hover:bg-stone-100 text-sm font-bold transition disabled:opacity-50"
              >
                {swarmSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {swarmSyncing ? "Syncing..." : "Sync to Swarm"}
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white hover:bg-stone-800 text-sm font-bold transition disabled:opacity-50"
              >
                {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {syncing ? "Syncing..." : "Sync to Sheets"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar — 3D Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon={DollarSign} label="Retail Value" value={WORKFLOW_SUMMARY.totalRetailValue} sub="All tools individually" color="text-red-500" />
          <SummaryCard icon={DollarSign} label="Delivered Cost" value={WORKFLOW_SUMMARY.totalDeliveredCost} sub="Xtreme AI bundle" color="text-amber-600" />
          <SummaryCard icon={TrendingUp} label="Revenue Increase" value={WORKFLOW_SUMMARY.revenueIncrease} sub="In 60 days" color="text-green-600" />
          <SummaryCard icon={Heart} label="Family Time" value={WORKFLOW_SUMMARY.familyTimeReclaimed} sub="Reclaimed weekly" color="text-pink-500" />
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflow pains, tools, solutions..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-black text-sm text-black placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStage(null)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                !selectedStage
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-stone-100"
              }`}
            >
              All 60 Days
            </button>
            {WORKFLOW_STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStage(selectedStage === s.id ? null : s.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                  selectedStage === s.id
                    ? "text-white border-black"
                    : "bg-white text-black border-black hover:bg-stone-100"
                }`}
                style={selectedStage === s.id ? { background: s.color, borderColor: "#000" } : {}}
              >
                {s.id}. {s.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div
            className={`rounded-xl p-4 flex items-start gap-3 border ${
              syncResult.success
                ? "bg-green-50 border-green-600"
                : "bg-red-50 border-red-600"
            }`}
            style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
          >
            {syncResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${syncResult.success ? "text-green-700" : "text-red-700"}`}>
                {syncResult.success ? "Google Sheet synced successfully!" : "Sync failed"}
              </p>
              {syncResult.success && syncResult.url && (
                <a
                  href={syncResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" /> Open Google Sheet
                </a>
              )}
              {!syncResult.success && (
                <p className="text-xs text-red-600 mt-1">{syncResult.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Swarm Sync Result */}
      {swarmResult && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div
            className={`rounded-xl p-4 flex items-start gap-3 border ${
              swarmResult.success
                ? "bg-blue-50 border-blue-600"
                : "bg-red-50 border-red-600"
            }`}
            style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
          >
            {swarmResult.success ? (
              <Brain className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${swarmResult.success ? "text-blue-700" : "text-red-700"}`}>
                {swarmResult.success
                  ? `Swarm synced! ${swarmResult.tasksCreated} tasks created. ${swarmResult.totalTracked} total tracked across ${swarmResult.stagesTracked} stages.`
                  : "Swarm sync failed"}
              </p>
              {swarmResult.success && (
                <p className="text-xs text-stone-500 mt-1">
                  Alpha Prime now has persistent awareness of all 60 workflow days. Investigation ID: {swarmResult.investigationId?.slice(0, 12)}...
                </p>
              )}
              {!swarmResult.success && (
                <p className="text-xs text-red-600 mt-1">{swarmResult.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D Workflow Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDays.map((day) => {
            const stage = WORKFLOW_STAGES.find((s) => s.id === day.stage);
            return (
              <WorkflowCard
                key={day.day}
                day={day}
                stage={stage}
                onClick={() => setSelectedDay(day)}
                onLaunch={() => navigate(day.toolRoute)}
              />
            );
          })}
        </div>

        {/* Stage Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-2">
          {WORKFLOW_STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStage(selectedStage === s.id ? null : s.id)}
              className={`rounded-xl p-3 text-left border transition ${
                selectedStage === s.id
                  ? "border-black bg-stone-100"
                  : "border-black bg-white hover:bg-stone-50"
              }`}
              style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span className="text-xs font-bold text-black">Stage {s.id}</span>
              </div>
              <p className="text-[10px] text-stone-600 font-semibold leading-tight">{s.name}</p>
              <p className="text-[9px] text-stone-400 mt-0.5">Days {s.days}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          stage={WORKFLOW_STAGES.find((s) => s.id === selectedDay.stage)}
          onClose={() => setSelectedDay(null)}
          onLaunch={() => {
            navigate(selectedDay.toolRoute);
            setSelectedDay(null);
          }}
        />
      )}
    </div>
  );
}

// ── 3D Workflow Card ──
function WorkflowCard({ day, stage, onClick, onLaunch }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl bg-white border border-black p-4 transition-all duration-200 hover:-translate-y-1 hover:translate-x-[-2px]"
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "8px 8px 0px 0px rgba(0,0,0,1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "6px 6px 0px 0px rgba(0,0,0,1)")}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-lg border border-black"
            style={{ background: stage?.color }}
          >
            {day.day}
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Day {day.day}</p>
            <p className="text-[10px] text-stone-500">{day.timeOfDay}</p>
          </div>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-1 rounded-full border border-black"
          style={{ background: stage?.color + "20", color: "#000" }}
        >
          {stage?.name.split(" ")[0]}
        </span>
      </div>

      {/* Without AI */}
      <div className="rounded-lg bg-red-50 border border-black p-2.5 mb-2">
        <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider mb-1">Without Xtreme AI</p>
        <p className="text-[11px] text-stone-700 leading-relaxed line-clamp-2">{day.withoutAi}</p>
      </div>

      {/* With AI */}
      <div className="rounded-lg bg-green-50 border border-black p-2.5 mb-3">
        <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider mb-1">With Xtreme AI</p>
        <p className="text-[11px] text-stone-700 leading-relaxed line-clamp-2">{day.withAi}</p>
      </div>

      {/* Tool + Pricing */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Tool</p>
          <p className="text-[11px] font-bold text-black truncate">{day.tool}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-bold text-red-400 line-through">{day.retailPrice}</p>
          <p className="text-sm font-extrabold text-amber-600">{day.deliveredCost}</p>
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLaunch();
        }}
        className="w-full h-9 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-stone-800 transition group-hover:bg-amber-500 group-hover:text-black"
      >
        Launch Tool <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Day Detail Modal ──
function DayDetailModal({ day, stage, onClose, onLaunch }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border-2 border-black p-6 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-xl border-2 border-black"
              style={{ background: stage?.color }}
            >
              {day.day}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-black">Day {day.day} — {stage?.name}</h2>
              <p className="text-xs text-stone-500">{day.timeOfDay}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-black flex items-center justify-center hover:bg-stone-100 transition"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Without AI */}
        <div className="rounded-xl bg-red-50 border-2 border-black p-4 mb-3" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
          <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Without Xtreme AI</h4>
          <p className="text-sm text-stone-800 leading-relaxed">{day.withoutAi}</p>
        </div>

        {/* With AI */}
        <div className="rounded-xl bg-green-50 border-2 border-black p-4 mb-4" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
          <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">With Xtreme AI</h4>
          <p className="text-sm text-stone-800 leading-relaxed">{day.withAi}</p>
        </div>

        {/* Pricing Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl bg-white border-2 border-black p-3 text-center" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
            <p className="text-[10px] font-bold text-stone-400 uppercase">Retail</p>
            <p className="text-sm font-bold text-red-500 line-through">{day.retailPrice}</p>
          </div>
          <div className="rounded-xl bg-amber-50 border-2 border-black p-3 text-center" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
            <p className="text-[10px] font-bold text-amber-600 uppercase">Delivered</p>
            <p className="text-sm font-extrabold text-amber-600">{day.deliveredCost}</p>
          </div>
          <div className="rounded-xl bg-green-50 border-2 border-black p-3 text-center" style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)" }}>
            <p className="text-[10px] font-bold text-green-600 uppercase">Savings</p>
            <p className="text-sm font-extrabold text-green-600">{day.savings}</p>
          </div>
        </div>

        {/* Tool + Launch */}
        <div className="rounded-xl bg-white border-2 border-black p-4 flex items-center justify-between gap-3" style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tool / Service</p>
            <p className="text-sm font-bold text-black">{day.tool}</p>
          </div>
          <button
            onClick={onLaunch}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-amber-500 hover:text-black transition"
          >
            Launch Tool <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Summary Card ──
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div
      className="rounded-xl bg-white border border-black p-4 transition hover:-translate-y-0.5"
      style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>
    </div>
  );
}