import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Shield, Globe, Heart, AlertTriangle, CheckCircle2, Clock,
  Database, Activity, Zap,
} from "lucide-react";

export default function SourceTruthPanel() {
  const { data: registry } = useQuery({
    queryKey: ["canonicalSiteRegistry"],
    queryFn: async () => {
      const results = await base44.entities.CanonicalSiteRegistry.list(1);
      return results[0];
    },
    staleTime: 30000,
  });

  const { data: heartbeat } = useQuery({
    queryKey: ["alphaPrimeHeartbeat"],
    queryFn: async () => {
      const results = await base44.entities.AlphaPrimeHeartbeat.list("-created_date", 1);
      return results[0];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: locationData } = useQuery({
    queryKey: ["canonicalLocationCount"],
    queryFn: async () => {
      const results = await base44.entities.CanonicalLocationRegistry.list("-created_date", 500);
      const validated = results.filter(r => r.validation_status === "passed").length;
      return { total: results.length, validated };
    },
    staleTime: 60000,
  });

  const quarantine = registry?.data_quarantine;
  const healthScore = heartbeat?.health_score || 0;
  const healthColor = healthScore >= 80 ? "text-emerald-600" : healthScore >= 60 ? "text-lime-600" : healthScore >= 40 ? "text-amber-600" : "text-red-600";
  const healthBg = healthScore >= 80 ? "bg-emerald-50 border-emerald-200" : healthScore >= 60 ? "bg-lime-50 border-lime-200" : healthScore >= 40 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  // Derive open loops from entity fields (evidence-based, not decorative)
  const openLoops = [];
  if (registry?.data_quarantine) openLoops.push("Data quarantine active — revalidate SEO optimizers");
  if (heartbeat?.critical_findings_count > 0) openLoops.push(`${heartbeat.critical_findings_count} critical/high open findings`);
  if (heartbeat?.stale_tasks_count > 0) openLoops.push(`${heartbeat.stale_tasks_count} stale tasks (>24h)`);
  if (heartbeat?.source_drift_detected) openLoops.push("Source drift detected — entity counts mismatch");
  if (heartbeat?.sitemap_canonical_drift) openLoops.push("Sitemap/canonical drift detected");
  if (heartbeat?.smoke_checks_failed > 0) openLoops.push(`${heartbeat.smoke_checks_failed} smoke check failures`);

  const approvalItems = [];
  if (registry?.google_search_console_property === "UNKNOWN") approvalItems.push("Verify Google Search Console property at runtime");
  if (registry?.ga4_property_id === "UNKNOWN") approvalItems.push("Verify GA4 property ID at runtime");
  if (registry?.github_repository === "UNKNOWN") approvalItems.push("Verify GitHub repository connection");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-stone-900">Source Truth Authority</h2>
        <span className="text-xs text-stone-500 ml-auto">Evidence-based · Not decorative</span>
      </div>

      {/* Canonical Site Registry */}
      <div className={`rounded-xl border-2 p-4 ${quarantine ? "bg-red-50 border-red-300" : "bg-white border-stone-200"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-stone-600" />
            <span className="text-sm font-bold text-stone-900">Canonical Domain</span>
          </div>
          {quarantine ? (
            <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">
              <AlertTriangle className="h-3 w-3" /> DATA QUARANTINE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> ACTIVE
            </span>
          )}
        </div>
        <div className="text-lg font-bold text-stone-900">{registry?.canonical_domain || "UNKNOWN"}</div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div>
            <span className="text-stone-500">GSC:</span>{" "}
            <span className={registry?.google_search_console_property === "UNKNOWN" ? "text-red-600 font-bold" : "text-stone-700"}>
              {registry?.google_search_console_property || "UNKNOWN"}
            </span>
          </div>
          <div>
            <span className="text-stone-500">GA4:</span>{" "}
            <span className={registry?.ga4_property_id === "UNKNOWN" ? "text-red-600 font-bold" : "text-stone-700"}>
              {registry?.ga4_property_id || "UNKNOWN"}
            </span>
          </div>
          <div>
            <span className="text-stone-500">URL Pattern:</span>{" "}
            <span className="text-stone-700 font-mono">{registry?.preferred_url_pattern || "—"}</span>
          </div>
          <div>
            <span className="text-stone-500">Env:</span>{" "}
            <span className="text-stone-700">{registry?.active_environment || "—"}</span>
          </div>
        </div>
        {quarantine && (
          <div className="mt-2 p-2 rounded-lg bg-red-100 border border-red-300">
            <p className="text-xs text-red-700 font-medium">{registry?.quarantine_reason}</p>
          </div>
        )}
      </div>

      {/* Heartbeat + Location Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={`rounded-xl border-2 p-4 ${healthBg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-stone-600" />
            <span className="text-sm font-bold text-stone-900">Latest Heartbeat</span>
          </div>
          {heartbeat ? (
            <>
              <div className={`text-2xl font-extrabold ${healthColor}`}>{healthScore}/100</div>
              <div className="text-xs text-stone-500 mt-1 font-mono">{heartbeat.cycle_id?.slice(-25)}</div>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                <div><span className="text-stone-500">Smoke:</span> <span className="text-emerald-600">{heartbeat.smoke_checks_passed}✓</span> <span className="text-red-600">{heartbeat.smoke_checks_failed}✗</span></div>
                <div><span className="text-stone-500">Stale:</span> <span className="text-stone-700">{heartbeat.stale_tasks_count}</span></div>
                <div><span className="text-stone-500">Critical:</span> <span className="text-stone-700">{heartbeat.critical_findings_count}</span></div>
                <div><span className="text-stone-500">Drift:</span> <span className={heartbeat.source_drift_detected ? "text-red-600 font-bold" : "text-emerald-600"}>{heartbeat.source_drift_detected ? "YES" : "NONE"}</span></div>
              </div>
            </>
          ) : (
            <div className="text-sm text-stone-400">No heartbeat yet — run heartbeat to populate</div>
          )}
        </div>

        <div className="rounded-xl border-2 border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-stone-600" />
            <span className="text-sm font-bold text-stone-900">Location Registry</span>
          </div>
          {locationData ? (
            <>
              <div className="text-2xl font-extrabold text-stone-900">{locationData.total}</div>
              <div className="text-xs text-stone-500 mt-1">Approved canonical locations</div>
              <div className="mt-2 text-xs">
                <span className="text-stone-500">Validated:</span>{" "}
                <span className={locationData.validated > 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                  {locationData.validated} / {locationData.total}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-stone-400">Loading...</div>
          )}
        </div>
      </div>

      {/* Open Loops */}
      {openLoops.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Open Loops ({openLoops.length})</span>
          </div>
          <ul className="space-y-1">
            {openLoops.map((loop, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="text-amber-400">•</span> {loop}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Approval Items */}
      {approvalItems.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-800">Approval Items ({approvalItems.length})</span>
          </div>
          <ul className="space-y-1">
            {approvalItems.map((item, i) => (
              <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                <Zap className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}