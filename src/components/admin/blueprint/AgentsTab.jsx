import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Bot, Zap, MessageSquare, Activity } from "lucide-react";

const AGENTS = [
  {
    name: "swarm_orchestrator",
    role: "Swarm Orchestrator",
    category: "leadership",
    desc: "Master coordinator — dispatches tasks, monitors agent health, runs 30-min autopilot cycle (audit → fix → heal → harden → optimize)",
    capabilities: ["entity_read", "entity_write", "function_call", "task_dispatch", "agent_monitoring"],
    model: "claude-sonnet-5",
    icon: "🧠",
    color: "amber",
    triggers: ["scheduled:30min", "manual"],
  },
  {
    name: "lead_orchestrator",
    role: "Lead Orchestrator",
    category: "sales",
    desc: "Manages lead lifecycle — scoring, enrichment, assignment, follow-up sequencing, pipeline progression",
    capabilities: ["entity_read", "entity_write", "function_call", "email_send", "calendar_book"],
    model: "claude-sonnet-5",
    icon: "🎯",
    color: "blue",
    triggers: ["entity:Lead.created", "scheduled:daily"],
  },
  {
    name: "seo_manager",
    role: "SEO Manager",
    category: "marketing",
    desc: "Content generation, meta optimization, sitemap management, GSC verification, index pinging, Core Web Vitals monitoring",
    capabilities: ["entity_read", "entity_write", "function_call", "web_search", "gsc_api"],
    model: "gemini_3_flash",
    icon: "📈",
    color: "emerald",
    triggers: ["scheduled:daily", "entity:GeneratedPage.created"],
  },
  {
    name: "social_manager",
    role: "Social Media Manager",
    category: "marketing",
    desc: "Auto-generates and publishes Facebook posts, tracks engagement, manages content calendar",
    capabilities: ["entity_read", "entity_write", "function_call", "facebook_publish"],
    model: "claude-sonnet-5",
    icon: "📱",
    color: "purple",
    triggers: ["scheduled:daily"],
  },
  {
    name: "reputation_manager",
    role: "Reputation Manager",
    category: "support",
    desc: "Monitors Google reviews, auto-requests reviews on project completion, responds to feedback",
    capabilities: ["entity_read", "entity_write", "function_call", "email_send"],
    model: "claude-sonnet-5",
    icon: "⭐",
    color: "cyan",
    triggers: ["entity:ClientProject.updated"],
  },
  {
    name: "site_factory_manager",
    role: "Site Factory Manager",
    category: "operations",
    desc: "Mass-produces city-specific contractor websites, manages deployment, DNS routing, PWA generation",
    capabilities: ["entity_read", "entity_write", "function_call", "dns_manage", "app_clone"],
    model: "claude-sonnet-5",
    icon: "🏭",
    color: "orange",
    triggers: ["entity:WebsiteTemplate.created", "manual"],
  },
  {
    name: "comms_manager",
    role: "Communications Manager",
    category: "operations",
    desc: "Multi-channel outreach — email, SMS, MMS, voice AI. Manages Telnyx sessions, Xtreme Comms API, follow-up sequences",
    capabilities: ["entity_read", "entity_write", "function_call", "telnyx_call", "sms_send", "email_send"],
    model: "claude-sonnet-5",
    icon: "📡",
    color: "red",
    triggers: ["entity:Lead.updated", "scheduled:daily"],
  },
];

const CATEGORIES = [
  { key: "leadership", label: "Leadership", color: "amber" },
  { key: "sales", label: "Sales", color: "blue" },
  { key: "marketing", label: "Marketing", color: "emerald" },
  { key: "operations", label: "Operations", color: "orange" },
  { key: "support", label: "Support", color: "cyan" },
  { key: "technical", label: "Technical", color: "purple" },
  { key: "compliance", label: "Compliance", color: "red" },
  { key: "finance", label: "Finance", color: "stone" },
  { key: "creative", label: "Creative", color: "pink" },
];

export default function AgentsTab() {
  const [taskCounts, setTaskCounts] = useState({});
  const [msgCount, setMsgCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tasks, msgs] = await Promise.all([
          base44.entities.SwarmTask.list("-created_date", 200),
          base44.entities.SwarmMessage.list("-created_date", 50),
        ]);
        const counts = {};
        (tasks || []).forEach((t) => {
          counts[t.assigned_agent] = (counts[t.assigned_agent] || 0) + 1;
        });
        setTaskCounts(counts);
        setMsgCount((msgs || []).length);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900">AGI Swarm Agent Registry</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-stone-500"><Bot className="h-3.5 w-3.5" /> {AGENTS.length} agents</span>
          <span className="flex items-center gap-1 text-stone-500"><MessageSquare className="h-3.5 w-3.5" /> {msgCount} messages</span>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AGENTS.map((agent) => (
          <div key={agent.name} className="rounded-xl border border-stone-200 p-4 hover:border-amber-400 transition">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl bg-${agent.color}-100 flex items-center justify-center text-xl shrink-0`}>
                {agent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-stone-900">{agent.role}</div>
                <div className="text-[10px] text-stone-400 font-mono">{agent.name}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">ACTIVE</span>
            </div>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">{agent.desc}</p>
            <div className="space-y-2">
              <div>
                <div className="text-[9px] font-bold text-stone-400 uppercase mb-1">Capabilities</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((c) => (
                    <span key={c} className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-stone-400">Model: <span className="font-mono text-stone-600">{agent.model}</span></span>
                <span className="text-stone-400">Tasks: <span className="font-bold text-amber-600">{taskCounts[agent.name] || 0}</span></span>
              </div>
              <div>
                <div className="text-[9px] font-bold text-stone-400 uppercase mb-1">Triggers</div>
                <div className="flex flex-wrap gap-1">
                  {agent.triggers.map((t) => (
                    <span key={t} className="text-[9px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent categories reference */}
      <div>
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Agent Categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c.key} className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-${c.color}-100 text-${c.color}-700`}>
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Swarm protocol */}
      <div className="rounded-xl bg-stone-900 p-5 text-white">
        <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> Swarm Communication Protocol</h3>
        <div className="space-y-1.5 text-xs text-stone-300 font-mono">
          <div>directive  → Orchestrator assigns task to agent</div>
          <div>handoff    → Agent transfers task to another agent</div>
          <div>query      → Agent requests info from another agent</div>
          <div>report     → Agent reports completion/status to orchestrator</div>
          <div>alert      → Agent flags critical issue to orchestrator</div>
          <div>acknowledgment → Agent confirms receipt of directive</div>
        </div>
        <div className="mt-3 pt-3 border-t border-stone-700 text-xs text-stone-400">
          Autopilot Cycle: <span className="text-emerald-400 font-bold">Audit → Fix → Heal → Harden → Optimize</span> (every 30 min)
        </div>
      </div>
    </div>
  );
}