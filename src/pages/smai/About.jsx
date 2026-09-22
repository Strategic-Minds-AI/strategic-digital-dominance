import React from "react";
import { Link } from "react-router-dom";
import { Brain, Target, Eye, Zap, Users, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";

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

      {/* Header */}
      <section className="border-b border-stone-800 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">About Strategic Minds AI</h1>
          <p className="text-lg text-stone-400 max-w-3xl">
            We're an AI advisory firm that doesn't just consult — we build, deploy, and scale autonomous AI systems
            that drive measurable business growth.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold tracking-[0.14em] uppercase text-amber-500 mb-3">Our Story</div>
            <h2 className="text-3xl font-black text-white mb-5">From AI Hype to Business Results</h2>
            <div className="space-y-4 text-stone-400 leading-relaxed">
              <p>
                Strategic Minds AI Advisory was born from a simple observation: most businesses know AI is important,
                but few know how to turn it into real, measurable value.
              </p>
              <p>
                We built a different kind of firm — one that doesn't just hand you a strategy deck and leave. Our
                autonomous agent teams actually execute: building your AI systems, running your marketing, and
                creating your software 24/7.
              </p>
              <p>
                The result? Clients who don't just understand AI — they dominate with it.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-gradient-to-br from-stone-900 to-stone-950 p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">50+</div>
                <div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">AI Systems Deployed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">3x</div>
                <div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">Avg. Revenue Lift</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">Agent Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">90%</div>
                <div className="text-xs text-stone-500 mt-1 uppercase tracking-wide">Client Retention</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-stone-900/30 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-stone-800 bg-stone-950/50 p-8">
              <Target className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-stone-400 leading-relaxed">
                To make AI accessible, practical, and profitable for businesses of every size — by building systems
                that deliver real outcomes, not just promises.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-950/50 p-8">
              <Eye className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-stone-400 leading-relaxed">
                A world where every business operates with an autonomous AI workforce — augmenting human teams and
                unlocking compounding growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-3xl font-black text-white mb-10 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">{v.title}</h4>
              <p className="text-sm text-stone-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-stone-900/30 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-3xl font-black text-white mb-10 text-center">Our Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIMELINE.map((t) => (
              <div key={t.year} className="relative">
                <div className="text-3xl font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent mb-2">{t.year}</div>
                <h4 className="text-lg font-bold text-white mb-2">{t.title}</h4>
                <p className="text-sm text-stone-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-950 border border-amber-500/30 p-10 md:p-14 text-center">
          <Brain className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">Let's Work Together</h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8">
            We're selective about who we work with — but if you're ready to turn AI into your competitive edge, let's talk.
          </p>
          <Link
            to="/smai/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold hover:from-amber-300 hover:to-amber-500 transition shadow-lg shadow-amber-500/30"
          >
            Book a Strategy Call
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SmaiFooter />
    </div>
  );
}