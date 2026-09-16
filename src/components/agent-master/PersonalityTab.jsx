import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, Plus, Trash2, Brain, Sparkles, Copy, X } from "lucide-react";

export default function PersonalityTab({ agent, agents }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: agent?.name || "",
    short_name: agent?.short_name || "",
    persona_type: agent?.persona_type || "custom",
    system_prompt: agent?.system_prompt || "",
    custom_instructions: agent?.custom_instructions || "",
    personality_traits: agent?.personality_traits || [],
    tone: agent?.tone || "",
    assigned_context: agent?.assigned_context || "",
    avatar_color: agent?.avatar_color || "#ff6b00",
    model_preference: agent?.model_preference || "automatic",
    max_autonomy: agent?.max_autonomy || "supervised",
    active: agent?.active ?? true,
  });
  const [newTrait, setNewTrait] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  // Sync form when agent changes
  React.useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name || "",
        short_name: agent.short_name || "",
        persona_type: agent.persona_type || "custom",
        system_prompt: agent.system_prompt || "",
        custom_instructions: agent.custom_instructions || "",
        personality_traits: agent.personality_traits || [],
        tone: agent.tone || "",
        assigned_context: agent.assigned_context || "",
        avatar_color: agent.avatar_color || "#ff6b00",
        model_preference: agent.model_preference || "automatic",
        max_autonomy: agent.max_autonomy || "supervised",
        active: agent.active ?? true,
      });
    }
  }, [agent?.id]);

  const handleSave = async () => {
    if (!agent) return;
    setSaving(true);
    try {
      await base44.entities.AgentPersona.update(agent.id, form);
      queryClient.invalidateQueries(["agent-personas"]);
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await base44.entities.AgentPersona.create({
        ...form,
        short_name: form.short_name || `A-${agents.length + 1}`,
      });
      queryClient.invalidateQueries(["agent-personas"]);
    } catch (e) {
      console.error("Create failed:", e);
    }
    setCreating(false);
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      setForm({ ...form, personality_traits: [...form.personality_traits, newTrait.trim()] });
      setNewTrait("");
    }
  };

  const removeTrait = (idx) => {
    setForm({ ...form, personality_traits: form.personality_traits.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Identity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Display Name">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </Field>
          <Field label="Short Name (Calendar ID)">
            <input value={form.short_name} onChange={e => setForm({ ...form, short_name: e.target.value })}
              placeholder="A-1, A-2, AP-01..."
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </Field>
          <Field label="Agent Type">
            <select value={form.persona_type} onChange={e => setForm({ ...form, persona_type: e.target.value })}
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
              {["ceo","voice","email","phone","social_media","seo","lead","swarm","research","deployment","custom"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <Field label="Tone">
            <input value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}
              placeholder="warm, authoritative, analytical..."
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </Field>
          <Field label="Assigned Context">
            <input value={form.assigned_context} onChange={e => setForm({ ...form, assigned_context: e.target.value })}
              placeholder="sales calls, support emails..."
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </Field>
          <Field label="Calendar Color">
            <div className="flex items-center gap-2">
              <input type="color" value={form.avatar_color} onChange={e => setForm({ ...form, avatar_color: e.target.value })}
                className="w-12 h-10 rounded-lg border border-stone-200 cursor-pointer" />
              <input value={form.avatar_color} onChange={e => setForm({ ...form, avatar_color: e.target.value })}
                className="flex-1 h-10 px-3 border border-stone-200 rounded-lg text-sm font-mono focus:border-amber-500 outline-none" />
            </div>
          </Field>
        </div>
      </div>

      {/* System Prompt */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">System Prompt</h3>
          <span className="ml-auto text-xs text-stone-400">{form.system_prompt.length} chars</span>
        </div>
        <textarea value={form.system_prompt} onChange={e => setForm({ ...form, system_prompt: e.target.value })}
          rows={6}
          placeholder="Define the agent's core identity, expertise, and behavioral rules..."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-y font-mono" />
      </div>

      {/* Custom Instructions (like ChatGPT) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Custom Instructions</h3>
          <span className="text-xs text-stone-400">— persistent behavioral guidance (like ChatGPT)</span>
        </div>
        <textarea value={form.custom_instructions} onChange={e => setForm({ ...form, custom_instructions: e.target.value })}
          rows={5}
          placeholder="What would you like the agent to know about you? How would you like the agent to respond?"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-y" />
      </div>

      {/* Personality Traits */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Personality Traits</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <input value={newTrait} onChange={e => setNewTrait(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTrait()}
            placeholder="Add a trait (e.g. 'decisive', 'empathetic')..."
            className="flex-1 h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          <button onClick={addTrait} className="px-3 h-10 rounded-lg bg-stone-100 text-stone-700 text-sm font-semibold hover:bg-stone-200 flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.personality_traits.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
              {t}
              <button onClick={() => removeTrait(i)} className="text-amber-400 hover:text-amber-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {form.personality_traits.length === 0 && (
            <span className="text-xs text-stone-400">No traits yet — add some above.</span>
          )}
        </div>
      </div>

      {/* Model + Autonomy */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Model & Autonomy</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Preferred Model">
            <select value={form.model_preference} onChange={e => setForm({ ...form, model_preference: e.target.value })}
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
              {["automatic","claude-sonnet-5","claude_opus_5","gpt_5_4","gemini_3_flash","gemini_3_1_pro"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Max Autonomy Level">
            <select value={form.max_autonomy} onChange={e => setForm({ ...form, max_autonomy: e.target.value })}
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
              {["advisory","supervised","autonomous","full_autonomous"].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Active">
            <label className="flex items-center gap-2 h-10">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}
                className="w-5 h-5 rounded border-stone-300 text-amber-500 focus:ring-amber-500" />
              <span className="text-sm text-stone-600">Agent is active</span>
            </label>
          </Field>
        </div>
      </div>

      {/* Save / Create */}
      <div className="flex items-center gap-2">
        {agent ? (
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        ) : (
          <button onClick={handleCreate} disabled={creating || !form.name}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Agent
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}