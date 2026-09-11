import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Crown, MapPin, Zap, Layers, TrendingUp } from "lucide-react";
import DomainResultCard from "@/components/domain-rush/DomainResultCard";

const NICHES = [
  { value: "epoxy_garage", label: "Epoxy Garage Floors", kw: "epoxy garage floor" },
  { value: "decorative_concrete", label: "Decorative Concrete", kw: "decorative concrete" },
  { value: "polished_concrete", label: "Polished Concrete", kw: "polished concrete" },
  { value: "epoxy_flooring", label: "Epoxy Flooring", kw: "epoxy flooring" },
  { value: "garage_coating", label: "Garage Coating", kw: "garage floor coating" },
  { value: "concrete_resurfacing", label: "Concrete Resurfacing", kw: "concrete resurfacing" },
];

const PATTERNS = [
  { value: "near_me", label: "Near Me", intent: "Highest commercial intent" },
  { value: "near_me_city", label: "Near Me + City", intent: "Local + high intent" },
  { value: "city_state", label: "City + State", intent: "Pure local" },
  { value: "cost", label: "Cost / Pricing", intent: "Transactional research" },
  { value: "best", label: "Best / Top", intent: "Comparison intent" },
  { value: "affordable", label: "Affordable", intent: "Budget-conscious" },
  { value: "local", label: "Local", intent: "Local modifier" },
  { value: "pro", label: "Pro / Expert", intent: "Authority" },
];

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

export default function DomainGoldRush() {
  const [keyword, setKeyword] = useState("epoxy garage floor");
  const [niche, setNiche] = useState("epoxy_garage");
  const [pattern, setPattern] = useState("near_me");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedTlds, setSelectedTlds] = useState(["com", "net", "co"]);
  const [count, setCount] = useState(40);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queuedDomains, setQueuedDomains] = useState(new Set());

  const toggleTld = (tld) => {
    setSelectedTlds((prev) =>
      prev.includes(tld) ? prev.filter((t) => t !== tld) : [...prev, tld]
    );
  };

  const handleNicheSelect = (n) => {
    setNiche(n.value);
    setKeyword(n.kw);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "search",
        keyword,
        pattern,
        city,
        state,
        tlds: selectedTlds,
        count,
        niche,
      });
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQueue = async (domain) => {
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "search",
        keyword,
        pattern,
        city,
        state,
        tlds: selectedTlds,
        count: 1,
        queueResults: true,
        niche,
      });
      setQueuedDomains((prev) => new Set(prev).add(domain));
    } catch (e) {
      console.error(e);
    }
  };

  const handleQueueAll = async () => {
    if (!results?.results) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "search",
        keyword,
        pattern,
        city,
        state,
        tlds: selectedTlds,
        count,
        queueResults: true,
        niche,
      });
      setResults(res.data);
      const qd = new Set(results.results.filter((r) => r.available).map((r) => r.domain));
      setQueuedDomains(qd);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Domain Gold Rush Finder
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Real domain availability via RDAP + deterministic SEO value scoring. Every number is real — no simulation, no fabricated data.
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        {/* Niche quick-select */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Niche (quick-select)</label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n.value}
                onClick={() => handleNicheSelect(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  niche === n.value
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Seed Keyword
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="epoxy garage floor"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword Pattern</label>
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

        {/* City / State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block flex items-center gap-1">
              <MapPin className="h-3 w-3 text-amber-500" /> City (optional)
            </label>
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
              onChange={(e) => setState(e.target.value)}
              placeholder="FL"
              maxLength={2}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none uppercase"
            />
          </div>
        </div>

        {/* TLDs */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block flex items-center gap-1">
            <Layers className="h-3 w-3 text-amber-500" /> TLDs to check
          </label>
          <div className="flex flex-wrap gap-2">
            {TLDS.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleTld(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedTlds.includes(t.value)
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count + Search */}
        <div className="flex items-end gap-3">
          <div className="w-32">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Max domains</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(Number(e.target.value), 100))}
              min={5}
              max={100}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !keyword.trim() || !selectedTlds.length}
            className="flex-1 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Checking real availability..." : "Find Available Domains"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && !results && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Checking real domain availability via RDAP...</p>
          <p className="text-xs text-stone-400">This checks actual registry records — no cached or simulated data.</p>
        </div>
      )}

      {results && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="text-2xl font-black text-stone-900">{results.totalChecked}</div>
              <div className="text-xs text-stone-500 mt-0.5">Domains Checked</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <div className="text-2xl font-black text-emerald-600">{results.availableCount}</div>
              <div className="text-xs text-emerald-700 mt-0.5">Available Now</div>
            </div>
            <div className="bg-stone-100 rounded-xl border border-stone-200 p-4">
              <div className="text-2xl font-black text-stone-600">{results.takenCount}</div>
              <div className="text-xs text-stone-500 mt-0.5">Already Taken</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="text-2xl font-black text-amber-600">{results.queued || 0}</div>
              <div className="text-xs text-amber-700 mt-0.5">Queued for Purchase</div>
            </div>
          </div>

          {/* Queue all */}
          {results.availableCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleQueueAll}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold flex items-center gap-2 hover:bg-amber-400"
              >
                <TrendingUp className="h-4 w-4" />
                Queue All {results.availableCount} Available Domains
              </button>
            </div>
          )}

          {/* Domain cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.results.map((r) => (
              <DomainResultCard
                key={r.domain}
                result={r}
                onQueue={handleQueue}
                queued={queuedDomains.has(r.domain)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}