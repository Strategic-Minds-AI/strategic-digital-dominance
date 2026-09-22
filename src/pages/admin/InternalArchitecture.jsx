import React from 'react';
import { Database, Workflow, Bot, Globe, Shield, Zap, ArrowRight, Cpu, Cloud, GitBranch, Boxes, Layers } from 'lucide-react';

const ARCHITECTURE_LAYERS = [
  {
    name: 'User Interface Layer',
    icon: Globe,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    components: [
      'GoogleWorkspaceOS Admin Page',
      'Opportunity Intelligence Dashboard',
      'Command Center',
      'Vision Studio',
      'Agent Master / Builder',
    ],
  },
  {
    name: 'Agent Orchestration Layer',
    icon: Bot,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    components: [
      'CEO — Strategic decisions',
      'CTO — Tech architecture',
      'Executive Assistant — Scheduling',
      'Sales Agent — Lead generation',
      'Marketing Agent — Content & SEO',
      'Engineering Agent — Code generation',
      'Operations Agent — Delivery',
      'Validator — Quality gates',
      'Security Agent — Audits',
    ],
  },
  {
    name: 'Backend Functions Layer',
    icon: Cpu,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    components: [
      'googleWorkspaceOS — Drive/Tasks/Calendar/Docs',
      'opportunityIntelligenceEngine — Scanners',
      'autonomousCodingEngine — Code gen',
      'closedLoopTester — Validation',
      'systemAuditor — Security audits',
      'vercelDeploy — Deployments',
      'agentBuilderEngine — Agent creation',
      'convergenceEngine — Self-healing',
    ],
  },
  {
    name: 'Workflow Automation Layer',
    icon: Workflow,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    components: [
      'Weekly Opportunity Scanner — Mon 9am ET',
      'Autonomous Coding Pipeline — Every 2hrs',
      'Autonomous Refactor Cycle — Continuous',
      'Autonomous Dominance 24/7 — Continuous',
      'X1 Autonomous Company Cycle — Continuous',
      'Fleet Alpha Prime Heartbeat — Health checks',
      'Daily Lead Engine — Lead processing',
      'Social Media Autopilot — Content scheduling',
    ],
  },
  {
    name: 'Google Workspace Integration Layer',
    icon: Cloud,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    components: [
      'Google Drive — 51 folders (Clients, Projects, Proposals, etc.)',
      'Google Calendar — Weekly scan cycle, deadlines',
      'Google Tasks — 10 agent task lists',
      'Gmail — Email drafting & sending',
      'Google Docs — 5 template documents',
      'Google Sheets — Data tracking',
      'Google Search Console — SEO monitoring',
      'Google Analytics — Traffic analysis',
    ],
  },
  {
    name: 'Infrastructure Layer',
    icon: Boxes,
    color: 'text-stone-600',
    bg: 'bg-stone-100',
    border: 'border-stone-300',
    components: [
      'Base44 — App platform & entities',
      'Vercel — Frontend & API deployments',
      'Supabase — Database & auth',
      'GitHub — Version control & repo sync',
      'Railway — Background workers',
      'GoDaddy — Domain registration',
      'Telnyx — SMS/Voice communications',
      'HubSpot — CRM & deal tracking',
    ],
  },
  {
    name: 'Data & Security Layer',
    icon: Shield,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    components: [
      'AgentPersona — 9 corporate agents',
      'AgentMemory — Cross-agent memory',
      'AgentAction — Scheduled & triggered actions',
      'AgentExecutionLog — Audit trail',
      'Opportunity — Scanner results',
      'BuildSession — Vision-to-ship pipeline',
      'CodeSandboxSession — Code generation tracking',
      'DeploymentRecord — Deploy audit trail',
      'VaultEntry — Credentials & secrets',
    ],
  },
];

const DATA_FLOWS = [
  { from: 'Scanners', to: 'Opportunity Entity', desc: 'Google Trends + competitor intel → saved opportunities' },
  { from: 'Opportunities', to: 'Drive + Calendar', desc: 'Weekly scan syncs to Research folder + Monday calendar event' },
  { from: 'Vision Studio', to: 'AgentPersona', desc: 'Vision → strategy → agent team generation' },
  { from: 'Engineering Agent', to: 'Validator', desc: 'Code generated → regression tested → deployed' },
  { from: 'Validator', to: 'Vercel', desc: 'Passed validation → production deployment' },
  { from: 'Security Agent', to: 'VaultEntry', desc: 'Credential rotation → audit log → access control' },
];

export default function InternalArchitecture() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
          <Layers className="h-7 w-7 text-amber-500" />
          Internal Architecture
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Strategic Minds AI — 7-layer system architecture from UI to infrastructure. Every layer, agent, workflow, and integration mapped.
        </p>
      </div>

      {/* Architecture Layers */}
      <div className="space-y-3">
        {ARCHITECTURE_LAYERS.map((layer, i) => (
          <div key={i} className={`rounded-xl border ${layer.border} ${layer.bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <layer.icon className={`h-5 w-5 ${layer.color}`} />
              <h3 className="text-sm font-bold text-stone-900">{layer.name}</h3>
              <span className="text-xs text-stone-400 ml-auto">{layer.components.length} components</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {layer.components.map((comp, j) => (
                <div key={j} className="rounded-lg bg-white/70 border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700">
                  {comp}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Data Flow Diagram */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-amber-500" />
          Data Flow — How Information Moves Through the System
        </h3>
        <div className="space-y-2">
          {DATA_FLOWS.map((flow, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="rounded-lg bg-amber-100 text-amber-800 px-3 py-1.5 font-bold whitespace-nowrap">{flow.from}</span>
              <ArrowRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <span className="rounded-lg bg-stone-100 text-stone-700 px-3 py-1.5 font-bold whitespace-nowrap">{flow.to}</span>
              <span className="text-stone-500 truncate">{flow.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entity Relationships */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-amber-500" />
          Core Entity Relationships
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="font-bold text-stone-800 mb-1">BuildSession → AgentPersona</div>
            <div className="text-stone-500">Vision text → strategy snapshot → 9 corporate agents generated</div>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="font-bold text-stone-800 mb-1">AgentPersona → AgentAction</div>
            <div className="text-stone-500">Each agent has scheduled, triggered, or manual actions</div>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="font-bold text-stone-800 mb-1">AgentAction → AgentExecutionLog</div>
            <div className="text-stone-500">Every action run logs status, duration, tokens, cost</div>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="font-bold text-stone-800 mb-1">CodeSandboxSession → DeploymentRecord</div>
            <div className="text-stone-500">Code generated → validated → deployed to Vercel/Base44</div>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="font-bold text-stone-800 mb-1">Opportunity → Google Drive</div>
            <div className="text-stone-500">Scanner results saved as entities + synced to Research folder</div>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
            <div className="font-bold text-stone-800 mb-1">SelfReflectionCycle → RefactorJob</div>
            <div className="text-stone-500">Audit findings → refactor jobs → convergence</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Bot} label="Corporate Agents" value="9" color="text-purple-600" />
        <StatCard icon={Workflow} label="Active Workflows" value="8" color="text-emerald-600" />
        <StatCard icon={Cloud} label="Google APIs" value="8" color="text-red-600" />
        <StatCard icon={Database} label="Core Entities" value="40+" color="text-indigo-600" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-black text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}