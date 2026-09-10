import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Plus, ChevronRight, ScanLine, LayoutDashboard, Phone, Wand2,
  Image as ImageIcon, Layers, ClipboardList, Globe, Calendar,
  Palette, DollarSign, FileText, Users, Star, BarChart3, Megaphone,
  Settings, Zap, Send, TrendingUp, Clock, CheckCircle2, MapPin
} from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1606761568499-4636cad0e8a7?w=800&q=80";

export default function ContractorHome({ onTabChange }) {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [leadList, projList] = await Promise.all([
          base44.entities.Lead.list("-created_date", 50),
          base44.entities.ClientProject.list("-created_date", 20),
        ]);
        setLeads(leadList || []);
        setProjects(projList || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const newLeads = leads.filter((l) => l.status === "NEW ESTIMATE").length;
  const booked = leads.filter((l) => l.status === "CONSULTATION BOOKED" || l.status === "IN-HOME ESTIMATE BOOKED").length;
  const won = leads.filter((l) => l.status === "WON");
  const pipelineValue = won.reduce((sum, l) => sum + (l.won_value || l.estimate_mid || 0), 0);
  const activeProjects = projects.filter((p) => p.status !== "complete").length;
  const recentLeads = leads.slice(0, 3);

  // Quick Actions — matching the visualizer app's 4-card grid
  const quickActions = [
    { icon: ScanLine, label: "Visualizer", desc: "New bid", onClick: () => navigate("/contractor/bid") },
    { icon: LayoutDashboard, label: "Dashboard", desc: "Stats", onClick: () => navigate("/admin") },
    { icon: Phone, label: "Voice AI", desc: "Calls", onClick: () => navigate("/admin/xtreme-comms") },
    { icon: Wand2, label: "Business Gen", desc: "AI tools", onClick: () => navigate("/admin/agent-builder") },
  ];

  // Tools portal — matching the visualizer app's tools grid
  const tools = [
    { icon: ImageIcon, label: "Gallery", onClick: () => navigate("/gallery") },
    { icon: Layers, label: "Floor Systems", onClick: () => navigate("/color-charts") },
    { icon: ClipboardList, label: "Operations", onClick: () => navigate("/admin") },
    { icon: Globe, label: "Scraper", onClick: () => navigate("/admin/lead-scraper") },
    { icon: Calendar, label: "Schedule", onClick: () => navigate("/admin") },
    { icon: Wand2, label: "Generators", onClick: () => navigate("/admin/agent-builder") },
    { icon: Palette, label: "Color Charts", onClick: () => navigate("/color-charts") },
    { icon: DollarSign, label: "Pricing", onClick: () => navigate("/admin/settings") },
    { icon: FileText, label: "Proposals", onClick: () => onTabChange("leads") },
    { icon: Users, label: "CRM", onClick: () => onTabChange("leads") },
    { icon: Star, label: "Reviews", onClick: () => navigate("/admin/reviews") },
    { icon: BarChart3, label: "Analytics", onClick: () => navigate("/admin") },
    { icon: Megaphone, label: "Social", onClick: () => navigate("/admin/social-studio") },
    { icon: Globe, label: "SEO Factory", onClick: () => navigate("/admin/seo-generator") },
    { icon: Zap, label: "Swarm AI", onClick: () => navigate("/admin/swarm") },
    { icon: Send, label: "Broadcast", onClick: () => navigate("/admin/emails") },
    { icon: Settings, label: "Settings", onClick: () => navigate("/admin/settings") },
    { icon: MapPin, label: "Locations", onClick: () => navigate("/locations") },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h1 className="text-2xl font-extrabold text-white leading-tight">
            Xtreme Floor<br />Visualizer
          </h1>
          <p className="text-xs text-stone-300 mt-1.5">Your command center for bids, leads & jobs</p>
          <button
            onClick={() => navigate("/contractor/bid")}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold text-sm px-5 py-2.5 shadow-lg shadow-amber-500/30 self-start active:scale-95 transition"
          >
            <Plus size={18} />
            <span>Start Visualizer</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      {!loading && (
        <div className="grid grid-cols-4 gap-2 px-4 -mt-4 relative z-10">
          <KpiPill icon={Users} value={newLeads} label="New" color="text-blue-600" />
          <KpiPill icon={Clock} value={booked} label="Booked" color="text-amber-600" />
          <KpiPill icon={CheckCircle2} value={won.length} label="Won" color="text-emerald-600" />
          <KpiPill icon={TrendingUp} value={pipelineValue > 0 ? `${Math.round(pipelineValue / 1000)}k` : 0} label="Pipeline" color="text-purple-600" />
        </div>
      )}

      {/* Quick Actions */}
      <section className="px-4 mt-5">
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-stone-200 p-3 hover:border-amber-400 hover:shadow-md transition active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm">
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-bold text-stone-900 text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tools portal */}
      <section className="px-4 mt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-stone-900">Tools</h2>
          <button onClick={() => onTabChange("more")} className="text-xs font-bold text-amber-600">See all</button>
        </div>
        <div className="space-y-2">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <button
                key={i}
                onClick={tool.onClick}
                className="w-full flex items-center gap-3 rounded-xl bg-white border border-stone-200 p-3 hover:border-amber-400 hover:shadow-sm transition active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                  <Icon size={18} />
                </div>
                <span className="flex-1 text-left text-sm font-bold text-stone-900">{tool.label}</span>
                <ChevronRight size={16} className="text-stone-400" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent leads */}
      {!loading && recentLeads.length > 0 && (
        <section className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-stone-900">Recent Leads</h2>
            <button onClick={() => onTabChange("leads")} className="text-xs font-bold text-amber-600 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => onTabChange("leads")}
                className="w-full rounded-xl bg-white border border-stone-200 p-3 flex items-center gap-3 hover:border-amber-400 transition text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-stone-700">{(lead.first_name || "?").charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-900 truncate">{lead.first_name} {lead.last_name || ""}</div>
                  <div className="text-xs text-stone-500 truncate">{lead.city || lead.address || "No address"}</div>
                </div>
                {lead.estimate_mid && (
                  <div className="text-xs font-bold text-amber-600 shrink-0">${Math.round(lead.estimate_mid / 1000)}k</div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function KpiPill({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-xl bg-white border border-stone-200 px-2 py-2.5 flex flex-col items-center gap-0.5 shadow-sm">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="text-base font-extrabold text-stone-900 leading-none">{value}</div>
      <div className="text-[9px] text-stone-500 font-semibold">{label}</div>
    </div>
  );
}