import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DollarSign, Loader2, Sparkles, TrendingUp, Target } from 'lucide-react';

export default function FindTheMoneyGenerator({ vision }) {
  const [loading, setLoading] = useState(false);
  const [money, setMoney] = useState(null);
  const [error, setError] = useState(null);

  const find = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a "Find the Money" generator. For this vision: "${vision}", identify:

1. The top 10 money-making systems, sites, and funnels in this space
2. Where the money is flowing right now
3. Who is paying and for what
4. The fastest revenue paths
5. Hidden revenue opportunities
6. Recurring revenue models
7. High-ticket opportunities
8. Passive income potential
9. Arbitrage opportunities
10. The single biggest money-making opportunity

Return JSON: {
  "top_money_systems": [ { "name": string, "revenue_model": string, "estimated_revenue": string, "why_it_works": string } ],
  "money_flow": string,
  "who_pays": [string],
  "fastest_revenue_paths": [ { "path": string, "time_to_revenue": string, "effort": string } ],
  "hidden_opportunities": [string],
  "recurring_models": [string],
  "high_ticket": [ { "opportunity": string, "price_point": string } ],
  "passive_income": [string],
  "arbitrage": [string],
  "biggest_opportunity": { "name": string, "potential": string, "action_plan": string }
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            top_money_systems: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, revenue_model: { type: 'string' }, estimated_revenue: { type: 'string' }, why_it_works: { type: 'string' } } } },
            money_flow: { type: 'string' },
            who_pays: { type: 'array', items: { type: 'string' } },
            fastest_revenue_paths: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, time_to_revenue: { type: 'string' }, effort: { type: 'string' } } } },
            hidden_opportunities: { type: 'array', items: { type: 'string' } },
            recurring_models: { type: 'array', items: { type: 'string' } },
            high_ticket: { type: 'array', items: { type: 'object', properties: { opportunity: { type: 'string' }, price_point: { type: 'string' } } } },
            passive_income: { type: 'array', items: { type: 'string' } },
            arbitrage: { type: 'array', items: { type: 'string' } },
            biggest_opportunity: { type: 'object', properties: { name: { type: 'string' }, potential: { type: 'string' }, action_plan: { type: 'string' } } },
          },
        },
      });
      setMoney(res);
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
          <DollarSign className="h-5 w-5 text-emerald-500" />
          <h3 className="text-base font-black text-stone-900">Find the Money Generator</h3>
        </div>
        <button onClick={find} disabled={loading || !vision?.trim()} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
          {loading ? 'Finding Money...' : 'Find the Money'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {money && (
        <div className="space-y-2">
          {money.biggest_opportunity && (
            <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-3">
              <p className="text-xs font-bold text-emerald-600 mb-0.5 flex items-center gap-1"><Target className="h-3 w-3" /> BIGGEST OPPORTUNITY</p>
              <p className="text-sm font-black text-stone-900">{money.biggest_opportunity.name}</p>
              <p className="text-xs text-stone-600">{money.biggest_opportunity.potential}</p>
              <p className="text-xs text-emerald-700 font-bold mt-1">Action: {money.biggest_opportunity.action_plan}</p>
            </div>
          )}

          {money.top_money_systems?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> TOP MONEY-MAKING SYSTEMS</p>
              <div className="space-y-1">
                {money.top_money_systems.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded px-2 py-1.5">
                    <div>
                      <span className="font-bold text-stone-700">{s.name}</span>
                      <span className="text-stone-400 ml-2">{s.revenue_model}</span>
                    </div>
                    <span className="font-bold text-emerald-600">{s.estimated_revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {money.fastest_revenue_paths?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1">FASTEST REVENUE PATHS</p>
              <div className="grid grid-cols-3 gap-1">
                {money.fastest_revenue_paths.map((p, i) => (
                  <div key={i} className="text-xs bg-amber-50 rounded p-2">
                    <p className="font-bold text-stone-700">{p.path}</p>
                    <p className="text-[10px] text-amber-600">{p.time_to_revenue} · {p.effort}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {money.high_ticket?.length > 0 && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-xs font-bold text-stone-500 mb-1">HIGH-TICKET OPPORTUNITIES</p>
              <div className="space-y-0.5">
                {money.high_ticket.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">{h.opportunity}</span>
                    <span className="font-bold text-emerald-600">{h.price_point}</span>
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