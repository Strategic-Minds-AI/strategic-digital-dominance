import React, { useState } from "react";
import { Loader2, Workflow, CheckCircle2, ArrowRight, RefreshCw, Zap, Server, Search, FileText, Network, Bot, Shield, Play } from "lucide-react";

const WORKFLOW_STEPS = [
  { id: 1, label: "Niche Selection", icon: Search, desc: "Choose a need/emergency-driven niche from the universal registry", component: "NicheRegistry" },
  { id: 2, label: "Search Intelligence", icon: Search, desc: "Research top searches, volumes, lost clicks, TLD patterns", component: "SearchIntelligence" },
  { id: 3, label: "Business Name + Domain", icon: CheckCircle2, desc: "Generate names, check domain + business name availability", component: "BusinessNameGenerator" },
  { id: 4, label: "Simulation & Prediction", icon: Zap, desc: "Run parallel predictions with economic + psychology data", component: "SimulationEngine" },
  { id: 5, label: "Strategy Generation", icon: Network, desc: "Generate exhaustive programmatic strategy + timeline", component: "StrategyGenerator" },
  { id: 6, label: "Content Generation", icon: FileText, desc: "SEO/AEO/AI-optimized content meeting Google requirements", component: "ContentGenerator" },
  { id: 7, label: "Funnel Creation", icon: Zap, desc: "Psychology-based multi-template funnel", component: "FunnelCreator" },
  { id: 8, label: "Dominance Plan", icon: Shield, desc: "Every method for first-page Google domination", component: "DominanceGenerator" },
  { id: 9, label: "Form Flood", icon: Bot, desc: "Join every platform, directory, and group via cloud browser", component: "FormFlood" },
  { id: 10, label: "Vercel Provisioning", icon: Server, desc: "Deploy site to Vercel, attach domain, configure SSL/CDN", component: "Provisioning" },
  { id: 11, label: "Sync & Validate", icon: RefreshCw, desc: "Sync with Google Console, Analytics, validate every step", component: "Sync" },
  { id: 12, label: "Autonomous 24/7", icon: Bot, desc: "Enable headless agent for continuous testing + operation", component: "Autonomous" },
];

export default function WorkflowOrchestrator({ onJumpToTab, selectedNiche }) {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-2">
          <Workflow className="h-5 w-5 text-amber-500" />
          Live Workflow Orchestrator
        </h2>
        <p className="text-sm text-stone-500">
          The complete, live, real workflow from top to bottom in the most strategic and efficient order. Every step is 100% operational with validation and platform compliance.
        </p>
      </div>

      {/* Workflow visualization */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <div className="space-y-1">
          {WORKFLOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const hasNiche = step.id === 1 && selectedNiche;
            return (
              <div key={step.id}>
                <div
                  onClick={() => {
                    setActiveStep(step.id);
                    onJumpToTab?.(step.component);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${isActive ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${hasNiche ? "bg-emerald-500 text-white" : isActive ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-500"}`}>
                    {hasNiche ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-900 text-sm">{step.label}</h3>
                    <p className="text-xs text-stone-500">{step.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-300" />
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="ml-8 h-4 w-px bg-stone-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync capabilities */}
      <div className="bg-stone-900 rounded-2xl border border-stone-700 p-5 text-white">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <RefreshCw className="h-4 w-4 text-amber-400" /> Sync Capabilities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Google Search Console", desc: "Submit sitemaps, monitor indexing, track queries" },
            { label: "Google Analytics 4", desc: "Track traffic, conversions, user behavior" },
            { label: "Social Media", desc: "Auto-post to Facebook, Instagram, Twitter, LinkedIn" },
            { label: "Form Filling", desc: "Headless agents fill forms on directories & platforms" },
            { label: "Vercel Deployment", desc: "Auto-deploy, domain attach, SSL provisioning" },
            { label: "Headless Agents", desc: "24/7 autonomous testing & operation" },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-stone-800 border border-stone-700">
              <p className="text-sm font-semibold text-amber-400">{s.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Validation & compliance */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-emerald-500" /> Validation & Platform Compliance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Every step validated before proceeding",
            "100% compliance with Google's guidelines",
            "Platform-specific compliance checks",
            "Schema.org structured data validation",
            "Core Web Vitals monitoring",
            "Mobile-first responsive validation",
            "Accessibility (WCAG 2.1) checks",
            "Security headers validation",
            "Canonical tag verification",
            "XML sitemap validation",
            "robots.txt compliance",
            "SSL/HTTPS verification",
          ].map((v, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-xs text-stone-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Autonomous operation */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
        <h3 className="font-bold text-amber-700 flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4" /> Autonomous 24/7 Operation
        </h3>
        <p className="text-sm text-stone-700 mb-3">
          A headless agent designed to test the entire system lifecycle, then enable autonomous continuous operation:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Continuous content generation & publishing",
            "Automated indexing via IndexNow & Google APIs",
            "Health monitoring & auto-repair",
            "Scheduled sitemap updates",
            "Automated backlink monitoring",
            "Competitor tracking & response",
            "Performance optimization (Core Web Vitals)",
            "Autonomous form-filling on new platforms",
            "Social media auto-posting",
            "Review generation automation",
            "Trigger-based content updates",
            "Multiplier: scale from 1 to 1000+ sites",
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white">
              <Play className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-stone-700">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}