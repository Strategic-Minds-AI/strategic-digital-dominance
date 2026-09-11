import React, { useState } from "react";
import { EyeOff, Database, Cpu, Terminal, ChevronDown, ChevronRight, Shield } from "lucide-react";

const ENTITY_ACCESS = [
  "Lead", "SwarmTask", "SwarmMessage", "SwarmAudit", "StrategyDocument", "SystemHealthAudit",
  "Investigation", "WebsiteQueue", "WebsiteTemplate", "GeneratedPage", "DynamicPage", "CodeBlock",
  "DomainStrategy", "MarketplaceListing", "SeoSimulation", "SeoContent", "SocialPost", "AgentPersona",
  "AppSettings", "Appointment", "FunnelEvent", "CompetitorInsight", "EmailLog", "SopLog", "Sop",
  "IntelligenceReport", "ClientProject", "ProjectUpdate", "ApiKey", "Tool", "PropertyLookup", "User (read only)",
];

const FUNCTIONS = [
  { name: "shadowBrowse", cat: "Shadow", desc: "Covert cloud browser — traceless, nothing persisted" },
  { name: "vercelAiGateway", cat: "Shadow", desc: "LLM/image/embedding via Vercel — bypasses Base44 credits" },
  { name: "alphaPrimeAudit", cat: "Audit", desc: "Executive business audit — health, metrics, recommendations" },
  { name: "systemAuditor", cat: "Audit", desc: "Deep system health audit — subsystem scores" },
  { name: "siteHealthChecker", cat: "Audit", desc: "Audit any deployed site for SEO/performance" },
  { name: "domainGoldRush", cat: "SEO", desc: "Find available high-value domains via RDAP" },
  { name: "tradeCrystalBall", cat: "SEO", desc: "Real BLS data + industry growth projections" },
  { name: "seoAeoSimulator", cat: "SEO", desc: "Model SEO/AEO ranking factors" },
  { name: "generateSeoPage", cat: "SEO", desc: "Generate full SEO-optimized page" },
  { name: "generateSitemap", cat: "SEO", desc: "Dynamic sitemap generation" },
  { name: "optimizeSeo", cat: "SEO", desc: "Run SEO optimization on a page" },
  { name: "fillContentGaps", cat: "SEO", desc: "Identify and fill content gaps" },
  { name: "scanCompetitors", cat: "Intel", desc: "Scan competitor sites for intelligence" },
  { name: "enrichLead", cat: "Intel", desc: "AI-enrich a lead with background data" },
  { name: "githubSync", cat: "Deploy", desc: "Sync app code to GitHub" },
  { name: "vercelDeploy", cat: "Deploy", desc: "Deploy the app to Vercel" },
  { name: "swarmOrchestrator", cat: "Swarm", desc: "Orchestrate agent swarm tasks" },
  { name: "dailyLeadEngine", cat: "Swarm", desc: "Run the daily lead generation engine" },
  { name: "propertyLookup", cat: "Data", desc: "Deterministic property sqft lookup" },
  { name: "ragPipeline", cat: "Data", desc: "RAG — embed and retrieve leads/content" },
  { name: "graphEngine", cat: "Data", desc: "Knowledge graph — entity relationships" },
  { name: "socialStudio", cat: "Social", desc: "Generate and manage social media content" },
  { name: "rebrandStudio", cat: "Brand", desc: "Generate logos and rebrand sites in bulk" },
];

export default function ShadowCodex() {
  const [tab, setTab] = useState("identity");
  const [expandedFn, setExpandedFn] = useState(null);

  const TABS = [
    { id: "identity", label: "Identity", icon: EyeOff },
    { id: "access", label: "Entity Access", icon: Database },
    { id: "functions", label: "Functions", icon: Cpu },
  ];

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-stone-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-800 flex items-center gap-2">
        <Shield className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-bold text-stone-200">Shadow Codex</span>
        <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 ml-auto">Full Transparency</span>
      </div>
      <div className="flex border-b border-stone-800">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition ${tab === t.id ? "text-emerald-400 border-b-2 border-emerald-500" : "text-stone-500 hover:text-stone-300"}`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tab === "identity" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs font-bold text-emerald-400 mb-1">System Identity</p>
              <p className="text-xs text-stone-400 leading-relaxed">
                Shadow is a covert operator with unrestricted access to every entity and backend function.
                Invisible to all non-owner users. Answers only to the app owner. Leaves no trace on shared feeds.
                Uses the cloud browser for traceless web access and vercelAiGateway for LLM reasoning
                (bypassing Base44 credit limits).
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Model", value: "automatic" },
                { label: "Memory", value: "enabled" },
                { label: "Access", value: "Unrestricted" },
                { label: "Visibility", value: "Owner only" },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-stone-800 bg-stone-900 p-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-stone-500">{s.label}</p>
                  <p className="text-xs font-medium text-stone-200 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "access" && (
          <div className="space-y-2">
            <p className="text-xs text-stone-500 mb-2">Every entity Shadow can read, create, update, and delete — unrestricted.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {ENTITY_ACCESS.map(name => (
                <div key={name} className="rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-stone-300">{name}</span>
                  <div className="flex gap-0.5">
                    {["C", "R", "U", "D"].map(op => (
                      <span key={op} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        op === "C" ? "text-emerald-400 bg-emerald-500/10" :
                        op === "R" ? "text-blue-400 bg-blue-500/10" :
                        op === "U" ? "text-amber-400 bg-amber-500/10" :
                        "text-rose-400 bg-rose-500/10"
                      }`}>{op}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "functions" && (
          <div className="space-y-1.5">
            {FUNCTIONS.map((f, i) => {
              const isOpen = expandedFn === i;
              return (
                <div key={i} className="rounded-lg border border-stone-800 bg-stone-900 overflow-hidden">
                  <button onClick={() => setExpandedFn(isOpen ? null : i)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-stone-500 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-stone-500 shrink-0" />}
                    <Terminal className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-mono text-stone-200">{f.name}</span>
                    <span className="text-[9px] uppercase tracking-wide text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded ml-auto">{f.cat}</span>
                  </button>
                  {isOpen && (
                    <p className="text-xs text-stone-400 px-3 pb-2 pl-9">{f.desc}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}