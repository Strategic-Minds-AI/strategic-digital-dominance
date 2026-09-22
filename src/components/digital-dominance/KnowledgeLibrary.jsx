import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Gift, BookOpen, Lightbulb, Sparkles, Brain, Layout, Wand2, FileText, Loader2, Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'templates', name: 'Templates', icon: Layout, desc: 'Website, email, SMS, proposal templates' },
  { id: 'ai_tools', name: 'AI Tools', icon: Sparkles, desc: 'Free AI tools and generators' },
  { id: 'strategies', name: 'Strategies', icon: Brain, desc: 'Business growth strategies' },
  { id: 'prompts', name: 'Prompt Library', icon: Wand2, desc: '50+ proven prompts for every use case' },
  { id: 'tips', name: 'Tips & Tricks', icon: Lightbulb, desc: 'Industry tips and best practices' },
  { id: 'intelligence', name: 'Intelligence', icon: FileText, desc: 'Market intelligence reports' },
  { id: 'catalog', name: 'Catalog', icon: BookOpen, desc: 'Product and service catalog' },
];

export default function KnowledgeLibrary() {
  const [activeCategory, setActiveCategory] = useState('templates');
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState(null);

  const { data: tools } = useQuery({
    queryKey: ['knowledge-tools'],
    queryFn: () => base44.entities.ToolRegistry.filter({ is_active: true }, 'sort_order', 30),
  });

  const { data: intel } = useQuery({
    queryKey: ['knowledge-intel'],
    queryFn: () => base44.entities.IntelligenceReport.list('-created_date', 10),
  });

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setGenerated(null);
    try {
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive ${cat.name} resource for the epoxy/concrete polishing industry. Include practical, actionable content that a contractor can use immediately.

Category: ${cat.name}
Description: ${cat.desc}

Provide 5-10 high-quality items with titles, descriptions, and actionable content.`,
        response_json_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  content: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      });
      setGenerated(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const filteredItems = generated?.items?.filter(item =>
    !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-violet-600" />
          <div>
            <h4 className="text-sm font-bold text-stone-900">Free Knowledge Library</h4>
            <p className="text-xs text-stone-500">Templates, AI tools, strategies, prompts, tips & intelligence — all free</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setGenerated(null); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                active ? 'bg-violet-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Search + Generate */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${CATEGORIES.find(c => c.id === activeCategory)?.name}...`}
            className="w-full rounded-lg border border-stone-200 pl-10 pr-3 py-2 text-sm focus:border-violet-500 outline-none"
          />
        </div>
        <button onClick={generate} disabled={generating} className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Generated Items */}
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900">{item.title}</h5>
              <p className="text-xs text-stone-500 mt-1">{item.description}</p>
              <p className="text-xs text-stone-700 mt-2 line-clamp-3">{item.content}</p>
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((t, j) => <span key={j} className="text-[10px] bg-violet-100 rounded px-1.5 py-0.5 text-violet-700">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Resources */}
      {!generated && activeCategory === 'ai_tools' && tools?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tools.slice(0, 10).map((t) => (
            <div key={t.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900">{t.name}</h5>
              <p className="text-xs text-stone-500">{t.description}</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mt-2 inline-block">FREE</span>
            </div>
          ))}
        </div>
      )}

      {!generated && activeCategory === 'intelligence' && intel?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {intel.map((r) => (
            <div key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900">{r.title}</h5>
              <p className="text-xs text-stone-500 line-clamp-2">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}