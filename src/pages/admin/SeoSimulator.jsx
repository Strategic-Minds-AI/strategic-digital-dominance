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
import SyncPanel from "@/components/seo-sim/SyncPanel";
import GeneratorWorkflow from "@/components/seo-sim/GeneratorWorkflow";

// ── Google-Perfected Baseline ──
// Every ranking factor pre-filled to the optimal value that Google's published
// ranking-factor studies (Backlinko 11.8M results, BrightLocal, Ahrefs, SEMrush)
// and every major SEO system recommend. Start from perfected, adjust from there.
const PERFECTED_BODY = `Looking for a professional epoxy garage floor near me? Our team specializes in premium epoxy garage floor coating that transforms ordinary concrete into durable, beautiful surfaces. Whether you need a new garage floor coating or want to resurface an existing concrete slab, we deliver professional installation backed by a 15-year warranty. We serve homeowners throughout Orlando, FL and all of Central Florida with same-day installation on approved projects.

## Why Choose Epoxy Garage Floor Coating?

Epoxy garage floor coating is the most durable and cost-effective way to protect your concrete. Unlike bare concrete, an epoxy floor resists oil stains, chemicals, hot tire pickup, and wear from daily use. Our professional installation team uses industrial-grade epoxy resin to create a seamless, non-porous surface that lasts for decades.

A properly installed epoxy garage floor near me should always include professional surface preparation, crack repair, moisture testing, a high-bond primer, a base coat with color flakes, and a clear polyaspartic topcoat for UV protection. We never skip steps — every coating system we install is built to last.

## Our Professional Epoxy Coating Process

Every professional garage floor coating project follows a systematic process to ensure maximum durability and a flawless finish:

1. Surface Preparation — We grind the concrete to open the pores, repair every crack, and test for moisture vapor. This is the single most important step for a long-lasting epoxy floor. Skip it and the coating will peel.

2. Primer Application — A high-bond epoxy primer seals the concrete and creates a chemical bond between the slab and the base coat. This step prevents delamination and extends the life of your floor.

3. Base Coat with Color Flakes — We apply the epoxy base coat and broadcast color flakes to your chosen density — full flake, medium flake, or light flake. Full flake hides imperfections and creates a premium terrazzo-style finish.

4. Clear Topcoat — A polyaspartic or polyurethane clear coat seals the floor, protects against UV yellowing, and creates the final finish — gloss, semi-gloss, or matte.

5. Final Inspection — Our contractor inspects every square foot to ensure professional quality before we hand over the keys.

## Epoxy Garage Floor Cost

The cost of an epoxy garage floor depends on several factors. A standard two-car garage of 400 to 600 square feet typically costs between $2,000 and $5,000. The final price depends on the coating system you choose, the condition of your concrete, and the color flake density you select.

Basic epoxy systems are the most affordable option. Premium polyaspartic systems cost more but cure in hours instead of days. Metallic epoxy creates a custom, high-end look and commands the highest price. Get a free estimate to see the exact cost for your garage — our pricing is transparent with no hidden fees.

## What Affects the Price?

Several factors influence the final cost of your garage floor coating. Square footage is the biggest driver — larger garages cost more but have a lower per-square-foot price. The condition of your concrete matters too; heavily damaged concrete with deep cracks, oil stains, or moisture issues requires more preparation and increases the cost.

The coating system you select also affects price. Polyaspartic costs more than standard epoxy but offers superior UV resistance and faster cure times. Custom colors, metallic finishes, and full-flake broadcasts add to the price. Our 15-year warranty is included at no extra cost on every professional installation.

## Polyaspartic vs Epoxy: Which Is Better?

Polyaspartic garage floor coating is a newer technology that cures faster and resists UV better than traditional epoxy. For most homeowners searching for an epoxy garage floor near me, we recommend a hybrid system — an epoxy base coat for maximum adhesion and a polyaspartic topcoat for UV protection and rapid cure. This gives you the best of both systems at a competitive price.

Polyaspartic can be installed in temperatures as low as 30 degrees, making it ideal for winter installation when traditional epoxy cannot be applied. The cure time is also dramatically faster — a polyaspartic floor can be walked on in 4 to 6 hours and driven on in 24 hours, compared to 72 hours for traditional epoxy.

## Serving Orlando, FL and Central Florida

Our professional epoxy garage floor team serves homeowners throughout Orlando, FL and the surrounding communities. We install garage floor coatings in Orlando, Winter Park, Kissimmee, Sanford, Altamonte Springs, Apopka, Oviedo, Maitland, Casselberry, and Longwood. If you are searching for epoxy garage floor near me anywhere in Central Florida, our contractor is ready to help.

We offer free in-home estimates, same-day installation on approved projects, and flexible scheduling including evenings and weekends. Our service area covers all of Orange County, Seminole County, Osceola County, and parts of Lake County and Volusia County.

## Benefits of Professional Epoxy Flooring

A professionally installed epoxy garage floor delivers benefits that bare concrete simply cannot match. The coating creates a seamless, non-porous surface that resists oil, grease, chemicals, and stains — spills wipe clean with a paper towel. The high-gloss finish brightens your garage by reflecting overhead lighting, reducing the need for additional fixtures.

Epoxy is also incredibly durable. A properly installed floor withstands hot tire pickup, heavy tool drops, and years of daily vehicle traffic without chipping or peeling. The surface is also slip-resistant when a clear topcoat with anti-slip additive is applied, making it safer for children and elderly family members.

Beyond durability, an epoxy garage floor adds real estate value. A finished garage is a selling point that appraisers and home buyers notice. The return on investment is significant — a $3,000 coating can add $5,000 to $10,000 in perceived home value.

## Before and After: The Transformation

The difference between bare concrete and a finished epoxy floor is dramatic. Before installation, your garage floor is gray, porous, stained, and difficult to clean. After professional installation, the same space is bright, seamless, easy to maintain, and visually striking.

Our gallery showcases hundreds of before-and-after transformations from Orlando homeowners. Every project starts with a stained, cracked slab and ends with a showroom-quality floor. The color flake system you choose — whether it is a subtle gray, a bold metallic blue, or a warm earth tone — defines the character of your garage.

## Maintenance: Keeping Your Floor Looking New

One of the biggest advantages of epoxy is how easy it is to maintain. Routine care takes minutes per week. Sweep or blow out dust and debris. Mop with warm water and a mild detergent — no harsh chemicals needed. Avoid acidic cleaners and degreasers that can dull the clear topcoat over time.

For stubborn tire marks, a soft-bristle brush and warm soapy water will lift most stains. Reapply a thin coat of floor wax once a year to restore the original gloss. With basic care, your epoxy garage floor will look new for 15 to 20 years.

## Why Professional Installation Matters

DIY epoxy kits are available at hardware stores, but the results rarely match a professional installation. The most common failure point is surface preparation. Without professional grinding equipment, the concrete pores remain sealed and the epoxy cannot bond properly — leading to peeling within months.

A professional contractor has the equipment, experience, and industrial-grade materials to do the job right. We diamond-grind every floor, repair every crack, test for moisture, and apply multiple coats with precise timing. The result is a floor that lasts decades, not months.

## Our Warranty

Every professional epoxy garage floor installation includes a 15-year warranty against peeling, bubbling, and delamination. We stand behind our work because we install it right the first time. Our contractor uses only industrial-grade materials and proven installation techniques. If any issue arises during the warranty period, we return and fix it at no cost.

## Frequently Asked Questions

How long does epoxy garage floor installation take? Most two-car garages are completed in one day. Larger garages or heavily damaged concrete may require two days.

How much does an epoxy garage floor cost near me? A standard two-car garage of 400 to 600 square feet costs between $2,000 and $5,000 depending on the coating system and concrete condition.

Is epoxy better than polyaspartic? Epoxy is more affordable; polyaspartic cures faster and resists UV better. We recommend a hybrid system for the best value.

How long does an epoxy floor last? A professionally installed epoxy garage floor lasts 15 to 20 years with proper maintenance.

Can you install epoxy in cold weather? Yes, polyaspartic systems can be installed in temperatures as low as 30 degrees, making them ideal for winter installation.

## Get Your Free Estimate Today

Ready to transform your garage with a professional epoxy floor coating? Contact us for a free in-home estimate. Our team serves Orlando, FL and all of Central Florida. Call now or fill out our online form to schedule your consultation. Do not settle for bare concrete — get a professional epoxy garage floor installation that adds value, durability, and beauty to your home. Our contractor is ready to install the best garage floor coating near you.`;

const DEFAULT_STATE = {
  name: "Google-Perfected Baseline",
  target_keyword: "epoxy garage floor near me",
  page_content: {
    brand_name: "Epoxy Garage Floors",
    title: "Epoxy Garage Floor Near Me | Pro Installation Orlando",
    meta_description: "Professional epoxy garage floor near me? Free estimates on premium garage floor coating in Orlando, FL. 15-year warranty, same-day installation.",
    h1: "Epoxy Garage Floor Near Me — Professional Installation in Orlando, FL",
    subheader: "Premium epoxy & polyaspartic garage floor coating with a 15-year warranty. Free in-home estimates throughout Central Florida.",
    body_content: PERFECTED_BODY,
    city: "Orlando",
    state: "FL",
    nav_items: ["Home", "Services", "Gallery", "Reviews", "About", "Contact"],
  },
  modules: {
    // Google Business Profile — fully optimized
    google_business: { profile_complete: true, photos_count: 25, posts_count: 12, has_qa: true, has_services: true },
    // Reviews — 50+ reviews, 4.8 rating, 100% response rate, 10+ recent
    reviews: { review_count: 65, avg_rating: 4.8, response_rate: 100, recent_reviews: 12 },
    // Citations — all major directories, NAP consistent
    citations: { bing_listed: true, yelp_listed: true, bbb_member: true, apple_maps: true, nap_consistent: true },
    // Social — all 6 platforms, 8+ posts/week, 80% engagement
    social: { facebook: true, instagram: true, linkedin: true, youtube: true, tiktok: true, x_twitter: true, posting_frequency: 8, engagement_rate: 80 },
    // AEO — all schema types, concise answers, 8+ entity mentions
    aeo: { has_faq_schema: true, has_qa_content: true, has_product_schema: true, has_review_schema: true, has_localbusiness_schema: true, concise_answers: true, entity_mentions: 8 },
    // Technical — all checks passing, 95+ speed score
    technical: { https: true, mobile_friendly: true, page_speed_score: 95, has_sitemap: true, has_robots: true, has_schema: true, core_web_vitals: true },
    // Backlinks — 100+ referring domains, DA 40, diverse anchors, steady velocity
    backlinks: { referring_domains: 120, domain_authority: 40, anchor_diversity: 85, link_velocity: 12 },
    // Ads — Google + Facebook active, $2,500/mo budget
    ads: { google_ads_active: true, monthly_budget: 2500, facebook_ads_active: true },
  },
};

export default function SeoSimulator() {
  const [sim, setSim] = useState(DEFAULT_STATE);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [simName, setSimName] = useState("Google-Perfected Baseline");
  const [targetUrl, setTargetUrl] = useState("");
  const [targetSiteUrl, setTargetSiteUrl] = useState("");
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

  // Apply live sync data from connected accounts into the simulator
  const handleApplySyncData = (moduleUpdates) => {
    setSim((s) => ({
      ...s,
      modules: {
        ...s.modules,
        ...Object.fromEntries(
          Object.entries(moduleUpdates).map(([key, val]) => [
            key,
            { ...(s.modules[key] || {}), ...val },
          ])
        ),
      },
    }));
  };

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
          <p className="text-stone-500 text-sm mt-1">Starts with every Google-recommended ranking factor pre-filled to optimal — adjust from a perfected baseline and see exactly how each change shifts your scores.</p>
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

      {/* 5. Target URL for sync + generator */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Target Page URL (for sync & generator)</label>
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://epoxyquotenearme.com/"
            className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">GSC Site URL</label>
          <input
            value={targetSiteUrl}
            onChange={(e) => setTargetSiteUrl(e.target.value)}
            placeholder="sc-domain:epoxyquotenearme.com"
            className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* 6. Live Account Sync */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Live Account Sync — Pull Real Data</h2>
        <SyncPanel keyword={sim.target_keyword} url={targetUrl} siteUrl={targetSiteUrl} onApplyData={handleApplySyncData} />
      </div>

      {/* 7. Generator Workflow */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-2">Generator Workflow — Automate Everything</h2>
        <GeneratorWorkflow
          keyword={sim.target_keyword}
          url={targetUrl}
          siteUrl={targetSiteUrl}
          sitemapUrl="/sitemap.xml"
        />
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