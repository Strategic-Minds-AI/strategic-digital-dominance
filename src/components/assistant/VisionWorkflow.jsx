import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ESignCard from "./ESignCard";
import PhotoUploader from "./PhotoUploader";
import ColorChartPicker from "./ColorChartPicker";
import SheenPicker from "./SheenPicker";
import SlabConditionForm from "./SlabConditionForm";
import SqftInput from "./SqftInput";
import BeforeAfterGrid from "./BeforeAfterGrid";

const GOLD_GRADIENT = "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)";

const STEPS = ["Agree", "Photos", "Color", "Finish", "Slab", "Area", "Preview", "Done"];

export default function VisionWorkflow({ onClose }) {
  const [step, setStep] = useState(0);
  const [signedStart, setSignedStart] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sheen, setSheen] = useState("satin");
  const [slab, setSlab] = useState({ cracks: 0, patches: 0, holes: 0, sawCuts: 0 });
  const [sqft, setSqft] = useState(0);
  const [composites, setComposites] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [signedEnd, setSignedEnd] = useState(false);

  const canProceed = () => {
    if (step === 0) return signedStart;
    if (step === 1) return photos.length > 0;
    if (step === 2) return selectedColor !== null;
    return true;
  };

  const generateComposites = async () => {
    if (photos.length === 0 || !selectedColor) return;
    setGenerating(true);
    setComposites([]);
    try {
      const results = await Promise.all(photos.map(async (p) => {
        const res = await base44.functions.invoke('vercelAiGateway', {
          action: 'editImage',
          prompt: `Photorealistic interior of the same space, but the concrete floor has been resurfaced with a ${selectedColor.color_name} ${selectedColor.system || "flake"} epoxy floor coating. The floor color is ${selectedColor.hex} (${selectedColor.color_name}, color code ${selectedColor.code}). The finish is ${sheen}. Keep the walls, ceiling, and all objects identical to the original photo. Only the floor surface changes — it now has a smooth, professional epoxy coating in ${selectedColor.color_name}.`,
          reference_image_url: p.url,
        });
        return res?.data?.url || p.url;
      }));
      setComposites(results);
    } catch (err) {
      console.error(err);
      setComposites(photos.map((p) => p.url));
    }
    setGenerating(false);
  };

  const handleNext = () => {
    if (step === 5) generateComposites();
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => step > 0 && setStep(step - 1);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-stone-200 bg-white shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-[13px] font-bold text-black">Your Vision</div>
          <div className="text-[9px] text-stone-500">Step {step + 1} of {STEPS.length} · {STEPS[step]}</div>
        </div>
        <div className="w-8" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-stone-100 shrink-0">
        <div className="h-full transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg,#FFF6D5,#D4AF37)" }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
        {step === 0 && <ESignCard title="Before We Begin" onSign={() => setSignedStart(true)} signed={signedStart} />}
        {step === 1 && <PhotoUploader photos={photos} setPhotos={setPhotos} />}
        {step === 2 && <ColorChartPicker selectedColor={selectedColor} onSelect={setSelectedColor} />}
        {step === 3 && <SheenPicker sheen={sheen} setSheen={setSheen} />}
        {step === 4 && <SlabConditionForm slab={slab} setSlab={setSlab} />}
        {step === 5 && <SqftInput sqft={sqft} setSqft={setSqft} />}
        {step === 6 && <BeforeAfterGrid photos={photos} composites={composites} sheen={sheen} generating={generating} selectedColor={selectedColor} />}
        {step === 7 && (
          <div className="space-y-3">
            <h3 className="text-[14px] font-bold text-black">You're All Set!</h3>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[12px] text-stone-700 space-y-1">
              <div>Photos: <b>{photos.length}</b></div>
              <div>Color: <b>{selectedColor?.color_name}</b> ({selectedColor?.code})</div>
              <div>Finish: <b className="capitalize">{sheen}</b></div>
              <div>Area: <b>{sqft + Math.ceil(sqft * 0.1)} sq ft</b> (with 10% overage)</div>
            </div>
            <ESignCard title="Confirm & Sign" onSign={() => setSignedEnd(true)} signed={signedEnd} />
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="shrink-0 px-4 py-3 border-t border-stone-200 bg-white flex gap-2" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        {step > 0 && (
          <button onClick={handleBack} className="h-11 px-4 rounded-xl border border-stone-300 text-[12px] font-bold text-stone-700 flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        )}
        {step < 7 ? (
          <button onClick={handleNext} disabled={!canProceed()} className="flex-1 h-11 rounded-xl text-[13px] font-bold disabled:opacity-50 flex items-center justify-center gap-1" style={{ background: GOLD_GRADIENT, border: "2px solid #000", color: "#1a1a1a" }}>
            {step === 5 ? "See My Floor" : "Continue"} <ChevronRight className="h-4 w-4" />
          </button>
        ) : signedEnd ? (
          <button onClick={onClose} className="flex-1 h-11 rounded-xl text-[13px] font-bold bg-black text-white flex items-center justify-center gap-1">
            <Check className="h-4 w-4" /> Done
          </button>
        ) : (
          <button disabled className="flex-1 h-11 rounded-xl text-[13px] font-bold opacity-50" style={{ background: GOLD_GRADIENT, border: "2px solid #000", color: "#1a1a1a" }}>
            Sign to Finish
          </button>
        )}
      </div>
    </div>
  );
}