import React, { useState, useEffect } from "react";
import ArchitectureSection from "@/components/architecture/ArchitectureSection";
import { SERVICE_VERTICALS, ARCHITECTURE_LAYERS, BUILD_PHASES, TEMPLATE_TYPES, QUEUE_STAGES } from "@/data/serviceVerticals";
import { Compass, ArrowRight, CheckCircle2, Circle, AlertCircle, Zap, Globe, Bot, Video, Shield, Layers, Factory, Rocket, Eye, Brain, Filter, ShoppingCart, Layout, Send, TrendingUp, Share2, Lock, Target, Cpu, Database } from "lucide-react";

const SECTIONS = [
  { id: "executive", label: "Executive", icon: Compass },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "verticals", label: "Verticals", icon: Globe },
  { id: "domain", label: "Domain Engine", icon: Globe },
  { id: "factory", label: "Site Factory", icon: Factory },
  { id: "templates", label: "Templates", icon: Layout },
  { id: "queue", label: "Queue", icon: Zap },
  { id: "funnel", label: "Funnel", icon: Target },
  { id: "validation", label: "AI Validation", icon: Shield },
  { id: "video", label: "Video", icon: Video },
  { id: "workspace", label: "Workspace", icon: Database },
  { id: "swarm", label: "Swarm", icon: Bot },
  { id: "determinism", label: "Determinism", icon: Lock },
  { id: "scale", label: "Scale", icon: Rocket },
  { id: "phases", label: "Build Phases", icon: Compass },
];

const ICON_MAP = { Shield, Brain, Globe, Factory, Rocket, Bot, Eye, Filter, ShoppingCart, Layout, Send, TrendingUp, Share2, Video };

const STATUS_STYLE = {
  current: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/40", icon: Zap },
  next: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/40", icon: ArrowRight },
  planned: { bg: "bg-stone-800", text: "text-stone-400", border: "border-stone-700", icon: Circle },
};

export default function DeepArchitecture() {
  const [activeSection, setActiveSection] = useState("executive");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const totalServices = SERVICE_VERTICALS.reduce((sum, t) => sum + t.services.length, 0);
  const totalVolume = SERVICE_VERTICALS.reduce((sum, t) => sum + t.services.reduce((s, v) => s + v.est_volume, 0), 0);

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-black border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="h-8 w-8 text-amber-500" />
            <span className="text-xs font-bold tracking-[0.2em] text-amber-500 uppercase">XTREMEAUTOBUILDER.COM</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Deep Architecture — Universal Digital Dominance</h1>
          <p className="text-stone-400 mt-3 max-w-3xl text-lg">
            Deterministic plan for building thousands of Google-spec-compliant websites per day,
            ranking on the first page of Google for every "[service] near me" query in America,
            and operating hundreds of autonomous agents for continuous optimization.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <HeroMetric label="Target Scale" value="5,000/day" sub="pages built" />
            <HeroMetric label="Agent Count" value="100s/day" sub="autonomous agents" />
            <HeroMetric label="Domain Pattern" value="[svc]nearme.com" sub="universal hub" />
            <HeroMetric label="Service Verticals" value={`${totalServices}`} sub="emergency services" />
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${activeSection === s.id ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-stone-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {/* Executive Summary */}
        <ArchitectureSection id="executive" title="Executive Summary" subtitle="The mission, the method, and the measure of success" accent="#D4AF37">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Target className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">The Mission</h3>
              <p className="text-sm text-stone-400">Buy every available <code className="text-amber-400">[service]nearme.com</code> domain. Build thousands of Google-spec-compliant websites per day. Rank on page 1 for every emergency service query in America.</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Cpu className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">The Method</h3>
              <p className="text-sm text-stone-400">Deep architecture: 7 deterministic layers, dual-AI validation (GPT generates, Claude verifies), programmatic templates, autonomous swarm optimization. XTREMEAUTOBUILDER pipeline.</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <TrendingUp className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">The Measure</h3>
              <p className="text-sm text-stone-400">{totalServices} emergency service verticals. {(totalVolume / 1000000).toFixed(1)}M+ combined monthly "near me" searches. Every deployed site tracked, optimized, and ranked autonomously.</p>
            </div>
          </div>
          <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400 font-semibold mb-1">Determinism Mandate</p>
                <p className="text-sm text-stone-400">Everything below this page must be written into a deterministic plan before implementation. No ad-hoc builds. No non-deterministic LLM output touching production without fingerprinting and drift detection. This page is the source of truth.</p>
              </div>
            </div>
          </div>
        </ArchitectureSection>

        {/* Architecture Layers */}
        <ArchitectureSection id="layers" title="Deep Architecture — 7 Layers" subtitle="Each layer is deterministic at its base; AI is isolated to Layer 1 and validated before it touches anything below" accent="#D4AF37">
          <div className="space-y-3">
            {ARCHITECTURE_LAYERS.map((layer) => {
              const Icon = ICON_MAP[layer.icon] || Shield;
              return (
                <div key={layer.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5 hover:border-amber-500/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ borderColor: layer.color + "40", background: layer.color + "15" }}>
                        <Icon className="h-6 w-6" style={{ color: layer.color }} />
                      </div>
                      <span className="text-xs font-bold text-stone-500">L{layer.id}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white">{layer.name}</h3>
                      <p className="text-sm text-stone-400 mt-1 mb-3 italic">"{layer.principle}"</p>
                      <div className="flex flex-wrap gap-2">
                        {layer.components.map((c, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 border border-stone-700">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ArchitectureSection>

        {/* Service Verticals */}
        <ArchitectureSection id="verticals" title="Service Vertical Matrix" subtitle={`${totalServices} emergency / need-based services across 5 search-volume tiers — all will be launched`} accent="#FFEA00">
          <div className="space-y-4">
            {SERVICE_VERTICALS.map((tier) => (
              <div key={tier.tier} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-stone-800/50 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400">{tier.priority}</span>
                    <h3 className="font-bold text-white">Tier {tier.tier} — {tier.tier_label}</h3>
                    <span className="text-sm text-stone-500">{tier.volume_range}</span>
                  </div>
                  <span className="text-sm text-stone-500">{tier.services.length} services</span>
                </div>
                <div className="divide-y divide-stone-800">
                  {tier.services.map((s) => (
                    <div key={s.slug} className="flex items-center gap-4 px-5 py-3 hover:bg-stone-800/30 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{s.name}</span>
                          {s.emergency && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">24HR</span>}
                        </div>
                        <code className="text-xs text-stone-500">{s.slug}nearme.com</code>
                      </div>
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <span className="text-stone-400">{(s.est_volume / 1000).toFixed(0)}K/mo</span>
                        <span className="text-stone-400 capitalize">{s.category.replace("_", " ")}</span>
                        <span className="text-amber-400 font-medium">${s.avg_lead_value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ArchitectureSection>

        {/* Domain Engine */}
        <ArchitectureSection id="domain" title="Domain Acquisition Engine" subtitle="Search ALL [keyword]nearme.com domains — filter to available only — queue for auto-purchase" accent="#B8860B">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Globe className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">Bulk Domain Search</h3>
              <p className="text-sm text-stone-400 mb-3">Modify existing UrlStrategy system to search every possible [service]nearme.com combination across all {totalServices} service verticals × all US cities.</p>
              <div className="space-y-1.5">
                <FlowStep n="1" text="Generate [service]nearme.com for every vertical" />
                <FlowStep n="2" text="Generate [service][city]nearme.com for top 1000 cities" />
                <FlowStep n="3" text="GoDaddy API bulk availability check" />
                <FlowStep n="4" text="Filter: only show AVAILABLE domains" />
                <FlowStep n="5" text="Queue available domains for auto-purchase" />
              </div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <ShoppingCart className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">Auto-Purchase Pipeline</h3>
              <p className="text-sm text-stone-400 mb-3">When a domain is queued and approved, the system auto-purchases via GoDaddy API, points DNS to Vercel, and registers it in the FleetSystem domain portfolio.</p>
              <div className="space-y-1.5">
                <FlowStep n="1" text="Domain marked available → queue for purchase" />
                <FlowStep n="2" text="Operator approval (or auto-buy if enabled)" />
                <FlowStep n="3" text="GoDaddy API purchase" />
                <FlowStep n="4" text="DNS → Vercel nameservers" />
                <FlowStep n="5" text="FleetSystem record created" />
              </div>
            </div>
          </div>
        </ArchitectureSection>

        {/* Site Factory */}
        <ArchitectureSection id="factory" title="Programmatic Site Factory" subtitle="XTREMEAUTOBUILDER pipeline — 1000-5000 Google-spec-compliant pages per day" accent="#D4AF37">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Factory className="h-6 w-6 text-amber-500" />
              <h3 className="font-bold text-white">Build Pipeline</h3>
            </div>
            <div className="grid md:grid-cols-5 gap-3">
              {[
                { step: "Input", desc: "Domain + service vertical + city", icon: Globe },
                { step: "Template", desc: "Google-spec template assigned", icon: Layout },
                { step: "Content", desc: "RAG-grounded content generated", icon: Brain },
                { step: "Compile", desc: "Pages compiled (25-45 per site)", icon: Factory },
                { step: "Deploy", desc: "Vercel edge deploy + SSL", icon: Rocket },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                    <s.icon className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="text-sm font-bold text-white">{s.step}</p>
                  <p className="text-xs text-stone-500 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ArchitectureSection>

        {/* Templates */}
        <ArchitectureSection id="templates" title="Template System — Google Spec Compliance" subtitle="Every template follows Google's exact recommendations. Nothing less is acceptable." accent="#FFEA00">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATE_TYPES.map((t) => (
              <div key={t.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-amber-500/30 transition">
                <h3 className="font-bold text-white text-sm">{t.name}</h3>
                <p className="text-xs text-stone-500 mt-1">{t.pages_per_site} pages per site</p>
                <div className="mt-3 space-y-1">
                  {t.google_specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-stone-400">
                      <CheckCircle2 className="h-3 w-3 text-amber-500 shrink-0" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ArchitectureSection>

        {/* Queue System */}
        <ArchitectureSection id="queue" title="Queue System — 12-Stage Pipeline" subtitle="Every domain flows through 12 deterministic stages from discovery to ranking" accent="#B8860B">
          <div className="space-y-2">
            {QUEUE_STAGES.map((stage, i) => {
              const Icon = ICON_MAP[stage.icon] || Circle;
              return (
                <div key={stage.id} className="flex items-center gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: stage.color + "40", background: stage.color + "15" }}>
                      <Icon className="h-5 w-5" style={{ color: stage.color }} />
                    </div>
                    {i < QUEUE_STAGES.length - 1 && <div className="w-0.5 h-6 bg-stone-800 mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-600">{String(stage.id).padStart(2, "0")}</span>
                      <h3 className="font-bold text-white text-sm">{stage.name}</h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ArchitectureSection>

        {/* Funnel System */}
        <ArchitectureSection id="funnel" title="Funnel System" subtitle="Every site captures leads through a deterministic funnel" accent="#D4AF37">
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { step: "Landing", desc: "[service]nearme.com homepage — service + city targeted" },
              { step: "Engage", desc: "Service detail page — pricing, FAQ, reviews, before/after" },
              { step: "Capture", desc: "Quote form — name, phone, address, urgency" },
              { step: "Route", desc: "Lead → HubSpot + Google Sheet + Gmail + agent" },
            ].map((s, i) => (
              <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <h3 className="font-bold text-white text-sm">{s.step}</h3>
                </div>
                <p className="text-xs text-stone-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </ArchitectureSection>

        {/* AI Validation */}
        <ArchitectureSection id="validation" title="AI Validation Council" subtitle="GPT generates. Claude verifies. Nothing ships without dual-AI approval." accent="#FFEA00">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-white">GPT-5 — Generator</h3>
              </div>
              <p className="text-sm text-stone-400">Primary content generation. Writes page content, meta tags, schema, FAQ, video scripts. Temperature 0 for reproducibility.</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white">Claude — Validator</h3>
              </div>
              <p className="text-sm text-stone-400">Independent verification. Checks content against Google specs, E-E-A-T, YMYL, factual accuracy, and quality rubric. Rejects or approves.</p>
            </div>
          </div>
          <div className="mt-4 bg-stone-900 border border-stone-800 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3 text-sm">Validation Flow</h3>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400">GPT generates</span>
              <ArrowRight className="h-4 w-4 text-stone-600" />
              <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400">Claude validates</span>
              <ArrowRight className="h-4 w-4 text-stone-600" />
              <span className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-400">Fingerprint hash</span>
              <ArrowRight className="h-4 w-4 text-stone-600" />
              <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400">Deploy</span>
              <ArrowRight className="h-4 w-4 text-stone-600" />
              <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400">Reject → regenerate</span>
            </div>
          </div>
        </ArchitectureSection>

        {/* Video Pipeline */}
        <ArchitectureSection id="video" title="Video + YouTube Pipeline" subtitle="Ultra-realistic AI video → auto-post to YouTube + social media for every deployed site" accent="#EC4899">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Video className="h-6 w-6 text-pink-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Video Generation</h3>
              <p className="text-sm text-stone-400">Top-tier AI video (Veo 3 / Sora-tier). 6-8 second clips per service. Service-specific prompts. Professional voiceover.</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Share2 className="h-6 w-6 text-pink-400 mb-3" />
              <h3 className="font-bold text-white mb-2">YouTube Auto-Post</h3>
              <p className="text-sm text-stone-400">Every deployed site auto-generates a video and posts to YouTube. SEO-optimized title, description, tags. Links back to the site.</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Globe className="h-6 w-6 text-pink-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Social Auto-Post</h3>
              <p className="text-sm text-stone-400">Same video/content auto-posted to Facebook Pages. Matching social media presence for every website.</p>
            </div>
          </div>
        </ArchitectureSection>

        {/* Google Workspace */}
        <ArchitectureSection id="workspace" title="Google Workspace + Cloud Integration" subtitle="Every domain gets its own Google Workspace workspace auto-provisioned" accent="#D4AF37">
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Calendar", desc: "Auto-create events per site", icon: "📅" },
              { name: "Sheets", desc: "Lead tracking per domain", icon: "📊" },
              { name: "Docs", desc: "Content storage per domain", icon: "📄" },
              { name: "Drive", desc: "Asset storage per domain", icon: "📁" },
              { name: "Tasks", desc: "Optimization tasks per site", icon: "✅" },
              { name: "Gmail", desc: "Lead notifications per domain", icon: "📧" },
            ].map((tool, i) => (
              <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center hover:border-amber-500/30 transition">
                <div className="text-3xl mb-2">{tool.icon}</div>
                <h3 className="font-bold text-white text-sm">{tool.name}</h3>
                <p className="text-xs text-stone-500 mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
        </ArchitectureSection>

        {/* Swarm Optimization */}
        <ArchitectureSection id="swarm" title="Swarm Optimization" subtitle="Hundreds of agents continuously iterating, optimizing, and ranking every deployed site" accent="#B8860B">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <Bot className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">Agent Assignment</h3>
              <p className="text-sm text-stone-400">One agent per domain cluster (10-50 domains). Agents continuously monitor rankings, find content gaps, generate new content, and deploy fixes.</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <TrendingUp className="h-6 w-6 text-amber-500 mb-3" />
              <h3 className="font-bold text-white mb-2">6-Hour Optimization Cycle</h3>
              <p className="text-sm text-stone-400">Every 6 hours: pull GSC data → identify ranking gaps → generate content → dual-AI validate → deploy → submit to IndexNow → measure.</p>
            </div>
          </div>
        </ArchitectureSection>

        {/* Determinism */}
        <ArchitectureSection id="determinism" title="Determinism Framework" subtitle="How we make non-deterministic LLM output reproducible and auditable" accent="#FFEA00">
          <div className="space-y-3">
            {[
              { rule: "Temperature 0", desc: "All LLM calls use temperature=0 for maximum reproducibility" },
              { rule: "Output Fingerprinting", desc: "Every LLM output is SHA-256 hashed. Same prompt + same input → same hash. Drift = different hash = flagged for review" },
              { rule: "Dual Validation", desc: "GPT generates, Claude independently verifies. Both must agree before content ships" },
              { rule: "RAG Grounding", desc: "All content grounded in verified business facts + intelligence documents. No hallucination" },
              { rule: "Benchmark Constitution", desc: "Every page validated against deterministic benchmarks (Schema, CWV, canonical, sitemap) before deploy" },
              { rule: "Evidence Receipts", desc: "Every action produces an evidence receipt. No assertion without proof" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-stone-900 border border-stone-800 rounded-xl p-4">
                <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">{r.rule}</h3>
                  <p className="text-sm text-stone-400 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ArchitectureSection>

        {/* Scale */}
        <ArchitectureSection id="scale" title="Scale Targets" subtitle="Throughput, rate limits, and cost management for 5000 pages/day" accent="#D4AF37">
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: "Pages / Day", value: "5,000", sub: "compiled + deployed" },
              { label: "Sites / Day", value: "150+", sub: "new domains built" },
              { label: "Agents / Day", value: "100s", sub: "autonomous agents" },
              { label: "Videos / Day", value: "150+", sub: "AI-generated + posted" },
            ].map((s, i) => (
              <div key={i} className="bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/20 rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-amber-400">{s.value}</p>
                <p className="text-sm font-medium text-white mt-1">{s.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </ArchitectureSection>

        {/* Build Phases */}
        <ArchitectureSection id="phases" title="Build Phases — 9 Phases to Full Autonomy" subtitle="Every phase has a deterministic gate. No phase starts until the previous gate passes." accent="#D4AF37">
          <div className="space-y-3">
            {BUILD_PHASES.map((p) => {
              const style = STATUS_STYLE[p.status] || STATUS_STYLE.planned;
              const StatusIcon = style.icon;
              return (
                <div key={p.phase} className={`bg-stone-900 border rounded-xl p-5 ${style.border}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-stone-600">PHASE {p.phase}</span>
                        <h3 className="font-bold text-white">{p.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>{p.status}</span>
                        <span className="text-xs text-stone-500">{p.duration}</span>
                      </div>
                      <div className="mt-3 grid md:grid-cols-2 gap-2">
                        {p.deliverables.map((d, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-stone-400">
                            <CheckCircle2 className="h-4 w-4 text-stone-600 shrink-0 mt-0.5" />
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <Shield className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-stone-500">Gate:</span>
                        <span className="text-amber-400 font-medium">{p.gate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ArchitectureSection>
      </div>
    </div>
  );
}

function HeroMetric({ label, value, sub }) {
  return (
    <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-4">
      <p className="text-2xl font-bold text-amber-400">{value}</p>
      <p className="text-sm font-medium text-white mt-1">{label}</p>
      <p className="text-xs text-stone-500">{sub}</p>
    </div>
  );
}

function FlowStep({ n, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-stone-400">
      <span className="w-5 h-5 rounded bg-stone-800 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">{n}</span>
      {text}
    </div>
  );
}