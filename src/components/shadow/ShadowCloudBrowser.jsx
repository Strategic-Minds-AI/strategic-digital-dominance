import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Loader2, EyeOff, Zap, Search } from "lucide-react";

export default function ShadowCloudBrowser() {
  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [stealth, setStealth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const browse = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("shadowBrowse", {
        url: url.trim(),
        prompt: prompt.trim() || undefined,
        action: prompt.trim() ? "extract" : "browse",
        stealth,
      });
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (e) {
      setError(e.message || "Browse failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-stone-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-800 flex items-center gap-2">
        <Globe className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-bold text-stone-200">Cloud Browser</span>
        <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 ml-auto flex items-center gap-1">
          <EyeOff className="h-3 w-3" /> Traceless
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && browse()}
            placeholder="https://example.com"
            className="flex-1 px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={browse}
            disabled={loading || !url.trim()}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Browse
          </button>
        </div>
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Optional: extraction prompt (e.g. 'Extract all competitor pricing')"
          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm outline-none focus:border-emerald-500"
        />
        <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
          <input type="checkbox" checked={stealth} onChange={e => setStealth(e.target.checked)} className="accent-emerald-500" />
          <Zap className="h-3 w-3" /> Stealth mode (proxy rotation + anti-detection)
        </label>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">{error}</div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span>{result.url}</span>
              <span>·</span>
              <span>{result.textChars || 0} chars</span>
              {result.attempts && <><span>·</span><span>{result.attempts} attempts</span></>}
            </div>
            <pre className="text-xs text-stone-300 bg-stone-900 border border-stone-800 rounded-lg p-3 max-h-80 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">
              {result.result || result.text || "No content extracted"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}