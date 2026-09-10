import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, LayoutDashboard, FilePlus, Filter, FolderOpen, Phone } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import ContractorDashboard from "@/components/contractor/ContractorDashboard";
import BidGenerator from "@/components/contractor/BidGenerator";
import ContractorPipeline from "@/components/contractor/ContractorPipeline";
import ContractorProjects from "@/components/contractor/ContractorProjects";

const TABS = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard },
  { key: "bid", label: "New Bid", icon: FilePlus },
  { key: "pipeline", label: "Pipeline", icon: Filter },
  { key: "projects", label: "Jobs", icon: FolderOpen },
];

export default function ContractorApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Brandbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="XPS" className="h-8 w-8 object-contain rounded-md" />
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-stone-900">Contractor CRM</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Xtreme AI Systems</div>
          </div>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100 border border-stone-200" aria-label="Menu">
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
        {activeTab === "dashboard" && <ContractorDashboard onTabChange={setActiveTab} />}
        {activeTab === "bid" && <BidGenerator onTabChange={setActiveTab} />}
        {activeTab === "pipeline" && <ContractorPipeline />}
        {activeTab === "projects" && <ContractorProjects />}
      </main>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 grid grid-cols-4 px-2 py-1.5" style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom))" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition ${active ? "text-amber-600" : "text-stone-400"}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* More drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setDrawerOpen(false)}>
          <div className="w-full bg-white rounded-t-2xl border-t border-stone-200 max-h-[70%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-100 px-4 py-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">Menu</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-stone-500 hover:text-stone-900 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <a href="tel:+18555555555" className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-3 text-sm text-stone-700 hover:border-amber-500 hover:text-amber-600">
                <Phone className="h-4 w-4" /> Call Support
              </a>
              <button onClick={() => navigate("/")} className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-3 text-sm text-stone-700 hover:border-amber-500 hover:text-amber-600">
                <ArrowLeft className="h-4 w-4" /> Back to Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}