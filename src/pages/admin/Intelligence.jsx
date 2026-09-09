import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radar, Globe, Users, Building2, Landmark, Loader2, Sparkles, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const SERVICE_CATEGORIES = [
  'epoxy_flooring', 'decorative_concrete', 'stained_concrete', 'countertops',
  'epoxy_countertops', 'sealed_concrete', 'walkways', 'driveways', 'patios',
  'pool_decks', 'garages', 'bathroom_vanity', 'epoxy_art', 'installation_training',
  'franchise_ownership',
];

const SECTORS = ['residential', 'commercial', 'government', 'all'];

export default function Intelligence() {
  const [serviceCategory, setServiceCategory] = useState('epoxy_flooring');
  const [sector, setSector] = useState('all');
  const [gathering, setGathering] = useState(false);
  const [currentIntel, setCurrentIntel] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const queryClient = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ['intel-reports'],
    queryFn: () => base44.entities.IntelligenceReport.list('-created_date', 50),
  });

  const gather = async () => {
    setGathering(true);
    setCurrentIntel(null);
    try {
      const res = await base44.functions.invoke('aiAssist', {
        action: 'gatherIntelligence',
        serviceCategory,
        sector,
      });
      const data = res.data || res;
      setCurrentIntel(data.intelligence);
      queryClient.invalidateQueries({ queryKey: ['intel-reports'] });
    } catch (e) {
      console.error(e);
      setCurrentIntel({ error: e.message });
    } finally {
      setGathering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Intelligence Center</h1>
        <p className="text-sm text-stone-500 mt-1">Industry research, competitor analysis, customer sentiment, and market trends</p>
      </div>

      {/* Gather Intelligence Panel */}
      <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-bold text-stone-900">Gather New Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-500">SERVICE CATEGORY</label>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
            >
              {SERVICE_CATEGORIES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500">SECTOR</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={gather}
              disabled={gathering}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:brightness-110 disabled:opacity-50 w-full justify-center"
            >
              {gathering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {gathering ? 'Gathering...' : 'Gather Intelligence'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Intelligence Result */}
      {currentIntel && !currentIntel.error && (
        <div className="space-y-4">
          {currentIntel.market_state && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="font-bold text-stone-900 mb-2">Market State</h3>
              <p className="text-sm text-stone-700">{currentIntel.market_state}</p>
              {currentIntel.market_size && <p className="text-xs text-stone-500 mt-2">Market Size: {currentIntel.market_size}</p>}
              {currentIntel.growth_rate && <p className="text-xs text-stone-500">Growth Rate: {currentIntel.growth_rate}</p>}
            </div>
          )}

          {currentIntel.pricing && currentIntel.pricing.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-stone-900">Pricing Analysis</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 px-3 font-semibold text-stone-600">Service</th>
                      <th className="text-right py-2 px-3 font-semibold text-stone-600">Low</th>
                      <th className="text-right py-2 px-3 font-semibold text-stone-600">Avg</th>
                      <th className="text-right py-2 px-3 font-semibold text-stone-600">High</th>
                      <th className="text-left py-2 px-3 font-semibold text-stone-600">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentIntel.pricing.map((p, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        <td className="py-2 px-3 text-stone-700">{p.service}</td>
                        <td className="py-2 px-3 text-right text-stone-600">${p.low}</td>
                        <td className="py-2 px-3 text-right font-bold text-amber-600">${p.avg}</td>
                        <td className="py-2 px-3 text-right text-stone-600">${p.high}</td>
                        <td className="py-2 px-3 text-stone-500">{p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentIntel.sentiment && currentIntel.sentiment.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-stone-900">Customer Sentiment by Demographic</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentIntel.sentiment.map((s, i) => (
                  <div key={i} className="rounded-xl border border-stone-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-stone-800">{s.demographic}</span>
                      <span className="text-xs font-bold text-amber-600">Buying Signal: {s.buying_signal}/100</span>
                    </div>
                    {s.psychographic && <p className="text-[10px] text-stone-500 mb-2">Archetype: {s.psychographic}</p>}
                    <div className="space-y-1">
                      {s.positive && s.positive.slice(0, 3).map((p, j) => (
                        <p key={j} className="text-xs text-green-600 flex items-start gap-1">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" /> {p}
                        </p>
                      ))}
                      {s.negative && s.negative.slice(0, 3).map((n, j) => (
                        <p key={j} className="text-xs text-red-500 flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" /> {n}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentIntel.trends && currentIntel.trends.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-stone-900">Trend Forecast</h3>
              </div>
              <div className="space-y-2">
                {currentIntel.trends.map((t, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-stone-100 p-3">
                    <div>
                      <span className="text-sm font-medium text-stone-700">{t.metric}</span>
                      <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${t.direction === 'up' ? 'bg-green-100 text-green-700' : t.direction === 'down' ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>
                        {t.direction}
                      </span>
                    </div>
                    <div className="text-right text-xs text-stone-500">
                      <p>1yr: {t.prediction_1yr}</p>
                      <p>3yr: {t.prediction_3yr}</p>
                      <p>5yr: {t.prediction_5yr}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentIntel.opportunities && currentIntel.opportunities.length > 0 && (
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-6">
              <h3 className="font-bold text-stone-900 mb-3">Market Opportunities</h3>
              <ul className="space-y-2">
                {currentIntel.opportunities.map((o, i) => (
                  <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentIntel.government_opportunities && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-stone-900">Government Contracting</h3>
              </div>
              <p className="text-sm text-stone-700">{currentIntel.government_opportunities}</p>
            </div>
          )}
        </div>
      )}

      {currentIntel?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Error: {currentIntel.error}
        </div>
      )}

      {/* Saved Reports */}
      <div>
        <h2 className="text-lg font-bold text-stone-800 mb-3">Saved Intelligence Reports ({reports?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(reports || []).map((r) => (
            <div key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase text-amber-600">{r.report_type.replace(/_/g, ' ')}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {r.status}
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm">{r.title}</h3>
              {r.summary && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{r.summary}</p>}
              <div className="flex gap-2 mt-2">
                {r.sector && <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">{r.sector}</span>}
                {r.pricing_data && r.pricing_data.length > 0 && <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded">{r.pricing_data.length} price points</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}