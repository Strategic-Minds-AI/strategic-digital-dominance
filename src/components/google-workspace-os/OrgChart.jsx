import React from 'react';
import { Users, Loader2, Crown, Cpu, Calendar, Briefcase, Megaphone, Code, ClipboardList, ShieldCheck, Lock, UserCircle } from 'lucide-react';

const AGENT_ICONS = {
  'Eden Skye — CEO': Crown,
  'Marcus Chen — CTO': Cpu,
  'Aria Vale — Executive Assistant': Calendar,
  'Dylan Cross — VP Sales': Briefcase,
  'Sage Morrow — VP Marketing': Megaphone,
  'Kai Rivers — VP Engineering': Code,
  'Nova Quinn — VP Operations': ClipboardList,
  'Felix Hart — QA Validator': ShieldCheck,
  'Iris Vale — Security Officer': Lock,
};

const EXPECTED_AGENTS = Object.keys(AGENT_ICONS);

export default function OrgChart({ agents = [], loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      </div>
    );
  }

  const agentMap = {};
  agents.forEach(a => { agentMap[a.name] = a; });

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200">
        <div className="h-9 w-9 rounded-lg bg-stone-900 grid place-items-center">
          <Users className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-stone-900">Corporate Agent Team</h2>
          <p className="text-xs text-stone-500">{Object.keys(agentMap).length}/{EXPECTED_AGENTS.length} agents active</p>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* CEO at top */}
        <AgentNode name="Eden Skye — CEO" agent={agentMap['Eden Skye — CEO']} icon={Crown} color="#FFD700" />

        {/* C-Suite */}
        <div className="ml-6 space-y-2 border-l-2 border-stone-200 pl-4">
          <AgentNode name="Marcus Chen — CTO" agent={agentMap['Marcus Chen — CTO']} icon={Cpu} color="#3B82F6" />
          <AgentNode name="Dylan Cross — VP Sales" agent={agentMap['Dylan Cross — VP Sales']} icon={Briefcase} color="#F59E0B" />
          <AgentNode name="Sage Morrow — VP Marketing" agent={agentMap['Sage Morrow — VP Marketing']} icon={Megaphone} color="#EC4899" />
          <AgentNode name="Kai Rivers — VP Engineering" agent={agentMap['Kai Rivers — VP Engineering']} icon={Code} color="#8B5CF6" />
          <AgentNode name="Nova Quinn — VP Operations" agent={agentMap['Nova Quinn — VP Operations']} icon={ClipboardList} color="#06B6D4" />
        </div>

        {/* Support Staff */}
        <div className="ml-6 space-y-2 border-l-2 border-stone-300 pl-4">
          <AgentNode name="Aria Vale — Executive Assistant" agent={agentMap['Aria Vale — Executive Assistant']} icon={Calendar} color="#10B981" />
          <AgentNode name="Felix Hart — QA Validator" agent={agentMap['Felix Hart — QA Validator']} icon={ShieldCheck} color="#EF4444" />
          <AgentNode name="Iris Vale — Security Officer" agent={agentMap['Iris Vale — Security Officer']} icon={Lock} color="#64748B" />
        </div>
      </div>
    </div>
  );
}

function AgentNode({ name, agent, icon: Icon, color }) {
  const exists = !!agent;
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${exists ? 'border-stone-200 bg-white hover:border-amber-400' : 'border-dashed border-stone-300 bg-stone-50'}`}>
      <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: color + '20', border: `1px solid ${color}` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${exists ? 'text-stone-900' : 'text-stone-400'}`}>{name}</p>
        <p className="text-[10px] text-stone-500">
          {exists ? (agent.tone || 'active') : 'Not yet seeded — click "Seed Agent Team"'}
        </p>
      </div>
      {exists && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600 shrink-0">
          ACTIVE
        </span>
      )}
    </div>
  );
}