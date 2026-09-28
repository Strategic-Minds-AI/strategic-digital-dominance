import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CircuitBoard, Layers3, ShieldCheck, Sparkles, Workflow, Zap } from 'lucide-react';
import SmaiNav from '@/components/smai/SmaiNav';
import SmaiFooter from '@/components/smai/SmaiFooter';
import { SMAI_SOLUTION_MAP } from '@/data/smaiSolutions';

const iconCycle = [CircuitBoard, Workflow, ShieldCheck];

function AmbientField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-32 right-[8%] h-96 w-96 rounded-full border border-cyan-400/20 bg-cyan-400/5 blur-[1px]"
        animate={{ y: [0, 28, 0], x: [0, -18, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-44 right-[22%] h-40 w-40 rounded-3xl border border-blue-400/20 bg-blue-500/5 backdrop-blur-sm"
        animate={{ y: [0, -22, 0], rotate: [8, -10, 8] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,.05) 1px, transparent 1px),linear-gradient(90deg,rgba(34,211,238,.05) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(to bottom, black, transparent 85%)' }} />
    </div>
  );
}

export default function SolutionPage() {
  const { solutionSlug } = useParams();
  const page = SMAI_SOLUTION_MAP[solutionSlug];

  useEffect(() => {
    if (!page) return;
    document.title = `${page.eyebrow} | Strategic Minds AI`;
    const description = document.querySelector('meta[name="description"]') || document.head.appendChild(document.createElement('meta'));
    description.setAttribute('name', 'description');
    description.setAttribute('content', page.lede);
  }, [page]);

  if (!page) return <Navigate to="/smai/solutions" replace />;

  return (
    <div className="min-h-screen bg-stone-950 text-white selection:bg-cyan-300 selection:text-stone-950">
      <SmaiNav />

      <section className="relative overflow-hidden min-h-[78vh] flex items-center border-b border-white/10">
        <AmbientField />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-28 grid lg:grid-cols-[1.15fr_.85fr] gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/5 px-4 py-2 font-mono text-[10px] tracking-[.28em] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" /> {page.eyebrow}
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl md:text-7xl xl:text-8xl font-black tracking-[-0.055em] leading-[.95]">
              {page.headline}
            </h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl leading-8 text-stone-300">{page.lede}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/smai/contact" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-black text-stone-950 shadow-[0_0_45px_rgba(34,211,238,.18)] hover:bg-white transition">
                Start a project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/smai/command" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl hover:border-cyan-300/50 hover:bg-cyan-300/10 transition">
                Open AI Command <Sparkles className="h-4 w-4 text-cyan-300" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <motion.div
              className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 md:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-950/30 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .7 }}
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="font-mono text-[10px] tracking-[.24em] text-stone-500">STRATEGIC MINDS AI</div>
                  <div className="mt-1 text-lg font-bold">Operating brief</div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-mono tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> READY
                </div>
              </div>
              <p className="mt-7 text-2xl md:text-3xl font-semibold leading-tight tracking-tight text-white">{page.promise}</p>
              <div className="mt-8 space-y-3">
                {page.outcomes.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />
                    <span className="text-sm text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white text-stone-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] tracking-[.3em] text-blue-600">CAPABILITY SYSTEM</p>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-[-0.04em]">What gets built into the engagement.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {page.capabilities.map(([title, body], index) => {
              const Icon = iconCycle[index % iconCycle.length];
              return (
                <motion.article key={title} whileHover={{ y: -5 }} className="rounded-3xl border border-stone-200 bg-stone-50 p-7 shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-stone-950 grid place-items-center shadow-lg"><Icon className="h-5 w-5 text-cyan-300" /></div>
                  <h3 className="mt-7 text-xl font-black tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{body}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-stone-950 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(34,211,238,.17), transparent 42%)' }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-14 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="font-mono text-[10px] tracking-[.3em] text-cyan-300">EXECUTION MODEL</p>
              <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-[-0.045em]">From signal to validated operating change.</h2>
              <p className="mt-5 text-stone-400 leading-7">Each stage has an owner, evidence, and a next-state condition. No invisible handoffs.</p>
            </div>
            <div className="space-y-4">
              {page.workflow.map((step, index) => (
                <div key={step} className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 md:p-7 backdrop-blur-xl hover:border-cyan-300/30 transition">
                  <div className="flex gap-5">
                    <div className="font-mono text-sm text-cyan-300">0{index + 1}</div>
                    <div>
                      <div className="text-xl font-bold tracking-tight">{step}</div>
                      <div className="mt-2 h-px w-14 bg-gradient-to-r from-cyan-300 to-transparent group-hover:w-28 transition-all duration-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-stone-950 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[.3em] text-blue-600">WHY STRATEGIC MINDS AI</p>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-[-0.04em]">Built to leave behind operating leverage.</h2>
            <p className="mt-5 max-w-xl text-stone-600 leading-7">The deliverable is not only advice. We focus on reusable systems, deterministic workflows, controlled autonomy, validation, and a clear owner for what happens after launch.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['BUILD', 'Working systems and interfaces'],
              ['WIRE', 'Real integrations and data paths'],
              ['VALIDATE', 'Independent tests and receipts'],
              ['OPERATE', 'Queues, monitoring, and next actions'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <div className="font-mono text-[10px] tracking-[.25em] text-blue-600">{title}</div>
                <div className="mt-3 text-lg font-bold">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-950 border-t border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center"><Zap className="h-6 w-6 text-cyan-300" /></div>
          <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-[-0.045em]">Put this capability to work.</h2>
          <p className="mt-4 text-stone-400">Start with a strategy call, or open the AI Command surface to see the operator experience.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/smai/contact" className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-black text-stone-950">Book a strategy call</Link>
            <Link to="/smai/solutions" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white">Explore all capabilities</Link>
          </div>
        </div>
      </section>
      <SmaiFooter />
    </div>
  );
}
