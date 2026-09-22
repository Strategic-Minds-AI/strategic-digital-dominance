import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Image from "@/components/ui/image";
import SmaiNav from "@/components/smai/SmaiNav";
import SmaiFooter from "@/components/smai/SmaiFooter";

const ICONS = [
  { name: "Neural Sphere", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/27c3b4327_generated_image.png" },
  { name: "Hex Chip", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/3254720c4_generated_image.png" },
  { name: "Quantum Eye", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/934851303_generated_image.png" },
  { name: "Data Prism", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/6c2c8a5c5_generated_image.png" },
  { name: "Quantum Atom", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/13e3be041_generated_image.png" },
  { name: "Circuit Tree", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/cd5bc2419_generated_image.png" },
  { name: "Vortex", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/521594ef8_generated_image.png" },
  { name: "Diamond Core", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/804d0caed_generated_image.png" },
  { name: "Starburst", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/e6c2904c6_generated_image.png" },
  { name: "Genesis Seed", url: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/e3d7d6c96_generated_image.png" },
];

export default function Icons() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="min-h-screen bg-stone-950">
      <SmaiNav />
      <section className="border-b border-stone-800 bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link to="/smai" className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-cyan-400 transition mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase mb-3">— BRAND ICON GALLERY —</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">10 Futuristic AI Brand Icons</h1>
          <p className="text-stone-400 max-w-2xl">Premium 3D-rendered electric blue brand emblems. Click one to preview it as your logo. The Neural Sphere is currently active.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {ICONS.map((icon, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl border bg-stone-900/50 transition ${
                selected === i ? "border-cyan-400 bg-cyan-500/10 electric-glow" : "border-stone-800 hover:border-cyan-400/50"
              }`}
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-black">
                <Image src={icon.url} alt={icon.name} className="w-full h-full" fittingType="fill" />
              </div>
              <span className={`text-xs font-medium ${selected === i ? "text-cyan-400" : "text-stone-500"}`}>{icon.name}</span>
              {selected === i && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center"><Check className="w-3 h-3 text-stone-950" /></div>}
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className="mt-10 rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-8 text-center">
            <div className="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden bg-black electric-glow">
              <Image src={ICONS[selected].url} alt={ICONS[selected].name} className="w-full h-full" fittingType="fill" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Selected: {ICONS[selected].name}</h3>
            <p className="text-sm text-stone-400 mb-4">This icon will replace the current logo in the navigation bar and footer.</p>
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