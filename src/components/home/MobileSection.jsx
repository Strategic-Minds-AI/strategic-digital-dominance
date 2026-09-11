import React from "react";
import { Link } from "react-router-dom";
import {
  Camera, Palette, Sparkles, ArrowRight, Eye, Layers,
  Wand2, CheckCircle2, MoveHorizontal, LogIn,
} from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import { Image } from "@/components/ui/image";
import { GALLERY_IMAGES } from "@/lib/galleryImages";
import InstallAppButton from "@/components/home/InstallAppButton";

const VISUALIZER_STEPS = [
  { icon: Camera, title: "Upload Your Photo", text: "Snap a picture of your garage, basement, or patio — any concrete floor." },
  { icon: Palette, title: "Pick Your Color", text: "Choose from exact manufacturer color charts — what you see is what you get." },
  { icon: Layers, title: "Choose Your Finish", text: "Matte, satin, or high-gloss — see how each sheen changes the look." },
  { icon: Sparkles, title: "See It Instantly", text: "Your floor transformed before your eyes — no app download required." },
];

// Before/after pair from the gallery for the phone mockup visualizer preview
const BEFORE_IMG = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/a1f81057a_generated_image.png";
const AFTER_IMG = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/ffaff85d4_generated_image.png";

const SWATCH_COLORS = [
  { hex: "#6B7280", name: "Gray" },
  { hex: "#8B7355", name: "Outback" },
  { hex: "#4A5568", name: "Rapids" },
  { hex: "#2D3748", name: "Charcoal" },
  { hex: "#D4AF37", name: "Gold" },
];

export default function MobileSection() {
  return (
    <section className="bg-stone-950 py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy + visualizer steps */}
        <div>
          <div className="text-xs font-bold tracking-[0.2em] text-amber-500">FLOOR VISUALIZER</div>
          <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white">
            See Your Floor Before We Start
          </h2>
          <p className="mt-4 text-stone-400 leading-relaxed">
            Upload a photo of your space and watch it transform with real epoxy colors
            and finishes in seconds. No app to download — it works right here in your browser.
            Pick from exact manufacturer color charts, choose your sheen, and see your new floor
            come to life.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {VISUALIZER_STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{s.title}</div>
                  <div className="text-xs text-stone-400 leading-relaxed mt-0.5">{s.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* What you see is what you get callout */}
          <div className="mt-7 rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-bold text-amber-400 tracking-wide uppercase">
                Exact Colors — No Guesswork
              </span>
            </div>
            <p className="text-sm text-stone-200 leading-relaxed">
              Every swatch in the visualizer uses the real manufacturer hex value and product
              photography. The color you pick is the color we install — no surprises on install day.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/funnel"
              className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition animate-pop-bounce"
            >
              <Wand2 className="h-5 w-5" /> Try the Visualizer
            </Link>
            <Link
              to="/color-charts"
              className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition"
            >
              Browse Color Charts
            </Link>
          </div>
        </div>

        {/* Right: phone mockup showing the visualizer in action */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-[300px] h-[620px] rounded-[2.75rem] border-[10px] border-stone-800 bg-white overflow-hidden shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-white flex items-center justify-center z-20">
              <div className="h-1.5 w-16 rounded-full bg-stone-300" />
            </div>

            {/* Promo bar */}
            <div className="absolute top-7 inset-x-0 bg-black text-center py-0.5 border-b border-amber-500 z-10">
              <span className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-amber-400">
                Free · No Download Required
              </span>
            </div>

            {/* Header */}
            <div className="absolute top-[37px] inset-x-0 h-14 px-3 flex items-center justify-between border-b border-stone-200 bg-white z-10">
              <div className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center">
                <span className="text-stone-400 text-xs">‹</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                <img src={LOGO_URL} alt="XPS" className="h-7 w-7 object-contain" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[11px] font-extrabold text-stone-900">Floor Visualizer</span>
                  <span className="text-[7px] text-amber-600 font-bold tracking-wider uppercase">See It Before We Start</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>

            {/* Visualizer content */}
            <div className="absolute top-[93px] inset-x-0 bottom-[60px] overflow-hidden bg-gradient-to-b from-white to-stone-50">
              {/* Before/After preview */}
              <div className="px-3 pt-3">
                <div className="text-[8px] font-bold text-stone-400 uppercase tracking-wide mb-1.5 px-1">Your Floor — Before & After</div>
                <div className="relative rounded-xl overflow-hidden border border-stone-200 h-44">
                  {/* After image (full width, behind) */}
                  <Image src={AFTER_IMG} alt="After" className="absolute inset-0 w-full h-full" fittingType="fill" />
                  {/* Before image (clipped to left half) */}
                  <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0 50% 0 0)" }}>
                    <Image src={BEFORE_IMG} alt="Before" className="absolute inset-0 w-full h-full" fittingType="fill" />
                  </div>
                  {/* Slider handle */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center z-20 shadow-lg">
                    <MoveHorizontal className="h-4 w-4 text-amber-600" strokeWidth={2.5} />
                  </div>
                  {/* Labels */}
                  <span className="absolute top-2 left-2 text-[8px] font-bold tracking-wider text-white bg-black/60 px-1.5 py-0.5 rounded">BEFORE</span>
                  <span className="absolute top-2 right-2 text-[8px] font-bold tracking-wider text-white bg-amber-600/80 px-1.5 py-0.5 rounded">AFTER</span>
                </div>
              </div>

              {/* Selected color info */}
              <div className="px-3 pt-2.5">
                <div className="rounded-xl bg-white border border-stone-200 p-2.5 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg shrink-0" style={{ background: "#8B7355", border: "1px solid #E5E5E5" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-stone-900">Outback Tan</div>
                    <div className="text-[8px] text-stone-500">Flake Epoxy · High Gloss</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                </div>
              </div>

              {/* Color swatches */}
              <div className="px-3 pt-2.5">
                <div className="text-[8px] font-bold text-stone-400 uppercase tracking-wide mb-1.5 px-1">Color Chart</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {SWATCH_COLORS.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div
                        className={`h-8 w-full rounded-lg ${i === 1 ? "ring-2 ring-amber-500 ring-offset-1" : "border border-stone-200"}`}
                        style={{ background: c.hex }}
                      />
                      <span className="text-[6px] font-medium text-stone-600 text-center leading-tight truncate w-full">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visualize button */}
              <div className="px-3 pt-3">
                <button className="w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold" style={{ background: "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)", border: "2px solid #000", color: "#1a1a1a", boxShadow: "0 4px 12px rgba(212,175,55,.4), inset 0 1px rgba(255,255,255,.4)" }}>
                  <Wand2 className="h-3.5 w-3.5" /> Visualize My Floor <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom nav */}
            <div className="absolute bottom-0 inset-x-0 h-[60px] grid grid-cols-5 border-t border-stone-200 bg-white/96 backdrop-blur z-10 px-2 pb-1.5 pt-1">
              {[
                { icon: Camera, label: "Upload", active: true },
                { icon: Palette, label: "Colors" },
                { icon: Layers, label: "Finish" },
                { icon: Eye, label: "Preview" },
                { icon: ArrowRight, label: "Estimate" },
              ].map((n, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <n.icon className="h-4 w-4" style={{ color: n.active ? "#D4AF37" : "#9CA3AF" }} strokeWidth={n.active ? 2.2 : 1.8} />
                  <span className="text-[8px] font-semibold" style={{ color: n.active ? "#D4AF37" : "#9CA3AF" }}>{n.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download App button — directly underneath the phone mockup */}
          <div className="w-full max-w-[300px]">
            <InstallAppButton variant="dark" />
          </div>
          <Link
            to="/login?returnTo=/portal"
            className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition animate-pop-bounce"
          >
            <LogIn className="h-5 w-5" /> Client Portal Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}