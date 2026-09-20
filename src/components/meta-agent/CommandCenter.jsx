import React from "react";
import { Search, FileText, Package, Shield, Wrench, ArrowUp, CheckSquare, Lock, Globe, Bot, Workflow, CheckCircle2, Gauge, Loader2, Rocket } from "lucide-react";

const COMMANDS = [
  { cmd: "CONVERGE", icon: Rocket, desc: "Run FULL convergence pipeline to VERIFIED_100", highlight: true },
  { cmd: "DISCOVER", icon: Search, desc: "Search Arsenal & create DiscoveryJobs" },
  { cmd: "PROMPTS", icon: FileText, desc: "Find or generate prompt recommendations" },
  { cmd: "PACKAGE", icon: Package, desc: "Prepare package manifest" },
  { cmd: "AUDIT", icon: Shield, desc: "Generate audit WorkPackets" },
  { cmd: "HEAL", icon: Wrench, desc: "Generate repair WorkPackets" },
  { cmd: "UPGRADE", icon: ArrowUp, desc: "Compare with stronger Arsenal options" },
  { cmd: "COMPLETE", icon: CheckSquare, desc: "Identify unfinished work" },
  { cmd: "HARDEN", icon: Lock, desc: "Create security/reliability packets" },
  { cmd: "MIGRATE", icon: Globe, desc: "Generate migration architecture" },
  { cmd: "MCP", icon: Globe, desc: "Generate MCP capability spec" },
  { cmd: "AGENTS", icon: Bot, desc: "Generate agent topology" },
  { cmd: "WORKFLOWS", icon: Workflow, desc: "Generate deterministic workflow" },
  { cmd: "VALIDATE", icon: CheckCircle2, desc: "Generate validation plan" },
  { cmd: "SCORE", icon: Gauge, desc: "Calculate readiness from evidence" },
];

export default function CommandCenter({ sessionId, onCommand, running }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-stone-800 mb-3">Command Center</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {COMMANDS.map((c) => {
          const Icon = c.icon;
          const isHighlight = c.highlight;
          return (
            <button
              key={c.cmd}
              onClick={() => onCommand(c.cmd)}
              disabled={running || !sessionId}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed text-left group ${
                isHighlight
                  ? "border-amber-500 bg-amber-50 hover:bg-amber-100 md:col-span-2 lg:col-span-4"
                  : "border-stone-200 bg-stone-50 hover:border-amber-400 hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {running === c.cmd ? (
                  <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                ) : (
                  <Icon className={`h-4 w-4 ${isHighlight ? "text-amber-600" : "text-stone-500 group-hover:text-amber-600"}`} />
                )}
                <span className={`text-xs font-bold ${isHighlight ? "text-amber-700" : "text-stone-700 group-hover:text-amber-700"}`}>/{c.cmd}</span>
                {isHighlight && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded ml-auto">FULL PIPELINE</span>}
              </div>
              <p className={`text-xs leading-tight ${isHighlight ? "text-amber-700 font-medium" : "text-stone-400"}`}>{c.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}