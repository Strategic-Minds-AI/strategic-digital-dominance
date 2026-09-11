import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Star, Plus } from "lucide-react";

// Real domain result card — shows actual availability + deterministic score breakdown
export default function DomainResultCard({ result, onQueue, queued }) {
  const { domain, available, score, breakdown, registrar, checkError } = result;
  const scoreColor = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : score >= 40 ? "text-orange-400" : "text-red-400";
  const scoreBg = score >= 80 ? "bg-emerald-500/10 border-emerald-500/30" : score >= 60 ? "bg-amber-500/10 border-amber-500/30" : score >= 40 ? "bg-orange-500/10 border-orange-500/30" : "bg-red-500/10 border-red-500/30";

  return (
    <div className={`rounded-xl border p-4 transition-all ${available ? `${scoreBg} hover:scale-[1.01]` : "bg-stone-900/50 border-stone-800 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="font-bold text-white text-sm truncate">{domain}</div>
          <div className="flex items-center gap-1.5 mt-1">
            {available ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" /> Available
              </span>
            ) : checkError ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                <AlertCircle className="h-3 w-3" /> Check failed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                <XCircle className="h-3 w-3" /> Taken{registrar ? ` · ${registrar}` : ""}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-black ${scoreColor}`}>{score}</div>
          <div className="text-[9px] text-stone-500 uppercase tracking-wider">score</div>
        </div>
      </div>

      {/* Score breakdown — transparent, deterministic */}
      <div className="space-y-1">
        {Object.entries(breakdown).map(([key, f]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] text-stone-500 w-24 shrink-0">{f.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                style={{ width: `${(f.value / f.max) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-stone-400 w-10 text-right shrink-0">{f.value}/{f.max}</span>
          </div>
        ))}
      </div>

      {available && (
        <button
          onClick={() => onQueue(domain)}
          disabled={queued}
          className={`mt-3 w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            queued
              ? "bg-emerald-500/20 text-emerald-400 cursor-default"
              : "bg-amber-500 text-stone-950 hover:bg-amber-400"
          }`}
        >
          {queued ? <><CheckCircle2 className="h-3.5 w-3.5" /> Queued</> : <><Plus className="h-3.5 w-3.5" /> Queue for Purchase</>}
        </button>
      )}
    </div>
  );
}