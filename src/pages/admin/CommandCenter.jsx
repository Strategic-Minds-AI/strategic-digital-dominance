import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw, Loader2, AlertCircle, Crown, Activity, Zap, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import SystemHealth from '@/components/command-center/SystemHealth';
import AgentActivity from '@/components/command-center/AgentActivity';
import ConnectionStatus from '@/components/command-center/ConnectionStatus';
import QuickActions from '@/components/command-center/QuickActions';

export default function CommandCenter() {
  const [health, setHealth] = useState(null);
  const [activity, setActivity] = useState([]);
  const [healing, setHealing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [healingRunning, setHealingRunning] = useState(false);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('systemOrchestrator', { action: 'full_status' });
      const data = res.data || res;
      setHealth(data.health);
      setActivity(data.activity || []);
      setHealing(data.healing);
      setError('');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleHeal = useCallback(async () => {
    setHealingRunning(true);
    try {
      const res = await base44.functions.invoke('systemOrchestrator', { action: 'heal' });
      setHealing(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setHealingRunning(false);
  }, []);

  const connected = [
    { integration_type: 'googlecalendar' },
    { integration_type: 'gmail' },
    { integration_type: 'googledrive' },
    { integration_type: 'googlesheets' },
    { integration_type: 'googledocs' },
    { integration_type: 'googletasks' },
    { integration_type: 'google_search_console' },
    { integration_type: 'google_analytics' },
    { integration_type: 'facebook_pages' },
    { integration_type: 'hubspot' },
    { integration_type: 'supabase' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Crown className="h-7 w-7 text-amber-500" />
            Command Center
          </h1>
          <p className="text-sm text-stone-500 mt-1">Unified system control — health, agents, activity, and connections at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleHeal}
            disabled={healingRunning}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50"
          >
            {healingRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            {healingRunning ? 'Healing...' : 'Auto-Heal'}
          </button>
          <button
            onClick={loadAll}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-600 hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Auto-Heal Results */}
      {healing && healing.issues_found > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-800">Auto-Heal Diagnosis — {healing.issues_found} issue(s) found</h3>
          </div>
          <div className="space-y-2">
            {healing.repairs.map((r, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-white p-2 border border-amber-200">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  r.severity === 'high' ? 'bg-red-100 text-red-700' :
                  r.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  {r.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800">{r.issue}</p>
                  <p className="text-xs text-stone-500">{r.action}</p>
                </div>
                <span className="text-[10px] text-stone-400 shrink-0">→ {r.auto_fix}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-2 font-medium">{healing.recommendation}</p>
        </div>
      )}

      {healing && healing.issues_found === 0 && (
        <div className="rounded-2xl border border-green-300 bg-green-50 p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm font-bold text-green-800">System is healthy — no issues detected.</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Health + Quick Actions (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <SystemHealth health={health} loading={loading} />
          <QuickActions />
        </div>

        {/* Right: Activity + Connections (1 col) */}
        <div className="space-y-5">
          <AgentActivity activity={activity} loading={loading} />
          <ConnectionStatus connected={connected} />
        </div>
      </div>

      {/* MCP Info Banner */}
      <div className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-900 to-stone-800 p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">MCP Server Active</h3>
              <p className="text-xs text-stone-400">GPT, Claude, Gemini, and any AI client can operate this system via MCP.</p>
            </div>
          </div>
          <a
            href="/connect"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-stone-900 hover:bg-amber-400 transition"
          >
            Connect AI Client →
          </a>
        </div>
      </div>
    </div>
  );
}