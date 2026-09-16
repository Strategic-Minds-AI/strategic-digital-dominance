import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Brain, Settings, Database, Upload, Zap, Phone, Mail,
  Calendar, Globe, Key, Copy, Plus, Loader2, Users,
  Bot, Sparkles, ChevronRight, Activity
} from "lucide-react";
import PersonalityTab from "@/components/agent-master/PersonalityTab";
import MemoryTab from "@/components/agent-master/MemoryTab";
import IntelligenceTab from "@/components/agent-master/IntelligenceTab";
import ActionsTab from "@/components/agent-master/ActionsTab";
import CommunicationsTab from "@/components/agent-master/CommunicationsTab";
import GoogleWorkspaceTab from "@/components/agent-master/GoogleWorkspaceTab";
import CloudBrowserTab from "@/components/agent-master/CloudBrowserTab";
import ApiAccessTab from "@/components/agent-master/ApiAccessTab";
import CloneTab from "@/components/agent-master/CloneTab";

const TABS = [
  { id: "personality", label: "Personality", icon: Brain, component: PersonalityTab },
  { id: "memory", label: "Memory", icon: Database, component: MemoryTab },
  { id: "intelligence", label: "Intelligence", icon: Upload, component: IntelligenceTab },
  { id: "actions", label: "Actions", icon: Zap, component: ActionsTab },
  { id: "comms", label: "Communications", icon: Phone, component: CommunicationsTab },
  { id: "google", label: "Google Workspace", icon: Calendar, component: GoogleWorkspaceTab },
  { id: "browser", label: "Cloud Browser", icon: Globe, component: CloudBrowserTab },
  { id: "api", label: "API Access", icon: Key, component: ApiAccessTab },
  { id: "clone", label: "Clone to Swarm", icon: Copy, component: CloneTab },
];

export default function AgentMaster() {
  const [activeTab, setActiveTab] = useState("personality");
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const queryClient = useQueryClient();

  const { data: agentsData, isLoading } = useQuery({
    queryKey: ["agent-personas"],
    queryFn: () => base44.entities.AgentPersona.list("-created_date", 100),
    staleTime: 30000,
  });

  const agents = agentsData || [];
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0] || null;

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || PersonalityTab;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-black p-6 border border-stone-800">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%)" }} />
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-700 shadow-lg shadow-amber-500/20">
                <Bot className="h-5 w-5 text-stone-900" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Agent Master Control</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Agent Settings Dashboard</h1>
            <p className="text-stone-400 mt-2 text-sm max-w-2xl">
              Full personality, memory, intelligence, action delegation, communication, and API control for every agent in the swarm.
              <span className="text-amber-400 font-semibold"> Like ChatGPT settings — but for your entire autonomous fleet.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black text-amber-400">{agents.length}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wide">Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Selector + Tab Navigation */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Agent List */}
        <div className="lg:w-64 shrink-0 rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900">Agents</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
              </div>
            ) : agents.length === 0 ? (
              <div className="p-4 text-center text-sm text-stone-400">
                No agents yet. Create one in the Personality tab.
              </div>
            ) : (
              agents.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAgentId(a.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition border-b border-stone-50 last:border-0 ${
                    selectedAgent?.id === a.id ? "bg-amber-50 border-l-4 border-l-amber-500" : "hover:bg-stone-50"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: a.avatar_color || "#ff6b00" + "20", color: a.avatar_color || "#ff6b00" }}>
                    {a.short_name || a.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-stone-800 truncate">{a.name}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wide">{a.persona_type}</div>
                  </div>
                  {a.active && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-amber-400 hover:text-amber-600"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          {selectedAgent ? (
            <ActiveComponent agent={selectedAgent} agents={agents} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="h-10 w-10 text-stone-300 mb-3" />
              <p className="text-sm text-stone-400 font-medium">Select an agent to configure</p>
              <p className="text-xs text-stone-400 mt-1">Or create a new one in the Personality tab</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}