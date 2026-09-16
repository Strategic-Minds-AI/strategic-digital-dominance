import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Key, Save, Loader2, Shield, CheckSquare, Square } from "lucide-react";

const ACCESS_LEVELS = [
  { value: "full", label: "Full Access", desc: "All entities + all functions", color: "text-red-600 bg-red-50 border-red-200" },
  { value: "read_only", label: "Read Only", desc: "Read all entities, no writes", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "limited", label: "Limited", desc: "Only whitelisted entities + functions", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "custom", label: "Custom", desc: "Per-entity, per-function control", color: "text-purple-600 bg-purple-50 border-purple-200" },
];

const ALL_FUNCTIONS = [
  "alphaPrimeAudit","systemAuditor","swarmOrchestrator","autoComplete","fleetAlphaPrime",
  "visionCortexRouter","intentRouter","alphaPrimeOptimizationCycle","alphaPrimeHeartbeat",
  "enrichLead","propertyLookup","skipTrace","generateSeoPage","generateSitemap","optimizeSeo",
  "pullSearchConsoleData","googleAnalytics","socialStudio","sendEstimateEmail","sendFollowUpEmail",
  "bookEstimate","dailyLeadEngine","scanCompetitors","companyIntel","tradeCrystalBall",
  "ragPipeline","graphEngine","voiceAssistant","xtremeComms","shadowBrowse",
  "vercelAiGateway","vercelDeploy","githubSync","postconditionValidator","regressionTestSuite",
];

const ALL_ENTITIES = [
  "Lead","SwarmTask","SwarmAudit","StrategyDocument","FleetSystem","BenchmarkDefinition",
  "BenchmarkResult","RepairJob","OptimizationGap","EvidenceReceipt","OperatorIntent",
  "VisionConversation","VisionMessage","FleetHeartbeat","ControlLease","SystemMode",
  "AppSettings","ApiKey","ChatMessage","EmailLog","SeoContent","CompetitorInsight",
  "Sop","GeneratedPage","DynamicPage","ClientPackage","ClientProject","IntelligenceReport",
  "AnalyticsSnapshot","MaintenancePlan","Tool","Referral","Rating","Comment","PromoCode",
  "SkipTrace","PropertyLookup","ContractorArchetype","AdminProfile","SimulatedVisitor",
  "QuestionnaireResponse","AgentPersona","AgentMemory","AgentIntelligence","AgentAction",
];

export default function ApiAccessTab({ agent }) {
  const queryClient = useQueryClient();
  const [accessLevel, setAccessLevel] = useState(agent?.api_access_level || "limited");
  const [allowedFunctions, setAllowedFunctions] = useState(agent?.api_allowed_functions || []);
  const [allowedEntities, setAllowedEntities] = useState(agent?.api_allowed_entities || []);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (agent) {
      setAccessLevel(agent.api_access_level || "limited");
      setAllowedFunctions(agent.api_allowed_functions || []);
      setAllowedEntities(agent.api_allowed_entities || []);
    }
  }, [agent?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.AgentPersona.update(agent.id, {
        api_access_level: accessLevel,
        api_allowed_functions: allowedFunctions,
        api_allowed_entities: allowedEntities,
      });
      queryClient.invalidateQueries(["agent-personas"]);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggleFunction = (fn) => {
    setAllowedFunctions(prev => prev.includes(fn) ? prev.filter(f => f !== fn) : [...prev, fn]);
  };

  const toggleEntity = (ent) => {
    setAllowedEntities(prev => prev.includes(ent) ? prev.filter(e => e !== ent) : [...prev, ent]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-bold text-stone-900">API Access Control</h3>
        <span className="text-xs text-stone-400">— per-agent API key with custom access levels</span>
      </div>

      {/* Access Level */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACCESS_LEVELS.map(l => (
          <button key={l.value} onClick={() => setAccessLevel(l.value)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              accessLevel === l.value ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"
            }`}>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${l.color}`}>
              <Shield className="h-3 w-3" /> {l.label}
            </div>
            <div className="text-xs text-stone-500 mt-2">{l.desc}</div>
          </button>
        ))}
      </div>

      {/* Custom: Function Checkboxes */}
      {(accessLevel === "limited" || accessLevel === "custom") && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-stone-800">Allowed Backend Functions</h4>
            <div className="flex gap-2">
              <button onClick={() => setAllowedFunctions([...ALL_FUNCTIONS])}
                className="text-xs text-amber-600 font-semibold hover:text-amber-700">Select All</button>
              <button onClick={() => setAllowedFunctions([])}
                className="text-xs text-stone-400 font-semibold hover:text-stone-600">Clear</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-60 overflow-y-auto">
            {ALL_FUNCTIONS.map(fn => (
              <button key={fn} onClick={() => toggleFunction(fn)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left hover:bg-stone-50">
                {allowedFunctions.includes(fn) ? <CheckSquare className="h-3.5 w-3.5 text-amber-500 shrink-0" /> : <Square className="h-3.5 w-3.5 text-stone-300 shrink-0" />}
                <span className={`font-mono truncate ${allowedFunctions.includes(fn) ? "text-stone-800 font-semibold" : "text-stone-500"}`}>{fn}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom: Entity Checkboxes */}
      {(accessLevel === "limited" || accessLevel === "custom") && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-stone-800">Allowed Entities</h4>
            <div className="flex gap-2">
              <button onClick={() => setAllowedEntities([...ALL_ENTITIES])}
                className="text-xs text-amber-600 font-semibold hover:text-amber-700">Select All</button>
              <button onClick={() => setAllowedEntities([])}
                className="text-xs text-stone-400 font-semibold hover:text-stone-600">Clear</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-60 overflow-y-auto">
            {ALL_ENTITIES.map(ent => (
              <button key={ent} onClick={() => toggleEntity(ent)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left hover:bg-stone-50">
                {allowedEntities.includes(ent) ? <CheckSquare className="h-3.5 w-3.5 text-amber-500 shrink-0" /> : <Square className="h-3.5 w-3.5 text-stone-300 shrink-0" />}
                <span className={`truncate ${allowedEntities.includes(ent) ? "text-stone-800 font-semibold" : "text-stone-500"}`}>{ent}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save API Access
      </button>
    </div>
  );
}