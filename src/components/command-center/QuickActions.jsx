import React from 'react';
import { Zap, Bot, Rocket, Shield, Radar, TrendingUp, Wand2, Crown, Brain, Network } from 'lucide-react';

const ACTIONS = [
  { id: 'vision', label: 'Vision Studio', desc: 'AI vision → strategies', icon: Wand2, path: '/admin/vision-studio', color: 'amber' },
  { id: 'agents', label: 'Build Agents', desc: 'Generate agent fleet', icon: Bot, path: '/admin/agent-builder', color: 'blue' },
  { id: 'convergence', label: 'Auto Convergence', desc: 'Validate & heal system', icon: Shield, path: '/admin/convergence', color: 'green' },
  { id: 'dominance', label: 'Dominance Engine', desc: 'Launch SEO campaigns', icon: Rocket, path: '/admin/national-launch', color: 'purple' },
  { id: 'competitors', label: 'Scan Competitors', desc: 'Research & intelligence', icon: Radar, path: '/admin/competitors', color: 'cyan' },
  { id: 'trends', label: 'Industry Trends', desc: 'BLS data forecasting', icon: TrendingUp, path: '/admin/crystal-ball', color: 'indigo' },
  { id: 'swarm', label: 'Swarm Command', desc: 'Orchestrate agent swarm', icon: Network, path: '/admin/swarm', color: 'rose' },
  { id: 'meta', label: 'Meta Agent', desc: 'Autonomous goal execution', icon: Brain, path: '/admin/meta-agent', color: 'orange' },
];

const COLOR_MAP = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100', iconText: 'text-amber-600', hover: 'hover:border-amber-400 hover:shadow-amber-200/50' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', iconText: 'text-blue-600', hover: 'hover:border-blue-400 hover:shadow-blue-200/50' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconBg: 'bg-green-100', iconText: 'text-green-600', hover: 'hover:border-green-400 hover:shadow-green-200/50' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-100', iconText: 'text-purple-600', hover: 'hover:border-purple-400 hover:shadow-purple-200/50' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', hover: 'hover:border-cyan-400 hover:shadow-cyan-200/50' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', hover: 'hover:border-indigo-400 hover:shadow-indigo-200/50' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100', iconText: 'text-rose-600', hover: 'hover:border-rose-400 hover:shadow-rose-200/50' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconBg: 'bg-orange-100', iconText: 'text-orange-600', hover: 'hover:border-orange-400 hover:shadow-orange-200/50' },
};

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">Top Tools</h3>
        </div>
        <span className="text-[10px] text-stone-400 font-medium ml-1">One-click access</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const c = COLOR_MAP[action.color];
          return (
            <a
              key={action.id}
              href={action.path}
              className={`flex flex-col gap-2 rounded-xl border-2 p-3 transition-all hover:scale-[1.03] hover:shadow-md ${c.bg} ${c.border} ${c.hover}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.iconBg} ${c.iconText}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${c.text}`}>{action.label}</p>
                <p className="text-[10px] text-stone-500 truncate">{action.desc}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}