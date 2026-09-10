import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Users, Eye, MousePointerClick, TrendingUp, Loader2, Globe } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

const DATE_RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const fmtDate = (d) => {
  const s = String(d);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};
const fmtShort = (d) => {
  const s = String(d);
  return `${s.slice(4, 6)}/${s.slice(6, 8)}`;
};

export default function AnalyticsDashboard() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [pages, setPages] = useState([]);
  const [estimatorDaily, setEstimatorDaily] = useState([]);
  const [trafficDaily, setTrafficDaily] = useState([]);
  const [error, setError] = useState("");

  const loadProperties = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("googleAnalytics", { action: "listProperties" });
      const props = res.data?.properties || [];
      setProperties(props);
      if (props.length > 0 && !selectedProperty) {
        setSelectedProperty(props[0].property_id);
      }
    } catch (err) {
      setError("Could not load Google Analytics properties. Make sure your GA account is connected.");
      console.error(err);
    }
  }, [selectedProperty]);

  const loadData = useCallback(async () => {
    if (!selectedProperty) return;
    setLoading(true);
    setError("");
    try {
      const [ov, pg, est, traf] = await Promise.all([
        base44.functions.invoke("googleAnalytics", { action: "getOverview", property_id: selectedProperty, days }),
        base44.functions.invoke("googleAnalytics", { action: "getTrafficByPage", property_id: selectedProperty, days }),
        base44.functions.invoke("googleAnalytics", { action: "getDailyEstimatorUsage", property_id: selectedProperty, days }),
        base44.functions.invoke("googleAnalytics", { action: "getDailyTraffic", property_id: selectedProperty, days }),
      ]);
      setOverview(ov.data?.overview || null);
      setPages(pg.data?.pages || []);
      setEstimatorDaily((est.data?.daily || []).map((d) => ({ ...d, date: fmtShort(d.date) })));
      setTrafficDaily((traf.data?.daily || []).map((d) => ({ ...d, date: fmtShort(d.date) })));
    } catch (err) {
      setError("Could not load analytics data. " + (err?.message || ""));
      console.error(err);
    }
    setLoading(false);
  }, [selectedProperty, days]);

  useEffect(() => { loadProperties(); }, [loadProperties]);
  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-7 w-7 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Google Analytics</h1>
          <p className="text-sm text-stone-500">Track which sites get the most traffic and how many people use the estimator each day.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {properties.length > 0 && (
          <select
            value={selectedProperty || ""}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700"
          >
            {properties.map((p) => (
              <option key={p.property_id} value={p.property_id}>
                {p.display_name} ({p.account})
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-1 rounded-lg border border-stone-300 bg-white p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                days === r.days ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          {/* Overview cards */}
          {overview && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={MousePointerClick} label="Sessions" value={overview.sessions?.toLocaleString()} />
              <StatCard icon={Users} label="Users" value={overview.users?.toLocaleString()} />
              <StatCard icon={Eye} label="Page Views" value={overview.page_views?.toLocaleString()} />
              <StatCard icon={TrendingUp} label="New Users" value={overview.new_users?.toLocaleString()} />
            </div>
          )}

          {/* Daily estimator usage — the centerpiece */}
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-1">Estimator Usage (Daily)</h2>
            <p className="text-sm text-stone-500 mb-4">
              How many people are using your estimator / funnel each day
            </p>
            {estimatorDaily.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                No estimator traffic detected in this period. Make sure your GA tracking is installed on /estimate and /funnel pages.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={estimatorDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }} />
                  <Line type="monotone" dataKey="page_views" stroke="#D4AF37" strokeWidth={2.5} dot={{ r: 3 }} name="Page Views" />
                  <Line type="monotone" dataKey="sessions" stroke="#0f766e" strokeWidth={2} dot={false} name="Sessions" />
                  <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2} dot={false} name="Users" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily overall traffic */}
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Daily Traffic (All Pages)</h2>
            {trafficDaily.length === 0 ? (
              <div className="py-12 text-center text-stone-400">No traffic data for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trafficDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }} />
                  <Line type="monotone" dataKey="sessions" stroke="#0f766e" strokeWidth={2.5} dot={false} name="Sessions" />
                  <Line type="monotone" dataKey="page_views" stroke="#D4AF37" strokeWidth={2} dot={false} name="Page Views" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Traffic by page — which sites get the most traffic */}
          <div className="rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-1">Traffic by Page</h2>
            <p className="text-sm text-stone-500 mb-4">Which of your sites and pages are getting the most traffic</p>
            {pages.length === 0 ? (
              <div className="py-12 text-center text-stone-400">No page traffic data for this period.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-500">
                      <th className="pb-2 pr-4">Page</th>
                      <th className="pb-2 pr-4 text-right">Views</th>
                      <th className="pb-2 pr-4 text-right">Sessions</th>
                      <th className="pb-2 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.slice(0, 25).map((p, i) => (
                      <tr key={i} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-2.5 pr-4">
                          <span className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            <span className="font-mono text-stone-700 truncate max-w-xs">{p.path}</span>
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-semibold text-stone-900">{p.page_views.toLocaleString()}</td>
                        <td className="py-2.5 pr-4 text-right text-stone-600">{p.sessions.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-stone-600">{p.users.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 text-stone-500 mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
    </div>
  );
}