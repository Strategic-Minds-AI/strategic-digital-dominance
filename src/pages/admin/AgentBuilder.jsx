import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Loader2, CheckCircle2,
  Eye, Rocket, RefreshCw, AlertCircle, Bot, Network, Shield,
  Compass, Database, Code, Copy, Users, Globe, Key, Cpu,
  Brain, Search, TrendingUp, MessageSquare, PhoneCall, DollarSign,
  Palette, FileText, Wrench, Calendar, BarChart3, Train, Share2,
  MessageCircle, GraduationCap, EyeOff, Lock,
} from 'lucide-react';

const ICON_MAP = {
  Network, Compass, Eye, Calendar, Cpu, Code, Palette, Database,
  Search, TrendingUp, Zap: Sparkles, Share2, MessageSquare, MessageCircle, PhoneCall,
  BarChart3, DollarSign, Wrench, FileText, GraduationCap, Copy, Users, Globe,
  EyeOff, Shield, Key, Brain,
};

const CATEGORY_COLORS = {
  leadership: 'border-purple-500 bg-purple-50 text-purple-700',
  sales: 'border-blue-500 bg-blue-50 text-blue-700',
  marketing: 'border-green-500 bg-green-50 text-green-700',
  operations: 'border-amber-500 bg-amber-50 text-amber-700',
  technical: 'border-stone-700 bg-stone-100 text-stone-700',
  communications: 'border-indigo-500 bg-indigo-50 text-indigo-700',
  finance: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  research: 'border-cyan-500 bg-cyan-50 text-cyan-700',
};

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-amber-100 text-amber-700 border-amber-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  low: 'bg-stone-100 text-stone-600 border-stone-300',
};

const SYNC_ICONS = {
  chatgpt: Brain,
  google_drive: Database,
  supabase: Database,
  vercel: Rocket,
  github: Code,
  railway: Train,
};

export default function AgentBuilder() {
  const [vision, setVision] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapResult, setBootstrapResult] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState(null);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: archetypesData } = useQuery({
    queryKey: ['agent-archetypes'],
    queryFn: () => base44.functions.invoke('agentBuilderEngine', { action: 'archetypes' }),
    staleTime: 60000,
  });

  const archetypes = archetypesData?.data?.archetypes || [];

  const handleAnalyze = useCallback(async () => {
    if (!vision.trim()) return;
    setAnalyzing(true);
    setError('');
    setStrategy(null);
    setGenResult(null);
    setBootstrapResult(null);
    setLaunchResult(null);
    try {
      const res = await base44.functions.invoke('agentBuilderEngine', {
        action: 'analyze',
        vision: vision.trim(),
      });
      setStrategy(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setAnalyzing(false);
  }, [vision]);

  const handleGenerate = useCallback(async () => {
    if (!strategy?.recommended_agents?.length) return;
    setGenerating(true);
    setError('');
    setGenResult(null);
    try {
      const res = await base44.functions.invoke('agentBuilderEngine', {
        action: 'generate',
        vision: vision.trim(),
        recommended_agents: strategy.recommended_agents,
      });
      setGenResult(res.data || res);
      queryClient.invalidateQueries({ queryKey: ['agent-personas'] });
    } catch (e) {
      setError(e.message);
    }
    setGenerating(false);
  }, [strategy, vision, queryClient]);

  const handleBootstrap = useCallback(async () => {
    setBootstrapping(true);
    setError('');
    try {
      const res = await base44.functions.invoke('agentBuilderEngine', {
        action: 'bootstrap',
        vision: vision.trim(),
        sync_targets: strategy?.sync_targets || ['google_drive', 'supabase', 'vercel', 'github'],
      });
      setBootstrapResult(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setBootstrapping(false);
  }, [vision, strategy]);

  const handleLaunch = useCallback(async () => {
    setLaunching(true);
    setError('');
    try {
      const res = await base44.functions.invoke('agentBuilderEngine', { action: 'launch' });
      setLaunchResult(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setLaunching(false);
  }, []);

  const reset = () => {
    setVision('');
    setStrategy(null);
    setGenResult(null);
    setBootstrapResult(null);
    setLaunchResult(null);
    setError('');
  };

  // Step status helpers
  const step1Done = !!strategy;
  const step2Done = !!genResult;
  const step3Done = !!bootstrapResult;
  const step4Done = !!launchResult;

  const stepStatus = (done, running) => {
    if (done) return 'complete';
    if (running) return 'running';
    return 'pending';
  };

  const StepBadge = ({ num, status }) => {
    const styles = {
      complete: 'bg-green-500 text-white border-green-500',
      running: 'bg-amber-500 text-white border-amber-500',
      pending: 'bg-white text-stone-300 border-stone-200',
    };
    return (
      <div className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-black text-lg transition ${styles[status]}`}>
        {status === 'complete' ? <CheckCircle2 className="h-6 w-6" /> :
         status === 'running' ? <Loader2 className="h-5 w-5 animate-spin" /> : num}
      </div>
    );
  };

  const StepCard = ({ num, status, icon: Icon, title, subtitle, children, locked }) => (
    <div className="flex gap-4">
      {/* Left rail: number + connector line */}
      <div className="flex flex-col items-center">
        <StepBadge num={num} status={status} />
        <div className="w-0.5 flex-1 bg-stone-200 mt-2 mb-2" />
      </div>
      {/* Right content */}
      <div className={`flex-1 pb-8 ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className={`h-5 w-5 ${status === 'complete' ? 'text-green-500' : status === 'running' ? 'text-amber-500' : 'text-stone-400'}`} />}
          <h2 className="text-lg font-black text-stone-900">{title}</h2>
          {status === 'pending' && locked && <Lock className="h-3.5 w-3.5 text-stone-300" />}
        </div>
        {subtitle && <p className="text-sm text-stone-500 mb-4">{subtitle}</p>}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-1">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
          <Bot className="h-7 w-7 text-amber-500" />
          Agent Builder Pipeline
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Vision → Strategy → Agents → Bootstrap → Launch. Complete the full pipeline top to bottom.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── STEP 1: VISION ── */}
      <StepCard
        num={1}
        status={stepStatus(step1Done, analyzing)}
        icon={Eye}
        title="Define Your Vision"
        subtitle="Describe the autonomous system or AI team you want to build."
      >
        <div className="p-6">
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="e.g. Build X1 AI Hub — a platform where users connect their ChatGPT, Claude, and Gemini accounts to access AI tools, workflows, a prediction system, no-code crypto creator, and autonomous agent swarms..."
            className="w-full h-36 rounded-xl border border-stone-200 p-4 text-sm text-stone-800 focus:border-amber-500 outline-none resize-none"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-stone-400">{vision.length}/2000</span>
            <button
              onClick={handleAnalyze}
              disabled={!vision.trim() || analyzing}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 transition disabled:opacity-50 shadow-md"
            >
              {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {analyzing ? 'Analyzing...' : 'Analyze Vision'}
            </button>
          </div>
        </div>
      </StepCard>

      {/* ── STEP 2: STRATEGY ── */}
      <StepCard
        num={2}
        status={stepStatus(step2Done, generating)}
        icon={Compass}
        title="Strategy & Architecture"
        subtitle="AI analysis of your vision — recommended agents, capabilities, and sync targets."
        locked={!step1Done}
      >
        {step1Done && strategy ? (
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase mb-1">Executive Summary</p>
              <p className="text-sm text-stone-700">{strategy.executive_summary}</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs font-bold text-stone-500 uppercase mb-1">Recommended Architecture</p>
              <p className="text-sm text-stone-700">{strategy.architecture}</p>
            </div>
            {strategy.key_capabilities?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Key Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {strategy.key_capabilities.map((c, i) => (
                    <span key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-700 font-medium">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {strategy.sync_targets?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Sync Targets</p>
                <div className="flex flex-wrap gap-2">
                  {strategy.sync_targets.map((s) => {
                    const Icon = SYNC_ICONS[s] || Database;
                    return (
                      <span key={s} className="flex items-center gap-1.5 rounded-lg bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs text-stone-700 font-medium">
                        <Icon className="h-3.5 w-3.5" />
                        {s.replace(/_/g, ' ')}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Recommended agents preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-stone-500 uppercase">
                  Recommended Agents ({strategy.recommended_agents?.length || 0})
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition disabled:opacity-50 shadow-md"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? `Generating ${strategy.recommended_agents?.length || 0} Agents...` : 'Generate All Agents'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategy.recommended_agents?.map((agent, i) => {
                  const archetype = archetypes.find(a => a.id === agent.archetype_id) || {};
                  const Icon = ICON_MAP[archetype.icon] || Bot;
                  return (
                    <div key={i} className={`rounded-xl border-2 p-3 ${CATEGORY_COLORS[archetype.category] || CATEGORY_COLORS.technical}`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <p className="font-bold text-sm">{archetype.name || agent.archetype_id}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[agent.priority] || PRIORITY_COLORS.medium}`}>
                          {agent.priority}
                        </span>
                      </div>
                      <p className="text-xs opacity-80">{agent.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-stone-400">
            {analyzing ? 'Analyzing your vision...' : 'Complete Step 1 to unlock strategy analysis.'}
          </div>
        )}
      </StepCard>

      {/* ── STEP 3: AGENTS GENERATED ── */}
      <StepCard
        num={3}
        status={stepStatus(step3Done, bootstrapping)}
        icon={Bot}
        title="Agent Fleet & Bootstrap"
        subtitle="Generated agents are bootstrapped into a project manifest with folder structure."
        locked={!step2Done}
      >
        {step2Done && genResult ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {genResult.agents_created || 0} Agents Generated
              </h3>
              <button
                onClick={handleBootstrap}
                disabled={bootstrapping}
                className="flex items-center gap-2 rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-stone-900 transition disabled:opacity-50"
              >
                {bootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                {bootstrapping ? 'Bootstrapping...' : 'Bootstrap Project'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {genResult.agents?.map((agent, i) => {
                const archetype = archetypes.find(a => a.id === agent.archetype_id) || {};
                const Icon = ICON_MAP[archetype.icon] || Bot;
                return (
                  <div key={i} className={`rounded-xl border-2 p-3 text-center ${CATEGORY_COLORS[archetype.category] || CATEGORY_COLORS.technical}`}>
                    <Icon className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-xs font-bold">{agent.name}</p>
                    <p className="text-[10px] opacity-60">{agent.short_name}</p>
                    {agent.skipped && <p className="text-[9px] mt-1 text-stone-500">existed</p>}
                  </div>
                );
              })}
            </div>
            {genResult.errors?.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-bold text-amber-700 mb-1">Partial Errors:</p>
                {genResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-600">{e}</p>
                ))}
              </div>
            )}
            {bootstrapResult && (
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                <p className="text-xs font-bold text-stone-500 uppercase mb-3">Project Manifest</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-2xl font-black text-stone-800">{bootstrapResult.manifest?.agent_count || 0}</p>
                    <p className="text-xs text-stone-400 uppercase">Agents</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-2xl font-black text-stone-800">{bootstrapResult.manifest?.structure?.total_files || 0}</p>
                    <p className="text-xs text-stone-400 uppercase">Files</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-2xl font-black text-stone-800">{bootstrapResult.manifest?.sync_targets?.length || 0}</p>
                    <p className="text-xs text-stone-400 uppercase">Sync Targets</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-2xl font-black text-green-600">{bootstrapResult.manifest?.validation?.all_agents_created ? '✓' : '✗'}</p>
                    <p className="text-xs text-stone-400 uppercase">Validated</p>
                  </div>
                </div>
                <div className="font-mono text-xs text-stone-600 space-y-0.5 max-h-32 overflow-y-auto">
                  {bootstrapResult.manifest?.structure?.folders?.map((f, i) => (
                    <div key={i}>{f}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-stone-400">
            {generating ? 'Generating agents...' : 'Complete Step 2 to generate your agent fleet.'}
          </div>
        )}
      </StepCard>

      {/* ── STEP 4: LAUNCH ── */}
      <StepCard
        num={4}
        status={stepStatus(step4Done, launching)}
        icon={Rocket}
        title="Validate & Launch"
        subtitle="Final validation and deployment of your autonomous agent fleet."
        locked={!step3Done}
      >
        {step3Done ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-600">Run final validation and launch your fleet.</p>
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-600 transition disabled:opacity-50 shadow-md"
              >
                {launching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                {launching ? 'Validating...' : 'Validate & Launch'}
              </button>
            </div>
            {launchResult && (
              <div className={`rounded-xl border-2 p-5 ${launchResult.ready ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {launchResult.ready ? (
                    <Rocket className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">
                      {launchResult.ready ? 'Agent Fleet is LIVE' : 'Validation Issues'}
                    </h3>
                    <p className="text-sm text-stone-600">{launchResult.message}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-xl font-black text-stone-800">{launchResult.validation?.total_agents}</p>
                    <p className="text-xs text-stone-400 uppercase">Total Agents</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-xl font-black text-green-600">{launchResult.validation?.agents_with_prompts}</p>
                    <p className="text-xs text-stone-400 uppercase">With Prompts</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-xl font-black text-blue-600">{launchResult.validation?.agents_with_actions}</p>
                    <p className="text-xs text-stone-400 uppercase">With Actions</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                    <p className="text-xl font-black text-purple-600">{launchResult.validation?.agents_with_memory}</p>
                    <p className="text-xs text-stone-400 uppercase">Memory</p>
                  </div>
                </div>
              </div>
            )}
            {step4Done && (
              <div className="flex justify-center pt-2">
                <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 hover:border-amber-500 hover:text-amber-600 transition">
                  <RefreshCw className="h-4 w-4" /> Start New Vision
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-stone-400">
            {launching ? 'Validating fleet...' : 'Complete Step 3 to unlock launch.'}
          </div>
        )}
      </StepCard>

      {/* Archetype Catalog (reference, always visible at bottom) */}
      {archetypes.length > 0 && (
        <div className="mt-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
            Available Archetypes ({archetypes.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {archetypes.map((a) => {
              const Icon = ICON_MAP[a.icon] || Bot;
              return (
                <div key={a.id} className={`rounded-lg border p-2 text-center ${CATEGORY_COLORS[a.category] || CATEGORY_COLORS.technical}`}>
                  <Icon className="h-4 w-4 mx-auto mb-1" />
                  <p className="text-[10px] font-bold leading-tight">{a.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}