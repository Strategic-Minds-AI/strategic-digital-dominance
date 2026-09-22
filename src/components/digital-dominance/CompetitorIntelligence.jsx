import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Radar, DollarSign, Loader2, TrendingUp, Globe, Target } from 'lucide-react';

export default function CompetitorIntelligence() {
  const [scanning, setScanning] = useState(false);
  const [pricingScan, setPricingScan] = useState(false);
  const [competitors, setCompetitors] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState(null);

  const { data: savedCompetitors } = useQuery({
    queryKey: ['competitor-intel'],
    queryFn: () => base44.entities.CompetitorInsight.list('-created_date', 20),
  });

  const scanTop20 = async () => {
    setScanning(true);
    setError(null);
    setCompetitors(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find the top 20 epoxy flooring and concrete polishing contractor websites in the USA. For each, analyze:
1. Their SEO strengths (domain authority, content quality, backlinks estimate)
2. Their service offerings and pricing tiers
3. Their unique selling propositions
4. Their weaknesses and gaps we can exploit
5. Their social media presence
6. Their target markets

Use web search to find real companies. Return structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            competitors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rank: { type: 'integer' },
                  company_name: { type: 'string' },
                  website: { type: 'string' },
                  seo_strength: { type: 'integer' },
                  pricing_tier: { type: 'string' },
                  usp: { type: 'string' },
                  weaknesses: { type: 'array', items: { type: 'string' } },
                  target_market: { type: 'string' },
                  social_presence: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setCompetitors(res);

      // Save to entity
      if (res.competitors?.length) {
        await base44.entities.CompetitorInsight.bulkCreate(
          res.competitors.slice(0, 10).map((c) => ({
            competitor_name: c.company_name,
            website: c.website,
            seo_strength_score: c.seo_strength,
            pricing_tier: c.pricing_tier,
            key_strengths: c.usp,
            weaknesses: c.weaknesses?.join(', '),
          }))
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setScanning(false);
    }
  };

  const scanPricing = async () => {
    setPricingScan(true);
    setError(null);
    setPricing(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Scrape and analyze epoxy flooring and concrete polishing pricing across the USA. For each service type, provide:
1. Low, average, and high prices per square foot
2. Regional variations (Northeast, South, Midwest, West)
3. Factors that affect pricing
4. Common package tiers (basic, mid, premium)
5. Seasonal pricing patterns

Service types: garage floors, commercial floors, polished concrete, decorative concrete, epoxy countertops, pool decks, patios, driveways.

Use web search for real pricing data. Return structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            pricing_data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  low_per_sqft: { type: 'number' },
                  avg_per_sqft: { type: 'number' },
                  high_per_sqft: { type: 'number' },
                  unit: { type: 'string' },
                  regional_notes: { type: 'string' },
                  factors: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            package_tiers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tier: { type: 'string' },
                  name: { type: 'string' },
                  price_range: { type: 'string' },
                  features: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      });
      setPricing(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setPricingScan(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={scanTop20}
          disabled={scanning}
          className="flex items-center gap-3 rounded-xl border-2 border-rose-300 bg-rose-50 p-4 hover:border-rose-500 disabled:opacity-50"
        >
          <Radar className={`h-8 w-8 ${scanning ? 'text-rose-400 animate-pulse' : 'text-rose-600'}`} />
          <div className="text-left">
            <h4 className="text-sm font-bold text-stone-900">Scan Top 20 Competitors</h4>
            <p className="text-xs text-stone-500">Analyze SEO, pricing, USPs, weaknesses</p>
          </div>
        </button>
        <button
          onClick={scanPricing}
          disabled={pricingScan}
          className="flex items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 hover:border-amber-500 disabled:opacity-50"
        >
          <DollarSign className={`h-8 w-8 ${pricingScan ? 'text-amber-400 animate-pulse' : 'text-amber-600'}`} />
          <div className="text-left">
            <h4 className="text-sm font-bold text-stone-900">Pricing Intelligence</h4>
            <p className="text-xs text-stone-500">Real-time pricing across all services & regions</p>
          </div>
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Competitor Results */}
      {competitors?.competitors && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-stone-700">Top 20 Epoxy Competitors</h4>
          {competitors.competitors.map((c) => (
            <div key={c.rank} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-400">#{c.rank}</span>
                  <h5 className="text-sm font-bold text-stone-900">{c.company_name}</h5>
                  {c.website && <a href={c.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline text-xs"><Globe className="h-3 w-3 inline" /></a>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600">SEO: {c.seo_strength}/100</span>
                  <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">{c.pricing_tier}</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-1"><Target className="h-3 w-3 inline mr-1" />{c.usp}</p>
              {c.weaknesses?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.weaknesses.map((w, i) => (
                    <span key={i} className="text-[10px] bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 text-rose-600">{w}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pricing Results */}
      {pricing?.pricing_data && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-stone-700">Pricing Intelligence</h4>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Service</th>
                  <th className="text-right py-2 px-3 font-semibold text-stone-600">Low</th>
                  <th className="text-right py-2 px-3 font-semibold text-stone-600">Avg</th>
                  <th className="text-right py-2 px-3 font-semibold text-stone-600">High</th>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Unit</th>
                </tr>
              </thead>
              <tbody>
                {pricing.pricing_data.map((p, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="py-2 px-3 text-stone-700">{p.service}</td>
                    <td className="py-2 px-3 text-right text-stone-600">${p.low_per_sqft}</td>
                    <td className="py-2 px-3 text-right font-bold text-amber-600">${p.avg_per_sqft}</td>
                    <td className="py-2 px-3 text-right text-stone-600">${p.high_per_sqft}</td>
                    <td className="py-2 px-3 text-stone-500">{p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pricing.package_tiers?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pricing.package_tiers.map((t, i) => (
                <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
                  <h5 className="text-sm font-bold text-stone-900">{t.name}</h5>
                  <p className="text-xs text-amber-600 font-bold">{t.price_range}</p>
                  <ul className="mt-2 space-y-1">
                    {t.features?.map((f, j) => <li key={j} className="text-[10px] text-stone-600">✓ {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}