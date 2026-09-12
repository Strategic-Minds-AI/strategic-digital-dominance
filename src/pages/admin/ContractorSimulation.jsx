import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, RefreshCw, Users, UserCircle, FileQuestion, FolderSync, Sparkles, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import { base44 } from "@/api/base44Client";
import { CONTRACTOR_ARCHETYPES } from "@/data/contractorArchetypes";
import { SIMULATED_VISITORS } from "@/data/simulatedVisitors";
import { ADMIN_PROFILES } from "@/data/adminProfiles";
import { QUESTIONNAIRE_CATEGORIES, calculateScore } from "@/data/simulationQuestionnaire";
import ArchetypeCard from "@/components/simulation/ArchetypeCard";
import VisitorCard from "@/components/simulation/VisitorCard";
import AdminProfileCard from "@/components/simulation/AdminProfileCard";
import GoogleSyncTab from "@/components/simulation/GoogleSyncTab";

const TABS = [
  { id: "archetypes", label: "Archetypes", icon: Users },
  { id: "visitors", label: "Visitors", icon: UserCircle },
  { id: "profiles", label: "Admin Profiles", icon: Sparkles },
  { id: "questionnaire", label: "Questionnaire", icon: FileQuestion },
  { id: "google", label: "Google Sync", icon: FolderSync },
];

export default function ContractorSimulation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("archetypes");
  const [activeProfile, setActiveProfile] = useState(null);
  const [swarmSyncing, setSwarmSyncing] = useState(false);
  const [swarmResult, setSwarmResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSwarmSync = async () => {
    setSwarmSyncing(true);
    setSwarmResult(null);
    try {
      const res = await base44.functions.invoke("syncWorkflowToSwarm", {});
      setSwarmResult({ success: true, ...res.data });
    } catch (err) {
      setSwarmResult({ success: false, error: err?.message || "Swarm sync failed" });
    }
    setSwarmSyncing(false);
  };

  const handleSimulateArchetype = async (archetype) => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${archetype.act_as_prompt}\n\nYou are evaluating the Xtreme AI system for your epoxy coating business. Answer the following questionnaire honestly from your character's perspective. For each question, give a score from 1-10 and a brief explanation.\n\n${QUESTIONNAIRE_CATEGORIES.map(c => `${c.name}:\n${c.questions.map((q, i) => `${i+1}. ${q.text}`).join("\n")}`).join("\n\n")}\n\nProvide your overall score (0-100) and your honest opinion as ${archetype.name}.`,
        response_json_schema: {
          type: "object",
          properties: {
            archetype_name: { type: "string" },
            overall_score: { type: "number" },
            category_scores: {
              type: "object",
              properties: QUESTIONNAIRE_CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: { type: "number" } }), {}),
            },
            honest_opinion: { type: "string" },
            would_buy: { type: "boolean" },
            biggest_concern: { type: "string" },
            favorite_feature: { type: "string" },
          },
        },
      });
      setSimulationResult({ archetype, result: res });
    } catch (err) {
      setSimulationResult({ error: err?.message || "Simulation failed" });
    }
    setSimulating(false);
  };

  const handleSimulateVisitor = async (visitor) => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${visitor.personality_prompt}\n\nYou are visiting the epoxy garage floor estimate website. Simulate your browsing experience. What pages do you visit? What do you think? Do you convert? Why or why not? Be honest from your character's perspective.`,
        response_json_schema: {
          type: "object",
          properties: {
            visitor_name: { type: "string" },
            pages_visited: { type: "array", items: { type: "string" } },
            thoughts: { type: "string" },
            converted: { type: "boolean" },
            conversion_reason: { type: "string" },
            objections: { type: "array", items: { type: "string" } },
            lead_score: { type: "number" },
          },
        },
      });
      setSimulationResult({ visitor, result: res });
    } catch (err) {
      setSimulationResult({ error: err?.message || "Simulation failed" });
    }
    setSimulating(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-black">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img src={LOGO_URL} alt="XPS" className="h-9 w-9 object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-extrabold font-heading tracking-tight text-black truncate">
                  Contractor Simulation System
                </h1>
                <p className="text-[9px] sm:text-[10px] text-amber-600 font-semibold tracking-wider uppercase">
                  6 Archetypes • 10 Visitors • 5 Admin Profiles • Full Google Sync
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate("/admin/workflow-findings")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-black text-xs font-semibold text-black hover:bg-stone-100 transition"
              >
                <FileQuestion className="h-3.5 w-3.5" /> Findings
              </button>
              <button
                onClick={handleSwarmSync}
                disabled={swarmSyncing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-stone-800 transition disabled:opacity-50"
              >
                {swarmSyncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Sync to Swarm</span><span className="sm:hidden">Swarm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swarm Result */}
      {swarmResult && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className={`rounded-xl p-3 flex items-start gap-2 border ${swarmResult.success ? "bg-blue-50 border-blue-600" : "bg-red-50 border-red-600"}`} style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
            {swarmResult.success ? <Brain className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />}
            <p className={`text-xs font-semibold ${swarmResult.success ? "text-blue-700" : "text-red-700"}`}>
              {swarmResult.success ? `Swarm synced! ${swarmResult.tasksCreated} tasks. ${swarmResult.totalTracked} total tracked.` : swarmResult.error}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-stone-100"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Archetypes Tab */}
        {activeTab === "archetypes" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-black mb-1">6 Contractor Archetypes</h2>
              <p className="text-xs text-stone-500">Full personality profiles with daily routines, SOPs, pain points, and "Act as if" LLM prompts</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONTRACTOR_ARCHETYPES.map((archetype, i) => (
                <ArchetypeCard
                  key={archetype.archetype_id}
                  archetype={archetype}
                  index={i}
                  onSimulate={handleSimulateArchetype}
                />
              ))}
            </div>
          </div>
        )}

        {/* Visitors Tab */}
        {activeTab === "visitors" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-black mb-1">10 Simulated Visitors</h2>
              <p className="text-xs text-stone-500">Personality profiles for potential customers with demographics, psychographics, and browsing behavior</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SIMULATED_VISITORS.map((visitor, i) => (
                <VisitorCard
                  key={visitor.visitor_id}
                  visitor={visitor}
                  index={i}
                  onSimulate={handleSimulateVisitor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Admin Profiles Tab */}
        {activeTab === "profiles" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-black mb-1">5 Admin Profiles</h2>
              <p className="text-xs text-stone-500">Different perspectives for evaluating the system — each highly opinionated with distinct tech skill and focus</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADMIN_PROFILES.map((profile, i) => (
                <AdminProfileCard
                  key={profile.profile_id}
                  profile={profile}
                  index={i}
                  isActive={activeProfile?.profile_id === profile.profile_id}
                  onActivate={(p) => setActiveProfile(p)}
                />
              ))}
            </div>
            {activeProfile && (
              <div className="mt-4 xa-electric-light rounded-2xl bg-amber-50 border border-black p-4" style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}>
                <p className="text-xs text-amber-700 font-bold">
                  ✓ Active Profile: {activeProfile.name} — {activeProfile.opinionated_stance}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Questionnaire Tab */}
        {activeTab === "questionnaire" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-black mb-1">Simulation Questionnaire</h2>
              <p className="text-xs text-stone-500">10 categories, 40+ questions — each archetype and admin profile must answer these to judge the system</p>
            </div>
            <div className="space-y-4">
              {QUESTIONNAIRE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="xa-electric-light rounded-2xl bg-white border border-black p-4" style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-black">{cat.name}</h3>
                      <p className="text-[10px] text-stone-500">{cat.description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      Weight: {cat.weight}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cat.questions.map((q, qi) => (
                      <div key={q.id} className="flex items-start justify-between gap-3">
                        <p className="text-[11px] text-stone-700 flex-1">{qi + 1}. {q.text}</p>
                        <div className="flex gap-1 shrink-0">
                          {Array.from({ length: q.maxScore }, (_, i) => (
                            <div key={i} className="w-5 h-5 rounded border border-stone-300 bg-stone-50 text-[8px] flex items-center justify-center text-stone-400">
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Sync Tab */}
        {activeTab === "google" && <GoogleSyncTab />}
      </div>

      {/* Simulation Result Modal */}
      {simulating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white border-2 border-black p-6 flex flex-col items-center gap-3" style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}>
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-sm font-bold text-black">Running simulation...</p>
            <p className="text-xs text-stone-500">The AI is evaluating the system from this perspective</p>
          </div>
        </div>
      )}

      {simulationResult && !simulating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSimulationResult(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white border-2 border-black p-6 max-h-[90vh] overflow-y-auto" style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-black">
                {simulationResult.archetype ? `Simulation: ${simulationResult.archetype.name}` : `Visit: ${simulationResult.visitor?.name}`}
              </h2>
              <button onClick={() => setSimulationResult(null)} className="text-stone-400 hover:text-black text-xl">✕</button>
            </div>
            {simulationResult.error ? (
              <p className="text-sm text-red-600">{simulationResult.error}</p>
            ) : (
              <div className="space-y-3 text-sm">
                {simulationResult.result?.overall_score !== undefined && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-bold text-amber-600 uppercase">Overall Score</p>
                    <p className="text-3xl font-extrabold text-black">{simulationResult.result.overall_score}/100</p>
                  </div>
                )}
                {simulationResult.result?.honest_opinion && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase mb-1">Honest Opinion</p>
                    <p className="text-sm text-stone-700">{simulationResult.result.honest_opinion}</p>
                  </div>
                )}
                {simulationResult.result?.would_buy !== undefined && (
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-stone-50 border border-stone-200 p-2">
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Would Buy?</p>
                      <p className="text-sm font-bold text-black">{simulationResult.result.would_buy ? "Yes" : "No"}</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-stone-50 border border-stone-200 p-2">
                      <p className="text-[10px] font-bold text-stone-400 uppercase">Favorite Feature</p>
                      <p className="text-[11px] font-bold text-black">{simulationResult.result.favorite_feature}</p>
                    </div>
                  </div>
                )}
                {simulationResult.result?.biggest_concern && (
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase mb-1">Biggest Concern</p>
                    <p className="text-sm text-stone-700">{simulationResult.result.biggest_concern}</p>
                  </div>
                )}
                {simulationResult.result?.thoughts && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase mb-1">Visitor Thoughts</p>
                    <p className="text-sm text-stone-700">{simulationResult.result.thoughts}</p>
                  </div>
                )}
                {simulationResult.result?.converted !== undefined && (
                  <div className="rounded-lg bg-stone-50 border border-stone-200 p-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">Converted?</p>
                    <p className="text-sm font-bold text-black">{simulationResult.result.converted ? "Yes" : "No"} — {simulationResult.result.conversion_reason}</p>
                  </div>
                )}
                {simulationResult.result?.category_scores && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase mb-2">Category Scores</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(simulationResult.result.category_scores).map(([key, score]) => (
                        <div key={key} className="rounded-lg bg-stone-50 border border-stone-200 p-2">
                          <p className="text-[10px] text-stone-400">{key.replace("_", " ")}</p>
                          <p className="text-sm font-bold text-black">{score}/10</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}