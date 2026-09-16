import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Phone, Mail, MessageSquare, Mic, Save, Loader2, Globe } from "lucide-react";

export default function CommunicationsTab({ agent }) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(agent?.communication_config || {
    sms_enabled: false, mms_enabled: false, email_enabled: false, voice_enabled: false, whatsapp_enabled: false,
    phone_number: "", email_alias: "", from_name: "", auto_respond: true,
    business_hours_only: false, business_hours_start: "09:00", business_hours_end: "17:00", timezone: "UTC",
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (agent) setConfig(agent.communication_config || {});
  }, [agent?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.AgentPersona.update(agent.id, { communication_config: config });
      queryClient.invalidateQueries(["agent-personas"]);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const channels = [
    { key: "sms_enabled", label: "SMS", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { key: "mms_enabled", label: "MMS", icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
    { key: "email_enabled", label: "Email", icon: Mail, color: "text-emerald-600 bg-emerald-50" },
    { key: "voice_enabled", label: "Voice", icon: Mic, color: "text-orange-600 bg-orange-50" },
    { key: "whatsapp_enabled", label: "WhatsApp", icon: MessageSquare, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-stone-900">Communication Channels</h3>
        <span className="text-xs text-stone-400">— SMS, MMS, email, voice, WhatsApp</span>
      </div>

      {/* Channel Toggles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {channels.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.key} onClick={() => setConfig({ ...config, [c.key]: !config[c.key] })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                config[c.key] ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"
              }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-stone-800">{c.label}</span>
              <span className={`text-[10px] font-bold uppercase ${config[c.key] ? "text-amber-600" : "text-stone-400"}`}>
                {config[c.key] ? "Enabled" : "Disabled"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contact Details */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Phone Number</label>
            <input value={config.phone_number || ""} onChange={e => setConfig({ ...config, phone_number: e.target.value })}
              placeholder="+1 555-0100"
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Email Alias</label>
            <input value={config.email_alias || ""} onChange={e => setConfig({ ...config, email_alias: e.target.value })}
              placeholder="agent-name@thextremeteam.com"
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">From Name</label>
            <input value={config.from_name || ""} onChange={e => setConfig({ ...config, from_name: e.target.value })}
              placeholder="Agent Name"
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Timezone</label>
            <select value={config.timezone || "UTC"} onChange={e => setConfig({ ...config, timezone: e.target.value })}
              className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none">
              {["UTC","America/New_York","America/Chicago","America/Los_Angeles","Europe/London"].map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Respond + Business Hours */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={config.auto_respond ?? true} onChange={e => setConfig({ ...config, auto_respond: e.target.checked })}
            className="w-4 h-4 rounded border-stone-300 text-amber-500" />
          Auto-respond to incoming messages
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={config.business_hours_only || false} onChange={e => setConfig({ ...config, business_hours_only: e.target.checked })}
            className="w-4 h-4 rounded border-stone-300 text-amber-500" />
          Only respond during business hours
        </label>
        {config.business_hours_only && (
          <div className="grid grid-cols-2 gap-3 ml-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Start</label>
              <input type="time" value={config.business_hours_start || "09:00"} onChange={e => setConfig({ ...config, business_hours_start: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">End</label>
              <input type="time" value={config.business_hours_end || "17:00"} onChange={e => setConfig({ ...config, business_hours_end: e.target.value })}
                className="w-full h-10 px-3 border border-stone-200 rounded-lg text-sm focus:border-amber-500 outline-none" />
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Communications
      </button>
    </div>
  );
}