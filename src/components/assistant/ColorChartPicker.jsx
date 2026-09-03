import React, { useState, useMemo } from "react";
import { COLOR_DATA } from "@/lib/colorData";
import GlitterSwatch from "@/components/ui/GlitterSwatch";

const SYSTEMS = [
  { key: "flake", label: "Flake" },
  { key: "metallic", label: "Metallic" },
  { key: "glitter", label: "Glitter" },
  { key: "quartz", label: "Quartz" },
  { key: "dye_stain", label: "Stained Concrete" },
  { key: "solid", label: "Solid" },
];

export default function ColorChartPicker({ selectedColor, onSelect }) {
  const [system, setSystem] = useState("flake");

  const colors = useMemo(
    () => COLOR_DATA.filter((c) => c.system === system).sort((a, b) => a.rank - b.rank),
    [system]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-[14px] font-bold text-black">Choose Your Color</h3>
      <p className="text-[10px] text-stone-500">All colors are XPS products sold through XPS Xpress.</p>
      <div className="flex flex-wrap gap-1.5">
        {SYSTEMS.map((s) => (
          <button
            key={s.key}
            onClick={() => { setSystem(s.key); onSelect(null); }}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition ${system === s.key ? "bg-black text-white" : "bg-white text-stone-600 border border-stone-200"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
        {colors.map((c) => (
          <button
            key={c.code}
            onClick={() => onSelect(c)}
            className={`xa-gold-hover flex flex-col items-center gap-1 p-1.5 rounded-lg border transition ${selectedColor?.code === c.code ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white"}`}
          >
            {c.image_url ? (
              <img src={c.image_url} alt={c.color_name} loading="lazy" className="h-12 w-full object-fill rounded" />
            ) : system === "glitter" ? (
              <GlitterSwatch hex={c.hex} seed={c.code} className="h-12 w-full rounded" />
            ) : (
              <div className="h-12 w-full rounded" style={{ background: c.hex }} />
            )}
            <span className="text-[9px] font-medium text-black truncate w-full text-center">{c.color_name}</span>
            <span className="text-[8px] text-stone-400">{c.code}</span>
          </button>
        ))}
      </div>
      {selectedColor && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-stone-700">
          Selected: <span className="font-bold">{selectedColor.color_name}</span> ({selectedColor.code})
        </div>
      )}
    </div>
  );
}