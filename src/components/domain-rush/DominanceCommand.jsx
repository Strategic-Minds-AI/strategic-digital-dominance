import React, { useState, useEffect, useCallback } from "react";
import {
  Crown, Zap, Rocket, Loader2, CheckCircle2, XCircle, Play,
  Globe, FileText, Users, Search, Shield, Brain, Bot, TrendingUp,
  Sparkles, AlertCircle, Clock, Award, RefreshCw
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { UNIVERSAL_NICHES } from "@/data/universalNiches";

const PHASES = [
  { id: "intelligence", label: "Intelligence", icon: Search, desc: "Search intelligence & competitor research", color: "blue" },
  { id: "brand_domain", label: "Brand & Domain", icon: Globe, desc: "Name generation + domain + purchase", color: "amber" },
  { id: "infrastructure", label: "Infrastructure", icon: Rocket, desc: "Vercel project + domain attachment", color: "purple" },
  { id: "content_flood", label: "Content Flood", icon: FileText, desc: "500+ SEO-optimized pages", color: "green" },
  { id: "persona_fame", label: "Persona Fame", icon: Users, desc: "Social empire + directory flooding", color: "pink" },
  { id: "technical_seo", label: "Technical SEO", icon: Shield, desc: "Schema, sitemaps, indexing, CWV", color: "stone" },
  { id: "ai_search", label: "AI Search", icon: Brain, desc: "AEO, llms.txt, knowledge panel", color: "indigo" },
  { id: "continuous", label: "Continuous", icon: Bot, desc: "24/7 swarm tasks for ongoing dominance", color: "red" },
];

const COLOR_MAP = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  green: "bg-green-100 text-green-700 border-green-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  stone: "bg-stone-100 text-stone-700 border-stone-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

export default function DominanceCommand({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [autoPurchase, setAutoPurchase] = useState(false);
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [activeCampaigns, setActiveCampaigns] = useState([]);

  const loadActive = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("dominanceEngine", { action: "listActive" });
      setActiveCampaigns(res?.data?.active || []);
    } catch {}
  }, []);

  useEffect(() => { loadActive(); }, [loadActive]);

  // Poll for campaign progress while running
  useEffect(() => {
    if (!campaign || campaign.status !== "running") return;
    const interval = setInterval(async () => {
      try {
        const res = await base44.functions.invoke("dominanceEngine", {
          action: "getStatus",
          campaign_id: campaign.campaign_id,
        });
        if (res?.data?.campaign) {
          setCampaign(res.data.campaign);
          if (res.data.campaign.status !== "running") {
            clearInterval(interval);
            loadActive();
          }
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [campaign?.campaign_id, campaign?.status]);

  useEffect(() => {
    if (selectedNiche) setKeyword(selectedNiche.keyword);
  }, [selectedNiche]);

  const handleLaunch = async () => {
    if (!keyword.trim()) return;
    setLaunching(true);
    setError(null);
    setCampaign(null);
    try {
      const res = await base44.functions.invoke("dominanceEngine", {
        action: "launch",
        niche_id: selectedNiche?.id || "",
        keyword: keyword.trim(),
        city: city.trim(),
        state: stateVal.trim().toUpperCase(),
        auto_purchase_domain: autoPurchase,
        auto_deploy_vercel: autoDeploy,
      });
      if (res?.data?.campaign) {
        setCampaign(res.data.campaign);
      } else if (res?.data?.error) {
        setError(res.data.error);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  const getPhaseStatus = (phaseId) => {
    if (!campaign?.phase_status) return "pending";
    return campaign.phase_status[phaseId] || "pending";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "running": return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
      case "failed": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-stone-300" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg">
              <Crown className="h-7 w-7 text-stone-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">DOMINANCE ENGINE</h2>
              <p className="text-amber-400 text-sm font-semibold">One command → total digital dominance</p>
            </div>
          </div>
          <p className="text-stone-400 text-sm mt-2 max-w-2xl">
            Launches a deterministic, fully automated pipeline that chains all 11 modules:
            intelligence → brand → domain → infrastructure → 500+ pages → persona fame →
            technical SEO → AI search → 24/7 continuous dominance. The swarm becomes your brain.
            The cloud browser becomes your hands.
          </p>
        </div>
      </div>

      {/* Launch Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" /> Launch Command
        </h3>

        {/* Niche quick-select */}
        {UNIVERSAL_NICHES.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Quick-select Niche</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {UNIVERSAL_NICHES.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setKeyword(n.keyword); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    selectedNiche?.id === n.id || keyword === n.keyword
                      ? "border-amber-500 bg-amber-500/10 text-amber-600"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Seed Keyword</label>
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
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none uppercase"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoPurchase} onChange={(e) => setAutoPurchase(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm font-semibold text-stone-700">Auto-purchase domain via GoDaddy</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoDeploy} onChange={(e) => setAutoDeploy(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm font-semibold text-stone-700">Auto-deploy to Vercel</span>
          </label>
        </div>

        <button
          onClick={handleLaunch}
          disabled={launching || !keyword.trim()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-lg font-black flex items-center justify-center gap-3 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 transition shadow-lg"
        >
          {launching ? <Loader2 className="h-6 w-6 animate-spin" /> : <Rocket className="h-6 w-6" />}
          {launching ? "LAUNCHING DOMINANCE ENGINE..." : "🚀 LAUNCH DOMINANCE"}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && !campaign && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" /> Active Campaigns ({activeCampaigns.length})
          </h3>
          <div className="space-y-2">
            {activeCampaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50">
                <div>
                  <p className="text-sm font-bold text-stone-900">{c.keyword} {c.city && `· ${c.city}, ${c.state}`}</p>
                  <p className="text-xs text-stone-500">{c.current_step_description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-600">{c.progress_percent}%</div>
                  <button onClick={() => setCampaign(c)} className="text-xs text-amber-600 hover:underline font-semibold">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Progress */}
      {campaign && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Campaign: {campaign.keyword} {campaign.city && `· ${campaign.city}, ${campaign.state}`}
              </h3>
              <div className="text-2xl font-black text-amber-600">{campaign.progress_percent}%</div>
            </div>
            <div className="w-full h-3 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                style={{ width: `${campaign.progress_percent}%` }}
              />
            </div>
            <p className="text-sm text-stone-600 mt-2">{campaign.current_step_description}</p>
            {campaign.error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                <AlertCircle className="h-4 w-4" /> {campaign.error}
              </div>
            )}
          </div>

          {/* Phase Tracker */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="text-sm font-bold text-stone-700 mb-4">Pipeline Phases</h3>
            <div className="space-y-2">
              {PHASES.map((phase, i) => {
                const status = getPhaseStatus(phase.id);
                const Icon = phase.icon;
                return (
                  <div
                    key={phase.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      status === "running" ? "border-amber-400 bg-amber-50" :
                      status === "completed" ? "border-emerald-200 bg-emerald-50" :
                      status === "failed" ? "border-red-300 bg-red-50" :
                      "border-stone-200 bg-white"
                    }`}
                  >
                    {getStatusIcon(status)}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${COLOR_MAP[phase.color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-stone-900">{phase.label}</p>
                      <p className="text-xs text-stone-500">{phase.desc}</p>
                    </div>
                    <span className={`text-xs font-bold uppercase ${
                      status === "completed" ? "text-emerald-600" :
                      status === "running" ? "text-amber-600" :
                      status === "failed" ? "text-red-600" : "text-stone-400"
                    }`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Dashboard */}
          {campaign.status === "completed" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <Globe className="h-5 w-5 text-amber-500 mb-2" />
                <div className="text-xl font-black text-stone-900">{campaign.domain || "—"}</div>
                <div className="text-xs text-stone-500">Domain {campaign.domain_purchased ? "✓ Purchased" : "Selected"}</div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <FileText className="h-5 w-5 text-green-500 mb-2" />
                <div className="text-xl font-black text-stone-900">{campaign.pages_generated}</div>
                <div className="text-xs text-stone-500">Pages Generated</div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <Users className="h-5 w-5 text-pink-500 mb-2" />
                <div className="text-xl font-black text-stone-900">{campaign.platforms_count}</div>
                <div className="text-xs text-stone-500">Platforms Joined</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-400 p-4">
                <Award className="h-5 w-5 text-amber-600 mb-2" />
                <div className="text-xl font-black text-amber-700">{campaign.fame_score}/100</div>
                <div className="text-xs text-amber-600 font-semibold">Fame Score</div>
              </div>
            </div>
          )}

          {/* Campaign Details */}
          {(campaign.business_name || campaign.persona_name) && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
              <h3 className="text-sm font-bold text-stone-700">Campaign Details</h3>
              {campaign.business_name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-stone-400 w-24">Business:</span>
                  <span className="text-sm font-semibold text-stone-900">{campaign.business_name}</span>
                </div>
              )}
              {campaign.domain && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-stone-400 w-24">Domain:</span>
                  <a href={`https://${campaign.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-amber-600 hover:underline">{campaign.domain}</a>
                </div>
              )}
              {campaign.vercel_deployment_url && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-stone-400 w-24">Live URL:</span>
                  <a href={campaign.vercel_deployment_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-amber-600 hover:underline">{campaign.vercel_deployment_url}</a>
                </div>
              )}
              {campaign.persona_name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-stone-400 w-24">Persona:</span>
                  <span className="text-sm font-semibold text-stone-900">{campaign.persona_name}</span>
                </div>
              )}
              {campaign.swarm_tasks_spawned?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-stone-400 w-24">Swarm Tasks:</span>
                  <span className="text-sm font-semibold text-stone-900">{campaign.swarm_tasks_spawned.length} tasks spawned for 24/7 operation</span>
                </div>
              )}
              {campaign.page_types?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase text-stone-400 w-24">Page Types:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-8">
                    {campaign.page_types.map((t, i) => (
                      <span key={i} className="px-2 py-1 rounded text-xs font-semibold bg-stone-100 text-stone-600">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {campaign.platforms_joined?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase text-stone-400 w-24">Platforms:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-8">
                    {campaign.platforms_joined.map((p, i) => (
                      <span key={i} className="px-2 py-1 rounded text-xs font-semibold bg-pink-100 text-pink-700">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refresh button */}
          <div className="flex justify-center">
            <button
              onClick={() => { setCampaign(null); loadActive(); }}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 text-sm font-semibold hover:border-stone-400 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Launch Another Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}