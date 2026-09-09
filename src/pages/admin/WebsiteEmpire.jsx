import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Globe, Rocket, MapPin, Factory, TrendingUp, Zap, Target, Sparkles,
  CheckCircle2, Clock, AlertCircle, Layers, DollarSign, Users, Search,
  ArrowRight, Crown, Building2, Network, Brain, LineChart, Lightbulb,
  Wand2, Smartphone, MessageSquare, BarChart3
} from "lucide-react";

const US_STATES = {
  FL: "Florida", GA: "Georgia", TX: "Texas", AZ: "Arizona", NV: "Nevada",
  CA: "California", TN: "Tennessee", NC: "North Carolina", SC: "South Carolina",
  AL: "Alabama", LA: "Louisiana", OK: "Oklahoma", AR: "Arkansas", KY: "Kentucky",
  IN: "Indiana", OH: "Ohio", MO: "Missouri", KS: "Kansas", NM: "New Mexico",
  CO: "Colorado", UT: "Utah", ID: "Idaho",
};

export default function WebsiteEmpire() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["websiteEmpire-templates"],
    queryFn: () => base44.entities.WebsiteTemplate.list("-created_date", 500),
  });
  const { data: campaigns } = useQuery({
    queryKey: ["websiteEmpire-campaigns"],
    queryFn: () => base44.entities.LaunchCampaign.list("-created_date", 50),
  });

  const stats = useMemo(() => {
    const t = templates || [];
    const byStatus = { draft: 0, configured: 0, deploying: 0, live: 0, archived: 0 };
    const byState = {};
    const byTier = { economy: 0, standard: 0, premium: 0 };
    const withLogo = [];
    const withDomain = [];
    t.forEach((tpl) => {
      byStatus[tpl.status] = (byStatus[tpl.status] || 0) + 1;
      const st = tpl.config?.primary_state || "—";
      byState[st] = (byState[st] || 0) + 1;
      const tier = tpl.config?.pricing_tier || "standard";
      byTier[tier] = (byTier[tier] || 0) + 1;
      if (tpl.config?.hero_image_url) withLogo.push(tpl);
      if (tpl.config?.domain || tpl.generated_url) withDomain.push(tpl);
    });
    const statesCovered = Object.keys(byState).length;
    const citiesCovered = new Set(t.map((x) => x.config?.primary_city?.toLowerCase()).filter(Boolean)).size;
    return { total: t.length, byStatus, byState, byTier, withLogo, withDomain, statesCovered, citiesCovered };
  }, [templates]);

  const campaignStats = useMemo(() => {
    const c = campaigns || [];
    return {
      total: c.length,
      active: c.filter((x) => x.status === "active").length,
      planning: c.filter((x) => x.status === "planning").length,
      cities: c.reduce((sum, x) => sum + (x.target_cities?.length || 0), 0),
      deployed: c.reduce((sum, x) => sum + (x.metrics?.sites_deployed || 0), 0),
      leads: c.reduce((sum, x) => sum + (x.metrics?.leads_generated || 0), 0),
    };
  }, [campaigns]);

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 text-white border border-amber-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-8 w-8 text-amber-500" />
          <h1 className="text-3xl font-extrabold tracking-tight">Website Empire Dashboard</h1>
        </div>
        <p className="text-stone-400 max-w-3xl">
          A complete view of every website template we've built, the scale we've achieved, what the system can do right now,
          and the roadmap to dominate the national garage-floor coating market.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon={Factory} label="Total Templates" value={stats.total} tone="amber" />
        <StatCard icon={Rocket} label="Live Sites" value={stats.byStatus.live} tone="green" />
        <StatCard icon={Clock} label="Configured" value={stats.byStatus.configured} tone="blue" />
        <StatCard icon={MapPin} label="Cities Covered" value={stats.citiesCovered} tone="amber" />
        <StatCard icon={Globe} label="States Reached" value={stats.statesCovered} tone="purple" />
        <StatCard icon={Building2} label="Launch Campaigns" value={campaignStats.total} tone="stone" />
      </div>

      {/* Build status breakdown */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4"><Layers className="h-5 w-5 text-amber-500" /> Build Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="rounded-xl border border-stone-200 p-4 text-center">
              <div className="text-3xl font-extrabold text-stone-900">{count}</div>
              <div className="text-xs font-bold uppercase tracking-wide text-stone-500 mt-1">{status}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
            <div className="text-xl font-bold text-amber-700">{stats.withLogo.length}</div>
            <div className="text-[11px] text-amber-600 font-semibold uppercase">With Logo</div>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{stats.withDomain.length}</div>
            <div className="text-[11px] text-blue-600 font-semibold uppercase">With Domain</div>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-center">
            <div className="text-xl font-bold text-stone-700">{stats.byTier.premium}</div>
            <div className="text-[11px] text-stone-500 font-semibold uppercase">Premium Tier</div>
          </div>
        </div>
      </div>

      {/* State coverage map */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4"><MapPin className="h-5 w-5 text-amber-500" /> Geographic Coverage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(stats.byState).sort((a, b) => b[1] - a[1]).map(([state, count]) => (
            <div key={state} className="rounded-lg border border-stone-200 px-3 py-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-stone-900">{US_STATES[state] || state}</div>
                <div className="text-[10px] text-stone-400 font-semibold uppercase">{state}</div>
              </div>
              <span className="text-lg font-extrabold text-amber-600">{count}</span>
            </div>
          ))}
          {Object.keys(stats.byState).length === 0 && <p className="text-sm text-stone-400 col-span-full">No templates yet.</p>}
        </div>
      </div>

      {/* Every template grid */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4"><Globe className="h-5 w-5 text-amber-500" /> Every Template ({stats.total})</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-10"><div className="h-6 w-6 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" /></div>
        ) : stats.total === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <Factory className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No templates built yet. Head to the Rebrand Studio to mass-produce your first batch.</p>
            <a href="/admin/rebrand-studio" className="inline-flex items-center gap-1.5 mt-3 text-amber-600 font-semibold text-sm"><Rocket className="h-4 w-4" /> Go to Rebrand Studio</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(templates || []).map((t) => (
              <div key={t.id} className="rounded-xl border border-stone-200 p-3 hover:border-amber-500 transition">
                <div className="flex items-start gap-2 mb-2">
                  {t.config?.hero_image_url ? (
                    <img src={t.config.hero_image_url} alt="logo" className="h-9 w-9 object-contain rounded bg-stone-50 shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded bg-stone-100 grid place-items-center text-stone-400 text-[9px] shrink-0">LOGO</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-900 truncate">{t.name}</div>
                    <div className="text-[11px] text-stone-400 truncate">{t.config?.company_name || t.slug}</div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <MapPin className="h-3 w-3" /> {t.config?.primary_city || "—"}, {t.config?.primary_state || "—"}
                </div>
                {t.generated_url && (
                  <a href={t.generated_url} target="_blank" rel="noopener" className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 mt-1 truncate">
                    <Globe className="h-3 w-3" /> {t.generated_url.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* What we can do right now */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4"><Zap className="h-5 w-5 text-amber-500" /> What the System Can Do Right Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Capability icon={Factory} title="Mass-Production Engine" desc="Generate 70+ city-specific websites in one click — each with unique name, slug, subdomain, logo, and service area." />
          <Capability icon={Rocket} title="One-Click Deploy" desc="Push any template live with a single button. Status tracking from draft → configured → live." />
          <Capability icon={Wand2} title="AI Logo Generation" desc="Transparent PNG logos created from a company name + style hint, shared across all city variants." />
          <Capability icon={Search} title="Content Scanning" desc="AI scans the live site and identifies every element that must change for a rebrand." />
          <Capability icon={Globe} title="Subdomain Routing" desc="Auto-generates cityslug.rootdomain URLs; GoDaddy wildcard CNAME routes unlimited subdomains." />
          <Capability icon={Smartphone} title="PWA + Mobile App" desc="Every template ships PWA-ready; App Factory builds native iOS/Android wrappers from the same code." />
          <Capability icon={TrendingUp} title="SEO Per Location" desc="AI generates location-specific SEO pages, sitemaps, and IndexNow pings for each city site." />
          <Capability icon={Users} title="Lead Capture Per Site" desc="Every site runs the full estimator funnel; leads route to the central CRM with city attribution." />
          <Capability icon={MessageSquare} title="Multi-Channel Comms" desc="SMS, MMS, WhatsApp, AI voice, and email outreach from a central automation line." />
          <Capability icon={Network} title="Autonomous Swarm" desc="7 specialized AI agents (lead, SEO, social, reputation, site factory, comms, orchestrator) run the platform autonomously." />
          <Capability icon={BarChart3} title="Per-Location Analytics" desc="Track leads, page views, and conversion rates by city to find your best-performing markets." />
          <Capability icon={DollarSign} title="Built-in Payments" desc="Base44 Payments integration ready for paid plans, subscriptions, and lead-buyer monetization." />
        </div>
      </div>

      {/* Strategy — what to do next */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4"><Target className="h-5 w-5 text-amber-600" /> Strategy — What to Do Next</h2>
        <div className="space-y-3">
          <StrategyStep num="1" title="Activate Xtreme Comms Tenant" desc="The new API key passes auth but the tenant isn't provisioned. Once Xtreme Comms activates tenant 6a9b71b0d35335afb9198955, every lead gets instant SMS follow-up automatically." priority="critical" />
          <StrategyStep num="2" title="Deploy the First 10 City Sites" desc="Pick your strongest Florida markets (Pompano Beach, Fort Lauderdale, Miami, Orlando, Tampa, West Palm Beach, Boca Raton, Naples, Sarasota, Jacksonville) and deploy them live. This validates the full pipeline end-to-end." priority="high" />
          <StrategyStep num="3" title="Connect Custom Root Domain" desc="Point a root domain (e.g. epoxyfloors.com) with a GoDaddy wildcard CNAME → epoxyquotenearme.base44.app. This unlocks unlimited city subdomains instantly." priority="high" />
          <StrategyStep num="4" title="Run the Swarm Autopilot" desc="The hourly Swarm Autopilot workflow is live. It will auto-distribute tasks to agents — SEO optimization, lead follow-up, social posting, reputation monitoring — without manual triggers." priority="medium" />
          <StrategyStep num="5" title="Scale to 70 → 500 Cities" desc="Once the first 10 are profitable, expand the city list in Rebrand Studio. The national garage-floor market has 1,000+ viable metro areas; 500 is a realistic 12-month target." priority="medium" />
          <StrategyStep num="6" title="Launch National Campaign" desc="Use the National Launch dashboard to bundle templates into a coordinated campaign with budget tracking, auto-deploy, and revenue metrics per region." priority="low" />
        </div>
      </div>

      {/* Possibilities & future potential */}
      <div className="rounded-2xl border border-stone-900 bg-stone-950 p-6 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-500"><Lightbulb className="h-5 w-5" /> Possibilities & Future Potential</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FutureCard icon={Building2} title="Franchise-as-a-Service" desc="Sell complete digital franchises to local contractors — website, app, lead engine, CRM, and comms — as a monthly subscription. 500 franchises × $499/mo = $2.5M ARR." />
          <FutureCard icon={DollarSign} title="Lead Marketplace" desc="Each city site generates homeowner leads. Sell exclusive leads to local coating contractors at $50–$150 per lead. 70 cities × 20 leads/mo × $100 = $140K/mo potential." />
          <FutureCard icon={Network} title="National Swarm Intelligence" desc="As data flows in from every city, the AI swarm learns which markets, colors, pricing, and messaging convert best — then auto-optimizes every site simultaneously." />
          <FutureCard icon={Brain} title="Autonomous Content Engine" desc="AI agents generate SEO pages, blog posts, social content, and video scripts per city — each optimized for local search intent and answer-engine queries (ChatGPT, Perplexity)." />
          <FutureCard icon={LineChart} title="Market Dominance Dashboard" desc="Real-time view of national coverage: which cities you own, which competitors rank where, and where the next opportunity gap is — powered by the competitor scanner." />
          <FutureCard icon={Smartphone} title="Homeowner App Network" desc="Each city site ships a PWA + native app. Homeowners get floor visualizers, estimates, booking, and maintenance plans — creating a national homeowner database." />
          <FutureCard icon={Crown} title="White-Label Platform" desc="License the entire factory to other home-service verticals (countertops, patios, driveways) — same engine, different niche, multiplied revenue." />
          <FutureCard icon={Rocket} title="Exit-Ready Asset" desc="A profitable, automated, multi-location digital platform with real lead flow and recurring revenue is a prime acquisition target for PE firms consolidating home services." />
        </div>
      </div>

      {/* Campaign summary */}
      {campaignStats.total > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4"><Rocket className="h-5 w-5 text-amber-500" /> Launch Campaigns</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MiniStat label="Campaigns" value={campaignStats.total} />
            <MiniStat label="Active" value={campaignStats.active} />
            <MiniStat label="Planning" value={campaignStats.planning} />
            <MiniStat label="Sites Deployed" value={campaignStats.deployed} />
            <MiniStat label="Leads Generated" value={campaignStats.leads} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-green-200 bg-green-50 text-green-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    stone: "border-stone-200 bg-stone-50 text-stone-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.stone}`}>
      <Icon className="h-5 w-5 mb-2 opacity-80" />
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    live: "bg-green-100 text-green-700",
    configured: "bg-amber-100 text-amber-700",
    deploying: "bg-blue-100 text-blue-700",
    draft: "bg-stone-100 text-stone-500",
    archived: "bg-stone-100 text-stone-400",
  };
  return <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${map[status] || map.draft}`}>{(status || "").toUpperCase()}</span>;
}

function Capability({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-stone-200 p-4 hover:border-amber-500 transition">
      <Icon className="h-5 w-5 text-amber-500 mb-2" />
      <div className="text-sm font-bold text-stone-900 mb-1">{title}</div>
      <div className="text-xs text-stone-500 leading-relaxed">{desc}</div>
    </div>
  );
}

function StrategyStep({ num, title, desc, priority }) {
  const pmap = {
    critical: "border-red-300 bg-red-50 text-red-700",
    high: "border-amber-300 bg-amber-50 text-amber-700",
    medium: "border-blue-300 bg-blue-50 text-blue-700",
    low: "border-stone-300 bg-stone-50 text-stone-600",
  };
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-amber-500 text-stone-950 grid place-items-center font-bold text-sm shrink-0">{num}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-bold text-stone-900">{title}</div>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${pmap[priority]}`}>{priority}</span>
        </div>
        <div className="text-xs text-stone-600 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function FutureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-stone-700 bg-stone-900 p-4 hover:border-amber-500 transition">
      <Icon className="h-5 w-5 text-amber-500 mb-2" />
      <div className="text-sm font-bold text-white mb-1">{title}</div>
      <div className="text-xs text-stone-400 leading-relaxed">{desc}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-stone-200 p-3 text-center">
      <div className="text-xl font-bold text-stone-900">{value}</div>
      <div className="text-[10px] font-semibold uppercase text-stone-500">{label}</div>
    </div>
  );
}