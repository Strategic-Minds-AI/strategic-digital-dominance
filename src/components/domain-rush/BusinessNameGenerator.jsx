import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Building2, CheckCircle2, XCircle, Search, Sparkles, Globe, ShieldCheck } from "lucide-react";

const TLDS = [
  { value: "com", label: ".com" },
  { value: "net", label: ".net" },
  { value: "co", label: ".co" },
  { value: "io", label: ".io" },
  { value: "ai", label: ".ai" },
  { value: "us", label: ".us" },
  { value: "pro", label: ".pro" },
  { value: "online", label: ".online" },
];

export default function BusinessNameGenerator({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedTlds, setSelectedTlds] = useState(["com", "net", "co"]);
  const [count, setCount] = useState(30);
  const [checkBiz, setCheckBiz] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const toggleTld = (tld) => {
    setSelectedTlds((prev) => (prev.includes(tld) ? prev.filter((t) => t !== tld) : [...prev, tld]));
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "generateBusinessNames",
        keyword,
        city,
        state,
        tlds: selectedTlds,
        count,
        checkBusinessNames: checkBiz,
      });
      setResults(res.data);
    } catch (e) {
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            Business Name Generator
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Generates business names, cross-checks domain availability (RDAP), and verifies the business name isn't already taken via web search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="epoxy garage floor"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City (optional)</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Orlando"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">State (optional)</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none uppercase"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">TLDs to check</label>
          <div className="flex flex-wrap gap-2">
            {TLDS.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleTld(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${selectedTlds.includes(t.value) ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="w-32">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Max names</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(Number(e.target.value), 50))}
              min={10}
              max={50}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
            <input type="checkbox" checked={checkBiz} onChange={(e) => setCheckBiz(e.target.checked)} className="rounded" />
            Check business name availability (slower)
          </label>
          <button
            onClick={handleGenerate}
            disabled={loading || !keyword.trim()}
            className="flex-1 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating & checking..." : "Generate Names & Check Availability"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !results && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Generating business names and checking domain + business name availability...</p>
        </div>
      )}

      {results && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="text-2xl font-black text-stone-900">{results.totalGenerated}</div>
              <div className="text-xs text-stone-500 mt-0.5">Names Generated</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <div className="text-2xl font-black text-emerald-600">{results.withAvailableDomain}</div>
              <div className="text-xs text-emerald-700 mt-0.5">With Available Domain</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="text-2xl font-black text-amber-600">{results.results?.filter(r => r.business_name_available).length || 0}</div>
              <div className="text-xs text-amber-700 mt-0.5">Name Also Available</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.results?.map((r, i) => (
              <div key={i} className={`rounded-xl border p-4 ${r.best_available_domain ? "bg-emerald-50 border-emerald-200" : "bg-white border-stone-200"}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-stone-900 text-sm">{r.business_name}</h3>
                  {r.best_available_domain ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-stone-400 shrink-0" />
                  )}
                </div>

                {/* Domain availability */}
                <div className="space-y-1">
                  {r.domains?.map((d, j) => (
                    <div key={j} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-stone-400" />
                        {d.domain}
                      </span>
                      {d.available ? (
                        <span className="text-emerald-600 font-semibold">Available</span>
                      ) : (
                        <span className="text-stone-400">Taken</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Business name availability */}
                {r.business_name_available !== undefined && (
                  <div className="mt-2 pt-2 border-t border-stone-200">
                    {r.business_name_available ? (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Business name available (no conflicts found)
                      </p>
                    ) : (
                      <div>
                        <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Business name may be taken
                        </p>
                        {r.conflicting_businesses?.length > 0 && (
                          <p className="text-[10px] text-stone-500 mt-0.5">Conflicts: {r.conflicting_businesses.join(", ")}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {r.best_available_domain && (
                  <a
                    href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${r.best_available_domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center py-1.5 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400"
                  >
                    Purchase {r.best_available_domain}
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}