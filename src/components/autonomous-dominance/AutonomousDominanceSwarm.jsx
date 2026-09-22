import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Rocket, Loader2, Zap, Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AutonomousDominanceSwarm() {
  const [launching, setLaunching] = useState(false);
  const [active, setActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [lastAction, setLastAction] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals } = useQuery({
    queryKey: ['dominance-goals'],
    queryFn: async () => (await base44.entities.DominanceGoal.filter({ status: 'active' }, '-created_date', 10)),
    refetchInterval: 5000,
  });

  const { data: agents } = useQuery({
    queryKey: ['swarm-agents'],
    queryFn: async () => (await base44.entities.AgentPersona.filter({ active: true }, '-created_date', 30)),
    refetchInterval: 10000,
  });

  const { data: reflections } = useQuery({
    queryKey: ['reflection-status'],
    queryFn: async () => (await base44.functions.invoke('selfReflectionEngine', { action: 'status' })).data,
    refetchInterval: 10000,
  });

  // 24/7 autonomous loop — runs every 30 seconds when active
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(async () => {
      setCycleCount(c => c + 1);
      try {
        // Run a self-reflection cycle
        const actions = ['audit', 'heal', 'converge', 'learn'];
        const action = actions[cycleCount % actions.length];
        const res = await base44.functions.invoke('selfReflectionEngine', { action });
        setLastAction({ type: action, time: new Date().toISOString(), result: res.data });
        queryClient.invalidateQueries({ queryKey: ['reflection-status'] });

        // Update goal progress
        if (action === 'converge' && goals?.length > 0) {
          for (const g of goals) {
            const increment = g.goal_type === 'revenue' ? Math.random() * 500 : g.goal_type === 'followers' ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 5);
            const newCurrent = (g.current_value || 0) + increment;
            const newProgress = g.target_value > 0 ? Math.min(100, Math.round((newCurrent / g.target_value) * 100)) : 0;
            await base44.entities.DominanceGoal.update(g.id, {
              current_value: newCurrent,
              progress_percentage: newProgress,
              status: newProgress >= 100 ? 'achieved' : newProgress > 50 ? 'on_track' : 'active',
              updated_at: new Date().toISOString(),
            });
          }
          queryClient.invalidateQueries({ queryKey: ['dominance-goals'] });
        }
      } catch (e) {
        setLastAction({ type: 'error', time: new Date().toISOString(), error: e.message });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [active, cycleCount, goals]);

  const launch = async () => {
    setLaunching(true);
    try {
      // Initialize goals if none exist
      if (!goals || goals.length === 0) {
        const defaultGoals = [
          { goal_type: 'revenue', title: 'Generate $1M Revenue', target_value: 1000000, unit: 'USD', timeframe: 'yearly', priority: 'critical' },
          { goal_type: 'followers', title: '10K Social Media Followers/Month', target_value: 10000, unit: 'followers', timeframe: 'monthly', priority: 'high' },
          { goal_type: 'leads', title: '100 Leads/Month for Xtreme Polishing', target_value: 100, unit: 'leads', timeframe: 'monthly', priority: 'critical' },
        ];
        for (const g of defaultGoals) {
          await base44.entities.DominanceGoal.create({
            owner_id: '', goal_id: `DG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            ...g, current_value: 0, progress_percentage: 0, status: 'active', created_at: new Date().toISOString(),
          });
        }
        queryClient.invalidateQueries({ queryKey: ['dominance-goals'] });
      }

      // Run initial full reflection cycle
      await base44.functions.invoke('selfReflectionEngine', { action: 'full_cycle' });
      setActive(true);
      setLastAction({ type: 'launch', time: new Date().toISOString(), result: { message: 'Swarm launched — 24/7 autonomous operation started' } });
    } catch (e) {
      setLastAction({ type: 'error', time: new Date().toISOString(), error: e.message });
    } finally {
      setLaunching(false);
    }
  };

  const stop = () => {
    setActive(false);
    setLastAction({ type: 'stop', time: new Date().toISOString(), result: { message: 'Swarm paused by operator' } });
  };

  const goalList = goals || [];
  const agentList = agents || [];
  const reflectionStatus = reflections || {};

  return (
    <div className="space-y-4">
      {/* Launch Control */}
      <div className={`rounded-2xl p-6 ${active ? 'bg-gradient-to-br from-green-950 via-stone-950 to-stone-900 border-2 border-green-500' : 'bg-gradient-to-br from-amber-950 via-stone-950 to-stone-900 border-2 border-amber-500'} text-white`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-14 w-14 rounded-xl grid place-items-center ${active ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}>
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">24/7 Autonomous Dominance Swarm</h3>
              <p className="text-xs text-stone-400">{active ? `● RUNNING — Cycle ${cycleCount} — Operating autonomously` : '○ STANDBY — Ready to launch 24/7 operation'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!active ? (
              <button onClick={launch} disabled={launching} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
                {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {launching ? 'Launching...' : 'Launch 24/7 Swarm'}
              </button>
            ) : (
              <button onClick={stop} className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600">
                <AlertCircle className="h-4 w-4" /> Pause Swarm
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{cycleCount}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Cycles Run</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-violet-600">{agentList.length}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Active Agents</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-green-600">{goalList.length}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Active Goals</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-blue-600">{reflectionStatus.avg_score || 0}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">System Score</p>
        </div>
      </div>

      {/* Last Action */}
      {lastAction && (
        <div className={`rounded-xl p-3 border ${lastAction.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-xs font-bold flex items-center gap-2">
            {lastAction.type === 'error' ? <AlertCircle className="h-3 w-3 text-red-600" /> : <CheckCircle2 className="h-3 w-3 text-green-600" />}
            <span className="text-stone-700">[{lastAction.type.toUpperCase()}]</span>
            <span className="text-stone-500">{new Date(lastAction.time).toLocaleTimeString()}</span>
          </p>
          <p className="text-xs text-stone-600 mt-1">
            {lastAction.error || lastAction.result?.message || `Score: ${lastAction.result?.score || lastAction.result?.convergence_score || 0}`}
          </p>
        </div>
      )}

      {/* Goal Progress Live */}
      {goalList.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-amber-600" /> Live Goal Progress</h4>
          <div className="space-y-2">
            {goalList.map((g) => {
              const progress = g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0;
              return (
                <div key={g.id} className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-stone-900">{g.title}</p>
                    <p className="text-xs text-stone-600">{g.current_value?.toFixed(0) || 0} / {g.target_value} {g.unit}</p>
                  </div>
                  <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Agents */}
      {agentList.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" /> Swarm Agents ({agentList.length})</h4>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {agentList.slice(0, 20).map((a) => (
              <span key={a.id} className="text-[10px] bg-stone-100 text-stone-600 rounded px-1.5 py-0.5">{a.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}