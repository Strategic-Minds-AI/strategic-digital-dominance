import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

// Seeded random so each color's sparkle pattern is stable across renders.
function seededRand(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Builds many small radial-gradient "flecks" scattered across the surface,
// simulating glitter sparkle particles over the base hex color.
function fleckLayers(seed, count, sizeRange, toneRange) {
  const rand = seededRand(seed);
  const layers = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() * 100).toFixed(1);
    const y = (rand() * 100).toFixed(1);
    const r = (sizeRange[0] + rand() * (sizeRange[1] - sizeRange[0])).toFixed(2);
    const tone = toneRange[Math.floor(rand() * toneRange.length)];
    layers.push(`radial-gradient(circle at ${x}% ${y}%, ${tone} 0 ${r}px, transparent ${(+r + 0.5).toFixed(2)}px)`);
  }
  return layers.join(", ");
}

// Full-rectangle swatch with a glitter sparkle texture over the exact hex color.
// Used for glitter system colors whose manufacturer product photos are round pucks.
export default function GlitterSwatch({ hex, seed, className = "", style }) {
  const s = seed || hex || "glitter";
  const bg = useMemo(() => {
    const sparks = fleckLayers(
      s,
      50,
      [0.4, 1.8],
      ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.3)", "rgba(0,0,0,0.22)"]
    );
    return [
      sparks,
      `radial-gradient(circle at 50% 35%, rgba(255,255,255,0.22), transparent 65%)`,
      `linear-gradient(125deg, ${hex}, rgba(255,255,255,0.16) 50%, ${hex})`,
    ].join(", ");
  }, [hex, s]);

  return <div className={cn(className)} style={{ ...style, background: bg }} />;
}