import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Brain, Network, Database, Workflow, Globe, Zap,
  Target, Layers, Shield, TrendingUp, Building2, Mail, CheckCircle2,
  Cpu, Radar, Camera, FileText, Sparkles, MapPin, Phone, Search,
  Gauge, Bot, Factory, MessageSquare, Star
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// JSON-LD STRUCTURED DATA — Encoded for Google Rich Results & AI Search
// ═══════════════════════════════════════════════════════════════════════════
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Xtreme Polishing Systems",
  "alternateName": "Xtreme AI Systems",
  "url": "https://epoxyquotenearme.com",
  "logo": "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/20999222a_Logo_XPS_Color_12-20-24.webp",
  "description": "Xtreme Polishing Systems is the national leader in epoxy garage floor coatings and polished concrete, powered by Xtreme AI Systems — the autonomous AI operating platform for the concrete polishing industry.",
  "founder": { "@type": "Person", "name": "Jeremy", "email": "jeremy@xtremepolishingsystems.com" },
  "sameAs": [
    "https://xtremepolishingsystems.com",
    "https://xtremeaisystems.com",
    "https://epoxyquotenearme.com",
    "https://hiddenpropertyintel.com",
    "https://nationalconcretepolishing.com"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "jeremy@xtremepolishingsystems.com",
    "contactType": "sales",
    "areaServed": "US"
  }
};

const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Xtreme AI Systems — Autonomous AI Operating Platform",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "An autonomous AI operating platform built on the DEEP architecture (Discover, Evaluate, Execute, Prove) for the concrete polishing and epoxy flooring industry. Features include mass website production, AI-powered lead generation, digital bidding, floor visualizer with computer vision, and AGI swarm orchestration.",
  "url": "https://epoxyquotenearme.com/platform",
  "provider": { "@type": "Organization", "name": "Xtreme Polishing Systems" },
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
};

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Epoxy Garage Floor Coating & Polished Concrete",
  "provider": { "@type": "Organization", "name": "Xtreme Polishing Systems" },
  "areaServed": "US",
  "description": "Professional epoxy garage floor coatings, polished concrete, and concrete resurfacing services powered by AI-driven estimation, floor visualization, and digital bidding."
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Xtreme AI Systems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Xtreme AI Systems is the autonomous AI operating platform that powers Xtreme Polishing Systems. Built on the DEEP architecture (Discover, Evaluate, Execute, Prove), it manages mass website production, AI-powered lead generation, digital bidding, floor visualization, and AGI swarm orchestration for the concrete polishing and epoxy flooring industry."
      }
    },
    {
      "@type": "Question",
      "name": "How does the DEEP architecture work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DEEP is a four-phase operational cycle: Discover (observe and ingest signals), Evaluate (score deterministically using weighted formulas), Execute (act based on authorization levels), and Prove (verify with exact-match checks and statistical learning). Every decision is reproducible — no LLM judgment is used for scoring, routing, or decision-making."
      }
    },
    {
      "@type": "Question",
      "name": "What is the autonomous AI agent swarm?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The AGI swarm is a team of specialized AI agents — lead orchestrator, SEO manager, social manager, reputation manager, site factory manager, comms manager, and swarm orchestrator — each operating under the DEEP protocol to autonomously manage leads, websites, content, and communications."
      }
    },
    {
      "@type": "Question",
      "name": "How does the epoxy garage floor estimator work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI-powered estimator cross-references public property records to determine your garage square footage, then calculates pricing using configurable multipliers. You can also upload up to 10 photos and use our floor visualizer to see AI-rendered before-and-after concepts of your new epoxy garage floor."
      }
    },
    {
      "@type": "Question",
      "name": "What areas does Xtreme Polishing Systems serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Xtreme Polishing Systems provides epoxy garage floor coatings and polished concrete services nationwide, with a network of 70+ location-targeted websites designed to connect homeowners with local concrete polishing professionals."
      }
    },
    {
      "@type": "Question",
      "name": "How do I get an epoxy garage floor estimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Visit our estimator page to get a free AI-powered epoxy garage floor estimate. Answer a few questions about your garage size, floor condition, and desired color, then visualize your new floor with our AI floor visualizer."
      }
    }
  ]
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://epoxyquotenearme.com/" },
    { "@type": "ListItem", "position": 2, "name": "Platform", "item": "https://epoxyquotenearme.com/platform" }
  ]
};

const JsonLd = ({ data }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
);

// ═══════════════════════════════════════════════════════════════════════════
// DEEP PHASE DATA
// ═══════════════════════════════════════════════════════════════════════════
const DEEP_PHASES = [
  {
    letter: 'D', name: 'Discover', icon: Radar,
    title: 'Observe. Detect. Ingest. Monitor.',
    desc: 'The system continuously scans for new leads, competitor changes, market shifts, site health issues, and opportunity emergence. Discovery is active, scheduled, and event-driven — never passive.',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200'
  },
  {
    letter: 'E', name: 'Evaluate', icon: Brain,
    title: 'Understand. Score. Assess Confidence.',
    desc: 'Every signal is scored deterministically using weighted formulas — no LLM judgment, no guessing. Confidence is computed from source corroboration, not AI interpretation.',
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200'
  },
  {
    letter: 'E', name: 'Execute', icon: Zap,
    title: 'Decide. Act. Deploy. Automate.',
    desc: 'The system acts on evaluated intelligence. Four authorization levels govern every action — autonomous, supervised, gated, and human-only. Every action is logged and traceable.',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200'
  },
  {
    letter: 'P', name: 'Prove', icon: Shield,
    title: 'Verify. Measure. Learn. Optimize.',
    desc: 'Every action is verified with exact-match checks. Learning is statistical correlation, not LLM narrative. The system proves with numbers, never with stories.',
    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// STRATEGY PILLARS
// ═══════════════════════════════════════════════════════════════════════════
const STRATEGY_PILLARS = [
  {
    icon: Globe, title: '70-Website Empire',
    desc: 'Mass website production targeting high-volume keywords like "epoxy garage floors near me" across 70+ markets. Every site is SEO-optimized, AI-generated, and engineered to steer customers to xtremepolishingsystems.com.',
    points: ['Location-targeted SEO pages', 'Programmatic keyword targeting', 'Automatic indexing & monitoring']
  },
  {
    icon: Target, title: 'AI Lead Engine',
    desc: 'Deterministic lead scoring with weighted formulas. Automated follow-up, CRM sync, and salesperson assignment based on nearest location — no LLM judgment, just reproducible rules.',
    points: ['Weighted scoring formulas', 'Automated follow-up sequences', 'HubSpot + Google Sheets sync']
  },
  {
    icon: FileText, title: 'Digital Bidding System',
    desc: 'Customers submit project details and the system generates professional bids. Contractors compete, homeowners win. The bidding system uses deterministic pricing from configurable multipliers.',
    points: ['AI-powered bid generation', 'Contractor competition marketplace', 'Deterministic pricing engine']
  },
  {
    icon: Camera, title: 'AI Floor Visualizer',
    desc: 'Customers upload up to 10 garage photos, answer questions about their floor, and the system generates AI-rendered before-and-after concepts. Computer vision analyzes the slab condition and compound answers improve accuracy.',
    points: ['Up to 10 photo uploads', 'AI before/after rendering', 'Slab condition analysis via vision cortex']
  },
  {
    icon: Bot, title: 'AGI Swarm',
    desc: 'Specialized AI agents — lead orchestrator, SEO manager, social manager, reputation manager, site factory manager, comms manager, and swarm orchestrator — each operating under the DEEP protocol.',
    points: ['7 specialized agents', 'DEEP-compliant operations', 'Autonomous task dispatch']
  },
  {
    icon: Database, title: 'Intelligence Layer',
    desc: 'RAG vector store (pgvector on Supabase) + knowledge graph (relational tables) + structured database. Every lead, strategy, and audit becomes queryable intelligence the swarm reasons over.',
    points: ['Semantic vector search', 'Cross-entity graph traversal', 'Hybrid retrieval pipeline']
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BRAND ECOSYSTEM
// ═══════════════════════════════════════════════════════════════════════════
const BRANDS = [
  { name: 'Xtreme Polishing Systems', url: 'https://xtremepolishingsystems.com', desc: 'The flagship brand — national epoxy garage floor coatings and polished concrete services.', icon: Building2 },
  { name: 'Xtreme AI Systems', url: 'https://xtremeaisystems.com', desc: 'The autonomous AI operating platform — the DEEP architecture that powers the ecosystem.', icon: Cpu },
  { name: 'National Concrete Polishing', url: 'https://nationalconcretepolishing.com', desc: 'National-scale polished concrete services for commercial and industrial facilities.', icon: Factory },
  { name: 'Polished Concrete University', url: '#', desc: 'Training and certification for concrete polishing professionals — the knowledge arm.', icon: Sparkles },
  { name: 'Hidden Property Intel', url: 'https://hiddenpropertyintel.com', desc: 'Property intelligence platform — cross-references public records for garage sqft and valuation.', icon: Search },
  { name: 'Epoxy Quote Near Me', url: 'https://epoxyquotenearme.com', desc: 'The consumer-facing estimate platform — AI-powered epoxy garage floor quotes in minutes.', icon: MapPin }
];

// ═══════════════════════════════════════════════════════════════════════════
// ROADMAP
// ═══════════════════════════════════════════════════════════════════════════
const ROADMAP = [
  { step: '0', title: 'Foundation', desc: 'DEEP architecture + deterministic protocol established. Every decision is reproducible.', icon: Shield },
  { step: '1', title: 'Data Layer', desc: 'All entities synced to knowledge graph + RAG vector store. Intelligence becomes queryable.', icon: Database },
  { step: '2', title: 'Intelligence', desc: 'Investigations, deterministic scoring, and statistical learning. The system evaluates before acting.', icon: Brain },
  { step: '3', title: 'Automation', desc: 'Workflows, swarm tasks, and self-healing. The system executes on evaluated intelligence.', icon: Workflow },
  { step: '4', title: 'Scale', desc: '70 websites deployed, lead engine running, bidding system live, visualizer processing photos.', icon: TrendingUp },
  { step: '5', title: 'Autopilot', desc: 'AGI swarm self-optimizing. The phone dings when the account goes up.', icon: Zap }
];

// ═══════════════════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════════════════
const FAQS = [
  { q: 'What is Xtreme AI Systems?', a: 'Xtreme AI Systems is the autonomous AI operating platform that powers Xtreme Polishing Systems. Built on the DEEP architecture (Discover, Evaluate, Execute, Prove), it manages mass website production, AI-powered lead generation, digital bidding, floor visualization, and AGI swarm orchestration for the concrete polishing and epoxy flooring industry.' },
  { q: 'How does the DEEP architecture work?', a: 'DEEP is a four-phase operational cycle: Discover (observe and ingest signals), Evaluate (score deterministically using weighted formulas), Execute (act based on authorization levels), and Prove (verify with exact-match checks and statistical learning). Every decision is reproducible — no LLM judgment is used for scoring, routing, or decision-making.' },
  { q: 'What is the autonomous AI agent swarm?', a: 'The AGI swarm is a team of specialized AI agents — lead orchestrator, SEO manager, social manager, reputation manager, site factory manager, comms manager, and swarm orchestrator — each operating under the DEEP protocol to autonomously manage leads, websites, content, and communications.' },
  { q: 'How does the epoxy garage floor estimator work?', a: 'Our AI-powered estimator cross-references public property records to determine your garage square footage, then calculates pricing using configurable multipliers. You can also upload up to 10 photos and use our floor visualizer to see AI-rendered before-and-after concepts of your new epoxy garage floor.' },
  { q: 'What areas does Xtreme Polishing Systems serve?', a: 'Xtreme Polishing Systems provides epoxy garage floor coatings and polished concrete services nationwide, with a network of 70+ location-targeted websites designed to connect homeowners with local concrete polishing professionals.' },
  { q: 'How do I get an epoxy garage floor estimate?', a: 'Visit our estimator page to get a free AI-powered epoxy garage floor estimate. Answer a few questions about your garage size, floor condition, and desired color, then visualize your new floor with our AI floor visualizer.' }
];

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function Platform() {
  return (
    <>
      <JsonLd data={ORG_SCHEMA} />
      <JsonLd data={SOFTWARE_SCHEMA} />
      <JsonLd data={SERVICE_SCHEMA} />
      <JsonLd data={FAQ_SCHEMA} />
      <JsonLd data={BREADCRUMB_SCHEMA} />

      <main className="min-h-screen bg-white font-body">
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden bg-stone-950 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-5 py-20 md:py-28">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-6">
                <Sparkles className="h-3.5 w-3.5" /> The Autonomous AI Operating Platform
              </span>
              <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Xtreme AI Systems — The Autonomous AI Operating Platform for{' '}
                <span className="text-amber-400">Concrete Polishing</span> &{' '}
                <span className="text-amber-400">Epoxy Garage Floors</span>
              </h1>
              <p className="text-lg md:text-xl text-stone-300 leading-relaxed mb-8 max-w-3xl">
                Powering Xtreme Polishing Systems with a deterministic AI architecture — the DEEP protocol —
                that discovers, evaluates, executes, and proves. From mass website production to AI-powered
                lead generation, digital bidding, and floor visualization, this is the operating platform
                built to dominate the concrete polishing industry.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/estimate"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Get Your Epoxy Garage Floor Estimate <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#architecture"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-stone-600 text-stone-200 font-bold text-sm hover:border-amber-400 hover:text-amber-400 transition-colors"
                >
                  Explore the Platform
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ VISION (PRINCIPLES) ═══ */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-5">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-3 block">The Vision</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
                Autonomous Intelligence for the Concrete Polishing Industry
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                The goal is simple: a fully autonomous AI agent swarm that operates using the DEEP architecture.
                The system discovers opportunities, evaluates them deterministically, executes with authorization,
                and proves every outcome. The end goal — put it on autopilot and hear the phone ding when the
                account goes up. This is more than a website. This is a revolutionary operating platform designed
                to achieve goals.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, title: 'Set the Standard', desc: 'Dominate the market by setting the tone, the strategy, the methodology, and the standards for AI in the concrete polishing industry.' },
                { icon: Zap, title: 'Put It on Autopilot', desc: 'Build a self-optimizing system that runs autonomously — the phone dings when revenue goes up, not when something breaks.' },
                { icon: Globe, title: 'Scale to 70+ Markets', desc: 'Mass website production targeting high-volume epoxy garage floor and polished concrete keywords across 70+ locations nationwide.' }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DEEP ARCHITECTURE (FOUNDATION) ═══ */}
        <section id="architecture" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-3 block">The Foundation</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
                The DEEP Architecture: Discover, Evaluate, Execute, Prove
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                DEEP is the four-phase operational cycle that governs every action the system takes.
                No component operates outside this protocol. Every agent, workflow, and function maps to
                a DEEP phase. The system is deterministic — given the same input, it always produces the
                same output.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEEP_PHASES.map((phase, i) => (
                <div key={i} className={`rounded-2xl p-8 border-2 ${phase.border} ${phase.bg} hover:shadow-lg transition-all`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-white border-2 ${phase.border} flex items-center justify-center font-heading text-2xl font-extrabold ${phase.color}`}>
                      {phase.letter}
                    </div>
                    <phase.icon className={`h-8 w-8 ${phase.color}`} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stone-900 mb-2">{phase.name}</h3>
                  <p className={`text-sm font-semibold ${phase.color} mb-3`}>{phase.title}</p>
                  <p className="text-stone-600 text-sm leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 bg-stone-900 rounded-2xl p-8 md:p-12 text-center">
              <p className="font-heading text-xl md:text-2xl text-white font-bold leading-relaxed max-w-4xl mx-auto">
                "The system computes, it does not guess. The system follows rules, it does not judge.
                The system proves with numbers, not with narratives."
              </p>
              <p className="text-amber-400 text-sm font-bold tracking-wider uppercase mt-4">— The Deterministic Oath</p>
            </div>
          </div>
        </section>

        {/* ═══ PLATFORM STRATEGY ═══ */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-5">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-3 block">The Strategy</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
                The Platform Strategy: From Zero to Autonomous
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                Six pillars form the operating platform — each engineered to compound results and drive
                the system toward full autonomy.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STRATEGY_PILLARS.map((pillar, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center mb-5">
                    <pillar.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stone-900 mb-3">{pillar.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{pillar.desc}</p>
                  <ul className="space-y-2">
                    {pillar.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-stone-700">
                        <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ECOSYSTEM (BRANDS) ═══ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-3 block">The Content</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
                The Ecosystem: Brands & Properties
              </h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                A network of brands and properties working together to dominate the concrete polishing
                and epoxy flooring market — from consumer-facing estimate platforms to AI systems and
                property intelligence.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BRANDS.map((brand, i) => (
                <a
                  key={i}
                  href={brand.url}
                  target={brand.url !== '#' ? '_blank' : undefined}
                  rel={brand.url !== '#' ? 'noopener noreferrer' : undefined}
                  className="group bg-stone-50 rounded-2xl p-8 border border-stone-200 hover:border-amber-300 hover:bg-white hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5 group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors">
                    <brand.icon className="h-6 w-6 text-amber-600 group-hover:text-stone-950 transition-colors" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-stone-900 mb-2">{brand.name}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-3">{brand.desc}</p>
                  {brand.url !== '#' && (
                    <span className="text-amber-600 text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                      {brand.url.replace('https://', '')} <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ROADMAP ═══ */}
        <section className="py-20 bg-stone-950 text-white">
          <div className="max-w-7xl mx-auto px-5">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-amber-400 font-bold text-sm tracking-wider uppercase mb-3 block">The Roadmap</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Zero to Autopilot
              </h2>
              <p className="text-lg text-stone-400 leading-relaxed">
                Six steps from foundation to full autonomy. Each step compounds on the last.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ROADMAP.map((item, i) => (
                <div key={i} className="bg-stone-900 rounded-2xl p-8 border border-stone-800 hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <span className="font-heading text-4xl font-extrabold text-stone-700">{item.step}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-16">
              <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-3 block">FAQ</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200">
                  <h3 className="font-heading text-lg font-bold text-stone-900 mb-3">{faq.q}</h3>
                  <p className="text-stone-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-5">
            <div className="bg-stone-950 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #D4AF37 0%, transparent 60%)' }} />
              <div className="relative">
                <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                  Start Your Epoxy Garage Floor Project
                </h2>
                <p className="text-lg text-stone-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                  Get a free AI-powered estimate, visualize your new floor with our AI visualizer,
                  and connect with the team at Xtreme Polishing Systems.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  <Link
                    to="/estimate"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Get Your Estimate <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-stone-600 text-stone-200 font-bold text-sm hover:border-amber-400 hover:text-amber-400 transition-colors"
                  >
                    View Gallery
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-stone-600 text-stone-200 font-bold text-sm hover:border-amber-400 hover:text-amber-400 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-6 text-stone-400 text-sm">
                  <a href="mailto:jeremy@xtremepolishingsystems.com" className="inline-flex items-center gap-2 hover:text-amber-400 transition-colors">
                    <Mail className="h-4 w-4" /> jeremy@xtremepolishingsystems.com
                  </a>
                  <span className="text-stone-600">|</span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Serving 70+ Markets Nationwide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}