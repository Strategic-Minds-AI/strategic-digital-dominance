import React from 'react';
import {
  Search, Compass, FileText, Lightbulb, FlaskConical,
  Code, Code2, FileCode2, ShieldCheck, Eye, Sparkles, Palette,
  Monitor, Megaphone, Share2, Ghost, Crown, Flag, Database,
  Lock, TrendingUp, Settings, Bot,
} from 'lucide-react';

export const AGENT_FLEET = [
  { id: 'reverse-engineer', name: 'Reverse Engineer', icon: Search, role: 'Analyzes existing systems and extracts patterns, architecture, and logic', sandbox: 'alpha', color: 'border-cyan-500 bg-cyan-50 text-cyan-700' },
  { id: 'architect', name: 'Architect', icon: Compass, role: 'Designs system architecture, data models, and integration contracts', sandbox: 'alpha', color: 'border-purple-500 bg-purple-50 text-purple-700' },
  { id: 'documentor', name: 'Documentor', icon: FileText, role: 'Creates comprehensive documentation for every system component', sandbox: 'delta', color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { id: 'strategist', name: 'Strategist', icon: Lightbulb, role: 'Develops business and technical strategy from vision input', sandbox: 'omega', color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { id: 'simulator', name: 'Simulator', icon: FlaskConical, role: 'Runs simulations and what-if analysis on system changes', sandbox: 'delta', color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
  { id: 'coder-alpha', name: 'Autonomous Coder Alpha', icon: Code, role: 'Primary code generator — builds pages, components, functions', sandbox: 'alpha', color: 'border-green-500 bg-green-50 text-green-700' },
  { id: 'coder-beta', name: 'Autonomous Coder Beta', icon: Code2, role: 'Secondary code generator — builds workflows, integrations', sandbox: 'beta', color: 'border-green-600 bg-green-50 text-green-700' },
  { id: 'coder-gamma', name: 'Autonomous Coder Gamma', icon: FileCode2, role: 'Tertiary code generator — builds entities, schemas, tests', sandbox: 'gamma', color: 'border-green-700 bg-green-50 text-green-700' },
  { id: 'validator', name: 'Validator', icon: ShieldCheck, role: 'Independent validation — tests every output before release', sandbox: 'omega', color: 'border-red-500 bg-red-50 text-red-700' },
  { id: 'truth-revealer', name: 'Truth Revealer', icon: Eye, role: 'Fact-checks claims, verifies evidence, prevents false-green', sandbox: 'omega', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { id: 'visionary', name: 'Visionary', icon: Sparkles, role: 'Generates vision and direction from market signals and user input', sandbox: 'omega', color: 'border-violet-500 bg-violet-50 text-violet-700' },
  { id: 'brander', name: 'Brander', icon: Palette, role: 'Creates brand identity, naming, visual language, and style guides', sandbox: 'beta', color: 'border-pink-500 bg-pink-50 text-pink-700' },
  { id: 'ui-designer', name: 'Frontend UI Designer', icon: Monitor, role: 'Designs and builds UI/UX — layouts, components, interactions', sandbox: 'beta', color: 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' },
  { id: 'marketer', name: 'Marketer', icon: Megaphone, role: 'Creates marketing strategy, copy, campaigns, and funnels', sandbox: 'gamma', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { id: 'social-media', name: 'Social Media Agent', icon: Share2, role: 'Manages social media — content, scheduling, engagement', sandbox: 'gamma', color: 'border-teal-500 bg-teal-50 text-teal-700' },
  { id: 'shadow', name: 'Shadow Agent', icon: Ghost, role: 'Stealth operations — competitive intel, market scanning, recon', sandbox: 'delta', color: 'border-stone-700 bg-stone-100 text-stone-700' },
  { id: 'ceo', name: 'CEO Agent', icon: Crown, role: 'Executive decisions — prioritization, resource allocation, approvals', sandbox: 'omega', color: 'border-yellow-600 bg-yellow-50 text-yellow-700' },
  { id: 'finisher', name: 'Finisher', icon: Flag, role: 'Completes and polishes — QA, edge cases, final delivery, deployment', sandbox: 'omega', color: 'border-lime-600 bg-lime-50 text-lime-700' },
  { id: 'data-engineer', name: 'Data Engineer', icon: Database, role: 'Builds data pipelines, ingestion, ETL, and storage', sandbox: 'delta', color: 'border-sky-500 bg-sky-50 text-sky-700' },
  { id: 'security-auditor', name: 'Security Auditor', icon: Lock, role: 'Security scans, vulnerability assessment, compliance checks', sandbox: 'omega', color: 'border-rose-500 bg-rose-50 text-rose-700' },
  { id: 'growth-hacker', name: 'Growth Hacker', icon: TrendingUp, role: 'Growth experiments, viral loops, conversion optimization', sandbox: 'gamma', color: 'border-orange-600 bg-orange-50 text-orange-700' },
  { id: 'ops-manager', name: 'Operations Manager', icon: Settings, role: 'Manages day-to-day operations, scheduling, monitoring', sandbox: 'delta', color: 'border-slate-500 bg-slate-50 text-slate-700' },
];

export default function AgentFleet({ activeAgent, onAgentClick }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-500" />
          Agent Fleet ({AGENT_FLEET.length} Agents)
        </h3>
        <p className="text-xs text-stone-500">Click any agent to see its sandbox, tools, and loop</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {AGENT_FLEET.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onAgentClick?.(agent)}
              className={`text-left rounded-xl border-2 p-3 transition hover:scale-[1.02] ${agent.color} ${isActive ? 'ring-2 ring-amber-500 ring-offset-1' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold leading-tight">{agent.name}</span>
              </div>
              <p className="text-[10px] opacity-75 leading-snug">{agent.role}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[9px] font-bold uppercase opacity-60">Sandbox:</span>
                <span className="text-[9px] font-bold uppercase">{agent.sandbox}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}