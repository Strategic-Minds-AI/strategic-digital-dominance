import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

const STATUS_META = {
  AVAILABLE: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  PARTIAL: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  MISSING: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  UNVERIFIED: { icon: HelpCircle, color: "text-stone-500", bg: "bg-stone-50", border: "border-stone-200" },
};

export default function CapabilityMap({ capabilityMap }) {
  if (!capabilityMap?.categories) return null;

  const categories = capabilityMap.categories;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-stone-800 mb-3">Capability Map</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((cat) => {
          const meta = STATUS_META[cat.status] || STATUS_META.UNVERIFIED;
          const Icon = meta.icon;
          return (
            <div key={cat.category} className={`p-3 rounded-xl border ${meta.border} ${meta.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${meta.color}`} />
                <span className="text-xs font-bold text-stone-700">{cat.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${meta.color}`}>{cat.status}</span>
                <span className="text-xs text-stone-400 font-mono">{cat.available_count}/{cat.needed_count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}