import React, { useState, useMemo } from "react";
import { UNIVERSAL_NICHES, NICHE_CATEGORIES, EMERGENCY_LEVELS, PSYCHOLOGY_PROFILES, getEmergencyStats } from "@/data/universalNiches";
import { Search, Flame, Siren, Square, Home, Wind, Droplet, Zap, Trees, Sparkles, Bug, Waves, Sun, Paintbrush, DoorOpen, Refrigerator, Car, HeartPulse, Scale, DollarSign, Shield, Building2, Wrench, TrendingUp, AlertTriangle } from "lucide-react";

const ICON_MAP = { Flame, Siren, Square, Home, Wind, Droplet, Zap, Trees, Sparkles, Bug, Waves, Sun, Paintbrush, DoorOpen, Refrigerator, Car, HeartPulse, Scale, DollarSign, Shield, Building2, Wrench };

const EMERGENCY_COLORS = {
  CRITICAL: "bg-red-50 border-red-200 text-red-700",
  HIGH: "bg-orange-50 border-orange-200 text-orange-700",
  MEDIUM: "bg-amber-50 border-amber-200 text-amber-700",
  ROUTINE: "bg-blue-50 border-blue-200 text-blue-700",
};

export default function NicheRegistry({ onSelectNiche }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeEmergency, setActiveEmergency] = useState("all");
  const stats = useMemo(() => getEmergencyStats(), []);

  const filtered = useMemo(() => {
    return UNIVERSAL_NICHES.filter((n) => {
      if (activeCategory !== "all" && n.category !== activeCategory) return false;
      if (activeEmergency !== "all" && n.emergency !== activeEmergency) return false;
      if (search && !n.label.toLowerCase().includes(search.toLowerCase()) && !n.keyword.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, activeCategory, activeEmergency]);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(EMERGENCY_LEVELS).map(([level, info]) => (
          <div key={level} className={`rounded-xl border p-4 ${EMERGENCY_COLORS[level]}`}>
            <div className="flex items-center gap-2">
              {level === "CRITICAL" && <AlertTriangle className="h-5 w-5" />}
              <div className="text-2xl font-black">{stats[level] || 0}</div>
            </div>
            <div className="text-xs font-semibold mt-0.5">{info.label}</div>
            <div className="text-[10px] opacity-75 mt-0.5">{info.desc}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 200+ niches by name or keyword..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${activeCategory === "all" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}
          >
            All Categories
          </button>
          {NICHE_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Wrench;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${activeCategory === cat.id ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}
              >
                <Icon className="h-3 w-3" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Emergency filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveEmergency("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${activeEmergency === "all" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}
          >
            All Urgency Levels
          </button>
          {Object.entries(EMERGENCY_LEVELS).map(([level, info]) => (
            <button
              key={level}
              onClick={() => setActiveEmergency(level)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${activeEmergency === level ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">
          Showing <span className="font-bold text-stone-900">{filtered.length}</span> niches
        </p>
      </div>

      {/* Niche grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((niche) => {
          const emergencyInfo = EMERGENCY_LEVELS[niche.emergency];
          const psychInfo = PSYCHOLOGY_PROFILES[niche.psychology];
          return (
            <div
              key={niche.id}
              onClick={() => onSelectNiche?.(niche)}
              className="bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-300 hover:shadow-sm cursor-pointer transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm group-hover:text-amber-600 transition">{niche.label}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">"{niche.keyword}"</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${EMERGENCY_COLORS[niche.emergency]}`}>
                  {niche.emergency}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-500 mt-3">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> ${niche.avg_cpc}/click
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> ${niche.avg_order.toLocaleString()} avg order
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-stone-100">
                <p className="text-[10px] text-stone-400">{psychInfo?.label}: {psychInfo?.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}