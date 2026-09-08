import React, { useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

// Before/after slider using two real images — the original uploaded photo
// on the left (before) and the AI-generated concept image on the right (after).
// Matches the MobileSection visualizer template: after image as full
// background, before image clipped to the slider position from the left.

export default function ConceptBeforeAfter({ beforeUrl, afterUrl, colorName, hex }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const dragging = useRef(false);

  const move = (clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none bg-stone-100"
      onMouseDown={(e) => { dragging.current = true; move(e.clientX); }}
      onMouseMove={(e) => dragging.current && move(e.clientX)}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchStart={(e) => move(e.touches[0].clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      {/* AFTER layer (full container) — AI-generated concept image */}
      <img src={afterUrl} alt="After" className="absolute top-0 left-0 w-full h-full object-cover" />

      {/* BEFORE layer (clipped to slider position via clip-path) — original uploaded photo */}
      <img
        src={beforeUrl}
        alt="Before"
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest bg-stone-900/80 text-white px-2 py-1 rounded z-10">BEFORE</span>
      <span className="absolute top-3 right-3 text-[10px] font-bold tracking-widest bg-amber-500 text-stone-950 px-2 py-1 rounded z-10">AFTER</span>
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <MoveHorizontal className="h-5 w-5 text-stone-900" />
        </div>
      </div>
      {colorName && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-stone-900/80 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
          {hex && <span className="inline-block w-3 h-3 rounded-full border border-white/40" style={{ background: hex }} />}
          {colorName}
        </div>
      )}
    </div>
  );
}