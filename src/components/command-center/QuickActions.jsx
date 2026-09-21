import React from 'react';
import { Zap, Bot, Rocket, Shield, Radar, TrendingUp, Wand2, RefreshCw, Loader2 } from 'lucide-react';

const ACTIONS = [
  { id: 'vision', label: 'Vision Studio', desc: 'AI-assisted vision → strategies', icon: Wand2, path: '/admin/vision-studio', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'agents', label: 'Build Agents', desc: 'Generate agent fleet', icon: Bot, path: '/admin/agent-builder', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'convergence', label: 'Auto Convergence', desc: 'Validate & heal system', icon: Shield, path: '/admin/convergence', color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'dominance', label: 'Dominance Engine', desc: 'Launch SEO campaigns', icon: Rocket, path: '/admin/national-launch', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'competitors', label: 'Scan Competitors', desc: 'Research & intelligence', icon: Radar, path: '/admin/competitors', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 'trends', label: 'Industry Trends', desc: 'BLS data forecasting', icon: TrendingUp, path: '/admin/crystal-ball', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.id}
              href={action.path}
              className={`flex items-center gap-2.5 rounded-xl border p-3 transition hover:scale-[1.02] ${action.color}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{action.label}</p>
                <p className="text-[10px] opacity-60 truncate">{action.desc}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}