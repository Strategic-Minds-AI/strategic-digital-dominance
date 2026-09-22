import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Globe, Search, BarChart3, Users, Calendar, Mail, HardDrive, ListTodo,
  Sheet, FileText, Presentation, Image, Video, Database, GraduationCap,
  Shield, CheckCircle2, XCircle, Loader2, RefreshCw, Download, Zap,
  TrendingUp, MousePointer, Eye, ArrowUpRight, Building2, Brain,
} from "lucide-react";

const CONNECTOR_ICONS = {
  search_console: Search,
  analytics: BarChart3,
  contacts: Users,
  calendar: Calendar,
  gmail: Mail,
  drive: HardDrive,
  tasks: ListTodo,
  sheets: Sheet,
  docs: FileText,
  slides: Presentation,
  forms: FileText,
  photos: Image,
  meet: Video,
  bigquery: Database,
  classroom: GraduationCap,
};

const CONNECTOR_LABELS = {
  search_console: "Search Console",
  analytics: "Analytics (GA4)",
  contacts: "Contacts",
  calendar: "Calendar",
  gmail: "Gmail",
  drive: "Drive",
  tasks: "Tasks",
  sheets: "Sheets",
  docs: "Docs",
  slides: "Slides",
  forms: "Forms",
  photos: "Photos",
  meet: "Meet",
  bigquery: "BigQuery",
  classroom: "Classroom",
};

export default function GoogleCommandCenter() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scData, setScData] = useState(null);
  const [gaData, setGaData] = useState(null);
  const [contactsData, setContactsData] = useState(null);
  const [vaultData, setVaultData] = useState(null);
  const [activeDomain, setActiveDomain] = useState("xtreme");
  const [activeProperty, setActiveProperty] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await base44.functions.invoke("googleEcosystemSync", { action: "status" });
      const data = res.data || res;
      setStatus(data);
      // Auto-select first GA property for the active domain
      if (data?.connectors?.analytics?.properties?.length > 0 && !activeProperty) {
        const firstProp = data.connectors.analytics.properties[0];
        setActiveProperty(firstProp.property_id);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [activeProperty]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handlePullSearchConsole = async () => {
    setActionLoading("sc");
    setError("");
    try {
      const res = await base44.functions.invoke("googleEcosystemSync", {
        action: "pullSearchConsole",
        domain_key: activeDomain,
        days: 28,
      });
      setScData(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  const handlePullAnalytics = async () => {
    if (!activeProperty) return;
    setActionLoading("ga");
    setError("");
    try {
      const res = await base44.functions.invoke("googleEcosystemSync", {
        action: "pullAnalytics",
        property_id: activeProperty,
        days: 28,
      });
      setGaData(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  const handleSyncContacts = async () => {
    setActionLoading("contacts");
    setError("");
    try {
      const res = await base44.functions.invoke("googleEcosystemSync", { action: "syncContacts" });
      setContactsData(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  const handleSeedVault = async () => {
    setActionLoading("vault");
    setError("");
    try {
      const res = await base44.functions.invoke("googleEcosystemSync", { action: "seedVault" });
      setVaultData(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setActionLoading(null);
  };

  const connectedCount = status
    ? Object.values(status.connectors).filter((c) => c.connected).length
    : 0;
  const totalConnectors = status ? Object.keys(status.connectors).length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Globe className="h-7 w-7 text-blue-600" />
            Google Command Center
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Unified Google ecosystem — {connectedCount}/{totalConnectors} tools connected for both Xtreme Polishing & Strategic Minds AI
          </p>
        </div>
        <button
          onClick={loadStatus}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-600 hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Connector Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {status && Object.entries(status.connectors).map(([key, conn]) => {
            const Icon = CONNECTOR_ICONS[key] || Globe;
            const label = CONNECTOR_LABELS[key] || key;
            return (
              <div
                key={key}
                className={`rounded-xl border p-3 transition ${
                  conn.connected
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-5 w-5 ${conn.connected ? "text-green-600" : "text-red-500"}`} />
                  <span className="text-xs font-bold text-stone-700">{label}</span>
                </div>
                {conn.connected ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                    {conn.properties && <span className="ml-1">· {conn.properties.length}</span>}
                    {conn.total_people != null && <span className="ml-1">· {conn.total_people}</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-red-500">
                    <XCircle className="h-3 w-3" />
                    Not connected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vault Setup */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-stone-900">Google Vault Setup</h2>
          </div>
          <button
            onClick={handleSeedVault}
            disabled={actionLoading === "vault"}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-900 hover:bg-amber-400 transition disabled:opacity-50"
          >
            {actionLoading === "vault" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Seed Google Vault
          </button>
        </div>
        <p className="text-sm text-stone-500">
          Seeds all Google credentials and connector configs into the secure Vault — API keys, OAuth credentials, and connector sync configs for both companies.
        </p>
        {vaultData && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
            <span className="font-bold text-amber-800">✅ Vault Seeded:</span>
            <span className="text-amber-700"> {vaultData.seeded} new entries created, {vaultData.already_existed} already existed (total: {vaultData.total})</span>
          </div>
        )}
      </div>

      {/* Domain Selector */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4">
        <Building2 className="h-5 w-5 text-stone-400" />
        <span className="text-sm font-bold text-stone-700">Active Domain:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveDomain("xtreme")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeDomain === "xtreme"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Xtreme Polishing (epoxyquotenearme.com)
          </button>
          <button
            onClick={() => setActiveDomain("strategic_minds")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeDomain === "strategic_minds"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Strategic Minds AI (strategicmindsai.com)
          </button>
        </div>
      </div>

      {/* Two-column: Search Console + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Search Console */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-stone-900">Search Console</h2>
            </div>
            <button
              onClick={handlePullSearchConsole}
              disabled={actionLoading === "sc"}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {actionLoading === "sc" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              Pull Data (28 days)
            </button>
          </div>
          {scData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{scData.totals?.impressions?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500 flex items-center justify-center gap-1"><Eye className="h-3 w-3" /> Impressions</div>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{scData.totals?.clicks?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500 flex items-center justify-center gap-1"><MousePointer className="h-3 w-3" /> Clicks</div>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">
                    {scData.totals?.impressions > 0 ? (scData.totals.clicks / scData.totals.impressions * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-stone-500 flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> CTR</div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Top Queries</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {scData.top_queries?.slice(0, 10).map((q, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded px-2 py-1">
                      <span className="truncate flex-1">{q.query}</span>
                      <span className="text-stone-600 ml-2">{q.clicks} clicks</span>
                      <span className="text-stone-400 ml-2">{q.impressions} imp</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Top Pages</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {scData.top_pages?.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded px-2 py-1">
                      <span className="truncate flex-1 font-mono">{p.page}</span>
                      <span className="text-stone-600 ml-2">{p.clicks} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-400 py-4 text-center">Click "Pull Data" to fetch Search Console performance</p>
          )}
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <h2 className="font-bold text-stone-900">Google Analytics (GA4)</h2>
            </div>
            <button
              onClick={handlePullAnalytics}
              disabled={actionLoading === "ga" || !activeProperty}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition disabled:opacity-50"
            >
              {actionLoading === "ga" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              Pull Data (28 days)
            </button>
          </div>
          {/* Property selector */}
          {status?.connectors?.analytics?.properties?.length > 0 && (
            <select
              value={activeProperty || ""}
              onChange={(e) => setActiveProperty(e.target.value)}
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white"
            >
              {status.connectors.analytics.properties.map((p) => (
                <option key={p.property_id} value={p.property_id}>
                  {p.display_name} ({p.account})
                </option>
              ))}
            </select>
          )}
          {gaData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{gaData.overview?.sessions?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500">Sessions</div>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{gaData.overview?.users?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500">Users</div>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{gaData.overview?.page_views?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500">Page Views</div>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{gaData.overview?.new_users?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500">New Users</div>
                </div>
                <div className="rounded-lg bg-stone-50 p-2 text-center">
                  <div className="text-lg font-black text-stone-900">{gaData.overview?.conversions?.toLocaleString() || 0}</div>
                  <div className="text-xs text-stone-500">Conversions</div>
                </div>
              </div>
              {/* Traffic sources */}
              {gaData.sources?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase mb-2">Traffic Sources</p>
                  <div className="space-y-1">
                    {gaData.sources.slice(0, 6).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded px-2 py-1">
                        <span className="truncate flex-1">{s.channel}</span>
                        <span className="text-stone-600 ml-2">{s.sessions} sessions</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Top pages */}
              {gaData.pages?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase mb-2">Top Pages</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {gaData.pages.slice(0, 8).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-stone-50 rounded px-2 py-1">
                        <span className="truncate flex-1 font-mono">{p.path}</span>
                        <span className="text-stone-600 ml-2">{p.page_views} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-400 py-4 text-center">Select a property and click "Pull Data"</p>
          )}
        </div>
      </div>

      {/* Contacts Sync */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="font-bold text-stone-900">Google Contacts Sync</h2>
          </div>
          <button
            onClick={handleSyncContacts}
            disabled={actionLoading === "contacts"}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition disabled:opacity-50"
          >
            {actionLoading === "contacts" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            Sync Leads → Contacts
          </button>
        </div>
        <p className="text-sm text-stone-500">
          Syncs all leads from the database to Google Contacts (skips duplicates by email). Each contact gets name, email, phone, and lead type.
        </p>
        {contactsData && (
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-sm">
            <span className="font-bold text-purple-800">✅ Sync Complete:</span>
            <span className="text-purple-700"> {contactsData.synced} synced, {contactsData.skipped} skipped (duplicates), {contactsData.errors} errors (total: {contactsData.total})</span>
          </div>
        )}
      </div>

      {/* Digital Dominance Plan Summary */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-xl p-5 text-white space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-amber-400" />
          <h2 className="font-bold">Digital Dominance Plan — Google Alignment</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white/10 p-3">
            <p className="font-bold text-amber-400 mb-1">✅ Already Connected (Free)</p>
            <ul className="text-xs text-stone-300 space-y-0.5">
              <li>• Search Console — SEO monitoring</li>
              <li>• Analytics (GA4) — Traffic & conversions</li>
              <li>• Calendar — Appointment scheduling</li>
              <li>• Gmail — Lead follow-up emails</li>
              <li>• Drive — Document storage (51 folders)</li>
              <li>• Sheets — CRM data tracking</li>
              <li>• Docs — Proposals & estimates</li>
              <li>• Tasks — Agent task management</li>
              <li>• Contacts — Customer database</li>
              <li>• Slides — Sales presentations</li>
              <li>• Forms — Intake questionnaires</li>
              <li>• Photos — Project gallery storage</li>
              <li>• Meet — Virtual consultations</li>
              <li>• BigQuery — Large data analysis</li>
              <li>• Classroom — Agent training</li>
            </ul>
          </div>
          <div className="rounded-lg bg-white/10 p-3">
            <p className="font-bold text-amber-400 mb-1">⚠️ Needs External Setup</p>
            <ul className="text-xs text-stone-300 space-y-0.5">
              <li>• Google My Business — Claim & verify business profile</li>
              <li>• Google Maps — Get Maps API key (billing required)</li>
              <li>• YouTube — Create channels for both companies</li>
              <li>• Google Ads — Apply for developer token</li>
              <li>• Google Tag Manager — Set up containers manually</li>
              <li>• Google Keep — No official API (use Tasks instead)</li>
              <li>• Google Merchant Center — If e-commerce needed</li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-stone-400 pt-2 border-t border-white/10">
          <span className="font-bold text-amber-400">Next Steps:</span> Verify Search Console properties for both domains, set up GA4 properties, claim Google My Business profile for Xtreme Polishing, and create YouTube channels.
        </div>
      </div>
    </div>
  );
}