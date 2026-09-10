import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, KanbanSquare, Settings, ExternalLink, Mail, Radar, Globe, ScrollText, Star, Wrench, Factory, Smartphone, Rocket, Layers, UserCircle,   TrendingUp, MessageSquare, Brain, Target, BarChart3, Package, Bot, KeyRound, Share2, Wand2, MapPin, Network, Crown, Building2 } from "lucide-react";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import { XTREME_AI_ICON_URL } from "@/components/Logo";
import AIAssistBubble from "@/components/ai-assist/AIAssistBubble";

const links = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/leads", icon: Users, label: "Leads" },
  { to: "/admin/pipeline", icon: KanbanSquare, label: "Pipeline" },
  { to: "/admin/emails", icon: Mail, label: "Emails" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
  { to: "/admin/competitors", icon: Radar, label: "Competitors" },
  { to: "/admin/google", icon: Globe, label: "Google SEO" },
  { to: "/admin/sop", icon: ScrollText, label: "SOP & Memory" },
  { to: "/admin/tools", icon: Wrench, label: "App Tools" },
  { to: "/admin/tool-hub", icon: Layers, label: "Tool Hub" },
  { to: "/admin/empire", icon: Crown, label: "Website Empire" },
  { to: "/admin/website-factory", icon: Factory, label: "Website Factory" },
  { to: "/admin/app-factory", icon: Smartphone, label: "App Factory" },
  { to: "/admin/national-launch", icon: Rocket, label: "National Launch" },
  { to: "/admin/seo-generator", icon: TrendingUp, label: "SEO Generator" },
  { to: "/admin/lead-scraper", icon: Radar, label: "Lead Scraper" },
  { to: "/admin/xtreme-comms", icon: MessageSquare, label: "Xtreme Comms" },
  { to: "/admin/results", icon: BarChart3, label: "Analytics" },
  { to: "/admin/agent-builder", icon: Bot, label: "Agent Builder" },
  { to: "/admin/vision-strategy", icon: Target, label: "Strategy" },
  { to: "/admin/intelligence", icon: Brain, label: "Intelligence" },
  { to: "/admin/client-packages", icon: Package, label: "Client Pkgs" },
  { to: "/admin/api-keys", icon: KeyRound, label: "API Keys" },
  { to: "/admin/social-studio", icon: Share2, label: "Social Studio" },
  { to: "/admin/rebrand-studio", icon: Wand2, label: "Rebrand Studio" },
  { to: "/admin/location-performance", icon: MapPin, label: "Location Stats" },
  { to: "/admin/swarm", icon: Network, label: "Swarm Command" },
  { to: "/admin/blueprint", icon: Building2, label: "Blueprint" },
  { to: "/admin/operator", icon: Bot, label: "AI Operator" },
  { to: "/portal", icon: UserCircle, label: "Client Portal" },
  { to: "/admin/settings", icon: Settings, label: "Settings" }
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-stone-950 text-white">
        <div className="max-w-7xl mx-auto px-5 flex items-center gap-4 h-16 overflow-x-auto">
          <img src={XTREME_AI_ICON_URL} alt="Xtreme AI Systems — Intelligence For Growth" className="h-10 w-10 object-contain shrink-0" />
          <div className="flex flex-col shrink-0 leading-none">
            <span className="text-[10px] font-bold tracking-[0.18em] text-amber-500 uppercase">Xtreme AI</span>
            <span className="text-sm font-bold text-white tracking-tight">Command Center</span>
          </div>
          <BackButton className="text-stone-400 hover:text-white shrink-0" showLabel={false} />
          <nav className="flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${isActive ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-stone-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/" className="ml-auto text-sm text-stone-400 hover:text-amber-400 flex items-center gap-1 shrink-0 transition-colors">
            Site <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 py-8">
        <Outlet />
      </div>
      <AIAssistBubble />
    </div>
  );
}