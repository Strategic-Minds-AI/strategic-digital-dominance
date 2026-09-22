import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Layout, Loader2, Sparkles, Wand2, RefreshCw } from 'lucide-react';

export default function TemplateLibrary({ vision }) {
  const [loading, setLoading] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [rebranded, setRebranded] = useState(null);
  const [error, setError] = useState(null);

  const scan = async () => {
    setLoading('scan');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Catalog 50 high-quality website templates suitable for this vision: "${vision}".
For each, describe the template name, category, style, key features, and rebranding potential.

Return JSON: {
  "templates": [ { "name": string, "category": string, "style": string, "features": [string], "rebrand_potential": string } ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            templates: { type: 'array', items: { type: 'object', properties: {
              name: { type: 'string' }, category: { type: 'string' }, style: { type: 'string' },
              features: { type: 'array', items: { type: 'string' } }, rebrand_potential: { type: 'string' },
            } } },
          },
        },
      });
      setTemplates(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const rebrand = async () => {
    setLoading('rebrand');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Design a rebranding system for 50 website templates for vision "${vision}".
The rebrander should: swap colors, fonts, logos, copy, images, and layout accents to match a new brand identity.

Return JSON: {
  "rebrand_steps": [string],
  "swap_map": [ { "element": string, "original": string, "rebranded": string } ],
  "automation_plan": string,
  "batch_capacity": string
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            rebrand_steps: { type: 'array', items: { type: 'string' } },
            swap_map: { type: 'array', items: { type: 'object', properties: { element: { type: 'string' }, original: { type: 'string' }, rebranded: { type: 'string' } } } },
            automation_plan: { type: 'string' },
            batch_capacity: { type: 'string' },
          },
        },
      });
      setRebranded(res);
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
          <Layout className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">Template Library + Rebrander (50 templates)</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={scan} disabled={loading === 'scan'} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold hover:border-amber-500 disabled:opacity-50">
            {loading === 'scan' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layout className="h-3.5 w-3.5" />}
            Scan Templates
          </button>
          <button onClick={rebrand} disabled={loading === 'rebrand'} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
            {loading === 'rebrand' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Create Rebrander
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {templates?.templates?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
          {templates.templates.slice(0, 25).map((t, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-2 text-center">
              <div className="h-16 rounded bg-gradient-to-br from-stone-100 to-stone-200 mb-1 grid place-items-center">
                <Layout className="h-6 w-6 text-stone-400" />
              </div>
              <p className="text-[10px] font-bold text-stone-700 truncate">{t.name}</p>
              <p className="text-[9px] text-stone-400">{t.category}</p>
            </div>
          ))}
        </div>
      )}

      {rebranded && (
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-600 mb-0.5">REBRAND AUTOMATION</p>
            <p className="text-sm text-stone-700">{rebranded.automation_plan}</p>
            <p className="text-xs text-amber-600 font-bold mt-1">Batch: {rebranded.batch_capacity}</p>
          </div>
          {rebranded.rebrand_steps?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1">REBRAND STEPS</p>
              <div className="space-y-0.5">
                {rebranded.rebrand_steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold grid place-items-center">{i + 1}</span>
                    <span className="text-stone-600">{s}</span>
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