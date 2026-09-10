import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Users, DollarSign, FilePlus, Clock, CheckCircle2, ArrowRight, FolderOpen } from "lucide-react";

export default function ContractorDashboard({ onTabChange }) {
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
  const recentLeads = leads.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-xs text-stone-500 mt-0.5">Your business at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="New Leads" value={newLeads} color="text-blue-400" />
        <StatCard icon={Clock} label="Booked" value={booked} color="text-amber-400" />
        <StatCard icon={CheckCircle2} label="Won" value={won.length} color="text-green-400" />
        <StatCard icon={FolderOpen} label="Active Jobs" value={activeProjects} color="text-purple-400" />
      </div>

      {/* Pipeline value */}
      <div className="xa-card">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-amber-400" />
          <span className="xa-label">Pipeline Value</span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${pipelineValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-stone-500 mt-1">From {won.length} won deals</div>
      </div>

      {/* Quick action */}
      <button
        onClick={() => onTabChange("bid")}
        className="xa-gold w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm"
      >
        <FilePlus className="h-4 w-4" /> Generate New Bid
      </button>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Recent Leads</h2>
          <button onClick={() => onTabChange("pipeline")} className="text-xs text-amber-400 font-semibold flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {recentLeads.length === 0 && (
            <div className="xa-card text-center py-6">
              <p className="text-xs text-stone-500">No leads yet. Generate a bid to get started.</p>
            </div>
          )}
          {recentLeads.map((lead) => (
            <div key={lead.id} className="xa-card xa-card-hover flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-amber-400">
                  {(lead.first_name || "?").charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {lead.first_name} {lead.last_name || ""}
                </div>
                <div className="text-xs text-stone-500 truncate">
                  {lead.city || lead.address || "No address"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-amber-400">
                  {lead.estimate_mid ? `$${Math.round(lead.estimate_mid / 1000)}k` : "—"}
                </div>
                <div className="text-[10px] text-stone-600">{lead.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="xa-card flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] uppercase tracking-wide text-stone-500 font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}