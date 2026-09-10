import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2, Code2, Power } from "lucide-react";

const TYPES = [
  { type: "css", label: "CSS", hint: "Inject stylesheet into <head>" },
  { type: "js", label: "JavaScript", hint: "Inject script into <body>" },
  { type: "html", label: "HTML", hint: "Render raw HTML on page" },
  { type: "meta", hint: "Add meta tags to <head>", label: "Meta Tags" },
];

const SCOPES = [
  { value: "global", label: "All Pages" },
  { value: "page", label: "Specific Page" },
  { value: "admin", label: "Admin Pages Only" },
];

const empty = { name: "", type: "css", content: "", scope: "global", page_path: "", position: "head", active: true, description: "" };

export default function CodeBlockManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["codeBlocks"],
    queryFn: () => base44.entities.CodeBlock.list("-created_date", 100),
  });

  const createBlock = () => setEditing({ ...empty });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await base44.entities.CodeBlock.update(editing.id, editing);
      } else {
        const created = await base44.entities.CodeBlock.create(editing);
        setEditing(created);
      }
      qc.invalidateQueries({ queryKey: ["codeBlocks"] });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const del = async (block) => {
    if (!confirm(`Delete "${block.name}"?`)) return;
    await base44.entities.CodeBlock.delete(block.id);
    qc.invalidateQueries({ queryKey: ["codeBlocks"] });
    if (editing?.id === block.id) setEditing(null);
  };

  const toggleActive = async (block) => {
    await base44.entities.CodeBlock.update(block.id, { active: !block.active });
    qc.invalidateQueries({ queryKey: ["codeBlocks"] });
  };

  const inputCls = "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none";

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* List */}
      <div className="space-y-2">
        <button onClick={createBlock} className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 text-white text-sm font-bold py-2.5 hover:bg-amber-500 hover:text-stone-950 transition">
          <Plus className="h-4 w-4" /> New Code Block
        </button>
        {(blocks || []).map((b) => (
          <div key={b.id} className={`group rounded-lg border p-3 cursor-pointer transition ${editing?.id === b.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`} onClick={() => setEditing(b)}>
            <div className="flex items-center gap-2">
              <Code2 className={`h-4 w-4 shrink-0 ${b.active ? "text-amber-500" : "text-stone-300"}`} />
              <span className="text-sm font-bold text-stone-900 truncate flex-1">{b.name}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleActive(b); }} className="p-1 rounded hover:bg-stone-100"><Power className={`h-3.5 w-3.5 ${b.active ? "text-green-500" : "text-stone-300"}`} /></button>
              <button onClick={(e) => { e.stopPropagation(); del(b); }} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold uppercase bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{b.type}</span>
              <span className="text-[9px] font-bold uppercase bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{b.scope}</span>
              {!b.active && <span className="text-[9px] font-bold text-stone-400">inactive</span>}
            </div>
          </div>
        ))}
        {(!blocks || blocks.length === 0) && <p className="text-xs text-stone-400 text-center py-4">No code blocks yet</p>}
      </div>

      {/* Editor */}
      <div className="lg:col-span-2">
        {editing ? (
          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-stone-500 block mb-1">Name</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} placeholder="Google Analytics" /></div>
              <div><label className="text-xs font-bold text-stone-500 block mb-1">Type</label><select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className={inputCls}>{TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}</select></div>
              <div><label className="text-xs font-bold text-stone-500 block mb-1">Scope</label><select value={editing.scope} onChange={(e) => setEditing({ ...editing, scope: e.target.value })} className={inputCls}>{SCOPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              {editing.scope === "page" && <div><label className="text-xs font-bold text-stone-500 block mb-1">Page Path</label><input value={editing.page_path} onChange={(e) => setEditing({ ...editing, page_path: e.target.value })} className={inputCls} placeholder="/about" /></div>}
            </div>
            <div><label className="text-xs font-bold text-stone-500 block mb-1">Description (optional)</label><input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></div>
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1">Code Content</label>
              <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={12} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm font-mono focus:border-amber-500 outline-none" placeholder={editing.type === "css" ? "/* custom styles */\n.hero { ... }" : editing.type === "js" ? "// custom script\nconsole.log('hello');" : editing.type === "html" ? "<div>Custom HTML</div>" : "description=content"} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={save} disabled={saving || !editing.name || !editing.content} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Block"}</button>
              <label className="flex items-center gap-2 text-sm text-stone-600"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Code2 className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">Select a block to edit, or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}