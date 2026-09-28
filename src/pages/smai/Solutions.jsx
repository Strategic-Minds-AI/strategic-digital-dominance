import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CircuitBoard, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import SmaiNav from '@/components/smai/SmaiNav';
import SmaiFooter from '@/components/smai/SmaiFooter';
import { SMAI_SOLUTIONS } from '@/data/smaiSolutions';

export default function Solutions() {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <SmaiNav />
      <section className="relative overflow-hidden border-b border-white/10 py-28">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 20%, rgba(34,211,238,.15), transparent 35%), radial-gradient(circle at 20% 60%, rgba(37,99,235,.12), transparent 30%)' }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/5 px-4 py-2 font-mono text-[10px] tracking-[.28em] text-cyan-300"><Sparkles className="h-3.5 w-3.5" /> CAPABILITY CATALOG</div>
          <h1 className="mt-8 max-w-5xl text-5xl md:text-7xl font-black tracking-[-0.055em] leading-[.95]">Twenty ways to turn AI into operating leverage.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-400">Every capability can stand alone or converge into the Strategic Minds Agent OS, one governed control plane for agents, workflows, data, websites, intelligence, and growth operations.</p>
        </div>
      </section>

      <section className="bg-white text-stone-950 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {SMAI_SOLUTIONS.map((item, index) => (
            <motion.article key={item.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: (index % 3) * .05 }} className="group rounded-3xl border border-stone-200 bg-stone-50 p-7 hover:border-cyan-400 hover:shadow-xl transition">
              <div className="flex items-start justify-between gap-4">
                <div className="h-11 w-11 rounded-2xl bg-stone-950 grid place-items-center"><CircuitBoard className="h-5 w-5 text-cyan-300" /></div>
                <span className="font-mono text-[10px] text-stone-400">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="mt-7 font-mono text-[10px] tracking-[.22em] text-blue-600">{item.eyebrow}</div>
              <h2 className="mt-3 text-2xl font-black tracking-tight">{item.headline}</h2>
              <p className="mt-4 text-sm leading-6 text-stone-600">{item.lede}</p>
              <Link to={`/smai/solutions/${item.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-stone-950 group-hover:text-blue-600 transition">Explore capability <ArrowUpRight className="h-4 w-4" /></Link>
            </motion.article>
          ))}
        </div>
      </section>
      <SmaiFooter />
    </div>
  );
}
