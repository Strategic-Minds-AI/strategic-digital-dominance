import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Globe, Save, Loader2, Plus, X } from "lucide-react";

export default function CloudBrowserTab({ agent }) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(agent?.cloud_browser_config || {
    enabled: false, max_sessions: 1, auto_browse_on_query: false,
    persist_history: false, proxy_rotation: true, allowed_domains: [], blocked_domains: [],
  });
  const [saving, setSaving] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domainList, setDomainList] = useState("allowed");

  React.useEffect(() => { if (agent) setConfig(agent.cloud_browser_config || {}); }, [agent?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.AgentPersona.update(agent.id, { cloud_browser_config: config });
      queryClient.invalidateQueries(["agent-personas"]);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addDomain = () => {
    if (!newDomain.trim()) return;
    const key = domainList === "allowed" ? "allowed_domains" : "blocked_domains";
    setConfig({ ...config, [key]: [...(config[key] || []), newDomain.trim()] });
    setNewDomain("");
  };

  const removeDomain = (list, domain) => {
    setConfig({ ...config, [list]: config[list].filter(d => d !== domain) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-stone-900">Cloud Browser Control</h3>
        <span className="text-xs text-stone-400">— autonomous web browsing per agent</span>
      </div>

      <div className={`rounded-2xl border-2 p-5 ${config.enabled ? "border-amber-500 bg-amber-50/30" : "border-stone-200 bg-white"}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-stone-800">Browser Enabled</span>
          <button onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-12 h-6 rounded-full transition ${config.enabled ? "bg-amber-500" : "bg-stone-300"}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${config.enabled ? "left-6" : "left-0.5"}`} />
          </button>
        </div>

        {config.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Max Sessions</label>
                <input type="number" value={config.max_sessions || 1} onChange={e => setConfig({ ...config, max_sessions: parseInt(e.target.value) || 1 })}
                  className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={config.auto_browse_on_query || false} onChange={e => setConfig({ ...config, auto_browse_on_query: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500" />
                Auto-browse on query (agent browses the web when it needs information)
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={config.persist_history || false} onChange={e => setConfig({ ...config, persist_history: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500" />
                Persist browsing history
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={config.proxy_rotation ?? true} onChange={e => setConfig({ ...config, proxy_rotation: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500" />
                Proxy rotation (traceless browsing)
              </label>
            </div>

            {/* Domain Lists */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <select value={domainList} onChange={e => setDomainList(e.target.value)}
                  className="h-9 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
                  <option value="allowed">Allowed Domains</option>
                  <option value="blocked">Blocked Domains</option>
                </select>
                <input value={newDomain} onChange={e => setNewDomain(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addDomain()}
                  placeholder="example.com"
                  className="flex-1 h-9 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
                <button onClick={addDomain} className="px-3 h-9 rounded-lg bg-stone-100 text-stone-700 text-sm font-semibold hover:bg-stone-200 flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(config[domainList === "allowed" ? "allowed_domains" : "blocked_domains"] || []).map(d => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium">
                    {d}
                    <button onClick={() => removeDomain(domainList === "allowed" ? "allowed_domains" : "blocked_domains", d)}
                      className="text-stone-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(config[domainList === "allowed" ? "allowed_domains" : "blocked_domains"] || []).length === 0 && (
                  <span className="text-xs text-stone-400">{domainList === "allowed" ? "All domains allowed" : "No domains blocked"}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Browser Config
      </button>
    </div>
  );
}