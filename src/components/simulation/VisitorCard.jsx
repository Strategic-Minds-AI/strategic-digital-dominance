import React, { useState } from "react";
import { Play, Eye, TrendingUp, User } from "lucide-react";

export default function VisitorCard({ visitor, onSimulate, index }) {
  const [expanded, setExpanded] = useState(false);

  const typeColors = {
    homeowner: "#3B82F6",
    contractor: "#10B981",
    business_owner: "#F59E0B",
    researcher: "#8B5CF6",
    competitor: "#EF4444",
  };
  const color = typeColors[visitor.visitor_type] || "#3B82F6";

  const statusColors = {
    browsing: "#9CA3AF",
    engaged: "#F59E0B",
    lead_captured: "#3B82F6",
    estimate_requested: "#8B5CF6",
    booked: "#10B981",
    lost: "#EF4444",
  };

  return (
    <div
      className="xa-electric-light rounded-2xl bg-white border border-black p-4"
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white border border-black shrink-0"
            style={{ background: color }}
          >
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-black">{visitor.name}</h3>
            <p className="text-[9px] text-stone-500 capitalize">{visitor.visitor_type.replace("_", " ")}</p>
          </div>
        </div>
        <span
          className="text-[8px] font-bold px-2 py-1 rounded-full border border-black shrink-0 capitalize"
          style={{ background: (statusColors[visitor.status] || "#9CA3AF") + "20", color: "#000" }}
        >
          {visitor.status.replace("_", " ")}
        </span>
      </div>

      {/* Demographics */}
      <div className="text-[10px] text-stone-600 mb-2">
        <p>{visitor.demographics?.age}yo • {visitor.demographics?.income} • {visitor.demographics?.location}</p>
        <p className="text-stone-400">{visitor.demographics?.home_type}</p>
      </div>

      {/* Conversion Probability */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[8px] text-stone-400 uppercase font-bold">Conversion</span>
            <span className="text-[10px] font-bold" style={{ color: visitor.conversion_probability >= 70 ? "#10B981" : visitor.conversion_probability >= 40 ? "#F59E0B" : "#EF4444" }}>
              {visitor.conversion_probability}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${visitor.conversion_probability}%`,
                background: visitor.conversion_probability >= 70 ? "#10B981" : visitor.conversion_probability >= 40 ? "#F59E0B" : "#EF4444",
              }}
            />
          </div>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-stone-400 uppercase font-bold">Lead Score</span>
          <p className="text-sm font-extrabold text-black">{visitor.lead_score}</p>
        </div>
      </div>

      {/* Search Intent */}
      <div className="rounded-lg bg-stone-50 border border-stone-200 p-2 mb-2">
        <p className="text-[8px] text-stone-400 uppercase font-bold mb-0.5">Search Intent</p>
        <p className="text-[10px] text-stone-700 font-mono">"{visitor.search_intent}"</p>
      </div>

      {/* Expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-[10px] font-bold text-stone-500 hover:text-black mb-2"
      >
        {expanded ? "Hide Details" : "View Personality Profile"}
        <Eye className="h-3 w-3" />
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-stone-200 pt-2">
          <div>
            <p className="text-[8px] font-bold text-amber-600 uppercase mb-1">Psychographics</p>
            <div className="flex flex-wrap gap-1">
              {visitor.psychographics?.values?.map((v, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[8px] font-bold text-red-500 uppercase mb-1">Fears</p>
            <div className="flex flex-wrap gap-1">
              {visitor.psychographics?.fears?.map((f, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">{f}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[8px] font-bold text-green-600 uppercase mb-1">Desires</p>
            <div className="flex flex-wrap gap-1">
              {visitor.psychographics?.desires?.map((d, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-green-50 text-green-600">{d}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[8px] font-bold text-stone-500 uppercase mb-1">Personality (Big Five)</p>
            <div className="grid grid-cols-5 gap-1">
              {["O", "C", "E", "A", "N"].map((dim, i) => {
                const scores = [
                  visitor.personality_profile?.openness,
                  visitor.personality_profile?.conscientiousness,
                  visitor.personality_profile?.extraversion,
                  visitor.personality_profile?.agreeableness,
                  visitor.personality_profile?.neuroticism,
                ];
                return (
                  <div key={i} className="text-center">
                    <p className="text-[8px] text-stone-400">{dim}</p>
                    <p className="text-[10px] font-bold text-black">{scores[i] || "-"}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-[8px] text-stone-400 mt-1">DISC: {visitor.personality_profile?.disc_type}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-stone-500 uppercase mb-1">Objections</p>
            <ul className="list-disc list-inside text-[9px] text-stone-600 space-y-0.5">
              {visitor.objections?.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-[8px] font-bold text-stone-500 uppercase mb-1">Browsing Behavior</p>
            <p className="text-[9px] text-stone-600">Pages: {visitor.browsing_behavior?.pages_visited?.join(" → ")}</p>
            <p className="text-[9px] text-stone-400">Time on site: {visitor.browsing_behavior?.time_on_site}s</p>
          </div>
        </div>
      )}

      {/* Simulate Button */}
      <button
        onClick={() => onSimulate(visitor)}
        className="w-full h-9 mt-2 rounded-lg bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-stone-800 transition"
      >
        <Play className="h-3.5 w-3.5" /> Simulate Visit
      </button>
    </div>
  );
}