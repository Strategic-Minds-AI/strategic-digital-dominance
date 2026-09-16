import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  CloudCog,
  Code2,
  Database,
  Globe2,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";

const GOLD = "linear-gradient(135deg, #FFF7D6 0%, #E7CC65 18%, #D4AF37 42%, #B8860B 72%, #7A5A08 100%)";

const capabilities = [
  {
    icon: Radar,
    title: "Opportunity Intelligence",
    body: "Discover high-value demand, market gaps, domains, industries, locations and commercially useful search intent before capital is committed.",
  },
  {
    icon: BrainCircuit,
    title: "Strategy Convergence",
    body: "Generate, compare and refine bounded strategies, then let measured production evidence decide which approach becomes the champion.",
  },
  {
    icon: Globe2,
    title: "Universal Site Factory",
    body: "Turn approved strategy, industry rules, brand configuration, service data and local evidence into governed digital assets at scale.",
  },
  {
    icon: Search,
    title: "Search Dominance Engine",
    body: "Coordinate technical SEO, structured data, internal linking, sitemaps, Search Console telemetry and continuous content-quality checks.",
  },
  {
    icon: Workflow,
    title: "Autonomous Operations",
    body: "Route jobs through Alpha Prime, specialist agents, validation gates, repair queues, leases, receipts and approval-aware execution.",
  },
  {
    icon: ShieldCheck,
    title: "Validation + Self-Healing",
    body: "Detect drift, failures and regressions, isolate the fault, repair in bounded steps, validate independently and preserve a rollback path.",
  },
];

const loop = [
  { label: "Observe", icon: Radar },
  { label: "Decide", icon: BrainCircuit },
  { label: "Execute", icon: Zap },
  { label: "Validate", icon: CheckCircle2 },
  { label: "Repair", icon: Wrench },
  { label: "Learn", icon: Network },
  { label: "Improve", icon: Sparkles },
];

const infrastructure = [
  { icon: Code2, label: "GitHub", detail: "Canonical code + configuration authority" },
  { icon: Database, label: "Control Plane", detail: "Durable runtime state, jobs, leases and receipts" },
  { icon: CloudCog, label: "Base44", detail: "Application runtime, UI, agents and bounded automations" },
  { icon: CircuitBoard, label: "Vercel + Railway", detail: "Orchestration, deployments and browser/worker execution" },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 rounded-xl border border-black/10 bg-black shadow-sm overflow-hidden">
        <div className="absolute inset-[2px] rounded-[10px]" style={{ background: GOLD }} />
        <div className="absolute inset-[5px] rounded-lg bg-black grid place-items-center">
          <span className="text-[13px] font-black tracking-[-0.08em] text-white">DD</span>
        </div>
      </div>
      <div className="leading-none">
        <div className="text-[15px] md:text-base font-black tracking-[-0.03em] text-stone-950">DIGITAL DOMINANCE</div>
        <div className="mt-1 text-[9px] md:text-[10px] uppercase tracking-[0.24em] font-bold text-stone-500">Autonomous Market Operating System</div>
      </div>
    </div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-stone-600 shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#D4AF37" }} />
      {children}
    </div>
  );
}

export default function DigitalDominanceHome() {
  useEffect(() => {
    trackEvent("page_view", { page: "/", experience: "digital_dominance" });
    document.title = "Digital Dominance OS | Autonomous Market Operating System";
  }, []);

  return (
    <div className="min-h-screen bg-white text-stone-950 selection:bg-amber-200 selection:text-black">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
          <BrandMark />
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-600">
            <a href="#system" className="hover:text-stone-950 transition">System</a>
            <a href="#architecture" className="hover:text-stone-950 transition">Architecture</a>
            <a href="#reference" className="hover:text-stone-950 transition">Reference System</a>
            <a href="#governance" className="hover:text-stone-950 transition">Governance</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex h-10 items-center rounded-xl border border-stone-200 px-4 text-sm font-bold text-stone-700 hover:border-stone-400 hover:text-stone-950 transition">
              Operator Login
            </Link>
            <Link to="/admin" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-black text-black shadow-sm transition hover:-translate-y-0.5" style={{ background: GOLD }}>
              Mission Control <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-stone-200 pt-[72px]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.34]" style={{ backgroundImage: "linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
            <div className="absolute left-1/2 top-12 h-[540px] w-[760px] -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-5 py-20 md:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <SectionEyebrow>Universal Autonomous Growth Infrastructure</SectionEyebrow>
              <h1 className="mt-7 max-w-4xl font-display text-5xl font-black tracking-[-0.055em] leading-[0.95] text-stone-950 md:text-7xl xl:text-[84px]">
                Build markets.<br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: GOLD }}>Compound advantage.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-600 md:text-xl">
                Digital Dominance OS is the universal control system for discovering demand, creating digital assets, operating autonomous agent teams, validating outcomes and continuously improving what works.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/admin" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-black text-black shadow-lg shadow-amber-500/15 transition hover:-translate-y-0.5" style={{ background: GOLD }}>
                  Enter Mission Control <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="https://epoxyquotenearme.com" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-7 text-sm font-black text-stone-900 shadow-sm hover:border-stone-500 transition">
                  View Reference System 001 <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-stone-500">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600" /> Source-truth governed</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600" /> Validation-first</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600" /> Portfolio-ready</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08 }} className="relative">
              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-amber-200/40 via-transparent to-stone-200/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,.10)]">
                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#D4AF37" }} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">Alpha Prime Control Loop</div>
                </div>
                <div className="p-5 md:p-6">
                  <div className="rounded-2xl bg-stone-950 p-5 text-white">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Digital COO</div>
                        <div className="mt-1 text-2xl font-black tracking-tight">Alpha Prime</div>
                      </div>
                      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
                        <BrainCircuit className="h-6 w-6 text-amber-300" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-stone-300">Observe system state, identify the highest-value gap, route work, validate independently, repair failures and preserve evidence.</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {["Opportunity Graph", "Agent Workforce", "Validation Mesh", "Repair Factory"].map((item, idx) => (
                      <div key={item} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400">0{idx + 1}</div>
                        <div className="mt-3 text-sm font-black text-stone-900">{item}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">Core operating contract</div>
                        <div className="mt-2 text-sm font-black text-stone-950">OBSERVE → DECIDE → EXECUTE → VALIDATE → REPAIR → LEARN</div>
                      </div>
                      <Target className="h-5 w-5 shrink-0 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="system" className="border-b border-stone-200 bg-stone-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="max-w-3xl">
              <SectionEyebrow>One engine. Many markets.</SectionEyebrow>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-6xl">A universal operating system, not another single-purpose website.</h2>
              <p className="mt-5 text-lg leading-8 text-stone-600">Digital Dominance separates the reusable machine from every portfolio implementation. Epoxy is the first proof system. Roofing, HVAC, concrete, legal, home services and future verticals become governed configurations of the same core.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, body }) => (
                <div key={title} className="group rounded-[24px] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-amber-300/70 bg-amber-50 text-amber-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-xl font-black tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="architecture" className="border-b border-stone-200 bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <SectionEyebrow>Deterministic operating loop</SectionEyebrow>
                <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-5xl">Autonomy with evidence, boundaries and recovery.</h2>
                <p className="mt-5 text-base leading-7 text-stone-600">The system is designed for continuous operation without pretending software never fails. Every meaningful failure becomes a bounded repair path with a validator, receipt and rollback target.</p>
              </div>
              <div className="rounded-[30px] border border-stone-200 bg-stone-950 p-5 md:p-8 shadow-2xl shadow-stone-950/10">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {loop.map(({ label, icon: Icon }, index) => (
                    <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-black" style={{ background: GOLD }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-stone-500">Stage {String(index + 1).padStart(2, "0")}</div>
                        <div className="mt-1 text-base font-black text-white">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-300/[0.06] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Health objective</div>
                  <div className="mt-2 text-2xl font-black tracking-tight text-white">Minimize distance to VERIFIED_100</div>
                  <p className="mt-2 text-sm leading-6 text-stone-400">No unresolved critical defects. No mandatory unknowns. Current evidence. Known source and deployment identity. Independent validation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reference" className="border-b border-stone-200 bg-stone-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-xl shadow-stone-950/5">
              <div className="grid lg:grid-cols-[1.05fr_.95fr]">
                <div className="p-7 md:p-12 lg:p-14">
                  <SectionEyebrow>Reference System 001</SectionEyebrow>
                  <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-5xl">EpoxyQuoteNearMe</h2>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600">The first production implementation remains its own customer-facing asset. Digital Dominance sits above it as the reusable intelligence, factory, validation and orchestration layer.</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {["Programmatic local routes", "Estimate + visualizer funnel", "SEO and Search Console workflows", "Alpha Prime validation + repair"].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-800">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /> {item}
                      </div>
                    ))}
                  </div>
                  <a href="https://epoxyquotenearme.com" className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl border border-stone-300 px-5 text-sm font-black text-stone-900 hover:border-stone-500 transition">
                    Open EpoxyQuoteNearMe <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="relative min-h-[420px] overflow-hidden bg-stone-950 p-7 text-white md:p-12 lg:p-14">
                  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
                  <div className="relative">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Universalization model</div>
                    <div className="mt-6 space-y-3">
                      {["Universal Core", "Industry Configuration", "Brand Configuration", "Domain + Location Graph", "Evidence + Content Layer", "Funnel + Conversion Logic", "Agent + Validation Policy"].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black text-black" style={{ background: GOLD }}>{index + 1}</span>
                          <span className="text-sm font-bold text-stone-100">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="governance" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <SectionEyebrow>Deep architecture</SectionEyebrow>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-6xl">One company brain. Specialized execution everywhere.</h2>
              <p className="mt-5 text-lg leading-8 text-stone-600">Keep code authority, runtime state, builders, workers and human operations separate enough to stay trustworthy, but connected enough to move fast.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {infrastructure.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                  <Icon className="h-6 w-6 text-amber-700" />
                  <div className="mt-5 text-lg font-black">{label}</div>
                  <div className="mt-2 text-sm leading-6 text-stone-600">{detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-14 overflow-hidden rounded-[32px] bg-stone-950 px-6 py-10 text-white md:px-12 md:py-14">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Digital Dominance OS</div>
                  <h3 className="mt-3 text-3xl font-black tracking-[-0.035em] md:text-5xl">Turn one proven system into a repeatable national portfolio engine.</h3>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-stone-400">Build the universal core once. Configure each market deliberately. Validate every release. Preserve every lesson. Scale only what survives real-world evidence.</p>
                </div>
                <Link to="/admin" className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-black text-black transition hover:-translate-y-0.5" style={{ background: GOLD }}>
                  Open Mission Control <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <BrandMark />
          <div className="text-xs leading-5 text-stone-500 md:text-right">
            Universal market intelligence, digital asset generation and autonomous operations.<br />
            Reference System 001: EpoxyQuoteNearMe.
          </div>
        </div>
      </footer>
    </div>
  );
}
