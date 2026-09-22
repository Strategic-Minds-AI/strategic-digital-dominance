import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Radar, Loader2, Play, Pause, Building2, Home, Landmark, Factory, MapPin } from 'lucide-react';

const CONTRACTOR_TYPES = [
  { id: 'residential', label: 'Residential Contractors', icon: Home, desc: 'Home garage floors, basements, patios' },
  { id: 'commercial', label: 'Commercial Contractors', icon: Building2, desc: 'Warehouses, retail, restaurants, offices' },
  { id: 'government', label: 'Government/Military', icon: Landmark, desc: 'Military bases, municipal, federal projects' },
  { id: 'industrial', label: 'Industrial', icon: Factory, desc: 'Manufacturing, food processing, pharma' },
];

export default function NationalContractorScraper() {
  const [scraping, setScraping] = useState(false);
  const [activeTypes, setActiveTypes] = useState(['residential', 'commercial']);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const { data: contractors } = useQuery({
    queryKey: ['national-contractors'],
    queryFn: () => base44.entities.ContractorRecord.list('-created_date', 50),
  });

  const toggleType = (id) => {
    setActiveTypes((prev) => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const scrape = async () => {
    setScraping(true);
    setError(null);
    setResults(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a national contractor discovery engine. Find epoxy and concrete polishing contractors across the USA.

Target contractor types: ${activeTypes.join(', ')}

For each contractor found, provide:
- company_name
- phone
- email (if available)
- website
- city, state
- contractor_type (residential/commercial/government/industrial)
- services_offered (array)
- estimated_revenue_range

Find 20 real companies. Use web search to find actual businesses.

Return structured JSON with a "contractors" array.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            contractors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  website: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  contractor_type: { type: 'string' },
                  services_offered: { type: 'array', items: { type: 'string' } },
                  estimated_revenue_range: { type: 'string' },
                },
              },
            },
            total_found: { type: 'integer' },
            search_coverage: { type: 'string' },
          },
        },
      });
      setResults(res);

      // Save to ContractorRecord entity
      if (res.contractors?.length) {
        await base44.entities.ContractorRecord.bulkCreate(
          res.contractors.slice(0, 20).map((c) => ({
            company_name: c.company_name,
            phone: c.phone,
            email: c.email,
            website: c.website,
            city: c.city,
            state: c.state,
            contractor_type: c.contractor_type,
            services_offered: c.services_offered,
          }))
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Passive National Scraper</h3>
          <p className="text-sm text-stone-500">Cloud-browser-powered scraping of every epoxy contractor in the USA</p>
        </div>
        <button
          onClick={scrape}
          disabled={scraping || activeTypes.length === 0}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
          {scraping ? 'Scraping...' : 'Start Scraping'}
        </button>
      </div>

      {/* Type Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CONTRACTOR_TYPES.map((type) => {
          const Icon = type.icon;
          const active = activeTypes.includes(type.id);
          return (
            <button
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                active ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <Icon className={`h-6 w-6 mb-2 ${active ? 'text-emerald-600' : 'text-stone-400'}`} />
              <h4 className="text-sm font-bold text-stone-900">{type.label}</h4>
              <p className="text-[10px] text-stone-500 mt-0.5">{type.desc}</p>
            </button>
          );
        })}
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-sm font-bold text-stone-900">{results.total_found || results.contractors?.length} contractors found</p>
            <p className="text-xs text-stone-500">Coverage: {results.search_coverage}</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Company</th>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Location</th>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Phone</th>
                  <th className="text-left py-2 px-3 font-semibold text-stone-600">Website</th>
                </tr>
              </thead>
              <tbody>
                {(results.contractors || []).slice(0, 20).map((c, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="py-2 px-3 font-medium text-stone-900">{c.company_name}</td>
                    <td className="py-2 px-3"><span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">{c.contractor_type}</span></td>
                    <td className="py-2 px-3 text-stone-600"><MapPin className="h-3 w-3 inline mr-1" />{c.city}, {c.state}</td>
                    <td className="py-2 px-3 text-stone-600">{c.phone}</td>
                    <td className="py-2 px-3 text-stone-600">{c.website ? <a href={c.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline">Visit</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Existing contractors */}
      {contractors?.length > 0 && !results && (
        <div>
          <h4 className="text-sm font-bold text-stone-700 mb-2">Previously Scraped ({contractors.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {contractors.slice(0, 10).map((c) => (
              <div key={c.id} className="rounded-lg border border-stone-200 bg-white p-3">
                <p className="text-sm font-bold text-stone-900">{c.company_name}</p>
                <p className="text-xs text-stone-500">{c.city}, {c.state} · {c.contractor_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}