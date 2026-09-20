import React, { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, KanbanSquare, Settings, ExternalLink, Mail, Radar, Globe, ScrollText, Star, Wrench, Factory, Smartphone, Rocket, Layers, Layout, UserCircle, TrendingUp, MessageSquare, Brain, Target, BarChart3, Package, Bot, KeyRound, Share2, Wand2, MapPin, Network, Crown, Building2, Code2, Heart, PhoneCall, Activity, ListOrdered, Database, Workflow, Gauge, Cpu, Sparkles, Boxes, BookOpen, Eye, EyeOff, Zap, Shield, Compass, Menu, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import { XTREME_AI_ICON_URL } from "@/components/Logo";
import AIAssistBubble from "@/components/ai-assist/AIAssistBubble";

const navGroups = [
  {
    label: null,
    items: [
      { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Dominance Engines",
    items: [
      { to: "/admin/meta-agent", icon: Brain, label: "Meta Agent" },
      { to: "/admin/site-builder", icon: Crown, label: "Site Builder" },
      { to: "/admin/dominance-sandbox", icon: Rocket, label: "Sandbox" },
      { to: "/admin/builder-library", icon: Sparkles, label: "Builder Library" },
      { to: "/admin/domain-rush", icon: Crown, label: "Domain Rush" },
      { to: "/admin/crystal-ball", icon: Sparkles, label: "Crystal Ball" },
      { to: "/admin/national-launch", icon: Rocket, label: "National Launch" },
    ],
  },
  {
    label: "AI Core & Architecture",
    items: [
      { to: "/admin/architecture", icon: Compass, label: "Architecture" },
      { to: "/admin/alpha-prime", icon: Crown, label: "Alpha Prime" },
      { to: "/admin/fleet", icon: Layers, label: "Fleet" },
      { to: "/admin/vision-cortex", icon: Eye, label: "Vision Cortex" },
      { to: "/admin/shadow", icon: EyeOff, label: "Shadow" },
      { to: "/admin/system-map", icon: Boxes, label: "System Map" },
      { to: "/admin/platform", icon: Cpu, label: "Platform" },
      { to: "/admin/system-health", icon: Gauge, label: "System Health" },
      { to: "/admin/autocomplete", icon: Zap, label: "AutoComplete" },
    ],
  },
  {
    label: "Agents & Automation",
    items: [
      { to: "/admin/agent-builder", icon: Bot, label: "Agent Builder" },
      { to: "/admin/agent-master", icon: Bot, label: "Agent Master" },
      { to: "/admin/swarm", icon: Network, label: "Swarm Command" },
      { to: "/admin/operator", icon: Bot, label: "AI Operator" },
      { to: "/admin/workflows", icon: Workflow, label: "Workflows" },
      { to: "/admin/playbooks", icon: BookOpen, label: "Playbooks" },
    ],
  },
  {
    label: "Simulation & Intelligence",
    items: [
      { to: "/admin/contractor-simulation", icon: Users, label: "Simulation" },
      { to: "/admin/seo-simulator", icon: Sparkles, label: "SEO Simulator" },
      { to: "/admin/intelligence", icon: Brain, label: "Intelligence" },
      { to: "/admin/vision-strategy", icon: Target, label: "Strategy" },
      { to: "/admin/rag", icon: Database, label: "RAG Engine" },
      { to: "/admin/graph", icon: Workflow, label: "Knowledge Graph" },
    ],
  },
  {
    label: "Website Factory",
    items: [
      { to: "/admin/website-factory", icon: Factory, label: "Website Factory" },
      { to: "/admin/app-factory", icon: Smartphone, label: "App Factory" },
      { to: "/admin/templates", icon: Layout, label: "Templates" },
      { to: "/admin/empire", icon: Crown, label: "Website Empire" },
      { to: "/admin/queue", icon: ListOrdered, label: "Site Queue" },
      { to: "/admin/code-studio", icon: Code2, label: "Code Studio" },
      { to: "/admin/rebrand-studio", icon: Wand2, label: "Rebrand Studio" },
    ],
  },
  {
    label: "SEO & Content",
    items: [
      { to: "/admin/google", icon: Globe, label: "Google SEO" },
      { to: "/admin/seo-dominance", icon: Rocket, label: "SEO Dominance" },
      { to: "/admin/seo-generator", icon: TrendingUp, label: "SEO Generator" },
      { to: "/admin/url-strategy", icon: Globe, label: "URL Strategy" },
      { to: "/admin/site-health", icon: Heart, label: "Site Health" },
      { to: "/admin/sop", icon: ScrollText, label: "SOP & Memory" },
    ],
  },
  {
    label: "Leads & Pipeline",
    items: [
      { to: "/admin/leads", icon: Users, label: "Leads" },
      { to: "/admin/pipeline", icon: KanbanSquare, label: "Pipeline" },
      { to: "/admin/emails", icon: Mail, label: "Emails" },
      { to: "/admin/reviews", icon: Star, label: "Reviews" },
      { to: "/admin/lead-scraper", icon: Radar, label: "Lead Scraper" },
      { to: "/admin/skip-trace", icon: Radar, label: "Skip Trace" },
      { to: "/admin/autocomplete", icon: Zap, label: "AutoComplete" },
      { to: "/admin/location-performance", icon: MapPin, label: "Location Stats" },
    ],
  },
  {
    label: "Communications",
    items: [
      { to: "/admin/xtreme-comms", icon: MessageSquare, label: "Xtreme Comms" },
      { to: "/admin/voice-assistant", icon: PhoneCall, label: "AI Voice" },
      { to: "/admin/social-studio", icon: Share2, label: "Social Studio" },
    ],
  },
  {
    label: "Analytics & Competitors",
    items: [
      { to: "/admin/results", icon: BarChart3, label: "Analytics" },
      { to: "/admin/analytics", icon: Activity, label: "GA Traffic" },
      { to: "/admin/competitors", icon: Radar, label: "Competitors" },
    ],
  },
  {
    label: "Admin & Security",
    items: [
      { to: "/admin/vault", icon: Shield, label: "Vault" },
      { to: "/admin/api-keys", icon: KeyRound, label: "API Keys" },
      { to: "/admin/client-packages", icon: Package, label: "Client Pkgs" },
      { to: "/admin/tools", icon: Wrench, label: "App Tools" },
      { to: "/admin/tool-hub", icon: Layers, label: "Tool Hub" },
      { to: "/admin/blueprint", icon: Building2, label: "Blueprint" },
      { to: "/portal", icon: UserCircle, label: "Client Portal" },
      { to: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* === LEFT SIDEBAR / COMMAND CENTER === */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-stone-950 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-stone-800 shrink-0">
          <img src={XTREME_AI_ICON_URL} alt="Xtreme AI Systems" className="h-9 w-9 object-contain shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-bold tracking-[0.18em] text-amber-500 uppercase">Xtreme AI</span>
            <span className="text-sm font-bold text-white tracking-tight">Command Center</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-stone-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation — scrollable, categorized */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          {navGroups.map((group, gi) => (
            <div key={gi} className="space-y-0.5">
              {group.label && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-[0.14em] uppercase text-stone-600">
                  {group.label}
                </div>
              )}
              {group.items.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "text-stone-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`
                  }
                >
                  <l.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{l.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-3 border-t border-stone-800 shrink-0 space-y-1">
          <BackButton className="text-stone-400 hover:text-white w-full" showLabel={true} />
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* === RIGHT CONTENT === */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-stone-950 text-white shrink-0 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-stone-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <img src={XTREME_AI_ICON_URL} alt="Xtreme AI" className="h-7 w-7 object-contain" />
          <span className="text-sm font-bold text-white">Command Center</span>
        </div>

        {/* Page content */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-5 py-8">
          <Outlet />
        </div>
      </div>

      <AIAssistBubble />
    </div>
  );
}