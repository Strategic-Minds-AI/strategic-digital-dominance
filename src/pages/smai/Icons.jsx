import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";
import ICONS from "@/components/smai/FuturisticIcons";

export default function Icons() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-stone-950">
      <SmaiNav />
      <section className="border-b border-stone-800 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link to="/smai" className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-cyan-400 transition mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— BRAND ICON GALLERY —</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">20 Futuristic Icon Options</h1>
          <p className="text-stone-400 max-w-2xl">Custom electric blue circuit-style icons for the Strategic Minds AI brand. Click one to select it as your brand icon.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ICONS.map((icon, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border bg-stone-900/50 transition ${
                selected === i ? "border-cyan-400 bg-cyan-500/10 electric-glow" : "border-stone-800 hover:border-cyan-400/50"
              }`}
            >
              <div className="w-20 h-20 relative">
                {icon.render(`icon-${i}`)}
              </div>
              <span className={`text-xs font-medium ${selected === i ? "text-cyan-400" : "text-stone-500"}`}>{icon.name}</span>
              {selected === i && <Check className="w-4 h-4 text-cyan-400 absolute top-3 right-3" />}
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className="mt-10 rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4">{ICONS[selected].render("preview")}</div>
            <h3 className="text-lg font-bold text-white mb-2">Selected: {ICONS[selected].name}</h3>
            <p className="text-sm text-stone-400 mb-4">This icon will replace the current Brain logo in the navigation bar.</p>
            <Link to="/smai" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl electric-bg text-stone-950 font-bold hover:opacity-90 transition electric-glow">
              Apply & View Site
            </Link>
          </div>
        )}
      </section>
      <SmaiFooter />
    </div>
  );
}