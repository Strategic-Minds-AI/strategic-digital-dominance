import React from 'react';
import { Bot, Rocket, Shield, User, Activity as ActivityIcon, Clock } from 'lucide-react';

const TYPE_ICONS = {
  agent_action: Bot,
  campaign: Rocket,
  convergence: Shield,
  lead: User,
};

const TYPE_COLORS = {
  agent_action: 'text-blue-600 bg-blue-50',
  campaign: 'text-amber-600 bg-amber-50',
  convergence: 'text-purple-600 bg-purple-50',
  lead: 'text-green-600 bg-green-50',
};

const STATUS_COLORS = {
  completed: 'text-green-600',
  active: 'text-blue-600',
  running: 'text-amber-600',
  failed: 'text-red-600',
  'NEW ESTIMATE': 'text-green-600',
  pending: 'text-stone-400',
};

export default function AgentActivity({ activity, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="h-5 w-5 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Live Activity</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="h-5 w-5 text-stone-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Live Activity</h3>
        </div>
        <p className="text-sm text-stone-400 text-center py-8">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Live Activity</h3>
        </div>
        <span className="text-xs text-stone-400">{activity.length} events</span>
      </div>
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {activity.map((item, i) => {
          const Icon = TYPE_ICONS[item.type] || ActivityIcon;
          const color = TYPE_COLORS[item.type] || 'text-stone-600 bg-stone-50';
          const statusColor = STATUS_COLORS[item.status] || 'text-stone-400';
          return (
            <div key={i} className="flex items-start gap-2.5 py-2 border-b border-stone-50 last:border-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-stone-700 truncate">
                    {item.agent && <span className="text-amber-600">[{item.agent}] </span>}
                    {item.title}
                  </p>
                  {item.status && (
                    <span className={`text-[10px] font-bold uppercase shrink-0 ${statusColor}`}>{item.status}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wide">{item.type.replace(/_/g, ' ')}</span>
                  {item.phase && <span className="text-[10px] text-stone-400">· {item.phase}</span>}
                  {item.score !== undefined && <span className="text-[10px] text-stone-400">· score: {item.score}</span>}
                  {item.progress !== undefined && item.progress > 0 && <span className="text-[10px] text-stone-400">· {item.progress}%</span>}
                </div>
                {item.last_result && (
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">{item.last_result}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}