import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Loader2, Sparkles, Languages } from 'lucide-react';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Brazil', 'Mexico', 'Japan', 'China', 'India', 'South Korea',
  'UAE', 'Saudi Arabia', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
];

export default function InternationalEnhancer({ vision }) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(['United States']);
  const [localized, setLocalized] = useState(null);
  const [error, setError] = useState(null);

  const toggle = (country) => {
    setSelected((prev) => prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]);
  };

  const localize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Enhance this vision for international markets: "${vision}"
Target countries: ${selected.join(', ')}

For each country, adapt:
1. Language and tone
2. Cultural nuances
3. Local payment methods
4. Local SEO keywords
5. Local compliance notes
6. Currency and pricing

Return JSON: {
  "localizations": [ {
    "country": string, "language": string, "tone_adjustment": string,
    "payment_methods": [string], "local_keywords": [string], "compliance_notes": string, "currency": string, "pricing_adjustment": string
  } ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            localizations: { type: 'array', items: { type: 'object', properties: {
              country: { type: 'string' }, language: { type: 'string' }, tone_adjustment: { type: 'string' },
              payment_methods: { type: 'array', items: { type: 'string' } }, local_keywords: { type: 'array', items: { type: 'string' } },
              compliance_notes: { type: 'string' }, currency: { type: 'string' }, pricing_adjustment: { type: 'string' },
            } } },
          },
        },
      });
      setLocalized(res);
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
          <Languages className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">International Language Enhancement</h3>
        </div>
        <button onClick={localize} disabled={loading || selected.length === 0} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          {loading ? 'Localizing...' : `Localize for ${selected.length} countries`}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {COUNTRIES.map((c) => (
          <button key={c} onClick={() => toggle(c)} className={`text-xs font-bold px-2.5 py-1 rounded-full transition ${selected.includes(c) ? 'bg-amber-500 text-stone-950' : 'bg-white border border-stone-200 text-stone-500 hover:border-amber-400'}`}>
            {c}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {localized?.localizations?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
          {localized.localizations.map((l, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-2.5">
              <p className="text-sm font-bold text-stone-900">{l.country}</p>
              <p className="text-[10px] text-amber-600 font-bold">{l.language} · {l.currency}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{l.tone_adjustment}</p>
              {l.local_keywords?.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1">{l.local_keywords.slice(0, 3).map((k, j) => <span key={j} className="text-[9px] bg-stone-100 px-1 py-0.5 rounded">{k}</span>)}</div>
              )}
              <p className="text-[9px] text-stone-400 mt-1">Pricing: {l.pricing_adjustment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}