import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, Clock, Bell, Bot, ThumbsUp, X, CheckCircle2,
  Loader2, Calendar, RefreshCw, TrendingUp, Pencil, Sparkles, ArrowRight
} from "lucide-react";

const PRIORITY_STYLES = {
  critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", badge: "bg-red-500 text-white", icon: AlertTriangle },
  high: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-500 text-white", icon: AlertTriangle },
  medium: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", badge: "bg-amber-500 text-white", icon: Clock },
  low: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", badge: "bg-blue-500 text-white", icon: Bell },
};

const REC_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    problem: { type: "string" },
    action: { type: "string" },
    expected_result: { type: "string" },
    owner: { type: "string" },
    timeline: { type: "string" },
    priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
    category: { type: "string" },
  },
  required: ["title", "problem", "action", "expected_result"],
};

async function aiRefine(action, rec, writeIn) {
  const prompts = {
    regenerate: `Here is a business recommendation. Produce a fresh, DIFFERENT version — a new angle, new approach, new action for the same underlying problem. Be bold and specific.\n\nCurrent recommendation:\nTitle: ${rec.title}\nProblem: ${rec.problem}\nAction: ${rec.action}\nExpected: ${rec.expected_result}\nOwner: ${rec.owner}\nTimeline: ${rec.timeline}`,
    escalate: `Here is a business recommendation. Make it MORE AMBITIOUS — raise the expected results, tighten the timeline, escalate the scope. Keep the same problem but set a higher bar. Be decisive.\n\nCurrent recommendation:\nTitle: ${rec.title}\nProblem: ${rec.problem}\nAction: ${rec.action}\nExpected: ${rec.expected_result}\nOwner: ${rec.owner}\nTimeline: ${rec.timeline}`,
    modify: `Here is a business recommendation. The user wants these specific changes applied:\n"${writeIn}"\n\nApply the changes precisely and return the updated recommendation.\n\nCurrent recommendation:\nTitle: ${rec.title}\nProblem: ${rec.problem}\nAction: ${rec.action}\nExpected: ${rec.expected_result}\nOwner: ${rec.owner}\nTimeline: ${rec.timeline}`,
    enhance: `Here is a business recommendation. The user wants to enhance it with this addition:\n"${writeIn}"\n\nIntegrate the enhancement and return a richer, more detailed recommendation.\n\nCurrent recommendation:\nTitle: ${rec.title}\nProblem: ${rec.problem}\nAction: ${rec.action}\nExpected: ${rec.expected_result}\nOwner: ${rec.owner}\nTimeline: ${rec.timeline}`,
  };

  const res = await base44.functions.invoke("vercelAiGateway", {
    action: "generateText",
    model: "anthropic/claude-opus-4.7",
    system_prompt: "You are Alpha Prime, a CEO-level business strategist. Return ONLY a JSON object matching the requested schema. Be specific, actionable, and decisive. No preamble, no markdown — pure JSON.",
    prompt: prompts[action],
    response_json_schema: REC_JSON_SCHEMA,
  });

  const parsed = res.data?.parsed;
  if (parsed && typeof parsed === "object" && parsed.title) return parsed;
  // fallback: try to parse text
  try { return JSON.parse(res.data?.text); } catch { return null; }
}

export default function RecommendationCard({ rec, isApproved, onApprove, onApproveAndSchedule, onRegenerateAudit }) {
  const [current, setCurrent] = useState(rec);
  const [aiLoading, setAiLoading] = useState(null); // 'regenerate' | 'escalate' | 'modify' | 'enhance'
  const [writeInMode, setWriteInMode] = useState(null); // 'modify' | 'enhance' | null
  const [writeInText, setWriteInText] = useState("");
  const [error, setError] = useState(null);

  const style = PRIORITY_STYLES[current.priority] || PRIORITY_STYLES.medium;
  const Icon = style.icon;

  const runAi = async (action, writeIn) => {
    setAiLoading(action);
    setError(null);
    try {
      const refined = await aiRefine(action, current, writeIn);
      if (refined) {
        setCurrent({ ...current, ...refined });
        setWriteInMode(null);
        setWriteInText("");
      } else {
        setError("AI returned an unexpected response. Try again.");
      }
    } catch (e) {
      setError(e.message || "AI refinement failed.");
    } finally {
      setAiLoading(null);
    }
  };

  const handleWriteInSubmit = () => {
    if (!writeInText.trim()) return;
    runAi(writeInMode, writeInText.trim());
  };

  return (
    <div className={`rounded-xl border-2 ${style.border} ${style.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`shrink-0 rounded-lg p-2 ${style.badge}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>{current.priority}</span>
            <span className="text-xs text-stone-500">·</span>
            <span className="text-xs font-medium text-stone-600">{current.category}</span>
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-2">{current.title}</h3>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-bold text-stone-700">Problem: </span>
              <span className="text-stone-600">{current.problem}</span>
            </div>
            <div>
              <span className="font-bold text-stone-700">Action: </span>
              <span className="text-stone-600">{current.action}</span>
            </div>
            <div>
              <span className="font-bold text-stone-700">Expected: </span>
              <span className="text-stone-600">{current.expected_result}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {current.owner}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {current.timeline}</span>
            </div>
          </div>

          {error && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          {/* === AI REFINEMENT TOOLS === */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={() => runAi("regenerate")}
              disabled={!!aiLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
            >
              {aiLoading === "regenerate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Regenerate
            </button>
            <button
              onClick={() => runAi("escalate")}
              disabled={!!aiLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
            >
              {aiLoading === "escalate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
              Increase Expectations
            </button>
            <button
              onClick={() => setWriteInMode(writeInMode === "modify" ? null : "modify")}
              disabled={!!aiLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modify
            </button>
            <button
              onClick={() => setWriteInMode(writeInMode === "enhance" ? null : "enhance")}
              disabled={!!aiLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Enhance
            </button>
          </div>

          {/* === WRITE-IN FIELD === */}
          {writeInMode && (
            <div className="mt-2 flex gap-2 items-start">
              <textarea
                value={writeInText}
                onChange={e => setWriteInText(e.target.value)}
                placeholder={writeInMode === "modify"
                  ? "Describe the changes you want…"
                  : "Describe what to add or enhance…"}
                rows={2}
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:border-amber-500 outline-none resize-none"
                autoFocus
              />
              <button
                onClick={handleWriteInSubmit}
                disabled={!!aiLoading || !writeInText.trim()}
                className="px-3 h-9 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-1"
              >
                {aiLoading === writeInMode ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                Apply
              </button>
            </div>
          )}

          {/* === APPROVAL BUTTONS === */}
          <div className="flex items-center gap-2 mt-4">
            {isApproved ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4" /> Approved — Task Created
              </div>
            ) : (
              <>
                <button
                  onClick={() => onApprove(current)}
                  disabled={!!aiLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 transition disabled:opacity-50"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => onApproveAndSchedule(current)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 transition"
                >
                  <Calendar className="h-4 w-4" />
                  Approve + Schedule
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-stone-600 text-sm font-medium hover:bg-stone-100 transition border border-stone-200">
                  <X className="h-4 w-4" /> Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}