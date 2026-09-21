import React from 'react';
import {
  Code, Palette, Megaphone, Database, ShieldCheck,
  Github, Cloud, Server, Cpu, Clock, FileText, Brain,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';

export const SANDBOXES = [
  {
    id: 'alpha',
    name: 'Sandbox Alpha',
    subtitle: 'Code Generation & Testing',
    icon: Code,
    color: 'border-green-500 bg-green-50',
    agents: ['reverse-engineer', 'architect', 'coder-alpha'],
    tools: ['GitHub', 'Vercel', 'Free LLM (Groq)', 'Code Validator'],
    purpose: 'Generates pages, components, backend functions, and entities. Tests and validates all code before promotion.',
  },
  {
    id: 'beta',
    name: 'Sandbox Beta',
    subtitle: 'Design & Branding',
    icon: Palette,
    color: 'border-fuchsia-500 bg-fuchsia-50',
    agents: ['coder-beta', 'brander', 'ui-designer'],
    tools: ['Image Generator', 'Logo Generator', 'Vercel', 'Free LLM'],
    purpose: 'Creates brand identity, UI/UX designs, visual assets, and frontend components. Generates logos and brand kits.',
  },
  {
    id: 'gamma',
    name: 'Sandbox Gamma',
    subtitle: 'Marketing & Content',
    icon: Megaphone,
    color: 'border-emerald-500 bg-emerald-50',
    agents: ['coder-gamma', 'marketer', 'social-media', 'growth-hacker'],
    tools: ['Video Generator', 'Social Media API', 'Gmail', 'Free LLM'],
    purpose: 'Creates marketing campaigns, social content, video assets, and growth experiments. Manages outbound comms.',
  },
  {
    id: 'delta',
    name: 'Sandbox Delta',
    subtitle: 'Data & Analytics',
    icon: Database,
    color: 'border-sky-500 bg-sky-50',
    agents: ['data-engineer', 'documentor', 'simulator', 'ops-manager', 'shadow'],
    tools: ['Supabase', 'Google Sheets', 'Google Analytics', 'Drive', 'Free LLM'],
    purpose: 'Builds data pipelines, runs simulations, manages documentation, and monitors operations. Ingests external data.',
  },
  {
    id: 'omega',
    name: 'Sandbox Omega',
    subtitle: 'Security & Validation',
    icon: ShieldCheck,
    color: 'border-rose-500 bg-rose-50',
    agents: ['validator', 'truth-revealer', 'visionary', 'strategist', 'ceo', 'finisher', 'security-auditor'],
    tools: ['Security Scanner', 'Benchmark Runner', 'GitHub', 'Free LLM', 'Approval Gate'],
    purpose: 'Validates all outputs, runs security audits, makes executive decisions, and controls the approval gate before deployment.',
  },
];

const CONNECTION_ICONS = {
  GitHub: Github,
  Vercel: Cloud,
  Supabase: Server,
  'Free LLM': Cpu,
  'Free LLM (Groq)': Cpu,
  Crons: Clock,
  Logs: FileText,
  Memory: Brain,
};

export default function SandboxGrid({ onSandboxAction }) {
  return (
    <div>
      <h3 className="text-lg font-black text-stone-900 mb-4 flex items-center gap-2">
        <Server className="h-5 w-5 text-amber-500" />
        5 Autonomous Sandboxes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SANDBOXES.map((sb) => {
          const Icon = sb.icon;
          return (
            <div key={sb.id} className={`rounded-2xl border-2 ${sb.color} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white grid place-items-center border border-stone-200">
                  <Icon className="h-5 w-5 text-stone-700" />
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-sm">{sb.name}</h4>
                  <p className="text-[10px] text-stone-500 uppercase font-bold">{sb.subtitle}</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-snug">{sb.purpose}</p>

              <div className="mb-3">
                <p className="text-[9px] font-bold uppercase text-stone-400 mb-1">Agents ({sb.agents.length})</p>
                <div className="flex flex-wrap gap-1">
                  {sb.agents.map((a) => (
                    <span key={a} className="text-[9px] font-bold bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-600">
                      {a.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-[9px] font-bold uppercase text-stone-400 mb-1">Connected Tools</p>
                <div className="flex flex-wrap gap-1">
                  {sb.tools.map((t) => {
                    const TIcon = CONNECTION_ICONS[t] || CheckCircle2;
                    return (
                      <span key={t} className="flex items-center gap-1 text-[9px] font-bold bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-600">
                        <TIcon className="h-2.5 w-2.5" />
                        {t}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSandboxAction?.(sb.id, 'start')}
                  className="h-8 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold flex items-center justify-center gap-1 hover:bg-amber-400"
                >
                  <Cpu className="h-3 w-3" /> Start
                </button>
                <button
                  onClick={() => onSandboxAction?.(sb.id, 'logs')}
                  className="h-8 rounded-lg border border-stone-300 bg-white text-stone-700 text-xs font-bold flex items-center justify-center gap-1 hover:border-amber-400"
                >
                  <FileText className="h-3 w-3" /> Logs
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}