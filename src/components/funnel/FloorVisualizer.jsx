import React, { useState, useMemo, useRef } from "react";
import { Loader2, Sparkles, AlertCircle, Upload, Wand2 } from "lucide-react";
import { getSystemColorRecords, getSystemRepresentative } from "@/lib/floorColors";
import { FLOOR_SYSTEM_DATA } from "@/data/colorData";
import { base44 } from "@/api/base44Client";
import Disclosure from "@/components/vq/Disclosure";
import { AI_DISCLOSURE } from "@/lib/brand";

// Systems available in the visualizer (excludes Joint Fill & Repair — not a finish)
const SYSTEMS = FLOOR_SYSTEM_DATA
  .filter((s) => s.name !== "Joint Fill & Repair")
  .map((s) => ({ name: s.name, slug: s.slug }));

const FINISHES = [
  { key: "matte", label: "Matte", desc: "Flat, no reflection — soft non-reflective finish" },
  { key: "satin", label: "Satin", desc: "Subtle soft sheen with low reflection" },
  { key: "gloss", label: "High Gloss", desc: "High-gloss wet-look with sharp mirror-like reflections" },
];

// Visualizer flow (from the xtremevisualizer package):
// 1. Pick a floor system
// 2. Pick a color from the system's exact manufacturer color chart
// 3. Pick a finish (Matte / Satin / High Gloss)
// 4. Upload a photo of the floor
// 5. Press "Visualize My Floor" — the user's photo is attached to an AI image
//    generation call with the exact color name + sheen in the prompt,
//    producing a before/after with the floor in the chosen color.
export default function FloorVisualizer({ onPhotoChange, onColorSelected, initialPhoto, initialColor }) {
  // Normalize initialColor: Funnel passes { code, color_name, hex, system }
  // but color records use { name, hex, code, image_url }
  const normalizedInitial = initialColor
    ? { ...initialColor, name: initialColor.name || initialColor.color_name }
    : null;
  const [systemName, setSystemName] = useState(normalizedInitial?.system || "Flake Epoxy");
  const [photoUrl, setPhotoUrl] = useState(initialPhoto || "");
  const [uploadedUrl, setUploadedUrl] = useState(initialPhoto || "");
  const [selectedColor, setSelectedColor] = useState(normalizedInitial);
  const [finish, setFinish] = useState("gloss");
  const [generating, setGenerating] = useState(false);
  const [conceptUrl, setConceptUrl] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const colorRecords = useMemo(() => getSystemColorRecords(systemName), [systemName]);

  const pickSystem = (name) => {
    setSystemName(name);
    setSelectedColor(null);
    setConceptUrl("");
  };

  const pickColor = (c) => {
    setSelectedColor(c);
    setConceptUrl("");
    onColorSelected?.({ code: c.code, color_name: c.name, hex: c.hex, system: systemName });
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Always create a data URL for the composite — same-origin, so the
    // canvas is never tainted and toDataURL always works.
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    setPhotoUrl(dataUrl);
    setUploadedUrl("");
    setConceptUrl("");

    // Upload for storage — the uploaded URL is publicly fetchable and is what
    // GenerateImage needs as existing_image_urls (data URLs won't work server-side).
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      onPhotoChange?.(file_url);
    } catch {
      onPhotoChange?.(dataUrl);
    }
  };

  const generate = async () => {
    if (!photoUrl || !selectedColor) return;
    setGenerating(true);
    setError("");
    setConceptUrl("");
    try {
      // Package visualizer flow: attach the user's floor photo and render the
      // EXACT color chart color + sheen onto it via AI image generation.
      const sheenDesc =
        finish === "matte" ? "flat matte sheen with no reflections" :
        finish === "satin" ? "soft satin sheen with gentle subtle reflections" :
        "high-gloss wet-look sheen with sharp mirror-like reflections";
      const prompt =
        'Photorealistic interior design rendering of the uploaded room with a newly installed ' +
        systemName + ' floor in the color "' + (selectedColor.name || "") +
        '" with a ' + sheenDesc +
        '. Seamless, professional concrete coating finish. Same room geometry, walls, and lighting as the original photo. High-end real-estate photography, wide angle, natural light.';
      const res = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: uploadedUrl ? [uploadedUrl] : undefined,
      });
      setConceptUrl(res.url);
    } catch (err) {
      setError(`Could not generate preview: ${err?.message || "Unknown error"}`);
      console.error("[FloorVisualizer] generate failed:", err);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Choose floor system */}
      <div>
        <h4 className="font-semibold text-stone-900 mb-3">1. Choose your floor system</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SYSTEMS.map((s) => {
            const rep = getSystemRepresentative(s.name);
            return (
              <button
                key={s.slug}
                onClick={() => pickSystem(s.name)}
                className={`flex flex-col gap-2 p-3 rounded-xl border transition text-left ${
                  systemName === s.name
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="h-10 rounded-lg overflow-hidden border border-stone-200 flex">
                  {rep?.image_url ? (
                    <img src={rep.image_url} alt={rep.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full" style={{ background: rep?.hex || "#888" }} />
                  )}
                </div>
                <span className="text-xs font-bold text-stone-800 truncate">{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose color from the system's exact color chart */}
      <div>
        <h4 className="font-semibold text-stone-900 mb-1">{systemName} color chart</h4>
        <p className="text-xs text-stone-500 mb-3">These are the exact manufacturer colors — what you pick is what you get.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
          {colorRecords.map((c) => (
            <button
              key={c.code}
              onClick={() => pickColor(c)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${
                selectedColor?.code === c.code
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              {c.image_url ? (
                <img src={c.image_url} alt={c.name} loading="lazy" className="h-12 w-full object-cover object-top rounded-lg" />
              ) : (
                <span className="h-12 w-full rounded-lg" style={{ background: c.hex }} />
              )}
              <span className="text-[11px] font-medium text-stone-700 truncate w-full text-center">{c.name}</span>
              <span className="text-[10px] text-stone-400">{c.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Choose finish */}
      <div>
        <h4 className="font-semibold text-stone-900 mb-3">3. Choose your finish</h4>
        <div className="grid grid-cols-3 gap-2">
          {FINISHES.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFinish(f.key); setConceptUrl(""); }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition ${
                finish === f.key
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <span className="text-xs font-bold text-stone-800">{f.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">{FINISHES.find((f) => f.key === finish)?.desc}</p>
      </div>

      {/* Step 4: Upload a photo of the floor */}
      <div>
        <h4 className="font-semibold text-stone-900 mb-3">4. Upload a photo of your floor</h4>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-500 transition cursor-pointer p-6 flex flex-col items-center gap-2 bg-stone-50"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Your floor" className="max-h-40 rounded-lg" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">Tap to upload a photo</span>
              <span className="text-xs text-stone-400">Garage, basement, patio — any concrete floor</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Step 5: Visualize */}
      {photoUrl && selectedColor && (
        <div>
          <button
            onClick={generate}
            disabled={generating || !uploadedUrl}
            className="w-full h-14 rounded-xl flex items-center justify-center gap-2 text-base font-bold disabled:opacity-60 transition"
            style={{
              background: "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)",
              border: "2px solid #000",
              color: "#1a1a1a",
              boxShadow: "0 4px 12px rgba(212,175,55,.4), inset 0 1px rgba(255,255,255,.4)",
            }}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Rendering your floor…
              </>
            ) : !uploadedUrl ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Uploading your photo…
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" /> Visualize My Floor
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Result — before/after */}
      {conceptUrl && (
        <div>
          <h4 className="font-semibold text-stone-900 mb-3">Your transformation</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl overflow-hidden border border-stone-200">
              <img src={photoUrl} alt="Before" className="w-full h-48 object-cover" />
              <p className="text-[10px] tracking-[0.16em] text-stone-400 p-2">BEFORE</p>
            </div>
            <div className="rounded-xl overflow-hidden border border-amber-300">
              <img src={conceptUrl} alt="After" className="w-full h-48 object-cover" />
              <p className="text-[10px] tracking-[0.16em] text-amber-600 p-2">
                AFTER — {selectedColor?.name} · {FINISHES.find((f) => f.key === finish)?.label}
              </p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="mt-3 w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 transition disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Regenerating…" : "Regenerate"}
          </button>
          <div className="mt-3">
            <Disclosure text={AI_DISCLOSURE} />
          </div>
        </div>
      )}
    </div>
  );
}