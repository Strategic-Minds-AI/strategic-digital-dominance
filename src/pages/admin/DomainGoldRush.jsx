import React, { useState } from "react";
import {
  Crown, Grid3x3, Search, Building2, Play, Network,
  FileText, Brain, Bot, Shield, Workflow, Layers
} from "lucide-react";
import NicheRegistry from "@/components/domain-rush/NicheRegistry";
import SearchIntelligence from "@/components/domain-rush/SearchIntelligence";
import BusinessNameGenerator from "@/components/domain-rush/BusinessNameGenerator";
import SimulationEngine from "@/components/domain-rush/SimulationEngine";
import StrategyGenerator from "@/components/domain-rush/StrategyGenerator";
import ContentGenerator from "@/components/domain-rush/ContentGenerator";
import FunnelCreator from "@/components/domain-rush/FunnelCreator";
import DominanceGenerator from "@/components/domain-rush/DominanceGenerator";
import FormFlood from "@/components/domain-rush/FormFlood";
import WorkflowOrchestrator from "@/components/domain-rush/WorkflowOrchestrator";
import DomainResultCard from "@/components/domain-rush/DomainResultCard";
import { base44 } from "@/api/base44Client";
import { Loader2, Zap, MapPin, TrendingUp } from "lucide-react";
import { UNIVERSAL_NICHES } from "@/data/universalNiches";

const TABS = [
  { id: "workflow", label: "Live Workflow", icon: Workflow, desc: "Top-to-bottom strategic workflow" },
  { id: "niches", label: "Universal Niches", icon: Grid3x3, desc: "200+ need & emergency businesses" },
  { id: "search", label: "Search Intelligence", icon: Search, desc: "Top searches, lost clicks, TLD patterns" },
  { id: "names", label: "Business Names", icon: Building2, desc: "Name gen + domain + biz name check" },
  { id: "domains", label: "Domain Finder", icon: Crown, desc: "Real domain availability + scoring" },
  { id: "simulation", label: "Simulation Engine", icon: Play, desc: "Parallel predictions + revenue estimates" },
  { id: "strategy", label: "Strategy Generator", icon: Network, desc: "Exhaustive programmatic strategy" },
  { id: "content", label: "Content Generator", icon: FileText, desc: "SEO/AEO/AI-optimized content" },
  { id: "funnel", label: "Funnel Creator", icon: Brain, desc: "Psychology-based funnels" },
  { id: "dominance", label: "Dominance Plan", icon: Shield, desc: "Every method for first-page Google" },
  { id: "formflood", label: "Form Flood", icon: Bot, desc: "Join every platform via cloud browser" },
];

export default function DomainGoldRush() {
  const [activeTab, setActiveTab] = useState("workflow");
  const [selectedNiche, setSelectedNiche] = useState(null);

  // Domain finder state (original functionality preserved)
  const [keyword, setKeyword] = useState("epoxy garage floor");
  const [pattern, setPattern] = useState("near_me");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [selectedTlds, setSelectedTlds] = useState(["com", "net", "co"]);
  const [count, setCount] = useState(40);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [queuedDomains, setQueuedDomains] = useState(new Set());

  const PATTERNS = [
    { value: "near_me", label: "Near Me", intent: "Highest commercial intent" },
    { value: "near_you", label: "Near You", intent: "Growing variant" },
    { value: "near_me_city", label: "Near Me + City", intent: "Local + high intent" },
    { value: "city_state", label: "City + State", intent: "Pure local" },
    { value: "cost", label: "Cost / Pricing", intent: "Transactional research" },
    { value: "best", label: "Best / Top", intent: "Comparison intent" },
    { value: "affordable", label: "Affordable", intent: "Budget-conscious" },
    { value: "local", label: "Local", intent: "Local modifier" },
    { value: "pro", label: "Pro / Expert", intent: "Authority" },
  ];

  const TLDS = [
    { value: "com", label: ".com" }, { value: "net", label: ".net" }, { value: "co", label: ".co" },
    { value: "io", label: ".io" }, { value: "ai", label: ".ai" }, { value: "us", label: ".us" },
    { value: "pro", label: ".pro" }, { value: "online", label: ".online" },
  ];

  const toggleTld = (tld) => {
    setSelectedTlds((prev) => prev.includes(tld) ? prev.filter((t) => t !== tld) : [...prev, tld]);
  };

  const handleNicheSelect = (niche) => {
    setSelectedNiche(niche);
    setKeyword(niche.keyword);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "search", keyword, pattern, city, state: stateVal, tlds: selectedTlds, count, niche: selectedNiche?.id,
      });
      setResults(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleQueue = async (domain) => {
    setQueuedDomains((prev) => new Set(prev).add(domain));
  };

  const handleQueueAll = async () => {
    if (!results?.results) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "search", keyword, pattern, city, state: stateVal, tlds: selectedTlds, count, queueResults: true, niche: selectedNiche?.id,
      });
      setResults(res.data);
      const qd = new Set(results.results.filter((r) => r.available).map((r) => r.domain));
      setQueuedDomains(qd);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleJumpToTab = (component) => {
    const tabMap = {
      NicheRegistry: "niches", SearchIntelligence: "search", BusinessNameGenerator: "names",
      SimulationEngine: "simulation", StrategyGenerator: "strategy", ContentGenerator: "content",
      FunnelCreator: "funnel", DominanceGenerator: "dominance", FormFlood: "formflood",
      Provisioning: "strategy", Sync: "workflow", Autonomous: "workflow",
    };
    if (tabMap[component]) setActiveTab(tabMap[component]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" />
          Domain Gold Rush — Universal Digital Dominance System
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Universal niche registry · Search intelligence · Business name generation · Parallel simulations · Programmatic strategy · Swarm deployment · SEO/AEO/AI content · Psychology funnels · Form flood · First-page domination · 24/7 autonomous operation
        </p>
      </div>

      {/* Selected niche indicator */}
      {selectedNiche && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-stone-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-700">Active Niche: {selectedNiche.label}</p>
            <p className="text-xs text-amber-600">Keyword: "{selectedNiche.keyword}" · Emergency: {selectedNiche.emergency} · Avg Order: ${selectedNiche.avg_order.toLocaleString()}</p>
          </div>
          <button onClick={() => setSelectedNiche(null)} className="ml-auto text-xs text-amber-600 hover:text-amber-800 font-semibold">Clear</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition border ${
                activeTab === tab.id
                  ? "border-amber-500 bg-amber-500/10 text-amber-600"
                  : "border-transparent bg-white text-stone-600 hover:border-stone-200 hover:bg-stone-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-[10px] font-normal text-stone-400 hidden md:block">{tab.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "workflow" && <WorkflowOrchestrator onJumpToTab={handleJumpToTab} selectedNiche={selectedNiche} />}
      {activeTab === "niches" && <NicheRegistry onSelectNiche={handleNicheSelect} />}
      {activeTab === "search" && <SearchIntelligence selectedNiche={selectedNiche} />}
      {activeTab === "names" && <BusinessNameGenerator selectedNiche={selectedNiche} />}
      {activeTab === "simulation" && <SimulationEngine selectedNiche={selectedNiche} />}
      {activeTab === "strategy" && <StrategyGenerator selectedNiche={selectedNiche} />}
      {activeTab === "content" && <ContentGenerator selectedNiche={selectedNiche} />}
      {activeTab === "funnel" && <FunnelCreator selectedNiche={selectedNiche} />}
      {activeTab === "dominance" && <DominanceGenerator selectedNiche={selectedNiche} />}
      {activeTab === "formflood" && <FormFlood selectedNiche={selectedNiche} />}

      {/* Domain Finder tab (original functionality) */}
      {activeTab === "domains" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" /> Domain Finder
              </h2>
              <p className="text-sm text-stone-500 mt-1">Real domain availability via RDAP + deterministic SEO value scoring.</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Quick-select from Universal Niches</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {UNIVERSAL_NICHES.slice(0, 30).map((n) => (
                  <button key={n.id} onClick={() => handleNicheSelect(n)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${selectedNiche?.id === n.id ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> Seed Keyword
                </label>
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword Pattern</label>
                <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white">
                  {PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.label} — {p.intent}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-amber-500" /> City (optional)
                </label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Orlando" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">State (optional)</label>
                <input value={stateVal} onChange={(e) => setStateVal(e.target.value.toUpperCase())} placeholder="FL" maxLength={2} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none uppercase" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block flex items-center gap-1">
                <Layers className="h-3 w-3 text-amber-500" /> TLDs to check
              </label>
              <div className="flex flex-wrap gap-2">
                {TLDS.map((t) => (
                  <button key={t.value} onClick={() => toggleTld(t.value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${selectedTlds.includes(t.value) ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="w-32">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Max domains</label>
                <input type="number" value={count} onChange={(e) => setCount(Math.min(Number(e.target.value), 100))} min={5} max={100} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
              </div>
              <button onClick={handleSearch} disabled={loading || !keyword.trim() || !selectedTlds.length} className="flex-1 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "Checking real availability..." : "Find Available Domains"}
              </button>
            </div>
          </div>

          {loading && !results && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="text-sm text-stone-500">Checking real domain availability via RDAP...</p>
            </div>
          )}

          {results && (
            <>
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

              {results.availableCount > 0 && (
                <div className="flex justify-end">
                  <button onClick={handleQueueAll} disabled={loading} className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold flex items-center gap-2 hover:bg-amber-400">
                    <TrendingUp className="h-4 w-4" /> Queue All {results.availableCount} Available Domains
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.results.map((r) => (
                  <DomainResultCard key={r.domain} result={r} onQueue={handleQueue} queued={queuedDomains.has(r.domain)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}