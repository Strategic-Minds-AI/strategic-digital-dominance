import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, Loader2, Send, MapPin, Sparkles, PenTool } from "lucide-react";
import { getSystemColorRecords } from "@/lib/floorColors";
import { FLOOR_SYSTEM_DATA } from "@/data/colorData";
import { computeRange } from "@/lib/visualizerPricing";
import { money } from "@/lib/pricing";
import { generateBidPdf } from "@/lib/bidPdf";
import { Image } from "@/components/ui/image";

const SYSTEMS = FLOOR_SYSTEM_DATA.filter((s) => s.name !== "Joint Fill & Repair").map((s) => s.name);

const CONDITIONS = [
  { key: "good", label: "Good", desc: "Clean bare concrete" },
  { key: "fair", label: "Fair", desc: "Minor cracks/stains" },
  { key: "poor", label: "Poor", desc: "Major prep needed" },
];

const BASE_RATES = {
  "Flake Epoxy": { low: 5, high: 8 },
  "Solid Epoxy": { low: 4, high: 7 },
  "Metallic Epoxy": { low: 7, high: 12 },
  "Polished Concrete": { low: 6, high: 10 },
  "Polyaspartic": { low: 6, high: 9 },
  "Stained Concrete": { low: 5, high: 8 },
};

const inputCls = "w-full h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition";
const labelCls = "text-[10px] font-bold text-stone-500 uppercase tracking-wide block mb-1.5";
const cardCls = "rounded-2xl bg-white border border-stone-200 p-4";
const goldBtn = "rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20 active:scale-[0.98] transition disabled:opacity-50";

export default function BidGenerator({ onTabChange }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    systemName: "Flake Epoxy",
    condition: "good",
    sqft: 440,
    photos: [],
    conceptImage: "",
  });
  const [color, setColor] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [looking, setLooking] = useState(false);
  const [signed, setSigned] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const colors = getSystemColorRecords(data.systemName);
  const rates = BASE_RATES[data.systemName] || BASE_RATES["Flake Epoxy"];
  const range = computeRange({
    square_feet: data.sqft,
    condition: data.condition,
    base_rate_low: rates.low,
    base_rate_high: rates.high,
  });

  const update = (patch) => setData({ ...data, ...patch });

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update({ photos: [file_url] });
    } catch {}
    setUploading(false);
  };

  const lookupSqft = async () => {
    if (!data.address) return;
    setLooking(true);
    try {
      const fullAddr = `${data.address}, ${data.city || ""}, ${data.state || ""} ${data.zip || ""}`;
      const res = await base44.functions.invoke("propertyLookup", { address: fullAddr, fallback_sqft: 440 });
      if (res?.sqft) update({ sqft: res.sqft });
    } catch {}
    setLooking(false);
  };

  const generateConcept = async () => {
    if (!data.photos[0] || !color) return;
    setGenerating(true);
    setError("");
    try {
      const prompt = `Photorealistic interior design rendering of the uploaded garage with a newly installed ${data.systemName} floor in the color "${color.color_name || color.name}". Professional concrete coating finish. Same room geometry and lighting. High-end real-estate photography.`;
      const res = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: data.photos,
      });
      update({ conceptImage: res.url });
    } catch (e) {
      setError("Could not generate preview. Continuing without.");
    }
    setGenerating(false);
  };

  const sendProposal = async () => {
    setSending(true);
    try {
      const lead = await base44.entities.Lead.create({
        first_name: data.customerName?.split(" ")[0] || "Customer",
        last_name: data.customerName?.split(" ").slice(1).join(" ") || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
        square_footage: data.sqft,
        desired_system: data.systemName,
        flake_color: color?.id || "",
        flake_color_name: color?.color_name || color?.name || "",
        flake_color_hex: color?.hex || "",
        floor_condition: [data.condition],
        estimate_low: range.low,
        estimate_mid: Math.round((range.low + range.high) / 2),
        estimate_high: range.high,
        concept_image: data.conceptImage || "",
        photos: data.photos,
        status: "PROPOSAL SENT",
        lead_source: "contractor_app",
        notes: `Bid generated via Contractor App. Signed: ${signed ? "Yes" : "No"}`,
      });

      if (data.email) {
        try {
          const pdfBytes = generateBidPdf(lead, null, window.location.origin);
          const { file_url } = await base44.integrations.Core.UploadFile({
            file: new File([pdfBytes], "Proposal.pdf", { type: "application/pdf" }),
          });
          await base44.functions.invoke("sendEstimateEmail", {
            lead_id: lead.id,
            floor_image_url: data.conceptImage || undefined,
            pdf_url: file_url,
            origin: window.location.origin,
          });
        } catch {}
      }
      setSent(true);
    } catch (e) {
      setError(e.message || "Failed to send proposal");
    }
    setSending(false);
  };

  const STEPS = ["Customer", "Property", "System", "Measure", "Review", "Sign & Send"];

  const next = () => { setStep((s) => Math.min(s + 1, 5)); window.scrollTo(0, 0); };
  const back = () => { setStep((s) => Math.max(s - 1, 0)); window.scrollTo(0, 0); };

  if (sent) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">Proposal Sent!</h2>
        <p className="text-sm text-stone-500 mt-2 max-w-xs">
          The bid has been saved to your pipeline and emailed to {data.email || "the customer"}.
        </p>
        <button
          onClick={() => onTabChange("pipeline")}
          className={`mt-6 ${goldBtn} px-6 py-3 text-sm flex items-center gap-2`}
        >
          View Pipeline <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-stone-900">New Bid</h1>
        <span className="text-xs text-stone-500 font-semibold">{STEPS[step]} · Step {step + 1}/6</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition ${i <= step ? "bg-amber-500" : "bg-stone-200"}`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Step 0: Customer */}
      {step === 0 && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Customer Name</label>
            <input value={data.customerName || ""} onChange={(e) => update({ customerName: e.target.value })} placeholder="John Smith" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={data.email || ""} onChange={(e) => update({ email: e.target.value })} placeholder="john@email.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" value={data.phone || ""} onChange={(e) => update({ phone: e.target.value })} placeholder="(555) 123-4567" className={inputCls} />
          </div>
        </div>
      )}

      {/* Step 1: Property */}
      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Street Address</label>
            <input value={data.address || ""} onChange={(e) => update({ address: e.target.value })} placeholder="123 Main St" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>City</label>
              <input value={data.city || ""} onChange={(e) => update({ city: e.target.value })} placeholder="Tampa" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input value={data.state || ""} onChange={(e) => update({ state: e.target.value })} placeholder="FL" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>ZIP</label>
            <input value={data.zip || ""} onChange={(e) => update({ zip: e.target.value })} placeholder="33601" className={inputCls} />
          </div>
          <button onClick={lookupSqft} disabled={!data.address || looking} className={`${goldBtn} py-2.5 w-full text-sm flex items-center justify-center gap-2`}>
            {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {looking ? "Looking up..." : "Auto-Detect Garage Sq Ft"}
          </button>
          {data.sqft > 0 && (
            <div className={`${cardCls} text-center`}>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Detected Size</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">{data.sqft} sq ft</div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: System + Color */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Floor System</label>
            <div className="flex flex-wrap gap-2">
              {SYSTEMS.map((s) => (
                <button
                  key={s}
                  onClick={() => { update({ systemName: s }); setColor(null); }}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${
                    data.systemName === s
                      ? "bg-amber-500 text-white border-amber-500 font-bold"
                      : "bg-white text-stone-600 border-stone-300 hover:border-amber-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Color</label>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c)}
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition ${
                    color?.id === c.id ? "border-amber-500 bg-amber-50" : "border-stone-300 bg-white hover:border-stone-400"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full overflow-hidden border border-stone-300 shrink-0">
                    {c.image_url ? (
                      <Image src={c.image_url} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <span className="block w-full h-full" style={{ background: c.hex || "#ccc" }} />
                    )}
                  </span>
                  <span className="text-xs text-stone-700">{c.color_name || c.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Photo upload + concept */}
          <div>
            <label className={labelCls}>Upload Garage Photo</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="hidden" />
            {data.photos[0] ? (
              <div className="relative rounded-xl overflow-hidden">
                <Image src={data.photos[0]} alt="garage" className="w-full aspect-video object-cover" fittingType="fill" />
                <button onClick={() => fileRef.current?.click()} className={`absolute bottom-2 right-2 ${goldBtn} rounded-lg px-3 py-1.5 text-xs`}>
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-xl border-2 border-dashed border-stone-300 py-8 flex flex-col items-center gap-2 text-stone-400 hover:border-amber-500 hover:text-amber-600 transition"
              >
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                <span className="text-xs font-semibold">Upload photo</span>
              </button>
            )}
            {data.photos[0] && color && !data.conceptImage && (
              <button
                onClick={generateConcept}
                disabled={generating}
                className="mt-2 w-full rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-xs font-bold text-amber-700 flex items-center justify-center gap-2 hover:bg-amber-100 transition"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate AI Preview
              </button>
            )}
            {data.conceptImage && (
              <div className="mt-2 rounded-xl overflow-hidden">
                <Image src={data.conceptImage} alt="concept" className="w-full aspect-video object-cover" fittingType="fill" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Measurements */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Square Footage</label>
            <input type="number" value={data.sqft || ""} onChange={(e) => update({ sqft: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Floor Condition</label>
            <div className="space-y-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => update({ condition: c.key })}
                  className={`w-full text-left rounded-xl border p-3 transition ${
                    data.condition === c.key
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="text-sm font-bold text-stone-900">{c.label}</div>
                  <div className="text-xs text-stone-500">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Live range */}
          <div className={`${cardCls} text-center`}>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Estimated Range</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {money(range.low)} – {money(range.high)}
            </div>
            <div className="text-xs text-stone-500 mt-1">{data.sqft} sq ft · {data.systemName}</div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-stone-900">Review Proposal</h2>
          <div className={`${cardCls} space-y-3`}>
            <Row label="Customer" value={data.customerName || "—"} />
            <Row label="Contact" value={`${data.email || "—"} · ${data.phone || "—"}`} />
            <Row label="Address" value={`${data.address || "—"}, ${data.city || ""}, ${data.state || ""}`} />
            <Row label="System" value={data.systemName} />
            <Row label="Color" value={color?.color_name || color?.name || "—"} />
            <Row label="Size" value={`${data.sqft} sq ft`} />
            <Row label="Condition" value={CONDITIONS.find((c) => c.key === data.condition)?.label || "—"} />
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Price Range</span>
                <span className="text-lg font-extrabold text-amber-600">
                  {money(range.low)} – {money(range.high)}
                </span>
              </div>
            </div>
          </div>
          {data.conceptImage && (
            <div className="rounded-xl overflow-hidden">
              <Image src={data.conceptImage} alt="preview" className="w-full aspect-video object-cover" fittingType="fill" />
            </div>
          )}
        </div>
      )}

      {/* Step 5: Sign & Send */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-stone-900">Sign & Send Proposal</h2>
          <div className={cardCls}>
            <p className="text-xs text-stone-500 mb-3">
              The customer can sign digitally on your device, or you can send the proposal for them to review and sign online.
            </p>
            <button
              onClick={() => setSigned(!signed)}
              className={`w-full rounded-xl border-2 py-4 flex items-center justify-center gap-2 font-bold text-sm transition ${
                signed
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                  : "border-dashed border-stone-300 text-stone-500 hover:border-amber-500"
              }`}
            >
              {signed ? <CheckCircle2 className="h-5 w-5" /> : <PenTool className="h-5 w-5" />}
              {signed ? "Signed by Customer" : "Tap to Sign"}
            </button>
          </div>
          <button onClick={sendProposal} disabled={!signed || sending} className={`${goldBtn} py-3.5 w-full text-sm flex items-center justify-center gap-2`}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending..." : "Send Proposal"}
          </button>
          <button onClick={() => setStep(4)} className="w-full text-xs text-stone-500 hover:text-stone-700 py-2 font-semibold">
            Back to review
          </button>
        </div>
      )}

      {/* Nav buttons */}
      {step < 5 && (
        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <button onClick={back} className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-600 flex items-center gap-1.5 hover:border-stone-400">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          <button onClick={next} disabled={step === 0 && !data.customerName} className={`${goldBtn} py-3 flex-1 text-sm flex items-center justify-center gap-2`}>
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-stone-500 shrink-0 font-semibold">{label}</span>
      <span className="text-sm text-stone-900 text-right font-semibold">{value}</span>
    </div>
  );
}