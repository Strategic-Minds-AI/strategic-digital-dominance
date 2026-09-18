import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, FileText, Code, HelpCircle, Link2, Bot, Sparkles, Copy, Check } from "lucide-react";

export default function ContentGenerator({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [contentType, setContentType] = useState("landing_page");
  const [targetEngine, setTargetEngine] = useState("google");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setContent(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "generateContent",
        keyword, city, state,
        contentType, targetEngine,
        niche: selectedNiche?.id,
      });
      setContent(res.data?.content);
    } catch (e) {
      setError(e.message || "Content generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Content Generator (SEO / AEO / AI Search)
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Generates content meeting 100+ Google programmatic website requirements. Optimized for Google SEO, AEO (Answer Engine Optimization for ChatGPT/Claude/Perplexity), and AI search engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Content Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white">
              <option value="landing_page">Landing Page</option>
              <option value="blog_post">Blog Post</option>
              <option value="service_page">Service Page</option>
              <option value="location_page">Location Page</option>
              <option value="faq_page">FAQ Page</option>
              <option value="pillar_page">Pillar Page</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Target Engine</label>
            <select value={targetEngine} onChange={(e) => setTargetEngine(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white">
              <option value="google">Google SEO</option>
              <option value="aeo">AEO (AI Engines)</option>
              <option value="voice">Voice Search</option>
              <option value="all">All Engines</option>
            </select>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating SEO/AEO/AI content..." : "Generate Content"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !content && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Generating content optimized for {targetEngine}...</p>
        </div>
      )}

      {content && (
        <div className="space-y-4">
          {/* Meta */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900">Meta Tags</h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-500">Title</label>
                <button onClick={() => copyText(content.title, "title")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  {copied === "title" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                </button>
              </div>
              <p className="text-sm text-stone-900 p-2 rounded-lg bg-stone-50">{content.title}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-500">Meta Description</label>
                <button onClick={() => copyText(content.meta_description, "desc")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  {copied === "desc" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                </button>
              </div>
              <p className="text-sm text-stone-900 p-2 rounded-lg bg-stone-50">{content.meta_description}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 mb-1 block">H1</label>
              <p className="text-lg font-bold text-stone-900 p-2 rounded-lg bg-amber-50">{content.h1}</p>
            </div>
          </div>

          {/* AEO Summary */}
          {content.aeo_summary && (
            <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5">
              <h3 className="font-bold text-purple-700 flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4" /> AEO Summary (for AI Search Engines)
              </h3>
              <p className="text-sm text-stone-700">{content.aeo_summary}</p>
            </div>
          )}

          {/* Main Content */}
          {content.content && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" /> Page Content
                </h3>
                <button onClick={() => copyText(content.content, "content")} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  {copied === "content" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy Content
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-stone-700 whitespace-pre-wrap max-h-[500px] overflow-y-auto p-3 rounded-lg bg-stone-50">
                {content.content}
              </div>
            </div>
          )}

          {/* Schema Markup */}
          {content.schema_markup && (
            <div className="bg-stone-900 rounded-2xl border border-stone-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Code className="h-4 w-4 text-amber-400" /> Schema.org Structured Data (JSON-LD)
                </h3>
                <button onClick={() => copyText(content.schema_markup, "schema")} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  {copied === "schema" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                </button>
              </div>
              <pre className="text-xs text-stone-300 overflow-x-auto max-h-[300px] overflow-y-auto p-3 rounded-lg bg-stone-950 font-mono">{content.schema_markup}</pre>
            </div>
          )}

          {/* FAQ */}
          {content.faq?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-amber-500" /> FAQ (for Featured Snippets)
              </h3>
              <div className="space-y-3">
                {content.faq.map((f, i) => (
                  <div key={i} className="border-b border-stone-100 pb-3 last:border-0">
                    <p className="font-semibold text-stone-900 text-sm">{f.question}</p>
                    <p className="text-sm text-stone-600 mt-1">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Links + Meta Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.internal_links?.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4 text-amber-500" /> Internal Link Anchors
                </h3>
                <ul className="space-y-1">
                  {content.internal_links.map((l, i) => <li key={i} className="text-xs text-stone-600">• {l}</li>)}
                </ul>
              </div>
            )}
            {content.meta_tags?.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                  <Code className="h-4 w-4 text-amber-500" /> Additional Meta Tags
                </h3>
                <div className="space-y-1">
                  {content.meta_tags.map((t, i) => <div key={i} className="text-xs text-stone-600 font-mono p-1 rounded bg-stone-50">{t}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}