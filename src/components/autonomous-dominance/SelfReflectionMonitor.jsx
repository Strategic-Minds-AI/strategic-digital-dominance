import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Loader2, Activity, Heart, RefreshCw, Brain, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function SelfReflectionMonitor() {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['reflection-status'],
    queryFn: async () => (await base44.functions.invoke('selfReflectionEngine', { action: 'status' })).data,
    refetchInterval: 5000,
  });

  const { data: cycles } = useQuery({
    queryKey: ['reflection-cycles'],
    queryFn: async () => (await base44.entities.SelfReflectionCycle.list('-created_date', 20)),
    refetchInterval: 5000,
  });

  const runCycle = async (type) => {
    setRunning(type);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('selfReflectionEngine', { action: type });
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['reflection-status'] });
      queryClient.invalidateQueries({ queryKey: ['reflection-cycles'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(null);
    }
  };

  const s = status || {};
  const cycleList = cycles || [];

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-stone-900">{s.total_cycles || 0}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Total Cycles</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{s.avg_score || 0}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Avg Score</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-green-600">{Object.values(s.by_type || {}).reduce((a, b) => a + b, 0)}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Actions Taken</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-xs font-bold text-stone-700 truncate">{s.last_cycle?.type || 'none'}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Last Cycle</p>
        </div>
      </div>

      {/* Self-Reflection Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[
          { type: 'audit', label: 'Self-Audit', icon: Shield, desc: 'Scan for issues & gaps', color: 'text-blue-600' },
          { type: 'fix', label: 'Self-Fix', icon: RefreshCw, desc: 'Auto-fix identified issues', color: 'text-amber-600' },
          { type: 'heal', label: 'Self-Heal', icon: Heart, desc: 'Restore broken connections', color: 'text-rose-600' },
          { type: 'converge', label: 'Self-Converge', icon: Activity, desc: 'Optimize toward goals', color: 'text-green-600' },
          { type: 'learn', label: 'Self-Learn', icon: Brain, desc: 'Vision Cortex learning', color: 'text-violet-600' },
          { type: 'full_cycle', label: 'Full Cycle', icon: Sparkles, desc: 'Audit→Fix→Heal→Converge→Learn', color: 'text-amber-600' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.type}
              onClick={() => runCycle(action.type)}
              disabled={running === action.type}
              className="rounded-xl border-2 border-stone-200 bg-white p-3 text-left hover:border-amber-500 transition disabled:opacity-50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${action.color}`} />
                <p className="text-xs font-bold text-stone-900">{action.label}</p>
              </div>
              <p className="text-[10px] text-stone-500">{action.desc}</p>
              {running === action.type && <Loader2 className="h-3 w-3 animate-spin text-amber-500 mt-1" />}
            </button>
          );
        })}
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-bold text-green-700 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Cycle Complete</p>
          {result.score !== undefined && <p className="text-xs text-stone-600 mt-1">Score: {result.score || result.convergence_score || result.perfection_score || 0}</p>}
          {result.issues_found !== undefined && <p className="text-xs text-stone-600">Issues found: {result.issues_found}</p>}
          {result.next_actions && <p className="text-xs text-stone-600">Next actions: {result.next_actions.length} queued</p>}
          {result.insights && <p className="text-xs text-stone-600">Insights: {result.insights.length} generated</p>}
        </div>
      )}

      {/* Recent Cycles */}
      <div>
        <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-amber-600" /> Recent Reflection Cycles</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {cycleList.map((c) => (
            <div key={c.id} className="rounded-lg border border-stone-200 bg-white p-2 flex items-center gap-3">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                c.cycle_type === 'audit' ? 'bg-blue-100 text-blue-700' :
                c.cycle_type === 'fix' ? 'bg-amber-100 text-amber-700' :
                c.cycle_type === 'heal' ? 'bg-rose-100 text-rose-700' :
                c.cycle_type === 'converge' ? 'bg-green-100 text-green-700' :
                c.cycle_type === 'learn' ? 'bg-violet-100 text-violet-700' :
                'bg-stone-100 text-stone-600'
              }`}>{c.cycle_type}</span>
              <span className="text-xs text-stone-600 flex-1 truncate">{c.system_area}</span>
              {c.issues_found > 0 && <span className="text-[10px] text-amber-600 flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" /> {c.issues_found}</span>}
              <span className="text-xs font-bold text-stone-700">{c.score_after || 0}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                c.status === 'completed' ? 'bg-green-100 text-green-700' :
                c.status === 'converged' ? 'bg-amber-100 text-amber-700' :
                c.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-stone-100 text-stone-600'
              }`}>{c.status}</span>
            </div>
          ))}
          {cycleList.length === 0 && <p className="text-xs text-stone-400 text-center py-4">No reflection cycles yet. Run a cycle above.</p>}
        </div>
      </div>
    </div>
  );
}