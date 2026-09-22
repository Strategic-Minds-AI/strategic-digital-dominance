import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Github, Loader2, Sparkles, Code2, CheckCircle2 } from 'lucide-react';

export default function GitHubScanner({ vision }) {
  const [loading, setLoading] = useState(null);
  const [topRepos, setTopRepos] = useState(null);
  const [gaps, setGaps] = useState(null);
  const [error, setError] = useState(null);

  const scan = async () => {
    setLoading('scan');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search GitHub for the top 5 repositories related to this vision: "${vision}".
For each repo, identify: name, description, stars, language, license, what it does, and how its code could be integrated.

Return JSON: {
  "top_repos": [ { "name": string, "description": string, "stars": string, "language": string, "license": string, "integration_plan": string, "code_reuse_potential": string } ]
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            top_repos: { type: 'array', items: { type: 'object', properties: {
              name: { type: 'string' }, description: { type: 'string' }, stars: { type: 'string' },
              language: { type: 'string' }, license: { type: 'string' },
              integration_plan: { type: 'string' }, code_reuse_potential: { type: 'string' },
            } } },
          },
        },
      });
      setTopRepos(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const findGaps = async () => {
    setLoading('gaps');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the system being built for vision "${vision}".
Identify gaps in every category of the system and strategy.
For each gap, describe what's missing, why it matters, and how to fill it with the highest quality solution.

Return JSON: {
  "gaps": [ { "category": string, "gap": string, "impact": string, "solution": string, "priority": string } ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            gaps: { type: 'array', items: { type: 'object', properties: {
              category: { type: 'string' }, gap: { type: 'string' }, impact: { type: 'string' },
              solution: { type: 'string' }, priority: { type: 'string' },
            } } },
          },
        },
      });
      setGaps(res);
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
          <Github className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">GitHub Scanner — Top 5 + Gap Filler</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={scan} disabled={loading === 'scan'} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold hover:border-amber-500 disabled:opacity-50">
            {loading === 'scan' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Github className="h-3.5 w-3.5" />}
            Scan GitHub
          </button>
          <button onClick={findGaps} disabled={loading === 'gaps'} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
            {loading === 'gaps' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
            Find & Fill Gaps
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {topRepos?.top_repos?.length > 0 && (
        <div className="space-y-1">
          {topRepos.top_repos.map((r, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded bg-stone-900 text-white text-[10px] font-black grid place-items-center">{i + 1}</span>
                  {r.name}
                </span>
                <div className="flex gap-1">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">⭐ {r.stars}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{r.language}</span>
                </div>
              </div>
              <p className="text-xs text-stone-500">{r.description}</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Integration: {r.integration_plan}</p>
              <p className="text-[10px] text-emerald-600 font-bold">Reuse: {r.code_reuse_potential}</p>
            </div>
          ))}
        </div>
      )}

      {gaps?.gaps?.length > 0 && (
        <div className="rounded-lg border border-stone-200 p-3">
          <p className="text-xs font-bold text-stone-500 mb-1">SYSTEM GAPS IDENTIFIED ({gaps.gaps.length})</p>
          <div className="space-y-1">
            {gaps.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-stone-50 rounded p-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${g.priority === 'critical' ? 'bg-red-100 text-red-700' : g.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>{g.priority}</span>
                <div>
                  <p className="font-bold text-stone-700">{g.category}: {g.gap}</p>
                  <p className="text-stone-500">Solution: {g.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}