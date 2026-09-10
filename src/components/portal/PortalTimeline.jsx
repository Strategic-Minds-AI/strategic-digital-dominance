import React from "react";
import { CheckCircle2, Clock, Calendar, Wrench, Sparkles } from "lucide-react";

const STAGES = [
  { key: "scheduled", label: "Scheduled", icon: Calendar, desc: "Your installation date is set" },
  { key: "prep", label: "Preparation", icon: Wrench, desc: "Surface prep and crack repair" },
  { key: "installation", label: "Installation", icon: Sparkles, desc: "Applying your floor system" },
  { key: "curing", label: "Curing", icon: Clock, desc: "Floor is curing — stay off it" },
  { key: "complete", label: "Complete", icon: CheckCircle2, desc: "Your new floor is ready!" },
];

export default function PortalTimeline({ project, updates }) {
  const currentStageIdx = STAGES.findIndex((s) => s.key === project?.status);

  return (
    <div className="space-y-3">
      {STAGES.map((stage, idx) => {
        const Icon = stage.icon;
        const isDone = idx < currentStageIdx;
        const isCurrent = idx === currentStageIdx;
        const isFuture = idx > currentStageIdx;
        const update = updates.find((u) => u.stage === stage.key);

        return (
          <div
            key={stage.key}
            className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${
              isCurrent
                ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/20 animate-pulse"
                : isDone
                ? "border-green-200 bg-green-50/50"
                : "border-stone-200 bg-white opacity-60"
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isDone
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-amber-500 text-stone-950 ring-4 ring-amber-300/50"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${isCurrent ? "text-amber-900" : "text-stone-900"}`}>
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase animate-pulse">
                    ● In Progress
                  </span>
                )}
                {isDone && (
                  <span className="text-[10px] font-bold tracking-wider text-green-600 uppercase">
                    ✓ Done
                  </span>
                )}
              </div>
              <div className="text-sm text-stone-500">{stage.desc}</div>
              {update && (
                <div className="mt-2 text-sm text-stone-700 bg-white rounded-lg p-3 border border-stone-200">
                  {update.description}
                </div>
              )}
            </div>
            {isFuture && <Clock className="h-4 w-4 text-stone-300" />}
          </div>
        );
      })}
    </div>
  );
}