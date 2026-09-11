import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Download,
  ChevronRight,
  ChevronRight as Chevron,
  Play,
  Users,
  Calculator,
  PenTool,
  CalendarClock,
  Megaphone,
  MessageSquare,
  Sparkles,
  Home as HomeIcon,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Camera,
} from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import ContractorVisualizer from "@/components/contractor/ContractorVisualizer";

const GOLD = "#FFD700";
const GOLD_LIGHT = "#FFFACD";
const GREEN_LIGHT = "#D0F0C0";

const HERO_BG =
  "https://images.unsplash.com/photo-1622895175520-59d2f3c4e642?auto=format&fit=crop&w=1400&q=80";

const WORKFLOW_CARDS = [
  {
    icon: Users,
    title: "Win the Work",
    subtitle: "Leads, replies, follow-ups",
    badge: "4 new",
    badgeColor: GOLD_LIGHT,
  },
  {
    icon: Calculator,
    title: "Build the Bid",
    subtitle: "Photos, takeoff, pricing",
    badge: "3 ready",
    badgeColor: GOLD_LIGHT,
  },
  {
    icon: PenTool,
    title: "Close the Job",
    subtitle: "Approval, contract, e-sign",
    badge: "1 to sign",
    badgeColor: GOLD_LIGHT,
  },
  {
    icon: CalendarClock,
    title: "Deliver the Project",
    subtitle: "Schedule, materials, updates",
    badge: "On track",
    badgeColor: GREEN_LIGHT,
  },
];

const LOWER_CARDS = [
  { icon: Megaphone, title: "Marketing", subtitle: "Grow your business" },
  { icon: MessageSquare, title: "Communications", subtitle: "Email, text, follow-ups" },
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
    <div className="min-h-screen bg-white flex flex-col font-body">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
        <div className="flex items-center justify-between h-14 px-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center shrink-0"
          >
            <Menu className="h-4 w-4 text-stone-700" />
          </button>

          <div className="flex flex-col items-center leading-none flex-1 min-w-0 px-2">
            <div className="flex items-center gap-1.5">
              <img src={LOGO_URL} alt="XPS" className="h-5 w-5 object-contain" />
              <span className="text-[8px] font-bold tracking-wider text-stone-500 uppercase">
                Xtreme AI Systems
              </span>
            </div>
            <span className="text-[13px] font-extrabold text-black font-heading tracking-tight mt-0.5 truncate">
              XTREME CONTRACTOR AI
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="relative w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center">
              <Bell className="h-4 w-4 text-stone-700" />
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
                style={{ background: GOLD }}
              >
                3
              </span>
            </button>
            <button className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center">
              <User className="h-4 w-4 text-stone-700" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main scroll ── */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: "none" }}>
        {/* ── Hero ── */}
        <section className="relative h-56 overflow-hidden">
          <img
            src={HERO_BG}
            alt="Glossy epoxy garage floor"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

          {/* Ask Xtreme AI badge */}
          <button className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-stone-900/90 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-white border border-white/10">
            <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
            Ask Xtreme AI
          </button>

          {/* Hero text */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 pb-6">
            <h1 className="text-[22px] font-extrabold text-white font-heading leading-tight tracking-tight">
              BETTER FLOORS.
              <br />
              BIGGER BUSINESS.
            </h1>
            <p className="text-[12px] text-white/85 mt-1.5 font-medium">
              Estimates. Bids. Contracts. Projects. All in one place.
            </p>
            <button
              onClick={() => setVisualizerOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-5 h-10 text-[13px] font-extrabold text-black self-start"
              style={{ background: GOLD, boxShadow: "0 4px 14px rgba(255,215,0,.4)" }}
            >
              Start New Estimate
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ── What Do You Need to Do? ── */}
        <section className="px-4 pt-5">
          <h2 className="text-[19px] font-extrabold text-black font-heading tracking-tight">
            What Do You Need to Do?
          </h2>

          <div className="mt-3 space-y-2.5">
            {WORKFLOW_CARDS.map((card) => (
              <button
                key={card.title}
                onClick={() => setVisualizerOpen(true)}
                className="w-full flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#F9F9F9] p-3.5 text-left transition hover:border-stone-300 hover:bg-stone-50"
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#F0F0F0" }}
                >
                  <card.icon className="h-5 w-5 text-stone-800" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-black">{card.title}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: card.badgeColor, color: "#333" }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{card.subtitle}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Play className="h-2.5 w-2.5 fill-current" style={{ color: GOLD }}
                      strokeWidth={0} />
                    <span className="text-[10px] font-semibold text-stone-600">
                      Open guided workflow
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-300 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* ── Lower grid ── */}
        <section className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-2.5">
            {LOWER_CARDS.map((card) => (
              <button
                key={card.title}
                className="rounded-2xl border border-stone-200 bg-[#F9F9F9] p-3.5 text-left transition hover:border-stone-300"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: "#F0F0F0" }}
                >
                  <card.icon className="h-5 w-5 text-stone-800" strokeWidth={2} />
                </div>
                <div className="text-[13px] font-bold text-black">{card.title}</div>
                <div className="text-[10px] text-stone-500 mt-0.5">{card.subtitle}</div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Play className="h-2.5 w-2.5 fill-current" style={{ color: GOLD }} strokeWidth={0} />
                  <span className="text-[9px] font-semibold text-stone-600">
                    Open guided workflow
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Start New Estimate (secondary CTA) ── */}
        <section className="px-4 pt-5">
          <button
            onClick={() => setVisualizerOpen(true)}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-[14px] font-extrabold text-black transition"
            style={{ background: GOLD, boxShadow: "0 4px 14px rgba(255,215,0,.4)" }}
          >
            <Camera className="h-5 w-5" /> + Start New Estimate
          </button>
          <p className="text-[10px] text-stone-400 text-center mt-1.5">
            Photo · Color · Sq Ft · Instant Bid · SMS or Email to Client
          </p>
        </section>
      </main>

      {/* ── Bottom nav ── */}
      <nav
        className="fixed bottom-0 inset-x-0 h-[60px] grid grid-cols-5 border-t border-stone-200 bg-white z-30 max-w-[450px] mx-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {BOTTOM_NAV.map((n, i) => (
          <button
            key={i}
            className="flex flex-col items-center justify-center gap-1 relative"
          >
            <n.icon
              className="h-5 w-5"
              style={{ color: n.active ? "#000" : "#9CA3AF" }}
              strokeWidth={n.active ? 2.4 : 1.8}
            />
            <span
              className="text-[9px] font-semibold"
              style={{ color: n.active ? "#000" : "#9CA3AF" }}
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
            className="relative w-full max-w-[450px] mx-auto bg-white rounded-t-2xl border-t border-stone-200 max-h-[70%] flex flex-col"
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
                { icon: Users, label: "Win the Work" },
                { icon: Calculator, label: "Build the Bid" },
                { icon: PenTool, label: "Close the Job" },
                { icon: CalendarClock, label: "Deliver Project" },
                { icon: Megaphone, label: "Marketing" },
                { icon: MessageSquare, label: "Communications" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setDrawerOpen(false);
                    setVisualizerOpen(true);
                  }}
                  className="border border-stone-200 rounded-xl p-3 flex items-center gap-2 text-xs font-medium text-stone-700 hover:border-stone-400"
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