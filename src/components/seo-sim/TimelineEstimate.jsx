import React from "react";
import { Clock, Target, Calendar } from "lucide-react";

export default function TimelineEstimate({ months, keywordDifficulty, overallScore, keyword }) {
  const gap = keywordDifficulty - overallScore;
  const isPositive = gap <= 0;

  const barColor = isPositive ? "bg-emerald-500" : gap <= 15 ? "bg-amber-500" : "bg-red-500";
  const textColor = isPositive ? "text-emerald-400" : gap <= 15 ? "text-amber-400" : "text-red-400";
  const borderColor = isPositive ? "border-emerald-500/40" : gap <= 15 ? "border-amber-500/40" : "border-red-500/40";

  // Timeline visualization — 18 months max
  const timelinePct = Math.min((months / 18) * 100, 100);

  return (
    <div className={`rounded-2xl border-2 ${borderColor} bg-stone-950 p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-amber-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-300">Estimated Timeline to Page 1</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Big number */}
        <div className="flex items-center gap-3">
          <div className={`text-5xl font-black ${textColor} tabular-nums`}>
            {months}
          </div>
          <div>
            <div className="text-lg font-bold text-stone-200">months</div>
            <div className="text-xs text-stone-500">
              {months <= 2 ? "Imminent — you're competitive now" :
               months <= 4 ? "Near-term — consistent effort will get you there" :
               months <= 8 ? "Medium-term — sustained optimization required" :
               "Long-term — significant authority building needed"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 md:ml-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Target className="h-3 w-3" /> Keyword Difficulty
            </span>
            <span className="text-2xl font-bold text-stone-200 tabular-nums">{keywordDifficulty}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Your Score
            </span>
            <span className="text-2xl font-bold text-stone-200 tabular-nums">{Math.round(overallScore)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Gap</span>
            <span className={`text-2xl font-bold ${textColor} tabular-nums`}>
              {gap > 0 ? `+${gap}` : gap}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
          <span>Now</span>
          <span>3 mo</span>
          <span>6 mo</span>
          <span>9 mo</span>
          <span>12 mo</span>
          <span>18 mo</span>
        </div>
        <div className="relative h-3 rounded-full bg-stone-800 overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full ${barColor} rounded-full transition-all duration-700`}
            style={{ width: `${timelinePct}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-white"
            style={{ left: `${timelinePct}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-2">
          Target: <span className="font-semibold text-amber-400">"{keyword}"</span> —
          {isPositive
            ? " your score exceeds the keyword difficulty; page 1 is achievable within 1-2 months."
            : ` close the ${gap}-point gap by optimizing the modules below to accelerate ranking.`}
        </p>
      </div>
    </div>
  );
}