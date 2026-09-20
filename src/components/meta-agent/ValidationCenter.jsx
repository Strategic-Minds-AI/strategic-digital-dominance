import React, { useState } from "react";
import { Shield, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";

const STATUS_META = {
  PASS: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  FAIL: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  BLOCKED: { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  MISSING_EVIDENCE: { icon: Clock, color: "text-stone-500", bg: "bg-stone-50", border: "border-stone-200" },
  PENDING: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
};

export default function ValidationCenter({ receipts }) {
  const [filter, setFilter] = useState("ALL");

  const filters = ["ALL", "PASS", "FAIL", "BLOCKED", "MISSING_EVIDENCE"];
  const filtered = filter === "ALL" ? receipts : receipts.filter((r) => r.status === filter);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-bold text-stone-800">Validation Center</h3>
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filter === f ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Shield className="h-8 w-8 text-stone-200 mb-2" />
          <p className="text-sm text-stone-400 font-medium">No validation receipts yet</p>
          <p className="text-xs text-stone-400 mt-1">Run /VALIDATE to generate validation checks</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map((r) => {
            const meta = STATUS_META[r.status] || STATUS_META.PENDING;
            const Icon = meta.icon;
            return (
              <div key={r.receipt_id} className={`p-3 rounded-lg border ${meta.border} ${meta.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${meta.color} shrink-0`} />
                  <span className="text-sm font-semibold text-stone-800 flex-1 truncate">{r.check_name}</span>
                  <span className={`text-xs font-bold ${meta.color} shrink-0`}>{r.status.replace(/_/g, " ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400">Expected: </span>
                    <span className="text-stone-600">{r.expected}</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Actual: </span>
                    <span className="text-stone-600">{r.actual}</span>
                  </div>
                </div>
                {r.evidence && (
                  <p className="text-xs text-stone-500 mt-1 italic">Evidence: {r.evidence}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-stone-400">Validator: {r.validator}</span>
                  <span className="text-xs text-stone-400 font-mono">{r.points_verified}/{r.points_possible} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}