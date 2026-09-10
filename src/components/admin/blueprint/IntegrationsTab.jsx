import React from "react";
import { Plug, KeyRound, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const OAUTH = [
  { name: "Google Sheets", scopes: "spreadsheets, email", status: "authorized", purpose: "Lead sync spreadsheet" },
  { name: "Google Calendar", scopes: "calendar.events, email", status: "authorized", purpose: "Consultation booking", webhooks: true },
  { name: "Gmail", scopes: "gmail.send, email", status: "authorized", purpose: "Email sending", webhooks: true },
  { name: "Google Drive", scopes: "drive", status: "authorized", purpose: "Document storage" },
  { name: "Google Docs", scopes: "docs", status: "authorized", purpose: "Document generation" },
  { name: "Google Tasks", scopes: "tasks", status: "authorized", purpose: "Task management" },
  { name: "Google Search Console", scopes: "webmasters, email", status: "authorized", purpose: "SEO indexing + verification" },
  { name: "Google Analytics", scopes: "analytics.readonly, email", status: "authorized", purpose: "Traffic analytics" },
  { name: "Facebook Pages", scopes: "pages_manage_posts, pages_read_engagement", status: "authorized", purpose: "Social media auto-publishing" },
  { name: "HubSpot", scopes: "crm.objects.* (read/write), tickets", status: "authorized", purpose: "CRM contact/deal sync" },
];

const WORKSPACE = [
  { name: "Supabase", mode: "all", purpose: "Postgres database (migration target)" },
  { name: "GOOGLE DOCS", mode: "all", purpose: "Document generation" },
  { name: "GOOGLE CALENDER", mode: "all", purpose: "Calendar booking" },
  { name: "Hubspot", mode: "all", purpose: "CRM sync" },
  { name: "Google Tasks", mode: "all", purpose: "Task management" },
  { name: "Google Gmail", mode: "all", purpose: "Email sending" },
  { name: "Google Sheets", mode: "all", purpose: "Lead spreadsheet" },
  { name: "Google Drive", mode: "all", purpose: "File storage" },
];

const SECRETS = [
  { name: "RENTCAST_API_KEY", purpose: "Property record lookups", status: "set" },
  { name: "CLOUD_BROWSER_ENGINE_URL", purpose: "Railway browser engine endpoint", status: "set" },
  { name: "ENGINE_API_KEY", purpose: "Railway engine auth (x-api-key)", status: "set" },
  { name: "TELNYX_API_KEY", purpose: "Voice AI + SMS", status: "set" },
  { name: "XTREME_COMMUNICATION_API_KEY", purpose: "Multi-channel comms", status: "set" },
  { name: "SEOGENERATOR_API_KEY", purpose: "AI SEO content generation", status: "set" },
  { name: "BROWSERBASE_API_KEY", purpose: "Headless browser scraping", status: "set" },
  { name: "GOOGLE_CLIENT_ID", purpose: "Google OAuth", status: "set" },
  { name: "GOOGLE_CLIENT_SECRET", purpose: "Google OAuth", status: "set" },
  { name: "WIX_CHECKOUT_API_KEY", purpose: "Base44 Payments", status: "set" },
  { name: "WIX_CHECKOUT_SITE_ID", purpose: "Base44 Payments", status: "set" },
  { name: "WIX_CHECKOUT_APP_URL", purpose: "Payment return URL base", status: "set" },
  { name: "WIX_CHECKOUT_WEBHOOK_PUBLIC_KEY", purpose: "Payment webhook verification", status: "set" },
  { name: "WIX_PAYMENTS_SITE_ID", purpose: "Base44 Payments", status: "set" },
  { name: "WIX_PAYMENTS_API_KEY", purpose: "Base44 Payments", status: "set" },
  { name: "WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY", purpose: "Payment webhook verification", status: "set" },
];

const STATUS_STYLE = {
  authorized: { icon: CheckCircle2, color: "emerald", label: "Authorized" },
  set: { icon: CheckCircle2, color: "emerald", label: "Set" },
  pending: { icon: Clock, color: "amber", label: "Pending" },
  error: { icon: AlertCircle, color: "red", label: "Error" },
};

export default function IntegrationsTab() {
  return (
    <div className="space-y-8">
      {/* OAuth Connectors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Plug className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-stone-900">OAuth Connectors</h2>
          <span className="text-[10px] text-stone-400">({OAUTH.length} authorized)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {OAUTH.map((c) => {
            const st = STATUS_STYLE[c.status];
            const Icon = st.icon;
            return (
              <div key={c.name} className="rounded-lg border border-stone-200 p-3 hover:border-amber-400 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-stone-900">{c.name}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold text-${st.color}-600`}>
                    <Icon className="h-3 w-3" /> {st.label}
                  </span>
                </div>
                <div className="text-xs text-stone-500">{c.purpose}</div>
                <div className="text-[10px] text-stone-400 font-mono mt-1 truncate">{c.scopes}</div>
                {c.webhooks && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded mt-1 inline-block">WEBHOOKS</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Connectors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Plug className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-bold text-stone-900">Workspace-Registered Connectors</h2>
          <span className="text-[10px] text-stone-400">({WORKSPACE.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {WORKSPACE.map((c) => (
            <div key={c.name} className="rounded-lg border border-stone-200 p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-stone-900">{c.name}</div>
                <div className="text-xs text-stone-500">{c.purpose}</div>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">mode: {c.mode}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secrets / Env Vars */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-bold text-stone-900">Secrets / Environment Variables</h2>
          <span className="text-[10px] text-stone-400">({SECRETS.length} set)</span>
        </div>
        <div className="space-y-1">
          {SECRETS.map((s) => {
            const st = STATUS_STYLE[s.status];
            const Icon = st.icon;
            return (
              <div key={s.name} className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2">
                <Icon className={`h-4 w-4 text-${st.color}-500 shrink-0`} />
                <code className="text-xs font-mono font-bold text-stone-900 flex-1 min-w-0 truncate">{s.name}</code>
                <span className="text-xs text-stone-500 hidden md:block">{s.purpose}</span>
                <span className={`text-[10px] font-bold text-${st.color}-600 shrink-0`}>{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}