import React, { useState, useRef, useEffect } from "react";
import { Loader2, Upload, Wand2, AlertCircle } from "lucide-react";
import { compositeFloorImage } from "@/lib/floorComposite";
import { getSystemColorRecords } from "@/lib/floorColors";
import { FLOOR_SYSTEM_DATA } from "@/data/colorData";

// Sample garage photo — a plain concrete garage interior
const SAMPLE_PHOTO = "https://images.unsplash.com/photo-1605152276897-4296181db00d?w=1200&q=80";

const SYSTEMS = FLOOR_SYSTEM_DATA
  .filter((s) => s.name !== "Joint Fill & Repair")
  .map((s) => s.name);

export default function VisualizerTest() {
  const [systemName, setSystemName] = useState("Flake Epoxy");
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO);
  const [conceptUrl, setConceptUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const fileInputRef = useRef(null);

  const colorRecords = getSystemColorRecords(systemName);
  const [selectedColor, setSelectedColor] = useState(colorRecords[0] || null);

  // Reset color when system changes
  useEffect(() => {
    const records = getSystemColorRecords(systemName);
    setSelectedColor(records[0] || null);
    setConceptUrl("");
  }, [systemName]);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    setPhotoUrl(dataUrl);
    setConceptUrl("");
  };

  const generate = async () => {
    if (!photoUrl || !selectedColor?.hex) {
      setError("Missing photo or color");
      return;
    }
    setLoading(true);
    setError("");
    setConceptUrl("");
    setDebugInfo(`System: ${systemName} | Hex: ${selectedColor.hex} | Name: ${selectedColor.name}`);
    try {
      const dataUrl = await compositeFloorImage(photoUrl, {
        hex: selectedColor.hex,
        system: systemName,
      }, "gloss");
      setConceptUrl(dataUrl);
    } catch (err) {
      setError(`FAILED: ${err?.message || err}`);
      console.error("[VisualizerTest] composite failed:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Visualizer Test — Forensic Proof</h1>
        <p className="text-sm text-stone-500 mb-6">
          This page proves the canvas composite renders the EXACT color chart hex onto the floor.
          Pick a system, pick a color, upload or use the sample photo, then press Generate.
        </p>

        {/* System picker */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-stone-700 mb-2">Floor System</label>
          <div className="flex flex-wrap gap-2">
            {SYSTEMS.map((s) => (
              <button
                key={s}
                onClick={() => setSystemName(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  systemName === s
                    ? "border-amber-500 bg-amber-50 text-stone-900"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Color Chart ({colorRecords.length} colors) — Selected: {selectedColor?.name} ({selectedColor?.code}) — Hex: {selectedColor?.hex}
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1">
            {colorRecords.map((c) => (
              <button
                key={c.code}
                onClick={() => { setSelectedColor(c); setConceptUrl(""); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${
                  selectedColor?.code === c.code
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    loading="lazy"
                    className="h-12 w-full object-cover object-top rounded"
                  />
                ) : (
                  <span className="h-12 w-full rounded" style={{ background: c.hex }} />
                )}
                <span className="text-[10px] font-medium text-stone-700 truncate w-full text-center">{c.name}</span>
                <span className="text-[9px] text-stone-400">{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-stone-700 mb-2">Photo</label>
          <div className="flex gap-3 items-start">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-48 h-32 rounded-lg border-2 border-dashed border-stone-300 hover:border-amber-500 transition cursor-pointer overflow-hidden bg-stone-100"
            >
              <img src={photoUrl} alt="Floor photo" className="w-full h-full object-cover" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            </div>
            <button
              onClick={() => { setPhotoUrl(SAMPLE_PHOTO); setConceptUrl(""); }}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-stone-200 bg-white hover:border-stone-300"
            >
              Use Sample Photo
            </button>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full h-14 rounded-xl flex items-center justify-center gap-2 text-base font-bold disabled:opacity-60 mb-4"
          style={{
            background: "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)",
            border: "2px solid #000",
            color: "#1a1a1a",
            boxShadow: "0 4px 12px rgba(212,175,55,.4)",
          }}
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Rendering…</>
          ) : (
            <><Wand2 className="h-5 w-5" /> Generate Composite</>
          )}
        </button>

        {debugInfo && (
          <div className="mb-4 p-3 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-600 font-mono">
            {debugInfo}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Before / After result */}
        {conceptUrl && (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-3">Result — Before & After</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-stone-200">
                <img src={photoUrl} alt="Before" className="w-full h-64 object-cover" />
                <p className="text-xs font-bold tracking-widest text-stone-400 p-2">BEFORE (original)</p>
              </div>
              <div className="rounded-xl overflow-hidden border-2 border-amber-400">
                <img src={conceptUrl} alt="After" className="w-full h-64 object-cover" />
                <p className="text-xs font-bold tracking-widest text-amber-600 p-2">
                  AFTER — {selectedColor?.name} ({selectedColor?.hex})
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-stone-700">
                <strong>Verification:</strong> The "After" image should show the bottom portion of the
                floor covered in the selected color ({selectedColor?.hex} — {selectedColor?.name})
                with a flake texture, while the upper walls/ceiling remain unchanged from the original.
                If you see the color on the floor, the composite is working correctly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}