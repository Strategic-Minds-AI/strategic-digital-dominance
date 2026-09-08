import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, FileText, Radar, RefreshCw, Play, AlertCircle, CheckCircle2, TrendingUp, Globe } from "lucide-react";

export default function SeoGenerator() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState("");
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const { data: sopLogs } = useQuery({
    queryKey: ["seo-sop-logs"],
    queryFn: () => base44.entities.SopLog.filter({ category: "seo" }, "-created_date", 10),
  });

  const runAction = async (action, payload, label) => {
    setLoading(label);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("seoGenerator", { action, ...payload });
      setResults(res.data);
      queryClient.invalidateQueries({ queryKey: ["seo-sop-logs"] });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-amber-500" /> SEO Generator
        </h1>
        <p className="text-stone-500 mt-1">Technical audits, AI content generation, competitor monitoring, and Search Console sync — all in one engine.</p>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technical Audit */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-stone-900">Technical SEO Audit</h3>
          </div>
          <p className="text-sm text-stone-500 mb-3">Scan any URL for SEO issues — title, meta, schema, H1s, images, sitemap, robots.txt.</p>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm mb-2"
          />
          <button
            onClick={() => runAction("technicalAudit", { url }, "audit")}
            disabled={!url || loading !== null}
            className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "audit" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Audit
          </button>
        </div>

        {/* Content Generator */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-stone-900">AI Content Generator</h3>
          </div>
          <p className="text-sm text-stone-500 mb-3">Generate meta tags, schema, H1, opening paragraph, and FAQ for a target keyword.</p>
          <input
            type="text"
            placeholder="epoxy garage floor cost"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm mb-2"
          />
          <button
            onClick={() => runAction("generateContent", { keyword }, "content")}
            disabled={!keyword || loading !== null}
            className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "content" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Generate Content
          </button>
        </div>

        {/* Competitor Monitor */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Radar className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-stone-900">Competitor Watchdog</h3>
          </div>
          <p className="text-sm text-stone-500 mb-3">Fetch competitor pages, detect changes, and generate counter-strategies.</p>
          <textarea
            placeholder="https://competitor1.com&#10;https://competitor2.com"
            value={competitorUrls}
            onChange={(e) => setCompetitorUrls(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm mb-2"
          />
          <button
            onClick={() => runAction("monitorCompetitors", { competitorUrls: competitorUrls.split("\n").filter(Boolean) }, "competitors")}
            disabled={!competitorUrls || loading !== null}
            className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "competitors" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Monitor Competitors
          </button>
        </div>

        {/* Search Console Sync */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-stone-900">Search Console Sync</h3>
          </div>
          <p className="text-sm text-stone-500 mb-3">Pull the latest 30 days of Google Search Console data — queries, impressions, clicks, CTR.</p>
          <button
            onClick={() => runAction("syncSearchConsole", {}, "sc")}
            disabled={loading !== null}
            className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "sc" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Sync Now
          </button>
        </div>
      </div>

      {/* Full cycle */}
      <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900">Run Full SEO Cycle</h3>
            <p className="text-sm text-stone-600">Runs audit + content + competitors + Search Console sync in one pass.</p>
          </div>
          <button
            onClick={() => runAction("runFullCycle", { url: url || undefined, keyword: keyword || undefined, competitorUrls: competitorUrls ? competitorUrls.split("\n").filter(Boolean) : undefined }, "full")}
            disabled={loading !== null}
            className="h-10 px-6 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold disabled:opacity-50 flex items-center gap-2"
          >
            {loading === "full" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Full Cycle
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-bold text-stone-900">Results</h3>
          </div>
          <pre className="text-xs bg-stone-50 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      {/* Activity log */}
      <div>
        <h3 className="font-bold text-stone-900 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {(sopLogs || []).map((log) => (
            <div key={log.id} className="rounded-lg border border-stone-200 bg-white p-3 flex items-start gap-3">
              <div className="text-xs text-stone-400 mt-0.5">{new Date(log.created_date).toLocaleString()}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-stone-900">{log.action}</div>
                <div className="text-xs text-stone-500">{log.description}</div>
              </div>
            </div>
          ))}
          {(!sopLogs || sopLogs.length === 0) && <p className="text-sm text-stone-400">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}