import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Brain, Code2, Users, Zap, Target } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";

const CASES = [
  {
    icon: TrendingUp,
    category: "AI Marketing",
    title: "Epoxy Flooring Company — 3x Lead Growth in 6 Months",
    desc: "Deployed autonomous SEO agents that researched, wrote, and published 200+ location-specific pages, driving organic traffic from 2K to 8K monthly visits.",
    metrics: [
      { label: "Organic Traffic", value: "4x" },
      { label: "Monthly Leads", value: "3x" },
      { label: "Revenue", value: "+$340K" },
    ],
    tags: ["Autonomous SEO", "Content Engine", "Lead Gen"],
  },
  {
    icon: Code2,
    category: "AI Software Creation",
    title: "Contractor Bidding Platform — From Vision to SaaS in 90 Days",
    desc: "Built a full SaaS platform with AI-powered bid generation, contractor matching, and project management — deployed to production with billing and auth.",
    metrics: [
      { label: "Time to Market", value: "90 days" },
      { label: "Active Users", value: "1,200+" },
      { label: "MRR", value: "$18K" },
    ],
    tags: ["SaaS", "AI Agents", "Full-Stack"],
  },
  {
    icon: Brain,
    category: "AI Consulting",
    title: "Manufacturing Firm — $1.2M Saved via Process Automation",
    desc: "Audited operations and deployed AI agents to automate inventory management, order processing, and supplier communication — saving 40 labor hours per week.",
    metrics: [
      { label: "Annual Savings", value: "$1.2M" },
      { label: "Labor Hours Saved", value: "40/wk" },
      { label: "Error Rate", value: "-85%" },
    ],
    tags: ["Process Automation", "Audit", "Digital Transformation"],
  },
  {
    icon: Users,
    category: "AI Marketing + Software",
    title: "Real Estate Agency — Autonomous Lead Nurturing System",
    desc: "Built an AI agent system that captures, enriches, and nurtures leads across email, SMS, and social — booking 60+ consultations per month on autopilot.",
    metrics: [
      { label: "Consultations/Mo", value: "60+" },
      { label: "Response Time", value: "<2 min" },
      { label: "Close Rate", value: "+22%" },
    ],
    tags: ["AI Agents", "Lead Nurturing", "Multi-Channel"],
  },
  {
    icon: Zap,
    category: "AI Software Creation",
    title: "Healthcare Startup — AI Triage Assistant",
    desc: "Developed a HIPAA-compliant AI triage assistant that screens patients, schedules appointments, and routes urgent cases — reducing front-desk load by 60%.",
    metrics: [
      { label: "Front-Desk Load", value: "-60%" },
      { label: "Patient Satisfaction", value: "+35%" },
      { label: "Wait Time", value: "-45%" },
    ],
    tags: ["Healthcare", "AI Assistant", "HIPAA"],
  },
  {
    icon: Target,
    category: "AI Consulting + Marketing",
    title: "E-commerce Brand — Full AI Transformation",
    desc: "Combined strategy consulting with autonomous marketing and custom software — rebuilding their tech stack, launching AI-powered product recommendations, and scaling to 7-figure revenue.",
    metrics: [
      { label: "Revenue", value: "$0→$1.2M" },
      { label: "Conversion Rate", value: "+180%" },
      { label: "Operational Cost", value: "-30%" },
    ],
    tags: ["Full Transformation", "E-commerce", "AI Recommendations"],
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-stone-950">
      <SmaiNav />

      {/* Header */}
      <section className="border-b border-stone-800 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Case Studies</h1>
          <p className="text-lg text-stone-400 max-w-2xl">
            Real businesses. Real AI systems. Real results. Here's what we've built and the impact we've driven.
          </p>
        </div>
      </section>

      {/* Case study grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CASES.map((c) => (
            <div key={c.title} className="group rounded-2xl border border-stone-800 bg-stone-900/50 p-7 hover:border-amber-500/40 transition flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <c.icon className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-bold tracking-[0.14em] uppercase text-amber-500">{c.category}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-400 transition">{c.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed mb-5">{c.desc}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-5 mt-auto">
                {c.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-stone-800 bg-stone-950/50 p-3 text-center">
                    <div className="text-lg font-black bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">{m.value}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-wide">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 border border-stone-700">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/20 via-stone-900 to-stone-950 border border-amber-500/30 p-10 md:p-14 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Your Case Study Could Be Next</h2>
          <p className="text-stone-400 max-w-2xl mx-auto mb-8">
            Every great result starts with a conversation. Let's talk about what we can build for your business.
          </p>
          <Link
            to="/smai/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold hover:from-amber-300 hover:to-amber-500 transition shadow-lg shadow-amber-500/30"
          >
            Start Your Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SmaiFooter />
    </div>
  );
}