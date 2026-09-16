import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  KeyRound, Mail, RefreshCw, Plus, Trash2, Eye, EyeOff, Check,
  Shield, Zap, AlertCircle, Search, Lock, ArrowRight, Copy,
} from "lucide-react";

const CATEGORIES = {
  api_key: { icon: KeyRound, label: "API Keys", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  email: { icon: Mail, label: "Emails", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  sync_config: { icon: RefreshCw, label: "Sync Configs", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  webhook: { icon: Zap, label: "Webhooks", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  credential: { icon: Lock, label: "Credentials", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  other: { icon: Shield, label: "Other", color: "text-stone-600", bg: "bg-stone-50 border-stone-200" },
};

const SERVICES = [
  "godaddy", "vercel", "telnyx", "gmail", "hubspot", "supabase", "googlecalendar",
  "googlesheets", "googledrive", "google_search_console", "google_analytics",
  "facebook_pages", "rentcast", "bls", "browserbase", "stripe", "openai",
  "anthropic", "github", "railway", "wix", "other",
];

const SYNC_TYPES = [
  "leads_to_sheets", "contacts_to_hubspot", "calendar_sync", "appointments_to_calendar",
  "email_sync", "social_sync", "analytics_sync", "custom",
];

export default function SystemVault() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("api_key");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [revealed, setRevealed] = useState({});

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["vault-entries"],
    queryFn: () => base44.entities.VaultEntry.list("-created_date", 500),
  });

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (activeTab !== "all" && e.category !== activeTab) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          e.name?.toLowerCase().includes(s) ||
          e.service?.toLowerCase().includes(s) ||
          e.key_name?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [entries, activeTab, search]);

  const stats = useMemo(() => {
    const byCat = {};
    for (const e of entries) byCat[e.category] = (byCat[e.category] || 0) + 1;
    return { total: entries.length, ...byCat };
  }, [entries]);

  const toggleReveal = (id) => setRevealed((p) => ({ ...p, [id]: !p[id] }));

  const handleDelete = async (id) => {
    if (!confirm("Delete this vault entry? This cannot be undone.")) return;
    await base44.entities.VaultEntry.delete(id);
    queryClient.invalidateQueries({ queryKey: ["vault-entries"] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-500" /> System Vault
          </h1>
          <p className="text-stone-500 mt-1">
            Centralized storage for API keys, email addresses, and sync configurations. Your agents read from here.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="h-10 px-4 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold flex items-center gap-2 hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" /> Add Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        <StatPill icon={Shield} label="Total" value={stats.total} color="text-stone-700" />
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <StatPill
            key={key}
            icon={cat.icon}
            label={cat.label}
            value={stats[key] || 0}
            color={cat.color}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
        >
          All ({stats.total})
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${activeTab === key ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >
            <cat.icon className="h-3.5 w-3.5" /> {cat.label} ({stats[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          placeholder="Search vault entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
        />
      </div>

      {/* Form */}
      {showForm && (
        <VaultForm
          editing={editing}
          onSave={() => { setShowForm(false); setEditing(null); queryClient.invalidateQueries({ queryKey: ["vault-entries"] }); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Entries list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No vault entries yet. Click "Add Entry" to store your first credential, email, or sync config.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <VaultRow
              key={entry.id}
              entry={entry}
              revealed={!!revealed[entry.id]}
              onReveal={() => toggleReveal(entry.id)}
              onDelete={() => handleDelete(entry.id)}
              onEdit={() => { setEditing(entry); setShowForm(true); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <div>
        <div className="text-lg font-bold text-stone-900 leading-none">{value}</div>
        <div className="text-[10px] text-stone-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function VaultRow({ entry, revealed, onReveal, onDelete, onEdit }) {
  const cat = CATEGORIES[entry.category] || CATEGORIES.other;
  const Icon = cat.icon;
  const [copied, setCopied] = useState(false);

  const copyValue = () => {
    navigator.clipboard?.writeText(entry.key_value || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4 hover:border-stone-300 transition">
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-10 h-10 rounded-lg grid place-items-center ${cat.bg} border`}>
          <Icon className={`h-5 w-5 ${cat.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-900">{entry.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.color}`}>{cat.label}</span>
            {entry.service && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium capitalize">{entry.service}</span>
            )}
            {!entry.active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">Inactive</span>
            )}
          </div>

          {entry.key_name && (
            <div className="text-xs text-stone-400 font-mono mt-1">{entry.key_name}</div>
          )}

          {/* Value row */}
          {entry.key_value && (
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 bg-stone-50 border border-stone-100 rounded px-3 py-1.5 text-sm font-mono text-stone-600 truncate">
                {entry.is_secret && !revealed ? "••••••••••••••••" : entry.key_value}
              </code>
              {entry.is_secret && (
                <button onClick={onReveal} className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-stone-500 hover:border-amber-500 hover:text-amber-600">
                  {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              <button onClick={copyValue} className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-stone-500 hover:border-amber-500 hover:text-amber-600">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Sync config summary */}
          {entry.category === "sync_config" && entry.sync_config && (
            <div className="flex items-center gap-2 mt-2 text-xs text-stone-500 flex-wrap">
              <span className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                {entry.sync_config.sync_type}
              </span>
              {entry.sync_config.source_entity && <span>from: {entry.sync_config.source_entity}</span>}
              {entry.sync_config.target_service && <span>to: {entry.sync_config.target_service}</span>}
              <span className="px-2 py-0.5 rounded bg-stone-100">{entry.sync_config.schedule}</span>
              {entry.last_sync_status && entry.last_sync_status !== "never" && (
                <span className={`px-2 py-0.5 rounded ${entry.last_sync_status === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {entry.last_sync_status}
                </span>
              )}
            </div>
          )}

          {/* Email config summary */}
          {entry.category === "email" && entry.email_config && (
            <div className="flex items-center gap-3 mt-2 text-xs text-stone-500 flex-wrap">
              {entry.email_config.purpose && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 capitalize">{entry.email_config.purpose}</span>}
              {entry.email_config.display_name && <span>{entry.email_config.display_name}</span>}
              {entry.email_config.auto_respond && <span className="text-amber-600">Auto-respond ON</span>}
            </div>
          )}

          {entry.notes && <p className="text-xs text-stone-400 mt-2">{entry.notes}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="h-8 px-3 rounded-lg border border-stone-200 text-stone-500 hover:border-amber-500 hover:text-amber-600 text-xs font-medium">
            Edit
          </button>
          <button onClick={onDelete} className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-stone-500 hover:border-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function VaultForm({ editing, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: editing?.name || "",
    category: editing?.category || "api_key",
    service: editing?.service || "",
    key_name: editing?.key_name || "",
    key_value: editing?.key_value || "",
    is_secret: editing?.is_secret ?? true,
    notes: editing?.notes || "",
    active: editing?.active ?? true,
    sync_config: editing?.sync_config || {
      sync_type: "leads_to_sheets",
      source_entity: "Lead",
      target_service: "googlesheets",
      target_id: "",
      schedule: "manual",
      auto_start: false,
    },
    email_config: editing?.email_config || {
      email_address: "",
      display_name: "",
      purpose: "general",
      smtp_host: "",
      smtp_port: 587,
      password_or_app_token: "",
      forward_to: "",
      auto_respond: false,
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      if (editing?.id) {
        await base44.entities.VaultEntry.update(editing.id, payload);
      } else {
        await base44.entities.VaultEntry.create(payload);
      }
      onSave();
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-stone-900">{editing ? "Edit Vault Entry" : "Add Vault Entry"}</h3>
        <button onClick={onCancel} className="text-stone-400 hover:text-stone-600 text-sm">Cancel</button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Category selector */}
      <div>
        <label className="text-xs font-semibold text-stone-500 mb-2 block">Category</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setForm({ ...form, category: key })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${form.category === key ? `${cat.bg} ${cat.color} border-2 border-current` : "bg-stone-100 text-stone-600 hover:bg-stone-200 border-2 border-transparent"}`}
            >
              <cat.icon className="h-3.5 w-3.5" /> {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Name *</label>
          <input
            type="text"
            placeholder="e.g. GoDaddy API Key"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Service</label>
          <select
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:border-amber-500 outline-none"
          >
            <option value="">— Select —</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Key Name / Identifier</label>
          <input
            type="text"
            placeholder="e.g. GODADDY_API_KEY or sales@thextremeteam.com"
            value={form.key_name}
            onChange={(e) => setForm({ ...form, key_name: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Value</label>
          <input
            type={form.is_secret ? "password" : "text"}
            placeholder="The actual key, token, or email"
            value={form.key_value}
            onChange={(e) => setForm({ ...form, key_value: e.target.value })}
            className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_secret}
            onChange={(e) => setForm({ ...form, is_secret: e.target.checked })}
            className="rounded"
          />
          Mask value in UI (secret)
        </label>
      </div>

      {/* Sync config fields */}
      {form.category === "sync_config" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4 text-green-600" /> Sync Configuration
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Sync Type</label>
              <select
                value={form.sync_config.sync_type}
                onChange={(e) => setForm({ ...form, sync_config: { ...form.sync_config, sync_type: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white"
              >
                {SYNC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Source Entity</label>
              <input
                type="text"
                placeholder="Lead, Appointment, etc."
                value={form.sync_config.source_entity}
                onChange={(e) => setForm({ ...form, sync_config: { ...form.sync_config, source_entity: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Target Service</label>
              <select
                value={form.sync_config.target_service}
                onChange={(e) => setForm({ ...form, sync_config: { ...form.sync_config, target_service: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white"
              >
                <option value="">— Select —</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Target ID (spreadsheet/calendar ID)</label>
              <input
                type="text"
                placeholder="Resource ID"
                value={form.sync_config.target_id}
                onChange={(e) => setForm({ ...form, sync_config: { ...form.sync_config, target_id: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Schedule</label>
              <select
                value={form.sync_config.schedule}
                onChange={(e) => setForm({ ...form, sync_config: { ...form.sync_config, schedule: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white"
              >
                <option value="manual">Manual</option>
                <option value="realtime">Realtime</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.sync_config.auto_start}
                  onChange={(e) => setForm({ ...form, sync_config: { ...form.sync_config, auto_start: e.target.checked } })}
                  className="rounded"
                />
                Auto-start sync
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Email config fields */}
      {form.category === "email" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-blue-600" /> Email Configuration
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Email Address</label>
              <input
                type="email"
                placeholder="sales@thextremeteam.com"
                value={form.email_config.email_address}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, email_address: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Display Name</label>
              <input
                type="text"
                placeholder="Xtreme Sales"
                value={form.email_config.display_name}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, display_name: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Purpose</label>
              <select
                value={form.email_config.purpose}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, purpose: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm bg-white"
              >
                <option value="general">General</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="billing">Billing</option>
                <option value="marketing">Marketing</option>
                <option value="agent_alias">Agent Alias</option>
                <option value="notifications">Notifications</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Forward To</label>
              <input
                type="email"
                placeholder="owner@thextremeteam.com"
                value={form.email_config.forward_to}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, forward_to: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">SMTP Host</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                value={form.email_config.smtp_host}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, smtp_host: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">SMTP Port</label>
              <input
                type="number"
                placeholder="587"
                value={form.email_config.smtp_port}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, smtp_port: parseInt(e.target.value) || 587 } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Password / App Token</label>
              <input
                type="password"
                placeholder="App-specific password"
                value={form.email_config.password_or_app_token}
                onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, password_or_app_token: e.target.value } })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.email_config.auto_respond}
              onChange={(e) => setForm({ ...form, email_config: { ...form.email_config, auto_respond: e.target.checked } })}
              className="rounded"
            />
            Auto-respond to incoming emails
          </label>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Notes</label>
        <textarea
          placeholder="What is this used for?"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || saving}
          className="h-10 px-5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {editing ? "Update Entry" : "Save Entry"}
        </button>
        <button onClick={onCancel} className="h-10 px-4 rounded-lg border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50">
          Cancel
        </button>
      </div>
    </div>
  );
}