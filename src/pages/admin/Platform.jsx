import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Brain, Network, Database, Workflow, Globe, Zap,
  Target, Layers, Shield, TrendingUp, Building2, Mail, CheckCircle2,
  Cpu, Radar, Camera, FileText, Sparkles, MapPin, Search,
  Gauge, Bot, Factory
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DEEP PHASE DATA
// ═══════════════════════════════════════════════════════════════════════════
const DEEP_PHASES = [
  {
    letter: 'D', name: 'Discover', icon: Radar,
    title: 'Observe. Detect. Ingest. Monitor.',
    desc: 'The system continuously scans for new leads, competitor changes, market shifts, site health issues, and opportunity emergence. Discovery is active, scheduled, and event-driven — never passive.'
  },
  {
    letter: 'E', name: 'Evaluate', icon: Brain,
    title: 'Understand. Score. Assess Confidence.',
    desc: 'Every signal is scored deterministically using weighted formulas — no LLM judgment, no guessing. Confidence is computed from source corroboration, not AI interpretation.'
  },
  {
    letter: 'E', name: 'Execute', icon: Zap,
    title: 'Decide. Act. Deploy. Automate.',
    desc: 'The system acts on evaluated intelligence. Four authorization levels govern every action — autonomous, supervised, gated, and human-only. Every action is logged and traceable.'
  },
  {
    letter: 'P', name: 'Prove', icon: Shield,
    title: 'Verify. Measure. Learn. Optimize.',
    desc: 'Every action is verified with exact-match checks. Learning is statistical correlation, not LLM narrative. The system proves with numbers, never with stories.'
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
// PAGE COMPONENT — Branded to match home page (stone-950 + amber-500 gold)
// ═══════════════════════════════════════════════════════════════════════════
export default function Platform() {
  return (
    <div className="space-y-8">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-stone-900 tracking-tight">
            Xtreme AI Systems — Platform Architecture
          </h1>
          <p className="text-stone-500 mt-1">
            The zero-point architecture: Principles → Foundation → Strategy → Content
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-950 text-amber-400 text-sm font-bold border border-amber-500/30">
          <Gauge className="h-4 w-4" /> DEEP Protocol v2
        </div>
      </div>

      {/* ═══ HERO (matches home page branding) ═══ */}
      <section className="relative overflow-hidden rounded-2xl bg-stone-950 border-2 border-amber-500">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%)' }} />
        <div className="relative px-6 md:px-10 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-5">
            <Sparkles className="h-3.5 w-3.5" /> The Autonomous AI Operating Platform
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5 max-w-4xl">
            The Autonomous AI Operating Platform for{' '}
            <span className="text-amber-400">Concrete Polishing</span> &{' '}
            <span className="text-amber-400">Epoxy Garage Floors</span>
          </h2>
          <p className="text-lg text-stone-300 leading-relaxed mb-6 max-w-3xl">
            Powering Xtreme Polishing Systems with a deterministic AI architecture — the DEEP protocol —
            that discovers, evaluates, executes, and proves. From mass website production to AI-powered
            lead generation, digital bidding, and floor visualization, this is the operating platform
            built to dominate the concrete polishing industry.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/estimate"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 transition text-stone-950 text-sm font-bold tracking-wide shadow-lg shadow-amber-500/30 border border-white/80"
            >
              Get Your Epoxy Garage Floor Estimate <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-stone-600 text-stone-200 text-sm font-bold hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              Explore the Architecture
            </a>
          </div>
        </div>
      </section>

      {/* ═══ VISION (PRINCIPLES) ═══ */}
      <section className="rounded-2xl bg-white border border-stone-200 p-8 md:p-10">
        <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-2 block">The Vision</span>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-stone-900 mb-5 tracking-tight">
          Autonomous Intelligence for the Concrete Polishing Industry
        </h3>
        <p className="text-stone-600 leading-relaxed mb-6 max-w-4xl">
          The goal is simple: a fully autonomous AI agent swarm that operates using the DEEP architecture.
          The system discovers opportunities, evaluates them deterministically, executes with authorization,
          and proves every outcome. The end goal — put it on autopilot and hear the phone ding when the
          account goes up. This is more than a website. This is a revolutionary operating platform designed
          to achieve goals.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Target, title: 'Set the Standard', desc: 'Dominate the market by setting the tone, the strategy, the methodology, and the standards for AI in the concrete polishing industry.' },
            { icon: Zap, title: 'Put It on Autopilot', desc: 'Build a self-optimizing system that runs autonomously — the phone dings when revenue goes up, not when something breaks.' },
            { icon: Globe, title: 'Scale to 70+ Markets', desc: 'Mass website production targeting high-volume epoxy garage floor and polished concrete keywords across 70+ locations nationwide.' }
          ].map((item, i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-5 border border-stone-200 hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                <item.icon className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="font-display text-base font-bold text-stone-900 mb-2">{item.title}</h4>
              <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ DEEP ARCHITECTURE (FOUNDATION) ═══ */}
      <section id="architecture" className="rounded-2xl bg-white border border-stone-200 p-8 md:p-10">
        <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-2 block">The Foundation</span>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-stone-900 mb-5 tracking-tight">
          The DEEP Architecture: Discover, Evaluate, Execute, Prove
        </h3>
        <p className="text-stone-600 leading-relaxed mb-6 max-w-4xl">
          DEEP is the four-phase operational cycle that governs every action the system takes.
          No component operates outside this protocol. The system is deterministic — given the same input,
          it always produces the same output.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEEP_PHASES.map((phase, i) => (
            <div key={i} className="bg-stone-950 rounded-xl p-5 border border-stone-800 hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-display text-xl font-extrabold text-amber-400">
                  {phase.letter}
                </div>
                <phase.icon className="h-7 w-7 text-amber-400" />
              </div>
              <h4 className="font-display text-lg font-bold text-white mb-1">{phase.name}</h4>
              <p className="text-amber-400 text-xs font-semibold mb-3">{phase.title}</p>
              <p className="text-stone-400 text-sm leading-relaxed">{phase.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-stone-950 rounded-xl p-6 md:p-8 text-center border border-amber-500/20">
          <p className="font-display text-lg md:text-xl text-white font-bold leading-relaxed max-w-3xl mx-auto">
            "The system computes, it does not guess. The system follows rules, it does not judge.
            The system proves with numbers, not with narratives."
          </p>
          <p className="text-amber-400 text-xs font-bold tracking-wider uppercase mt-3">— The Deterministic Oath</p>
        </div>
      </section>

      {/* ═══ PLATFORM STRATEGY ═══ */}
      <section className="rounded-2xl bg-white border border-stone-200 p-8 md:p-10">
        <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-2 block">The Strategy</span>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-stone-900 mb-5 tracking-tight">
          The Platform Strategy: From Zero to Autonomous
        </h3>
        <p className="text-stone-600 leading-relaxed mb-6 max-w-4xl">
          Six pillars form the operating platform — each engineered to compound results and drive
          the system toward full autonomy.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRATEGY_PILLARS.map((pillar, i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-5 border border-stone-200 hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-stone-950 flex items-center justify-center mb-3">
                <pillar.icon className="h-5 w-5 text-amber-400" />
              </div>
              <h4 className="font-display text-base font-bold text-stone-900 mb-2">{pillar.title}</h4>
              <p className="text-stone-600 text-sm leading-relaxed mb-3">{pillar.desc}</p>
              <ul className="space-y-1.5">
                {pillar.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ECOSYSTEM (BRANDS) ═══ */}
      <section className="rounded-2xl bg-white border border-stone-200 p-8 md:p-10">
        <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-2 block">The Content</span>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-stone-900 mb-5 tracking-tight">
          The Ecosystem: Brands & Properties
        </h3>
        <p className="text-stone-600 leading-relaxed mb-6 max-w-4xl">
          A network of brands and properties working together to dominate the concrete polishing
          and epoxy flooring market.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRANDS.map((brand, i) => (
            <a
              key={i}
              href={brand.url}
              target={brand.url !== '#' ? '_blank' : undefined}
              rel={brand.url !== '#' ? 'noopener noreferrer' : undefined}
              className="group bg-stone-50 rounded-xl p-5 border border-stone-200 hover:border-amber-300 hover:bg-white transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:border-amber-500 transition-colors">
                <brand.icon className="h-5 w-5 text-amber-600 group-hover:text-stone-950 transition-colors" />
              </div>
              <h4 className="font-display text-base font-bold text-stone-900 mb-1">{brand.name}</h4>
              <p className="text-stone-600 text-sm leading-relaxed mb-2">{brand.desc}</p>
              {brand.url !== '#' && (
                <span className="text-amber-600 text-xs font-bold tracking-wider flex items-center gap-1">
                  {brand.url.replace('https://', '')} <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ═══ ROADMAP ═══ */}
      <section className="rounded-2xl bg-stone-950 border border-amber-500/20 p-8 md:p-10">
        <span className="text-amber-400 font-bold text-sm tracking-wider uppercase mb-2 block">The Roadmap</span>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-5 tracking-tight">
          Zero to Autopilot
        </h3>
        <p className="text-stone-400 leading-relaxed mb-6 max-w-4xl">
          Six steps from foundation to full autonomy. Each step compounds on the last.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROADMAP.map((item, i) => (
            <div key={i} className="bg-stone-900 rounded-xl p-5 border border-stone-800 hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="font-display text-3xl font-extrabold text-stone-700">{item.step}</span>
              </div>
              <h4 className="font-display text-base font-bold text-white mb-1">{item.title}</h4>
              <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="rounded-2xl bg-white border border-stone-200 p-8 md:p-10">
        <span className="text-amber-600 font-bold text-sm tracking-wider uppercase mb-2 block">FAQ</span>
        <h3 className="font-display text-2xl md:text-3xl font-extrabold text-stone-900 mb-5 tracking-tight">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-5 border border-stone-200">
              <h4 className="font-display text-base font-bold text-stone-900 mb-2">{faq.q}</h4>
              <p className="text-stone-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="rounded-2xl bg-stone-950 border-2 border-amber-500 p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative">
          <h3 className="font-display text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Start Your Epoxy Garage Floor Project
          </h3>
          <p className="text-stone-300 leading-relaxed mb-6 max-w-2xl mx-auto">
            Get a free AI-powered estimate, visualize your new floor with our AI visualizer,
            and connect with the team at Xtreme Polishing Systems.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link
              to="/estimate"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 transition text-stone-950 text-sm font-bold tracking-wide shadow-lg shadow-amber-500/30 border border-white/80"
            >
              Get Your Estimate <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-stone-600 text-stone-200 text-sm font-bold hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              View Gallery
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-stone-600 text-stone-200 text-sm font-bold hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-stone-400 text-sm">
            <a href="mailto:jeremy@xtremepolishingsystems.com" className="inline-flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Mail className="h-4 w-4" /> jeremy@xtremepolishingsystems.com
            </a>
            <span className="text-stone-600">|</span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Serving 70+ Markets Nationwide
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}