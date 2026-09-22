import React, { useState } from 'react';
import { Crown, Zap, Upload, Radar, Wand2, Target, Shield, Monitor, Rocket, ChevronDown, ChevronUp, Activity, Database } from 'lucide-react';
import MassIngestionSystem from '@/components/autonomous-dominance/MassIngestionSystem';
import TopSitesBenchmark from '@/components/autonomous-dominance/TopSitesBenchmark';
import RebrandGenerator from '@/components/autonomous-dominance/RebrandGenerator';
import DominanceGoalTracker from '@/components/autonomous-dominance/DominanceGoalTracker';
import SelfReflectionMonitor from '@/components/autonomous-dominance/SelfReflectionMonitor';
import ComputerUseAgent from '@/components/autonomous-dominance/ComputerUseAgent';
import AutonomousDominanceSwarm from '@/components/autonomous-dominance/AutonomousDominanceSwarm';

const SECTIONS = [
  { id: 'swarm', title: '24/7 Autonomous Dominance Swarm', desc: 'Launch the 24/7 swarm — operates autonomously for 30 days with self-audit, self-heal, self-converge', icon: Rocket, accent: 'amber', component: AutonomousDominanceSwarm },
  { id: 'ingestion', title: 'Mass Website Ingestion System', desc: 'Upload 30+ websites → 3-stage pipeline (Clean → Parse → Organize) → auto-categorized gallery', icon: Upload, accent: 'blue', component: MassIngestionSystem },
  { id: 'benchmark', title: 'Top Sites Benchmark Scanner', desc: 'Cloud browser scans top 20 templates, graphics, creators, marketing companies — ingests all intelligence', icon: Radar, accent: 'emerald', component: TopSitesBenchmark },
  { id: 'rebrand', title: 'Rebrand Generator + Enhancer', desc: 'Pull from template gallery → rebrand for any industry → enhance & modernize using benchmark intelligence', icon: Wand2, accent: 'violet', component: RebrandGenerator },
  { id: 'goals', title: 'Dominance Goal Tracker', desc: '$1M revenue, 10K followers/month, 100 leads/month — input goals with high expectations', icon: Target, accent: 'amber', component: DominanceGoalTracker },
  { id: 'reflection', title: 'Self-Reflection: Audit → Fix → Heal → Converge → Learn', desc: 'Persistent 24/7 self-audit, self-fix, self-heal, self-converge, self-learn for system perfection', icon: Shield, accent: 'rose', component: SelfReflectionMonitor },
  { id: 'computer', title: 'Computer Use Agent', desc: 'AI agent that can operate your systems using computer use technology', icon: Monitor, accent: 'violet', component: ComputerUseAgent },
];

const accentMap = {
  amber: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-500' },
  blue: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-500' },
  emerald: { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-500' },
  rose: { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-600', icon: 'bg-rose-500' },
  violet: { border: 'border-violet-300', bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-500' },
};

export default function AutonomousDominance() {
  const [expanded, setExpanded] = useState({ swarm: true });

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const expandAll = () => {
    const all = {};
    SECTIONS.forEach((s) => { all[s.id] = true; });
    setExpanded(all);
  };
  const collapseAll = () => setExpanded({});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-violet-950 to-amber-950 p-6 text-white border border-amber-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 grid place-items-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Autonomous Digital Dominance System</h1>
              <p className="text-stone-400 text-sm">World's best fully autonomous end-to-end website digital dominance + social media dominance swarm — 24/7 operation</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={expandAll} className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-bold text-stone-300 hover:border-amber-500 hover:text-amber-400 transition">
              Expand All
            </button>
            <button onClick={collapseAll} className="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-bold text-stone-300 hover:border-amber-500 hover:text-amber-400 transition">
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const a = accentMap[section.accent];
          const Icon = section.icon;
          const isExpanded = expanded[section.id];
          const Component = section.component;
          return (
            <div key={section.id} className={`rounded-2xl border-2 ${isExpanded ? a.border : 'border-stone-200'} bg-white overflow-hidden transition-all`}>
              <button
                onClick={() => toggle(section.id)}
                className={`w-full flex items-center gap-4 p-4 ${isExpanded ? a.bg : 'bg-white'} transition-all hover:bg-stone-50`}
              >
                <div className={`h-11 w-11 rounded-xl ${a.icon} grid place-items-center shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-base font-bold text-stone-900">{section.title}</h3>
                  <p className="text-xs text-stone-500">{section.desc}</p>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-stone-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-stone-400 shrink-0" />}
              </button>
              {isExpanded && (
                <div className="p-5 border-t border-stone-100">
                  <Component />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}