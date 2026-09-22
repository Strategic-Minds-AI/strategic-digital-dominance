import React from "react";
import { Link } from "react-router-dom";
import { Brain, TrendingUp, Code2, ArrowRight, CheckCircle2, Zap, Target, BarChart3, Sparkles } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";

const SERVICES = [
  {
    icon: Brain,
    title: "AI Consulting",
    desc: "Strategy, advisory, and digital transformation — we map your business to the AI landscape and build a roadmap to dominance.",
    points: ["AI Readiness Audits", "Strategy Roadmaps", "Process Automation", "Change Management"],
  },
  {
    icon: TrendingUp,
    title: "AI Marketing",
    desc: "SEO, content, social, and lead generation powered by autonomous AI agents that work 24/7 to grow your audience and pipeline.",
    points: ["Autonomous SEO", "Content Engines", "Lead Generation", "Social Media Automation"],
  },
  {
    icon: Code2,
    title: "AI Software Creation",
    desc: "Custom AI apps, agents, and SaaS products built end-to-end — from vision to deployed, revenue-generating software.",
    points: ["Custom AI Apps", "Agent Systems", "SaaS Products", "API Integrations"],
  },
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(212,175,55,0.1) 0%, transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Business Transformation
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Turn AI Into Your{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                Competitive Advantage
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-400 leading-relaxed mb-8 max-w-2xl">
              Strategic Minds AI Advisory helps businesses harness artificial intelligence for consulting, marketing,
              and custom software — turning emerging technology into measurable, compounding growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/smai/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold hover:from-amber-300 hover:to-amber-500 transition shadow-lg shadow-amber-500/30"
              >
                Book a Strategy Call
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/smai/services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-stone-700 text-white font-bold hover:border-amber-500 hover:text-amber-400 transition"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-800 bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs text-stone-500 mt-1 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">What We Do</h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Three integrated services that take you from AI strategy to deployed systems to scaled growth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="group rounded-2xl border border-stone-800 bg-stone-900/50 p-7 hover:border-amber-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 group-hover:bg-amber-500/20 transition">
                <s.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed mb-4">{s.desc}</p>
              <ul className="space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-stone-900/30 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">How We Work</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">A proven 4-phase process from discovery to scaled AI deployment.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROCESS.map((p) => (
              <div key={p.step} className="relative">
                <div className="text-5xl font-black text-amber-500/20 mb-3">{p.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Outcome-Driven</h3>
              <p className="text-sm text-stone-400">We tie every AI initiative to measurable revenue and efficiency gains.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Autonomous Execution</h3>
              <p className="text-sm text-stone-400">Our agent teams build and deploy 24/7 — not just advise, but execute.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Full-Stack</h3>
              <p className="text-sm text-stone-400">Strategy, marketing, and software under one roof — no fragmented vendors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-950 border border-amber-500/30 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Build Your AI Advantage?</h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8">
            Book a free strategy call. We'll audit your business and show you exactly where AI can drive the biggest impact.
          </p>
          <Link
            to="/smai/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold hover:from-amber-300 hover:to-amber-500 transition shadow-lg shadow-amber-500/30"
          >
            Book Your Free Strategy Call
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SmaiFooter />
    </div>
  );
}