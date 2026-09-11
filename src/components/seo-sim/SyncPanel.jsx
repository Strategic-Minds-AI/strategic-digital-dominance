import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, Globe, BarChart3, Facebook, CheckCircle2, XCircle, Download, Search, Upload, Link2 } from "lucide-react";

export default function SyncPanel({ keyword, url: propUrl, siteUrl: propSiteUrl, onApplyData }) {
  const [sitemapUrl, setSitemapUrl] = useState("/sitemap.xml");
  const [syncing, setSyncing] = useState(false);
  const [syncData, setSyncData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  const handleSyncAll = async () => {
    setSyncing(true);
    setActionResult(null);
    try {
      const res = await base44.functions.invoke("seoSimSync", {
        action: "syncAll",
        keyword,
        url: propUrl || undefined,
      });
      setSyncData(res.data);
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleAction = async (action, params = {}) => {
    setActionLoading(action);
    setActionResult(null);
    try {
      const res = await base44.functions.invoke("seoSimSync", { action, ...params });
      setActionResult({ action, data: res.data });
    } catch (e) {
      setActionResult({ action, error: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApply = () => {
    if (syncData?.module_updates && onApplyData) {
      onApplyData(syncData.module_updates);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-amber-500" />
            Live Account Sync
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Pull real data from all connected accounts in parallel — then apply it to the simulator.
          </p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {syncing ? "Syncing..." : "Sync All"}
        </button>
      </div>

      {/* URL inputs for actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Page URL</label>
          <input
            value={propUrl || ""}
            readOnly
            placeholder="Set in the Target URL field above"
            className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Sitemap Path</label>
          <input
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            placeholder="/sitemap.xml"
            className="w-full mt-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction("inspectUrl", { url: propUrl, siteUrl: propSiteUrl })}
          disabled={!propUrl || !propSiteUrl || actionLoading === "inspectUrl"}
          className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-200 disabled:opacity-40"
        >
          {actionLoading === "inspectUrl" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Inspect URL
        </button>
        <button
          onClick={() => handleAction("submitSitemap", { siteUrl: propSiteUrl, sitemapUrl })}
          disabled={!propSiteUrl || actionLoading === "submitSitemap"}
          className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-200 disabled:opacity-40"
        >
          {actionLoading === "submitSitemap" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Submit Sitemap
        </button>
      </div>

      {/* Action result */}
      {actionResult && (
        <div className={`p-3 rounded-lg border text-xs ${actionResult.error ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          {actionResult.error ? (
            <span>X {actionResult.action}: {actionResult.error}</span>
          ) : (
            <span><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />{actionResult.action} completed successfully</span>
          )}
        </div>
      )}

      {/* Sync results */}
      {syncData && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SyncCard
              icon={Globe}
              title="Google Search Console"
              data={syncData.google_search_console}
              render={(d) => (
                <div className="space-y-1 text-xs text-stone-600">
                  <p>Sites: {d.sites?.length || 0}</p>
                  {d.sites?.[0]?.keyword_rows?.[0] && (
                    <p>Keyword: {d.sites[0].keyword_rows[0].clicks} clicks, pos #{d.sites[0].keyword_rows[0].position}</p>
                  )}
                  {d.inspection && <p>Index: <span className="font-bold">{d.inspection.verdict}</span></p>}
                </div>
              )}
            />
            <SyncCard
              icon={BarChart3}
              title="Google Analytics"
              data={syncData.google_analytics}
              render={(d) => (
                <div className="space-y-1 text-xs text-stone-600">
                  <p>Properties: {d.properties?.length || 0}</p>
                  {d.metrics && (
                    <>
                      <p>Sessions: {d.metrics.sessions?.toLocaleString()}</p>
                      <p>Bounce: {d.metrics.bounce_rate}% · Engage: {d.metrics.engagement_rate}%</p>
                    </>
                  )}
                </div>
              )}
            />
            <SyncCard
              icon={Facebook}
              title="Facebook Pages"
              data={syncData.facebook_pages}
              render={(d) => (
                <div className="space-y-1 text-xs text-stone-600">
                  <p>Pages: {d.pages?.length || 0}</p>
                  {d.pages?.[0] && (
                    <>
                      <p>{d.pages[0].name}: {d.pages[0].posts_per_week}/wk</p>
                      <p>Engagement: {d.pages[0].engagement_rate}%</p>
                    </>
                  )}
                </div>
              )}
            />
          </div>

          {syncData.module_updates && Object.keys(syncData.module_updates).length > 0 && (
            <button
              onClick={handleApply}
              className="w-full px-4 py-2.5 rounded-lg bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-800"
            >
              <Download className="h-4 w-4" />
              Apply Live Data to Simulator
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SyncCard({ icon: Icon, title, data, render }) {
  const hasError = data?.error;
  const hasData = data && !data.error;

  return (
    <div className={`rounded-xl border p-3 ${hasError ? "bg-red-50 border-red-200" : hasData ? "bg-emerald-50 border-emerald-200" : "bg-stone-50 border-stone-200"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${hasError ? "text-red-500" : hasData ? "text-emerald-600" : "text-stone-400"}`} />
        <span className="text-xs font-bold text-stone-700">{title}</span>
        {hasError ? <XCircle className="h-3.5 w-3.5 text-red-500 ml-auto" /> : hasData && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-auto" />}
      </div>
      {hasError ? (
        <p className="text-xs text-red-600">{data.error}</p>
      ) : hasData ? (
        render(data)
      ) : (
        <p className="text-xs text-stone-400">No data</p>
      )}
    </div>
  );
}