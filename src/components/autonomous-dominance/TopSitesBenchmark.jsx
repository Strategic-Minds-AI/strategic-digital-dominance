import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Radar, Loader2, Trophy, Globe, Sparkles, TrendingUp, ExternalLink } from 'lucide-react';

const SCAN_CATEGORIES = [
  { id: 'best website templates 2026', label: 'Top Website Templates', icon: Globe },
  { id: 'top website design agencies 2026', label: 'Top Design Agencies', icon: Sparkles },
  { id: 'best marketing companies 2026', label: 'Top Marketing Companies', icon: TrendingUp },
  { id: 'best funnel builders 2026', label: 'Top Funnel Builders', icon: Radar },
  { id: 'top social media marketing agencies 2026', label: 'Top Social Media Agencies', icon: Trophy },
  { id: 'top branding agencies 2026', label: 'Top Branding Agencies', icon: Sparkles },
];

export default function TopSitesBenchmark() {
  const [scanning, setScanning] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ['benchmark-status'],
    queryFn: async () => (await base44.functions.invoke('topSitesBenchmarkScanner', { action: 'status' })).data,
    refetchInterval: 10000,
  });

  const { data: companies } = useQuery({
    queryKey: ['benchmark-companies'],
    queryFn: async () => (await base44.functions.invoke('topSitesBenchmarkScanner', { action: 'list', limit: 50 })).data,
    refetchInterval: 10000,
  });

  const handleScan = async (category) => {
    setScanning(category);
    setError(null);
    setScanResult(null);
    try {
      const res = await base44.functions.invoke('topSitesBenchmarkScanner', { action: 'scan', category, max_results: 20 });
      setScanResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['benchmark-status'] });
      queryClient.invalidateQueries({ queryKey: ['benchmark-companies'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setScanning(null);
    }
  };

  const stats = status || {};
  const companyList = companies?.companies || [];

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-stone-900">{stats.total_companies || 0}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Total Benchmarks</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-amber-600">{stats.top_20_count || 0}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Top 20</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-green-600">{stats.avg_benchmark_score || 0}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Avg Score</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
          <p className="text-2xl font-black text-violet-600">{Object.keys(stats.by_category || {}).length}</p>
          <p className="text-[10px] font-bold text-stone-500 uppercase">Categories</p>
        </div>
      </div>

      {/* Scan Categories */}
      <div>
        <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Radar className="h-4 w-4 text-amber-600" /> Scan Top Sites (Cloud Browser Powered)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SCAN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleScan(cat.id)}
                disabled={scanning === cat.id}
                className="rounded-xl border-2 border-stone-200 bg-white p-3 text-left hover:border-amber-500 transition disabled:opacity-50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-bold text-stone-900">{cat.label}</p>
                </div>
                <p className="text-[10px] text-stone-500">{scanning === cat.id ? 'Scanning top 20...' : 'Find & ingest top 20'}</p>
                {scanning === cat.id && <Loader2 className="h-3 w-3 animate-spin text-amber-500 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {scanResult && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-bold text-green-700">✓ Scanned {scanResult.scanned} sites — Ingested {scanResult.ingested} companies</p>
        </div>
      )}

      {/* Benchmark Companies List */}
      <div>
        <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-600" /> Benchmark Companies ({companyList.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {companyList.map((c) => (
            <div key={c.company_id} className="rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-stone-900 truncate flex-1">{c.company_name}</p>
                {c.is_top_20 && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold ml-1">TOP 20</span>}
              </div>
              <a href={c.url} target="_blank" rel="noopener" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                <ExternalLink className="h-2.5 w-2.5" /> {c.url?.slice(0, 40)}
              </a>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">{c.category}</span>
                <span className="text-[10px] text-stone-500">Score: {c.benchmark_score}</span>
              </div>
            </div>
          ))}
          {companyList.length === 0 && <p className="text-xs text-stone-400 col-span-full text-center py-4">No benchmarks yet. Run a scan above to ingest top companies.</p>}
        </div>
      </div>
    </div>
  );
}