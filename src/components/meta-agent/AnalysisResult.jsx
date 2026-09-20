import React from "react";
import { Target, Layers, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

export default function AnalysisResult({ result }) {
  if (!result) return null;

  const { summary, architecture, intents, system_types, matched_assets, capability_gaps, work_packets, next_action } = result;

  return (
    <div className="space-y-4">
      {/* Goal Summary */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">What I Understood</h3>
        <p className="text-sm text-stone-800 leading-relaxed">{summary}</p>
      </div>

      {/* System Type & Intent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">System Type</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {system_types?.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                {t.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Intent</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {intents?.map((i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                {i.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Architecture */}
      {architecture && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Recommended Architecture</h4>
          <p className="text-sm text-stone-700 leading-relaxed">{architecture}</p>
        </div>
      )}

      {/* Matched Arsenal Assets */}
      {matched_assets && matched_assets.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Matched Arsenal Assets ({matched_assets.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matched_assets.slice(0, 10).map((a) => (
              <div key={a.item_id} className="flex items-start gap-3 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-800 truncate">{a.name}</span>
                    <span className="font-mono text-xs text-stone-400 shrink-0">{a.item_id}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{a.reason}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${a.relevance}%` }} />
                  </div>
                  <span className="text-xs font-mono text-stone-400 w-8">{a.relevance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capability Gaps */}
      {capability_gaps && capability_gaps.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Capability Gaps ({capability_gaps.length})
          </h4>
          <div className="space-y-2">
            {capability_gaps.map((g, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-stone-100">
                {g.status === "MISSING" ? (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                ) : g.status === "PARTIAL" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-700">Needed: {g.needed}</span>
                  <span className="text-xs text-stone-400 ml-2">Found: {g.found}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  g.status === "MISSING" ? "bg-red-50 text-red-600" :
                  g.status === "PARTIAL" ? "bg-amber-50 text-amber-600" :
                  "bg-green-50 text-green-600"
                }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Packets Summary */}
      {work_packets && work_packets.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Work Packets ({work_packets.length})
          </h4>
          <div className="space-y-2">
            {work_packets.map((pkt, i) => (
              <div key={pkt.packet_id} className="flex items-center gap-3 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-stone-800 text-white text-xs font-bold shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{pkt.title}</p>
                  <p className="text-xs text-stone-500 truncate">{pkt.phase.replace(/_/g, " ")}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                  pkt.risk_class === "PROTECTED" ? "bg-red-50 text-red-600" :
                  pkt.risk_class === "BRANCH_WRITE" ? "bg-orange-50 text-orange-600" :
                  pkt.risk_class === "DRAFT" ? "bg-blue-50 text-blue-600" :
                  "bg-stone-50 text-stone-500"
                }`}>
                  {pkt.risk_class}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Action */}
      {next_action && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-center gap-3">
          <ArrowRight className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Next Action</h4>
            <p className="text-sm text-stone-800 mt-0.5">{next_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}