import React from 'react';

export default function PipelineStage({ number, title, subtitle, icon: Icon, accent = 'amber', children, collapsed, onToggle }) {
  const accentMap = {
    amber: 'from-amber-500 to-amber-600 text-amber-600 border-amber-300',
    violet: 'from-violet-500 to-violet-600 text-violet-600 border-violet-300',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 border-emerald-300',
    blue: 'from-blue-500 to-blue-600 text-blue-600 border-blue-300',
    rose: 'from-rose-500 to-rose-600 text-rose-600 border-rose-300',
    cyan: 'from-cyan-500 to-cyan-600 text-cyan-600 border-cyan-300',
  };
  const c = accentMap[accent] || accentMap.amber;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-stone-50 transition text-left"
      >
        <div className={`shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${c.split(' ')[0]} ${c.split(' ')[1]} grid place-items-center text-white font-black text-sm`}>
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            {Icon && <Icon className={`h-4 w-4 ${c.split(' ')[2]}`} />}
            {title}
          </h3>
          {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
        </div>
        <span className={`text-xs font-bold ${c.split(' ')[2]}`}>
          {collapsed ? '▸ Expand' : '▾ Collapse'}
        </span>
      </button>
      {!collapsed && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}