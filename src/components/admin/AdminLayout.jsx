import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, KanbanSquare, Settings, ExternalLink, Mail, Radar, Globe, ScrollText, Star, Wrench, Factory, Smartphone, Rocket, Layers } from "lucide-react";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";

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
  { to: "/admin/website-factory", icon: Factory, label: "Website Factory" },
  { to: "/admin/app-factory", icon: Smartphone, label: "App Factory" },
  { to: "/admin/national-launch", icon: Rocket, label: "National Launch" },
  { to: "/admin/settings", icon: Settings, label: "Settings" }
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-stone-950 text-white">
        <div className="max-w-7xl mx-auto px-5 flex items-center gap-6 h-14 overflow-x-auto">
          <Logo className="shrink-0" />
          <BackButton className="text-stone-400 hover:text-white shrink-0" showLabel={false} />
          <span className="font-semibold tracking-tight shrink-0">Admin</span>
          <nav className="flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isActive ? "bg-white/15 text-white" : "text-stone-400 hover:text-white"}`
                }
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/" className="ml-auto text-sm text-stone-400 hover:text-white flex items-center gap-1 shrink-0">
            Site <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 py-8">
        <Outlet />
      </div>
    </div>
  );
}