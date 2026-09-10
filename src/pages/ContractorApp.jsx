import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomeIcon, Briefcase, Users, MessageSquare, MoreHorizontal, ArrowLeft, Menu, X, Search, Bell } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import ContractorHome from "@/components/contractor/ContractorHome";
import ContractorProjects from "@/components/contractor/ContractorProjects";
import ContractorLeads from "@/components/contractor/ContractorLeads";
import ContractorInbox from "@/components/contractor/ContractorInbox";
import ContractorMore from "@/components/contractor/ContractorMore";

const TABS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "leads", label: "Leads", icon: Users },
  { key: "inbox", label: "Inbox", icon: MessageSquare },
  { key: "more", label: "More", icon: MoreHorizontal },
];

export default function ContractorApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* TopBar */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        {activeTab !== "home" ? (
          <button onClick={() => setActiveTab("home")} className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <img src={LOGO_URL} alt="XPS" className="h-8 w-8 object-contain rounded-md" />
        )}
        {activeTab !== "home" && (
          <div className="flex-1 text-center">
            <span className="text-sm font-extrabold text-stone-900 tracking-tight">
              {TABS.find((t) => t.key === activeTab)?.label}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <button className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
          </button>
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200" aria-label="Menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
        {activeTab === "home" && <ContractorHome onTabChange={setActiveTab} />}
        {activeTab === "projects" && <ContractorProjects />}
        {activeTab === "leads" && <ContractorLeads />}
        {activeTab === "inbox" && <ContractorInbox />}
        {activeTab === "more" && <ContractorMore onTabChange={setActiveTab} />}
      </main>

      {/* Bottom tab nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 grid grid-cols-5 px-1 py-1.5" style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom))" }}>
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

      {/* Menu drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setDrawerOpen(false)}>
          <div className="w-full bg-white rounded-t-2xl border-t border-stone-200 max-h-[70%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={LOGO_URL} alt="XPS" className="h-8 w-8 object-contain rounded-md" />
                <span className="text-sm font-extrabold text-stone-900">Menu</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-stone-500 hover:text-stone-900 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <MenuLink icon={HomeIcon} label="Home" onClick={() => { setActiveTab("home"); setDrawerOpen(false); }} />
              <MenuLink icon={Briefcase} label="Projects" onClick={() => { setActiveTab("projects"); setDrawerOpen(false); }} />
              <MenuLink icon={Users} label="CRM Pipeline" onClick={() => { setActiveTab("leads"); setDrawerOpen(false); }} />
              <MenuLink icon={MessageSquare} label="Customer Inbox" onClick={() => { setActiveTab("inbox"); setDrawerOpen(false); }} />
              <MenuLink icon={MoreHorizontal} label="Settings & Guardrails" onClick={() => { setActiveTab("more"); setDrawerOpen(false); }} />
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

function MenuLink({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-3 text-sm font-semibold text-stone-700 hover:border-amber-500 hover:text-amber-600 transition">
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}