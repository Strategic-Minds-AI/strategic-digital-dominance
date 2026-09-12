import React, { useState } from "react";
import { Brain, Check, Eye } from "lucide-react";

export default function AdminProfileCard({ profile, isActive, onActivate, index }) {
  const [showPrompt, setShowPrompt] = useState(false);

  const typeColors = {
    architect: "#3B82F6",
    operator: "#10B981",
    analyst: "#8B5CF6",
    auditor: "#F59E0B",
    executive: "#EC4899",
  };
  const color = typeColors[profile.profile_type] || "#3B82F6";

  return (
    <div
      className={`rounded-2xl bg-white border-2 p-4 transition-all ${
        isActive ? "border-black" : "border-stone-200"
      }`}
      style={{ boxShadow: isActive ? "6px 6px 0px 0px rgba(0,0,0,1)" : "3px 3px 0px 0px rgba(0,0,0,0.3)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white border-2 border-black shrink-0"
            style={{ background: color }}
          >
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-black">{profile.name}</h3>
            <p className="text-[9px] text-stone-500 capitalize">{profile.profile_type}</p>
          </div>
        </div>
        {isActive && (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-[10px] text-stone-600 mb-3 leading-relaxed">{profile.description}</p>

      {/* Tech Skill */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[8px] text-stone-400 uppercase font-bold">Tech Skill</span>
        <span className="text-[10px] font-bold text-black capitalize">{profile.tech_skill_level}</span>
      </div>

      {/* Focus Areas */}
      <div className="flex flex-wrap gap-1 mb-3">
        {profile.focus_areas?.map((area, i) => (
          <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {area}
          </span>
        ))}
      </div>

      {/* Opinionated Stance */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 mb-3">
        <p className="text-[8px] font-bold text-amber-600 uppercase mb-1">Opinionated Stance</p>
        <p className="text-[10px] text-stone-700 leading-relaxed italic">"{profile.opinionated_stance}"</p>
      </div>

      {/* Assigned Archetypes */}
      {profile.assigned_archetypes?.length > 0 && (
        <div className="mb-3">
          <p className="text-[8px] text-stone-400 uppercase font-bold mb-1">Evaluates From</p>
          <div className="flex flex-wrap gap-1">
            {profile.assigned_archetypes.map((a, i) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 capitalize">
                {a.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Show Prompt */}
      {showPrompt && (
        <div className="mb-3 rounded-lg bg-stone-900 text-stone-100 p-3 text-[10px] font-mono leading-relaxed max-h-32 overflow-y-auto">
          {profile.personality_prompt}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onActivate(profile)}
          className={`flex-1 h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
            isActive
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-black text-white hover:bg-stone-800"
          }`}
        >
          {isActive ? <><Check className="h-3.5 w-3.5" /> Active</> : "Activate"}
        </button>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex-1 h-9 rounded-lg bg-white border border-black text-black text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-stone-100 transition"
        >
          <Eye className="h-3.5 w-3.5" /> Prompt
        </button>
      </div>
    </div>
  );
}