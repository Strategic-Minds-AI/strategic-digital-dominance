import React from "react";
import { Zap, Loader2, Brain } from "lucide-react";

const QUICK_ACTIONS = [
  "AUDIT SYSTEM",
  "COMPLETE SYSTEM",
  "AUTO FIX",
  "AUTO HEAL",
  "HARDEN SYSTEM",
  "MIGRATE SYSTEM",
  "DISCOVER CAPABILITIES",
  "BUILD MCP",
  "BUILD AGENT",
  "BUILD SWARM",
  "BUILD GENERATOR",
  "BUILD WORKFLOW",
  "BUILD TEMPLATE",
  "PACKAGE SYSTEM",
  "CREATE DOCUMENTATION",
  "PRODUCTION READINESS",
];

export default function GoalInput({ goal, setGoal, onSubmit, loading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-stone-900">What do you want to build, fix, or discover?</h2>
        </div>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What do you want to create, repair, discover, automate, migrate, audit, optimize, or complete?"
          className="w-full min-h-[120px] rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:bg-white focus:outline-none transition resize-y"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
          }}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-stone-400">⌘+Enter to submit</p>
          <button
            onClick={onSubmit}
            disabled={loading || !goal.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-stone-900 font-bold text-sm border border-amber-700 shadow-lg shadow-amber-500/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Analyze Goal"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa}
              onClick={() => setGoal(qa.toLowerCase().replace(/_/g, " "))}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-amber-400 hover:text-amber-600 transition"
            >
              {qa}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}