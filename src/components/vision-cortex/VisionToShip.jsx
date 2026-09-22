import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Rocket, Loader2, AlertCircle, CheckCircle2, Eye, Compass,
  Code2, Cloud, Sparkles, ArrowRight, ExternalLink, RotateCcw,
} from 'lucide-react';

// Vision → Ship pipeline: takes a vision statement and runs it through
// analyze → plan → generate → deploy → ship using existing backend functions.
const STAGES = [
  { key: 'analyze', label: 'Analyze Vision', icon: Eye, fn: 'visionEngine', desc: 'Refine and articulate the vision' },
  { key: 'plan', label: 'Plan Architecture', icon: Compass, fn: 'agentBuilderEngine', desc: 'Strategy, agents, and architecture' },
  { key: 'generate', label: 'Generate Code', icon: Code2, fn: 'autonomousCodingEngine', desc: 'Autonomous code generation' },
  { key: 'deploy', label: 'Deploy', icon: Cloud, fn: 'vercelDeploy', desc: 'Ship to production' },
];

export default function VisionToShip() {
  const [vision, setVision] = useState('');
  const [running, setRunning] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [shipped, setShipped] = useState(null);

  const runPipeline = async () => {
    if (!vision.trim()) return;
    setRunning(true);
    setError(null);
    setResults({});
    setShipped(null);
    setStageIndex(0);

    let refinedVision = vision.trim();
    const stageResults = {};

    try {
      // Stage 1: Analyze (visionEngine -> assist)
      setStageIndex(0);
      const analyzeRes = await base44.functions.invoke('visionEngine', {
        action: 'assist',
        raw_idea: refinedVision,
        feedback: '',
      });
      const analyzeData = analyzeRes.data || analyzeRes;
      stageResults.analyze = analyzeData;
      if (analyzeData.refined_vision) refinedVision = analyzeData.refined_vision;
      setResults({ ...stageResults });

      // Stage 2: Plan (agentBuilderEngine -> analyze)
      setStageIndex(1);
      const planRes = await base44.functions.invoke('agentBuilderEngine', {
        action: 'analyze',
        vision: refinedVision,
      });
      const planData = planRes.data || planRes;
      stageResults.plan = planData;
      setResults({ ...stageResults });

      // Stage 3: Generate (agentBuilderEngine -> generate, then autonomousCodingEngine)
      setStageIndex(2);
      const genRes = await base44.functions.invoke('agentBuilderEngine', {
        action: 'generate',
        vision: refinedVision,
        recommended_agents: planData.recommended_agents || [],
      });
      stageResults.generate = genRes.data || genRes;
      setResults({ ...stageResults });

      // Stage 4: Deploy (vercelDeploy)
      setStageIndex(3);
      const deployRes = await base44.functions.invoke('vercelDeploy', {
        action: 'deploy',
        vision: refinedVision,
      });
      const deployData = deployRes.data || deployRes;
      stageResults.deploy = deployData;
      setResults({ ...stageResults });

      // Shipped!
      setShipped({
        url: deployData.url || deployData.deployment_url || deployData.vercel_url,
        message: deployData.message || 'Deployment complete',
      });
    } catch (e) {
      setError(e.message || 'Pipeline failed');
    } finally {
      setRunning(false);
      setStageIndex(-1);
    }
  };

  const reset = () => {
    setVision('');
    setResults({});
    setShipped(null);
    setError(null);
    setStageIndex(-1);
  };

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center">
          <Rocket className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-stone-900">Vision → Ship Pipeline</h3>
          <p className="text-xs text-stone-500">Drop a vision statement. The fleet analyzes, plans, generates, and deploys it automatically.</p>
        </div>
      </div>

      {/* Vision input */}
      <textarea
        value={vision}
        onChange={(e) => setVision(e.target.value)}
        disabled={running}
        placeholder="e.g. Build a SaaS platform that lets local contractors generate SEO-optimized landing pages for every city they service, with automated lead capture and SMS follow-up..."
        className="w-full h-28 rounded-xl border border-stone-200 p-4 text-sm text-stone-800 focus:border-amber-500 outline-none resize-none disabled:opacity-60"
        maxLength={3000}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-stone-400">{vision.length}/3000</span>
        <div className="flex gap-2">
          {(shipped || error) && (
            <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-amber-500">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
          <button
            onClick={runPipeline}
            disabled={!vision.trim() || running}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {running ? 'Shipping...' : 'Ship It'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Pipeline stages */}
      {(running || Object.keys(results).length > 0) && (
        <div className="mt-5 space-y-2">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isRunning = stageIndex === i && running;
            const isDone = !!results[stage.key];
            const isPending = stageIndex < i || (stageIndex === -1 && !isDone);
            return (
              <div
                key={stage.key}
                className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                  isRunning ? 'border-amber-400 bg-amber-50' :
                  isDone ? 'border-green-300 bg-green-50' :
                  'border-stone-200 bg-white'
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isRunning ? 'bg-amber-500 text-white' :
                  isDone ? 'bg-green-500 text-white' :
                  'bg-stone-100 text-stone-400'
                }`}>
                  {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> :
                   isDone ? <CheckCircle2 className="h-5 w-5" /> :
                   <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{stage.label}</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase">{stage.desc}</span>
                  </div>
                  {isDone && results[stage.key] && (
                    <StageResult stage={stage.key} data={results[stage.key]} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shipped result */}
      {shipped && (
        <div className="mt-5 rounded-2xl border-2 border-green-500 bg-green-50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="text-lg font-black text-stone-900">Shipped! 🚀</h4>
              <p className="text-sm text-stone-600">{shipped.message}</p>
            </div>
          </div>
          {shipped.url && (
            <a
              href={shipped.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4" /> Open Live Site
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StageResult({ stage, data }) {
  if (!data) return null;

  if (stage === 'analyze') {
    return (
      <div className="mt-1.5 space-y-1">
        {data.refined_vision && <p className="text-xs text-stone-700 line-clamp-2">{data.refined_vision}</p>}
        <div className="flex flex-wrap gap-1">
          {data.core_capabilities?.slice(0, 3).map((c, i) => (
            <span key={i} className="text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-600">{c}</span>
          ))}
        </div>
      </div>
    );
  }

  if (stage === 'plan') {
    return (
      <div className="mt-1.5 space-y-1">
        {data.executive_summary && <p className="text-xs text-stone-700 line-clamp-2">{data.executive_summary}</p>}
        <div className="flex flex-wrap gap-1">
          {(data.recommended_agents || []).slice(0, 5).map((a, i) => (
            <span key={i} className="text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-600">
              {a.name || a.archetype_id}
            </span>
          ))}
          {(data.recommended_agents?.length || 0) > 5 && (
            <span className="text-[10px] text-stone-400">+{(data.recommended_agents.length - 5)} more</span>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'generate') {
    return (
      <div className="mt-1.5">
        <p className="text-xs text-stone-700">
          <span className="font-bold text-green-600">{data.agents_created || 0}</span> agents generated
          {data.errors?.length > 0 && <span className="text-amber-600"> · {data.errors.length} warnings</span>}
        </p>
      </div>
    );
  }

  if (stage === 'deploy') {
    return (
      <div className="mt-1.5">
        <p className="text-xs text-stone-700">{data.message || 'Deployment triggered'}</p>
      </div>
    );
  }

  return null;
}