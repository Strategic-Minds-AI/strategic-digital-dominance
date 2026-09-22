import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Layout, Rocket, Loader2, Eye, Sparkles, Globe } from 'lucide-react';

const TEMPLATE_TYPES = [
  { id: 'funnel', label: 'Lead Funnel', desc: 'Multi-step conversion funnel' },
  { id: 'landing_page', label: 'Landing Page', desc: 'Single high-conversion page' },
  { id: 'full_site', label: 'Full Website', desc: 'Complete multi-page site' },
  { id: 'service_page', label: 'Service Page', desc: 'SEO-optimized service page' },
  { id: 'location_page', label: 'Location Page', desc: 'City/region landing page' },
  { id: 'gallery', label: 'Gallery Page', desc: 'Visual project showcase' },
  { id: 'about', label: 'About Page', desc: 'Company story & team' },
  { id: 'contact', label: 'Contact Page', desc: 'Lead capture contact' },
];

const INDUSTRIES = [
  'epoxy_flooring', 'concrete_polishing', 'decorative_concrete', 'countertops',
  'pool_decks', 'patios', 'driveways', 'garage_floors', 'commercial_flooring',
  'industrial_flooring', 'general_contractor', 'plumbing', 'hvac', 'roofing',
  'electrician', 'landscaping', 'painting', 'cleaning', 'real_estate', 'restaurant',
];

export default function WebsiteTemplateGallery() {
  const [selectedType, setSelectedType] = useState('full_site');
  const [selectedIndustry, setSelectedIndustry] = useState('epoxy_flooring');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState(null);

  const { data: templates } = useQuery({
    queryKey: ['website-templates-gallery'],
    queryFn: () => base44.entities.WebsiteTemplate.list('-created_date', 30),
  });

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setGenerated(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete website specification for a ${selectedType.replace(/_/g, ' ')} in the ${selectedIndustry.replace(/_/g, ' ')} industry.

Include:
1. Page structure and sections
2. Hero content (headline, subheadline, CTA)
3. SEO metadata (title, description, keywords)
4. Content for each section
5. Color scheme recommendations
6. Conversion elements
7. Mobile considerations
8. Google-recommended technical specs (schema, Core Web Vitals, semantic HTML)

Return structured JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            template_name: { type: 'string' },
            type: { type: 'string' },
            industry: { type: 'string' },
            pages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  page_name: { type: 'string' },
                  sections: { type: 'array', items: { type: 'string' } },
                  hero_headline: { type: 'string' },
                  hero_subheadline: { type: 'string' },
                  cta: { type: 'string' },
                },
              },
            },
            seo: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                keywords: { type: 'array', items: { type: 'string' } },
                schema_type: { type: 'string' },
              },
            },
            color_scheme: {
              type: 'object',
              properties: {
                primary: { type: 'string' },
                secondary: { type: 'string' },
                accent: { type: 'string' },
                background: { type: 'string' },
              },
            },
            conversion_elements: { type: 'array', items: { type: 'string' } },
            google_specs: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setGenerated(res);

      // Save to entity
      await base44.entities.WebsiteTemplate.create({
        template_id: `TPL-${Date.now()}`,
        name: res.template_name || `${selectedType} - ${selectedIndustry}`,
        category: selectedIndustry,
        description: `Auto-generated ${selectedType} template for ${selectedIndustry}`,
        template_type: selectedType,
        is_active: true,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Type Selectors */}
      <div>
        <h4 className="text-xs font-bold text-stone-500 mb-2">TEMPLATE TYPE</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TEMPLATE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`rounded-lg border-2 p-3 text-left transition ${
                selectedType === t.id ? 'border-violet-500 bg-violet-50' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <Layout className={`h-4 w-4 mb-1 ${selectedType === t.id ? 'text-violet-600' : 'text-stone-400'}`} />
              <p className="text-xs font-bold text-stone-900">{t.label}</p>
              <p className="text-[10px] text-stone-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Industry Selector */}
      <div>
        <h4 className="text-xs font-bold text-stone-500 mb-2">INDUSTRY</h4>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedIndustry === ind ? 'bg-violet-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {ind.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={generating} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? 'Generating Template...' : 'Generate Template'}
      </button>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Generated Template */}
      {generated && (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <h4 className="text-sm font-bold text-stone-900">{generated.template_name}</h4>
            <p className="text-xs text-stone-500">{generated.type} · {generated.industry}</p>
          </div>
          {generated.pages?.map((page, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900">{page.page_name}</h5>
              {page.hero_headline && <p className="text-sm text-stone-700 mt-1">{page.hero_headline}</p>}
              {page.hero_subheadline && <p className="text-xs text-stone-500">{page.hero_subheadline}</p>}
              {page.sections && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {page.sections.map((s, j) => <span key={j} className="text-[10px] bg-stone-100 rounded px-1.5 py-0.5 text-stone-600">{s}</span>)}
                </div>
              )}
            </div>
          ))}
          {generated.color_scheme && (
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-xs font-bold text-stone-500 mb-2">COLOR SCHEME</h5>
              <div className="flex gap-2">
                {Object.entries(generated.color_scheme).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <div className="h-12 w-12 rounded-lg border border-stone-200" style={{ backgroundColor: v }} />
                    <p className="text-[10px] text-stone-500 mt-1">{k}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {generated.google_specs?.length > 0 && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <h5 className="text-xs font-bold text-green-700 mb-2"><Globe className="h-3 w-3 inline mr-1" />GOOGLE RECOMMENDED SPECS</h5>
              <ul className="space-y-1">
                {generated.google_specs.map((s, i) => <li key={i} className="text-xs text-stone-600">✓ {s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Existing Templates */}
      {templates?.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-stone-700 mb-2">Saved Templates ({templates.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {templates.slice(0, 12).map((t) => (
              <div key={t.id} className="rounded-lg border border-stone-200 bg-white p-3">
                <p className="text-xs font-bold text-stone-900 truncate">{t.name}</p>
                <p className="text-[10px] text-stone-500">{t.category?.replace(/_/g, ' ')}</p>
                <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded mt-1 inline-block">{t.template_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}