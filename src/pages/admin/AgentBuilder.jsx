import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Crown, Zap, Loader2, CheckCircle2, XCircle, ArrowRight,
  Eye, Rocket, RefreshCw, AlertCircle, Bot, Network, Shield,
  Brain, Search, TrendingUp, Globe, MessageSquare, PhoneCall, DollarSign,
  Code, Palette, Database, FileText, Wrench, Copy, Calendar, Users,
  Compass, EyeOff, Key, GraduationCap, BarChart3, Cpu, MessageCircle, Train, Share2,
} from 'lucide-react';

const ICON_MAP = {
  Network, Crown, Compass, Eye, Calendar, Cpu, Code, Palette, Database, Cpu,
  Search, TrendingUp, Zap, Share2, MessageSquare, MessageCircle, PhoneCall,
  Calendar, Eye, BarChart3, TrendingUp, DollarSign, Search, Wrench, FileText,
  GraduationCap, Copy, Users, Globe, Globe, EyeOff, Shield, Key, Network,
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
  const [step, setStep] = useState(1); // 1=vision, 2=strategy, 3=generate, 4=launch
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
    try {
      const res = await base44.functions.invoke('agentBuilderEngine', {
        action: 'analyze',
        vision: vision.trim(),
      });
      const data = res.data || res;
      setStrategy(data);
      setStep(2);
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
      setStep(3);
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
      setStep(4);
    } catch (e) {
      setError(e.message);
    }
    setLaunching(false);
  }, []);

  const reset = () => {
    setStep(1);
    setVision('');
    setStrategy(null);
    setGenResult(null);
    setBootstrapResult(null);
    setLaunchResult(null);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-black text-stone-900 flex items-center justify-center gap-2">
          <Bot className="h-7 w-7 text-amber-500" />
          Agent Builder Engine
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Vision → Strategy → Agents → Production. Deterministic. 24/7. Full-spectrum capabilities.
        </p>
      </div>

      {/* Pipeline Steps */}
      <div className="flex items-center justify-center gap-2 text-xs font-bold">
        {[
          { n: 1, label: 'Vision', icon: Eye },
          { n: 2, label: 'Strategy', icon: Compass },
          { n: 3, label: 'Generate', icon: Sparkles },
          { n: 4, label: 'Launch', icon: Rocket },
        ].map((s, i) => {
          const Icon = s.icon;
          const active = step === s.n;
          const done = step > s.n;
          return (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition ${
                active ? 'border-amber-500 bg-amber-50 text-amber-700' :
                done ? 'border-green-500 bg-green-50 text-green-700' :
                'border-stone-200 bg-white text-stone-400'
              }`}>
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              {i < 3 && <ArrowRight className="h-3 w-3 text-stone-300" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Step 1: Vision Input */}
      {step === 1 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-2">Describe Your Vision</h2>
          <p className="text-sm text-stone-500 mb-4">
            What autonomous system do you want to build? The engine will analyze your vision and produce a complete agent strategy.
          </p>
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder="e.g. Build a digital dominance engine that acquires SEO-optimized websites across emergency service industries, deploys them nationally, and operates 24/7 with autonomous agents handling SEO, content, social media, lead generation, and customer communication..."
            className="w-full h-40 rounded-xl border border-stone-200 p-4 text-sm text-stone-800 focus:border-amber-500 outline-none resize-none"
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
              {analyzing ? 'Analyzing Vision...' : 'Analyze & Produce Strategy'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Strategy */}
      {step === 2 && strategy && (
        <div className="space-y-4">
          {/* Executive Summary */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-500" />
              Strategy Analysis
            </h2>
            <p className="text-sm text-stone-700 mb-4">{strategy.executive_summary}</p>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-xs font-bold text-stone-500 uppercase mb-1">Recommended Architecture</p>
              <p className="text-sm text-stone-700">{strategy.architecture}</p>
            </div>
            {/* Key Capabilities */}
            {strategy.key_capabilities?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Key Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {strategy.key_capabilities.map((c, i) => (
                    <span key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs text-amber-700 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Sync Targets */}
            {strategy.sync_targets?.length > 0 && (
              <div className="mt-4">
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
          </div>

          {/* Recommended Agents */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-800">
                Recommended Agents ({strategy.recommended_agents?.length || 0})
              </h3>
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
                  <div key={i} className={`rounded-xl border-2 p-4 ${CATEGORY_COLORS[archetype.category] || CATEGORY_COLORS.technical}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <div>
                          <p className="font-bold text-sm">{archetype.name || agent.archetype_id}</p>
                          <p className="text-[10px] uppercase tracking-wide opacity-70">{archetype.category}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[agent.priority] || PRIORITY_COLORS.medium}`}>
                        {agent.priority}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 mb-2">{agent.reason}</p>
                    {agent.responsibilities?.length > 0 && (
                      <ul className="text-xs space-y-0.5 opacity-70">
                        {agent.responsibilities.slice(0, 3).map((r, j) => (
                          <li key={j} className="flex items-start gap-1">
                            <span className="mt-0.5">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setStep(1)} className="text-sm text-stone-400 hover:text-stone-600 flex items-center gap-1">
            ← Edit Vision
          </button>
        </div>
      )}

      {/* Step 3: Generate Results */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Agents Generated ({genResult?.agents_created || 0})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleBootstrap}
                  disabled={bootstrapping}
                  className="flex items-center gap-2 rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-stone-900 transition disabled:opacity-50"
                >
                  {bootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                  {bootstrapping ? 'Bootstrapping...' : 'Bootstrap Project'}
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={launching}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition disabled:opacity-50 shadow-md"
                >
                  {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  {launching ? 'Validating...' : 'Validate & Launch'}
                </button>
              </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {genResult?.agents?.map((agent, i) => {
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

            {genResult?.errors?.length > 0 && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-bold text-amber-700 mb-1">Partial Errors:</p>
                {genResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-600">{e}</p>
                ))}
              </div>
            )}
          </div>

          {/* Bootstrap Result */}
          {bootstrapResult && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">Project Manifest</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl bg-stone-50 p-3 text-center">
                  <p className="text-2xl font-black text-stone-800">{bootstrapResult.manifest?.agent_count || 0}</p>
                  <p className="text-xs text-stone-400 uppercase">Agents</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 text-center">
                  <p className="text-2xl font-black text-stone-800">{bootstrapResult.manifest?.structure?.total_files || 0}</p>
                  <p className="text-xs text-stone-400 uppercase">Files</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 text-center">
                  <p className="text-2xl font-black text-stone-800">{bootstrapResult.manifest?.sync_targets?.length || 0}</p>
                  <p className="text-xs text-stone-400 uppercase">Sync Targets</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 text-center">
                  <p className="text-2xl font-black text-green-600">{bootstrapResult.manifest?.validation?.all_agents_created ? '✓' : '✗'}</p>
                  <p className="text-xs text-stone-400 uppercase">Validated</p>
                </div>
              </div>
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Folder Structure</p>
                <div className="font-mono text-xs text-stone-600 space-y-0.5 max-h-40 overflow-y-auto">
                  {bootstrapResult.manifest?.structure?.folders?.map((f, i) => (
                    <div key={i}>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Launch Result */}
          {launchResult && (
            <div className={`rounded-2xl border-2 p-6 shadow-sm ${launchResult.ready ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                {launchResult.ready ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                )}
                <div>
                  <h3 className="text-lg font-bold text-stone-800">
                    {launchResult.ready ? 'System is LIVE' : 'Validation Issues'}
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
                  <p className="text-xl font-black text-amber-600">{launchResult.validation?.agents_with_browser}</p>
                  <p className="text-xs text-stone-400 uppercase">Browser Capable</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={reset} className="text-sm text-stone-400 hover:text-stone-600 flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Start New Vision
          </button>
        </div>
      )}

      {/* Step 4: Launch Complete */}
      {step === 4 && launchResult && (
        <div className="space-y-4">
          <div className={`rounded-2xl border-2 p-8 shadow-sm text-center ${launchResult.ready ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}`}>
            {launchResult.ready ? (
              <Rocket className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-black text-stone-800 mb-2">
              {launchResult.ready ? 'Agent Fleet is LIVE' : 'Needs Attention'}
            </h2>
            <p className="text-sm text-stone-600 mb-6">{launchResult.message}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                <p className="text-xl font-black text-stone-800">{launchResult.validation?.total_agents}</p>
                <p className="text-xs text-stone-400 uppercase">Agents</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                <p className="text-xl font-black text-green-600">{launchResult.validation?.agents_with_prompts}</p>
                <p className="text-xs text-stone-400 uppercase">Prompted</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                <p className="text-xl font-black text-blue-600">{launchResult.validation?.agents_with_actions}</p>
                <p className="text-xs text-stone-400 uppercase">Actions</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center border border-stone-200">
                <p className="text-xl font-black text-purple-600">{launchResult.validation?.agents_with_memory}</p>
                <p className="text-xs text-stone-400 uppercase">Memory</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-bold text-stone-700 hover:border-amber-500 hover:text-amber-600 transition">
              <RefreshCw className="h-4 w-4" /> New Vision
            </button>
          </div>
        </div>
      )}

      {/* Archetype Catalog */}
      {step === 1 && archetypes.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
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