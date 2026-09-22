import React from "react";
import { Link } from "react-router-dom";
import { Brain, Target, Eye, Zap, Users, Award, ArrowRight, Search } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";

const IMG_NEURAL = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/41aa58fee_pic7.jpg";

const VALUES = [
  { icon: Target, title: "Outcome Over Output", desc: "We measure success by your revenue and efficiency gains — not deliverables." },
  { icon: Zap, title: "Autonomous Execution", desc: "We don't just advise. Our agent teams build and deploy while you sleep." },
  { icon: Users, title: "Partnership First", desc: "We embed with your team and treat your business like our own." },
  { icon: Award, title: "Excellence by Default", desc: "Every system we ship is production-grade, tested, and built to scale." },
];

const TIMELINE = [
  { year: "2024", title: "Founded", desc: "Strategic Minds AI Advisory launched to bridge the gap between AI hype and business results." },
  { year: "2025", title: "Agent Platform", desc: "Built proprietary autonomous agent teams for consulting, marketing, and software creation." },
  { year: "2026", title: "Scaling", desc: "Deployed 50+ AI systems across consulting, marketing, and custom software for clients nationwide." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-stone-950">
      <SmaiNav />

      {/* Header — Dark */}
      <section className="border-b border-stone-800 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— ABOUT US —</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Strategic Minds AI</h1>
          <p className="text-lg text-stone-400 max-w-3xl">We're an AI advisory firm that doesn't just consult — we build, deploy, and scale autonomous AI systems that drive measurable business growth.</p>
        </div>
      </section>

      {/* Story — WHITE section with black text */}
      <section className="bg-white py-16 md:py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-blue-500 uppercase mb-3">— OUR STORY —</p>
            <h2 className="text-3xl font-black text-stone-950 mb-5">From AI Hype to Business Results</h2>
            <div className="space-y-4 text-stone-600 leading-relaxed">
              <p>Strategic Minds AI Advisory was born from a simple observation: most businesses know AI is important, but few know how to turn it into real, measurable value.</p>
              <p>We built a different kind of firm — one that doesn't just hand you a strategy deck and leave. Our autonomous agent teams actually execute: building your AI systems, running your marketing, and creating your software 24/7.</p>
              <p>The result? Clients who don't just understand AI — they dominate with it.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center"><div className="text-4xl font-black electric-text">50+</div><div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">AI Systems Deployed</div></div>
              <div className="text-center"><div className="text-4xl font-black electric-text">3x</div><div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">Avg. Revenue Lift</div></div>
              <div className="text-center"><div className="text-4xl font-black electric-text">24/7</div><div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">Agent Uptime</div></div>
              <div className="text-center"><div className="text-4xl font-black electric-text">90%</div><div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">Client Retention</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision — Dark */}
      <section className="bg-stone-900/30 border-y border-stone-800 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-stone-800 bg-stone-950/50 p-8">
            <Target className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-stone-400 leading-relaxed">To make AI accessible, practical, and profitable for businesses of every size — by building systems that deliver real outcomes, not just promises.</p>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-950/50 p-8">
            <Eye className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
            <p className="text-stone-400 leading-relaxed">A world where every business operates with an autonomous AI workforce — augmenting human teams and unlocking compounding growth.</p>
          </div>
        </div>
      </section>

      {/* Values — WHITE section with black text */}
      <section className="bg-white py-16 md:py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-[10px] tracking-[0.3em] text-blue-500 uppercase mb-3 text-center">— WHAT WE STAND FOR —</p>
          <h2 className="text-3xl font-black text-stone-950 mb-10 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-stone-200 bg-stone-50 p-6 hover:border-cyan-400 hover:shadow-lg transition">
                <div className="w-11 h-11 rounded-xl electric-bg flex items-center justify-center mb-4 shadow-md shadow-cyan-500/20 electric-glow">
                  <v.icon className="w-5 h-5 text-stone-950" />
                </div>
                <h4 className="text-base font-bold text-stone-950 mb-2">{v.title}</h4>
                <p className="text-sm text-stone-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image band — Dark with uploaded image */}
      <section className="bg-stone-950 border-y border-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— OUR INFRASTRUCTURE —</p>
            <h3 className="text-2xl font-black text-white mb-4">Built on Autonomous Agent Teams</h3>
            <p className="text-stone-400 leading-relaxed mb-4">Our proprietary agent infrastructure runs 24/7 — researching, building, deploying, and optimizing AI systems across consulting, marketing, and software creation. It's not just a tool we use; it's the product we deliver.</p>
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <Search className="w-4 h-4" /><span className="font-mono tracking-wide">CONTINUOUS DISCOVERY + EXECUTION</span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-800">
            <img src={IMG_NEURAL} alt="AI neural network infrastructure" className="w-full h-72 object-cover" />
          </div>
        </div>
      </section>

      {/* Timeline — WHITE section */}
      <section className="bg-white py-16 md:py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-[10px] tracking-[0.3em] text-blue-500 uppercase mb-3 text-center">— OUR JOURNEY —</p>
          <h2 className="text-3xl font-black text-stone-950 mb-10 text-center">The Road So Far</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIMELINE.map((t) => (
              <div key={t.year} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <div className="text-3xl font-black electric-text mb-2">{t.year}</div>
                <h4 className="text-lg font-bold text-stone-950 mb-2">{t.title}</h4>
                <p className="text-sm text-stone-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Dark */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/20 via-stone-900 to-stone-950 border border-cyan-400/30 p-10 md:p-14 text-center electric-glow">
          <Brain className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">Let's Work Together</h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8">We're selective about who we work with — but if you're ready to turn AI into your competitive edge, let's talk.</p>
          <Link to="/smai/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl electric-bg text-stone-950 font-bold hover:opacity-90 transition shadow-lg shadow-cyan-500/30 electric-glow">
            Book a Strategy Call<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SmaiFooter />
    </div>
  );
}