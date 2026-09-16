import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Copy, Loader2, CheckCircle2, Users, Zap } from "lucide-react";

export default function CloneTab({ agent, agents }) {
  const queryClient = useQueryClient();
  const [cloning, setCloning] = useState(false);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({
    personality: true,
    custom_instructions: true,
    memory: true,
    intelligence: true,
    actions: true,
    communications: true,
    google_workspace: true,
    cloud_browser: false,
    api_access: false,
  });

  const otherAgents = agents.filter(a => a.id !== agent?.id);

  const handleCloneToAll = async () => {
    setCloning(true);
    setResult(null);
    const cloned = [];

    for (const target of otherAgents) {
      try {
        const updates = {};
        if (options.personality) {
          updates.system_prompt = agent.system_prompt;
          updates.personality_traits = agent.personality_traits;
          updates.tone = agent.tone;
          updates.model_preference = agent.model_preference;
          updates.max_autonomy = agent.max_autonomy;
        }
        if (options.custom_instructions) updates.custom_instructions = agent.custom_instructions;
        if (options.communications) updates.communication_config = agent.communication_config;
        if (options.google_workspace) updates.google_workspace_config = agent.google_workspace_config;
        if (options.cloud_browser) updates.cloud_browser_config = agent.cloud_browser_config;
        if (options.api_access) {
          updates.api_access_level = agent.api_access_level;
          updates.api_allowed_functions = agent.api_allowed_functions;
          updates.api_allowed_entities = agent.api_allowed_entities;
        }

        if (Object.keys(updates).length > 0) {
          await base44.entities.AgentPersona.update(target.id, updates);
        }

        // Clone memory
        if (options.memory) {
          const memories = await base44.entities.AgentMemory.filter({ agent_id: agent.id }, "-created_date", 200);
          for (const m of memories) {
            if (m.is_shared) continue; // shared memory is already accessible
            await base44.entities.AgentMemory.create({
              ...m,
              id: undefined,
              agent_id: target.id,
              agent_short_name: target.short_name,
              created_at: new Date().toISOString(),
            });
          }
        }

        // Clone intelligence assignments
        if (options.intelligence) {
          const intel = await base44.entities.AgentIntelligence.filter({ assigned_agents: agent.id }, "-created_date", 50);
          for (const i of intel) {
            const newAssigned = [...new Set([...(i.assigned_agents || []), target.id])];
            await base44.entities.AgentIntelligence.update(i.id, { assigned_agents: newAssigned });
          }
        }

        // Clone actions
        if (options.actions) {
          const actions = await base44.entities.AgentAction.filter({ agent_id: agent.id }, "-created_date", 100);
          for (const a of actions) {
            const newActionId = `act-${Date.now()}-${target.short_name}-${Math.random().toString(36).substring(2, 4)}`;
            await base44.entities.AgentAction.create({
              ...a,
              id: undefined,
              action_id: newActionId,
              agent_id: target.id,
              agent_short_name: target.short_name,
              status: "draft",
              created_at: new Date().toISOString(),
            });
          }
        }

        cloned.push({ name: target.name, short_name: target.short_name, success: true });
      } catch (e) {
        cloned.push({ name: target.name, short_name: target.short_name, success: false, error: e.message });
      }
    }

    setResult({ cloned, total: otherAgents.length, success: cloned.filter(c => c.success).length });
    queryClient.invalidateQueries(["agent-personas"]);
    queryClient.invalidateQueries(["agent-memory"]);
    queryClient.invalidateQueries(["agent-intelligence"]);
    queryClient.invalidateQueries(["agent-actions"]);
    setCloning(false);
  };

  const toggleOption = (key) => setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Copy className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-stone-900">Clone to Entire Swarm</h3>
        <span className="text-xs text-stone-400">— replicate this agent's config to all other agents with one click</span>
      </div>

      {/* Source Agent */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: (agent?.avatar_color || "#ff6b00") + "20", color: agent?.avatar_color || "#ff6b00" }}>
            {agent?.short_name || "A"}
          </div>
          <div>
            <div className="text-sm font-bold text-stone-800">Source: {agent?.name}</div>
            <div className="text-xs text-stone-500">Clone FROM this agent → TO {otherAgents.length} other agents</div>
          </div>
        </div>
      </div>

      {/* Clone Options */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h4 className="text-sm font-bold text-stone-800 mb-3">What to clone:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { key: "personality", label: "Personality (system prompt, traits, tone, model, autonomy)" },
            { key: "custom_instructions", label: "Custom Instructions" },
            { key: "memory", label: "Memory entries (categorized knowledge)" },
            { key: "intelligence", label: "Intelligence document assignments" },
            { key: "actions", label: "Action delegations (scheduled tasks)" },
            { key: "communications", label: "Communication config (SMS, email, voice)" },
            { key: "google_workspace", label: "Google Workspace integration" },
            { key: "cloud_browser", label: "Cloud browser config" },
            { key: "api_access", label: "API access level & permissions" },
          ].map(o => (
            <label key={o.key} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-stone-50 cursor-pointer">
              <input type="checkbox" checked={options[o.key]} onChange={() => toggleOption(o.key)}
                className="w-4 h-4 mt-0.5 rounded border-stone-300 text-amber-500" />
              <span className="text-sm text-stone-700">{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Target Agents */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-amber-600" />
          <h4 className="text-sm font-bold text-stone-800">Target Agents ({otherAgents.length})</h4>
        </div>
        {otherAgents.length === 0 ? (
          <p className="text-sm text-stone-400">No other agents to clone to. Create more agents first.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {otherAgents.map(a => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium">
                <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: (a.avatar_color || "#ff6b00") + "20", color: a.avatar_color || "#ff6b00" }}>
                  {a.short_name || a.name?.charAt(0)}
                </div>
                {a.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clone Button */}
      <button onClick={handleCloneToAll} disabled={cloning || otherAgents.length === 0}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-600 text-stone-950 font-bold text-sm border border-amber-700 shadow-lg shadow-amber-500/30 hover:brightness-110 disabled:opacity-50">
        {cloning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
        {cloning ? "Cloning to swarm..." : `Clone to ${otherAgents.length} Agents`}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-800">Clone Complete</h4>
            <span className="ml-auto text-xs text-emerald-600 font-bold">{result.success}/{result.total} succeeded</span>
          </div>
          <div className="space-y-1">
            {result.cloned.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {c.success ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <span className="text-red-500">✗</span>}
                <span className="text-stone-700">{c.short_name} — {c.name}</span>
                {c.error && <span className="text-xs text-red-500">{c.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}