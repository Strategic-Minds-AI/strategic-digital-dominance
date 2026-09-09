import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot, Zap, Activity, CheckCircle2, AlertCircle, Clock, RefreshCw, Play,
  Brain, Users, TrendingUp, Globe, Share2, Star, Factory, MessageSquare,
  ChevronRight, Loader2, Radio
} from "lucide-react";

const AGENT_META = [
  { name: "swarm_orchestrator", label: "Swarm Orchestrator", icon: Brain, color: "purple", desc: "Master coordinator — monitors all agents, dispatches tasks, runs health checks" },
  { name: "lead_orchestrator", label: "Lead Orchestrator", icon: Users, color: "blue", desc: "Lead pipeline — scoring, follow-ups, CRM sync, consultation booking" },
  { name: "seo_manager", label: "SEO Manager", icon: TrendingUp, color: "green", desc: "70+ location sites — page generation, indexing, ranking optimization" },
  { name: "social_manager", label: "Social Manager", icon: Share2, color: "pink", desc: "Facebook engine — 3x daily posts, scheduling, engagement tracking" },
  { name: "reputation_manager", label: "Reputation Manager", icon: Star, color: "amber", desc: "Reviews, referrals, maintenance plans, negative feedback escalation" },
  { name: "site_factory_manager", label: "Site Factory", icon: Factory, color: "stone", desc: "Mass-produces & deploys city-specific websites across 70+ locations" },
  { name: "comms_manager", label: "Comms Manager", icon: MessageSquare, color: "red", desc: "SMS, WhatsApp, AI voice, email — multi-channel outreach & escalation" },
];

const COLOR_MAP = {
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  stone: "bg-stone-100 text-stone-700 border-stone-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_BADGE = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  normal: "bg-stone-200 text-stone-700",
  low: "bg-stone-100 text-stone-500",
};

const STATUS_BADGE = {
  pending: "bg-stone-100 text-stone-600",
  claimed: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  superseded: "bg-stone-100 text-stone-400",
};

export default function SwarmCommand() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["swarm-status"],
    queryFn: () => base44.functions.invoke("swarmOrchestrator", { action: "getStatus" }).then((r) => r.data),
    refetchInterval: 15000,
  });

  const { data: tasks } = useQuery({
    queryKey: ["swarm-tasks"],
    queryFn: () => base44.entities.SwarmTask.list("-created_date", 50),
    refetchInterval: 10000,
  });

  const { data: messages } = useQuery({
    queryKey: ["swarm-messages"],
    queryFn: () => base44.entities.SwarmMessage.list("-created_date", 30),
    refetchInterval: 15000,
  });

  const runAction = async (action, label, payload = {}) => {
    setRunning(label);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("swarmOrchestrator", { action, ...payload });
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["swarm-status"] });
      queryClient.invalidateQueries({ queryKey: ["swarm-tasks"] });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setRunning(null);
    }
  };

  const spawnTask = async () => {
    const title = prompt("Task title:");
    if (!title) return;
    const agent = prompt("Assign to agent (lead_orchestrator, seo_manager, social_manager, reputation_manager, site_factory_manager, comms_manager, swarm_orchestrator):", "lead_orchestrator");
    if (!agent) return;
    const desc = prompt("Task description:", "Review and follow up with new leads from today.");
    await runAction("spawnTask", "spawn", { title, assigned_agent: agent, description: desc, task_type: "cross_domain", priority: "normal" });
  };

  const stats = status?.stats || {};
  const byAgent = status?.byAgent || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="xa-electric-hover rounded-2xl bg-stone-950 p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0">
          <Brain className="h-9 w-9 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-purple-400 uppercase">AGI Swarm System</div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Swarm Command Center</h1>
          <p className="text-sm text-stone-400 mt-1">7 autonomous agents · self-organizing task board · 30-min health check cycle</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-stone-400">
            <Radio className="h-4 w-4 text-green-500 animate-pulse" /> LIVE
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => runAction("runCycle", "cycle")}
          disabled={running !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-700"
        >
          {running === "cycle" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Swarm Cycle
        </button>
        <button
          onClick={() => runAction("healthCheck", "health")}
          disabled={running !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-amber-700"
        >
          {running === "health" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
          Health Check
        </button>
        <button
          onClick={spawnTask}
          disabled={running !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold disabled:opacity-50 hover:bg-stone-800"
        >
          <Zap className="h-4 w-4" /> Spawn Task
        </button>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["swarm-status"] })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Error / Result */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
          <pre className="text-xs text-green-700 overflow-x-auto flex-1">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* Swarm stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <Clock className="h-5 w-5 text-stone-400 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.pending || 0}</div>
          <div className="text-xs text-stone-500">Pending Tasks</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <Loader2 className="h-5 w-5 text-amber-500 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.in_progress || 0}</div>
          <div className="text-xs text-stone-500">In Progress</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.completed_recent || 0}</div>
          <div className="text-xs text-stone-500">Completed (recent)</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <AlertCircle className="h-5 w-5 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.failed_recent || 0}</div>
          <div className="text-xs text-stone-500">Failed (recent)</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <MessageSquare className="h-5 w-5 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-stone-900">{stats.unread_messages || 0}</div>
          <div className="text-xs text-stone-500">Unread Messages</div>
        </div>
      </div>

      {/* Agent grid */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-500" /> Swarm Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AGENT_META.map((agent) => {
            const Icon = agent.icon;
            const aStats = byAgent[agent.name] || { pending: 0, completed: 0, failed: 0 };
            return (
              <div key={agent.name} className={`rounded-xl border p-4 ${COLOR_MAP[agent.color]}`}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{agent.label}</div>
                    <div className="text-xs opacity-80 mt-0.5 line-clamp-2">{agent.desc}</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 text-xs">
                  <span className="font-semibold">{aStats.pending} pending</span>
                  <span className="opacity-70">·</span>
                  <span className="font-semibold">{aStats.completed} done</span>
                  {aStats.failed > 0 && (
                    <>
                      <span className="opacity-70">·</span>
                      <span className="font-semibold text-red-600">{aStats.failed} failed</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task board + Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task board */}
        <div className="lg:col-span-2 rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-500" /> Task Board
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(tasks || []).map((t) => (
              <div key={t.id} className="rounded-lg border border-stone-200 p-3 flex items-start gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${PRIORITY_BADGE[t.priority] || PRIORITY_BADGE.normal}`}>
                  {t.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-900 truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                    <span className={`px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[t.status] || STATUS_BADGE.pending}`}>{t.status}</span>
                    <span>→ {t.assigned_agent}</span>
                    <span>· by {t.created_by_agent}</span>
                  </div>
                  {t.result_summary && <p className="text-xs text-green-600 mt-1 truncate">{t.result_summary}</p>}
                  {t.error && <p className="text-xs text-red-600 mt-1 truncate">{t.error}</p>}
                </div>
                {t.status === "pending" && (
                  <button
                    onClick={() => runAction("dispatch", "dispatch-" + t.id, { task_id: t.id })}
                    disabled={running !== null}
                    className="text-xs font-bold text-purple-600 hover:text-purple-800 shrink-0"
                  >
                    Dispatch
                  </button>
                )}
              </div>
            ))}
            {(!tasks || tasks.length === 0) && (
              <p className="text-sm text-stone-400 text-center py-8">No tasks yet. Run a Health Check to scan for work.</p>
            )}
          </div>
        </div>

        {/* Inter-agent messages */}
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" /> Agent Messages
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(messages || []).map((m) => (
              <div key={m.id} className="rounded-lg border border-stone-100 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-stone-700">{m.from_agent}</span>
                  <ChevronRight className="h-3 w-3 text-stone-400" />
                  <span className="font-bold text-purple-600">{m.to_agent}</span>
                  <span className="ml-auto text-[10px] text-stone-400">{new Date(m.created_date).toLocaleTimeString()}</span>
                </div>
                <p className="text-stone-600">{m.content}</p>
              </div>
            ))}
            {(!messages || messages.length === 0) && (
              <p className="text-sm text-stone-400 text-center py-8">No inter-agent messages yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}