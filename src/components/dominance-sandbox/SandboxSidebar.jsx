import React from "react";
import { Target, MapPin, Globe, TrendingUp, CheckCircle2, Circle, Clock } from "lucide-react";
import { useSandbox, TABS } from "./SandboxContext";

const TAB_LABELS = {
  discovery: "Discovery",
  branding: "Branding",
  funnel: "Funnel",
  content: "Content",
  social: "Social",
  simulation: "Simulation",
  launch: "Launch",
};

const STATUS_ICON = {
  complete: <CheckCircle2 className="h-3 w-3 text-green-600" />,
  running: <Clock className="h-3 w-3 text-amber-500 animate-spin" />,
  pending: <Circle className="h-3 w-3 text-stone-600" />,
};

export default function SandboxSidebar() {
  const { campaign, tabStatus, completedCount, progressPct, setActiveTab, activeTab } = useSandbox();
  const roi = campaign.economicGate?.roiPct;
  const roiSignal = campaign.economicGate?.signal;

  return (
    <aside className="ds-rail w-60 shrink-0 flex flex-col h-full sticky top-0" style={{ maxHeight: "100vh" }}>
      {/* Brand */}
      <div className="px-4 py-4 border-b border-stone-800">
        <div className="ds-label text-amber-500">Xtreme AI</div>
        <div className="text-sm font-bold text-white tracking-tight mt-0.5">Dominance Sandbox</div>
      </div>

      {/* Campaign context */}
      <div className="px-4 py-3 space-y-3 border-b border-stone-800">
        <div className="ds-label text-stone-500">Campaign Context</div>

        <div className="space-y-2">
          <ContextRow icon={Target} label="Niche" value={campaign.niche?.label || "—"} />
          <ContextRow icon={MapPin} label="City" value={campaign.city || "—"} />
          <ContextRow icon={Globe} label="Domain" value={campaign.domain || "—"} />
          <ContextRow icon={TrendingUp} label="Auto-Buy" value={campaign.autoPurchase ? "ON" : "OFF"} />
        </div>
      </div>

      {/* ROI gauge */}
      {roi !== undefined && (
        <div className="px-4 py-3 border-b border-stone-800">
          <div className="ds-label text-stone-500 mb-2">Economic Gate</div>
          <div className="flex items-center gap-2">
            <div
              className="ds-font-mono text-2xl font-bold"
              style={{ color: roiSignal === "go" ? "#16A34A" : roiSignal === "no-go" ? "#DC2626" : "#F59E0B" }}
            >
              {roi > 0 ? "+" : ""}{roi}%
            </div>
            <span
              className="ds-badge"
              style={{
                background: roiSignal === "go" ? "#F0FDF4" : roiSignal === "no-go" ? "#FEF2F2" : "#FFFBEB",
                color: roiSignal === "go" ? "#16A34A" : roiSignal === "no-go" ? "#DC2626" : "#D97706",
              }}
            >
              {roiSignal === "go" ? "GO" : roiSignal === "no-go" ? "NO-GO" : "PENDING"}
            </span>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="px-4 py-3 border-b border-stone-800">
        <div className="flex items-center justify-between mb-2">
          <span className="ds-label text-stone-500">Progress</span>
          <span className="ds-font-mono text-xs text-amber-500 font-semibold">{completedCount}/7</span>
        </div>
        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #D97706, #F59E0B)" }}
          />
        </div>
      </div>

      {/* Tab nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors text-left ${
              activeTab === tab
                ? "bg-amber-500/15 text-amber-400"
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {STATUS_ICON[tabStatus[tab]]}
            <span className="font-medium">{TAB_LABELS[tab]}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function ContextRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-stone-500 shrink-0" />
      <span className="ds-label text-stone-500">{label}</span>
      <span className="ml-auto ds-font-mono text-stone-200 truncate max-w-[100px]">{value}</span>
    </div>
  );
}