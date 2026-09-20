import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, RefreshCw, Zap, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const STATE_COLORS = {
  UNDISCOVERED: "text-stone-400 bg-stone-100",
  DISCOVERING: "text-blue-600 bg-blue-50",
  BASELINED: "text-stone-600 bg-stone-100",
  DEGRADED: "text-amber-600 bg-amber-50",
  COMPLETION_SPRINT: "text-amber-600 bg-amber-50",
  VALIDATING: "text-blue-600 bg-blue-50",
  VERIFIED_100: "text-green-700 bg-green-50",
  PRESERVATION: "text-green-700 bg-green-50",
  BLOCKED_PROTECTED: "text-red-600 bg-red-50",
  BLOCKED_EXTERNAL: "text-red-600 bg-red-50",
  QUARANTINED: "text-red-600 bg-red-50",
};

const STEP_ICONS = {
  REGISTER: "📋",
  CONSTITUTE: "⚖️",
  BASELINE: "📏",
  GAP: "🔍",
  REPAIR: "🔧",
  VALIDATE: "✅",
  VERIFY: "🎯",
};

function ScoreRing({ score, verified }) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E4E4E7" strokeWidth="12" />
        <circle
          cx="80" cy="80" r={radius} fill="none"
          stroke={verified ? "#16A34A" : score >= 80 ? "#D97706" : score >= 50 ? "#F59E0B" : "#EF4444"}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-black text-stone-900">{score}</span>
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

export default function MetaAgent() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [lastRun, setLastRun] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("autoComplete", { action: "status" });
      setStatus(res.data || res);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setError("");
    setLastRun(null);
    try {
      const res = await base44.functions.invoke("autoComplete", { action: "cycle", system_id: "epoxyquotenearme" });
      const data = res.data || res;
      setLastRun(data);
      await loadStatus();
    } catch (e) {
      setError(e.message);
    }
    setRunning(false);
  }, [loadStatus]);

  const portfolio = status?.portfolio || {};
  const system = status?.systems?.find(s => s.system_id === "epoxyquotenearme") || status?.systems?.[0] || {};
  const score = system.score ?? portfolio.avg_score ?? 0;
  const verified = system.verified ?? false;
  const stateLabel = verified ? "VERIFIED_100" : score >= 80 ? "COMPLETION_SPRINT" : score > 0 ? "DEGRADED" : "UNDISCOVERED";

  const steps = lastRun?.results?.[0]?.steps || [];
  const lastResult = lastRun?.results?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-black text-stone-900 flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          Auto Convergence Engine
        </h1>
        <p className="text-sm text-stone-500 mt-1">One button. Full production readiness. VERIFIED_100.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Main Panel */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        {/* Score + Status */}
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          ) : (
            <>
              <ScoreRing score={score} verified={verified} />

              {/* State badge */}
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${STATE_COLORS[stateLabel] || "text-stone-500 bg-stone-100"}`}>
                {stateLabel.replace(/_/g, " ")}
              </div>

              {/* Quick stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-black text-red-500">{system.p0_count ?? 0}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">P0</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-500">{system.p1_count ?? 0}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">P1</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-stone-700">{system.passing_benchmarks ?? 0}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">Passing</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-stone-400">{system.failing_benchmarks ?? 0}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">Failing</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* THE Button */}
        {!loading && (
          <button
            onClick={handleRun}
            disabled={running}
            className="mt-8 w-full py-4 rounded-2xl bg-amber-500 text-white text-lg font-black hover:bg-amber-600 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-3"
          >
            {running ? (
              <><Loader2 className="h-6 w-6 animate-spin" /> Converging...</>
            ) : (
              <><Zap className="h-6 w-6" /> Run Auto Convergence</>
            )}
          </button>
        )}

        {/* Verified banner */}
        {verified && !running && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-700 font-bold">
            <CheckCircle2 className="h-5 w-5" />
            System reached VERIFIED_100 — production ready
          </div>
        )}
      </div>

      {/* Last Run Results */}
      {lastResult && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">Last Run</h3>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                {step.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <span className="text-sm font-bold text-stone-700 w-24">{step.step}</span>
                <span className="text-sm text-stone-400 truncate">{step.detail}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-sm">
            <span className="text-stone-500">Score: <span className="font-bold text-stone-900">{lastResult.weighted_score}</span></span>
            <span className={lastResult.verified_100 ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
              {lastResult.verified_100 ? "VERIFIED_100 ✓" : `${lastResult.open_gaps} gaps remain`}
            </span>
          </div>
        </div>
      )}

      {/* Refresh */}
      {!loading && !running && (
        <div className="text-center">
          <button
            onClick={loadStatus}
            className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Status
          </button>
        </div>
      )}
    </div>
  );
}