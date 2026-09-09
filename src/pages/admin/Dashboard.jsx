import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/admin/StatCard";
import FunnelDropoff from "@/components/admin/FunnelDropoff";
import CwvWidget from "@/components/admin/CwvWidget";
import LocationLeaderboard from "@/components/admin/LocationLeaderboard";
import { money } from "@/lib/pricing";
import { Link } from "react-router-dom";
import { Bell, Calendar, Phone, Home, FileText, Trophy, DollarSign, Percent, Zap } from "lucide-react";
import { XTREME_AI_ICON_URL } from "@/components/Logo";
import { isAfter, subDays, startOfDay } from "date-fns";

export default function Dashboard() {
  const { data: leads = [] } = useQuery({ queryKey: ["leads"], queryFn: () => base44.entities.Lead.list("-created_date", 500) });
  const { data: appts = [] } = useQuery({ queryKey: ["appts"], queryFn: () => base44.entities.Appointment.list("-created_date", 500) });
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: () => base44.entities.FunnelEvent.list("-created_date", 1000) });

  const today = startOfDay(new Date());
  const weekAgo = subDays(new Date(), 7);
  const inRange = (d, from) => isAfter(new Date(d), from);

  const todayCount = leads.filter((l) => inRange(l.created_date, today)).length;
  const weekCount = leads.filter((l) => inRange(l.created_date, weekAgo)).length;
  const phone = appts.filter((a) => a.type === "PHONE CONSULTATION").length;
  const home = appts.filter((a) => a.type === "IN-HOME ESTIMATE").length;
  const proposals = leads.filter((l) => l.status === "PROPOSAL SENT").length;
  const won = leads.filter((l) => l.status === "WON");
  const pipeline = leads.filter((l) => !["WON", "LOST"].includes(l.status)).reduce((s, l) => s + (l.estimate_mid || 0), 0);
  const convRate = leads.length ? Math.round((won.length / leads.length) * 100) : 0;

  const starts = events.filter((e) => e.event === "estimator_started").length;
  const visitors = events.filter((e) => e.event === "page_view").length;
  const newLeads = leads.filter((l) => l.status === "NEW ESTIMATE");

  return (
    <div className="space-y-8">
      {/* Branded header */}
      <div className="xa-electric-hover rounded-2xl bg-stone-950 p-6 flex items-center gap-5">
        <img src={XTREME_AI_ICON_URL} alt="Xtreme AI Systems" className="h-16 w-16 object-contain shrink-0" />
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Xtreme AI Systems</div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Command Center</h1>
          <p className="text-sm text-stone-400 mt-1">Intelligence for growth — real-time lead pipeline & performance</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-stone-500">
          <Zap className="h-4 w-4 text-amber-500" />
          Live data
        </div>
      </div>

      {/* New leads alert */}
      {newLeads.length > 0 && (
        <div className="xa-electric-hover rounded-2xl bg-amber-500 text-stone-950 p-5 flex items-start gap-3">
          <Bell className="h-5 w-5 mt-0.5" />
          <div>
            <div className="font-bold">{newLeads.length} NEW ESTIMATE LEAD{newLeads.length > 1 ? "S" : ""}</div>
            <div className="text-sm mt-1">
              Newest: {newLeads[0].first_name} {newLeads[0].last_name} · {newLeads[0].city}{" "}
              <Link to={`/admin/leads/${newLeads[0].id}`} className="underline font-semibold">Open lead</Link>
            </div>
          </div>
        </div>
      )}

      {/* Stat grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Estimates today" value={todayCount} icon={Calendar} accent="amber" />
        <StatCard label="Estimates this week" value={weekCount} icon={Calendar} accent="blue" />
        <StatCard label="Phone consultations" value={phone} icon={Phone} accent="purple" />
        <StatCard label="Home visit booked" value={home} icon={Home} accent="green" />
        <StatCard label="Proposals sent" value={proposals} icon={FileText} accent="stone" />
        <StatCard label="Won projects" value={won.length} icon={Trophy} accent="green" />
        <StatCard label="Est. pipeline value" value={money(pipeline)} icon={DollarSign} accent="amber" />
        <StatCard label="Conversion rate" value={`${convRate}%`} sub="Leads → won" icon={Percent} accent="purple" />
      </div>

      <LocationLeaderboard leads={leads} />
      <FunnelDropoff />
      <CwvWidget />
    </div>
  );
}