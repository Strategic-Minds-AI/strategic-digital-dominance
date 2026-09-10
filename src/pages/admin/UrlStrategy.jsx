import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, ShoppingCart, CheckCircle2, ExternalLink, Plus, Filter, TrendingUp, DollarSign, MapPin, Zap, Loader2 } from "lucide-react";

// ── Niche definitions ──
const NICHES = {
  epoxy_garage: {
    label: "Epoxy Garage Floors",
    keywords: ["epoxy garage floor", "garage floor coating", "garage floor epoxy", "epoxy garage floor coating", "garage floor resurfacing", "garage coating"],
    avgLeadValue: 500,
    avgCpc: 8,
  },
  decorative_concrete: {
    label: "Decorative Concrete",
    keywords: ["decorative concrete", "stamped concrete", "concrete resurfacing", "concrete overlay", "decorative concrete coating"],
    avgLeadValue: 350,
    avgCpc: 5,
  },
  polished_concrete: {
    label: "Polished Concrete",
    keywords: ["polished concrete", "concrete polishing", "polished concrete floors", "concrete floor polishing"],
    avgLeadValue: 400,
    avgCpc: 6,
  },
  epoxy_flooring: {
    label: "Epoxy Flooring (General)",
    keywords: ["epoxy flooring", "epoxy floor coating", "epoxy floor", "epoxy floors"],
    avgLeadValue: 450,
    avgCpc: 7,
  },
  garage_coating: {
    label: "Garage Coating",
    keywords: ["garage coating", "garage floor coating", "concrete garage coating", "polyaspartic garage floor"],
    avgLeadValue: 480,
    avgCpc: 7,
  },
  concrete_resurfacing: {
    label: "Concrete Resurfacing",
    keywords: ["concrete resurfacing", "concrete repair", "concrete restoration", "concrete refinishing"],
    avgLeadValue: 380,
    avgCpc: 5,
  },
};

// ── Keyword patterns ──
const PATTERNS = {
  near_me: { label: "Near Me", intent: "transactional", multiplier: 1.0, searchBoost: 1.0 },
  near_you: { label: "Near You", intent: "transactional", multiplier: 0.85, searchBoost: 0.7 },
  near_me_city: { label: "Near Me + City", intent: "transactional", multiplier: 0.9, searchBoost: 0.8 },
  city_state: { label: "City + State", intent: "transactional", multiplier: 0.75, searchBoost: 0.5 },
  cost: { label: "Cost / Price", intent: "informational", multiplier: 0.6, searchBoost: 0.9 },
  best: { label: "Best", intent: "comparison", multiplier: 0.5, searchBoost: 0.6 },
  affordable: { label: "Affordable", intent: "transactional", multiplier: 0.4, searchBoost: 0.4 },
  local: { label: "Local", intent: "transactional", multiplier: 0.65, searchBoost: 0.5 },
  pro: { label: "Pro", intent: "navigational", multiplier: 0.3, searchBoost: 0.3 },
};

// ── Generate domain strategies ──
function generateStrategies(niches, patterns, cities) {
  const strategies = [];
  for (const [nicheKey, niche] of Object.entries(NICHES)) {
    if (!niches.includes(nicheKey)) continue;
    for (const keyword of niche.keywords) {
      const slug = keyword.replace(/\s+/g, "");

      for (const [patternKey, pattern] of Object.entries(PATTERNS)) {
        if (!patterns.includes(patternKey)) continue;

        if (patternKey === "near_me") {
          const domain = `${slug}nearme.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(300 * pattern.searchBoost * niche.keywords.length / niche.keywords.length),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: pattern.multiplier > 0.8 ? "high" : pattern.multiplier > 0.5 ? "medium" : "low",
            status: "idea",
          });
        }

        if (patternKey === "near_you") {
          const domain = `${slug}nearyou.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(250 * pattern.searchBoost),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: "medium",
            status: "idea",
          });
        }

        if (patternKey === "cost") {
          const domain = `${slug}cost.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(500 * pattern.searchBoost),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: "medium",
            status: "idea",
          });
        }

        if (patternKey === "best") {
          const domain = `best${slug}.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(200 * pattern.searchBoost),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: "low",
            status: "idea",
          });
        }

        if (patternKey === "affordable") {
          const domain = `affordable${slug}.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(150 * pattern.searchBoost),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: "low",
            status: "idea",
          });
        }

        if (patternKey === "local") {
          const domain = `local${slug}.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(180 * pattern.searchBoost),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: "low",
            status: "idea",
          });
        }

        if (patternKey === "pro") {
          const domain = `${slug}pro.com`;
          strategies.push({
            domain,
            niche: nicheKey,
            keyword_pattern: patternKey,
            target_city: null,
            target_state: null,
            search_intent: pattern.intent,
            estimated_monthly_searches: Math.round(120 * pattern.searchBoost),
            estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
            lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
            competition_level: "low",
            status: "idea",
          });
        }

        // City-specific domains
        if ((patternKey === "near_me_city" || patternKey === "city_state") && cities.length > 0) {
          for (const city of cities) {
            const citySlug = city.city.toLowerCase().replace(/[^a-z0-9]/g, "");
            const stateSlug = city.state.toLowerCase();
            let domain;
            if (patternKey === "near_me_city") {
              domain = `${slug}${citySlug}nearme.com`;
            } else {
              domain = `${slug}${citySlug}${stateSlug}.com`;
            }
            strategies.push({
              domain,
              niche: nicheKey,
              keyword_pattern: patternKey,
              target_city: city.city,
              target_state: city.state,
              search_intent: pattern.intent,
              estimated_monthly_searches: Math.round(80 * pattern.searchBoost),
              estimated_cpc: Math.round(niche.avgCpc * pattern.multiplier * 100) / 100,
              lead_value_estimate: Math.round(niche.avgLeadValue * pattern.multiplier),
              competition_level: pattern.multiplier > 0.8 ? "medium" : "low",
              status: "idea",
            });
          }
        }
      }
    }
  }

  // Deduplicate by domain
  const seen = new Set();
  return strategies.filter((s) => {
    if (seen.has(s.domain)) return false;
    seen.add(s.domain);
    return true;
  });
}

const STATUS_COLORS = {
  idea: "bg-stone-100 text-stone-600",
  researching: "bg-blue-100 text-blue-600",
  available: "bg-green-100 text-green-600",
  purchased: "bg-purple-100 text-purple-600",
  provisioning: "bg-amber-100 text-amber-600",
  provisioned: "bg-indigo-100 text-indigo-600",
  live: "bg-emerald-100 text-emerald-600",
  archived: "bg-stone-100 text-stone-400",
};

const NICHE_COLORS = {
  epoxy_garage: "bg-amber-100 text-amber-700",
  decorative_concrete: "bg-stone-200 text-stone-700",
  polished_concrete: "bg-blue-100 text-blue-700",
  epoxy_flooring: "bg-orange-100 text-orange-700",
  garage_coating: "bg-yellow-100 text-yellow-700",
  concrete_resurfacing: "bg-gray-100 text-gray-700",
};

export default function UrlStrategy() {
  const queryClient = useQueryClient();
  const [selectedNiches, setSelectedNiches] = useState(["epoxy_garage", "polished_concrete", "decorative_concrete"]);
  const [selectedPatterns, setSelectedPatterns] = useState(["near_me", "near_you", "cost", "city_state"]);
  const [cities, setCities] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNiche, setFilterNiche] = useState("all");
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ["domainStrategies"],
    queryFn: async () => {
      const res = await base44.entities.DomainStrategy.list("-created_date", 500);
      return res;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (newStrategies) => {
      // Check which domains already exist
      const existingDomains = new Set(strategies.map((s) => s.domain));
      const toCreate = newStrategies.filter((s) => !existingDomains.has(s.domain));
      if (toCreate.length === 0) return { created: 0, skipped: newStrategies.length };
      const created = await base44.entities.DomainStrategy.bulkCreate(toCreate);
      return { created: created.length, skipped: newStrategies.length - created.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domainStrategies"] });
      setGenerating(false);
    },
    onError: () => setGenerating(false),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.DomainStrategy.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domainStrategies"] });
    },
  });

  const handleGenerate = () => {
    setGenerating(true);
    const cityList = cities
      .split("\n")
      .map((line) => {
        const parts = line.trim().split(",");
        return { city: parts[0]?.trim(), state: parts[1]?.trim() };
      })
      .filter((c) => c.city && c.state);
    const generated = generateStrategies(selectedNiches, selectedPatterns, cityList);
    generateMutation.mutate(generated);
  };

  const filtered = useMemo(() => {
    return strategies.filter((s) => {
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterNiche !== "all" && s.niche !== filterNiche) return false;
      if (search && !s.domain.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [strategies, filterStatus, filterNiche, search]);

  const stats = useMemo(() => {
    return {
      total: strategies.length,
      ideas: strategies.filter((s) => s.status === "idea").length,
      purchased: strategies.filter((s) => s.status === "purchased").length,
      live: strategies.filter((s) => s.status === "live").length,
      totalSearchVolume: strategies.reduce((sum, s) => sum + (s.estimated_monthly_searches || 0), 0),
      totalLeadValue: strategies.reduce((sum, s) => sum + (s.lead_value_estimate || 0), 0),
    };
  }, [strategies]);

  const toggleNiche = (key) => {
    setSelectedNiches((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };
  const togglePattern = (key) => {
    setSelectedPatterns((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">URL Strategy Generator</h1>
        <p className="text-stone-500 mt-1">Generate high-value domain strategies for epoxy, decorative concrete & polished concrete — "near me", "near you", and city-specific patterns.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard icon={Globe} label="Total Domains" value={stats.total} color="text-stone-700" />
        <StatCard icon={Zap} label="Ideas" value={stats.ideas} color="text-amber-600" />
        <StatCard icon={ShoppingCart} label="Purchased" value={stats.purchased} color="text-purple-600" />
        <StatCard icon={CheckCircle2} label="Live" value={stats.live} color="text-emerald-600" />
        <StatCard icon={TrendingUp} label="Mo. Searches" value={stats.totalSearchVolume.toLocaleString()} color="text-blue-600" />
        <StatCard icon={DollarSign} label="Lead Value" value={`$${(stats.totalLeadValue / 1000).toFixed(0)}k`} color="text-green-600" />
      </div>

      {/* Generator Panel */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2"><Plus className="h-4 w-4 text-amber-500" /> Generate New Strategies</h2>

        {/* Niche selection */}
        <div>
          <label className="text-xs font-bold tracking-wide text-stone-500 uppercase">Niches</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(NICHES).map(([key, n]) => (
              <button
                key={key}
                onClick={() => toggleNiche(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedNiches.includes(key) ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern selection */}
        <div>
          <label className="text-xs font-bold tracking-wide text-stone-500 uppercase">Keyword Patterns</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(PATTERNS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => togglePattern(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedPatterns.includes(key) ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div>
          <label className="text-xs font-bold tracking-wide text-stone-500 uppercase">Cities (one per line: City, ST)</label>
          <textarea
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder={"Orlando, FL\nTampa, FL\nAtlanta, GA\nDallas, TX"}
            className="w-full mt-2 h-20 px-3 py-2 text-sm border border-stone-200 rounded-lg resize-none focus:border-amber-500 outline-none"
          />
          <p className="text-xs text-stone-400 mt-1">Only used for city-specific patterns</p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || (selectedNiches.length === 0 && selectedPatterns.length === 0)}
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
        >
          {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Plus className="h-4 w-4 mr-2" /> Generate Strategies</>}
        </Button>
        {generateMutation.data && (
          <p className="text-sm text-emerald-600 font-medium">
            Created {generateMutation.data.created} new strategies{generateMutation.data.skipped > 0 ? ` (${generateMutation.data.skipped} already existed)` : ""}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search domains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <select value={filterNiche} onChange={(e) => setFilterNiche(e.target.value)} className="h-10 px-3 border border-stone-200 rounded-lg text-sm bg-white">
          <option value="all">All Niches</option>
          {Object.entries(NICHES).map(([k, n]) => <option key={k} value={k}>{n.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 px-3 border border-stone-200 rounded-lg text-sm bg-white">
          <option value="all">All Status</option>
          <option value="idea">Idea</option>
          <option value="researching">Researching</option>
          <option value="available">Available</option>
          <option value="purchased">Purchased</option>
          <option value="provisioned">Provisioned</option>
          <option value="live">Live</option>
        </select>
        <span className="text-sm text-stone-500 flex items-center gap-1"><Filter className="h-4 w-4" /> {filtered.length} domains</span>
      </div>

      {/* Domain list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-stone-400" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 100).map((s) => (
            <DomainRow key={s.id} strategy={s} onUpdate={updateMutation.mutate} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No domains yet. Generate strategies above to get started.</p>
            </div>
          )}
          {filtered.length > 100 && (
            <p className="text-center text-sm text-stone-400 py-2">Showing first 100 of {filtered.length} domains</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}

function DomainRow({ strategy, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = (newStatus) => {
    setUpdating(true);
    onUpdate({ id: strategy.id, data: { status: newStatus } });
    setUpdating(false);
  };

  const godaddyUrl = `https://www.godaddy.com/domainsearch/find.aspx?domainToCheck=${strategy.domain}`;

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-3 flex items-center gap-3 hover:border-stone-300 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-semibold text-stone-900 truncate">{strategy.domain}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[strategy.status] || "bg-stone-100"}`}>{strategy.status}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NICHE_COLORS[strategy.niche] || "bg-stone-100"}`}>{NICHES[strategy.niche]?.label || strategy.niche}</span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-stone-500">
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {strategy.estimated_monthly_searches || 0}/mo</span>
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${strategy.estimated_cpc || 0} CPC</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {strategy.target_city || "National"}</span>
          <span>Lead: ${strategy.lead_value_estimate || 0}</span>
          <span className="capitalize">{PATTERNS[strategy.keyword_pattern]?.label || strategy.keyword_pattern}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {strategy.status === "idea" && (
          <a href={godaddyUrl} target="_blank" rel="noopener" className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" /> Check
          </a>
        )}
        {strategy.status === "purchased" && (
          <button
            onClick={() => handleStatusChange("provisioning")}
            className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
          >
            Provision
          </button>
        )}
        {strategy.status === "provisioned" && (
          <button
            onClick={() => handleStatusChange("live")}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
          >
            Go Live
          </button>
        )}
        {strategy.live_url && (
          <a href={strategy.live_url} target="_blank" rel="noopener" className="px-2 py-1.5 text-xs text-stone-400 hover:text-stone-700">
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <select
          value={strategy.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white"
        >
          <option value="idea">Idea</option>
          <option value="researching">Researching</option>
          <option value="available">Available</option>
          <option value="purchased">Purchased</option>
          <option value="provisioning">Provisioning</option>
          <option value="provisioned">Provisioned</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}