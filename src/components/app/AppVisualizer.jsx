import React, { useState, useRef, useEffect } from "react";
import { Upload, Loader2, Save, Trash2, X, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COLOR_DATA } from "@/lib/colorData";
import { Image } from "@/components/ui/image";
import BeforeAfter from "@/components/funnel/BeforeAfter";

const SYSTEMS = [
  { key: "flake", label: "Flake" },
  { key: "metallic", label: "Metallic" },
  { key: "solid", label: "Solid" },
  { key: "quartz", label: "Quartz" },
  { key: "glitter", label: "Glitter" },
  { key: "dye_stain", label: "Stain" }
];

export default function AppVisualizer({ appData }) {
  const { savedFloors, addFloor, removeFloor } = appData;
  const [system, setSystem] = useState("flake");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [afterUrl, setAfterUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [viewing, setViewing] = useState(null); // saved floor being viewed
  const fileRef = useRef(null);

  const colors = COLOR_DATA.filter((c) => c.system === system && c.image_url);

  useEffect(() => {
    if (!photoUrl || !selectedColor) return;
    let cancelled = false;
    const run = async () => {
      setProcessing(true);
      setAfterUrl("");
      try {
        const res = await base44.functions.invoke('vercelAiGateway', {
          action: 'editImage',
          prompt: `Photorealistic interior of the same garage, but the concrete floor has been resurfaced with a ${selectedColor.color_name} ${system} epoxy floor coating. The floor color is ${selectedColor.hex} (${selectedColor.color_name}, color code ${selectedColor.code}). The finish is high gloss. Keep the walls, ceiling, garage door, and all objects identical to the original photo. Only the floor surface changes — it now has a smooth, professional epoxy coating in ${selectedColor.color_name}.`,
          reference_image_url: photoUrl,
        });
        if (!cancelled) setAfterUrl(res?.data?.url || photoUrl);
      } catch {
        if (!cancelled) setAfterUrl(photoUrl);
      } finally {
        if (!cancelled) setProcessing(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [photoUrl, selectedColor]);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
      setSelectedColor(null);
      setAfterUrl("");
    } catch {
      // fallback: use object URL so canvas still works locally
      setPhotoUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!photoUrl || !selectedColor) return;
    addFloor({
      photoUrl,
      colorName: selectedColor.color_name,
      colorHex: selectedColor.hex,
      colorCode: selectedColor.code,
      system
    });
    setPhotoUrl("");
    setSelectedColor(null);
    setAfterUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const viewSaved = async (floor) => {
    setViewing(floor);
    setProcessing(true);
    try {
      const res = await base44.functions.invoke('vercelAiGateway', {
        action: 'editImage',
        prompt: `Photorealistic interior of the same garage, but the concrete floor has been resurfaced with a ${floor.colorName} ${floor.system} epoxy floor coating. The floor color is ${floor.colorHex} (${floor.colorName}). The finish is high gloss. Keep the walls, ceiling, garage door, and all objects identical to the original photo. Only the floor surface changes — it now has a smooth, professional epoxy coating in ${floor.colorName}.`,
        reference_image_url: floor.photoUrl,
      });
      setAfterUrl(res?.data?.url || floor.photoUrl);
    } catch {
      setAfterUrl(floor.photoUrl);
    } finally {
      setProcessing(false);
    }
  };

  if (viewing) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{viewing.colorName}</h2>
            <p className="text-xs text-stone-500">{viewing.colorCode} · {viewing.system}</p>
          </div>
          <button onClick={() => { setViewing(null); setAfterUrl(""); }} className="h-9 w-9 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>
        {processing ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-sm mt-3">Rendering your floor…</p>
          </div>
        ) : afterUrl ? (
          <BeforeAfter beforeUrl={viewing.photoUrl} afterUrl={afterUrl} />
        ) : (
          <Image src={viewing.photoUrl} alt={viewing.colorName} className="w-full rounded-xl" />
        )}
        <p className="text-xs text-stone-400 mt-3 text-center">Drag the slider to compare your original floor with the {viewing.colorName} finish.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-6">
      <h1 className="text-xl font-display font-extrabold text-stone-900 mb-1">Floor Visualizer</h1>
      <p className="text-sm text-stone-500 mb-4">Upload a photo of your garage, pick a color, and see it transformed instantly.</p>

      {/* Upload zone */}
      {!photoUrl ? (
        <label className="block">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 transition">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700">Tap to upload a photo</p>
                <p className="text-xs text-stone-400 mt-1">JPEG or PNG · your garage floor</p>
              </>
            )}
          </div>
        </label>
      ) : (
        <>
          {/* System tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {SYSTEMS.map((s) => (
              <button
                key={s.key}
                onClick={() => { setSystem(s.key); setSelectedColor(null); }}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition ${system === s.key ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Color grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {colors.slice(0, 24).map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedColor(c)}
                className={`rounded-xl overflow-hidden border-2 transition ${selectedColor?.code === c.code ? "border-amber-500 ring-2 ring-amber-200" : "border-stone-200"}`}
              >
                <div className="h-16 relative">
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.color_name} fittingType="fill" className="h-full w-full" />
                  ) : (
                    <div className="h-full w-full" style={{ background: c.hex }} />
                  )}
                </div>
                <div className="p-1 bg-white">
                  <div className="text-[9px] font-semibold text-stone-700 truncate">{c.color_name}</div>
                  <div className="text-[8px] text-stone-400">{c.code}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          {selectedColor && (
            <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              {processing ? (
                <div className="flex flex-col items-center justify-center py-16 text-stone-500">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                  <p className="text-sm mt-3">Applying {selectedColor.color_name}…</p>
                </div>
              ) : afterUrl ? (
                <BeforeAfter beforeUrl={photoUrl} afterUrl={afterUrl} />
              ) : (
                <Image src={photoUrl} alt="Your floor" className="w-full" />
              )}
            </div>
          )}

          {/* Actions */}
          {selectedColor && afterUrl && (
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 transition">
                <Save className="h-4 w-4" /> Save to my floors
              </button>
              <button onClick={() => { setPhotoUrl(""); setSelectedColor(""); setAfterUrl(""); if (fileRef.current) fileRef.current.value = ""; }} className="h-12 px-5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-sm">
                New photo
              </button>
            </div>
          )}
        </>
      )}

      {/* Saved floors */}
      {savedFloors.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" /> My Saved Floors ({savedFloors.length})
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {savedFloors.map((f) => (
              <div key={f.id} className="relative group rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                <button onClick={() => viewSaved(f)} className="block w-full">
                  <div className="h-24 relative">
                    <Image src={f.photoUrl} alt={f.colorName} fittingType="fill" className="h-full w-full" />
                    <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white shadow" style={{ background: f.colorHex }} />
                  </div>
                  <div className="p-1.5">
                    <div className="text-[10px] font-semibold text-stone-800 truncate">{f.colorName}</div>
                  </div>
                </button>
                <button onClick={() => removeFloor(f.id)} className="absolute top-1 left-1 h-6 w-6 rounded-full bg-stone-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}