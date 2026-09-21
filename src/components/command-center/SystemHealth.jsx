import React from 'react';
import { Activity, Shield, CheckCircle2, AlertTriangle, XCircle, Cpu, Bot, Zap, TrendingUp } from 'lucide-react';

const HEALTH_COLORS = {
  EXCELLENT: 'text-green-600 bg-green-50 border-green-300',
  GOOD: 'text-blue-600 bg-blue-50 border-blue-300',
  DEGRADED: 'text-amber-600 bg-amber-50 border-amber-300',
  CRITICAL: 'text-red-600 bg-red-50 border-red-300',
};

export default function SystemHealth({ health, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">System Health</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!health) return null;

  const { overall, agents, operations, benchmarks, fleet } = health;
  const healthColor = HEALTH_COLORS[overall.health_status] || HEALTH_COLORS.DEGRADED;

  return (
    <div className="space-y-4">
      {/* Overall Health Banner */}
      <div className={`rounded-2xl border-2 p-5 ${healthColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">System Status</p>
              <p className="text-2xl font-black">{overall.health_status}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">{overall.score}<span className="text-lg opacity-50">/100</span></p>
            <p className="text-xs opacity-70">{overall.verified_systems}/{overall.total_systems} verified</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Bot} label="Active Agents" value={agents.active} sub={`${agents.total} total`} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Zap} label="Running Campaigns" value={operations.active_campaigns} sub={`${operations.new_leads} new leads`} color="text-amber-600 bg-amber-50" />
        <StatCard icon={TrendingUp} label="Benchmark Pass Rate" value={`${benchmarks.pass_rate}%`} sub={`${benchmarks.passing}/${benchmarks.total}`} color="text-green-600 bg-green-50" />
        <StatCard icon={Cpu} label="Active Cycles" value={operations.active_cycles} sub="convergence" color="text-purple-600 bg-purple-50" />
      </div>

      {/* Fleet Systems */}
      {fleet && fleet.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Fleet Systems</h4>
          <div className="space-y-2">
            {fleet.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.score >= 90 ? 'bg-green-500' : s.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-stone-700 truncate">{s.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-stone-400">{s.status}</span>
                  <span className="text-sm font-bold text-stone-800">{s.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-black text-stone-900">{value}</p>
      <p className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[10px] text-stone-400">{sub}</p>}
    </div>
  );
}