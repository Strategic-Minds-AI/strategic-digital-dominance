import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanLine, LayoutDashboard, Phone, Wand2, Image as ImageIcon,
  Layers, ClipboardList, Globe, Calendar, Palette, DollarSign,
  FileText, Users, Star, BarChart3, Megaphone, Settings, Zap,
  Send, MapPin, Shield, Bell, Download, Eye, ArrowRight, Home as HomeIcon,
  Briefcase, MessageSquare
} from "lucide-react";

export default function ContractorMore({ onTabChange }) {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Main",
      items: [
        { icon: HomeIcon, label: "Home", onClick: () => onTabChange("home") },
        { icon: Briefcase, label: "Projects & Proposals", onClick: () => onTabChange("projects") },
        { icon: Users, label: "CRM Pipeline", onClick: () => onTabChange("leads") },
        { icon: MessageSquare, label: "Customer Inbox", onClick: () => onTabChange("inbox") },
      ],
    },
    {
      title: "Sales Tools",
      items: [
        { icon: ScanLine, label: "Visualizer", onClick: () => navigate("/contractor/bid") },
        { icon: Palette, label: "Color Charts", onClick: () => navigate("/color-charts") },
        { icon: ImageIcon, label: "Gallery", onClick: () => navigate("/gallery") },
        { icon: Layers, label: "Floor Systems", onClick: () => navigate("/color-charts") },
        { icon: FileText, label: "Proposals", onClick: () => onTabChange("leads") },
        { icon: DollarSign, label: "Pricing Rules", onClick: () => navigate("/admin/settings") },
      ],
    },
    {
      title: "Operations",
      items: [
        { icon: ClipboardList, label: "Operations", onClick: () => navigate("/admin") },
        { icon: Calendar, label: "Appointments", onClick: () => navigate("/admin") },
        { icon: Phone, label: "Voice AI / Comms", onClick: () => navigate("/admin/xtreme-comms") },
        { icon: Send, label: "Broadcast Email", onClick: () => navigate("/admin/emails") },
        { icon: Star, label: "Reviews", onClick: () => navigate("/admin/reviews") },
        { icon: MapPin, label: "Locations", onClick: () => navigate("/locations") },
      ],
    },
    {
      title: "Marketing & AI",
      items: [
        { icon: Megaphone, label: "Social Studio", onClick: () => navigate("/admin/social-studio") },
        { icon: Globe, label: "SEO Page Factory", onClick: () => navigate("/admin/seo-generator") },
        { icon: Zap, label: "Swarm Autopilot", onClick: () => navigate("/admin/swarm") },
        { icon: Wand2, label: "Agent Builder", onClick: () => navigate("/admin/agent-builder") },
        { icon: LayoutDashboard, label: "Analytics Dashboard", onClick: () => navigate("/admin") },
        { icon: Download, label: "Lead Scraper", onClick: () => navigate("/admin/lead-scraper") },
      ],
    },
    {
      title: "System",
      items: [
        { icon: Settings, label: "Settings & Pricing", onClick: () => navigate("/admin/settings") },
        { icon: Shield, label: "Guardrails", onClick: () => navigate("/admin") },
        { icon: Bell, label: "Notifications", onClick: () => navigate("/admin") },
        { icon: Eye, label: "View Website", onClick: () => navigate("/") },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-extrabold text-stone-900">More</h1>
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 rounded-xl bg-white border border-stone-200 p-3 hover:border-amber-400 hover:shadow-sm transition active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left text-sm font-bold text-stone-900">{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-stone-400" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}