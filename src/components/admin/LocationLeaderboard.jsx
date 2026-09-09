import React, { useMemo } from "react";
import { Trophy, Medal, Award } from "lucide-react";

// Leads past the initial "NEW ESTIMATE" stage count as converted.
const CONVERTED_STATUSES = [
  "CONSULTATION BOOKED",
  "CONSULTATION COMPLETED",
  "IN-HOME ESTIMATE BOOKED",
  "IN-HOME ESTIMATE COMPLETED",
  "PROPOSAL SENT",
  "WON",
];

function toSlug(city) {
  return (city || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
}

export default function LocationLeaderboard({ leads = [] }) {
  const rows = useMemo(() => {
    const map = {};
    for (const lead of leads) {
      const state = (lead.state || "").toLowerCase();
      const slug = toSlug(lead.city);
      const key = `${state}-${slug}`;
      if (!map[key]) map[key] = { key, city: lead.city || slug, state: lead.state || "", total: 0, converted: 0 };
      map[key].total++;
      if (CONVERTED_STATUSES.includes(lead.status)) map[key].converted++;
    }
    return Object.values(map)
      .map((r) => ({ ...r, rate: r.total > 0 ? (r.converted / r.total) * 100 : 0 }))
      .sort((a, b) => b.rate - a.rate || b.total - a.total)
      .slice(0, 10);
  }, [leads]);

  const medal = (i) => {
    if (i === 0) return <Trophy className="h-4 w-4 text-amber-500" />;
    if (i === 1) return <Medal className="h-4 w-4 text-stone-400" />;
    if (i === 2) return <Award className="h-4 w-4 text-amber-700" />;
    return null;
  };

  return (
    <div className="xa-electric-hover rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="font-bold text-stone-900">Location Leaderboard</h2>
        <span className="text-xs text-stone-400 ml-auto">Ranked by lead conversion rate</span>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-stone-400">No lead data yet — submit estimates to see your top cities.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-2.5 font-bold text-stone-600 w-14">Rank</th>
                <th className="text-left px-4 py-2.5 font-bold text-stone-600">City</th>
                <th className="text-right px-4 py-2.5 font-bold text-stone-600">Leads</th>
                <th className="text-right px-4 py-2.5 font-bold text-stone-600">Converted</th>
                <th className="text-right px-4 py-2.5 font-bold text-stone-600">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((r, i) => (
                <tr key={r.key} className="hover:bg-stone-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {medal(i)}
                      <span className={i < 3 ? "font-bold text-stone-900" : "text-stone-400"}>{i + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-stone-900">{r.city}</div>
                    <div className="text-xs text-stone-400">{r.state}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-stone-900">{r.total}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-green-600 font-semibold">{r.converted}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${Math.min(r.rate, 100)}%` }} />
                      </div>
                      <span className="tabular-nums font-bold text-stone-900 w-10 text-right">{r.rate.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}