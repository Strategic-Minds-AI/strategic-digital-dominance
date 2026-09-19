import React, { useState } from "react";
import { FileText, Loader2, CheckCircle2, Layers, AlertTriangle, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSandbox } from "./SandboxContext";
import SandboxCard, { StatusBadge } from "./SandboxCard";

const PAGE_TYPES = [
  { id: "landing_page", label: "Landing Page", defaultCount: 1 },
  { id: "service_detail", label: "Service Detail", defaultCount: 10 },
  { id: "location", label: "Location Pages", defaultCount: 50 },
  { id: "blog", label: "Blog Posts", defaultCount: 100 },
  { id: "faq", label: "FAQ Pages", defaultCount: 20 },
  { id: "cost_pricing", label: "Cost/Pricing", defaultCount: 10 },
  { id: "guide", label: "Ultimate Guides", defaultCount: 20 },
  { id: "comparison", label: "Comparison", defaultCount: 10 },
];

export default function ContentTab() {
  const { campaign, updateCampaign, markTabComplete, setActiveTab } = useSandbox();
  const [enabled, setEnabled] = useState({ landing_page: 1, service_detail: 5, location: 10, blog: 10 });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(null);

  const totalPages = Object.values(enabled).reduce((a, b) => a + b, 0);

  const toggleType = (id) => {
    setEnabled((prev) => (prev[id] ? { ...prev, [id]: 0 } : { ...prev, [id]: PAGE_TYPES.find((p) => p.id === id).defaultCount }));
  };

  const setCount = (id, count) => {
    setEnabled((prev) => ({ ...prev, [id]: count }));
  };

  const checkCompliance = (content) => {
    if (content.length < 300) return { passed: false, reason: "Thin content" };
    if ((content.match(new RegExp(campaign.keyword, "gi")) || []).length > 15) return { passed: false, reason: "Keyword stuffing" };
    return { passed: true };
  };

  const generateSample = async () => {
    setGenerating(true);
    setProgress(0);
    const generated = [];
    const types = Object.entries(enabled).filter(([, count]) => count > 0);
    const total = Math.min(totalPages, 15);

    for (let i = 0; i < types.length; i++) {
      const [type, count] = types[i];
      const sampleCount = Math.min(count, 3);
      for (let j = 0; j < sampleCount; j++) {
        try {
          const res = await base44.functions.invoke("domainGoldRush", {
            action: "generateContent",
            keyword: campaign.keyword,
            city: campaign.city,
            state: campaign.state,
            domain: campaign.domain || "example.com",
            contentType: type,
            targetEngine: "google",
          });
          const content = res?.data?.content || `# ${campaign.keyword} — ${campaign.city}\n\nSample content.`;
          const fw = checkCompliance(content);
          generated.push({ type, idx: j, content, firewall: fw });
        } catch {
          generated.push({ type, idx: j, content: "Generation failed", firewall: { passed: false, reason: "API error" } });
        }
        setProgress(Math.round(((generated.length) / total) * 100));
      }
    }
    setPages(generated);
    updateCampaign({ contentConfig: { pageTypes: enabled, pageCount: totalPages } });
    setGenerating(false);
  };

  const advance = () => {
    markTabComplete("content");
    setActiveTab("social");
  };

  const previewPage = pages[previewIdx];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SandboxCard title="Page Type Configuration" icon={FileText} subtitle={`${totalPages} pages planned`}>
          <div className="space-y-2">
            {PAGE_TYPES.map((pt) => (
              <div key={pt.id} className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${enabled[pt.id] ? "border-amber-500 bg-amber-50" : "border-stone-200"}`}>
                <button onClick={() => toggleType(pt.id)} className="flex items-center gap-2 flex-1 text-left">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${enabled[pt.id] ? "bg-amber-500 border-amber-500" : "border-stone-300"}`}>
                    {enabled[pt.id] ? <CheckCircle2 className="h-3 w-3 text-white" /> : null}
                  </div>
                  <span className="text-sm font-medium text-stone-900">{pt.label}</span>
                </button>
                {enabled[pt.id] > 0 && (
                  <input
                    type="number"
                    min="1"
                    value={enabled[pt.id]}
                    onChange={(e) => setCount(pt.id, parseInt(e.target.value) || 0)}
                    className="w-16 ds-input text-center"
                  />
                )}
              </div>
            ))}
          </div>
        </SandboxCard>

        <SandboxCard title="Content Flood Generator" icon={Layers} subtitle="Real LLM generation with compliance firewall">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <span className="ds-label text-stone-500">Total Pages</span>
              <span className="ds-font-mono text-lg font-bold text-stone-900">{totalPages}</span>
            </div>
            <button onClick={generateSample} disabled={generating || totalPages === 0} className="ds-btn-primary w-full justify-center">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
              {generating ? `Generating... ${progress}%` : "Generate Sample Batch (15 pages)"}
            </button>
            {generating && (
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            {pages.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {pages.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 border border-stone-200 rounded text-xs">
                    <StatusBadge status={p.firewall.passed ? "passed" : "failed"} label={p.firewall.passed ? "OK" : "BLOCK"} />
                    <span className="ds-label text-stone-500">{p.type}</span>
                    <span className="text-stone-400">#{p.idx + 1}</span>
                    <button onClick={() => setPreviewIdx(i)} className="ml-auto text-amber-600 hover:text-amber-700">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SandboxCard>
      </div>

      {previewPage && (
        <SandboxCard title={`Preview — ${previewPage.type} #${previewPage.idx + 1}`} icon={Eye} action={<button onClick={() => setPreviewIdx(null)} className="ds-btn-ghost text-xs">Close</button>}>
          <div className="text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded p-3 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {previewPage.content.slice(0, 1000)}
            {previewPage.content.length > 1000 && "..."}
          </div>
          {!previewPage.firewall.passed && (
            <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" /> {previewPage.firewall.reason}
            </div>
          )}
        </SandboxCard>
      )}

      <div className="flex justify-end">
        <button onClick={advance} disabled={pages.length === 0} className="ds-btn-primary">
          <CheckCircle2 className="h-4 w-4" /> Save Content & Advance to Social
        </button>
      </div>
    </div>
  );
}