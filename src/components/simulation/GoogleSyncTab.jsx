import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, FolderOpen, FileSpreadsheet, FileText, CheckSquare, Calendar, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CONTRACTOR_ARCHETYPES } from "@/data/contractorArchetypes";
import { SIMULATED_VISITORS } from "@/data/simulatedVisitors";
import { ADMIN_PROFILES } from "@/data/adminProfiles";
import { QUESTIONNAIRE_CATEGORIES } from "@/data/simulationQuestionnaire";

export default function GoogleSyncTab() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSyncAll = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("googleWorkspaceSync", {
        archetypes: CONTRACTOR_ARCHETYPES,
        visitors: SIMULATED_VISITORS,
        adminProfiles: ADMIN_PROFILES,
        questionnaire: QUESTIONNAIRE_CATEGORIES,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err?.message || "Sync failed" });
    }
    setSyncing(false);
  };

  const services = [
    { id: "sheets", name: "Google Sheets", icon: FileSpreadsheet, authorized: true, desc: "Master tracking spreadsheet with all archetypes, visitors, admin profiles, and questionnaire data" },
    { id: "calendar", name: "Google Calendar", icon: Calendar, authorized: true, desc: "Day-by-day, hour-by-hour simulation schedule with QA checkpoints" },
    { id: "drive", name: "Google Drive", icon: FolderOpen, authorized: false, desc: "Folder structure: root → archetypes (6) → email templates, simulation reports" },
    { id: "tasks", name: "Google Tasks", icon: CheckSquare, authorized: false, desc: "Task lists per agent (7 agents) with deadlines, results, and notes" },
    { id: "docs", name: "Google Docs", icon: FileText, authorized: false, desc: "Email templates for bids@ and support@, archetype profiles, simulation reports" },
  ];

  return (
    <div className="space-y-4">
      {/* Sync All Button */}
      <div className="xa-electric-light rounded-2xl bg-amber-50 border border-black p-4" style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-black mb-1">Full Google Workspace Sync</h3>
            <p className="text-[10px] text-stone-600">Creates Sheets, Calendar events, Drive folders, Tasks lists, and Docs templates in one operation</p>
          </div>
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-stone-800 transition disabled:opacity-50"
          >
            {syncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {syncing ? "Syncing..." : "Sync All to Google"}
          </button>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="xa-electric-light rounded-2xl bg-white border border-black p-4"
            style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-black ${svc.authorized ? "bg-green-50" : "bg-red-50"}`}>
                  <svc.icon className={`h-5 w-5 ${svc.authorized ? "text-green-600" : "text-red-500"}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{svc.name}</h4>
                  <span className={`text-[9px] font-bold ${svc.authorized ? "text-green-600" : "text-red-500"}`}>
                    {svc.authorized ? "✓ Authorized" : "⚠ Needs Authorization"}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-stone-600 leading-relaxed">{svc.desc}</p>
          </div>
        ))}
      </div>

      {/* Result Display */}
      {result && (
        <div
          className={`rounded-2xl p-4 border ${result.error ? "bg-red-50 border-red-600" : "bg-green-50 border-green-600"}`}
          style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
        >
          <div className="flex items-start gap-3">
            {result.error ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-bold ${result.error ? "text-red-700" : "text-green-700"}`}>
                {result.error ? "Sync Failed" : "Google Workspace Sync Complete!"}
              </p>
              {result.sheetUrl && (
                <a href={result.sheetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline block mt-1">
                  → Open Google Sheet
                </a>
              )}
              {result.calendarUrl && (
                <a href={result.calendarUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline block mt-1">
                  → Open Google Calendar
                </a>
              )}
              {result.status && (
                <div className="mt-2 space-y-1">
                  {Object.entries(result.status).map(([key, val]) => (
                    <p key={key} className="text-[10px] text-stone-600">
                      <strong className="capitalize">{key}:</strong> {typeof val === "string" ? val : JSON.stringify(val)}
                    </p>
                  ))}
                </div>
              )}
              {result.needsAuth && result.needsAuth.length > 0 && (
                <p className="text-[10px] text-amber-600 mt-2">
                  ⚠ Still needs authorization: {result.needsAuth.join(", ")}. Authorize these connectors to complete the full sync.
                </p>
              )}
              {result.error && <p className="text-xs text-red-600 mt-1">{result.error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Email Automation Section */}
      <div className="xa-electric-light rounded-2xl bg-white border border-black p-4" style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}>
        <h3 className="text-sm font-extrabold text-black mb-2">📧 Email Automation (bids@ & support@)</h3>
        <p className="text-[10px] text-stone-600 mb-3">
          Automated inbound/outbound AI emails with exhaustive templates, operated by a specialized humanized customer service agent.
          Templates synced to Google Docs, usage tracked in Google Sheets.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
            <p className="text-[10px] font-bold text-blue-600">bids@epoxyquotenearme.com</p>
            <p className="text-[9px] text-stone-500">Inbound bid requests, outbound estimates, follow-ups</p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-2">
            <p className="text-[10px] font-bold text-green-600">support@epoxyquotenearme.com</p>
            <p className="text-[9px] text-stone-500">Customer support, warranty, scheduling, reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
}