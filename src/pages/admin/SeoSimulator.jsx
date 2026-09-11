import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, Save, FolderOpen, Sparkles, Zap } from "lucide-react";
import ScoreDashboard from "@/components/seo-sim/ScoreDashboard";
import TimelineEstimate from "@/components/seo-sim/TimelineEstimate";
import LandingPagePreview from "@/components/seo-sim/LandingPagePreview";
import LocalModules from "@/components/seo-sim/LocalModules";
import ContentModules from "@/components/seo-sim/ContentModules";
import AmplifyModules from "@/components/seo-sim/AmplifyModules";
import UrlSimulator from "@/components/seo-sim/UrlSimulator";

const DEFAULT_STATE = {
  name: "Untitled Simulation",
  target_keyword: "epoxy garage floor near me",
  page_content: {
    brand_name: "Epoxy Garage Floors",
    title: "",
    meta_description: "",
    h1: "",
    subheader: "",
    body_content: "",
    city: "",
    state: "",
    nav_items: ["Home", "Services", "Gallery", "Reviews", "About", "Contact"],
  },
  modules: {
    google_business: { profile_complete: false, photos_count: 0, posts_count: 0, has_qa: false, has_services: false },
    reviews: { review_count: 0, avg_rating: 0, response_rate: 0, recent_reviews: 0 },
    citations: { bing_listed: false, yelp_listed: false, bbb_member: false, apple_maps: false, nap_consistent: false },
    social: { facebook: false, instagram: false, linkedin: false, youtube: false, tiktok: false, x_twitter: false, posting_frequency: 0, engagement_rate: 0 },
    aeo: { has_faq_schema: false, has_qa_content: false, has_product_schema: false, has_review_schema: false, has_localbusiness_schema: false, concise_answers: false, entity_mentions: 0 },
    technical: { https: true, mobile_friendly: false, page_speed_score: 0, has_sitemap: false, has_robots: false, has_schema: false, core_web_vitals: false },
    backlinks: { referring_domains: 0, domain_authority: 0, anchor_diversity: 0, link_velocity: 0 },
    ads: { google_ads_active: false, monthly_budget: 0, facebook_ads_active: false },
  },
};

export default function SeoSimulator() {
  const [sim, setSim] = useState(DEFAULT_STATE);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [simName, setSimName] = useState("Untitled Simulation");
  const debounceRef = useRef();

  // Load saved simulations list
  const { data: savedSims, refetch } = useQuery({
    queryKey: ["seoSimulations"],
    queryFn: async () => {
      const res = await base44.functions.invoke("seoAeoSimulator", { action: "list" });
      return res.data?.simulations || [];
    },
  });

  // Debounced recalculation — calls backend DEEP engine
  const recalculate = useCallback(async (simState) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("seoAeoSimulator", {
        action: "calculate",
        simulation: simState,
        simulation_id: savedId || undefined,
      });
      setScores(res.data);
    } catch (e) {
      console.error("Scoring error:", e);
    } finally {
      setLoading(false);
    }
  }, [savedId]);

  // Trigger recalculation on state change (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => recalculate(sim), 400);
    return () => clearTimeout(debounceRef.current);
  }, [sim, recalculate]);

  const updatePageContent = (page_content) => setSim((s) => ({ ...s, page_content }));
  const updateModules = (modules) => setSim((s) => ({ ...s, modules }));
  const updateKeyword = (target_keyword) => setSim((s) => ({ ...s, target_keyword }));

  const handleSave = async () => {
    try {
      const res = await base44.functions.invoke("seoAeoSimulator", {
        action: "save",
        name: simName,
        simulation: sim,
        simulation_id: savedId || undefined,
      });
      if (res.data?.simulation_id) {
        setSavedId(res.data.simulation_id);
        refetch();
      }
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const handleLoad = async (id) => {
    try {
      const res = await base44.functions.invoke("seoAeoSimulator", { action: "load", simulation_id: id });
      const loaded = res.data?.simulation;
      if (loaded) {
        setSim({
          name: loaded.name,
          target_keyword: loaded.target_keyword,
          page_content: loaded.page_content || DEFAULT_STATE.page_content,
          modules: loaded.modules || DEFAULT_STATE.modules,
        });
        setSimName(loaded.name);
        setSavedId(loaded.id);
      }
    } catch (e) {
      console.error("Load error:", e);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            SEO/AEO Enhancement Simulator
          </h1>
          <p className="text-stone-500 text-sm mt-1">Start from zero, build a Google-perfected page, and see exactly how each enhancement shifts your scores.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={simName}
            onChange={(e) => setSimName(e.target.value)}
            className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:border-amber-500 outline-none w-48"
            placeholder="Simulation name"
          />
          <button onClick={handleSave} className="px-3 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-stone-800">
            <Save className="h-4 w-4" /> Save
          </button>
          {savedSims && savedSims.length > 0 && (
            <select
              onChange={(e) => e.target.value && handleLoad(e.target.value)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:border-amber-500 outline-none"
              defaultValue=""
            >
              <option value="">Load saved...</option>
              {savedSims.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.overall_score || 0})</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
          Recalculating scores with DEEP engine...
        </div>
      )}

      {/* 1. Timeline + Scores at the top */}
      {scores ? (
        <>
          <TimelineEstimate
            months={scores.timeline_months}
            keywordDifficulty={scores.keyword_difficulty}
            overallScore={scores.overall_score}
            keyword={sim.target_keyword}
          />
          <ScoreDashboard scores={scores} breakdown={scores.breakdown} />
        </>
      ) : (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* 2. Keyword target */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" /> Target Keyword
        </label>
        <input
          value={sim.target_keyword}
          onChange={(e) => updateKeyword(e.target.value)}
          placeholder="epoxy garage floor near me"
          className="w-full mt-2 text-lg font-semibold bg-transparent border-b border-stone-200 focus:border-amber-500 outline-none pb-1"
        />
        {scores && (
          <p className="text-xs text-stone-500 mt-1">
            Difficulty: <span className="font-bold text-amber-600">{scores.keyword_difficulty}/100</span> ·
            Intent: <span className="font-bold">{scores.is_local_intent ? "Local" : "National/Broad"}</span>
          </p>
        )}
      </div>

      {/* 3. Editable landing page preview */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Landing Page Builder</h2>
        <LandingPagePreview content={sim.page_content} onChange={updatePageContent} />
      </div>

      {/* 4. URL Simulator */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">URL Simulator — Score Any Page</h2>
        <UrlSimulator />
      </div>

      {/* 5. Interactive modules */}
      {scores && (
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Local SEO Modules</h2>
            <LocalModules modules={sim.modules} onChange={updateModules} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Content & Technical Modules</h2>
            <ContentModules modules={sim.modules} onChange={updateModules} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Amplification Modules</h2>
            <AmplifyModules modules={sim.modules} onChange={updateModules} />
          </div>

          {/* Findings & recommendations */}
          {scores.findings?.length > 0 && (
            <div className="bg-stone-900 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Findings & Recommendations</h3>
              <div className="space-y-2">
                {scores.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-stone-950 rounded-lg border border-stone-800">
                    <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      f.severity === "critical" ? "bg-red-500/20 text-red-400" :
                      f.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                      f.severity === "medium" ? "bg-amber-500/20 text-amber-400" :
                      "bg-stone-700 text-stone-400"
                    }`}>{f.severity}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-200">{f.factor}</p>
                      <p className="text-xs text-stone-500">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              {scores.recommendations?.length > 0 && (
                <div className="border-t border-stone-800 pt-3">
                  <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">Next Actions</h4>
                  <ol className="space-y-1.5">
                    {scores.recommendations.map((r, i) => (
                      <li key={i} className="text-xs text-stone-300 flex gap-2">
                        <span className="text-amber-500 font-bold">{i + 1}.</span> {r}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}