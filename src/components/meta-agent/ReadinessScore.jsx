import React from "react";
import { Gauge } from "lucide-react";

const CATEGORIES = [
  { key: "source_truth", label: "Source Truth", max: 10 },
  { key: "architecture", label: "Architecture", max: 10 },
  { key: "code_quality", label: "Code Quality", max: 15 },
  { key: "data_integrity", label: "Data Integrity", max: 10 },
  { key: "security", label: "Security", max: 15 },
  { key: "testing", label: "Testing", max: 15 },
  { key: "reliability", label: "Reliability", max: 10 },
  { key: "performance", label: "Performance", max: 5 },
  { key: "ux_accessibility", label: "UX / A11y", max: 5 },
  { key: "operations_documentation", label: "Ops / Docs", max: 5 },
];

export default function ReadinessScore({ score }) {
  if (!score) return null;

  const { verified_score, unverified_points, failed_points, blockers, breakdown } = score;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-bold text-stone-800">Project Readiness Score</h3>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="#D4AF37" strokeWidth="8"
              strokeDasharray={`${(verified_score / 100) * 264} 264`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-stone-900">{verified_score}</span>
            <span className="text-xs text-stone-400">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600 font-bold">VERIFIED</span>
            <span className="text-sm font-bold text-green-600">{verified_score} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-bold">UNVERIFIED</span>
            <span className="text-sm font-bold text-stone-500">{unverified_points} pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-500 font-bold">FAILED</span>
            <span className="text-sm font-bold text-red-500">{failed_points} pts</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-1.5">
        {CATEGORIES.map((cat) => {
          const value = breakdown?.[cat.key] || 0;
          const pct = (value / cat.max) * 100;
          return (
            <div key={cat.key} className="flex items-center gap-2">
              <span className="text-xs text-stone-500 w-28 shrink-0">{cat.label}</span>
              <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${value === cat.max ? "bg-green-500" : value > 0 ? "bg-amber-500" : "bg-stone-200"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-mono text-stone-400 w-12 text-right shrink-0">{value}/{cat.max}</span>
            </div>
          );
        })}
      </div>

      {/* Blockers */}
      {blockers && blockers.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs font-bold text-red-600 mb-1">Blockers ({blockers.length})</p>
          <div className="space-y-0.5">
            {blockers.slice(0, 5).map((b, i) => (
              <p key={i} className="text-xs text-red-500">• {b}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}