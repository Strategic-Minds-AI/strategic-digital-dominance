import React from "react";
import { Code2, Server, Search, Mail, Bot, Factory, Shield } from "lucide-react";

const FUNCTIONS = [
  { name: "propertyLookup", group: "Lead/Property", desc: "Multi-source garage sqft lookup (RentCast → OSM → Browserbase → consensus)", secrets: ["RENTCAST_API_KEY", "BROWSERBASE_API_KEY"] },
  { name: "enrichLead", group: "Lead/Property", desc: "AI-enriched lead background (business, social, revenue, reviews)", secrets: [] },
  { name: "pushLeadToHubspot", group: "Lead/Property", desc: "Sync lead to HubSpot CRM (contact + deal)", secrets: [] },
  { name: "syncLeadToSheet", group: "Lead/Property", desc: "Sync lead to Google Sheets spreadsheet", secrets: [] },
  { name: "dailyLeadEngine", group: "Lead/Property", desc: "Daily scrape + enrich + score new leads", secrets: [] },
  { name: "sendEstimateEmail", group: "Lead/Property", desc: "Send branded PDF estimate to homeowner", secrets: [] },
  { name: "sendFollowUpEmail", group: "Lead/Property", desc: "Multi-touch follow-up email sequence", secrets: [] },
  { name: "sendReviewRequest", group: "Lead/Property", desc: "Auto-request Google review on project completion", secrets: [] },
  { name: "bookEstimate", group: "Lead/Property", desc: "Google Calendar consultation booking", secrets: [] },
  { name: "generateSeoPage", group: "SEO/Content", desc: "Generate SEO-optimized city landing page", secrets: ["SEOGENERATOR_API_KEY"] },
  { name: "seoGenerator", group: "SEO/Content", desc: "AI SEO content generation engine", secrets: ["SEOGENERATOR_API_KEY"] },
  { name: "optimizeSeo", group: "SEO/Content", desc: "Meta optimization + content gap filling", secrets: [] },
  { name: "fillContentGaps", group: "SEO/Content", desc: "Identify and fill missing SEO content", secrets: [] },
  { name: "generateSitemap", group: "SEO/Content", desc: "Generate XML sitemap", secrets: [] },
  { name: "generateRss", group: "SEO/Content", desc: "Generate RSS feed", secrets: [] },
  { name: "pingIndexNow", group: "SEO/Content", desc: "Ping IndexNow for instant indexing", secrets: [] },
  { name: "submitToIndexers", group: "SEO/Content", desc: "Submit URLs to search indexers", secrets: [] },
  { name: "notifySeoUpdates", group: "SEO/Content", desc: "Alert on ranking changes", secrets: [] },
  { name: "pullSearchConsoleData", group: "SEO/Content", desc: "Pull GSC search analytics", secrets: [] },
  { name: "fetchCoreWebVitals", group: "SEO/Content", desc: "Fetch CWV metrics", secrets: [] },
  { name: "verifySearchConsole", group: "SEO/Content", desc: "GSC domain verification", secrets: [] },
  { name: "checkGoogleStatus", group: "SEO/Content", desc: "Check Google indexing status", secrets: [] },
  { name: "addSearchConsoleProperty", group: "SEO/Content", desc: "Add GSC property", secrets: [] },
  { name: "googleVerifierConnectUrl", group: "SEO/Content", desc: "Get Google verifier connect URL", secrets: [] },
  { name: "googleVerifierExchange", group: "SEO/Content", desc: "Exchange Google verifier token", secrets: [] },
  { name: "swarmOrchestrator", group: "Swarm/AI", desc: "Run swarm autopilot cycle (audit-fix-heal-harden-optimize)", secrets: [] },
  { name: "aiAssist", group: "Swarm/AI", desc: "AI assistant for homeowner Q&A", secrets: [] },
  { name: "companyIntel", group: "Swarm/AI", desc: "Company intelligence research", secrets: [] },
  { name: "scanCompetitors", group: "Swarm/AI", desc: "Monitor competitor activity", secrets: [] },
  { name: "generateSop", group: "Swarm/AI", desc: "Generate standard operating procedure", secrets: [] },
  { name: "xtremeComms", group: "Comms", desc: "Multi-channel communication (SMS/MMS/voice)", secrets: ["XTREME_COMMUNICATION_API_KEY", "TELNYX_API_KEY"] },
  { name: "socialStudio", group: "Comms", desc: "Social media content generation + publish", secrets: [] },
  { name: "syncContentCalendar", group: "Comms", desc: "Sync content calendar", secrets: [] },
  { name: "railwayScraper", group: "Comms", desc: "Railway browser engine scraper", secrets: ["CLOUD_BROWSER_ENGINE_URL", "ENGINE_API_KEY"] },
  { name: "rebrandStudio", group: "Factory", desc: "AI logo generation + brand config + bulk site push", secrets: [] },
  { name: "apiKeyManager", group: "System", desc: "API key generation + validation", secrets: [] },
  { name: "checkQuestionnaireCompliance", group: "System", desc: "Compliance gate enforcement", secrets: [] },
  { name: "create-checkout", group: "Payments", desc: "Create Wix Checkout session", secrets: ["WIX_CHECKOUT_API_KEY", "WIX_CHECKOUT_SITE_ID"] },
  { name: "payments-webhook", group: "Payments", desc: "Handle payment webhook (grant access)", secrets: ["WIX_CHECKOUT_WEBHOOK_PUBLIC_KEY"] },
];

const GROUP_ICONS = {
  "Lead/Property": Server,
  "SEO/Content": Search,
  "Swarm/AI": Bot,
  "Comms": Mail,
  "Factory": Factory,
  "System": Shield,
  "Payments": Code2,
};

export default function FunctionsTab() {
  const groups = [...new Set(FUNCTIONS.map((f) => f.group))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900">Backend Function Registry</h2>
        <span className="text-xs text-stone-500">{FUNCTIONS.length} functions · {FUNCTIONS.filter(f => f.secrets.length > 0).length} use secrets</span>
      </div>

      {groups.map((group) => {
        const Icon = GROUP_ICONS[group] || Code2;
        const groupFuncs = FUNCTIONS.filter((f) => f.group === group);
        return (
          <div key={group}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide">{group}</h3>
              <span className="text-[10px] text-stone-400">({groupFuncs.length})</span>
            </div>
            <div className="space-y-1.5">
              {groupFuncs.map((f) => (
                <div key={f.name} className="rounded-lg border border-stone-200 px-3 py-2.5 hover:border-amber-400 transition">
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="text-sm font-bold text-stone-900 font-mono">{f.name}</code>
                    {f.secrets.length > 0 && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">🔐 {f.secrets.length} secrets</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{f.desc}</p>
                  {f.secrets.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {f.secrets.map((s) => (
                        <span key={s} className="text-[9px] font-mono bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}