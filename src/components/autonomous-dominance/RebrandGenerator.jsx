import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Wand2, Loader2, Sparkles, CheckCircle2, Palette, TrendingUp } from 'lucide-react';

const INDUSTRIES = [
  'epoxy_flooring', 'concrete_polishing', 'general_contractor', 'plumbing', 'hvac',
  'roofing', 'electrician', 'landscaping', 'painting', 'cleaning',
  'real_estate', 'restaurant', 'automotive', 'beauty', 'fitness',
  'legal', 'medical', 'dental', 'financial', 'technology',
];

export default function RebrandGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newIndustry, setNewIndustry] = useState('epoxy_flooring');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [rebranding, setRebranding] = useState(false);
  const [rebrandResult, setRebrandResult] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ['rebrand-templates'],
    queryFn: async () => (await base44.functions.invoke('rebrandGenerator', { action: 'list', stage: 'categorized', limit: 50 })).data,
    refetchInterval: 5000,
  });

  const handleRebrand = async () => {
    if (!selectedTemplate) return;
    setRebranding(true);
    setError(null);
    setRebrandResult(null);
    try {
      const res = await base44.functions.invoke('rebrandGenerator', {
        action: 'rebrand',
        website_id: selectedTemplate,
        new_industry: newIndustry,
        new_company_name: newCompanyName || `Auto Brand ${newIndustry}`,
      });
      setRebrandResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['rebrand-templates'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setRebranding(false);
    }
  };

  const handleEnhance = async (websiteId) => {
    setRebranding(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('rebrandGenerator', { action: 'enhance', website_id: websiteId });
      setRebrandResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['rebrand-templates'] });
    } catch (e) {
      setError(e.message);
    } finally {
      setRebranding(false);
    }
  };

  const templateList = templates?.templates || [];

  return (
    <div className="space-y-4">
      {/* Template Gallery */}
      <div>
        <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Palette className="h-4 w-4 text-amber-600" /> Template Gallery — Select a Template to Rebrand</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {templateList.map((t) => (
            <button
              key={t.website_id}
              onClick={() => setSelectedTemplate(t.website_id)}
              className={`rounded-lg border-2 p-3 text-left transition ${
                selectedTemplate === t.website_id ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <p className="text-xs font-bold text-stone-900 truncate">{t.source_name}</p>
              <p className="text-[10px] text-stone-500">{t.industry} · {t.template_type}</p>
              {t.quality_score > 0 && <p className="text-[10px] text-amber-600 mt-1">Score: {t.quality_score}</p>}
              {t.color_palette?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {t.color_palette.slice(0, 4).map((c, i) => (
                    <div key={i} className="h-2.5 w-2.5 rounded border border-stone-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}
            </button>
          ))}
          {templateList.length === 0 && <p className="text-xs text-stone-400 col-span-full text-center py-4">No categorized templates yet. Ingest websites first.</p>}
        </div>
      </div>

      {/* Rebrand Controls */}
      {selectedTemplate && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2"><Wand2 className="h-4 w-4 text-amber-600" /> Rebrand Configuration</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600">Target Industry</label>
              <select value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)} className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm mt-1">
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600">New Company Name (optional)</label>
              <input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Auto-generated if blank" className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm mt-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRebrand} disabled={rebranding} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
              {rebranding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {rebranding ? 'Rebranding...' : 'Rebrand & Enhance'}
            </button>
            <button onClick={() => handleEnhance(selectedTemplate)} disabled={rebranding} className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 hover:border-amber-500 disabled:opacity-50">
              <TrendingUp className="h-4 w-4" /> Enhance Only
            </button>
          </div>
        </div>
      )}

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Rebrand Result */}
      {rebrandResult?.rebrand && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          <p className="text-sm font-bold text-green-700 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Rebrand Complete — {rebrandResult.rebrand.rebranded_name}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white p-2 border border-stone-200">
              <p className="text-[10px] font-bold text-stone-500 uppercase">Hero Headline</p>
              <p className="text-xs text-stone-900">{rebrandResult.rebrand.hero_headline}</p>
            </div>
            <div className="rounded-lg bg-white p-2 border border-stone-200">
              <p className="text-[10px] font-bold text-stone-500 uppercase">Primary CTA</p>
              <p className="text-xs text-stone-900">{rebrandResult.rebrand.primary_cta}</p>
            </div>
          </div>
          {rebrandResult.rebrand.color_scheme && (
            <div className="flex gap-2">
              {Object.entries(rebrandResult.rebrand.color_scheme).map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="h-10 w-10 rounded-lg border border-stone-200" style={{ backgroundColor: v }} />
                  <p className="text-[9px] text-stone-500 mt-1">{k}</p>
                </div>
              ))}
            </div>
          )}
          {rebrandResult.rebrand.sections?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-700 mb-1">Sections ({rebrandResult.rebrand.sections.length})</p>
              <div className="flex flex-wrap gap-1">
                {rebrandResult.rebrand.sections.map((s, i) => (
                  <span key={i} className="text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-600">{s.name}</span>
                ))}
              </div>
            </div>
          )}
          {rebrandResult.rebrand.conversion_enhancements?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-700 mb-1">Conversion Enhancements</p>
              <ul className="space-y-0.5">
                {rebrandResult.rebrand.conversion_enhancements.slice(0, 5).map((e, i) => (
                  <li key={i} className="text-[10px] text-stone-600">✓ {e}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs font-bold text-amber-600">Benchmark Score: {rebrandResult.rebrand.benchmark_score}</p>
        </div>
      )}
    </div>
  );
}