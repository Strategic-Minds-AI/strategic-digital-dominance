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

function hexToRgb(hex) {
  const h = (hex || "#888888").replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function rgbStr(r, g, b, a) {
  return `rgba(${r},${g},${b},${a})`;
}
function lighten([r, g, b], amt) {
  return [
    Math.round(r + (255 - r) * amt),
    Math.round(g + (255 - g) * amt),
    Math.round(b + (255 - b) * amt),
  ];
}
function darken([r, g, b], amt) {
  return [Math.round(r * (1 - amt)), Math.round(g * (1 - amt)), Math.round(b * (1 - amt))];
}

// Simulates real glitter epoxy: metallic reflective shards embedded in resin.
// Uses 3 tiers of particles — bright highlights, colored mid-tones, and dark
// shadows — at varying sizes and angles, layered over the base hex color.
function glitterBackground(baseHex, seed) {
  const rand = seededRand(seed || baseHex || "glitter");
  const rgb = hexToRgb(baseHex);
  const light = lighten(rgb, 0.7);
  const lighter = lighten(rgb, 0.92);
  const dark = darken(rgb, 0.5);
  const base = rgb;

  const layers = [];

  // Tier 1: Large bright highlight shards (silver/white reflections catching light)
  for (let i = 0; i < 18; i++) {
    const x = (rand() * 100).toFixed(1);
    const y = (rand() * 100).toFixed(1);
    const r = (1.2 + rand() * 2.2).toFixed(2);
    const opacity = (0.6 + rand() * 0.4).toFixed(2);
    layers.push(
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${opacity}) 0 ${r}px, transparent ${(+r + 0.3).toFixed(2)}px)`
    );
  }

  // Tier 2: Medium colored reflective flecks (light-tinted base color)
  for (let i = 0; i < 30; i++) {
    const x = (rand() * 100).toFixed(1);
    const y = (rand() * 100).toFixed(1);
    const r = (0.8 + rand() * 1.5).toFixed(2);
    const opacity = (0.45 + rand() * 0.4).toFixed(2);
    layers.push(
      `radial-gradient(circle at ${x}% ${y}%, ${rgbStr(lighter[0], lighter[1], lighter[2], opacity)} 0 ${r}px, transparent ${(+r + 0.2).toFixed(2)}px)`
    );
  }

  // Tier 3: Small mid-tone flecks (base color at varying brightness)
  for (let i = 0; i < 50; i++) {
    const x = (rand() * 100).toFixed(1);
    const y = (rand() * 100).toFixed(1);
    const r = (0.4 + rand() * 0.8).toFixed(2);
    const tone = rand() > 0.5 ? light : base;
    const opacity = (0.3 + rand() * 0.4).toFixed(2);
    layers.push(
      `radial-gradient(circle at ${x}% ${y}%, ${rgbStr(tone[0], tone[1], tone[2], opacity)} 0 ${r}px, transparent ${(+r + 0.15).toFixed(2)}px)`
    );
  }

  // Tier 4: Tiny dark shadow flecks (particles in shadow give depth)
  for (let i = 0; i < 35; i++) {
    const x = (rand() * 100).toFixed(1);
    const y = (rand() * 100).toFixed(1);
    const r = (0.3 + rand() * 0.6).toFixed(2);
    const opacity = (0.2 + rand() * 0.3).toFixed(2);
    layers.push(
      `radial-gradient(circle at ${x}% ${y}%, ${rgbStr(dark[0], dark[1], dark[2], opacity)} 0 ${r}px, transparent ${(+r + 0.1).toFixed(2)}px)`
    );
  }

  // Top sheen: directional light gradient for glossy resin look
  const sheen = `linear-gradient(105deg, rgba(255,255,255,0.28) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.12) 100%)`;

  // Base color fill (darkest layer, at the bottom)
  const baseFill = `linear-gradient(180deg, ${baseHex}, ${baseHex})`;

  return [layers.join(", "), sheen, baseFill].join(", ");
}

// Full-rectangle swatch with a realistic glitter sparkle texture over the exact hex color.
export default function GlitterSwatch({ hex, seed, className = "", style }) {
  const s = seed || hex || "glitter";
  const bg = useMemo(() => glitterBackground(hex, s), [hex, s]);
  return <div className={cn(className)} style={{ ...style, background: bg }} />;
}