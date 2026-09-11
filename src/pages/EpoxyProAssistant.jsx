import React, { useState } from "react";
import { Menu, X, Phone, Sparkles, Package, Image as ImageIcon, BookOpen, HelpCircle, ArrowRight, Home as HomeIcon, Camera } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import VisionWorkflow from "@/components/assistant/VisionWorkflow";
import ContractorVisualizer from "@/components/contractor/ContractorVisualizer";

const GOLD_GRADIENT = "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)";

const HOME_CARDS = [
  { icon: Package, label: "Product Inventory", desc: "Browse XPS products & pricing" },
  { icon: ImageIcon, label: "Inspiration Gallery", desc: "See real finished projects" },
  { icon: BookOpen, label: "Additional Resources", desc: "Guides, videos & support" },
  { icon: HelpCircle, label: "FAQs", desc: "Quick answers to common questions" },
];

const BOTTOM_NAV = [
  { icon: HomeIcon, label: "Home", active: true },
  { icon: Sparkles, label: "Vision" },
  { icon: ImageIcon, label: "Gallery" },
  { icon: HelpCircle, label: "FAQs" },
];

const DRAWER_ITEMS = [
  { icon: HomeIcon, label: "Home" },
  { icon: Sparkles, label: "Your Vision" },
  { icon: Package, label: "Product Inventory" },
  { icon: ImageIcon, label: "Inspiration Gallery" },
  { icon: BookOpen, label: "Additional Resources" },
  { icon: HelpCircle, label: "FAQs" },
  { icon: Phone, label: "Call Support", tel: true },
];

export default function EpoxyProAssistant() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-stone-200 bg-white sticky top-0 z-20">
        <button onClick={() => setDrawerOpen(true)} className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center">
          <Menu className="h-4 w-4 text-stone-700" />
        </button>
        <div className="flex flex-col items-center leading-none flex-1 px-2">
          <span className="text-[13px] font-extrabald text-black font-heading">Epoxy Pro Assistant</span>
          <span className="text-[8px] text-stone-500 mt-0.5 text-center">The App that makes this experience a breeze</span>
        </div>
        <a href="tel:+18555555555" className="h-8 px-3 rounded-lg flex items-center gap-1 text-[11px] font-bold shrink-0" style={{ background: GOLD_GRADIENT, border: "2px solid #000", color: "#1a1a1a", boxShadow: "0 2px 8px rgba(212,175,55,.35), inset 0 1px rgba(255,255,255,.4)" }}>
          <Phone className="h-3 w-3" /> Call Now
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20" style={{ scrollbarWidth: "none" }}>
        {/* Logo + welcome */}
        <div className="text-center pt-5 pb-3">
          <img src={LOGO_URL} alt="Xtreme Polishing Systems" className="h-12 w-12 object-contain mx-auto" />
          <p className="text-[11px] text-stone-500 mt-2">Welcome — let's visualize your new floor</p>
        </div>

        {/* Start New Estimate button — opens the contractor visualizer */}
        <button
          onClick={() => setVisualizerOpen(true)}
          className="w-full h-14 rounded-xl flex items-center justify-center gap-2 text-[14px] font-bold transition"
          style={{ background: GOLD_GRADIENT, border: "2px solid #000", color: "#1a1a1a", boxShadow: "0 4px 12px rgba(212,175,55,.4), inset 0 1px rgba(255,255,255,.4)" }}
        >
          <Camera className="h-4 w-4" /> + Start New Estimate
        </button>
        <p className="text-[10px] text-stone-400 text-center mt-1.5">Photo · Color · Sq Ft · Instant Bid · SMS or Email to Client</p>

        {/* 4 cards */}
        <div className="mt-5 space-y-2.5">
          {HOME_CARDS.map((card) => (
            <button key={card.label} className="xa-gold-hover w-full flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 text-left">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GRADIENT, border: "1.5px solid #000" }}>
                <card.icon className="h-4 w-4 text-stone-900" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-black">{card.label}</div>
                <div className="text-[10px] text-stone-500">{card.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 h-[56px] grid grid-cols-4 border-t border-stone-200 bg-white/96 backdrop-blur z-30 px-2 max-w-[450px] mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {BOTTOM_NAV.map((n, i) => (
          <button key={i} onClick={() => n.label === "Vision" && setVisualizerOpen(true)} className="flex flex-col items-center gap-0.5">
            <n.icon className="h-4 w-4" style={{ color: n.active ? "#D4AF37" : "#9CA3AF" }} strokeWidth={n.active ? 2.2 : 1.8} />
            <span className="text-[8px] font-semibold" style={{ color: n.active ? "#D4AF37" : "#9CA3AF" }}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-[450px] mx-auto bg-white rounded-t-2xl border-t border-stone-200 max-h-[70%] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 h-14 border-b border-stone-200">
              <h3 className="text-sm font-bold text-black">Menu</h3>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto">
              {DRAWER_ITEMS.map((item) => (
                <a key={item.label} href={item.tel ? "tel:+18555555555" : "#"} className="xa-gold-hover border border-stone-200 rounded-xl p-3 flex items-center gap-2 text-xs font-medium text-stone-700">
                  <item.icon className="h-4 w-4 text-amber-600" /> {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vision Workflow */}
      {workflowOpen && <VisionWorkflow onClose={() => setWorkflowOpen(false)} />}

      {/* Contractor Visualizer */}
      {visualizerOpen && <ContractorVisualizer onClose={() => setVisualizerOpen(false)} />}
    </div>
  );
}