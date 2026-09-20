import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Activity, Target, GitBranch, AlertTriangle, CheckCircle2, XCircle, Clock, Zap, RefreshCw, Play, FlaskConical, TrendingUp, Layers } from 'lucide-react';

const PHASE_ICONS = {
  DISCOVER: GitBranch,
  MODEL: Layers,
  AUDIT: Activity,
  SCORE: Target,
  DIAGNOSE: AlertTriangle,
  PLAN: GitBranch,
  REPAIR: Zap,
  TEST: CheckCircle2,
  VALIDATE: Shield,
  HARDEN: Shield,
  OPTIMIZE: TrendingUp,
  CHAOS_TEST: FlaskConical,
  RESCORE: Target,
  PRESERVE: CheckCircle2,
  BLOCKED: XCircle,
  COMPLETE: CheckCircle2,
};

const STATUS_COLORS = {
  pass: 'text-green-600 bg-green-50 border-green-200',
  fail: 'text-red-600 bg-red-50 border-red-200',
  unknown: 'text-amber-600 bg-amber-50 border-amber-200',
  blocked: 'text-purple-600 bg-purple-50 border-purple-200',
  stale: 'text-stone-500 bg-stone-100 border-stone-200',
};

const GATE_COLORS = {
  HARD: 'border-l-red-500',
  SOFT: 'border-l-stone-300',
};

export default function ConvergenceEngine() {
  const queryClient = useQueryClient();
  const [selectedSystem, setSelectedSystem] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [cycleResult, setCycleResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Load systems
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['convergence-status'],
    queryFn: async () => {
      const res = await base44.functions.invoke('convergenceEngine', { action: 'status' });
      return res.data || res;
    },
  });

  // Auto-select first system
  useEffect(() => {
    if (!selectedSystem && statusData?.systems?.length > 0) {
      setSelectedSystem(statusData.systems[0].system_id);
    }
  }, [statusData, selectedSystem]);

  // Load scorecard for selected system
  const { data: scorecardData, isLoading: scorecardLoading, refetch: refetchScorecard } = useQuery({
    queryKey: ['convergence-scorecard', selectedSystem],
    queryFn: async () => {
      if (!selectedSystem) return null;
      const res = await base44.functions.invoke('convergenceEngine', { action: 'scorecard', system_id: selectedSystem });
      return res.data || res;
    },
    enabled: !!selectedSystem,
  });

  // Load progress ledger
  const { data: progressData } = useQuery({
    queryKey: ['convergence-progress', selectedSystem],
    queryFn: async () => {
      if (!selectedSystem) return null;
      const res = await base44.functions.invoke('convergenceEngine', { action: 'progress', system_id: selectedSystem });
      return res.data || res;
    },
    enabled: !!selectedSystem && activeTab === 'progress',
  });

  // Run convergence cycle
  const runCycle = useMutation({
    mutationFn: async () => {
      setActionLoading('cycle');
      const res = await base44.functions.invoke('convergenceEngine', { action: 'cycle', system_id: selectedSystem });
      return res.data || res;
    },
    onSuccess: (data) => {
      setCycleResult(data);
      queryClient.invalidateQueries({ queryKey: ['convergence-status'] });
      queryClient.invalidateQueries({ queryKey: ['convergence-scorecard', selectedSystem] });
      queryClient.invalidateQueries({ queryKey: ['convergence-progress', selectedSystem] });
    },
    onSettled: () => setActionLoading(null),
  });

  // Run individual phase
  const runPhase = useCallback(async (phase) => {
    setActionLoading(phase);
    try {
      const res = await base44.functions.invoke('convergenceEngine', { action: phase, system_id: selectedSystem });
      const data = res.data || res;
      if (phase === 'rescore' || phase === 'score') {
        refetchScorecard();
      }
      queryClient.invalidateQueries({ queryKey: ['convergence-status'] });
      return data;
    } finally {
      setActionLoading(null);
    }
  }, [selectedSystem, refetchScorecard, queryClient]);

  // Create Broken Twin
  const createBrokenTwin = useMutation({
    mutationFn: async () => {
      setActionLoading('broken_twin');
      const res = await base44.functions.invoke('convergenceEngine', { action: 'broken_twin', system_id: selectedSystem });
      return res.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convergence-status'] });
    },
    onSettled: () => setActionLoading(null),
  });

  const portfolio = statusData?.portfolio || {};
  const systems = statusData?.systems || [];
  const scorecard = scorecardData?.scorecard || {};
  const categories = scorecard?.categories || [];
  const ledger = progressData?.ledger || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-7 w-7 text-amber-500" />
          <h1 className="text-2xl font-bold">Autonomous Convergence Engine</h1>
        </div>
        <p className="text-stone-400 text-sm">
          DISCOVER → MODEL → AUDIT → SCORE → DIAGNOSE → PLAN → REPAIR → TEST → VALIDATE → HARDEN → OPTIMIZE → CHAOS → RESCORE → PRESERVE
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Systems" value={portfolio.total_systems || 0} icon={Layers} />
        <StatCard label="Verified" value={portfolio.verified_systems || 0} icon={CheckCircle2} color="text-green-600" />
        <StatCard label="Avg Score" value={`${portfolio.avg_score || 0}`} icon={Target} />
        <StatCard label="Active Cycles" value={portfolio.active_cycles || 0} icon={Activity} />
        <StatCard label="Twin Experiments" value={portfolio.broken_twin_experiments || 0} icon={FlaskConical} />
        <StatCard label="Constitution" value={`${portfolio.constitution_categories || 56} cats`} icon={Shield} />
      </div>

      {/* System Selector + Actions */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-semibold text-stone-700 whitespace-nowrap">Target System:</label>
            <select
              value={selectedSystem}
              onChange={(e) => { setSelectedSystem(e.target.value); setCycleResult(null); }}
              className="flex-1 max-w-md px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white"
            >
              {systems.map((s) => (
                <option key={s.system_id} value={s.system_id}>
                  {s.name} (score: {s.score}, P0: {s.p0_count})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => runCycle.mutate()}
              disabled={!selectedSystem || runCycle.isPending || actionLoading !== null}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
            >
              {runCycle.isPending || actionLoading === 'cycle' ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Running...</>
              ) : (
                <><Play className="h-4 w-4" /> Run Full Cycle</>
              )}
            </button>
            <button
              onClick={() => createBrokenTwin.mutate()}
              disabled={!selectedSystem || createBrokenTwin.isPending || actionLoading !== null}
              className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-semibold hover:bg-stone-900 disabled:opacity-50 flex items-center gap-2"
            >
              <FlaskConical className="h-4 w-4" /> Broken Twin
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {['overview', 'scorecard', 'progress', 'cycle'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Phase Actions */}
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-700 mb-3 uppercase tracking-wide">Convergence Phases</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {['discover', 'audit', 'score', 'diagnose', 'plan', 'repair', 'validate', 'harden', 'optimize', 'chaos', 'rescore', 'preserve'].map((phase) => {
                const Icon = PHASE_ICONS[phase.toUpperCase()] || Activity;
                return (
                  <button
                    key={phase}
                    onClick={() => runPhase(phase)}
                    disabled={!selectedSystem || actionLoading !== null}
                    className="flex flex-col items-center gap-1 p-3 border border-stone-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 disabled:opacity-50 transition-all"
                  >
                    <Icon className={`h-5 w-5 ${actionLoading === phase ? 'animate-pulse text-amber-500' : 'text-stone-600'}`} />
                    <span className="text-xs font-semibold text-stone-700 uppercase">{phase}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Info */}
          {scorecardData && (
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900">{scorecardData.system_name}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  scorecard.verified_100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {scorecard.verified_100 ? 'VERIFIED_100' : `Score: ${scorecard.score || 0}`}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <MiniStat label="Distance to 100" value={scorecard.distance_to_100 || 0} />
                <MiniStat label="P0" value={scorecard.p0_count || 0} color={scorecard.p0_count > 0 ? 'text-red-600' : 'text-green-600'} />
                <MiniStat label="P1" value={scorecard.p1_count || 0} color={scorecard.p1_count > 0 ? 'text-amber-600' : 'text-green-600'} />
                <MiniStat label="Unknown" value={scorecard.unknown_count || 0} color="text-stone-600" />
                <MiniStat label="Stale" value={scorecard.stale_count || 0} color="text-stone-500" />
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                <p className="text-sm text-stone-700">
                  <span className="font-semibold">Next Action: </span>
                  {scorecardData.next_action || 'Run a convergence cycle to begin'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'scorecard' && (
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          {scorecardLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-stone-400" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wide">
                  Benchmark Constitution ({categories.length} categories)
                </h3>
                <div className="text-sm text-stone-500">
                  {categories.filter(c => c.status === 'pass').length} pass · {' '}
                  {categories.filter(c => c.status === 'fail').length} fail · {' '}
                  {categories.filter(c => c.status === 'unknown').length} unknown
                </div>
              </div>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border-l-4 ${GATE_COLORS[cat.gate] || 'border-l-stone-300'} bg-stone-50`}
                  >
                    <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${STATUS_COLORS[cat.status] || 'bg-stone-100'}`}>
                      {cat.status.toUpperCase()}
                    </div>
                    <span className="text-xs font-mono text-stone-500 w-20">{cat.id}</span>
                    <span className="text-sm text-stone-800 flex-1">{cat.name}</span>
                    <span className={`text-xs font-bold ${cat.gate === 'HARD' ? 'text-red-500' : 'text-stone-400'}`}>
                      {cat.gate}
                    </span>
                    <span className="text-xs text-stone-400">w:{cat.weight}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-4">Progress Ledger</h3>
          {ledger.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-8">No progress entries yet. Run a convergence cycle.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-600">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Before</th>
                    <th className="text-left py-2 px-2">Failure</th>
                    <th className="text-left py-2 px-2">Action</th>
                    <th className="text-left py-2 px-2">Level</th>
                    <th className="text-left py-2 px-2">Validation</th>
                    <th className="text-left py-2 px-2">After</th>
                    <th className="text-left py-2 px-2">Duration</th>
                    <th className="text-left py-2 px-2">Stagnant</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry, i) => (
                    <tr key={entry.entry_id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-2 px-2 text-stone-500">{entry.cycle_number}</td>
                      <td className="py-2 px-2 font-mono">{entry.score_before}</td>
                      <td className="py-2 px-2 text-stone-700 max-w-xs truncate" title={entry.failure}>{entry.failure}</td>
                      <td className="py-2 px-2 text-stone-700 max-w-xs truncate" title={entry.action_taken}>{entry.action_taken}</td>
                      <td className="py-2 px-2"><span className="text-xs font-mono bg-stone-100 px-2 py-0.5 rounded">{entry.repair_level}</span></td>
                      <td className="py-2 px-2">
                        <span className={`text-xs font-bold ${
                          entry.validation_result === 'PASS' ? 'text-green-600' :
                          entry.validation_result === 'FAIL' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {entry.validation_result}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-mono font-bold">{entry.score_after}</td>
                      <td className="py-2 px-2 text-stone-500">{(entry.duration_ms / 1000).toFixed(1)}s</td>
                      <td className="py-2 px-2">
                        {entry.stagnation_detected ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cycle' && (
        <div className="space-y-4">
          {cycleResult ? (
            <CycleResultDisplay result={cycleResult} />
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <Play className="h-12 w-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">Run a full convergence cycle to see results here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = 'text-stone-900' }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-stone-400" />
        <span className="text-xs text-stone-500 font-medium">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, color = 'text-stone-900' }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5">
      <div className="text-xs text-stone-500 mb-0.5">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

function CycleResultDisplay({ result }) {
  const phases = result.phases || [];
  return (
    <>
      {/* Summary */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-stone-900">Cycle Result</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            result.verified_100 ? 'bg-green-100 text-green-700' :
            result.stagnation_detected ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {result.verified_100 ? 'VERIFIED_100' : result.stagnation_detected ? 'STAGNANT' : result.final_phase}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <MiniStat label="Baseline" value={result.baseline_score} />
          <MiniStat label="Final Score" value={result.final_score} color={result.final_score >= result.baseline_score ? 'text-green-600' : 'text-red-600'} />
          <MiniStat label="Distance to 100" value={result.distance_to_100} />
          <MiniStat label="Duration" value={`${(result.total_duration_ms / 1000).toFixed(1)}s`} />
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
          <p className="text-sm text-stone-700">
            <span className="font-semibold">Next Action: </span>{result.next_action}
          </p>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wide mb-3">Phase Timeline</h3>
        <div className="space-y-1">
          {phases.map((phase, i) => {
            const Icon = PHASE_ICONS[phase.phase] || Activity;
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
                  {i + 1}
                </div>
                <Icon className="h-4 w-4 text-stone-500" />
                <span className="text-sm font-semibold text-stone-800 w-32">{phase.phase}</span>
                <span className="text-xs text-stone-500">{(phase.duration_ms / 1000).toFixed(2)}s</span>
                {phase.score !== undefined && (
                  <span className="text-xs font-mono text-stone-600">score: {phase.score}</span>
                )}
                {phase.gaps !== undefined && (
                  <span className="text-xs font-mono text-stone-600">gaps: {phase.gaps}</span>
                )}
                {phase.diagnoses !== undefined && (
                  <span className="text-xs font-mono text-stone-600">dx: {phase.diagnoses}</span>
                )}
                {phase.plans !== undefined && (
                  <span className="text-xs font-mono text-stone-600">plans: {phase.plans}</span>
                )}
                {phase.verified !== undefined && (
                  <span className={`text-xs font-bold ${phase.verified ? 'text-green-600' : 'text-amber-600'}`}>
                    {phase.verified ? '✓' : '○'}
                  </span>
                )}
                <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}