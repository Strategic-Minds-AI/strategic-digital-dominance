import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, Loader2, TrendingUp, DollarSign, Users, Rocket, Plus, Activity } from 'lucide-react';

const DEFAULT_GOALS = [
  { goal_type: 'revenue', title: 'Generate $1M Revenue', target_value: 1000000, unit: 'USD', timeframe: 'yearly', priority: 'critical' },
  { goal_type: 'followers', title: '10K Social Media Followers/Month', target_value: 10000, unit: 'followers', timeframe: 'monthly', priority: 'high' },
  { goal_type: 'leads', title: '100 Leads/Month for Xtreme Polishing', target_value: 100, unit: 'leads', timeframe: 'monthly', priority: 'critical' },
];

export default function DominanceGoalTracker() {
  const [creating, setCreating] = useState(false);
  const [newGoal, setNewGoal] = useState({ goal_type: 'custom', title: '', target_value: 100, unit: '', timeframe: 'monthly', priority: 'high' });
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals } = useQuery({
    queryKey: ['dominance-goals'],
    queryFn: async () => (await base44.entities.DominanceGoal.list('-created_date', 50)),
    refetchInterval: 5000,
  });

  const handleCreateDefault = async () => {
    setCreating(true);
    setError(null);
    try {
      for (const g of DEFAULT_GOALS) {
        const goal_id = `DG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await base44.entities.DominanceGoal.create({
          owner_id: '',
          goal_id,
          ...g,
          current_value: 0,
          progress_percentage: 0,
          status: 'active',
          created_at: new Date().toISOString(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['dominance-goals'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCustom = async () => {
    if (!newGoal.title) return;
    setCreating(true);
    setError(null);
    try {
      const goal_id = `DG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await base44.entities.DominanceGoal.create({
        owner_id: '',
        goal_id,
        ...newGoal,
        current_value: 0,
        progress_percentage: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      });
      setNewGoal({ goal_type: 'custom', title: '', target_value: 100, unit: '', timeframe: 'monthly', priority: 'high' });
      queryClient.invalidateQueries({ queryKey: ['dominance-goals'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const goalList = goals || [];
  const hasDefaults = goalList.some(g => DEFAULT_GOALS.some(dg => dg.title === g.title));

  return (
    <div className="space-y-4">
      {/* Default Goals Button */}
      {!hasDefaults && (
        <button onClick={handleCreateDefault} disabled={creating} className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          Initialize Core Dominance Goals ($1M Revenue, 10K Followers, 100 Leads)
        </button>
      )}

      {/* Active Goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {goalList.map((g) => {
          const progress = g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0;
          const icon = g.goal_type === 'revenue' ? DollarSign : g.goal_type === 'followers' ? Users : g.goal_type === 'leads' ? Target : Activity;
          const Icon = icon;
          return (
            <div key={g.id} className={`rounded-xl border-2 p-4 ${progress >= 100 ? 'border-green-300 bg-green-50' : progress > 0 ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-amber-600" />
                <p className="text-sm font-bold text-stone-900 flex-1">{g.title}</p>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-black text-stone-900">{g.current_value || 0}</span>
                <span className="text-sm text-stone-500">/ {g.target_value} {g.unit}</span>
              </div>
              <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-amber-600">{progress}%</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  g.status === 'achieved' ? 'bg-green-100 text-green-700' :
                  g.status === 'on_track' ? 'bg-blue-100 text-blue-700' :
                  g.status === 'behind' ? 'bg-red-100 text-red-700' :
                  'bg-stone-100 text-stone-600'
                }`}>{g.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Goal Creator */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-amber-600" /> Add Custom Goal</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="Goal title" className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm col-span-2" />
          <input type="number" value={newGoal.target_value} onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })} placeholder="Target" className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm" />
          <input value={newGoal.unit} onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })} placeholder="Unit (USD, leads)" className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm" />
          <select value={newGoal.goal_type} onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })} className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm">
            <option value="revenue">Revenue</option>
            <option value="followers">Followers</option>
            <option value="leads">Leads</option>
            <option value="campaigns">Campaigns</option>
            <option value="traffic">Traffic</option>
            <option value="custom">Custom</option>
          </select>
          <select value={newGoal.timeframe} onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value })} className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select value={newGoal.priority} onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })} className="rounded-lg border border-stone-200 px-2 py-1.5 text-sm">
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button onClick={handleCreateCustom} disabled={creating || !newGoal.title} className="mt-2 flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-50">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Goal
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}
    </div>
  );
}