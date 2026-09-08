import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useSettings } from "@/lib/useSettings";
import { money } from "@/lib/pricing";
import { trackEvent } from "@/lib/tracking";
import PackageCards from "@/components/results/PackageCards";
import TrustSection from "@/components/results/TrustSection";
import Gallery from "@/components/home/Gallery";
import Reviews from "@/components/home/Reviews";
import { Phone, ShieldCheck } from "lucide-react";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import BidSections from "@/components/results/BidSections";
import ConceptBeforeAfter from "@/components/funnel/ConceptBeforeAfter";
import { COLOR_DATA } from "@/lib/colorData";

// Reconstructs the chosen color chart entry from the lead. Prefers the
// dedicated flake_color fields; falls back to parsing the notes string
// ("Selected color: FB-807 (Tidal Wave)") for leads created before the
// color fields existed. Returns null if no color can be recovered.
function getLeadColor(lead) {
  if (!lead) return null;
  const code = lead.flake_color || "";
  if (code) {
    const chart = COLOR_DATA.find((c) => c.code === code) || {};
    return {
      code,
      name: lead.flake_color_name || chart.color_name || code,
      hex: lead.flake_color_hex || chart.hex || "#777777",
      system: lead.desired_system || chart.system || "flake",
      ...chart,
    };
  }
  // Fallback: parse "Selected color: <code> (<name>)" from notes
  const m = (lead.notes || "").match(/Selected color:\s*([^\s(]+)\s*(?:\(([^)]+)\))?/);
  if (m) {
    const parsedCode = m[1];
    const chart = COLOR_DATA.find((c) => c.code === parsedCode) || {};
    return {
      code: parsedCode,
      name: m[2] || chart.color_name || parsedCode,
      hex: chart.hex || "#777777",
      system: lead.desired_system || chart.system || "flake",
      ...chart,
    };
  }
  return null;
}

const Row = ({ label, value }) => (
  <div className="py-3 border-b border-stone-200 flex justify-between gap-6 text-sm">
    <span className="text-stone-500">{label}</span>
    <span className="font-medium text-stone-900 text-right">{value}</span>
  </div>
);

export default function Results() {
  const { id } = useParams();
  const { settings } = useSettings();
  const { data: lead, isLoading } = useQuery({ queryKey: ["lead", id], queryFn: () => base44.entities.Lead.get(id) });

  useEffect(() => {
    if (lead) trackEvent("estimate_viewed", { lead_id: lead.id });
  }, [lead]);

  const callNow = () => trackEvent("call_clicked", { lead_id: id, location: "results_sticky" });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      </div>
    );
  }
  if (!lead) return <div className="min-h-screen flex items-center justify-center text-stone-500">Estimate not found.</div>;

  const system = (settings.systems || []).find((s) => s.key === lead.desired_system);
  const leadColor = getLeadColor(lead);
  const leadPhoto = (lead.photos || [])[0];

  return (
    <div className="bg-stone-50 min-h-screen pb-24 md:pb-0">
      <div className="bg-stone-950 text-white">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="text-stone-300 hover:text-white" showLabel={false} />
            <Logo />
          </div>
          <a href={`tel:${settings.phone}`} onClick={() => trackEvent("call_clicked", { lead_id: id, location: "header" })} className="text-sm text-stone-300">{settings.phone}</a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
            Your Garage Floor Estimate
          </h1>
          <p className="mt-2 text-stone-500">Prepared for {lead.first_name} {lead.last_name}</p>
        </div>

        <div className="rounded-3xl bg-white border border-stone-200 p-7">
          <Row label="Property" value={`${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`} />
          <Row label="Approximate square footage" value={`${(lead.square_footage || 0).toLocaleString()} sq ft`} />
          <Row label="Selected finish" value={system?.name || lead.desired_system} />
          <Row label="Timeline" value={lead.timeline} />

          <div className="mt-8 text-center">
            <div className="text-xs font-bold tracking-[0.25em] text-amber-600">ESTIMATED PROJECT RANGE</div>
            <div className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 tabular-nums">
              {money(lead.estimate_low)} – {money(lead.estimate_high)}
            </div>
            {settings.is_test_pricing && (
              <div className="mt-3 inline-block text-[11px] font-bold tracking-widest bg-stone-900 text-amber-400 px-3 py-1 rounded">
                TEST DATA — DEMO PRICING
              </div>
            )}
            <p className="mt-5 text-sm text-stone-500 leading-relaxed max-w-xl mx-auto">
              This is a preliminary estimate based on the information provided. Final pricing is confirmed after your project details and concrete condition are reviewed.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 flex items-center gap-4">
          <div className="shrink-0 h-12 w-12 rounded-full bg-amber-500 grid place-items-center" style={{ background: "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)" }}>
            <ShieldCheck className="h-6 w-6 text-stone-900" />
          </div>
          <div>
            <div className="font-bold text-stone-900 text-base">Backed by a Lifetime Warranty</div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every garage floor we install is covered by a lifetime warranty — if it ever peels, bubbles, or fails, we'll fix it. That's how confident we are in our prep and products.
            </p>
          </div>
        </div>

        {leadPhoto && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 mb-4">See your garage transformed</h2>
            <ConceptBeforeAfter
              beforeUrl={leadPhoto}
              afterUrl={lead.concept_image || leadPhoto}
              colorName={leadColor?.name}
              hex={leadColor?.hex}
            />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 mb-4">Choose your level of finish</h2>
          <PackageCards packages={lead.package_options} />
        </div>

        <BidSections lead={lead} />

        <TrustSection
          settings={settings}
          leadId={lead.id}
          onConsultationClick={() => trackEvent("consultation_clicked", { lead_id: lead.id })}
        />

        <p className="text-xs text-stone-500 leading-relaxed border-t border-stone-200 pt-6">{settings.disclaimer}</p>
      </div>

      <Reviews settings={settings} />
      <Gallery items={settings.gallery} />

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 px-4 py-3 flex gap-3">
        <a
          href={`tel:${settings.phone}`}
          onClick={callNow}
          className="flex-1 h-12 rounded-xl border border-stone-300 flex items-center justify-center gap-2 font-semibold text-stone-900"
        >
          <Phone className="h-4 w-4" /> CALL
        </a>
        <Link
          to={`/book/${lead.id}`}
          onClick={() => trackEvent("consultation_clicked", { lead_id: lead.id, location: "sticky" })}
          className="flex-1 h-12 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center"
        >
          BOOK FREE CONSULT
        </Link>
      </div>

      <footer className="bg-stone-950 text-stone-400 py-10 px-6 text-sm">
        <div className="max-w-3xl mx-auto">
          <div className="text-white font-semibold">{settings.company_name}</div>
          <div className="mt-1">{settings.phone} · {settings.email}</div>
          <div className="mt-1">{settings.business_address}</div>
          <div className="mt-1">Serving {settings.service_area}</div>
        </div>
      </footer>
    </div>
  );
}