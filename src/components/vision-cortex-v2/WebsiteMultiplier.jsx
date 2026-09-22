import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Layers, Loader2, Sparkles, Globe } from 'lucide-react';

export default function WebsiteMultiplier({ vision }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const multiply = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Design a mass website multiplication plan for this vision: "${vision}".
The system should generate many websites across niches, locations, and variations — all from one base system.

Return JSON: {
  "multiplication_strategy": string,
  "site_variations": [ { "niche": string, "location": string, "variation": string, "url_pattern": string, "revenue_model": string } ],
  "content_implementer": { "google_recommendations": [string], "platform_recommendations": [string], "auto_adjustments": [string] },
  "scaling_plan": string,
  "estimated_sites": number
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            multiplication_strategy: { type: 'string' },
            site_variations: { type: 'array', items: { type: 'object', properties: {
              niche: { type: 'string' }, location: { type: 'string' }, variation: { type: 'string' },
              url_pattern: { type: 'string' }, revenue_model: { type: 'string' },
            } } },
            content_implementer: { type: 'object', properties: {
              google_recommendations: { type: 'array', items: { type: 'string' } },
              platform_recommendations: { type: 'array', items: { type: 'string' } },
              auto_adjustments: { type: 'array', items: { type: 'string' } },
            } },
            scaling_plan: { type: 'string' },
            estimated_sites: { type: 'number' },
          },
        },
      });
      setPlan(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">Website Multiplier + Content Implementer</h3>
        </div>
        <button onClick={multiply} disabled={loading || !vision?.trim()} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Multiplying...' : 'Multiply Websites'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {plan && (
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-600 mb-0.5">MULTIPLICATION STRATEGY</p>
            <p className="text-sm text-stone-700">{plan.multiplication_strategy}</p>
            <p className="text-xs text-amber-600 font-bold mt-1">Estimated sites: {plan.estimated_sites}</p>
          </div>

          {plan.site_variations?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1">SITE VARIATIONS</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 max-h-40 overflow-y-auto">
                {plan.site_variations.map((s, i) => (
                  <div key={i} className="text-xs bg-stone-50 rounded p-2">
                    <p className="font-bold text-stone-700">{s.niche}</p>
                    <p className="text-[10px] text-stone-400">{s.location} · {s.variation}</p>
                    <p className="text-[9px] text-amber-600 font-bold">{s.revenue_model}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.content_implementer && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><Globe className="h-3 w-3" /> GOOGLE RECOMMENDATIONS</p>
                <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">{plan.content_implementer.google_recommendations?.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                <p className="text-xs font-bold text-violet-600 mb-1">PLATFORM RECOMMENDATIONS</p>
                <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">{plan.content_implementer.platform_recommendations?.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
          )}

          {plan.scaling_plan && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-0.5">SCALING PLAN</p>
              <p className="text-xs text-stone-600">{plan.scaling_plan}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}