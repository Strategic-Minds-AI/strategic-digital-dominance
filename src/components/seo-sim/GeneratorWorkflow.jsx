import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, CheckCircle2, XCircle, Clock, ChevronRight, Zap, Search, Upload, Bell, Send, Gauge, FileText, Sparkles, Radar } from "lucide-react";

const STEP_ICONS = {
  inspect_url: Search,
  submit_sitemap: Upload,
  ping_indexnow: Bell,
  submit_indexers: Send,
  fetch_cwv: Gauge,
  generate_sitemap: FileText,
  optimize_seo: Sparkles,
  scan_competitors: Radar,
};

export default function GeneratorWorkflow({ keyword, url, siteUrl, sitemapUrl }) {
  const [steps, setSteps] = useState([]);
  const [running, setRunning] = useState(false);
  const [runningStep, setRunningStep] = useState(null);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      const res = await base44.functions.invoke("seoSimSync", { action: "listSteps" });
      setSteps((res.data?.steps || []).map(s => ({ ...s, status: "pending" })));
    } catch (e) {
      console.error("Failed to load steps:", e);
    }
  };

  const handleRunAll = async () => {
    setRunning(true);
    setSteps(prev => prev.map(s => ({ ...s, status: "pending", result: null, error: null })));
    try {
      const res = await base44.functions.invoke("seoSimSync", {
        action: "generate",
        url,
        siteUrl,
        sitemapUrl,
        keyword,
      });
      if (res.data?.steps) {
        setSteps(res.data.steps);
      }
    } catch (e) {
      console.error("Generator error:", e);
    } finally {
      setRunning(false);
    }
  };

  const handleRunStep = async (stepId) => {
    setRunningStep(stepId);
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: "running" } : s));
    try {
      const res = await base44.functions.invoke("seoSimSync", {
        action: "runStep",
        step: stepId,
        url,
        siteUrl,
        sitemapUrl,
        keyword,
      });
      setSteps(prev => prev.map(s => s.id === stepId ? {
        ...s,
        status: res.data?.ok ? "completed" : "failed",
        result: res.data?.result,
        error: res.data?.error,
      } : s));
    } catch (e) {
      setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: "failed", error: e.message } : s));
    } finally {
      setRunningStep(null);
    }
  };

  const completed = steps.filter(s => s.status === "completed").length;
  const failed = steps.filter(s => s.status === "failed").length;
  const progress = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

  return (
    <div className="bg-stone-900 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Generator Workflow
          </h2>
          <p className="text-sm text-stone-400 mt-0.5">
            Sequential automation — run every optimization step in order with one click.
          </p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={running}
          className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Running..." : "Run All Steps"}
        </button>
      </div>

      {/* Progress bar */}
      {steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span>{completed} completed · {failed} failed · {steps.length - completed - failed} pending</span>
            <span className="font-bold text-amber-400">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[step.id] || ChevronRight;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                step.status === "running" ? "bg-amber-500/10 border-amber-500/40" :
                step.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" :
                step.status === "failed" ? "bg-red-500/10 border-red-500/30" :
                "bg-stone-950 border-stone-800"
              }`}
            >
              {/* Step number / status icon */}
              <div className="shrink-0 mt-0.5">
                {step.status === "running" ? (
                  <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                ) : step.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : step.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-stone-600 flex items-center justify-center text-xs font-bold text-stone-500">
                    {i + 1}
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-sm font-semibold text-stone-200">{step.title}</span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{step.description}</p>

                {/* Result */}
                {step.result && (
                  <div className="mt-2 p-2 rounded bg-stone-900 border border-stone-800 text-xs text-stone-400 max-h-24 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {typeof step.result === "string" ? step.result : JSON.stringify(step.result, null, 2).slice(0, 500)}
                    </pre>
                  </div>
                )}
                {step.error && (
                  <p className="text-xs text-red-400 mt-1">{step.error}</p>
                )}
              </div>

              {/* Individual run button */}
              <button
                onClick={() => handleRunStep(step.id)}
                disabled={running || runningStep === step.id || step.status === "running"}
                className="shrink-0 px-2 py-1 rounded text-xs font-semibold text-stone-400 hover:text-amber-400 hover:bg-stone-800 disabled:opacity-30 transition"
              >
                {step.status === "running" ? "..." : "Run"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Note about credits */}
      <p className="text-xs text-stone-500 flex items-center gap-1.5 pt-2 border-t border-stone-800">
        <Clock className="h-3.5 w-3.5" />
        Steps that use AI (Optimize SEO, Scan Competitors) require integration credits. Other steps use direct API calls and always work.
      </p>
    </div>
  );
}