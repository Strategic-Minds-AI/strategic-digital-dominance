import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Loader2, AlertCircle, RefreshCw, History, Sparkles } from "lucide-react";
import GoalInput from "@/components/meta-agent/GoalInput";
import AnalysisResult from "@/components/meta-agent/AnalysisResult";
import WorkPacketList from "@/components/meta-agent/WorkPacketList";
import CapabilityMap from "@/components/meta-agent/CapabilityMap";
import ValidationCenter from "@/components/meta-agent/ValidationCenter";
import CommandCenter from "@/components/meta-agent/CommandCenter";
import ReadinessScore from "@/components/meta-agent/ReadinessScore";

export default function MetaAgent() {
  const [goal, setGoal] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [runningCmd, setRunningCmd] = useState(null);
  const [activeTab, setActiveTab] = useState("result");

  const loadSessions = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("metaAgent", { action: "list" });
      setSessions((res.data || res).sessions || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const loadSession = useCallback(async (sessionId) => {
    try {
      const res = await base44.functions.invoke("metaAgent", { action: "session", session_id: sessionId });
      const data = res.data || res;
      setSessionData(data);
      setAnalysis({
        summary: data.session.summary,
        architecture: data.session.recommended_architecture,
        intents: data.session.intent_types,
        system_types: data.session.system_types,
        matched_assets: data.session.matched_assets,
        capability_gaps: data.session.capability_gaps,
        work_packets: data.work_packets,
        readiness_score: data.session.readiness_score,
        next_action: data.session.next_action,
      });
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!goal.trim()) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    setSessionData(null);
    try {
      const res = await base44.functions.invoke("metaAgent", { action: "analyze", goal });
      const data = res.data || res;
      setAnalysis(data);
      await loadSession(data.session_id);
      await loadSessions();
    } catch (e) {
      setError(e.message || "Analysis failed");
    }
    setAnalyzing(false);
  }, [goal, loadSession, loadSessions]);

  const handleCommand = useCallback(async (cmd) => {
    if (!sessionData?.session?.session_id) return;
    setRunningCmd(cmd);
    try {
      await base44.functions.invoke("metaAgent", {
        action: "command",
        session_id: sessionData.session.session_id,
        command: cmd,
      });
      await loadSession(sessionData.session.session_id);
    } catch (e) {
      setError(e.message);
    }
    setRunningCmd(null);
  }, [sessionData, loadSession]);

  const handleApprove = useCallback(async (packetId, decision) => {
    try {
      await base44.functions.invoke("metaAgent", {
        action: "approve",
        work_packet_id: packetId,
        decision,
      });
      if (sessionData?.session?.session_id) {
        await loadSession(sessionData.session.session_id);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [sessionData, loadSession]);

  const handleValidate = useCallback(async () => {
    if (!sessionData?.session?.session_id) return;
    setRunningCmd("VALIDATE");
    try {
      await base44.functions.invoke("metaAgent", {
        action: "validate",
        session_id: sessionData.session.session_id,
      });
      await loadSession(sessionData.session.session_id);
    } catch (e) {
      setError(e.message);
    }
    setRunningCmd(null);
  }, [sessionData, loadSession]);

  const handleScore = useCallback(async () => {
    if (!sessionData?.session?.session_id) return;
    setRunningCmd("SCORE");
    try {
      await base44.functions.invoke("metaAgent", {
        action: "score",
        session_id: sessionData.session.session_id,
      });
      await loadSession(sessionData.session.session_id);
    } catch (e) {
      setError(e.message);
    }
    setRunningCmd(null);
  }, [sessionData, loadSession]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-amber-500" />
            Meta Agent
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Deterministic intent-to-work-packet intelligence router
          </p>
        </div>
        <button
          onClick={() => { setShowHistory(!showHistory); loadSessions(); }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-600 hover:border-amber-400 hover:text-amber-600 transition"
        >
          <History className="h-4 w-4" />
          {showHistory ? "Hide History" : "Session History"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Session History */}
      {showHistory && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Past Sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">No sessions yet</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => { loadSession(s.session_id); setShowHistory(false); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 border border-stone-100 text-left transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">{s.goal}</p>
                    <p className="text-xs text-stone-400">
                      {s.status} · {(s.intent_types || []).join(", ")} · {s.work_packet_ids?.length || 0} packets
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goal Input */}
      <GoalInput goal={goal} setGoal={setGoal} onSubmit={handleAnalyze} loading={analyzing} />

      {/* Loading State */}
      {analyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
          <p className="text-sm text-stone-500">Analyzing goal, searching Arsenal, detecting gaps, generating work packets...</p>
        </div>
      )}

      {/* Results */}
      {analysis && !analyzing && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-stone-200">
            {["result", "packets", "capabilities", "validation", "commands"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition capitalize ${
                  activeTab === tab
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {tab === "result" && "Analysis"}
                {tab === "packets" && "Work Packets"}
                {tab === "capabilities" && "Capability Map"}
                {tab === "validation" && "Validation"}
                {tab === "commands" && "Commands"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "result" && (
            <div className="space-y-4">
              <AnalysisResult result={analysis} />
              <ReadinessScore score={analysis.readiness_score} />
            </div>
          )}

          {activeTab === "packets" && (
            <WorkPacketList
              packets={sessionData?.work_packets || analysis.work_packets || []}
              onApprove={handleApprove}
            />
          )}

          {activeTab === "capabilities" && (
            <CapabilityMap capabilityMap={sessionData?.session?.capability_map || analysis.capability_map} />
          )}

          {activeTab === "validation" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleValidate}
                  disabled={runningCmd === "VALIDATE"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {runningCmd === "VALIDATE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Run Validation
                </button>
                <button
                  onClick={handleScore}
                  disabled={runningCmd === "SCORE"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-bold hover:bg-stone-900 transition disabled:opacity-50"
                >
                  {runningCmd === "SCORE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Recalculate Score
                </button>
              </div>
              <ValidationCenter receipts={sessionData?.validation_receipts || []} />
              <ReadinessScore score={sessionData?.session?.readiness_score || analysis.readiness_score} />
            </div>
          )}

          {activeTab === "commands" && (
            <CommandCenter
              sessionId={sessionData?.session?.session_id}
              onCommand={handleCommand}
              running={runningCmd}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {!analysis && !analyzing && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-stone-200 mb-3" />
          <p className="text-sm text-stone-400 font-medium">Submit a goal to begin analysis</p>
          <p className="text-xs text-stone-400 mt-1 max-w-md">
            The Meta Agent will decompose your goal into intents, match Arsenal assets, detect capability gaps, and generate executable Work Packets.
          </p>
        </div>
      )}
    </div>
  );
}