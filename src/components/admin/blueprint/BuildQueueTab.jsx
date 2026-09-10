import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ListChecks, Plus, Rocket, Zap, Clock, CheckCircle2, AlertCircle, Bot, ArrowRight } from "lucide-react";

const SWARM_BUILD_TASKS = [
  { title: "Wire Tool Hub toggles to backend functions", desc: "Each toggle in Tool Hub currently persists to DB but doesn't execute. Wire each toggle to its corresponding backend function call.", priority: "high", agent: "swarm_orchestrator", type: "site_health", effort: "Medium" },
  { title: "Fix GSC pinging (403 error)", desc: "Google Search Console ping currently returns 403. Investigate auth scope or API endpoint change.", priority: "high", agent: "seo_manager", type: "seo", effort: "Low" },
  { title: "Activate Xtreme Comms tenant", desc: "Xtreme Comms API returns 'Tenant not found' — tenant activation required.", priority: "high", agent: "comms_manager", type: "integration", effort: "Low" },
  { title: "Add pricing for quartz, glitter, dye_stain color categories", desc: "These color categories lack pricing definitions in AppSettings.systems.", priority: "medium", agent: "swarm_orchestrator", type: "content", effort: "Low" },
  { title: "Fix funnel_started analytics double-fire", desc: "funnel_started event fires twice due to component lifecycle. Add debounce or guard.", priority: "low", agent: "swarm_orchestrator", type: "site_health", effort: "Low" },
  { title: "Implement SPA pre-rendering for SEO", desc: "Client-side rendering without pre-rendering hinders SEO. Add SSG/SSR for key pages.", priority: "medium", agent: "seo_manager", type: "seo", effort: "High" },
  { title: "Deep-integrate visualizer pricing into contractor bid flow", desc: "Contractor BidGenerator should use the same pricing logic as the public estimator.", priority: "medium", agent: "lead_orchestrator", type: "lead_pipeline", effort: "Medium" },
  { title: "Build Supabase data mirror sync", desc: "Create a backend function that syncs Base44 entities → Supabase tables for migration prep.", priority: "medium", agent: "swarm_orchestrator", type: "site_health", effort: "Medium" },
  { title: "Generate Vercel Next.js project scaffold", desc: "Create the migration target project structure with App Router, matching current routes.", priority: "high", agent: "site_factory_manager", type: "site_health", effort: "High" },
  { title: "Write Supabase schema SQL for all 24 entities", desc: "Generate Postgres CREATE TABLE statements + RLS policies from Base44 entity schemas.", priority: "high", agent: "swarm_orchestrator", type: "site_health", effort: "High" },
];

const PRIORITY_STYLE = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function BuildQueueTab() {
  const [existingTasks, setExistingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.SwarmTask.list("-created_date", 50);
        setExistingTasks(list || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const createTask = async (task) => {
    setCreating(task.title);
    try {
      await base44.entities.SwarmTask.create({
        task_type: task.type,
        title: task.title,
        description: task.desc,
        priority: task.priority,
        assigned_agent: task.agent,
        created_by_agent: "system_blueprint",
        status: "pending",
      });
      const list = await base44.entities.SwarmTask.list("-created_date", 50);
      setExistingTasks(list || []);
    } catch {}
    setCreating(null);
  };

  const existingTitles = new Set(existingTasks.map((t) => t.title));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2"><ListChecks className="h-4 w-4 text-amber-500" /> Autonomous Swarm Build Queue</h2>
          <p className="text-xs text-stone-500 mt-0.5">Tasks the AGI swarm can autonomously claim and execute. Click to dispatch.</p>
        </div>
      </div>

      {/* Existing tasks */}
      <div>
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Active Swarm Tasks ({existingTasks.length})</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /></div>
        ) : existingTasks.length === 0 ? (
          <div className="text-center text-xs text-stone-400 py-6 rounded-lg border border-stone-200">No active tasks. Dispatch from the blueprint below.</div>
        ) : (
          <div className="space-y-1.5">
            {existingTasks.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "completed" ? "bg-emerald-500" : t.status === "in_progress" ? "bg-amber-500" : t.status === "failed" ? "bg-red-500" : "bg-stone-300"}`} />
                <span className="text-sm font-bold text-stone-900 flex-1 truncate">{t.title}</span>
                <span className="text-[10px] text-stone-400 font-mono shrink-0">{t.assigned_agent}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.low}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blueprint tasks */}
      <div>
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">Blueprint Build Tasks ({SWARM_BUILD_TASKS.length})</h3>
        <div className="space-y-2">
          {SWARM_BUILD_TASKS.map((task) => {
            const alreadyCreated = existingTitles.has(task.title);
            return (
              <div key={task.title} className="rounded-xl border border-stone-200 p-4 hover:border-amber-400 transition">
                <div className="flex items-start gap-3 mb-2">
                  <Bot className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-stone-900">{task.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
                    </div>
                    <p className="text-xs text-stone-500">{task.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-stone-400">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {task.agent}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.effort}</span>
                      <span className="font-mono">{task.type}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => createTask(task)}
                  disabled={alreadyCreated || creating === task.title}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 text-white text-xs font-bold py-2 hover:bg-amber-500 hover:text-stone-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {alreadyCreated ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Dispatched to swarm</>
                  ) : creating === task.title ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching...</>
                  ) : (
                    <><Plus className="h-3.5 w-3.5" /> Dispatch to swarm</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-stone-900 p-5 text-white">
        <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2"><Rocket className="h-4 w-4" /> Swarm Autopilot</h3>
        <p className="text-xs text-stone-300 mb-3">The swarm runs a 30-minute cycle: Audit → Fix → Heal → Harden → Optimize. Dispatched tasks above are picked up by the assigned agent on the next cycle.</p>
        <a href="/admin/swarm" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold px-4 py-2 hover:brightness-110">
          Open Swarm Command <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}