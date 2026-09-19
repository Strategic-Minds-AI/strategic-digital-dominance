import React from "react";
import { Search, Sparkles, Layout, FileText, Share2, Activity, Rocket } from "lucide-react";
import { SandboxProvider, useSandbox, TABS } from "@/components/dominance-sandbox/SandboxContext";
import SandboxSidebar from "@/components/dominance-sandbox/SandboxSidebar";
import DiscoveryTab from "@/components/dominance-sandbox/DiscoveryTab";
import BrandingTab from "@/components/dominance-sandbox/BrandingTab";
import FunnelTab from "@/components/dominance-sandbox/FunnelTab";
import ContentTab from "@/components/dominance-sandbox/ContentTab";
import SocialTab from "@/components/dominance-sandbox/SocialTab";
import SimulationTab from "@/components/dominance-sandbox/SimulationTab";
import LaunchTab from "@/components/dominance-sandbox/LaunchTab";
import BackButton from "@/components/BackButton";
import { Link } from "react-router-dom";

const TAB_META = {
  discovery: { label: "Discovery", icon: Search },
  branding: { label: "Branding", icon: Sparkles },
  funnel: { label: "Funnel", icon: Layout },
  content: { label: "Content", icon: FileText },
  social: { label: "Social", icon: Share2 },
  simulation: { label: "Simulation", icon: Activity },
  launch: { label: "Launch", icon: Rocket },
};

function SandboxContent() {
  const { activeTab, setActiveTab } = useSandbox();

  const tabMap = {
    discovery: <DiscoveryTab />,
    branding: <BrandingTab />,
    funnel: <FunnelTab />,
    content: <ContentTab />,
    social: <SocialTab />,
    simulation: <SimulationTab />,
    launch: <LaunchTab />,
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      <SandboxSidebar />
      <div className="flex-1 min-w-0 flex flex-col ds-canvas">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-stone-200">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <BackButton className="text-stone-500 hover:text-stone-900" />
              <div>
                <div className="ds-label text-amber-600">Dominance Sandbox</div>
                <div className="text-sm font-bold text-stone-900">Tabbed Simulation & Launch Command Center</div>
              </div>
            </div>
            <Link to="/admin/site-builder" className="ds-btn-ghost text-xs">
              <Layout className="h-3.5 w-3.5" /> Site Builder
            </Link>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-t border-stone-100">
            {TABS.map((tab) => {
              const meta = TAB_META[tab];
              const Icon = meta.icon;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab ? "ds-tab-active" : "ds-tab-idle"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {tabMap[activeTab]}
        </div>
      </div>
    </div>
  );
}

export default function DominanceSandbox() {
  return (
    <SandboxProvider>
      <SandboxContent />
    </SandboxProvider>
  );
}