import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Eye, FileText, Trash2, Layers } from "lucide-react";
import SectionEditor, { SECTION_TYPES } from "./SectionEditor";

const genId = () => Math.random().toString(36).slice(2, 9);

export default function PageBuilder() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const { data: pages, isLoading } = useQuery({
    queryKey: ["dynamicPages"],
    queryFn: () => base44.entities.DynamicPage.list("-created_date", 50),
  });

  const selected = pages?.find((p) => p.id === selectedId) || null;

  const createPage = async () => {
    const page = await base44.entities.DynamicPage.create({
      title: "New Page",
      slug: `new-page-${Date.now()}`,
      sections: [],
      status: "draft",
      is_public: true,
    });
    qc.invalidateQueries({ queryKey: ["dynamicPages"] });
    setSelectedId(page.id);
  };

  const updateField = (key, val) => {
    if (!selected) return;
    qc.setQueryData(["dynamicPages"], (old) => old?.map((p) => p.id === selected.id ? { ...p, [key]: val } : p));
  };

  const addSection = (type) => {
    const newSection = { id: genId(), type, props: {} };
    const updated = [...(selected.sections || []), newSection];
    updateField("sections", updated);
    setShowAdd(false);
  };

  const updateSection = (idx, section) => {
    const updated = [...(selected.sections || [])];
    updated[idx] = section;
    updateField("sections", updated);
  };

  const removeSection = (idx) => {
    updateField("sections", (selected.sections || []).filter((_, i) => i !== idx));
  };

  const moveSection = (idx, dir) => {
    const arr = [...(selected.sections || [])];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    updateField("sections", arr);
  };

  const savePage = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const cleanedSections = (selected.sections || []).map((s) => {
        const props = { ...s.props };
        for (const [k, v] of Object.entries(props)) {
          if (typeof v === "string" && ["images", "items", "fields"].includes(k)) {
            try { props[k] = JSON.parse(v); } catch {}
          }
        }
        return { ...s, props };
      });
      await base44.entities.DynamicPage.update(selected.id, { ...selected, sections: cleanedSections });
      qc.invalidateQueries({ queryKey: ["dynamicPages"] });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const deletePage = async (page) => {
    await base44.entities.DynamicPage.delete(page.id);
    qc.invalidateQueries({ queryKey: ["dynamicPages"] });
    if (selectedId === page.id) setSelectedId(null);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Page list */}
      <div className="space-y-2">
        <button onClick={createPage} className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 text-white text-sm font-bold py-2.5 hover:bg-amber-500 hover:text-stone-950 transition">
          <Plus className="h-4 w-4" /> New Page
        </button>
        {(pages || []).map((p) => (
          <div key={p.id} className={`group flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition ${selectedId === p.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`} onClick={() => setSelectedId(p.id)}>
            <FileText className="h-4 w-4 text-stone-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-stone-900 truncate">{p.title}</div>
              <div className="text-xs text-stone-400 truncate font-mono">/p/{p.slug}</div>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>{(p.status || "").toUpperCase()}</span>
            <button onClick={(e) => { e.stopPropagation(); deletePage(p); }} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {(!pages || pages.length === 0) && <p className="text-xs text-stone-400 text-center py-4">No pages yet</p>}
      </div>

      {/* Editor */}
      <div className="lg:col-span-2 space-y-4">
        {selected ? (
          <>
            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-stone-500 block mb-1">Title</label><input value={selected.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-bold text-stone-500 block mb-1">Slug</label><input value={selected.slug} onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm font-mono" /></div>
                <div><label className="text-xs font-bold text-stone-500 block mb-1">SEO Title</label><input value={selected.seo_title || ""} onChange={(e) => updateField("seo_title", e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" /></div>
                <div><label className="text-xs font-bold text-stone-500 block mb-1">Status</label><select value={selected.status} onChange={(e) => updateField("status", e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={savePage} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Page"}</button>
                <a href={`/p/${selected.slug}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm font-bold text-stone-700 hover:border-stone-300"><Eye className="h-4 w-4" /> Preview</a>
                <span className="text-xs text-stone-400">Live at /p/{selected.slug}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2"><Layers className="h-4 w-4 text-amber-500" /> Sections ({(selected.sections || []).length})</h3>
              <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"><Plus className="h-3.5 w-3.5" /> Add Section</button>
            </div>

            {showAdd && (
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-stone-200 p-3 bg-stone-50">
                {SECTION_TYPES.map((s) => (
                  <button key={s.type} onClick={() => addSection(s.type)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:border-amber-400 hover:bg-amber-50 transition">{s.label}</button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {(selected.sections || []).map((section, idx) => (
                <SectionEditor key={section.id || idx} section={section} onChange={(s) => updateSection(idx, s)} onRemove={() => removeSection(idx)} onMove={(d) => moveSection(idx, d)} canUp={idx > 0} canDown={idx < (selected.sections || []).length - 1} />
              ))}
              {(!selected.sections || selected.sections.length === 0) && <p className="text-xs text-stone-400 text-center py-8">No sections yet. Click "Add Section" to start building.</p>}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <FileText className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">Select a page to edit, or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}