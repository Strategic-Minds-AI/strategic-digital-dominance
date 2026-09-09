import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Gauge, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Core Web Vitals widget — fetches live metrics from Google PageSpeed Insights
// via the fetchCoreWebVitals backend function. Admin-triggered to avoid rate
// limits. Shows LCP, CLS, FCP, TBT, Speed Index, and overall performance score.
export default function CwvWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState("mobile");

  const check = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("fetchCoreWebVitals", { strategy });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setData(d);
    } catch (e) {
      setError(e.message || "Failed to fetch Core Web Vitals");
    }
    setLoading(false);
  };

  const scoreColor = (score) => {
    if (score === null || score === undefined) return "text-stone-400";
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.5) return "text-amber-600";
    return "text-red-600";
  };

  const scoreBg = (score) => {
    if (score === null || score === undefined) return "bg-stone-50";
    if (score >= 0.9) return "bg-green-50";
    if (score >= 0.5) return "bg-amber-50";
    return "bg-red-50";
  };

  return (
    <div className="xa-electric-hover rounded-2xl bg-white p-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-semibold text-stone-900 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-amber-500" />
            Core Web Vitals
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Live performance metrics from Google PageSpeed Insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="rounded-md border border-stone-300 px-2 py-1 text-sm"
          >
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
          </select>
          <Button onClick={check} disabled={loading} size="sm" className="xa-electric-btn">
            {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
            Check
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {data && !error && (
        <>
          {/* Performance score */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full ${data.perfScore >= 90 ? "bg-green-50" : data.perfScore >= 50 ? "bg-amber-50" : "bg-red-50"}`}>
              <span className={`text-2xl font-bold ${data.perfScore >= 90 ? "text-green-600" : data.perfScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                {data.perfScore}
              </span>
              <span className="text-[10px] text-stone-500">/ 100</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">Performance Score</div>
              <div className="text-xs text-stone-500 capitalize">{data.strategy} · {data.url}</div>
              <div className="text-xs text-stone-400 mt-0.5">
                {data.perfScore >= 90 ? "Excellent — passing Core Web Vitals" : data.perfScore >= 50 ? "Needs improvement" : "Poor — fix critical issues"}
              </div>
            </div>
          </div>

          {/* Metric grid */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <Metric label="LCP" value={data.metrics.lcp} score={data.metrics.lcpScore} hint="Largest Contentful Paint" />
            <Metric label="CLS" value={data.metrics.cls} score={data.metrics.clsScore} hint="Cumulative Layout Shift" />
            <Metric label="FCP" value={data.metrics.fcp} score={data.metrics.fcpScore} hint="First Contentful Paint" />
            <Metric label="TBT" value={data.metrics.tbt} score={data.metrics.tbtScore} hint="Total Blocking Time" />
            <Metric label="Speed Index" value={data.metrics.si} score={data.metrics.siScore} hint="Speed Index" />
            <Metric label="TTI" value={data.metrics.tti} hint="Time to Interactive" />
          </div>

          <p className="mt-3 text-xs text-stone-400">
            Checked at {new Date(data.fetchedAt).toLocaleString()} · Google targets: LCP &lt; 2.5s, CLS &lt; 0.1, FCP &lt; 1.8s
          </p>
        </>
      )}

      {!data && !error && !loading && (
        <div className="mt-4 text-sm text-stone-400 text-center py-6">
          Click "Check" to fetch live Core Web Vitals from Google PageSpeed Insights.
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, score, hint }) {
  return (
    <div className={`xa-electric-hover rounded-lg p-3 ${score !== undefined ? (score >= 0.9 ? "bg-green-50" : score >= 0.5 ? "bg-amber-50" : "bg-red-50") : "bg-stone-50"}`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-lg font-bold text-stone-900 mt-0.5">{value}</div>
      <div className="text-[10px] text-stone-400 mt-0.5">{hint}</div>
    </div>
  );
}