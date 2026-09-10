import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Globe, CheckCircle2, XCircle, AlertTriangle, Clock, Zap, RefreshCw,
  ExternalLink, Activity, Shield, Heart, Activity as ActivityIcon,
  TrendingUp, Timer, Search, Filter, ChevronDown, ChevronRight,
  Wifi, WifiOff, Eye, Wrench, Sparkles
} from "lucide-react";

const PUBLISHED_URL = "https://epoxyquotenearme.com";
const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function liveUrlFor(t) {
  const city = t.config?.primary_city;
  const state = t.config?.primary_state;
  if (!city || !state) return null;
  return `${PUBLISHED_URL}/${slugify(state)}/${slugify(city)}`;
}

export default function SiteHealthMonitor() {
  const queryClient = useQueryClient();
  const [checking, setChecking] = useState(false);
  const [autoHeal, setAutoHeal] = useState(true);
  const [filter, setFilter] = useState("all"); // all | healthy | failing | unreachable
  const [search, setSearch] = useState("");
  const [expandedSite, setExpandedSite] = useState(null);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [healthResults, setHealthResults] = useState({});

  // Fetch all templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["siteHealth-templates"],
    queryFn: () => base44.entities.WebsiteTemplate.list("-created_date", 500),
    refetchInterval: 60000, // refresh template list every 60s
  });

  // Fetch recent swarm audits for site health
  const { data: audits } = useQuery({
    queryKey: ["siteHealth-audits"],
    queryFn: () => base44.entities.SwarmAudit.filter({ audit_type: "site_health" }, "-created_date", 100),
    refetchInterval: 30000,
  });

  // Fetch swarm tasks for auto-heal status
  const { data: healTasks } = useQuery({
    queryKey: ["siteHealth-healTasks"],
    queryFn: () => base44.entities.SwarmTask.filter({ task_type: "site_deploy" }, "-created_date", 50),
    refetchInterval: 15000,
  });

  // Run health check
  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke("siteHealthChecker", { action: "checkAll", autoHeal });
      const data = res.data || res;
      const resultsMap = {};
      (data.results || []).forEach((r) => {
        resultsMap[r.templateId] = r;
      });
      setHealthResults(resultsMap);
      setLastCheckTime(new Date().toLocaleTimeString());
      queryClient.invalidateQueries({ queryKey: ["siteHealth-audits"] });
      queryClient.invalidateQueries({ queryKey: ["siteHealth-healTasks"] });
    } catch (e) {
      console.error("Health check failed:", e);
    }
    setChecking(false);
  }, [autoHeal, queryClient]);

  // Auto-run on mount and every 2 minutes
  useEffect(() => {
    runHealthCheck();
    const interval = setInterval(runHealthCheck, 120000);
    return () => clearInterval(interval);
  }, [runHealthCheck]);

  // Build combined site list with health data
  const sites = useMemo(() => {
    const tList = templates || [];
    return tList
      .filter((t) => t.status === "live" || t.status === "configured")
      .map((t) => {
        const url = liveUrlFor(t);
        const health = healthResults[t.id] || null;
        const healTask = (healTasks || []).find((task) => task.payload?.template_id === t.id);
        const siteAudits = (audits || []).filter((a) => a.affected_entity_id === t.id);
        return {
          ...t,
          liveUrl: url,
          health,
          healTask,
          hasOpenAudits: siteAudits.some((a) => a.status === "open" || a.status === "auto_fixing"),
          recentAudits: siteAudits.slice(0, 3),
        };
      });
  }, [templates, healthResults, healTasks, audits]);

  // Filtered sites
  const filteredSites = useMemo(() => {
    let result = sites;
    if (filter === "healthy") result = result.filter((s) => s.health?.ok === true);
    else if (filter === "failing") result = result.filter((s) => s.health && !s.health.ok && s.health.status === "failing");
    else if (filter === "unreachable") result = result.filter((s) => s.health && !s.health.ok && s.health.status === "unreachable");
    else if (filter === "unchecked") result = result.filter((s) => !s.health);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.name?.toLowerCase().includes(q) ||
        s.config?.primary_city?.toLowerCase().includes(q) ||
        s.config?.primary_state?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sites, filter, search]);

  // Summary stats
  const stats = useMemo(() => {
    const checked = sites.filter((s) => s.health);
    return {
      total: sites.length,
      checked: checked.length,
      healthy: checked.filter((s) => s.health.ok).length,
      failing: checked.filter((s) => !s.health.ok && s.health.status === "failing").length,
      unreachable: checked.filter((s) => !s.health.ok && s.health.status === "unreachable").length,
      unchecked: sites.length - checked.length,
      avgResponse: checked.filter((s) => s.health.responseTimeMs).length
        ? Math.round(checked.reduce((sum, s) => sum + (s.health.responseTimeMs || 0), 0) / checked.filter((s) => s.health.responseTimeMs).length)
        : 0,
      healing: (healTasks || []).filter((t) => t.status === "pending" || t.status === "in_progress" || t.status === "claimed").length,
    };
  }, [sites, healTasks]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-5 text-white border border-amber-500/20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center shrink-0">
              <Heart className="h-6 w-6 text-stone-950" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Site Health Monitor</h1>
              <p className="text-stone-400 text-sm">Real-time liveness, reachability & auto-heal for every site</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-heal toggle */}
            <button
              onClick={() => setAutoHeal(!autoHeal)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border transition ${
                autoHeal
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : "bg-stone-800 border-stone-700 text-stone-400"
              }`}
            >
              <Wrench className="h-4 w-4" />
              {autoHeal ? "Auto-Heal ON" : "Auto-Heal OFF"}
            </button>
            {/* Manual check button */}
            <button
              onClick={runHealthCheck}
              disabled={checking}
              className="flex items-center gap-2 rounded-lg bg-amber-500 text-stone-950 px-4 py-2 text-sm font-bold hover:bg-amber-400 transition disabled:opacity-50"
            >
              {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {checking ? "Checking..." : "Run Health Check"}
            </button>
          </div>
        </div>
        {/* Live status bar */}
        <div className="flex items-center gap-4 mt-4 text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${checking ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            {checking ? "Checking all sites..." : lastCheckTime ? `Last checked: ${lastCheckTime}` : "Not yet checked"}
          </span>
          <span className="flex items-center gap-1.5">
            <Timer className="h-3 w-3" /> Auto-refresh: every 2 min
          </span>
          {stats.healing > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <Wrench className="h-3 w-3 animate-pulse" /> {stats.healing} site(s) auto-healing
            </span>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatTile icon={Globe} label="Total Sites" value={stats.total} tone="stone" />
        <StatTile icon={CheckCircle2} label="Healthy" value={stats.healthy} tone="green" />
        <StatTile icon={AlertTriangle} label="Failing" value={stats.failing} tone="amber" />
        <StatTile icon={WifiOff} label="Unreachable" value={stats.unreachable} tone="red" />
        <StatTile icon={Clock} label="Unchecked" value={stats.unchecked} tone="blue" />
        <StatTile icon={Timer} label="Avg Response" value={`${stats.avgResponse}ms`} tone="purple" />
        <StatTile icon={Wrench} label="Auto-Healing" value={stats.healing} tone="amber" />
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1">
          {[
            { key: "all", label: "All", icon: Globe },
            { key: "healthy", label: "Healthy", icon: CheckCircle2 },
            { key: "failing", label: "Failing", icon: AlertTriangle },
            { key: "unreachable", label: "Unreachable", icon: WifiOff },
            { key: "unchecked", label: "Unchecked", icon: Clock },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                filter === f.key ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, state, or name..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Site grid */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No sites match this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                expanded={expandedSite === site.id}
                onToggle={() => setExpandedSite(expandedSite === site.id ? null : site.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SiteCard({ site, expanded, onToggle }) {
  const health = site.health;
  const isHealthy = health?.ok === true;
  const isFailing = health && !health.ok && health.status === "failing";
  const isUnreachable = health && !health.ok && health.status === "unreachable";
  const isUnchecked = !health;
  const isHealing = site.healTask && ["pending", "claimed", "in_progress"].includes(site.healTask.status);

  const statusConfig = {
    healthy: { color: "border-green-200 bg-green-50", badge: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Healthy" },
    failing: { color: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle, label: "Failing" },
    unreachable: { color: "border-red-200 bg-red-50", badge: "bg-red-100 text-red-700", icon: WifiOff, label: "Unreachable" },
    unchecked: { color: "border-stone-200 bg-stone-50", badge: "bg-stone-100 text-stone-500", icon: Clock, label: "Unchecked" },
  };

  const cfg = isHealthy ? statusConfig.healthy
    : isFailing ? statusConfig.failing
    : isUnreachable ? statusConfig.unreachable
    : statusConfig.unchecked;
  const StatusIcon = cfg.icon;

  return (
    <div className={`rounded-xl border p-3 transition ${cfg.color}`}>
      {/* Top row */}
      <div className="flex items-start gap-2 mb-2">
        {site.config?.hero_image_url ? (
          <img src={site.config.hero_image_url} alt="logo" className="h-8 w-8 object-contain rounded bg-white shrink-0" />
        ) : (
          <div className="h-8 w-8 rounded bg-stone-200 grid place-items-center text-stone-400 text-[8px] shrink-0">LOGO</div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-stone-900 truncate">{site.name}</div>
          <div className="text-[11px] text-stone-500 truncate">
            {site.config?.primary_city || "—"}, {site.config?.primary_state || "—"}
          </div>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${cfg.badge}`}>
          <StatusIcon className="h-2.5 w-2.5 inline mr-0.5" />
          {cfg.label}
        </span>
      </div>

      {/* Health metrics */}
      {health && (
        <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2">
          <div className="rounded bg-white/60 px-2 py-1">
            <span className="text-stone-400">HTTP:</span>{" "}
            <span className={`font-bold ${health.httpStatus >= 200 && health.httpStatus < 400 ? "text-green-600" : "text-red-600"}`}>
              {health.httpStatus || "—"}
            </span>
          </div>
          <div className="rounded bg-white/60 px-2 py-1">
            <span className="text-stone-400">Time:</span>{" "}
            <span className={`font-bold ${health.responseTimeMs < 2000 ? "text-green-600" : health.responseTimeMs < 5000 ? "text-amber-600" : "text-red-600"}`}>
              {health.responseTimeMs}ms
            </span>
          </div>
        </div>
      )}

      {/* Content checks */}
      {health && !isUnchecked && (
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {["title", "hero", "contact", "estimator"].map((check) => {
            const passed = health.contentChecks?.[check];
            return (
              <span
                key={check}
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                  passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                {passed ? "✓" : "✕"} {check}
              </span>
            );
          })}
        </div>
      )}

      {/* Error message */}
      {health?.error && (
        <div className="text-[10px] text-red-600 bg-red-50 rounded px-2 py-1 mb-2 truncate">
          {health.error}
        </div>
      )}

      {/* Auto-heal status */}
      {isHealing && (
        <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-100 rounded px-2 py-1 mb-2">
          <Wrench className="h-3 w-3 animate-pulse" />
          Auto-healing: {site.healTask.status}...
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-2">
        {site.liveUrl && (
          <a
            href={site.liveUrl}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1 text-[11px] text-amber-600 hover:underline font-semibold"
          >
            <ExternalLink className="h-3 w-3" /> Visit Site
          </a>
        )}
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-700 font-semibold ml-auto"
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          Details
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-stone-200 space-y-2">
          {site.liveUrl && (
            <div className="text-[10px] text-stone-500 break-all">
              <span className="font-bold">URL:</span> {site.liveUrl}
            </div>
          )}
          {health?.redirectUrl && (
            <div className="text-[10px] text-stone-500 break-all">
              <span className="font-bold">Redirect:</span> {health.redirectUrl}
            </div>
          )}
          {site.recentAudits?.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-stone-400 uppercase">Recent Audits</div>
              {site.recentAudits.map((a) => (
                <div key={a.id} className="text-[10px] text-stone-600 bg-stone-50 rounded px-2 py-1">
                  <span className={`font-bold ${a.status === "fixed" ? "text-green-600" : a.status === "open" ? "text-amber-600" : "text-stone-500"}`}>
                    {a.status}
                  </span>
                  {" — "}
                  {a.finding}
                </div>
              ))}
            </div>
          )}
          {site.healTask && (
            <div className="text-[10px] bg-amber-50 rounded px-2 py-1">
              <span className="font-bold text-amber-700">Heal Task:</span>{" "}
              <span className="text-amber-600">{site.healTask.title}</span>
              <div className="text-stone-500 mt-0.5">Status: {site.healTask.status}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tone }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    stone: "border-stone-200 bg-stone-50 text-stone-700",
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone] || tones.stone}`}>
      <Icon className="h-4 w-4 mb-1.5 opacity-80" />
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}