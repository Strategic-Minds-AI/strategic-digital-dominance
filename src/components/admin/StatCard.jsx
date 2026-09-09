import React from "react";

export default function StatCard({ label, value, sub, icon: Icon, accent = "amber" }) {
  const accentMap = {
    amber: "text-amber-500 bg-amber-50",
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    red: "text-red-600 bg-red-50",
    stone: "text-stone-600 bg-stone-100",
  };
  return (
    <div className="xa-electric-hover rounded-2xl bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</div>
        {Icon && (
          <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${accentMap[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold text-stone-900 tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-stone-500">{sub}</div>}
    </div>
  );
}