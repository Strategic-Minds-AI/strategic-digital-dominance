// Canvas-based floor visualizer — composites the EXACT uploaded photo with
// a procedural texture generated from the exact color chart hex value.
// No external image loading (avoids CORS failures), no AI generation.
// The original photo is preserved pixel-for-pixel; the floor region is
// overlaid with a realistic flake/metallic/solid texture derived from
// the selected color chart entry's hex code.

function loadImage(src, useCors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useCors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Robust image loader: fetches the image as a blob and converts to an
// object URL so the canvas is never tainted (object URLs are same-origin).
// Falls back to a direct crossOrigin load if fetch is blocked.
async function loadPhotoImage(src) {
  // Strategy 1: fetch → blob → objectURL (avoids canvas tainting entirely)
  try {
    const res = await fetch(src, { mode: "cors" });
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 0) {
        const objUrl = URL.createObjectURL(blob);
        try {
          return await loadImage(objUrl, false);
        } catch (e) {
          URL.revokeObjectURL(objUrl);
          throw e;
        }
      }
    }
  } catch {}
  // Strategy 2: direct load with crossOrigin (works if CDN sends CORS headers)
  return await loadImage(src, true);
}

function hexToRgb(hex) {
  const m = hex?.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 120, g: 120, b: 120 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

// Normalize the system identifier to a canonical key the composite understands.
// Handles all formats: "flake", "flake-epoxy", "Flake Epoxy", "metallic-epoxy", etc.
function normalizeSystem(system) {
  const s = (system || "flake").toLowerCase();
  if (s.startsWith("metallic")) return "metallic";
  if (s.startsWith("flake")) return "flake";
  if (s.startsWith("quartz")) return "quartz";
  if (s.startsWith("glitter")) return "glitter";
  if (s.startsWith("solid") || s.includes("dye") || s.includes("stain") || s.includes("sealed") || s.includes("polyaspartic")) return "solid";
  return "flake"; // default — most epoxy systems use a flake-style texture
}

function rgba(r, g, b, a) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}

function mix(a, b, t) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}
function lighten(c, t) { return mix(c, { r: 255, g: 255, b: 255 }, t); }
function darken(c, t) { return mix(c, { r: 0, g: 0, b: 0 }, t); }

// ── Procedural flake texture ──────────────────────────────────────────────
// Draws hundreds of small colored flakes in variations of the base hex,
// simulating a vinyl-chip epoxy flake floor. The flake palette is WEIGHTED
// so the selected color and its shades dominate (~78%); white and gray
// accents are kept to ~22% — matching real flake blend proportions so the
// floor reads as the EXACT selected color, not a washed-out gray.
function drawFlakes(ctx, x, y, w, h, baseHex) {
  const base = hexToRgb(baseHex);
  // Weighted palette: base + its shades appear far more often than accents
  const palette = [
    { c: base,                  w: 3 },  // exact color — most common
    { c: lighten(base, 0.25),   w: 2 },  // lighter shade
    { c: darken(base, 0.18),    w: 2 },  // darker shade
    { c: lighten(base, 0.5),    w: 1 },  // very light highlight
    { c: { r: 235, g: 235, b: 235 }, w: 1 },  // white accent (rare)
    { c: { r: 70, g: 70, b: 70 },     w: 1 },  // dark gray accent (rare)
  ];
  const totalWeight = palette.reduce((s, p) => s + p.w, 0);

  // Base epoxy fill — the EXACT selected hex (no darkening) so the floor
  // reads as the chosen color even where flakes are sparse
  ctx.fillStyle = rgba(base.r, base.g, base.b, 1);
  ctx.fillRect(x, y, w, h);

  // Scale flake size to image resolution so flakes look consistent
  const scale = Math.max(w / 1200, 0.8);
  const flakeCount = Math.min(Math.floor((w * h) / (45 * scale * scale)), 7000);

  for (let i = 0; i < flakeCount; i++) {
    const fx = x + Math.random() * w;
    const fy = y + Math.random() * h;
    const fs = (2 + Math.random() * 5) * scale;
    // Weighted random pick
    let r = Math.random() * totalWeight;
    let c = base;
    for (const p of palette) {
      r -= p.w;
      if (r <= 0) { c = p.c; break; }
    }
    const a = 0.55 + Math.random() * 0.45;
    ctx.fillStyle = rgba(c.r, c.g, c.b, a);
    ctx.fillRect(fx, fy, fs, fs);
  }
}

// ── Procedural metallic texture ───────────────────────────────────────────
// Smooth radial gradients in lighter/darker variations create the swirled,
// reflective look of a metallic epoxy floor. Base fill uses the EXACT hex.
function drawMetallic(ctx, x, y, w, h, baseHex) {
  const base = hexToRgb(baseHex);

  ctx.fillStyle = rgba(base.r, base.g, base.b, 1);
  ctx.fillRect(x, y, w, h);

  const scale = Math.max(w / 1200, 0.8);

  // Light swirls — highlights
  for (let i = 0; i < 12; i++) {
    const cx = x + Math.random() * w;
    const cy = y + Math.random() * h;
    const radius = (40 + Math.random() * 140) * scale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const light = lighten(base, 0.25 + Math.random() * 0.45);
    grad.addColorStop(0, rgba(light.r, light.g, light.b, 0.35));
    grad.addColorStop(0.6, rgba(base.r, base.g, base.b, 0));
    grad.addColorStop(1, rgba(base.r, base.g, base.b, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  // Dark swirls — depth
  for (let i = 0; i < 7; i++) {
    const cx = x + Math.random() * w;
    const cy = y + Math.random() * h;
    const radius = (30 + Math.random() * 90) * scale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const dark = darken(base, 0.15 + Math.random() * 0.3);
    grad.addColorStop(0, rgba(dark.r, dark.g, dark.b, 0.3));
    grad.addColorStop(1, rgba(base.r, base.g, base.b, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }
}

// ── Solid color ───────────────────────────────────────────────────────────
// Uses the EXACT selected hex at high opacity for accurate color reproduction.
function drawSolid(ctx, x, y, w, h, baseHex) {
  const base = hexToRgb(baseHex);
  ctx.fillStyle = rgba(base.r, base.g, base.b, 1);
  ctx.fillRect(x, y, w, h);
}

// ── Main compositing function ──────────────────────────────────────────────
export async function compositeFloorImage(photoUrl, color, sheen = "gloss") {
  const photoImg = await loadPhotoImage(photoUrl);

  const w = photoImg.naturalWidth;
  const h = photoImg.naturalHeight;

  // Main canvas — the exact uploaded photo
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(photoImg, 0, 0);

  // Floor overlay canvas — texture built here, then composited with alpha
  const overlay = document.createElement("canvas");
  overlay.width = w;
  overlay.height = h;
  const octx = overlay.getContext("2d");

  // Floor region: perspective trapezoid in the bottom portion of the image
  const floorTop = h * 0.42;
  const floorTopLeft = w * 0.10;
  const floorTopRight = w * 0.90;
  const floorH = h - floorTop;

  // Clip to the perspective trapezoid (narrower at top = farther away)
  octx.save();
  octx.beginPath();
  octx.moveTo(0, h);
  octx.lineTo(w, h);
  octx.lineTo(floorTopRight, floorTop);
  octx.lineTo(floorTopLeft, floorTop);
  octx.closePath();
  octx.clip();

  // Draw the procedural texture based on the finish system.
  // normalizeSystem handles all slug formats (e.g. "flake-epoxy" → "flake").
  const system = normalizeSystem(color.system);
  const baseHex = color.hex || "#777777";

  if (system === "metallic") {
    drawMetallic(octx, 0, floorTop, w, floorH, baseHex);
  } else if (system === "flake" || system === "quartz" || system === "glitter") {
    drawFlakes(octx, 0, floorTop, w, floorH, baseHex);
  } else {
    drawSolid(octx, 0, floorTop, w, floorH, baseHex);
  }

  // Gloss clear-coat highlight — intensity depends on sheen selection
  // matte = none, satin = subtle, gloss = full reflective shine
  const glossIntensity = sheen === "matte" ? 0 : sheen === "satin" ? 0.15 : 0.3;
  if (glossIntensity > 0) {
    octx.globalCompositeOperation = "soft-light";
    octx.globalAlpha = glossIntensity;
    const gloss = octx.createLinearGradient(0, floorTop, 0, h);
    gloss.addColorStop(0, "rgba(255,255,255,0.5)");
    gloss.addColorStop(0.35, "rgba(255,255,255,0)");
    gloss.addColorStop(0.7, "rgba(255,255,255,0)");
    gloss.addColorStop(1, "rgba(255,255,255,0.25)");
    octx.fillStyle = gloss;
    octx.fillRect(0, floorTop, w, floorH);
    octx.globalAlpha = 1;
    octx.globalCompositeOperation = "source-over";
  }

  octx.restore();

  // Gradient alpha mask at the top edge for a smooth wall-to-floor transition.
  // destination-out ERASES pixels where the source is opaque — so a gradient
  // from opaque (top) to transparent (bottom) creates a fade while leaving
  // the rest of the texture fully intact.
  octx.globalCompositeOperation = "destination-out";
  octx.globalAlpha = 1;
  const fadeH = h * 0.06;
  const mask = octx.createLinearGradient(0, floorTop, 0, floorTop + fadeH);
  mask.addColorStop(0, "rgba(0,0,0,1)");   // fully erase at top edge
  mask.addColorStop(1, "rgba(0,0,0,0)");   // no erasure below fade zone
  octx.fillStyle = mask;
  octx.fillRect(0, floorTop, w, fadeH);

  // Reset composite operation so the overlay draws correctly onto the main canvas.
  octx.globalCompositeOperation = "source-over";

  // Composite the textured floor onto the exact original photo.
  // 0.95 opacity — the selected color dominates while a small amount of the
  // original floor texture shows through for realistic blending.
  ctx.globalAlpha = 0.95;
  ctx.drawImage(overlay, 0, 0);
  ctx.globalAlpha = 1;

  return canvas.toDataURL("image/jpeg", 0.92);
}