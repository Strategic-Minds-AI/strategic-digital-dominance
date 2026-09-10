import React from "react";
import {
  Globe, LayoutDashboard, Smartphone, Users, MapPin,
  ArrowRight, Database, Bot, Plug, Workflow, Shield, Code2
} from "lucide-react";

const SURFACES = [
  { icon: Globe, name: "Public Marketing Site", route: "/", tech: "React + Tailwind", desc: "Homeowner funnel → estimate → booking", color: "blue" },
  { icon: LayoutDashboard, name: "Admin Command Center", route: "/admin", tech: "30+ pages", desc: "Full operational control — leads, SEO, swarm, factory", color: "amber" },
  { icon: Smartphone, name: "Contractor App", route: "/contractor", tech: "5-tab mobile shell", desc: "Bids, leads pipeline, projects, inbox, tools", color: "emerald" },
  { icon: Users, name: "Customer Portal", route: "/portal", tech: "Tabbed portal", desc: "Project tracking, maintenance, scheduling, AI chat", color: "purple" },
  { icon: MapPin, name: "Dynamic SEO Pages", route: "/:state/:city", tech: "LocationSeoPage", desc: "Mass-produced city contractor sites", color: "cyan" },
];

const PILLARS = [
  { icon: Database, name: "Data Layer", count: "24 entities", desc: "Lead lifecycle, swarm intelligence, website factory, system config" },
  { icon: Bot, name: "AGI Swarm", count: "7 agents", desc: "Autonomous 30-min audit-fix-heal-harden-optimize cycle" },
  { icon: Plug, name: "Integrations", count: "7 OAuth + 8 API keys", desc: "Google Workspace, HubSpot, Facebook, Telnyx, Railway, RentCast" },
  { icon: Workflow, name: "Workflows", count: "11 automations", desc: "Scheduled + entity-triggered + connector-triggered processes" },
  { icon: Code2, name: "Backend Functions", count: "39 functions", desc: "Property lookup, SEO, comms, swarm orchestration, payments" },
  { icon: Shield, name: "Security", count: "RLS + API keys", desc: "Admin-only entities, API key auth, OAuth token vault" },
];

const FLOW = [
  { step: "Lead Capture", desc: "Funnel / Scraper / Social", icon: "📥" },
  { step: "Property Lookup", desc: "RentCast → OSM → Browserbase", icon: "🔍" },
  { step: "Estimate", desc: "AI pricing + visualizer", icon: "💰" },
  { step: "Enrichment", desc: "AI background + scoring", icon: "🧠" },
  { step: "Outreach", desc: "Email / SMS / Voice AI", icon: "📤" },
  { step: "Booking", desc: "Google Calendar consultation", icon: "📅" },
  { step: "Proposal", desc: "PDF bid + e-sign", icon: "✍️" },
  { step: "Project", desc: "ClientProject + timeline", icon: "🔨" },
  { step: "Maintenance", desc: "Care guide + warranty", icon: "🛡️" },
  { step: "Review", desc: "Auto Google review request", icon: "⭐" },
];

export default function ArchitectureTab() {
  return (
    <div className="space-y-8">
      {/* Surfaces */}
      <div>
        <h2 className="text-sm font-bold text-stone-900 mb-3">Product Surfaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SURFACES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.name} className="rounded-xl border border-stone-200 p-4 hover:border-amber-400 transition">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-stone-900">{s.name}</div>
                    <div className="text-xs text-stone-500 font-mono mt-0.5">{s.route}</div>
                    <div className="text-xs text-stone-600 mt-1">{s.desc}</div>
                    <div className="text-[10px] text-stone-400 mt-1">{s.tech}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Pillars */}
      <div>
        <h2 className="text-sm font-bold text-stone-900 mb-3">Core Pillars</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className="rounded-xl border border-stone-200 p-3 text-center">
                <Icon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-stone-900">{p.name}</div>
                <div className="text-[10px] text-amber-600 font-bold mt-0.5">{p.count}</div>
                <div className="text-[10px] text-stone-500 mt-1 leading-tight">{p.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Lifecycle Flow */}
      <div>
        <h2 className="text-sm font-bold text-stone-900 mb-3">Lead-to-Revenue Lifecycle</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {FLOW.map((f, i) => (
            <React.Fragment key={f.step}>
              <div className="rounded-xl border border-stone-200 px-3 py-2.5 min-w-[110px] text-center shrink-0">
                <div className="text-lg mb-0.5">{f.icon}</div>
                <div className="text-xs font-bold text-stone-900">{f.step}</div>
                <div className="text-[9px] text-stone-500 mt-0.5">{f.desc}</div>
              </div>
              {i < FLOW.length - 1 && <ArrowRight className="h-4 w-4 text-stone-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Infrastructure Map */}
      <div>
        <h2 className="text-sm font-bold text-stone-900 mb-3">Infrastructure Map</h2>
        <div className="rounded-xl bg-stone-900 p-5 text-white font-mono text-xs space-y-1">
          <div className="text-amber-400">┌─ Current (Base44-hosted)</div>
          <div>│  ├─ Frontend:  Vite + React + Tailwind → epoxyquotenearme.base44.app</div>
          <div>│  ├─ Database:  Base44 Entities (MongoDB-backed, SDK: base44.entities.*)</div>
          <div>│  ├─ Auth:      Base44 AuthProvider + JWT tokens</div>
          <div>│  ├─ Functions: 39 backend functions → /api/functions/*</div>
          <div>│  ├─ Workflows: 11 automations → Base44 workflow engine</div>
          <div>│  ├─ AI:        base44.integrations.Core.InvokeLLM / GenerateImage / SendEmail</div>
          <div>│  └─ Payments:  Base44 Payments (Wix Checkout)</div>
          <div className="text-emerald-400 mt-2">┌─ External (already independent)</div>
          <div>│  ├─ Railway:   Browser engine (CLOUD_BROWSER_ENGINE_URL + ENGINE_API_KEY)</div>
          <div>│  ├─ Browserbase: Headless browser scraping (BROWSERBASE_API_KEY)</div>
          <div>│  ├─ RentCast:   Property records API (RENTCAST_API_KEY)</div>
          <div>│  ├─ Telnyx:     Voice AI + SMS (TELNYX_API_KEY)</div>
          <div>│  ├─ Xtreme Comms: Multi-channel comms (XTREME_COMMUNICATION_API_KEY)</div>
          <div>│  ├─ Google:    OAuth (GOOGLE_CLIENT_ID/SECRET) — Calendar, Gmail, Sheets, Drive</div>
          <div>│  └─ HubSpot:    CRM sync (OAuth connector)</div>
          <div className="text-purple-400 mt-2">┌─ Migration Targets (planned)</div>
          <div>│  ├─ Vercel:       Frontend hosting + API routes + AI Gateway</div>
          <div>│  ├─ Supabase:     Postgres database + Auth + RLS + Storage</div>
          <div>│  ├─ Railway:      Long-running workers (swarm, scrapers, cron)</div>
          <div>│  └─ Google Workspace: Direct OAuth (bypass Base44 connectors)</div>
        </div>
      </div>
    </div>
  );
}