import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KeyRound, Plus, Copy, Check, RefreshCw, Trash2, Ban, AlertCircle,
  CheckCircle2, ShieldCheck, User, Search, Clock, Activity, X,
} from "lucide-react";

const SCOPE_META = {
  admin: { icon: ShieldCheck, color: "text-red-600", bg: "bg-red-50 border-red-200", label: "Admin", desc: "Full access to every function & entity" },
  user: { icon: User, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "User", desc: "Lead submission & property lookup only" },
  seo: { icon: Search, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "SEO System", desc: "Page generation, indexing & Search Console" },
};

export default function ApiKeyManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ keyName: "", scope: "seo", description: "", expiresAt: "" });

  const { data: keysData, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => base44.functions.invoke("apiKeyManager", { action: "list" }),
  });

  const keys = keysData?.data?.keys || [];

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("apiKeyManager", {
        action: "generate",
        keyName: form.keyName,
        scope: form.scope,
        description: form.description || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setNewKey(res.data);
      setForm({ keyName: "", scope: "seo", description: "", expiresAt: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard?.writeText(newKey.apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const revoke = async (id) => {
    if (!confirm("Revoke this API key? It will immediately stop working.")) return;
    try {
      await base44.functions.invoke("apiKeyManager", { action: "revoke", id });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Permanently delete this API key? This cannot be undone.")) return;
    try {
      await base44.functions.invoke("apiKeyManager", { action: "delete", id });
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <KeyRound className="h-7 w-7 text-amber-500" /> API Key Generator
          </h1>
          <p className="text-stone-500 mt-1">Create scoped API keys for admin, user, and SEO system access. Keys are hashed at rest and shown only once.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); }}
          className="h-10 px-4 rounded-lg bg-stone-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "Generate Key"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* New key one-time display */}
      {newKey && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-stone-900">Key Generated — Copy It Now</h3>
            </div>
            <button onClick={() => setNewKey(null)} className="text-stone-400 hover:text-stone-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-red-700 font-semibold mb-2">
            ⚠️ This is the only time the full key will be shown. Store it securely — you won't be able to retrieve it again.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 bg-stone-900 text-amber-300 rounded-lg px-4 py-3 text-sm font-mono break-all">
              {newKey.apiKey}
            </code>
            <button
              onClick={copyKey}
              className="h-auto px-4 rounded-lg bg-amber-500 text-stone-900 font-semibold flex items-center gap-2 hover:bg-amber-400 shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-600">
            <span><strong>Scope:</strong> {newKey.scope}</span>
            <span><strong>Prefix:</strong> <code className="font-mono">{newKey.prefix}…</code></span>
            <span><strong>Permissions:</strong> {newKey.permissions?.label}</span>
          </div>
        </div>
      )}

      {/* Generate form */}
      {showForm && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
          <h3 className="font-bold text-stone-900">Generate New API Key</h3>

          {/* Scope selector */}
          <div>
            <label className="text-xs font-semibold text-stone-500 mb-2 block">Scope / Access Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(SCOPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, scope: key })}
                  className={`text-left p-3 rounded-xl border-2 transition ${form.scope === key ? `${meta.bg} border-current` : "border-stone-200 bg-white hover:border-stone-300"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <meta.icon className={`h-5 w-5 ${meta.color}`} />
                    <span className="font-bold text-stone-900 text-sm">{meta.label}</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-snug">{meta.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Key Name *</label>
              <input
                type="text"
                placeholder="e.g. Production SEO Bot"
                value={form.keyName}
                onChange={(e) => setForm({ ...form, keyName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Expires (optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1 block">Description</label>
            <textarea
              placeholder="What is this key used for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!form.keyName.trim() || generating}
            className="h-10 px-5 rounded-lg bg-amber-500 text-stone-900 text-sm font-bold flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Generate Key
          </button>
        </div>
      )}

      {/* Keys table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">Active Keys ({keys.filter(k => k.active).length})</h3>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["api-keys"] })}
            className="text-stone-400 hover:text-stone-600"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-stone-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading keys…
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No API keys yet. Generate one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">Name</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Prefix</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Scope</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Status</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Usage</th>
                  <th className="text-left px-3 py-2.5 font-semibold">Created</th>
                  <th className="text-right px-5 py-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {keys.map((k) => {
                  const meta = SCOPE_META[k.scope] || SCOPE_META.user;
                  const Icon = meta.icon;
                  return (
                    <tr key={k.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-stone-900">{k.key_name}</div>
                        {k.description && <div className="text-xs text-stone-400 truncate max-w-xs">{k.description}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <code className="text-xs font-mono text-stone-500">{k.key_prefix}…</code>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${meta.bg} ${meta.color}`}>
                          <Icon className="h-3.5 w-3.5" /> {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {k.active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
                            <span className="h-2 w-2 rounded-full bg-stone-300" /> Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-stone-500 flex items-center gap-1">
                          <Activity className="h-3 w-3" /> {k.usage_count || 0}
                        </div>
                        {k.last_used_at && (
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" /> {new Date(k.last_used_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-stone-500">
                        {new Date(k.created_date).toLocaleDateString()}
                        {k.created_by_name && <div className="text-[10px] text-stone-400 truncate max-w-[120px]">{k.created_by_name}</div>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {k.active && (
                            <button
                              onClick={() => revoke(k.id)}
                              title="Revoke"
                              className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-stone-500 hover:border-amber-500 hover:text-amber-600"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => remove(k.id)}
                            title="Delete"
                            className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-stone-500 hover:border-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}