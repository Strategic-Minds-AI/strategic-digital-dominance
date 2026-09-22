import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function AgentMonetizer({ vision }) {
  const [loading, setLoading] = useState(false);
  const [monetization, setMonetization] = useState(null);
  const [error, setError] = useState(null);

  const monetize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Design an agent monetization plan for this vision: "${vision}".
Create autonomous agents that can:
1. Persistently watch analytics and adjust
2. Find what's working and follow that groove
3. Generate revenue autonomously

Return JSON: {
  "monetization_agents": [ { "name": string, "role": string, "revenue_action": string, "autonomy_level": string, "expected_revenue": string } ],
  "analytics_loop": { "watch": [string], "adjust": [string], "amplify": [string] },
  "revenue_streams": [ { "stream": string, "model": string, "projection": string } ],
  "autonomous_pricing": string,
  "growth_loop": string
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            monetization_agents: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, revenue_action: { type: 'string' }, autonomy_level: { type: 'string' }, expected_revenue: { type: 'string' } } } },
            analytics_loop: { type: 'object', properties: { watch: { type: 'array', items: { type: 'string' } }, adjust: { type: 'array', items: { type: 'string' } }, amplify: { type: 'array', items: { type: 'string' } } } },
            revenue_streams: { type: 'array', items: { type: 'object', properties: { stream: { type: 'string' }, model: { type: 'string' }, projection: { type: 'string' } } } },
            autonomous_pricing: { type: 'string' },
            growth_loop: { type: 'string' },
          },
        },
      });
      setMonetization(res);
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
          <Bot className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">Agent Monetizer — Autonomous Revenue</h3>
        </div>
        <button onClick={monetize} disabled={loading || !vision?.trim()} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
          {loading ? 'Monetizing...' : 'Monetize Agents'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {monetization && (
        <div className="space-y-2">
          {monetization.monetization_agents?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><Bot className="h-3 w-3" /> MONETIZATION AGENTS</p>
              <div className="space-y-1">
                {monetization.monetization_agents.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded p-2">
                    <div>
                      <span className="font-bold text-stone-700">{a.name}</span>
                      <p className="text-[10px] text-stone-400">{a.role} · {a.autonomy_level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{a.expected_revenue}</p>
                      <p className="text-[10px] text-stone-400">{a.revenue_action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monetization.analytics_loop && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
                <p className="text-xs font-bold text-blue-600 mb-0.5 flex items-center gap-1"><Activity className="h-3 w-3" /> WATCH</p>
                <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">{monetization.analytics_loop.watch?.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                <p className="text-xs font-bold text-amber-600 mb-0.5">ADJUST</p>
                <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">{monetization.analytics_loop.adjust?.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                <p className="text-xs font-bold text-emerald-600 mb-0.5 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> AMPLIFY</p>
                <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">{monetization.analytics_loop.amplify?.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            </div>
          )}

          {monetization.growth_loop && (
            <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3">
              <p className="text-xs font-bold text-emerald-600 mb-0.5">GROWTH LOOP</p>
              <p className="text-sm text-stone-700">{monetization.growth_loop}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}