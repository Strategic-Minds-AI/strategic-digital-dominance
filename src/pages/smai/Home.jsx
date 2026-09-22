import React from "react";
import { Link } from "react-router-dom";
import { Brain, TrendingUp, Code2, ArrowRight, CheckCircle2, Target, Zap, BarChart3, Sparkles, Search, Trophy, Database, Building2, Radar, Workflow, Eye } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";
import AIScene from "@/components/smai/AIScene";

// Uploaded images
const IMG_AI_HEAD = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/df1986b73_generated_image.png";
const IMG_CIRCUIT = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/74b8b9512_images1.jpg";
const IMG_FACE = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/34eb6d9be_images.jpg";
const IMG_CORRIDOR = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/3f57fb33d_pic1.jpg";
const IMG_NEURAL = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/41aa58fee_pic7.jpg";
const IMG_LAPTOP = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/abe9ee3e3_pic9.jpg";

const SERVICES = [
  { icon: Brain, title: "AI Consulting", desc: "Strategy, advisory, and digital transformation — we map your business to the AI landscape and build a roadmap to dominance.", points: ["AI Readiness Audits", "Strategy Roadmaps", "Process Automation", "Change Management"] },
  { icon: TrendingUp, title: "AI Marketing", desc: "SEO, content, social, and lead generation powered by autonomous AI agents that work 24/7 to grow your audience and pipeline.", points: ["Autonomous SEO", "Content Engines", "Lead Generation", "Social Media Automation"] },
  { icon: Code2, title: "AI Software Creation", desc: "Custom AI apps, agents, and SaaS products built end-to-end — from vision to deployed, revenue-generating software.", points: ["Custom AI Apps", "Agent Systems", "SaaS Products", "API Integrations"] },
];

const COMPETITORS = [
  { category: "AI Consulting", companies: [
    { name: "McKinsey QuantumBlack", url: "mckinsey.com", note: "Strategy + data science at board altitude" },
    { name: "BCG X", url: "bcg.com", note: "Co-builds AI products with client teams" },
    { name: "Accenture", url: "accenture.com", note: "Global scale, 700K+ employees trained on AI" },
    { name: "Deloitte", url: "deloitte.com", note: "Governance, compliance, trust frameworks" },
    { name: "BD Emerson", url: "bdemerson.com", note: "Boutique, production-grade AI delivery" },
  ]},
  { category: "Data Intelligence", companies: [
    { name: "Databricks", url: "databricks.com", note: "Lakehouse architecture for analytics + ML" },
    { name: "Snowflake Cortex", url: "snowflake.com", note: "AI layer on cloud data platform" },
    { name: "Alation", url: "alation.com", note: "Data catalog + intelligence platform" },
    { name: "Tellius", url: "tellius.com", note: "Agentic analytics with 24/7 KPI monitoring" },
    { name: "Ataccama", url: "ataccama.com", note: "Automated data quality + governance" },
  ]},
  { category: "AI Software Development", companies: [
    { name: "DataRobot", url: "datarobot.com", note: "Enterprise AI platform, AutoML + MLOps" },
    { name: "LeewayHertz", url: "leewayhertz.com", note: "Custom AI/ML + blockchain engineering" },
    { name: "Intuz", url: "intuz.com", note: "AI PoC, product dev, workflow automation" },
    { name: "Azumo", url: "azumo.com", note: "Nearshore AI agents + platform engineering" },
    { name: "SoftKraft", url: "softkraft.co", note: "Bespoke intelligent software development" },
  ]},
];

const STATS = [
  { value: "50+", label: "AI Deployments" },
  { value: "3x", label: "Avg. Revenue Lift" },
  { value: "24/7", label: "Autonomous Systems" },
  { value: "90%", label: "Client Retention" },
];

const PROCESS = [
  { step: "01", title: "Discover", desc: "We audit your business, market, and data to find the highest-impact AI opportunities." },
  { step: "02", title: "Strategize", desc: "We build a detailed roadmap with clear milestones, KPIs, and revenue projections." },
  { step: "03", title: "Build", desc: "Our agent teams design, code, and deploy your AI systems — autonomously and fast." },
  { step: "04", title: "Scale", desc: "We monitor, optimize, and expand your AI systems for compounding returns over time." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-950">
      <SmaiNav />

      {/* ═══ HERO — Dark with 3D moving graphic ═══ */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-y-0 left-[30%] right-0">
          <AIScene />
        </div>
        <div aria-hidden className="absolute inset-y-0 left-0 w-[55%] z-[1] pointer-events-none" style={{ background: "linear-gradient(to right, #0c0a09 55%, transparent 100%)" }} />

        <div className="relative z-10 h-full flex flex-col px-6 md:px-14 pointer-events-none">
          <div className="flex justify-between font-mono text-[10px] md:text-xs text-stone-500 tracking-[0.25em] pt-24">
            <span>SYS.STATUS — ONLINE</span>
            <span>V.2026.09 / STRATEGIC MINDS AI</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className="max-w-[58vw] md:max-w-[46vw]">
              <p className="font-mono text-[10px] md:text-xs text-cyan-400 tracking-[0.3em] mb-8">
                STRATEGIC MINDS AI — ADVISORY
              </p>
              <h1 className="font-heading text-[12vw] md:text-[8.5vw] leading-[0.9] tracking-tight text-white">
                <span className="block overflow-hidden"><span className="block">WE TURN</span></span>
                <span className="block overflow-hidden"><span className="block italic electric-text-animate">AI INTO</span></span>
                <span className="block overflow-hidden"><span className="block">ADVANTAGE.</span></span>
              </h1>
              <p className="mt-6 font-mono text-[11px] md:text-xs text-stone-400 tracking-[0.18em] max-w-sm leading-[2]">
                CONSULTING. MARKETING.<br />SOFTWARE CREATION.
              </p>
              <div className="mt-8 pointer-events-auto inline-block">
                <Link to="/smai/contact" className="font-mono text-[11px] tracking-[0.25em] border border-cyan-400 text-cyan-400 px-7 py-3.5 hover:bg-cyan-400 hover:text-stone-950 transition-colors duration-300 electric-glow">
                  BOOK A STRATEGY CALL →
                </Link>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center font-mono text-[10px] md:text-xs text-stone-500 tracking-[0.25em] pb-10">
            <span>STRATEGICMINDSAI.COM — EST. 2024</span>
            <span className="animate-pulse text-cyan-400">SCROLL ↓</span>
          </div>
        </div>
      </section>

      {/* ═══ STATS — Dark band ═══ */}
      <section className="border-y border-stone-800 bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black electric-text">{s.value}</div>
                <div className="text-xs text-stone-500 mt-1 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES — WHITE section with black text ═══ */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] tracking-[0.3em] text-blue-500 uppercase mb-3">— WHAT WE DO —</p>
            <h2 className="text-3xl md:text-4xl font-black text-stone-950 mb-3">Three Services. One System.</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">From AI strategy to deployed systems to scaled growth — all under one roof.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="group rounded-2xl border border-stone-200 bg-stone-50 p-7 hover:border-cyan-400 hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-xl electric-bg flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/20 electric-glow">
                  <s.icon className="w-6 h-6 text-stone-950" />
                </div>
                <h3 className="text-xl font-bold text-stone-950 mb-2">{s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MORE SERVICES — WHITE section with black text ═══ */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] tracking-[0.3em] text-blue-500 uppercase mb-3">— SPECIALIZED SERVICES —</p>
            <h2 className="text-3xl md:text-4xl font-black text-stone-950 mb-3">Beyond the Core</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">10 specialized AI services that give you a data-driven edge — from acquisition to intelligence to visualization.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: Database, label: "Data Acquisition" },
              { icon: Sparkles, label: "Intelligence Enrichment" },
              { icon: Search, label: "Skip Tracing" },
              { icon: Building2, label: "Real Estate Data Intel" },
              { icon: Target, label: "AI Lead Generation" },
              { icon: Radar, label: "Market Intelligence" },
              { icon: BarChart3, label: "Predictive Analytics" },
              { icon: Workflow, label: "Custom Data Pipelines" },
              { icon: Zap, label: "API & Integration" },
              { icon: Eye, label: "Data Visualization" },
            ].map((s) => (
              <Link to="/smai/services" key={s.label} className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-200 bg-stone-50 hover:border-cyan-400 hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-xl electric-bg flex items-center justify-center shadow-md shadow-cyan-500/20 electric-glow">
                  <s.icon className="w-5 h-5 text-stone-950" />
                </div>
                <span className="text-xs font-bold text-stone-700 text-center">{s.label}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/smai/services" className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-600 transition">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ IMAGE SHOWCASE — Dark with uploaded AI images ═══ */}
      <section className="bg-stone-950 py-20 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— DATA INTELLIGENCE —</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">The Intelligence Behind Our Systems</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">We operate at the intersection of data, AI, and human strategy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl overflow-hidden border border-stone-800 group h-80">
              <img src={IMG_AI_HEAD} alt="AI neural network" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-stone-800 group h-80">
              <img src={IMG_NEURAL} alt="Neural network web" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="rounded-2xl overflow-hidden border border-stone-800 group h-48">
              <img src={IMG_CIRCUIT} alt="Circuit board" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-stone-800 group h-48">
              <img src={IMG_FACE} alt="Digital face" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-stone-800 group h-48 col-span-2 md:col-span-1">
              <img src={IMG_CORRIDOR} alt="Technology corridor" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMPETITIVE INTELLIGENCE — WHITE section with black text ═══ */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] tracking-[0.3em] text-blue-500 uppercase mb-3">— COMPETITIVE INTELLIGENCE —</p>
            <h2 className="text-3xl md:text-4xl font-black text-stone-950 mb-3">The Landscape We Navigate</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">We've mapped the top players across AI consulting, data intelligence, and software development — so you don't have to.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMPETITORS.map((cat) => (
              <div key={cat.category} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-stone-950">{cat.category}</h3>
                </div>
                <div className="space-y-3">
                  {cat.companies.map((c, i) => (
                    <div key={c.name} className="flex items-start gap-3 pb-3 border-b border-stone-200 last:border-0 last:pb-0">
                      <span className="text-xs font-mono font-bold text-blue-500 shrink-0 w-5">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900 truncate">{c.name}</span>
                          <a href={`https://${c.url}`} target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline shrink-0">{c.url}</a>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{c.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 p-6">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-stone-950 mb-1">Our Differentiator</h4>
                <p className="text-sm text-stone-600">While the giants sell strategy decks and the boutiques ship one-off projects, Strategic Minds AI does both — our autonomous agent teams actually build and deploy your AI systems 24/7. No fragmented vendors. No strategy-only handoffs. Just outcomes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROCESS — Dark ═══ */}
      <section className="bg-stone-900/30 border-y border-stone-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— HOW WE WORK —</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">A Proven 4-Phase Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROCESS.map((p) => (
              <div key={p.step}>
                <div className="text-5xl font-black text-cyan-500/20 mb-3">{p.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LAPTOP IMAGE — Dark with uploaded image ═══ */}
      <section className="bg-stone-950 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— DEPLOYED INTELLIGENCE —</p>
            <h2 className="text-3xl font-black text-white mb-4">Your AI Systems, Running 24/7</h2>
            <p className="text-stone-400 leading-relaxed mb-6">We don't just advise — we build, deploy, and monitor autonomous AI systems that work around the clock. From data pipelines to customer-facing apps, your AI infrastructure runs continuously, learning and optimizing as it goes.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-start gap-3"><Target className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /><div><div className="text-sm font-bold text-white">Outcome-Driven</div><div className="text-xs text-stone-500">Tied to revenue and efficiency</div></div></div>
              <div className="flex items-start gap-3"><Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /><div><div className="text-sm font-bold text-white">Autonomous</div><div className="text-xs text-stone-500">Agent teams execute 24/7</div></div></div>
              <div className="flex items-start gap-3"><BarChart3 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /><div><div className="text-sm font-bold text-white">Full-Stack</div><div className="text-xs text-stone-500">Strategy + marketing + software</div></div></div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-800">
            <img src={IMG_LAPTOP} alt="AI data intelligence dashboard" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* ═══ CTA — Dark ═══ */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/20 via-stone-900 to-stone-950 border border-cyan-400/30 p-10 md:p-16 text-center electric-glow">
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Build Your AI Advantage?</h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8">Book a free strategy call. We'll audit your business and show you exactly where AI can drive the biggest impact.</p>
          <Link to="/smai/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl electric-bg text-stone-950 font-bold hover:opacity-90 transition shadow-lg shadow-cyan-500/30 electric-glow">
            Book Your Free Strategy Call<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SmaiFooter />
    </div>
  );
}