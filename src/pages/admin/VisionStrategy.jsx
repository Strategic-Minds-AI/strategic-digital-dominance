import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Compass, Building2, Cog, DollarSign, Swords, Tag, Rocket, Cpu, Shield, Target, FileText, Plus, Save, X, Loader2 } from 'lucide-react';

const DOC_TYPES = [
  { value: 'vision', label: 'Vision', icon: Eye, color: 'border-purple-500 bg-purple-50 text-purple-700' },
  { value: 'mission', label: 'Mission', icon: Target, color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'architecture', label: 'Architecture', icon: Building2, color: 'border-stone-700 bg-stone-100 text-stone-700' },
  { value: 'automation', label: 'Automation Strategy', icon: Cog, color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'financial', label: 'Financial Strategy', icon: DollarSign, color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'competition', label: 'Competition Strategy', icon: Swords, color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'pricing', label: 'Pricing Strategy', icon: Tag, color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'growth', label: 'Growth Strategy', icon: Rocket, color: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'technology', label: 'Technology', icon: Cpu, color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
  { value: 'compliance', label: 'Compliance', icon: Shield, color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'go_to_market', label: 'Go To Market', icon: Rocket, color: 'border-pink-500 bg-pink-50 text-pink-700' },
  { value: 'operating_model', label: 'Operating Model', icon: Building2, color: 'border-stone-600 bg-stone-100 text-stone-700' },
];

export default function VisionStrategy() {
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'vision', content: '', summary: '', key_objectives: [], status: 'active', tags: [] });
  const queryClient = useQueryClient();

  const { data: docs } = useQuery({
    queryKey: ['strategy-docs'],
    queryFn: () => base44.entities.StrategyDocument.list('-updated_date'),
  });

  const openNew = (type) => {
    setEditing(null);
    setForm({ title: '', type, content: '', summary: '', key_objectives: [], status: 'active', tags: [] });
    setShowEditor(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({ title: doc.title, type: doc.type, content: doc.content, summary: doc.summary, key_objectives: doc.key_objectives || [], status: doc.status, tags: doc.tags || [] });
    setShowEditor(true);
  };

  const generateDoc = async () => {
    if (!form.type) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('aiAssist', {
        action: 'chat',
        message: `Generate a comprehensive ${form.type} document for EpoxyGarageFloorEstimates.com — a scalable website factory and SaaS platform for garage floor coating contractors. Include vision, key objectives, strategies, and actionable steps. Format as markdown.`,
      });
      const data = res.data || res;
      const content = data.result?.response || '';
      setForm((f) => ({ ...f, content, title: f.title || `${form.type.charAt(0).toUpperCase() + form.type.slice(1).replace('_', ' ')} Document` }));
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!form.title || !form.content) return;
    if (editing) {
      await base44.entities.StrategyDocument.update(editing.id, form);
    } else {
      await base44.entities.StrategyDocument.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ['strategy-docs'] });
    setShowEditor(false);
    setEditing(null);
  };

  const remove = async (doc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    await base44.entities.StrategyDocument.delete(doc.id);
    queryClient.invalidateQueries({ queryKey: ['strategy-docs'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Vision, Strategy & Architecture</h1>
        <p className="text-sm text-stone-500 mt-1">Strategy documents that power simulations and guide the AI assistant</p>
      </div>

      {/* Document Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {DOC_TYPES.map((dt) => {
          const count = (docs || []).filter((d) => d.type === dt.value).length;
          return (
            <button
              key={dt.value}
              onClick={() => openNew(dt.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition hover:scale-105 ${dt.color}`}
            >
              <dt.icon className="h-7 w-7" />
              <span className="text-xs font-bold">{dt.label}</span>
              <span className="text-[10px] opacity-70">{count} docs</span>
            </button>
          );
        })}
      </div>

      {/* Existing Documents */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-stone-800">All Documents ({docs?.length || 0})</h2>
        {(docs || []).map((doc) => {
          const dt = DOC_TYPES.find((d) => d.value === doc.type) || DOC_TYPES[0];
          return (
            <div key={doc.id} className={`rounded-xl border-2 p-4 ${dt.color}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <dt.icon className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">{dt.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      {doc.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900">{doc.title}</h3>
                  {doc.summary && <p className="text-xs text-stone-600 mt-1 line-clamp-2">{doc.summary}</p>}
                  {doc.key_objectives && doc.key_objectives.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {doc.key_objectives.slice(0, 3).map((o, i) => (
                        <span key={i} className="text-[10px] bg-white/60 px-2 py-0.5 rounded">{o}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(doc)} className="rounded-lg p-1.5 text-stone-600 hover:bg-white/50">
                    <FileText className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(doc)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {(!docs || docs.length === 0) && (
          <p className="text-sm text-stone-400 text-center py-8">No strategy documents yet. Click a type above to create one.</p>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEditor(false)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">{editing ? 'Edit' : 'New'} {DOC_TYPES.find((d) => d.value === form.type)?.label}</h3>
              <button onClick={() => setShowEditor(false)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500">TITLE</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Document title..."
                  className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500">SUMMARY</label>
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="One-line summary..."
                  className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-500">CONTENT (MARKDOWN)</label>
                  <button
                    onClick={generateDoc}
                    disabled={generating}
                    className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                    AI Generate
                  </button>
                </div>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full document content in markdown..."
                  rows={12}
                  className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500">KEY OBJECTIVES (comma-separated)</label>
                <input
                  type="text"
                  value={form.key_objectives.join(', ')}
                  onChange={(e) => setForm({ ...form, key_objectives: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Objective 1, Objective 2, ..."
                  className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500">STATUS</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <button
                onClick={save}
                disabled={!form.title || !form.content}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:brightness-110 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}