import React, { useState, useMemo, useRef } from "react";
import { X, Camera, ChevronRight, Check, Send, Mail, MessageSquare, User, Phone, Ruler, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/lib/useSettings";
import { calcEstimate, money } from "@/lib/pricing";
import { COLOR_DATA } from "@/lib/colorData";
import { uploadFile } from "@/lib/gateway";

const GOLD_GRADIENT = "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)";

const COLOR_SYSTEMS = [
  { key: "flake", label: "Flake" },
  { key: "metallic", label: "Metallic" },
  { key: "solid", label: "Solid" },
  { key: "quartz", label: "Quartz" },
  { key: "glitter", label: "Glitter" },
  { key: "dye_stain", label: "Stained" },
];

// Map color-chart system keys to settings.systems keys for pricing
const SYSTEM_PRICE_MAP = {
  flake: "flake",
  metallic: "metallic",
  solid: "solid",
  quartz: "flake",
  glitter: "metallic",
  dye_stain: "solid",
};

export default function ContractorVisualizer({ onClose }) {
  const { settings } = useSettings();
  const fileRef = useRef(null);

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [colorSystem, setColorSystem] = useState("flake");
  const [selectedColor, setSelectedColor] = useState(null);
  const [sqft, setSqft] = useState("");
  const [conditions, setConditions] = useState([]);
  const [client, setClient] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const colors = useMemo(
    () => COLOR_DATA.filter((c) => c.system === colorSystem).sort((a, b) => a.rank - b.rank),
    [colorSystem]
  );

  const estimate = useMemo(() => {
    if (!sqft || Number(sqft) <= 0) return null;
    const systemKey = SYSTEM_PRICE_MAP[colorSystem];
    return calcEstimate(settings, {
      square_footage: Number(sqft),
      desired_system: systemKey,
      floor_condition: conditions,
    });
  }, [sqft, colorSystem, conditions, settings]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const toggleCondition = (key) => {
    setConditions((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const buildBidText = () => {
    if (!estimate) return "";
    const colorName = selectedColor ? `${selectedColor.color_name} (${selectedColor.code})` : "—";
    return [
      `EPOXY FLOOR ESTIMATE`,
      `Client: ${client.name || "—"}`,
      ``,
      `System: ${colorSystem.toUpperCase()}`,
      `Color: ${colorName}`,
      `Square Footage: ${sqft} sq ft`,
      `Floor Condition: ${conditions.length ? conditions.join(", ") : "Good"}`,
      ``,
      `PRICE RANGE: ${money(estimate.low)} – ${money(estimate.high)}`,
      `EXACT BID: ${money(estimate.mid)}`,
      ``,
      `This is a preliminary estimate. Final price confirmed on site inspection.`,
    ].join("\n");
  };

  const handleSms = () => {
    const text = encodeURIComponent(buildBidText());
    const phone = client.phone.replace(/[^0-9]/g, "");
    window.location.href = `sms:${phone}?body=${text}`;
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Epoxy Floor Estimate — ${client.name || "Client"}`);
    const body = encodeURIComponent(buildBidText());
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  };

  const handleSaveLead = async () => {
    if (!client.name || !client.phone) {
      setError("Client name and phone are required to save to CRM.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let uploadedPhotoUrl = "";
      if (photoFile) {
        try {
          const uploadRes = await uploadFile(photoFile);
          uploadedPhotoUrl = uploadRes?.file_url || "";
        } catch (uploadErr) {
          console.error("Photo upload failed (credits may be exhausted):", uploadErr);
        }
      }

      await base44.entities.Lead.create({
        first_name: client.name.split(" ")[0] || client.name,
        last_name: client.name.split(" ").slice(1).join(" ") || "",
        email: client.email || "",
        phone: client.phone,
        lead_source: "contractor_visualizer",
        lead_type: "homeowner",
        garage_size: "custom",
        square_footage: Number(sqft) || 0,
        desired_system: SYSTEM_PRICE_MAP[colorSystem],
        floor_condition: conditions,
        flake_color: selectedColor?.code || "",
        flake_color_name: selectedColor?.color_name || "",
        flake_color_hex: selectedColor?.hex || "",
        photos: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
        estimate_low: estimate?.low || 0,
        estimate_mid: estimate?.mid || 0,
        estimate_high: estimate?.high || 0,
        status: "NEW ESTIMATE",
        notes: `Contractor visualizer bid — Range: ${money(estimate?.low)}–${money(estimate?.high)}, Exact: ${money(estimate?.mid)}`,
      });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to save lead. Please try again.");
    }
    setSaving(false);
  };

  const canGetBid = sqft && Number(sqft) > 0 && selectedColor;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-stone-200 bg-white shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-[13px] font-bold text-black">Visualize & Bid Fast</div>
          <div className="text-[9px] text-stone-500">Photo · Color · Sq Ft · Bid</div>
        </div>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5" style={{ scrollbarWidth: "none" }}>
        {/* 1. Photo Upload */}
        <Section number={1} title="Client Floor Photo">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-stone-200">
              <img src={photoUrl} alt="Floor" className="w-full h-44 object-cover" />
              <button
                onClick={() => { setPhotoUrl(null); setPhotoFile(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-44 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 text-stone-500 hover:border-amber-500 transition"
            >
              <Camera className="h-8 w-8" />
              <span className="text-[12px] font-semibold">Tap to upload or take photo</span>
              <span className="text-[10px]">Client's garage, basement, or patio</span>
            </button>
          )}
        </Section>

        {/* 2. Floor System + Color */}
        <Section number={2} title="Pick Color from Chart">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COLOR_SYSTEMS.map((s) => (
              <button
                key={s.key}
                onClick={() => { setColorSystem(s.key); setSelectedColor(null); }}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition ${colorSystem === s.key ? "bg-black text-white" : "bg-white text-stone-600 border border-stone-200"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
            {colors.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedColor(c)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition ${selectedColor?.code === c.code ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white"}`}
              >
                {c.image_url ? (
                  <img src={c.image_url} alt={c.color_name} loading="lazy" className="h-12 w-full object-cover object-top rounded" />
                ) : (
                  <div className="h-12 w-full rounded" style={{ background: c.hex }} />
                )}
                <span className="text-[9px] font-medium text-black truncate w-full text-center">{c.color_name}</span>
                <span className="text-[8px] text-stone-400">{c.code}</span>
              </button>
            ))}
          </div>
          {selectedColor && (
            <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-stone-700">
              Selected: <span className="font-bold">{selectedColor.color_name}</span> ({selectedColor.code})
            </div>
          )}
        </Section>

        {/* 3. Square Footage */}
        <Section number={3} title="Square Footage">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="number"
                inputMode="numeric"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="440"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-300 text-[14px] font-semibold text-black outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-[12px] text-stone-500 font-medium">sq ft</span>
          </div>
          <div className="flex gap-2 mt-2">
            {[{ v: 240, l: "1-Car" }, { v: 440, l: "2-Car" }, { v: 660, l: "3-Car" }].map((s) => (
              <button
                key={s.l}
                onClick={() => setSqft(String(s.v))}
                className="flex-1 h-9 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-600 hover:border-amber-500 transition"
              >
                {s.l} ({s.v})
              </button>
            ))}
          </div>
        </Section>

        {/* 4. Floor Condition */}
        <Section number={4} title="Floor Condition">
          <div className="space-y-2">
            {(settings.condition_adjustments || []).map((c) => (
              <button
                key={c.key}
                onClick={() => toggleCondition(c.key)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${conditions.includes(c.key) ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white"}`}
              >
                <div>
                  <div className="text-[12px] font-semibold text-black">{c.label}</div>
                  <div className="text-[10px] text-stone-500">{c.percent > 0 ? `+${c.percent}% adjustment` : "No adjustment"}</div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${conditions.includes(c.key) ? "bg-amber-500 border-amber-500" : "border-stone-300"}`}>
                  {conditions.includes(c.key) && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* 5. Client Info */}
        <Section number={5} title="Client Info">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
                placeholder="Client name"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-300 text-[13px] outline-none focus:border-amber-500"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="tel"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                placeholder="Client phone"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-300 text-[13px] outline-none focus:border-amber-500"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                placeholder="Client email (optional)"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-stone-300 text-[13px] outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </Section>

        {/* 6. Bid Results */}
        {canGetBid && estimate && (
          <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-50 to-white p-4 space-y-3">
            <div className="text-center">
              <div className="text-[10px] font-bold tracking-wider text-amber-700 uppercase">Your Bid</div>
              <div className="text-3xl font-extrabold text-black mt-1">{money(estimate.mid)}</div>
              <div className="text-[11px] text-stone-500">Exact Bid Price</div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-white border border-stone-200 p-2.5 text-center">
                <div className="text-[9px] text-stone-500 uppercase font-semibold">Low</div>
                <div className="text-[16px] font-bold text-stone-700">{money(estimate.low)}</div>
              </div>
              <div className="flex-1 rounded-xl bg-white border border-stone-200 p-2.5 text-center">
                <div className="text-[9px] text-stone-500 uppercase font-semibold">High</div>
                <div className="text-[16px] font-bold text-stone-700">{money(estimate.high)}</div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500 text-center">
              {sqft} sq ft · {selectedColor?.color_name || colorSystem} · {conditions.length ? conditions.length + " condition factors" : "good condition"}
            </div>

            {/* Send buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSms}
                disabled={!client.phone}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold disabled:opacity-50"
                style={{ background: GOLD_GRADIENT, border: "2px solid #000", color: "#1a1a1a" }}
              >
                <MessageSquare className="h-4 w-4" /> SMS Bid to Client
              </button>
              <button
                onClick={handleEmail}
                disabled={!client.email}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold bg-black text-white disabled:opacity-50"
              >
                <Mail className="h-4 w-4" /> Email Bid to Client
              </button>
              <button
                onClick={handleSaveLead}
                disabled={saving || saved || !client.name || !client.phone}
                className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[13px] font-bold border-2 border-stone-300 text-stone-700 disabled:opacity-50"
              >
                {saved ? (
                  <><Check className="h-4 w-4 text-green-600" /> Saved to CRM</>
                ) : saving ? (
                  "Saving..."
                ) : (
                  <><User className="h-4 w-4" /> Save to CRM</>
                )}
              </button>
            </div>
            {error && (
              <div className="flex items-start gap-1.5 text-[11px] text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>
        )}

        {!canGetBid && (
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-center text-[11px] text-stone-400">
            Select a color and enter square footage to generate your bid.
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">{number}</div>
        <h3 className="text-[13px] font-bold text-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}