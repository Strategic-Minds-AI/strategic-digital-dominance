import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  FilePlus, Users, Filter, FolderOpen, Calendar, MessageSquare,
  Star, Palette, Image as ImageIcon, BarChart3, Megaphone, Settings,
  DollarSign, TrendingUp, Clock, CheckCircle2, ArrowRight, FileText,
  Wrench, MapPin, Phone, Mail, Globe, Zap, Send
} from "lucide-react";

export default function ContractorDashboard({ onTabChange }) {
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
  const recentLeads = leads.slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Workflow action tiles — grouped by daily contractor workflow
  const workflowActions = [
    // Sales
    { icon: FilePlus, label: "New Bid", desc: "On-site estimate", color: "bg-amber-500", onClick: () => onTabChange("bid") },
    { icon: Users, label: "Leads", desc: `${newLeads} new`, color: "bg-blue-500", onClick: () => onTabChange("pipeline") },
    { icon: Filter, label: "Pipeline", desc: `${booked} booked`, color: "bg-purple-500", onClick: () => onTabChange("pipeline") },
    { icon: FolderOpen, label: "Jobs", desc: `${activeProjects} active`, color: "bg-emerald-500", onClick: () => onTabChange("projects") },
    // Operations
    { icon: Calendar, label: "Schedule", desc: "Appointments", color: "bg-cyan-500", onClick: () => navigate("/admin") },
    { icon: MessageSquare, label: "Messages", desc: "Customer chat", color: "bg-indigo-500", onClick: () => navigate("/admin/xtreme-comms") },
    { icon: FileText, label: "Proposals", desc: "Sent bids", color: "bg-orange-500", onClick: () => navigate("/admin/leads") },
    { icon: Wrench, label: "Maintenance", desc: "Care guides", color: "bg-teal-500", onClick: () => navigate("/admin") },
    // Customer-facing sales tools
    { icon: Palette, label: "Color Charts", desc: "Show swatches", color: "bg-pink-500", onClick: () => navigate("/color-charts") },
    { icon: ImageIcon, label: "Gallery", desc: "Before/after", color: "bg-rose-500", onClick: () => navigate("/gallery") },
    { icon: Star, label: "Reviews", desc: "Google reviews", color: "bg-yellow-500", onClick: () => navigate("/admin/reviews") },
    { icon: MapPin, label: "Locations", desc: "Service areas", color: "bg-lime-500", onClick: () => navigate("/locations") },
    // Marketing & backend
    { icon: BarChart3, label: "Analytics", desc: "Revenue stats", color: "bg-violet-500", onClick: () => navigate("/admin") },
    { icon: Megaphone, label: "Social", desc: "Post content", color: "bg-fuchsia-500", onClick: () => navigate("/admin/social-studio") },
    { icon: Globe, label: "SEO Factory", desc: "City pages", color: "bg-sky-500", onClick: () => navigate("/admin/seo-generator") },
    { icon: Zap, label: "Swarm AI", desc: "Auto-optimize", color: "bg-amber-600", onClick: () => navigate("/admin/swarm") },
    // Settings
    { icon: Settings, label: "Settings", desc: "Pricing & info", color: "bg-stone-600", onClick: () => navigate("/admin/settings") },
    { icon: Send, label: "Broadcast", desc: "Email blast", color: "bg-red-500", onClick: () => navigate("/admin/emails") },
  ];

  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
      {/* Hero greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Good morning</div>
            <h1 className="text-xl font-extrabold mt-0.5">Ready to work?</h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-amber-400" />
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-2">Your command center for bids, leads, jobs, and marketing — all synced with your website backend.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <KpiCard icon={Users} value={newLeads} label="New" color="text-blue-600 bg-blue-50" />
        <KpiCard icon={Clock} value={booked} label="Booked" color="text-amber-600 bg-amber-50" />
        <KpiCard icon={CheckCircle2} value={won.length} label="Won" color="text-emerald-600 bg-emerald-50" />
        <KpiCard icon={DollarSign} value={pipelineValue > 0 ? `${Math.round(pipelineValue / 1000)}k` : 0} label="Pipeline" color="text-purple-600 bg-purple-50" />
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => onTabChange("bid")}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-extrabold py-4 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition"
      >
        <FilePlus className="h-5 w-5" /> Generate New Bid
      </button>

      {/* Workflow grid */}
      <div>
        <h2 className="text-sm font-extrabold text-stone-900 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" /> Daily Workflow
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {workflowActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={action.onClick}
                className="group rounded-2xl bg-white border border-stone-200 p-3 flex flex-col items-center gap-2 hover:border-amber-400 hover:shadow-md transition active:scale-95"
              >
                <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-stone-900 leading-tight">{action.label}</div>
                  <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{action.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-stone-900">Recent Leads</h2>
          <button onClick={() => onTabChange("pipeline")} className="text-xs font-bold text-amber-600 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {recentLeads.length === 0 && (
            <div className="rounded-xl bg-white border border-stone-200 text-center py-6">
              <p className="text-xs text-stone-500">No leads yet. Generate a bid to get started.</p>
            </div>
          )}
          {recentLeads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => onTabChange("pipeline")}
              className="w-full rounded-xl bg-white border border-stone-200 p-3 flex items-center gap-3 hover:border-amber-400 transition text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-stone-700">{(lead.first_name || "?").charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-stone-900 truncate">{lead.first_name} {lead.last_name || ""}</div>
                <div className="text-xs text-stone-500 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {lead.city || lead.address || "No address"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-amber-600">
                  {lead.estimate_mid ? `$${Math.round(lead.estimate_mid / 1000)}k` : "—"}
                </div>
                <div className="text-[10px] text-stone-400">{lead.status}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Backend sync section */}
      <div className="rounded-2xl bg-white border border-stone-200 p-4">
        <h2 className="text-sm font-extrabold text-stone-900 mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-amber-500" /> Website Backend Sync
        </h2>
        <div className="space-y-2">
          <SyncRow icon={BarChart3} label="Live Analytics" desc="Traffic & conversions" onClick={() => navigate("/admin")} />
          <SyncRow icon={Megaphone} label="Social Studio" desc="Auto-post to Facebook" onClick={() => navigate("/admin/social-studio")} />
          <SyncRow icon={Globe} label="SEO Page Factory" desc="Generate city pages" onClick={() => navigate("/admin/seo-generator")} />
          <SyncRow icon={Zap} label="Swarm Autopilot" desc="AI auto-audit & fix" onClick={() => navigate("/admin/swarm")} />
          <SyncRow icon={Settings} label="Pricing & Settings" desc="Adjust rates & info" onClick={() => navigate("/admin/settings")} />
        </div>
      </div>

      {/* Quick contact */}
      <div className="flex gap-2.5">
        <a href="tel:+18555555555" className="flex-1 rounded-xl bg-white border border-stone-200 py-3 flex items-center justify-center gap-2 text-sm font-bold text-stone-700 hover:border-amber-400">
          <Phone className="h-4 w-4 text-amber-500" /> Call
        </a>
        <a href="mailto:support@xtremepolishing.com" className="flex-1 rounded-xl bg-white border border-stone-200 py-3 flex items-center justify-center gap-2 text-sm font-bold text-stone-700 hover:border-amber-400">
          <Mail className="h-4 w-4 text-amber-500" /> Email
        </a>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-xl bg-white border border-stone-200 p-2.5 flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-lg font-extrabold text-stone-900 leading-none">{value}</div>
      <div className="text-[10px] text-stone-500 font-semibold">{label}</div>
    </div>
  );
}

function SyncRow({ icon: Icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg p-2 hover:bg-stone-50 transition text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-stone-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-stone-900">{label}</div>
        <div className="text-xs text-stone-500">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-stone-400 shrink-0" />
    </button>
  );
}