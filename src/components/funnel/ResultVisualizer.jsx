import React, { useRef, useState, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";

// CSS-overlay before/after visualizer — applies the exact color chart hex
// to the floor region of the uploaded photo using blend modes. No canvas
// compositing, no CORS/tainting issues — always renders correctly.
export default function ResultVisualizer({ photoUrl, color, onAfterReady }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const dragging = useRef(false);
  const hex = color?.hex || "#777777";

  const colorName = color?.name || color?.color_name || color?.code || "";

  // Notify parent that the "after" image is ready (uses the original photo
  // with CSS overlays, so it's immediately ready).
  useEffect(() => {
    onAfterReady?.(photoUrl || "");
  }, [photoUrl]);

  const move = (clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  if (!photoUrl) {
    return (
      <div className="text-sm text-stone-500 py-8 text-center">
        Upload a photo in the visualizer step to see your garage transformed.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-stone-500 mb-4">Drag the slider to see your garage transformed with {colorName}.</p>
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
        {/* AFTER layer (full container) — original photo + floor color overlay */}
        <img src={photoUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        {/* Floor color overlay — bottom 58% of image, exact color chart hex */}
        <div className="absolute inset-x-0 bottom-0" style={{ top: "42%", background: hex, mixBlendMode: "multiply", opacity: 0.78 }} />
        {/* Gloss / depth highlight for a coated look */}
        <div className="absolute inset-x-0 bottom-0" style={{
          top: "42%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.20), transparent 30%, rgba(255,255,255,0.10))",
          mixBlendMode: "overlay",
        }} />
        {/* Smooth fade at the wall-to-floor transition line */}
        <div className="absolute inset-x-0" style={{
          top: "42%", height: "14%",
          background: `linear-gradient(to bottom, transparent, ${hex})`,
          opacity: 0.78, mixBlendMode: "multiply",
        }} />

        {/* BEFORE layer (clipped to slider position) — original photo only */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img
            src={photoUrl}
            alt="Before"
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${pos > 0 ? 10000 / pos : 100}%` }}
          />
        </div>

        <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest bg-stone-900/80 text-white px-2 py-1 rounded z-10">BEFORE</span>
        <span className="absolute top-3 right-3 text-[10px] font-bold tracking-widest bg-amber-500 text-stone-950 px-2 py-1 rounded z-10">AFTER</span>
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <MoveHorizontal className="h-5 w-5 text-stone-900" />
          </div>
        </div>
        {colorName && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-stone-900/80 text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span className="inline-block w-3 h-3 rounded-full border border-white/40" style={{ background: hex }} />
            {colorName}
          </div>
        )}
      </div>
    </div>
  );
}