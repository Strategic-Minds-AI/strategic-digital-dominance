import React from 'react';
import { Cpu, ShieldCheck, Code, Bug, Rocket, RefreshCw, FileCheck, AlertTriangle } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    num: 1,
    name: 'Generate',
    icon: Code,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    description: 'Autonomous coding engine generates code from task queue',
    agent: 'Kai Rivers — VP Engineering',
  },
  {
    num: 2,
    name: 'Validate',
    icon: ShieldCheck,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Postcondition validator checks code against requirements',
    agent: 'Felix Hart — QA Validator',
  },
  {
    num: 3,
    name: 'Test',
    icon: Bug,
    color: 'text-red-600 bg-red-50 border-red-200',
    description: 'Regression test suite runs automated tests',
    agent: 'Felix Hart — QA Validator',
  },
  {
    num: 4,
    name: 'Audit',
    icon: FileCheck,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    description: 'Deterministic audit checks code quality, security, compliance',
    agent: 'Iris Vale — Security Officer',
  },
  {
    num: 5,
    name: 'Deploy',
    icon: Rocket,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description: 'Deploy to Vercel + Supabase + GitHub sync',
    agent: 'Kai Rivers — VP Engineering',
  },
  {
    num: 6,
    name: 'Converge',
    icon: RefreshCw,
    color: 'text-stone-600 bg-stone-50 border-stone-200',
    description: 'Self-reflection engine reviews and improves continuously',
    agent: 'Eden Skye — CEO',
  },
];

const POLICIES = [
  'No code ships without QA Validator approval',
  'All deployments require postcondition validation',
  'Security audit mandatory before every release',
  'Regression tests must pass 100% before deploy',
  'Every action emits a receipt (source, target, action, result, timestamp)',
  'Destructive actions require explicit human approval',
  'All credentials stored in Google Vault — never in code',
];

export default function AutonomousPipeline() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200">
        <div className="h-9 w-9 rounded-lg bg-stone-900 grid place-items-center">
          <Cpu className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-stone-900">Autonomous Coding Pipeline</h2>
          <p className="text-xs text-stone-500">Cron-driven · Separate validator + QA · Deterministic auditing</p>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {PIPELINE_STAGES.map((stage, i) => (
            <React.Fragment key={stage.num}>
              <div className={`rounded-xl border p-3 min-w-[160px] ${stage.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-white grid place-items-center text-xs font-black">
                    {stage.num}
                  </div>
                  <stage.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-stone-900">{stage.name}</p>
                <p className="text-[10px] text-stone-600 mt-1">{stage.description}</p>
                <p className="text-[9px] font-bold text-stone-400 mt-2">{stage.agent}</p>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="text-stone-300 shrink-0">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Policies */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-stone-900">Mandatory Autonomous Coding Policies</h3>
          </div>
          <div className="space-y-1">
            {POLICIES.map((policy, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-stone-600">
                <span className="text-amber-500 font-bold mt-0.5">§</span>
                {policy}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}