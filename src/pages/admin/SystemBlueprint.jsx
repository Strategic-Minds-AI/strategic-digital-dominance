import React, { useState } from "react";
import {
  Network, Layers, Bot, Database, Code2, Workflow,
  Plug, ShieldCheck, ListChecks, Rocket
} from "lucide-react";
import ArchitectureTab from "@/components/admin/blueprint/ArchitectureTab";
import StackTab from "@/components/admin/blueprint/StackTab";
import AgentsTab from "@/components/admin/blueprint/AgentsTab";
import DataTab from "@/components/admin/blueprint/DataTab";
import FunctionsTab from "@/components/admin/blueprint/FunctionsTab";
import WorkflowsTab from "@/components/admin/blueprint/WorkflowsTab";
import IntegrationsTab from "@/components/admin/blueprint/IntegrationsTab";
import MigrationTab from "@/components/admin/blueprint/MigrationTab";
import BuildQueueTab from "@/components/admin/blueprint/BuildQueueTab";

const TABS = [
  { key: "architecture", label: "Architecture", icon: Network },
  { key: "stack", label: "Tech Stack", icon: Layers },
  { key: "agents", label: "AGI Swarm", icon: Bot },
  { key: "data", label: "Data Model", icon: Database },
  { key: "functions", label: "Functions", icon: Code2 },
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "migration", label: "Migration", icon: ShieldCheck },
  { key: "buildqueue", label: "Build Queue", icon: ListChecks },
];

export default function SystemBlueprint() {
  const [tab, setTab] = useState("architecture");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-stone-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">System Blueprint</h1>
            <p className="text-sm text-stone-500">Enterprise architecture, stack registry, and autonomous build control — the master spec the AGI swarm operates from.</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition border ${
                active
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 min-h-[400px]">
        {tab === "architecture" && <ArchitectureTab />}
        {tab === "stack" && <StackTab />}
        {tab === "agents" && <AgentsTab />}
        {tab === "data" && <DataTab />}
        {tab === "functions" && <FunctionsTab />}
        {tab === "workflows" && <WorkflowsTab />}
        {tab === "integrations" && <IntegrationsTab />}
        {tab === "migration" && <MigrationTab />}
        {tab === "buildqueue" && <BuildQueueTab />}
      </div>
    </div>
  );
}