import React from "react";

/**
 * Polished, organized card with optional header (icon + title + subtitle + action).
 * Usage:
 *   <SectionCard icon={Server} title="Registered Systems" subtitle="3 systems" action={<button>...</button>}>
 *     ...content...
 *   </SectionCard>
 */
export default function SectionCard({ icon: Icon, title, subtitle, action, children, className = "", accent = "amber", noPadding = false }) {
  const accentColors = {
    amber: "text-amber-500",
    red: "text-red-500",
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    stone: "text-stone-500",
  };
  const accentColor = accentColors[accent] || accentColors.amber;

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden ${className}`}>
      {(title || Icon || action) && (
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 bg-stone-50/50">
          {Icon && (
            <div className={`shrink-0 w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center ${accentColor}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h2 className="text-base font-bold text-stone-900 truncate">{title}</h2>}
            {subtitle && <p className="text-xs text-stone-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>
        {children}
      </div>
    </div>
  );
}