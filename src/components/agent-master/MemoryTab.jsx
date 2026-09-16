import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Database, Plus, Trash2, Loader2, Share2, Search, Brain } from "lucide-react";

const CATEGORIES = ["general","sales","technical","client_history","market_intel","competitor_intel","seo","lead_data","process","policy","conversation","decision","lesson_learned","custom"];
const MEMORY_TYPES = ["fact","preference","instruction","observation","decision","outcome","context","skill"];

export default function MemoryTab({ agent }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    category: "general",
    memory_type: "fact",
    title: "",
    content: "",
    importance: "medium",
    is_shared: false,
    tags: [],
  });

  const { data: memories, isLoading } = useQuery({
    queryKey: ["agent-memory", agent?.id],
    queryFn: () => base44.entities.AgentMemory.filter({ agent_id: agent.id }, "-created_date", 100),
    enabled: !!agent,
  });

  const { data: sharedMemories } = useQuery({
    queryKey: ["agent-memory-shared"],
    queryFn: () => base44.entities.AgentMemory.filter({ is_shared: true }, "-created_date", 50),
    enabled: !!agent,
  });

  const allMemories = [...(memories || []), ...(sharedMemories || [])];
  const filtered = allMemories.filter(m => {
    if (filter !== "all" && m.category !== filter) return false;
    if (search && !m.title?.toLowerCase().includes(search.toLowerCase()) && !m.content?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!form.content.trim()) return;
    try {
      await base44.entities.AgentMemory.create({
        ...form,
        agent_id: agent.id,
        agent_short_name: agent.short_name,
        tags: form.tags,
        created_at: new Date().toISOString(),
      });
      setForm({ category: "general", memory_type: "fact", title: "", content: "", importance: "medium", is_shared: false, tags: [] });
      setShowForm(false);
      queryClient.invalidateQueries(["agent-memory", agent.id]);
      queryClient.invalidateQueries(["agent-memory-shared"]);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.AgentMemory.delete(id);
      queryClient.invalidateQueries(["agent-memory", agent.id]);
    } catch (e) { console.error(e); }
  };

  const toggleShare = async (mem) => {
    try {
      await base44.entities.AgentMemory.update(mem.id, { is_shared: !mem.is_shared });
      queryClient.invalidateQueries(["agent-memory", agent.id]);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Memory System</h3>
          <span className="text-xs text-stone-400">— categorized, shareable, with Supabase RAG</span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400">
          <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "Add Memory"}
        </button>
      </div>

      {/* New Memory Form */}
      {showForm && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Type</label>
              <select value={form.memory_type} onChange={e => setForm({ ...form, memory_type: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                {MEMORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Importance</label>
              <select value={form.importance} onChange={e => setForm({ ...form, importance: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                {["critical","high","medium","low"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Optional title..."
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
            </div>
          </div>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
            rows={3} placeholder="Memory content..."
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-y" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={form.is_shared} onChange={e => setForm({ ...form, is_shared: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-amber-500" />
              <Share2 className="h-3.5 w-3.5" /> Share with all agents
            </label>
            <button onClick={handleCreate} disabled={!form.content.trim()}
              className="ml-auto px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-50">
              Save Memory
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === "all" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
          All ({allMemories.length})
        </button>
        {CATEGORIES.slice(0, 6).map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === c ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
            {c} ({allMemories.filter(m => m.category === c).length})
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="h-9 pl-9 pr-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none w-48" />
        </div>
      </div>

      {/* Memory List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-8 w-8 text-stone-300 mb-2" />
          <p className="text-sm text-stone-400">No memories yet. Add one to give this agent persistent knowledge.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="rounded-xl border border-stone-200 bg-white p-3 hover:border-amber-300 transition">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                    m.importance === "critical" ? "bg-red-100 text-red-700" :
                    m.importance === "high" ? "bg-orange-100 text-orange-700" :
                    m.importance === "medium" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
                  }`}>{m.importance}</span>
                  {m.is_shared && <Share2 className="h-3.5 w-3.5 text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  {m.title && <div className="text-sm font-bold text-stone-800 mb-0.5">{m.title}</div>}
                  <div className="text-sm text-stone-600 line-clamp-2">{m.content}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide">{m.category}</span>
                    <span className="text-[10px] text-stone-400">·</span>
                    <span className="text-[10px] text-stone-400">{m.memory_type}</span>
                    {m.agent_short_name && (
                      <>
                        <span className="text-[10px] text-stone-400">·</span>
                        <span className="text-[10px] text-stone-400">{m.agent_short_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleShare(m)} title="Toggle share"
                    className={`p-1.5 rounded-lg ${m.is_shared ? "text-emerald-500 bg-emerald-50" : "text-stone-400 hover:bg-stone-100"}`}>
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} title="Delete"
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}