import React, { useState } from "react";
import { ChevronDown, ChevronRight, Shield, Cpu, ArrowRight, Check, Lock } from "lucide-react";

const RISK_COLORS = {
  READ: "bg-stone-50 text-stone-500 border-stone-200",
  DRAFT: "bg-blue-50 text-blue-600 border-blue-200",
  BRANCH_WRITE: "bg-orange-50 text-orange-600 border-orange-200",
  PROTECTED: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_COLORS = {
  DRAFT: "bg-stone-100 text-stone-500",
  READY: "bg-green-50 text-green-600",
  BLOCKED: "bg-red-50 text-red-600",
  WAITING_DEPENDENCY: "bg-amber-50 text-amber-600",
  WAITING_APPROVAL: "bg-purple-50 text-purple-600",
  QUEUED: "bg-blue-50 text-blue-600",
  RUNNING: "bg-cyan-50 text-cyan-600",
  VALIDATING: "bg-indigo-50 text-indigo-600",
  FAILED: "bg-red-50 text-red-600",
  REPAIR_REQUIRED: "bg-orange-50 text-orange-600",
  PASSED: "bg-green-50 text-green-600",
  COMPLETE: "bg-green-100 text-green-700",
};

export default function WorkPacketList({ packets, onApprove }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-stone-800 mb-3">Work Packets & Dependency Graph</h3>
      <div className="space-y-2">
        {packets.map((pkt, i) => (
          <div key={pkt.packet_id} className="border border-stone-200 rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50 transition"
              onClick={() => setExpanded(expanded === pkt.packet_id ? null : pkt.packet_id)}
            >
              {expanded === pkt.packet_id ? (
                <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
              )}
              <span className="grid place-items-center w-7 h-7 rounded-full bg-stone-800 text-white text-xs font-bold shrink-0">{pkt.order + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{pkt.title}</p>
                <p className="text-xs text-stone-400 truncate">{pkt.phase.replace(/_/g, " ")}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${RISK_COLORS[pkt.risk_class] || RISK_COLORS.READ} shrink-0`}>
                {pkt.risk_class}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[pkt.status] || STATUS_COLORS.DRAFT} shrink-0`}>
                {pkt.status.replace(/_/g, " ")}
              </span>
            </div>

            {expanded === pkt.packet_id && (
              <div className="px-4 pb-4 pt-1 border-t border-stone-100 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Objective</p>
                  <p className="text-sm text-stone-700">{pkt.objective}</p>
                </div>

                {pkt.dependencies && pkt.dependencies.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Dependencies</p>
                    <div className="flex items-center gap-2">
                      {pkt.dependencies.map((dep) => (
                        <span key={dep} className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{dep.slice(0, 12)}...</span>
                      ))}
                      {!pkt.parallel_safe && <span className="text-xs text-amber-600">⚠ Must wait for dependencies</span>}
                      {pkt.parallel_safe && <span className="text-xs text-green-600">✓ Parallel safe</span>}
                    </div>
                  </div>
                )}

                {pkt.recommended_assets && pkt.recommended_assets.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Recommended Arsenal Assets</p>
                    <div className="space-y-1">
                      {pkt.recommended_assets.map((a) => (
                        <div key={a.item_id} className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-stone-400">{a.item_id}</span>
                          <span className="text-stone-700">{a.name}</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            a.priority === "critical" ? "bg-red-50 text-red-600" :
                            a.priority === "high" ? "bg-orange-50 text-orange-600" :
                            "bg-stone-50 text-stone-500"
                          }`}>{a.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Executor</p>
                    <p className="text-sm text-stone-700 font-mono">{pkt.recommended_executor}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Acceptance Criteria</p>
                    <p className="text-sm text-stone-700">{pkt.acceptance_criteria}</p>
                  </div>
                </div>

                {pkt.allowed_actions && pkt.allowed_actions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Allowed Actions</p>
                    <div className="flex flex-wrap gap-1">
                      {pkt.allowed_actions.map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {pkt.forbidden_actions && pkt.forbidden_actions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Forbidden Actions</p>
                    <div className="flex flex-wrap gap-1">
                      {pkt.forbidden_actions.map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Rollback</p>
                  <p className="text-sm text-stone-600">{pkt.rollback_requirements}</p>
                </div>

                {(pkt.risk_class === "PROTECTED" || pkt.risk_class === "BRANCH_WRITE") && (
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <Lock className="h-4 w-4 text-red-500" />
                    <button
                      onClick={() => onApprove(pkt.packet_id, "approve")}
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onApprove(pkt.packet_id, "deny")}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-200 hover:bg-red-100 transition"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}