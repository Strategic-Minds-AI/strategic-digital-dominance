import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Plus, Pencil, Trash2, Save, X, RefreshCw, Star } from "lucide-react";

const TYPES = [
  { id: "voice", label: "Voice" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "social_media", label: "Social" },
];

const EMPTY = { name: "", persona_type: "voice", voice_id: "", system_prompt: "", personality_traits: "", tone: "", assigned_context: "", active: true, is_default: false, avatar_color: "#ff6b00" };

export default function AgentsTab() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { data: personas } = useQuery({
    queryKey: ["agent-personas"],
    queryFn: () => base44.entities.AgentPersona.list("-created_date", 100),
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  const startCreate = () => { setEditing("new"); setForm(EMPTY); };
  const startEdit = (p) => { setEditing(p.id); setForm({ ...p, personality_traits: (p.personality_traits || []).join(", ") }); };

  const cancel = () => { setEditing(null); setForm(EMPTY); };

  const save = async () => {
    setError(null);
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        persona_type: form.persona_type,
        voice_id: form.voice_id || undefined,
        system_prompt: form.system_prompt || undefined,
        personality_traits: form.personality_traits ? form.personality_traits.split(",").map((s) => s.trim()).filter(Boolean) : [],
        tone: form.tone || undefined,
        assigned_context: form.assigned_context || undefined,
        active: form.active,
        is_default: form.is_default,
        avatar_color: form.avatar_color || "#ff6b00",
      };
      if (editing === "new") await base44.entities.AgentPersona.create(payload);
      else await base44.entities.AgentPersona.update(editing, payload);
      queryClient.invalidateQueries({ queryKey: ["agent-personas"] });
      cancel();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this persona?")) return;
    await base44.entities.AgentPersona.delete(id);
    queryClient.invalidateQueries({ queryKey: ["agent-personas"] });
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const textareaCls = "w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const btnCls = "h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-stone-900 flex items-center gap-2"><Bot className="h-5 w-5 text-amber-500" /> AI Agent Personas</h3>
          <p className="text-sm text-stone-500 mt-1">Create voice, email, phone, and social personas. Each persona defines a system prompt, tone, and voice used across the comms loop.</p>
        </div>
        {editing !== "new" && (
          <button onClick={startCreate} className={btnCls + " bg-amber-600"}><Plus className="h-4 w-4" /> New Persona</button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {editing && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Persona name" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
            <select value={form.persona_type} onChange={(e) => update("persona_type", e.target.value)} className={inputCls}>
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Voice ID (Telnyx Ultra UUID)" value={form.voice_id} onChange={(e) => update("voice_id", e.target.value)} className={inputCls} />
            <input placeholder="Tone (warm, authoritative…)" value={form.tone} onChange={(e) => update("tone", e.target.value)} className={inputCls} />
          </div>
          <input placeholder="Assigned context (sales calls, support emails…)" value={form.assigned_context} onChange={(e) => update("assigned_context", e.target.value)} className={inputCls} />
          <input placeholder="Personality traits (comma-separated)" value={form.personality_traits} onChange={(e) => update("personality_traits", e.target.value)} className={inputCls} />
          <textarea placeholder="System prompt — defines the persona's behavior and expertise" value={form.system_prompt} onChange={(e) => update("system_prompt", e.target.value)} rows={4} className={textareaCls} />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-stone-600"><input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} /> Active</label>
            <label className="flex items-center gap-2 text-sm text-stone-600"><input type="checkbox" checked={form.is_default} onChange={(e) => update("is_default", e.target.checked)} /> Default</label>
            <input type="color" value={form.avatar_color} onChange={(e) => update("avatar_color", e.target.value)} className="h-8 w-12 rounded border border-stone-200" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className={btnCls + " flex-1"}>{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Persona</button>
            <button onClick={cancel} className={btnCls + " bg-stone-200 text-stone-700"}><X className="h-4 w-4" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-2.5">
        {(personas || []).map((p) => (
          <div key={p.id} className="rounded-xl border border-stone-200 bg-white p-3.5">
            {editing === p.id ? null : (
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: p.avatar_color || "#ff6b00" }}>{(p.name || "?").charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{p.name}</span>
                    {p.is_default && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600"><Star className="h-3 w-3 fill-amber-500" /> DEFAULT</span>}
                    {!p.active && <span className="text-[10px] font-bold text-stone-400">INACTIVE</span>}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{p.persona_type}{p.tone ? ` · ${p.tone}` : ""}{p.assigned_context ? ` · ${p.assigned_context}` : ""}</div>
                  {p.system_prompt && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{p.system_prompt}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => startEdit(p)} className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber-500 hover:text-amber-600"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(p.id)} className="h-8 w-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:border-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {(!personas || personas.length === 0) && <p className="text-sm text-stone-400">No personas yet — click "New Persona" to create one.</p>}
      </div>
    </div>
  );
}