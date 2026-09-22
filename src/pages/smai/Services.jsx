import React from "react";
import { Link } from "react-router-dom";
import { Brain, TrendingUp, Code2, CheckCircle2, ArrowRight, Sparkles, Zap, Target, Rocket, Bot, Search, FileText, Share2, Smartphone, Database, Workflow } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";

const SERVICES = [
  {
    icon: Brain,
    title: "AI Consulting",
    tagline: "Strategy & Digital Transformation",
    desc: "We help you understand where AI can create the most value in your business — then build the roadmap to get there. From readiness audits to full digital transformation, we're your strategic AI partner.",
    features: [
      { icon: Search, label: "AI Readiness Audits", desc: "Deep-dive assessment of your data, processes, and tech stack" },
      { icon: Target, label: "Strategy Roadmaps", desc: "Prioritized AI initiatives with clear ROI projections" },
      { icon: Workflow, label: "Process Automation", desc: "Identify and automate repetitive workflows with AI agents" },
      { icon: Sparkles, label: "Change Management", desc: "Team training and adoption frameworks for smooth rollout" },
    ],
    deliverables: ["Comprehensive AI Audit Report", "12-Month Strategic Roadmap", "ROI Projections", "Team Training Plan"],
  },
  {
    icon: TrendingUp,
    title: "AI Marketing",
    tagline: "Autonomous Growth Engines",
    desc: "Our AI agents work 24/7 to grow your audience, generate leads, and dominate your market. From autonomous SEO to content engines and social media automation — we turn marketing into a system.",
    features: [
      { icon: Search, label: "Autonomous SEO", desc: "AI agents that research, write, and publish SEO content at scale" },
      { icon: FileText, label: "Content Engines", desc: "Automated content pipelines for blogs, guides, and landing pages" },
      { icon: Target, label: "Lead Generation", desc: "AI-powered scraping, enrichment, and outreach systems" },
      { icon: Share2, label: "Social Media Automation", desc: "Autonomous posting, engagement, and trend monitoring" },
    ],
    deliverables: ["SEO Content Library", "Lead Generation Pipeline", "Social Media Calendar", "Performance Dashboard"],
  },
  {
    icon: Code2,
    title: "AI Software Creation",
    tagline: "Custom Apps, Agents & SaaS",
    desc: "We build custom AI applications, agent systems, and SaaS products from vision to deployment. Whether you need a customer-facing app or an internal AI tool, we deliver production-ready software.",
    features: [
      { icon: Smartphone, label: "Custom AI Apps", desc: "Web and mobile applications with integrated AI capabilities" },
      { icon: Bot, label: "Agent Systems", desc: "Autonomous AI agents that handle complex multi-step workflows" },
      { icon: Database, label: "SaaS Products", desc: "Full SaaS platforms with auth, billing, and AI features" },
      { icon: Zap, label: "API Integrations", desc: "Connect AI capabilities to your existing tools and workflows" },
    ],
    deliverables: ["Production-Ready App", "Agent System Architecture", "API Documentation", "Deployment & Hosting"],
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-stone-950">
      <SmaiNav />

      {/* Header */}
      <section className="border-b border-stone-800 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Our Services</h1>
          <p className="text-lg text-stone-400 max-w-2xl">
            Three integrated service lines that take you from AI strategy to deployed systems to scaled growth —
            all under one roof.
          </p>
        </div>
      </section>

      {/* Service sections */}
      {SERVICES.map((s, i) => (
        <section key={s.title} className={`border-b border-stone-800 ${i % 2 === 1 ? "bg-stone-900/30" : ""}`}>
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <s.icon className="w-7 h-7 text-stone-950" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-[0.14em] uppercase text-amber-500 mb-1">{s.tagline}</div>
                <h2 className="text-3xl font-black text-white">{s.title}</h2>
              </div>
            </div>
            <p className="text-stone-400 text-lg leading-relaxed mb-10 max-w-3xl">{s.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {s.features.map((f) => (
                <div key={f.label} className="flex items-start gap-3 rounded-xl border border-stone-800 bg-stone-950/50 p-5">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{f.label}</h4>
                    <p className="text-sm text-stone-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h4 className="text-xs font-bold tracking-[0.14em] uppercase text-amber-500 mb-3">What You Get</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {s.deliverables.map((d) => (
                  <div key={d} className="flex items-center gap-2 text-sm text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-950 border border-amber-500/30 p-10 md:p-14 text-center">
          <Rocket className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">Let's Build Your AI System</h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8">
            Tell us about your business and goals — we'll show you which services fit and what results to expect.
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