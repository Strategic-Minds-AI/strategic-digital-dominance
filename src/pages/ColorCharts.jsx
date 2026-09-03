import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { COLOR_DATA } from "@/lib/colorData";
import { Input } from "@/components/ui/input";
import SwatchImg from "@/components/ui/SwatchImg";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import Footer from "@/components/home/Footer";

const SYSTEMS = [
  { key: "all", label: "All Finishes" },
  { key: "flake", label: "Flake Epoxy" },
  { key: "metallic", label: "Metallic Epoxy" },
  { key: "solid", label: "Solid Color" },
  { key: "quartz", label: "Quartz Epoxy" },
  { key: "glitter", label: "Glitter Epoxy" },
  { key: "dye_stain", label: "Stained Concrete" },
  { key: "joint_filler", label: "Joint Filler" }
];

export default function ColorCharts() {
  const [system, setSystem] = useState("all");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    let rows = COLOR_DATA;
    if (system !== "all") rows = rows.filter((c) => c.system === system);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.color_name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.collection || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [system, query]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="text-stone-300 hover:text-white" showLabel={false} />
            <Logo />
          </div>
          <Link to="/funnel" className="text-sm text-amber-400 hover:text-amber-300 font-semibold">
            Get my estimate
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-amber-500 text-xs font-bold tracking-[0.25em] uppercase">Xtreme Polishing Systems</span>
          <h1 className="mt-3 text-3xl md:text-5xl font-display font-extrabold tracking-tight text-stone-950">
            Epoxy &amp; Concrete Color Charts
          </h1>
          <p className="mt-4 text-stone-600 max-w-2xl mx-auto">
            Browse {COLOR_DATA.length} real manufacturer colors across every finish system. Pick the one you love — you'll use it in the estimator to visualize your own garage.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search by name, code, or collection…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {SYSTEMS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSystem(s.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                system === s.key
                  ? "bg-stone-950 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="text-sm text-stone-500 mb-4">{shown.length} colors</div>

        {/* Swatch grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shown.map((c) => (
            <div key={c.code} className="group rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-md transition">
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                <SwatchImg
                  src={c.image_url}
                  hex={c.hex}
                  alt={`${c.color_name} (${c.code})`}
                  system={c.system}
                  seed={c.code}
                  wrapperClassName="h-full w-full group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2 right-2 text-[10px] font-bold tracking-widest bg-stone-950/80 text-white px-2 py-1 rounded">
                  {c.code}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border border-stone-200 shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="font-semibold text-stone-900 text-sm truncate">{c.color_name}</span>
                </div>
                <div className="mt-1 text-xs text-stone-500 truncate">{c.collection}</div>
              </div>
            </div>
          ))}
        </div>

        {shown.length === 0 && (
          <div className="text-center py-20 text-stone-500">No colors match your search.</div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center rounded-3xl bg-stone-950 px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Found a color you like?</h2>
          <p className="mt-3 text-stone-400 max-w-md mx-auto">
            Upload a photo of your garage in the estimator and see it transformed with your chosen color.
          </p>
          <Link
            to="/funnel"
            className="mt-6 inline-flex items-center gap-2 h-14 px-10 rounded-xl bg-amber-500 hover:bg-amber-400 transition text-stone-950 font-bold"
          >
            START MY ESTIMATE <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}