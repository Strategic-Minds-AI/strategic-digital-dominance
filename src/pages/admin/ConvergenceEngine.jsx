import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, RefreshCw, Shield, CheckCircle2, XCircle, RotateCw } from "lucide-react";

const STATE_COLORS = {
  VERIFIED_100: "text-green-700 bg-green-50",
  PRESERVATION: "text-green-700 bg-green-50",
  COMPLETION_SPRINT: "text-amber-600 bg-amber-50",
  DEGRADED: "text-amber-600 bg-amber-50",
  VALIDATING: "text-blue-600 bg-blue-50",
  DISCOVERING: "text-blue-600 bg-blue-50",
  BASELINED: "text-stone-600 bg-stone-100",
  UNDISCOVERED: "text-stone-400 bg-stone-100",
  BLOCKED_PROTECTED: "text-red-600 bg-red-50",
  BLOCKED_EXTERNAL: "text-red-600 bg-red-50",
};

function ScoreRing({ score, verified, spinning }) {
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
        {spinning ? (
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        ) : (
          <>
            <span className="text-4xl font-black text-stone-900">{score}</span>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">/ 100</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConvergenceEngine() {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [lastCycle, setLastCycle] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const stopRef = useRef(false);

  const loadScorecard = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("convergenceEngine", { action: "scorecard", system_id: "epoxyquotenearme" });
      const data = res.data || res;
      setScorecard(data);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  useEffect(() => { (async () => { await loadScorecard(); setLoading(false); })(); }, [loadScorecard]);

  const runOneCycle = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("convergenceEngine", { action: "cycle", system_id: "epoxyquotenearme" });
      const data = res.data || res;
      setLastCycle(data);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  // Recursive auto-retry: keeps running cycles until VERIFIED_100 or stopped
  const runUntilVerified = useCallback(async (attemptNum = 1) => {
    setAttempt(attemptNum);
    const result = await runOneCycle();
    if (!result) { setAutoRetrying(false); setRunning(false); return; }

    await loadScorecard();

    if (stopRef.current) { setAutoRetrying(false); setRunning(false); return; }

    if (result.verified_100) {
      setAutoRetrying(false);
      setRunning(false);
      return;
    }

    // Not at 100 — try again automatically
    if (!stopRef.current) {
      setAutoRetrying(true);
      setTimeout(() => runUntilVerified(attemptNum + 1), 1500);
    }
  }, [runOneCycle, loadScorecard]);

  const handleRun = useCallback(() => {
    setError("");
    setLastCycle(null);
    setRunning(true);
    stopRef.current = false;
    runUntilVerified(1);
  }, [runUntilVerified]);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    setAutoRetrying(false);
    setRunning(false);
  }, []);

  const sc = scorecard?.scorecard || {};
  const score = sc.score ?? scorecard?.final_score ?? 0;
  const verified = sc.verified_100 ?? scorecard?.verified_100 ?? false;
  const stateLabel = verified ? "VERIFIED_100" : score >= 80 ? "COMPLETION_SPRINT" : score > 0 ? "DEGRADED" : "UNDISCOVERED";
  const phases = lastCycle?.phases || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-black text-stone-900 flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-amber-500" />
          Convergence Engine
        </h1>
        <p className="text-sm text-stone-500 mt-1">One button. Runs until VERIFIED_100. Auto-retries if not there yet.</p>
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
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          ) : (
            <>
              <ScoreRing score={score} verified={verified} spinning={running} />

              {/* State badge */}
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${STATE_COLORS[stateLabel] || "text-stone-500 bg-stone-100"}`}>
                {stateLabel.replace(/_/g, " ")}
              </div>

              {/* Attempt counter when auto-retrying */}
              {autoRetrying && (
                <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold">
                  <RotateCw className="h-4 w-4 animate-spin" />
                  Attempt #{attempt} — not at 100, retrying...
                </div>
              )}

              {/* Quick stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-black text-red-500">{sc.p0_count ?? 0}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">P0</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-500">{sc.p1_count ?? 0}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">P1</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-stone-700">{sc.distance_to_100 ?? 100 - score}</div>
                  <div className="text-xs text-stone-400 font-semibold uppercase">To 100</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* THE Button */}
        {!loading && (
          <button
            onClick={running ? handleStop : handleRun}
            className={`mt-8 w-full py-4 rounded-2xl text-white text-lg font-black transition shadow-lg flex items-center justify-center gap-3 ${
              running ? "bg-stone-700 hover:bg-stone-800" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {running ? (
              <><Loader2 className="h-6 w-6 animate-spin" /> Stop Convergence</>
            ) : (
              <><Shield className="h-6 w-6" /> Run Convergence</>
            )}
          </button>
        )}

        {/* Verified banner */}
        {verified && !running && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-700 font-bold">
            <CheckCircle2 className="h-5 w-5" />
            VERIFIED_100 — system is production ready
          </div>
        )}
      </div>

      {/* Last Cycle Results */}
      {lastCycle && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              {autoRetrying ? `Attempt #${attempt} Result` : "Last Cycle"}
            </h3>
            <div className="flex gap-4 text-sm">
              <span className="text-stone-500">Baseline: <span className="font-bold text-stone-700">{lastCycle.baseline_score}</span></span>
              <span className="text-stone-500">Final: <span className="font-bold text-stone-900">{lastCycle.final_score}</span></span>
              <span className="text-stone-500">Duration: <span className="font-bold text-stone-700">{((lastCycle.total_duration_ms || 0) / 1000).toFixed(1)}s</span></span>
            </div>
          </div>

          {/* Phase timeline */}
          <div className="space-y-1.5">
            {phases.map((phase, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm font-bold text-stone-700 w-36 shrink-0">{phase.phase}</span>
                {phase.score !== undefined && (
                  <span className="text-xs font-mono text-stone-500">score: {phase.score}</span>
                )}
                {phase.gaps !== undefined && (
                  <span className="text-xs font-mono text-stone-500">gaps: {phase.gaps}</span>
                )}
                {phase.verified !== undefined && (
                  phase.verified
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                    : <XCircle className="h-4 w-4 text-amber-400 ml-auto" />
                )}
              </div>
            ))}
          </div>

          {/* Next action */}
          {lastCycle.next_action && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-sm text-stone-600">
                <span className="font-semibold text-stone-800">Next: </span>{lastCycle.next_action}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Refresh */}
      {!loading && !running && (
        <div className="text-center">
          <button
            onClick={loadScorecard}
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