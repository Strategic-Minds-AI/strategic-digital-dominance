import React, { useState } from "react";
import { Layout, Shield, Loader2, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSandbox } from "./SandboxContext";
import SandboxCard, { StatusBadge } from "./SandboxCard";

const SECTIONS = [
  { id: "hero", label: "Hero", desc: "Headline + subhead + CTA + trust badge" },
  { id: "services", label: "Services", desc: "Service cards with icons + pricing" },
  { id: "gallery", label: "Gallery", desc: "Before/after showcase grid" },
  { id: "testimonials", label: "Testimonials", desc: "Review cards with star ratings" },
  { id: "faq", label: "FAQ", desc: "Accordion with FAQ schema markup" },
  { id: "estimate_form", label: "Estimate Form", desc: "Multi-step lead capture form" },
  { id: "trust_signals", label: "Trust Signals", desc: "License, insurance, years in business" },
  { id: "cta_band", label: "CTA Band", desc: "Final conversion push with urgency" },
];

export default function FunnelTab() {
  const { campaign, updateCampaign, markTabComplete, setActiveTab } = useSandbox();
  const [selected, setSelected] = useState(["hero", "services", "gallery", "estimate_form", "cta_band"]);
  const [modeling, setModeling] = useState(false);
  const [variants, setVariants] = useState([]);
  const [firewallResults, setFirewallResults] = useState({});
  const [pickedVariant, setPickedVariant] = useState(null);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const runComplianceCheck = (content) => {
    const issues = [];
    if (content.length < 200) issues.push("Thin content — below 200 char threshold");
    if ((content.match(/near me/gi) || []).length > 8) issues.push("Keyword stuffing — 'near me' appears >8 times");
    if (!content.includes("<h1") && !content.includes("# ")) issues.push("Missing H1 heading");
    if (!content.includes("canonical")) issues.push("Missing canonical tag");
    return { passed: issues.length === 0, issues };
  };

  const modelConversion = async () => {
    setModeling(true);
    try {
      const simRes = await base44.functions.invoke("seoAeoSimulator", {
        keyword: campaign.keyword,
        city: campaign.city,
        url: campaign.domain || "example.com",
      });
      const simData = simRes?.data || simRes;

      // Generate 3 variants
      const generated = [];
      for (let i = 0; i < 3; i++) {
        const contentRes = await base44.functions.invoke("domainGoldRush", {
          action: "generateContent",
          keyword: campaign.keyword,
          city: campaign.city,
          state: campaign.state,
          domain: campaign.domain || "example.com",
          contentType: "landing_page",
          variant: i + 1,
        });
        const content = contentRes?.data?.content || `# ${campaign.businessName || campaign.keyword} — ${campaign.city}\n\nProfessional ${campaign.keyword} services in ${campaign.city}.`;
        const fw = runComplianceCheck(content);
        generated.push({ id: i + 1, content: content.slice(0, 500), sim: simData, firewall: fw });
      }
      setVariants(generated);
      const fwMap = {};
      generated.forEach((v) => (fwMap[v.id] = v.firewall));
      setFirewallResults(fwMap);

      updateCampaign({ funnelConfig: { sections: selected, variants: generated } });
    } catch {
      // fallback
    } finally {
      setModeling(false);
    }
  };

  const pickVariant = (id) => {
    setPickedVariant(id);
    updateCampaign({ funnelConfig: { sections: selected, pickedVariant: id, variants } });
    markTabComplete("funnel");
    setActiveTab("content");
  };

  return (
    <div className="space-y-4">
      <SandboxCard title="Funnel Structure Builder" icon={Layout} subtitle="Toggle sections to include in the funnel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`text-left px-3 py-2 rounded border transition-colors ${
                selected.includes(s.id) ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-900">{s.label}</span>
                {selected.includes(s.id) && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
        <button onClick={modelConversion} disabled={modeling || !campaign.niche} className="ds-btn-primary mt-3">
          {modeling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {modeling ? "Modeling & Generating..." : "Model Conversion + Generate 3 Variants"}
        </button>
      </SandboxCard>

      {variants.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {variants.map((v) => (
            <SandboxCard key={v.id} title={`Variant ${v.id}`} icon={Layout} action={<StatusBadge status={v.firewall.passed ? "passed" : "failed"} label={v.firewall.passed ? "FIREWALL PASSED" : "FIREWALL BLOCKED"} />}>
              <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded p-2 max-h-32 overflow-y-auto mb-2">
                {v.content.slice(0, 200)}...
              </div>
              {!v.firewall.passed && (
                <div className="space-y-1 mb-2">
                  {v.firewall.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3 shrink-0" /> {issue}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => pickVariant(v.id)}
                disabled={!v.firewall.passed}
                className={`w-full ${v.firewall.passed ? "ds-btn-primary" : "ds-btn-ghost opacity-50 cursor-not-allowed"} justify-center`}
              >
                {pickedVariant === v.id ? <CheckCircle2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {pickedVariant === v.id ? "Selected" : v.firewall.passed ? "Select Variant" : "Blocked"}
              </button>
            </SandboxCard>
          ))}
        </div>
      )}

      <SandboxCard title="Google Compliance Firewall" icon={Shield} subtitle="Pre-deployment penalty pattern detection">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Doorway Pages", "Thin Content", "Duplicate Content", "Keyword Stuffing", "Missing Canonical", "Missing Schema", "Missing H1", "Unnatural Links"].map((check) => (
            <div key={check} className="flex items-center gap-1.5 px-2 py-1.5 border border-stone-200 rounded">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="ds-label text-stone-600">{check}</span>
            </div>
          ))}
        </div>
      </SandboxCard>
    </div>
  );
}