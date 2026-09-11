import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Bright-color score cards: green=good, amber=ok, red=bad
function scoreColor(score) {
  if (score >= 80) return { bg: "bg-emerald-500", text: "text-white", ring: "ring-emerald-400", label: "Excellent", hex: "#10b981" };
  if (score >= 60) return { bg: "bg-lime-500", text: "text-white", ring: "ring-lime-400", label: "Good", hex: "#84cc16" };
  if (score >= 40) return { bg: "bg-amber-500", text: "text-stone-950", ring: "ring-amber-400", label: "Fair", hex: "#f59e0b" };
  if (score >= 20) return { bg: "bg-orange-500", text: "text-white", ring: "ring-orange-400", label: "Weak", hex: "#f97316" };
  return { bg: "bg-red-500", text: "text-white", ring: "ring-red-400", label: "Critical", hex: "#ef4444" };
}

function ScoreCard({ label, score, sublabel }) {
  const c = scoreColor(score);
  return (
    <div className={`relative overflow-hidden rounded-2xl ${c.bg} ${c.text} p-4 shadow-lg ring-2 ${c.ring} ring-opacity-30`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider opacity-90">{label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">{c.label}</span>
      </div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-4xl font-black tabular-nums">{Math.round(score)}</span>
        <span className="text-lg font-bold opacity-70 mb-1">/100</span>
      </div>
      {sublabel && <p className="text-xs opacity-80 mt-1">{sublabel}</p>}
      <div className="mt-3 h-1.5 rounded-full bg-black/20 overflow-hidden">
        <div className="h-full rounded-full bg-white/80 transition-all duration-500" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function ScoreDashboard({ scores, breakdown }) {
  const { seo_score, aeo_score, local_score, social_score, overall_score, ads_score } = scores;
  const c = scoreColor(overall_score);

  return (
    <div className="space-y-4">
      {/* Hero overall score */}
      <div className={`relative overflow-hidden rounded-3xl ${c.bg} ${c.text} p-6 shadow-xl ring-2 ${c.ring} ring-opacity-40`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-widest opacity-90">Overall Ranking Power</span>
              {overall_score >= 60 ? (
                <TrendingUp className="h-5 w-5" />
              ) : overall_score >= 30 ? (
                <Minus className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-6xl font-black tabular-nums">{Math.round(overall_score)}</span>
              <span className="text-2xl font-bold opacity-70 mb-2">/100</span>
            </div>
            <p className="text-sm opacity-90 mt-1">
              {overall_score >= 80 ? "Page-1 ready — maintain and build authority" :
               overall_score >= 60 ? "Strong foundation — close the gaps below" :
               overall_score >= 40 ? "Work needed — focus on the red modules" :
               "Significant work needed — start with the basics"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <MiniScore label="SEO" score={seo_score} />
            <MiniScore label="AEO" score={aeo_score} />
            <MiniScore label="Local" score={local_score} />
            <MiniScore label="Social" score={social_score} />
            {ads_score !== undefined && <MiniScore label="Ads" score={ads_score} />}
          </div>
        </div>
      </div>

      {/* Sub-score grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ScoreCard label="SEO Score" score={seo_score} sublabel="On-page + technical + backlinks" />
        <ScoreCard label="AEO Score" score={aeo_score} sublabel="Answer engine optimization" />
        <ScoreCard label="Local SEO" score={local_score} sublabel="GBP + reviews + citations" />
        <ScoreCard label="Social Signals" score={social_score} sublabel="Platforms + posting + engagement" />
      </div>

      {/* Breakdown bars */}
      {breakdown && (
        <div className="bg-stone-900 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">SEO Weight Breakdown</h3>
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-stone-300 capitalize w-24 shrink-0">{key.replace(/_/g, " ")}</span>
              <div className="flex-1 h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${val.score}%`, backgroundColor: scoreColor(val.score).hex }}
                />
              </div>
              <span className="text-xs tabular-nums text-stone-400 w-12 text-right">{val.score}</span>
              <span className="text-xs text-stone-500 w-10 text-right">{val.weight}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniScore({ label, score }) {
  const c = scoreColor(score);
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-black/20 min-w-[70px]">
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
      <span className="text-xl font-black tabular-nums">{Math.round(score)}</span>
    </div>
  );
}