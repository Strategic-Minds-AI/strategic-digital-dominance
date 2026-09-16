import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Zap, Plus, Trash2, Loader2, Clock, Play, Pause, CheckSquare, Square, Calendar } from "lucide-react";

const ACTION_CATEGORIES = [
  { id: "lead_management", label: "Lead Management", icon: "👥" },
  { id: "seo_optimization", label: "SEO Optimization", icon: "🔍" },
  { id: "content_creation", label: "Content Creation", icon: "✍️" },
  { id: "email_campaign", label: "Email Campaign", icon: "📧" },
  { id: "social_media", label: "Social Media", icon: "📱" },
  { id: "phone_call", label: "Phone Call", icon: "📞" },
  { id: "sms_message", label: "SMS Message", icon: "💬" },
  { id: "data_analysis", label: "Data Analysis", icon: "📊" },
  { id: "research", label: "Research", icon: "🔬" },
  { id: "deployment", label: "Deployment", icon: "🚀" },
  { id: "code_change", label: "Code Change", icon: "💻" },
  { id: "browser_automation", label: "Browser Automation", icon: "🌐" },
  { id: "calendar_management", label: "Calendar Management", icon: "📅" },
  { id: "task_management", label: "Task Management", icon: "✅" },
  { id: "reporting", label: "Reporting", icon: "📈" },
  { id: "audit", label: "Audit", icon: "🔍" },
  { id: "repair", label: "Repair", icon: "🔧" },
  { id: "monitoring", label: "Monitoring", icon: "👁️" },
  { id: "scheduling", label: "Scheduling", icon: "⏰" },
  { id: "custom", label: "Custom", icon: "⚙️" },
];

const TRIGGER_TYPES = ["manual","schedule","event","condition","webhook","entity_change","interval","one_time"];
const FREQUENCIES = ["once","recurring","continuous"];
const DAYS = ["mon","tue","wed","thu","fri","sat","sun"];

export default function ActionsTab({ agent }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedCats, setSelectedCats] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    action_category: "custom",
    action_type: "function_invoke",
    target_function: "",
    trigger_type: "manual",
    priority: "normal",
    autonomy_level: "supervised",
    requires_approval: false,
    schedule_config: {
      frequency: "once",
      interval_seconds: 0,
      start_at: "",
      end_at: "",
      run_24_7: false,
      days_of_week: [],
      hours_of_day: [],
      timezone: "UTC",
    },
  });

  const { data: actions, isLoading } = useQuery({
    queryKey: ["agent-actions", agent?.id],
    queryFn: () => base44.entities.AgentAction.filter({ agent_id: agent.id }, "-created_date", 100),
    enabled: !!agent,
  });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      const actionId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await base44.entities.AgentAction.create({
        ...form,
        action_id: actionId,
        agent_id: agent.id,
        agent_short_name: agent.short_name,
        status: "draft",
        created_at: new Date().toISOString(),
      });
      setForm({ ...form, title: "", description: "", target_function: "" });
      setShowForm(false);
      queryClient.invalidateQueries(["agent-actions", agent.id]);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.AgentAction.delete(id);
      queryClient.invalidateQueries(["agent-actions", agent.id]);
    } catch (e) { console.error(e); }
  };

  const toggleStatus = async (action) => {
    const newStatus = action.status === "active" ? "paused" : "active";
    try {
      await base44.entities.AgentAction.update(action.id, { status: newStatus });
      queryClient.invalidateQueries(["agent-actions", agent.id]);
    } catch (e) { console.error(e); }
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...form,
      schedule_config: {
        ...prev.schedule_config,
        days_of_week: prev.schedule_config.days_of_week.includes(day)
          ? prev.schedule_config.days_of_week.filter(d => d !== day)
          : [...prev.schedule_config.days_of_week, day],
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">Action Delegation System</h3>
          <span className="text-xs text-stone-400">— deterministic, programmatic, with scheduling</span>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400">
          <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "Create Action"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-4">
          {/* Category Checkboxes */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-2">Action Categories (select all that apply)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {ACTION_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setForm({ ...form, action_category: c.id })}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-left ${
                    form.action_category === c.id ? "bg-amber-500 text-stone-950 border-amber-500" : "bg-white text-stone-600 border-stone-200 hover:border-amber-300"
                  }`}>
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Action name..."
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Target Function</label>
              <input value={form.target_function} onChange={e => setForm({ ...form, target_function: e.target.value })}
                placeholder="e.g. autoComplete, enrichLead..."
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none font-mono" />
            </div>
          </div>

          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2} placeholder="Detailed description of what this action does..."
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none resize-y" />

          {/* Trigger + Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Trigger Type</label>
              <select value={form.trigger_type} onChange={e => setForm({ ...form, trigger_type: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                {["critical","high","normal","low"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Autonomy</label>
              <select value={form.autonomy_level} onChange={e => setForm({ ...form, autonomy_level: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                {["advisory","supervised","autonomous","full_autonomous"].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Schedule Config */}
          {(form.trigger_type === "schedule" || form.trigger_type === "interval") && (
            <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
                <Calendar className="h-4 w-4 text-amber-600" /> Schedule Configuration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Frequency</label>
                  <select value={form.schedule_config.frequency} onChange={e => setForm(prev => ({ ...prev, schedule_config: { ...prev.schedule_config, frequency: e.target.value } }))}
                    className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Interval (seconds)</label>
                  <input type="number" value={form.schedule_config.interval_seconds} onChange={e => setForm(prev => ({ ...prev, schedule_config: { ...prev.schedule_config, interval_seconds: parseInt(e.target.value) || 0 } }))}
                    placeholder="0 = no interval, 10 = 10s, infinite..."
                    className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Start At</label>
                  <input type="datetime-local" value={form.schedule_config.start_at} onChange={e => setForm(prev => ({ ...prev, schedule_config: { ...prev.schedule_config, start_at: e.target.value } }))}
                    className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-stone-600">
                  <input type="checkbox" checked={form.schedule_config.run_24_7} onChange={e => setForm(prev => ({ ...prev, schedule_config: { ...prev.schedule_config, run_24_7: e.target.checked } }))}
                    className="w-4 h-4 rounded border-stone-300 text-amber-500" />
                  Run 24/7
                </label>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1.5">Days of Week</label>
                <div className="flex gap-1.5">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                        form.schedule_config.days_of_week.includes(d) ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-500"
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={form.requires_approval} onChange={e => setForm({ ...form, requires_approval: e.target.checked })}
              className="w-4 h-4 rounded border-stone-300 text-amber-500" />
            Requires operator approval before execution
          </label>

          <button onClick={handleCreate} disabled={!form.title.trim()}
            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-50">
            Create Action
          </button>
        </div>
      )}

      {/* Actions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      ) : (actions || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="h-8 w-8 text-stone-300 mb-2" />
          <p className="text-sm text-stone-400">No actions configured yet. Create one to delegate work to this agent.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(actions || []).map(a => (
            <div key={a.id} className="rounded-xl border border-stone-200 bg-white p-3 hover:border-amber-300 transition">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleStatus(a)}
                  className={`mt-0.5 p-1.5 rounded-lg ${a.status === "active" ? "text-emerald-500 bg-emerald-50" : "text-stone-400 bg-stone-100"}`}>
                  {a.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-800">{a.title}</div>
                  {a.description && <div className="text-xs text-stone-500 line-clamp-2 mt-0.5">{a.description}</div>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-stone-100 text-stone-600">{a.action_category}</span>
                    <span className="text-[10px] text-stone-400">{a.trigger_type}</span>
                    {a.target_function && <span className="text-[10px] text-stone-400 font-mono">{a.target_function}</span>}
                    {a.requires_approval && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-100 text-orange-700">approval</span>}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      a.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      a.status === "running" ? "bg-blue-100 text-blue-700" :
                      a.status === "paused" ? "bg-stone-100 text-stone-500" : "bg-amber-100 text-amber-700"
                    }`}>{a.status}</span>
                    {a.schedule_config?.run_24_7 && <Clock className="h-3 w-3 text-amber-500" />}
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}