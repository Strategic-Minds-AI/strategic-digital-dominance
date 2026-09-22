import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Radar, Loader2, Sparkles, Globe, Trophy } from 'lucide-react';

export default function TopSitesScanner({ vision }) {
  const [loading, setLoading] = useState(null);
  const [topSites, setTopSites] = useState(null);
  const [benchmarks, setBenchmarks] = useState(null);
  const [error, setError] = useState(null);

  const scan = async () => {
    setLoading('scan');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Identify the top 10 websites, funnels, and systems in the world for this vision: "${vision}".
For each, describe what makes them the best, their key features, conversion strategies, and what can be benchmarked.

Return JSON: {
  "top_sites": [ { "name": string, "url": string, "category": string, "why_top": string, "key_features": [string], "conversion_strategy": string, "benchmark_takeaways": [string] } ]
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            top_sites: { type: 'array', items: { type: 'object', properties: {
              name: { type: 'string' }, url: { type: 'string' }, category: { type: 'string' },
              why_top: { type: 'string' }, key_features: { type: 'array', items: { type: 'string' } },
              conversion_strategy: { type: 'string' }, benchmark_takeaways: { type: 'array', items: { type: 'string' } },
            } } },
          },
        },
      });
      setTopSites(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const benchmark = async () => {
    setLoading('benchmark');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the top sites for vision "${vision}", create a benchmark framework that our system should meet or exceed.
Include specific metrics, design standards, conversion targets, and feature parity requirements.

Return JSON: {
  "benchmarks": [ { "category": string, "metric": string, "target": string, "how_to_achieve": string } ],
  "design_standards": [string], "conversion_targets": [ { "element": string, "target": string } ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            benchmarks: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, metric: { type: 'string' }, target: { type: 'string' }, how_to_achieve: { type: 'string' } } } },
            design_standards: { type: 'array', items: { type: 'string' } },
            conversion_targets: { type: 'array', items: { type: 'object', properties: { element: { type: 'string' }, target: { type: 'string' } } } },
          },
        },
      });
      setBenchmarks(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">Top Sites Scanner — Global Benchmark</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={scan} disabled={loading === 'scan'} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold hover:border-amber-500 disabled:opacity-50">
            {loading === 'scan' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
            Scan Top Sites
          </button>
          <button onClick={benchmark} disabled={loading === 'benchmark'} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
            {loading === 'benchmark' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
            Create Benchmarks
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {topSites?.top_sites?.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {topSites.top_sites.map((s, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-black grid place-items-center">{i + 1}</span>
                  {s.name}
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{s.category}</span>
              </div>
              <p className="text-xs text-stone-500">{s.why_top}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Conversion: {s.conversion_strategy}</p>
              {s.benchmark_takeaways?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">{s.benchmark_takeaways.map((t, j) => <span key={j} className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{t}</span>)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {benchmarks && (
        <div className="space-y-2">
          {benchmarks.benchmarks?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1">BENCHMARK FRAMEWORK</p>
              <div className="space-y-1">
                {benchmarks.benchmarks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded px-2 py-1">
                    <span className="font-bold text-stone-700">{b.category}: {b.metric}</span>
                    <span className="text-amber-600 font-bold">{b.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}