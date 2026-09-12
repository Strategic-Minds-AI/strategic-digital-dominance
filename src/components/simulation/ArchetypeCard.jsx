import React, { useState } from "react";
import { ChevronDown, Brain, FolderOpen, Play, Users, DollarSign, Zap, Heart, Target } from "lucide-react";

export default function ArchetypeCard({ archetype, onSimulate, onCreateFolder, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const typeColors = {
    primary: "#3B82F6",
    old_school: "#78716C",
    tech_savvy: "#8B5CF6",
    family_man: "#F59E0B",
    luxury_specialist: "#EC4899",
    hustler: "#10B981",
  };
  const color = typeColors[archetype.archetype_type] || "#3B82F6";

  return (
    <div
      className="xa-electric-light rounded-2xl bg-white border border-black p-4"
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg border border-black shrink-0"
            style={{ background: color }}
          >
            {index + 1}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-black">{archetype.name}</h3>
            <p className="text-[10px] text-stone-500">{archetype.business_name}</p>
          </div>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-1 rounded-full border border-black shrink-0"
          style={{ background: color + "20", color: "#000" }}
        >
          {archetype.archetype_type.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Stat label="Revenue" value={`$${(archetype.annual_revenue / 1000).toFixed(0)}K`} icon={DollarSign} />
        <Stat label="Crews" value={archetype.crew_count} icon={Users} />
        <Stat label="Tech Skill" value={archetype.tech_skill_level} icon={Zap} />
        <Stat label="Ambition" value={archetype.ambition_level} icon={Target} />
      </div>

      {/* Personality Traits */}
      <div className="flex flex-wrap gap-1 mb-3">
        {archetype.personality_traits.map((t, i) => (
          <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {t}
          </span>
        ))}
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-[11px] font-bold text-stone-600 hover:text-black mb-2"
      >
        {expanded ? "Hide Full Profile" : "View Full Profile"}
        <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-stone-200 pt-3">
          <ProfileSection title="Family" content={archetype.family_description} />
          <ProfileSection title="Daily Routine" content={Object.entries(archetype.daily_routine || {}).map(([k, v]) => `${k}: ${v}`).join(" • ")} />
          <ProfileSection title="SOPs" content={Object.entries(archetype.sops || {}).map(([k, v]) => `${k}: ${v}`).join(" • ")} />
          <ProfileSection title="Pain Points" items={archetype.pain_points} />
          <ProfileSection title="Goals" items={archetype.goals} />
          <ProfileSection title="Fears" items={archetype.fears} />
          <ProfileSection title="Social Media" content={archetype.social_media_method} />
          <ProfileSection title="Billing" content={archetype.billing_method} />
          <ProfileSection title="Marketing" content={archetype.marketing_method} />
          <ProfileSection title="Finances" content={archetype.finances_accounting_method} />
        </div>
      )}

      {/* Act-As Prompt */}
      {showPrompt && (
        <div className="mt-3 rounded-lg bg-stone-900 text-stone-100 p-3 text-[10px] font-mono leading-relaxed max-h-48 overflow-y-auto">
          {archetype.act_as_prompt}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSimulate(archetype)}
          className="flex-1 h-9 rounded-lg bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-stone-800 transition"
        >
          <Play className="h-3.5 w-3.5" /> Simulate
        </button>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex-1 h-9 rounded-lg bg-white border border-black text-black text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-stone-100 transition"
        >
          <Brain className="h-3.5 w-3.5" /> Act-As Prompt
        </button>
      </div>
      {onCreateFolder && (
        <button
          onClick={() => onCreateFolder(archetype)}
          className="w-full h-8 mt-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition"
        >
          <FolderOpen className="h-3 w-3" /> Create Drive Folder
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg bg-stone-50 border border-stone-200 p-2">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="h-3 w-3 text-stone-400" />
        <span className="text-[8px] text-stone-400 uppercase font-bold">{label}</span>
      </div>
      <p className="text-[11px] font-bold text-black capitalize">{value}</p>
    </div>
  );
}

function ProfileSection({ title, content, items }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">{title}</p>
      {items ? (
        <ul className="list-disc list-inside text-[10px] text-stone-600 space-y-0.5">
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      ) : (
        <p className="text-[10px] text-stone-600 leading-relaxed">{content}</p>
      )}
    </div>
  );
}