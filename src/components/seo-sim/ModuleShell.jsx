import React from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Wrapper for each interactive module — shows the module's score impact
// in bright colors at the top, then the interactive controls below.
export default function ModuleShell({ title, icon: Icon, score, maxScore = 100, impact, children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);

  const scoreColor = score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
                     score >= 60 ? "text-lime-400 bg-lime-500/10 border-lime-500/30" :
                     score >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                     score >= 20 ? "text-orange-400 bg-orange-500/10 border-orange-500/30" :
                     "text-red-400 bg-red-500/10 border-red-500/30";

  const impactColor = impact > 5 ? "text-emerald-400" : impact > 0 ? "text-amber-400" : "text-stone-500";
  const ImpactIcon = impact > 5 ? TrendingUp : impact < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center text-amber-500">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-stone-200">{title}</h3>
            <p className="text-[10px] text-stone-500">
              Module score: {Math.round(score)}/{maxScore}
              {impact !== undefined && (
                <span className={`ml-2 font-semibold ${impactColor} flex items-center gap-0.5 inline-flex`}>
                  <ImpactIcon className="h-3 w-3" />
                  {impact > 0 ? `+${impact}` : impact} pts to overall
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${scoreColor}`}>
            {Math.round(score)}
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-stone-800">
          {children}
        </div>
      )}
    </div>
  );
}

// Reusable toggle control
export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer group">
      <div>
        <span className="text-xs font-medium text-stone-300 group-hover:text-white">{label}</span>
        {hint && <p className="text-[10px] text-stone-500">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition shrink-0 ${checked ? "bg-amber-500" : "bg-stone-700"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

// Reusable slider control
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "" }) {
  return (
    <div className="py-1.5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-stone-300">{label}</span>
        <span className="text-xs font-bold text-amber-400 tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-stone-700 accent-amber-500 cursor-pointer"
      />
    </div>
  );
}