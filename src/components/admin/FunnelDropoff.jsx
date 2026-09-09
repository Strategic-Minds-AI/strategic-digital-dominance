import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingDown, AlertTriangle } from "lucide-react";

// The exact step events fired by the estimate funnel (src/pages/Funnel.jsx).
// Ordered from first touch to final conversion.
const STEPS = [
  { event: "funnel_started", label: "Started estimate" },
  { event: "address_entered", label: "Entered address" },
  { event: "condition_selected", label: "Picked floor condition" },
  { event: "color_selected", label: "Chose a color" },
  { event: "photos_uploaded", label: "Reached photo step" },
  { event: "contact_entered", label: "Entered contact info" },
  { event: "lead_created", label: "Lead created (scrape done)" },
  { event: "estimate_email_sent", label: "Estimate emailed" },
  { event: "call_clicked", label: "Clicked call button" },
];

export default function FunnelDropoff() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["funnel-events-dropoff"],
    queryFn: () => base44.entities.FunnelEvent.list("-created_date", 2000),
  });

  // Count unique sessions that reached each step — this is the true drop-off
  // measure (not raw event counts, which can double-fire or include repeats).
  const { rows, biggestDrop } = useMemo(() => {
    const sessionsByStep = STEPS.map((s) => {
      const sessions = new Set(
        events
          .filter((e) => e.event === s.event && e.session_id)
          .map((e) => e.session_id)
      );
      return { ...s, count: sessions.size };
    });

    const rows = sessionsByStep.map((step, i) => {
      const prev = i === 0 ? null : sessionsByStep[i - 1];
      const dropoff = prev && prev.count > 0
        ? Math.round((1 - step.count / prev.count) * 100)
        : null;
      const convFromStart = sessionsByStep[0].count > 0
        ? Math.round((step.count / sessionsByStep[0].count) * 100)
        : 0;
      return { ...step, dropoff, convFromStart, prevCount: prev?.count || 0 };
    });

    let biggestDrop = null;
    for (const r of rows) {
      if (r.dropoff !== null && (!biggestDrop || r.dropoff > biggestDrop.dropoff)) {
        biggestDrop = r;
      }
    }
    return { rows, biggestDrop };
  }, [events]);

  const maxCount = Math.max(1, ...rows.map((r) => r.count));

  if (isLoading) {
    return (
      <div className="xa-electric-hover rounded-2xl bg-white p-6">
        <div className="h-6 w-48 bg-stone-100 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-stone-50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalStarted = rows[0]?.count || 0;
  const totalConverted = rows[rows.length - 1]?.count || 0;

  return (
    <div className="xa-electric-hover rounded-2xl bg-white p-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            Estimate funnel drop-off
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {totalStarted.toLocaleString()} visitors started · {totalConverted.toLocaleString()} clicked call ({totalStarted ? Math.round((totalConverted / totalStarted) * 100) : 0}% end-to-end)
          </p>
        </div>
      </div>

      {biggestDrop && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            Biggest drop-off: <strong>{biggestDrop.label}</strong> — losing{" "}
            <strong>{biggestDrop.dropoff}%</strong> of users from the previous step.
          </div>
        </div>
      )}

      <div className="mt-5 space-y-1">
        {rows.map((r, i) => {
          const widthPct = (r.count / maxCount) * 100;
          const isDropoff = r.dropoff !== null && r.dropoff >= 40;
          return (
            <div key={r.event}>
              {r.dropoff !== null && (
                <div className={`flex items-center justify-end gap-1 text-xs mb-0.5 ${isDropoff ? "text-red-600 font-semibold" : "text-stone-400"}`}>
                  <TrendingDown className="h-3 w-3" />
                  {r.dropoff}% dropped off
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-44 text-sm text-stone-700 shrink-0 truncate">
                  <span className="text-stone-400 font-mono text-xs mr-1">{i + 1}</span>
                  {r.label}
                </div>
                <div className="flex-1 h-9 bg-stone-50 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg transition-all flex items-center justify-end pr-2 ${
                      isDropoff ? "bg-red-400" : "bg-amber-400"
                    }`}
                    style={{ width: `${Math.max(widthPct, r.count > 0 ? 6 : 0)}%` }}
                  >
                    <span className="text-xs font-bold text-stone-900 tabular-nums">{r.count.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-12 text-right text-xs text-stone-500 tabular-nums shrink-0">
                  {r.convFromStart}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>Unique sessions per step (last 2,000 events)</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> healthy</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> ≥40% drop-off</span>
        </span>
      </div>
    </div>
  );
}