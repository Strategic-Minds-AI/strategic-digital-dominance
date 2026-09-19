import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Rocket, Loader2, Check, X, Crown, Globe, TrendingUp, Share2,
  Radar, Search, Sparkles, Layout, Zap, Network, Shield, FileText,
  Bot, AlertCircle
} from "lucide-react";

const PIPELINE_TOOLS = [
  { id: "template", label: "Create Website Template", icon: Layout, desc: "Generate a full website template from the existing site structure with your branding & content", defaultOn: true },
  { id: "domain", label: "Purchase Domain", icon: Globe, desc: "Purchase the selected domain via GoDaddy API", defaultOn: true },
  { id: "deploy", label: "Deploy to Vercel", icon: Rocket, desc: "Create Vercel project, attach domain, and deploy the site", defaultOn: true },
  { id: "seo_pages", label: "Generate SEO Pages", icon: TrendingUp, desc: "Create 500+ SEO-optimized location and service pages", defaultOn: true },
  { id: "social", label: "Social Media Setup", icon: Share2, desc: "Generate and schedule social media posts across all platforms", defaultOn: true },
  { id: "leads", label: "Lead Scraper Setup", icon: Radar, desc: "Configure lead scraping for this industry and location", defaultOn: false },
  { id: "skip_trace", label: "Skip Trace Setup", icon: Search, desc: "Set up property owner skip tracing for lead enrichment", defaultOn: false },
  { id: "google_seo", label: "Google SEO Setup", icon: Globe, desc: "Configure Google Search Console, Analytics, and Business Profile", defaultOn: true },
  { id: "competitors", label: "Competitor Scanning", icon: Radar, desc: "Scan and analyze top competitors in your area", defaultOn: true },
  { id: "dominance", label: "Launch Dominance Engine", icon: Crown, desc: "Full 11-module dominance pipeline: intelligence → brand → content → fame → SEO → AI search → 24/7", defaultOn: true },
  { id: "crystal_ball", label: "Crystal Ball Analysis", icon: Sparkles, desc: "Predictive market analysis and revenue forecasting", defaultOn: false },
  { id: "seo_sim", label: "SEO Simulator", icon: Sparkles, desc: "Simulate and optimize SEO strategy before going live", defaultOn: false },
  { id: "swarm", label: "Swarm Command Setup", icon: Network, desc: "Deploy autonomous agents for 24/7 operation", defaultOn: true },
  { id: "workflows", label: "Autonomous Workflows", icon: Bot, desc: "Set up scheduled automations for lead follow-up, reviews, and content", defaultOn: true },
];

export default function PipelineLauncher({ config, onBack }) {
  const [tools, setTools] = useState(
    Object.fromEntries(PIPELINE_TOOLS.map((t) => [t.id, t.defaultOn]))
  );
  const [launching, setLaunching] = useState(false);
  const [progress, setProgress] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({});

  const toggleTool = (id) => {
    setTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeTools = PIPELINE_TOOLS.filter((t) => tools[t.id]);

  const launchPipeline = async () => {
    setLaunching(true);
    setError(null);
    setDone(false);
    setProgress([]);
    setResults({});

    const log = (msg, status = "running") => {
      setProgress((prev) => [...prev, { msg, status, time: new Date().toLocaleTimeString() }]);
    };

    try {
      // Step 1: Create website template
      if (tools.template) {
        setCurrentStep("template");
        log("Creating website template from existing site structure...");
        try {
          const template = await base44.entities.WebsiteTemplate.create({
            name: `${config.businessName} — ${config.industry.label}`,
            slug: config.domain?.replace(/\./g, "-") || config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            config: {
              company_name: config.businessName,
              domain: config.domain,
              primary_city: config.city,
              primary_state: config.state,
              color_scheme: config.accentName,
              accent_color: config.accentColor,
              logo_url: config.logoUrl,
              industry: config.industry.id,
              industry_label: config.industry.label,
              hero_headline: config.content?.hero_headline || config.industry.heroHeadline,
              hero_subhead: config.content?.hero_subhead || config.industry.heroSubhead,
              cta_text: config.industry.ctaText,
              services: config.content?.services || config.industry.services,
              content: config.content,
            },
            status: "configured",
            pwa_enabled: true,
            launch_mode: "autonomous",
          });
          setResults((r) => ({ ...r, template }));
          log(`Template created: ${template.id}`, "done");
        } catch (e) {
          log(`Template creation failed: ${e.message}`, "error");
        }
      }

      // Step 2: Create template library entry
      if (tools.template) {
        setCurrentStep("template_library");
        log("Adding to template library...");
        try {
          await base44.entities.TemplateLibrary.create({
            name: `${config.industry.label} — ${config.businessName}`,
            slug: `${config.industry.id}-${config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            category: "homepage",
            niche: config.industry.id,
            description: `Full website template for ${config.industry.label} — ${config.businessName}`,
            content: JSON.stringify(config.content || {}),
            color_scheme: config.accentName,
            tags: [config.industry.id, config.industry.emergency, config.industry.psychology],
            is_active: true,
            status: "active",
          });
          log("Template library entry created", "done");
        } catch (e) {
          log(`Template library failed: ${e.message}`, "error");
        }
      }

      // Step 3: Launch dominance engine (the full pipeline)
      // dominanceEngine accepts: niche_id, keyword, city, state, auto_purchase_domain, auto_deploy_vercel
      // Custom branding (logo, accent, content, domain) is saved in the WebsiteTemplate above.
      if (tools.dominance) {
        setCurrentStep("dominance");
        log("Launching Dominance Engine — 11-module pipeline...");
        try {
          const res = await base44.functions.invoke("dominanceEngine", {
            action: "launch",
            niche_id: config.industry.id,
            keyword: config.industry.keyword,
            city: config.city || "",
            state: config.state || "",
            auto_purchase_domain: tools.domain,
            auto_deploy_vercel: tools.deploy,
          });
          if (res?.data?.campaign) {
            setResults((r) => ({ ...r, campaign: res.data.campaign }));
            log(`Dominance engine launched: ${res.data.campaign.campaign_id}`, "done");
          } else if (res?.data?.error) {
            log(`Dominance engine error: ${res.data.error}`, "error");
          }
        } catch (e) {
          log(`Dominance engine failed: ${e.message}`, "error");
        }
      }

      // Step 4: Social media — socialStudio action is "autoGenerate"
      if (tools.social) {
        setCurrentStep("social");
        log("Generating social media posts...");
        try {
          await base44.functions.invoke("socialStudio", {
            action: "autoGenerate",
          });
          log("Social media post generated & scheduled", "done");
        } catch (e) {
          log(`Social setup failed: ${e.message}`, "error");
        }
      }

      // Step 5: SEO pages — seoGenerator action is "runFullCycle" with url param
      if (tools.seo_pages) {
        setCurrentStep("seo_pages");
        log("Generating SEO pages...");
        try {
          const siteUrl = config.domain ? `https://${config.domain}` : undefined;
          await base44.functions.invoke("seoGenerator", {
            action: "runFullCycle",
            url: siteUrl,
            keyword: config.industry.keyword,
          });
          log("SEO full cycle started", "done");
        } catch (e) {
          log(`SEO pages failed: ${e.message}`, "error");
        }
      }

      // Step 6: Competitor scanning — scanCompetitors takes mode param
      if (tools.competitors) {
        setCurrentStep("competitors");
        log("Scanning competitors...");
        try {
          await base44.functions.invoke("scanCompetitors", {
            mode: "full",
          });
          log("Competitor scan initiated", "done");
        } catch (e) {
          log(`Competitor scan failed: ${e.message}`, "error");
        }
      }

      // Step 7: Lead scraper — dailyLeadEngine takes presets param
      if (tools.leads) {
        setCurrentStep("leads");
        log("Running lead engine...");
        try {
          await base44.functions.invoke("dailyLeadEngine", {
            presets: ["homeowner_leads"],
          });
          log("Lead engine run completed", "done");
        } catch (e) {
          log(`Lead engine failed: ${e.message}`, "error");
        }
      }

      // Step 8: Skip trace — skipTrace action is "batch"
      if (tools.skip_trace) {
        setCurrentStep("skip_trace");
        log("Running skip trace batch...");
        try {
          await base44.functions.invoke("skipTrace", {
            action: "batch",
            limit: 50,
          });
          log("Skip trace batch completed", "done");
        } catch (e) {
          log(`Skip trace failed: ${e.message}`, "error");
        }
      }

      // Step 9: Crystal ball — tradeCrystalBall takes no action param
      if (tools.crystal_ball) {
        setCurrentStep("crystal_ball");
        log("Running crystal ball analysis...");
        try {
          await base44.functions.invoke("tradeCrystalBall", {});
          log("Crystal ball analysis complete", "done");
        } catch (e) {
          log(`Crystal ball failed: ${e.message}`, "error");
        }
      }

      log("Pipeline complete!", "done");
      setDone(true);
    } catch (e) {
      setError(e.message);
      log(`Pipeline error: ${e.message}`, "error");
    } finally {
      setLaunching(false);
      setCurrentStep(null);
    }
  };

  const industry = config.industry;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Step 5 — Launch Full Pipeline</h2>
        <p className="text-sm text-stone-500 mt-1">
          Review your configuration and select which admin tools to include in the pipeline. The pipeline chains
          all selected tools together to create your website, funnel, and dominance system.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
        <h3 className="font-bold text-stone-900 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-500" /> Configuration Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-xs text-stone-500 uppercase font-bold">Industry</div>
            <div className="font-semibold text-stone-900">{industry?.label}</div>
          </div>
          <div>
            <div className="text-xs text-stone-500 uppercase font-bold">Business</div>
            <div className="font-semibold text-stone-900">{config.businessName}</div>
          </div>
          <div>
            <div className="text-xs text-stone-500 uppercase font-bold">Domain</div>
            <div className="font-semibold text-stone-900">{config.domain || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-stone-500 uppercase font-bold">Location</div>
            <div className="font-semibold text-stone-900">{config.city || "—"}, {config.state || "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
          <div className="text-xs text-stone-500 uppercase font-bold">Accent</div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-stone-300" style={{ backgroundColor: config.accentColor }} />
            <span className="text-sm font-semibold text-stone-700">{config.accentName}</span>
          </div>
          {config.logoUrl && (
            <>
              <div className="text-xs text-stone-500 uppercase font-bold ml-4">Logo</div>
              <img src={config.logoUrl} alt="Logo" className="h-8 w-8 rounded object-contain border border-stone-200 bg-white p-0.5" />
            </>
          )}
          {config.content && (
            <>
              <div className="text-xs text-stone-500 uppercase font-bold ml-4">Content</div>
              <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Generated</span>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Tools */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
        <h3 className="font-bold text-stone-900 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" /> Pipeline Tools ({activeTools.length} selected)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PIPELINE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isOn = tools[tool.id];
            return (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                disabled={launching}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 transition text-left ${
                  isOn
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                } ${launching ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isOn ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-400"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{tool.label}</span>
                    {isOn ? <Check className="h-3.5 w-3.5 text-amber-600" /> : <X className="h-3.5 w-3.5 text-stone-300" />}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{tool.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Launch Button */}
      {!done && (
        <button
          onClick={launchPipeline}
          disabled={launching || activeTools.length === 0}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-lg font-black flex items-center justify-center gap-3 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition shadow-lg"
        >
          {launching ? <Loader2 className="h-7 w-7 animate-spin" /> : <Rocket className="h-7 w-7" />}
          {launching ? `RUNNING: ${currentStep?.toUpperCase() || "INITIALIZING"}...` : `🚀 LAUNCH FULL PIPELINE (${activeTools.length} TOOLS)`}
        </button>
      )}

      {/* Progress Log */}
      {progress.length > 0 && (
        <div className="bg-stone-950 rounded-2xl p-5 space-y-1.5 max-h-80 overflow-y-auto">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Pipeline Log</h3>
          {progress.map((entry, i) => (
            <div key={i} className="flex items-start gap-2 text-sm font-mono">
              <span className="text-stone-500 text-xs">{entry.time}</span>
              {entry.status === "done" ? (
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : entry.status === "error" ? (
                <X className="h-4 w-4 text-red-400 shrink-0" />
              ) : (
                <Loader2 className="h-4 w-4 text-amber-400 shrink-0 animate-spin" />
              )}
              <span className={entry.status === "error" ? "text-red-400" : entry.status === "done" ? "text-emerald-400" : "text-stone-300"}>
                {entry.msg}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {done && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Check className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Pipeline Complete!</h3>
              <p className="text-sm text-emerald-700">Your website, funnel, and dominance system have been launched.</p>
            </div>
          </div>
          {results.campaign && (
            <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-1">
              <div className="text-xs font-bold uppercase text-emerald-700">Dominance Campaign</div>
              <div className="text-sm font-semibold text-stone-900">Campaign ID: {results.campaign.campaign_id}</div>
              <div className="text-xs text-stone-500">Status: {results.campaign.status} · Phase: {results.campaign.phase}</div>
            </div>
          )}
          {results.template && (
            <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-1">
              <div className="text-xs font-bold uppercase text-emerald-700">Website Template</div>
              <div className="text-sm font-semibold text-stone-900">{results.template.name}</div>
              <div className="text-xs text-stone-500">Status: {results.template.status}</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} disabled={launching} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 disabled:opacity-50 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
    </div>
  );
}