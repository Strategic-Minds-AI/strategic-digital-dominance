import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ExternalLink,
  Search,
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  Heart,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Table,
  FileText,
} from "lucide-react";
import { WORKFLOW_STAGES, WORKFLOW_DAYS, WORKFLOW_SUMMARY } from "@/data/contractorWorkflow";
import { base44 } from "@/api/base44Client";
import { LOGO_URL } from "@/components/Logo";

export default function ContractorWorkflow() {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDay, setExpandedDay] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

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

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-lg border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="XPS" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-xl font-extrabold font-heading tracking-tight">
                  60-Day Contractor Workflow
                </h1>
                <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                  Before vs After Xtreme AI — Interactive Comparison
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/workflow-findings")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-sm font-semibold text-stone-200 transition"
              >
                <FileText className="h-4 w-4" /> Marketing Findings
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:brightness-110 text-sm font-bold text-black transition disabled:opacity-50"
              >
                {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {syncing ? "Syncing..." : "Sync to Google Sheets"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon={DollarSign} label="Retail Value" value={WORKFLOW_SUMMARY.totalRetailValue} sub="All tools individually" color="text-red-400" />
          <SummaryCard icon={DollarSign} label="Delivered Cost" value={WORKFLOW_SUMMARY.totalDeliveredCost} sub="Xtreme AI bundle" color="text-amber-400" />
          <SummaryCard icon={TrendingUp} label="Revenue Increase" value={WORKFLOW_SUMMARY.revenueIncrease} sub="In 60 days" color="text-green-400" />
          <SummaryCard icon={Heart} label="Family Time" value={WORKFLOW_SUMMARY.familyTimeReclaimed} sub="Reclaimed weekly" color="text-pink-400" />
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflow pains, tools, solutions..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-stone-900 border border-stone-700 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStage(null)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                !selectedStage ? "bg-amber-500 text-black" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
              }`}
            >
              All 60 Days
            </button>
            {WORKFLOW_STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStage(selectedStage === s.id ? null : s.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                  selectedStage === s.id ? "bg-amber-500 text-black" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                }`}
                style={selectedStage === s.id ? { background: s.color, color: "#000" } : {}}
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
            className={`rounded-xl p-4 flex items-start gap-3 ${
              syncResult.success ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            {syncResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${syncResult.success ? "text-green-400" : "text-red-400"}`}>
                {syncResult.success ? "Google Sheet synced successfully!" : "Sync failed"}
              </p>
              {syncResult.success && syncResult.url && (
                <a
                  href={syncResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" /> Open Google Sheet
                </a>
              )}
              {!syncResult.success && (
                <p className="text-xs text-red-300 mt-1">{syncResult.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="rounded-2xl border border-stone-800 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-px bg-stone-800 text-xs font-bold uppercase tracking-wider">
            <div className="col-span-1 bg-stone-900 px-3 py-3 text-stone-400">Day</div>
            <div className="col-span-3 bg-red-950/50 px-3 py-3 text-red-400">Without Xtreme AI</div>
            <div className="col-span-3 bg-green-950/50 px-3 py-3 text-green-400">With Xtreme AI</div>
            <div className="col-span-2 bg-stone-900 px-3 py-3 text-amber-400">Tool / Service</div>
            <div className="col-span-1 bg-stone-900 px-3 py-3 text-stone-400 text-center">Retail</div>
            <div className="col-span-2 bg-amber-500/10 px-3 py-3 text-amber-400 text-center">Delivered Cost</div>
          </div>

          {/* Table Rows */}
          <div className="bg-stone-900">
            {filteredDays.map((day, idx) => {
              const stage = WORKFLOW_STAGES.find((s) => s.id === day.stage);
              const isExpanded = expandedDay === day.day;
              const isLastInStage = idx === filteredDays.length - 1 || filteredDays[idx + 1]?.stage !== day.stage;
              return (
                <div
                  key={day.day}
                  className={`border-b border-stone-800 ${isExpanded ? "bg-stone-800/50" : "hover:bg-stone-800/30"} transition`}
                >
                  {/* Main Row */}
                  <div
                    className="grid grid-cols-12 gap-px cursor-pointer items-start"
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  >
                    {/* Day */}
                    <div className="col-span-1 bg-stone-900 px-3 py-4 flex flex-col items-center gap-1">
                      <span className="text-2xl font-extrabold text-white">{day.day}</span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: stage?.color + "30", color: stage?.color }}
                      >
                        S{day.stage}
                      </span>
                      <span className="text-[8px] text-stone-500 text-center">{day.timeOfDay}</span>
                    </div>

                    {/* Without AI */}
                    <div className="col-span-3 bg-red-950/20 px-3 py-4">
                      <p className="text-xs text-red-200/90 leading-relaxed">
                        {isExpanded ? day.withoutAi : `${day.withoutAi.slice(0, 120)}...`}
                      </p>
                    </div>

                    {/* With AI */}
                    <div className="col-span-3 bg-green-950/20 px-3 py-4">
                      <p className="text-xs text-green-200/90 leading-relaxed">
                        {isExpanded ? day.withAi : `${day.withAi.slice(0, 120)}...`}
                      </p>
                    </div>

                    {/* Tool */}
                    <div className="col-span-2 bg-stone-900 px-3 py-4">
                      <p className="text-xs font-bold text-amber-400 leading-tight">{day.tool}</p>
                    </div>

                    {/* Retail */}
                    <div className="col-span-1 bg-stone-900 px-2 py-4 text-center">
                      <span className="text-xs font-bold text-red-400 line-through opacity-70">{day.retailPrice}</span>
                    </div>

                    {/* Delivered Cost */}
                    <div className="col-span-2 bg-amber-500/5 px-3 py-4 text-center">
                      <span className="text-sm font-extrabold text-amber-400">{day.deliveredCost}</span>
                      <div className="text-[9px] text-green-400 font-bold mt-0.5">Save {day.savings}</div>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="grid grid-cols-12 gap-px bg-stone-800">
                      <div className="col-span-12 bg-stone-900 px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="rounded-xl bg-red-950/30 border border-red-800/30 p-4">
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Without Xtreme AI</h4>
                            <p className="text-sm text-red-100/90 leading-relaxed">{day.withoutAi}</p>
                          </div>
                          <div className="rounded-xl bg-green-950/30 border border-green-800/30 p-4">
                            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">With Xtreme AI</h4>
                            <p className="text-sm text-green-100/90 leading-relaxed">{day.withAi}</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-[10px] text-stone-500 uppercase font-bold">Tool</p>
                              <p className="text-sm font-bold text-amber-400">{day.tool}</p>
                            </div>
                            <div className="h-8 w-px bg-stone-700" />
                            <div>
                              <p className="text-[10px] text-stone-500 uppercase font-bold">Retail Price</p>
                              <p className="text-sm font-bold text-red-400 line-through">{day.retailPrice}</p>
                            </div>
                            <div className="h-8 w-px bg-stone-700" />
                            <div>
                              <p className="text-[10px] text-amber-500 uppercase font-bold">Delivered Cost</p>
                              <p className="text-sm font-extrabold text-amber-400">{day.deliveredCost}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(day.toolRoute);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:brightness-110 text-sm font-bold text-black transition"
                          >
                            Launch Tool <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-2">
          {WORKFLOW_STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStage(selectedStage === s.id ? null : s.id)}
              className={`rounded-xl p-3 text-left transition border ${
                selectedStage === s.id ? "border-amber-500 bg-stone-800" : "border-stone-800 bg-stone-900 hover:bg-stone-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span className="text-xs font-bold text-white">Stage {s.id}</span>
              </div>
              <p className="text-[10px] text-stone-400 font-semibold leading-tight">{s.name}</p>
              <p className="text-[9px] text-stone-600 mt-0.5">Days {s.days}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-xl bg-stone-900 border border-stone-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] text-stone-600 mt-0.5">{sub}</p>
    </div>
  );
}