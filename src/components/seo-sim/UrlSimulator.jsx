import React, { useState } from "react";
import { Globe, Loader2, Search, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

// URL simulator — type a URL, the backend fetches it, extracts on-page signals,
// and runs the same DEEP scoring engine on the extracted content.
export default function UrlSimulator() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("seoAeoSimulator", { action: "analyzeUrl", url });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to analyze URL");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? "text-emerald-400" : s >= 60 ? "text-lime-400" : s >= 40 ? "text-amber-400" : s >= 20 ? "text-orange-400" : "text-red-400";

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-5 w-5 text-amber-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-300">URL Simulator</h2>
      </div>
      <p className="text-xs text-stone-500 mb-3">Enter any URL — the backend fetches the page, extracts on-page signals, and scores it with the same DEEP engine.</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="example.com or https://example.com/epoxy-garage-floors"
            className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-200 placeholder-stone-600 focus:border-amber-500 outline-none"
          />
        </div>
        <button
          onClick={analyze}
          disabled={loading || !url.trim()}
          className="px-4 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm disabled:opacity-50 flex items-center gap-2 hover:bg-amber-400"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          {loading ? "Analyzing..." : "Score URL"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          {/* Score row */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Overall", score: result.overall_score },
              { label: "SEO", score: result.seo_score },
              { label: "AEO", score: result.aeo_score },
              { label: "Local", score: result.local_score },
              { label: "Social", score: result.social_score },
            ].map(({ label, score }) => (
              <div key={label} className="bg-stone-950 rounded-lg p-2 text-center border border-stone-800">
                <div className="text-[10px] font-bold uppercase text-stone-500">{label}</div>
                <div className={`text-xl font-black ${scoreColor(score)} tabular-nums`}>{Math.round(score)}</div>
              </div>
            ))}
          </div>

          {/* Extracted signals */}
          <div className="bg-stone-950 rounded-lg p-3 border border-stone-800">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Extracted On-Page Signals</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <Signal label="Title" value={result.extracted?.title ? `${result.extracted.title.length} chars` : "Missing"} ok={!!result.extracted?.title} />
              <Signal label="Meta desc" value={result.extracted?.meta_description ? `${result.extracted.meta_description.length} chars` : "Missing"} ok={!!result.extracted?.meta_description} />
              <Signal label="H1" value={result.extracted?.h1 ? "Present" : "Missing"} ok={!!result.extracted?.h1} />
              <Signal label="Word count" value={`${result.extracted?.word_count || 0}`} ok={(result.extracted?.word_count || 0) >= 500} />
              <Signal label="HTTPS" value={result.extracted?.https ? "Yes" : "No"} ok={!!result.extracted?.https} />
              <Signal label="Mobile" value={result.extracted?.mobile_friendly ? "Yes" : "No"} ok={!!result.extracted?.mobile_friendly} />
              <Signal label="Schema" value={result.extracted?.has_schema ? "Present" : "Missing"} ok={!!result.extracted?.has_schema} />
              <Signal label="FAQ schema" value={result.extracted?.has_faq_schema ? "Yes" : "No"} ok={!!result.extracted?.has_faq_schema} />
              <Signal label="OG tags" value={result.extracted?.has_og_tags ? "Present" : "Missing"} ok={!!result.extracted?.has_og_tags} />
              <Signal label="H2 count" value={`${result.extracted?.h2_count || 0}`} ok={(result.extracted?.h2_count || 0) >= 3} />
              <Signal label="Img alt ratio" value={`${result.extracted?.img_alt_ratio || 0}%`} ok={(result.extracted?.img_alt_ratio || 0) >= 70} />
              <Signal label="Timeline" value={`${result.timeline_months} mo`} ok={result.timeline_months <= 4} />
            </div>
          </div>

          {/* Title preview */}
          {result.extracted?.title && (
            <div className="bg-stone-950 rounded-lg p-3 border border-stone-800">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Title Tag</h4>
              <p className="text-xs text-blue-400 truncate">{result.extracted.title}</p>
              {result.extracted?.meta_description && (
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">{result.extracted.meta_description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Signal({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-500">{label}</span>
      <span className={`font-semibold ${ok ? "text-emerald-400" : "text-red-400"}`}>{value}</span>
    </div>
  );
}