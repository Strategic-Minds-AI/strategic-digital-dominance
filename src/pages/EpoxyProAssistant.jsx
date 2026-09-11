import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Download,
  ChevronRight,
  Plus,
  Play,
  Search,
  Calculator,
  FileText,
  MessageSquare,
  PenTool,
  Package,
  Briefcase,
  Sparkles,
  Home as HomeIcon,
  ClipboardList,
  FileSpreadsheet,
  MoreHorizontal,
} from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import ContractorVisualizer from "@/components/contractor/ContractorVisualizer";

const GOLD = "#FFD700";
const BADGE_YELLOW = "#FFF9C4";
const SHADOW_CARD = "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)";
const SHADOW_CARD_HOVER = "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)";
const SHADOW_HERO_BTN = "0 6px 20px rgba(255,215,0,0.45)";
const SHADOW_AI_BAR = "0 6px 20px rgba(0,0,0,0.25)";

const HERO_BG =
  "https://images.unsplash.com/photo-1622895175520-59d2f3c4e642?auto=format&fit=crop&w=1400&q=80";

const WORKFLOW_CARDS = [
  { icon: Search, title: "Find & Qualify Leads", badge: "4 new" },
  { icon: Calculator, title: "Takeoff & Estimate", badge: "3 ready" },
  { icon: FileText, title: "Review & Send Bid", badge: "2 ready" },
  { icon: MessageSquare, title: "Respond & Close", badge: "3 replies" },
  { icon: PenTool, title: "Sign & Schedule", badge: "1 to sign" },
  { icon: Package, title: "Order Materials", badge: "1 ready" },
];

const BOTTOM_NAV = [
  { icon: HomeIcon, label: "Home", active: true },
  { icon: ClipboardList, label: "Leads" },
  { icon: FileSpreadsheet, label: "Takeoffs" },
  { icon: FileText, label: "Bids" },
  { icon: MoreHorizontal, label: "More" },
];

export default function EpoxyProAssistant() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-body" style={{ background: "#F5F5F5" }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white" style={{ boxShadow: SHADOW_CARD }}>
        <div className="flex items-center justify-between h-14 px-3">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center"
            >
              <Menu className="h-5 w-5 text-stone-800" />
            </button>
            <img src={LOGO_URL} alt="XPS" className="h-7 w-7 object-contain" />
            <span className="text-[13px] font-extrabold text-black font-heading tracking-tight hidden sm:inline">
              XTREME CONTRACTOR AI
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-stone-700" />
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
                style={{ background: GOLD }}
              >
                3
              </span>
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-stone-700" />
            </button>
            <button
              className="h-9 px-3 rounded-full flex items-center gap-1.5 text-[12px] font-bold text-black"
              style={{ background: GOLD, boxShadow: "0 2px 8px rgba(255,215,0,0.4)" }}
            >
              <Download className="h-4 w-4" />
              Download App
            </button>
          </div>
        </div>
      </header>

      {/* ── Main scroll ── */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
        {/* ── Hero ── */}
        <section className="relative h-60 overflow-hidden">
          <img
            src={HERO_BG}
            alt="Glossy epoxy garage floor"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />

          <div className="absolute inset-0 flex flex-col justify-end p-5 pb-6">
            <h1 className="text-[26px] font-extrabold text-white font-heading leading-tight tracking-tight">
              Turn Floors Into Profits.
            </h1>
            <p className="text-[13px] text-white/90 mt-1.5 font-medium">
              Faster takeoffs. Accurate estimates. More jobs.
            </p>
            <button
              onClick={() => setVisualizerOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-5 h-11 text-[14px] font-extrabold text-black self-start"
              style={{ background: GOLD, boxShadow: SHADOW_HERO_BTN }}
            >
              <Plus className="h-4 w-4" /> Start New Estimate <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ── Job Workflow ── */}
        <section className="px-4 pt-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[19px] font-extrabold text-black font-heading tracking-tight">
              Job Workflow
            </h2>
            <span className="text-[11px] text-stone-400">From lead to finished floor.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {WORKFLOW_CARDS.map((card) => (
              <button
                key={card.title}
                onClick={() => setVisualizerOpen(true)}
                className="flex items-start gap-2.5 rounded-2xl bg-white p-3 text-left transition border border-stone-200"
                style={{ boxShadow: SHADOW_CARD }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = SHADOW_CARD_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW_CARD)}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#F5F5F5" }}
                >
                  <card.icon className="h-4 w-4 text-black" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-black leading-tight">
                      {card.title}
                    </span>
                  </div>
                  <span
                    className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: BADGE_YELLOW, color: "#5a4a00" }}
                  >
                    {card.badge}
                  </span>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Play
                      className="h-2.5 w-2.5 fill-current"
                      style={{ color: GOLD }}
                      strokeWidth={0}
                    />
                    <span className="text-[9px] font-medium text-stone-500">
                      Guided workflow
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-300 shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </section>

        {/* ── Business Tools ── */}
        <section className="px-4 pt-4">
          <button
            onClick={() => setVisualizerOpen(true)}
            className="w-full flex items-center gap-3 rounded-2xl bg-white p-4 text-left transition border border-stone-200"
            style={{ boxShadow: SHADOW_CARD }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = SHADOW_CARD_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = SHADOW_CARD)}
          >
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#F5F5F5" }}
            >
              <Briefcase className="h-5 w-5 text-black" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-black">Business Tools</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Marketing, communications, projects and more.
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-stone-300 shrink-0" />
          </button>
        </section>

        {/* ── AI Access Bar ── */}
        <section className="px-4 pt-3">
          <button
            onClick={() => setVisualizerOpen(true)}
            className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition"
            style={{ background: "#1A1A1A", boxShadow: SHADOW_AI_BAR }}
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#2A2A2A" }}>
              <Sparkles className="h-5 w-5" style={{ color: GOLD }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-white">Ask Xtreme AI</div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Get answers, ideas and next steps.
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white shrink-0" />
          </button>
        </section>
      </main>

      {/* ── Bottom nav ── */}
      <nav
        className="fixed bottom-0 inset-x-0 h-[60px] grid grid-cols-5 bg-white z-30 max-w-[450px] mx-auto"
        style={{
          boxShadow: "0 -2px 10px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {BOTTOM_NAV.map((n, i) => (
          <button
            key={i}
            className="flex flex-col items-center justify-center gap-1 relative"
          >
            <n.icon
              className="h-5 w-5"
              style={{ color: n.active ? GOLD : "#9CA3AF" }}
              strokeWidth={n.active ? 2.4 : 1.8}
            />
            <span
              className="text-[9px] font-semibold"
              style={{ color: n.active ? "#B8860B" : "#9CA3AF" }}
            >
              {n.label}
            </span>
            {n.active && (
              <span
                className="absolute bottom-0 h-0.5 w-8 rounded-full"
                style={{ background: GOLD }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-[450px] mx-auto bg-white rounded-t-2xl max-h-[70%] flex flex-col"
            style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-stone-200">
              <h3 className="text-sm font-bold text-black">Menu</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto">
              {[
                { icon: HomeIcon, label: "Home" },
                { icon: Search, label: "Find Leads" },
                { icon: Calculator, label: "Takeoff" },
                { icon: FileText, label: "Send Bid" },
                { icon: MessageSquare, label: "Respond" },
                { icon: PenTool, label: "Sign & Schedule" },
                { icon: Package, label: "Order Materials" },
                { icon: Briefcase, label: "Business Tools" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setDrawerOpen(false);
                    setVisualizerOpen(true);
                  }}
                  className="rounded-xl p-3 flex items-center gap-2 text-xs font-medium text-stone-700 transition"
                  style={{ background: "#F9F9F9", boxShadow: SHADOW_CARD }}
                >
                  <item.icon className="h-4 w-4" style={{ color: GOLD }} /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Contractor Visualizer ── */}
      {visualizerOpen && <ContractorVisualizer onClose={() => setVisualizerOpen(false)} />}
    </div>
  );
}