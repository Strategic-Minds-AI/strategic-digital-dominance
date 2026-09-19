import React, { useState } from "react";
import { Search, Globe, TrendingUp, AlertTriangle, Loader2, Lock, Radar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UNIVERSAL_NICHES, NICHE_CATEGORIES, getNichesByCategory } from "@/data/universalNiches";
import { useSandbox } from "./SandboxContext";
import SandboxCard, { StatusBadge, MetricLine } from "./SandboxCard";

const VOL_MAP = { high: 5000, medium: 1200, low: 300 };

export default function DiscoveryTab() {
  const { campaign, updateCampaign, markTabComplete, setActiveTab } = useSandbox();
  const [category, setCategory] = useState("");
  const [researching, setResearching] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [intel, setIntel] = useState(null);
  const [competitorData, setCompetitorData] = useState(null);
  const [error, setError] = useState(null);

  const niches = category ? getNichesByCategory(category) : UNIVERSAL_NICHES.slice(0, 24);

  const selectNiche = (niche) => {
    updateCampaign({ niche, nicheId: niche.id, keyword: niche.keyword });
    setIntel(null);
    setCompetitorData(null);
    setError(null);
  };

  const runResearch = async () => {
    if (!campaign.niche) return;
    setResearching(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "researchSearchTerms",
        keyword: campaign.keyword,
        city: campaign.city,
        state: campaign.state,
        niche: campaign.nicheId,
      });
      const data = res?.data || res;
      setIntel(data);

      // Economic gate calculation
      const n = campaign.niche;
      const monthlySearches = VOL_MAP[n.search_volume] || 500;
      const cpc = n.avg_cpc || 10;
      const orderValue = n.avg_order || 2000;
      const convRate = 0.04;
      const domainCost = 15;
      const contentCost = 50;
      const aiCredits = 20;
      const monthlyRevenue = monthlySearches * 0.15 * convRate * orderValue * (n.margin || 0.3);
      const monthlyCost = cpc * monthlySearches * 0.05 + 100;
      const roi = Math.round(((monthlyRevenue - monthlyCost) / (domainCost + contentCost + aiCredits)) * 100);
      const signal = roi > 100 ? "go" : roi < 0 ? "no-go" : "pending";
      updateCampaign({ intelligence: data, economicGate: { roiPct: roi, signal, monthlySearches, cpc, orderValue, monthlyRevenue, monthlyCost } });
    } catch (e) {
      setError(e.message || "Research failed");
    } finally {
      setResearching(false);
    }
  };

  const crawlCompetitors = async () => {
    if (!campaign.niche) return;
    setCrawling(true);
    try {
      const res = await base44.functions.invoke("shadowBrowse", {
        action: "browse",
        url: `https://www.google.com/search?q=${encodeURIComponent(campaign.keyword + " near me")}`,
      });
      setCompetitorData(res?.data || res);
    } catch (e) {
      setCompetitorData({ error: e.message });
    } finally {
      setCrawling(false);
    }
  };

  const lockAndAdvance = () => {
    markTabComplete("discovery");
    setActiveTab("branding");
  };

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SandboxCard>
          <div className="ds-label text-stone-500 mb-1">Monthly Searches</div>
          <div className="ds-font-mono text-2xl font-bold text-stone-900">
            {campaign.economicGate ? campaign.economicGate.monthlySearches.toLocaleString() : "—"}
          </div>
        </SandboxCard>
        <SandboxCard>
          <div className="ds-label text-stone-500 mb-1">Est. CPC</div>
          <div className="ds-font-mono text-2xl font-bold text-stone-900">
            {campaign.economicGate ? `$${campaign.economicGate.cpc}` : "—"}
          </div>
        </SandboxCard>
        <SandboxCard>
          <div className="ds-label text-stone-500 mb-1">Projected ROI</div>
          <div className="flex items-center gap-2">
            <div
              className="ds-font-mono text-2xl font-bold"
              style={{
                color: campaign.economicGate?.signal === "go" ? "#16A34A" : campaign.economicGate?.signal === "no-go" ? "#DC2626" : "#71717A",
              }}
            >
              {campaign.economicGate ? `${campaign.economicGate.roiPct > 0 ? "+" : ""}${campaign.economicGate.roiPct}%` : "—"}
            </div>
            {campaign.economicGate && <StatusBadge status={campaign.economicGate.signal === "go" ? "passed" : campaign.economicGate.signal === "no-go" ? "failed" : "pending"} label={campaign.economicGate.signal.toUpperCase()} />}
          </div>
        </SandboxCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Niche selection */}
        <SandboxCard title="Niche Opportunity Matrix" icon={Radar} subtitle={`${niches.length} niches available`}>
          <div className="mb-3 flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory("")}
              className={`ds-step-pill ${!category ? "active" : "pending"}`}
            >
              ALL
            </button>
            {NICHE_CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`ds-step-pill ${category === c.id ? "active" : "pending"}`}
              >
                {c.label.split(" ")[0].toUpperCase()}
              </button>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {niches.map((n) => (
              <button
                key={n.id}
                onClick={() => selectNiche(n)}
                className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                  campaign.nicheId === n.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-900">{n.label}</span>
                  <span className="ds-font-mono text-xs text-stone-500">${n.avg_cpc} CPC</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="ds-label text-stone-400">{n.emergency}</span>
                  <span className="ds-label text-stone-400">{n.search_volume.toUpperCase()} VOL</span>
                  <span className="ds-label text-stone-400">${n.avg_order} AOV</span>
                </div>
              </button>
            ))}
          </div>
          {campaign.niche && (
            <div className="mt-3 pt-3 border-t border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="ds-label text-stone-500">Target City</span>
                <input
                  className="ds-input"
                  placeholder="e.g. Miami"
                  value={campaign.city}
                  onChange={(e) => updateCampaign({ city: e.target.value })}
                />
              </div>
              <button onClick={runResearch} disabled={researching} className="ds-btn-primary w-full justify-center">
                {researching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {researching ? "Researching..." : "Run Intelligence Research"}
              </button>
            </div>
          )}
        </SandboxCard>

        {/* Economic Gate */}
        <SandboxCard title="Economic Gate P&L Calculator" icon={TrendingUp} subtitle="Projected ROI model">
          {campaign.economicGate ? (
            <div className="space-y-1">
              <MetricLine label="Domain Cost" value={`$${15}`} />
              <MetricLine label="Content Cost" value={`$${50}`} />
              <MetricLine label="AI Credits" value={`$${20}`} />
              <MetricLine label="Monthly Revenue" value={`$${Math.round(campaign.economicGate.monthlyRevenue).toLocaleString()}`} accent="#16A34A" />
              <MetricLine label="Monthly Cost" value={`$${Math.round(campaign.economicGate.monthlyCost).toLocaleString()}`} accent="#DC2626" />
              <div className="pt-2 mt-2 border-t border-stone-200">
                <MetricLine label="ROI" value={`${campaign.economicGate.roiPct > 0 ? "+" : ""}${campaign.economicGate.roiPct}%`} accent={campaign.economicGate.signal === "go" ? "#16A34A" : "#DC2626"} />
              </div>
              {campaign.economicGate.signal === "no-go" && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="text-xs text-red-700">Negative ROI — skip this niche or adjust variables</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-stone-400 text-center py-8">Select a niche and run research to calculate ROI</div>
          )}
        </SandboxCard>
      </div>

      {/* Competitor crawler */}
      <SandboxCard title="ShadowBrowse Competitor Crawler" icon={Globe} subtitle="Live crawl of top-ranking competitors">
        <button onClick={crawlCompetitors} disabled={crawling || !campaign.niche} className="ds-btn-ghost mb-3">
          {crawling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
          {crawling ? "Crawling..." : "Crawl Top Competitors"}
        </button>
        {competitorData && (
          <div className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded p-3 max-h-48 overflow-y-auto">
            {competitorData.error ? (
              <span className="text-red-600">Error: {competitorData.error}</span>
            ) : (
              <pre className="whitespace-pre-wrap ds-font-mono">{JSON.stringify(competitorData, null, 2).slice(0, 2000)}</pre>
            )}
          </div>
        )}
      </SandboxCard>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Advance */}
      <div className="flex justify-end">
        <button
          onClick={lockAndAdvance}
          disabled={!campaign.niche}
          className="ds-btn-primary"
        >
          <Lock className="h-4 w-4" /> Lock Niche & Advance to Branding
        </button>
      </div>
    </div>
  );
}