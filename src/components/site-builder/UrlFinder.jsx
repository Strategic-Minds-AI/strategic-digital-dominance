import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRight, ArrowLeft, Globe, Loader2, Search, Check, TrendingUp, MapPin } from "lucide-react";

const PATTERNS = [
  { value: "near_me", label: "Near Me", intent: "Highest commercial intent" },
  { value: "near_me_city", label: "Near Me + City", intent: "Local + high intent" },
  { value: "city_state", label: "City + State", intent: "Pure local" },
  { value: "cost", label: "Cost / Pricing", intent: "Transactional research" },
  { value: "best", label: "Best / Top", intent: "Comparison intent" },
];

export default function UrlFinder({ config, update, onNext, onBack }) {
  const [city, setCity] = useState(config.city || "");
  const [stateVal, setStateVal] = useState(config.state || "");
  const [pattern, setPattern] = useState("near_me");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const industry = config.industry;

  const searchUrls = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "search",
        keyword: industry.keyword,
        pattern,
        city: city.trim(),
        state: stateVal.trim().toUpperCase(),
        tlds: ["com", "net", "co"],
        count: 20,
        niche: industry.id,
      });
      setResults(res?.data);
    } catch (e) {
      setError(e.message || "Failed to search domains");
    } finally {
      setLoading(false);
    }
  };

  const selectDomain = (domain) => {
    update({ domain });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Step 4 — Find The Best URL</h2>
        <p className="text-sm text-stone-500 mt-1">
          Uses the URL strategy engine to find the highest-value available domains for your industry and location.
        </p>
      </div>

      {/* Location inputs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <h3 className="font-bold text-stone-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-500" /> Target Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Orlando"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">State</label>
            <input
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none uppercase"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">URL Pattern</label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white"
            >
              {PATTERNS.map((p) => (
                <option key={p.value} value={p.value}>{p.label} — {p.intent}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={searchUrls}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {loading ? "Checking Domain Availability..." : "Find Best Domains"}
        </button>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
      </div>

      {/* Selected domain */}
      {config.domain && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Check className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-emerald-700">Selected Domain</div>
            <div className="text-lg font-bold text-stone-900">{config.domain}</div>
          </div>
          <button onClick={() => update({ domain: null })} className="ml-auto text-xs text-stone-500 hover:text-red-600 font-semibold">
            Change
          </button>
        </div>
      )}

      {/* Results */}
      {loading && !results && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Checking real domain availability via RDAP...</p>
        </div>
      )}

      {results && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <div className="text-2xl font-black text-stone-900">{results.totalChecked}</div>
              <div className="text-xs text-stone-500">Checked</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
              <div className="text-2xl font-black text-emerald-600">{results.availableCount}</div>
              <div className="text-xs text-emerald-700">Available</div>
            </div>
            <div className="bg-stone-100 rounded-xl border border-stone-200 p-4 text-center">
              <div className="text-2xl font-black text-stone-600">{results.takenCount}</div>
              <div className="text-xs text-stone-500">Taken</div>
            </div>
          </div>

          <div className="space-y-2">
            {results.results?.filter((r) => r.available).map((r) => (
              <button
                key={r.domain}
                onClick={() => selectDomain(r.domain)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                  config.domain === r.domain
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-stone-200 bg-white hover:border-amber-300"
                }`}
              >
                <Globe className="h-5 w-5 text-stone-400" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-stone-900">{r.domain}</div>
                  {r.score != null && (
                    <div className="text-xs text-stone-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> SEO Score: {r.score}/100
                    </div>
                  )}
                </div>
                {config.domain === r.domain ? (
                  <Check className="h-5 w-5 text-emerald-500" />
                ) : (
                  <span className="text-xs font-semibold text-amber-600">Select</span>
                )}
              </button>
            ))}
            {results.results?.filter((r) => r.available).length === 0 && (
              <div className="text-center py-8 text-stone-400">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No available domains found. Try a different pattern or location.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!config.domain}
          className="px-6 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}