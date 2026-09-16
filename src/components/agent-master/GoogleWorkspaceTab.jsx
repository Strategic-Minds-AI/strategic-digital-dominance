import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, CheckSquare, Mail, FolderOpen, Sheet, FileText, Save, Loader2 } from "lucide-react";

export default function GoogleWorkspaceTab({ agent }) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(agent?.google_workspace_config || {});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => { if (agent) setConfig(agent.google_workspace_config || {}); }, [agent?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.AgentPersona.update(agent.id, { google_workspace_config: config });
      queryClient.invalidateQueries(["agent-personas"]);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const tools = [
    { key: "calendar_enabled", label: "Google Calendar", icon: Calendar, idKey: "calendar_id", idLabel: "Calendar ID", idPlaceholder: "agent@thextremeteam.com", color: "text-blue-600 bg-blue-50" },
    { key: "tasks_enabled", label: "Google Tasks", icon: CheckSquare, idKey: "tasks_list_id", idLabel: "Tasks List ID", idPlaceholder: "Task list ID", color: "text-emerald-600 bg-emerald-50" },
    { key: "gmail_enabled", label: "Gmail", icon: Mail, idKey: "gmail_label", idLabel: "Gmail Label", idPlaceholder: "Agent label", color: "text-red-600 bg-red-50" },
    { key: "drive_enabled", label: "Google Drive", icon: FolderOpen, idKey: "drive_folder_id", idLabel: "Drive Folder ID", idPlaceholder: "Folder ID", color: "text-amber-600 bg-amber-50" },
    { key: "sheets_enabled", label: "Google Sheets", icon: Sheet, idKey: "sheets_id", idLabel: "Sheets ID", idPlaceholder: "Spreadsheet ID", color: "text-green-600 bg-green-50" },
    { key: "docs_enabled", label: "Google Docs", icon: FileText, idKey: "", idLabel: "", idPlaceholder: "", color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-stone-900">Google Workspace Integration</h3>
        <span className="text-xs text-stone-400">— connect every Google tool to this agent</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tools.map(t => {
          const Icon = t.icon;
          const enabled = config[t.key] || false;
          return (
            <div key={t.key} className={`rounded-xl border-2 p-4 transition ${enabled ? "border-amber-500 bg-amber-50/50" : "border-stone-200 bg-white"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-bold text-stone-800 flex-1">{t.label}</span>
                <button onClick={() => setConfig({ ...config, [t.key]: !enabled })}
                  className={`relative w-11 h-6 rounded-full transition ${enabled ? "bg-amber-500" : "bg-stone-300"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${enabled ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              {enabled && t.idKey && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">{t.idLabel}</label>
                  <input value={config[t.idKey] || ""} onChange={e => setConfig({ ...config, [t.idKey]: e.target.value })}
                    placeholder={t.idPlaceholder}
                    className="w-full h-9 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none font-mono" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto Behaviors */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
        <h4 className="text-sm font-bold text-stone-800">Automation</h4>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={config.auto_create_calendar_events ?? true} onChange={e => setConfig({ ...config, auto_create_calendar_events: e.target.checked })}
            className="w-4 h-4 rounded border-stone-300 text-amber-500" />
          Auto-create Google Calendar events for scheduled actions
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={config.auto_assign_tasks ?? true} onChange={e => setConfig({ ...config, auto_assign_tasks: e.target.checked })}
            className="w-4 h-4 rounded border-stone-300 text-amber-500" />
          Auto-assign Google Tasks to this agent
        </label>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Google Workspace
      </button>
    </div>
  );
}