import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Loader2, Sparkles, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function FinalValidator({ vision }) {
  const [loading, setLoading] = useState(null);
  const [validation, setValidation] = useState(null);
  const [enhancements, setEnhancements] = useState(null);
  const [error, setError] = useState(null);

  const validate = async () => {
    setLoading('validate');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform a final validation of the complete system built for this vision: "${vision}".
Check every category: strategy, branding, content, website, video, SEO, monetization, agents, automation.
Score each 0-100 and identify any remaining issues.

Return JSON: {
  "overall_score": number,
  "categories": [ { "name": string, "score": number, "status": string, "issues": [string], "fixes": [string] } ],
  "blocking_issues": [string],
  "ready_to_ship": boolean
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_score: { type: 'number' },
            categories: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, score: { type: 'number' }, status: { type: 'string' }, issues: { type: 'array', items: { type: 'string' } }, fixes: { type: 'array', items: { type: 'string' } } } } },
            blocking_issues: { type: 'array', items: { type: 'string' } },
            ready_to_ship: { type: 'boolean' },
          },
        },
      });
      setValidation(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const enhance = async () => {
    setLoading('enhance');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide final enhancements for the system built for vision "${vision}".
Suggest the top 10 enhancements that would maximize quality, revenue, and impact.

Return JSON: { "enhancements": [ { "title": string, "impact": string, "implementation": string, "priority": string } ] }`,
        response_json_schema: {
          type: 'object',
          properties: {
            enhancements: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, impact: { type: 'string' }, implementation: { type: 'string' }, priority: { type: 'string' } } } },
          },
        },
      });
      setEnhancements(res);
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
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">Final Validator & Enhancer</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={validate} disabled={loading === 'validate'} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold hover:border-amber-500 disabled:opacity-50">
            {loading === 'validate' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Validate
          </button>
          <button onClick={enhance} disabled={loading === 'enhance'} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
            {loading === 'enhance' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Enhance
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {validation && (
        <div className="space-y-2">
          <div className={`rounded-lg border-2 p-3 ${validation.ready_to_ship ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-stone-900">Overall Score: {validation.overall_score}/100</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${validation.ready_to_ship ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}>
                {validation.ready_to_ship ? '✓ READY TO SHIP' : '⚠ NEEDS WORK'}
              </span>
            </div>
          </div>

          {validation.categories?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {validation.categories.map((c, i) => (
                <div key={i} className={`rounded-lg border p-2 ${c.score >= 80 ? 'border-green-200 bg-green-50' : c.score >= 50 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                  <p className="text-xs font-bold text-stone-700">{c.name}</p>
                  <p className="text-lg font-black text-stone-900">{c.score}</p>
                  <p className="text-[10px] font-bold text-stone-500">{c.status}</p>
                </div>
              ))}
            </div>
          )}

          {validation.blocking_issues?.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> BLOCKING ISSUES</p>
              <ul className="list-disc list-inside text-xs text-stone-600 space-y-0.5">{validation.blocking_issues.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {enhancements?.enhancements?.length > 0 && (
        <div className="rounded-lg border border-stone-200 p-3">
          <p className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> TOP ENHANCEMENTS</p>
          <div className="space-y-1">
            {enhancements.enhancements.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-stone-50 rounded p-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${e.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{e.priority}</span>
                <div>
                  <p className="font-bold text-stone-700">{e.title}</p>
                  <p className="text-stone-500">Impact: {e.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}