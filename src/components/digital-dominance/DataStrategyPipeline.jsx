import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Download, Filter, FolderTree, Lightbulb, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

const STAGES = [
  { key: 'discover', label: 'Discovery', icon: Search, desc: 'Identify data sources: contractors, investors, market data, competitors' },
  { key: 'acquire', label: 'Acquisition', icon: Download, desc: 'Scrape and collect raw data from all identified sources' },
  { key: 'ingest', label: 'Ingestion', icon: Filter, desc: 'Import raw data into the system with deduplication' },
  { key: 'normalize', label: 'Normalization', icon: FolderTree, desc: 'Standardize formats, clean, validate, and structure' },
  { key: 'organize', label: 'Organize', icon: FolderTree, desc: 'Categorize, tag, and index for retrieval' },
  { key: 'strategize', label: 'Strategize', icon: Lightbulb, desc: 'AI analyzes data to identify patterns and opportunities' },
  { key: 'enrich', label: 'Enrich', icon: Sparkles, desc: 'Add property data, skip-trace, scoring, and intelligence' },
];

export default function DataStrategyPipeline() {
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const runStage = async (stageKey) => {
    setRunning(stageKey);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a data strategy engine for the epoxy/concrete contractor industry. Execute the "${stageKey}" stage of the data pipeline.

For this stage, provide:
1. A summary of what was accomplished
2. Key metrics (records processed, sources found, quality score)
3. Recommended next actions

Stage details: ${STAGES.find(s => s.key === stageKey)?.desc}

Return structured JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            stage: { type: 'string' },
            summary: { type: 'string' },
            metrics: {
              type: 'object',
              properties: {
                records_processed: { type: 'integer' },
                sources_found: { type: 'integer' },
                quality_score: { type: 'integer' },
              },
            },
            next_actions: { type: 'array', items: { type: 'string' } },
            status: { type: 'string' },
          },
        },
      });
      setResults((prev) => ({ ...prev, [stageKey]: res }));
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(null);
    }
  };

  const runAll = async () => {
    for (const stage of STAGES) {
      await runStage(stage.key);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">7-stage data pipeline: from raw discovery to enriched intelligence</p>
        <button onClick={runAll} disabled={!!running} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Run Full Pipeline
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isRunning = running === stage.key;
          const isDone = !!results[stage.key];
          const res = results[stage.key];
          return (
            <div key={stage.key}>
              <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition ${
                isRunning ? 'border-amber-400 bg-amber-50' : isDone ? 'border-green-300 bg-green-50' : 'border-stone-200 bg-white'
              }`}>
                <div className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${
                  isRunning ? 'bg-amber-500' : isDone ? 'bg-green-500' : 'bg-stone-200'
                }`}>
                  {isRunning ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : isDone ? <CheckCircle2 className="h-5 w-5 text-white" /> : <Icon className="h-5 w-5 text-stone-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400">STAGE {i + 1}</span>
                    <h4 className="text-sm font-bold text-stone-900">{stage.label}</h4>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{stage.desc}</p>
                  {res && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-stone-700">{res.summary}</p>
                      {res.metrics && (
                        <div className="flex gap-3 text-[10px] text-stone-500">
                          <span>{res.metrics.records_processed || 0} records</span>
                          <span>{res.metrics.sources_found || 0} sources</span>
                          <span>Quality: {res.metrics.quality_score || 0}/100</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => runStage(stage.key)}
                  disabled={isRunning}
                  className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-600 hover:border-amber-500 hover:text-amber-600 disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run'}
                  {!isRunning && <ArrowRight className="h-3 w-3" />}
                </button>
              </div>
              {i < STAGES.length - 1 && <div className="ml-8 h-3 border-l-2 border-stone-200" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}