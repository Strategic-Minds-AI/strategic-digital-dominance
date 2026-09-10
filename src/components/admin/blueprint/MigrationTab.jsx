import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Circle, ArrowRight, AlertTriangle } from "lucide-react";

const MIGRATION = [
  {
    phase: "Phase 1: Foundation",
    target: "Supabase + Vercel",
    tasks: [
      { item: "Create Supabase project + Postgres schema for all 24 entities", done: false, effort: "High", owner: "Engineer" },
      { item: "Set up Supabase Auth (email/password + Google OAuth)", done: false, effort: "Medium", owner: "Engineer" },
      { item: "Translate Base44 RLS policies → Supabase RLS (auth.role() = 'admin')", done: false, effort: "Medium", owner: "Engineer" },
      { item: "Create Vercel Next.js project, move React/Tailwind UI", done: false, effort: "High", owner: "Engineer" },
      { item: "Set up Vercel AI Gateway (replace InvokeLLM)", done: false, effort: "Low", owner: "Engineer" },
    ],
  },
  {
    phase: "Phase 2: Data Migration",
    target: "Supabase",
    tasks: [
      { item: "Export all Base44 entity records (via SDK list + pagination)", done: false, effort: "Medium", owner: "Script" },
      { item: "Transform records → Supabase row format (map built-in fields)", done: false, effort: "Medium", owner: "Script" },
      { item: "Bulk insert into Supabase tables", done: false, effort: "Low", owner: "Script" },
      { item: "Verify record counts match + spot-check data integrity", done: false, effort: "Low", owner: "QA" },
      { item: "Set up Supabase Storage for file uploads (replace UploadFile)", done: false, effort: "Low", owner: "Engineer" },
    ],
  },
  {
    phase: "Phase 3: Backend Migration",
    target: "Vercel API + Railway",
    tasks: [
      { item: "Rewrite 39 backend functions as Vercel API routes", done: false, effort: "High", owner: "Engineer" },
      { item: "Replace base44.integrations.Core.InvokeLLM → Vercel AI SDK", done: false, effort: "Medium", owner: "Engineer" },
      { item: "Replace base44.integrations.Core.SendEmail → Resend/Direct SMTP", done: false, effort: "Low", owner: "Engineer" },
      { item: "Replace base44.integrations.Core.UploadFile → Supabase Storage", done: false, effort: "Low", owner: "Engineer" },
      { item: "Replace base44.integrations.Core.GenerateImage → direct API call", done: false, effort: "Low", owner: "Engineer" },
      { item: "Move long-running workers (swarm, scrapers) to Railway", done: false, effort: "Medium", owner: "Engineer" },
    ],
  },
  {
    phase: "Phase 4: Auth + Payments",
    target: "Supabase Auth + Stripe",
    tasks: [
      { item: "Replace Base44 AuthProvider → Supabase Auth context", done: false, effort: "High", owner: "Engineer" },
      { item: "Rewrite Login/Register/ForgotPassword/ResetPassword pages", done: false, effort: "Medium", owner: "Engineer" },
      { item: "Replace ProtectedRoute → Supabase session guard", done: false, effort: "Low", owner: "Engineer" },
      { item: "Replace Base44 Payments → Stripe Checkout + webhooks", done: false, effort: "High", owner: "Engineer" },
      { item: "Migrate Base44Purchase entity → Stripe subscription records", done: false, effort: "Medium", owner: "Engineer" },
    ],
  },
  {
    phase: "Phase 5: Workflows + Connectors",
    target: "Vercel Cron + Direct OAuth",
    tasks: [
      { item: "Rewrite 11 workflows as Vercel Cron jobs + Railway workers", done: false, effort: "High", owner: "Engineer" },
      { item: "Replace Base44 connectors → direct OAuth (Google Workspace, HubSpot, Facebook)", done: false, effort: "High", owner: "Engineer" },
      { item: "Set up webhook endpoints for Google Calendar + Gmail + Facebook", done: false, effort: "Medium", owner: "Engineer" },
      { item: "Replace Base44 agents → standalone AI agent runtime (LangChain/AI SDK)", done: false, effort: "High", owner: "Engineer" },
    ],
  },
  {
    phase: "Phase 6: Cutover + Testing",
    target: "Production",
    tasks: [
      { item: "DNS cutover: point domain to Vercel", done: false, effort: "Low", owner: "DevOps" },
      { item: "End-to-end test all 5 surfaces (public, admin, contractor, portal, SEO)", done: false, effort: "High", owner: "QA" },
      { item: "Verify all 11 workflows fire correctly on new infra", done: false, effort: "Medium", owner: "QA" },
      { item: "Verify swarm autopilot cycle runs on Railway", done: false, effort: "Medium", owner: "QA" },
      { item: "Decommission Base44 app (keep as backup)", done: false, effort: "Low", owner: "DevOps" },
    ],
  },
];

export default function MigrationTab() {
  const [checks, setChecks] = useState({});
  const toggle = (i) => setChecks((p) => ({ ...p, [i]: !p[i] }));

  const totalTasks = MIGRATION.reduce((n, p) => n + p.tasks.length, 0);
  const doneTasks = MIGRATION.reduce((n, p) => n + p.tasks.filter((_, i) => checks[`${p.phase}-${i}`]).length, 0);
  const pct = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-500" /> Migration Readiness Checklist</h2>
          <p className="text-xs text-stone-500 mt-0.5">Off-Base44 migration to Vercel + Supabase + Railway + Vercel AI Gateway</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-amber-600">{pct}%</div>
          <div className="text-[10px] text-stone-400">{doneTasks}/{totalTasks} tasks</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all" style={{ width: `${pct}%` }} />
      </div>

      {MIGRATION.map((phase) => (
        <div key={phase.phase}>
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold text-stone-900">{phase.phase}</h3>
            <span className="text-[10px] text-stone-400 font-mono">→ {phase.target}</span>
          </div>
          <div className="space-y-1.5">
            {phase.tasks.map((task, i) => {
              const key = `${phase.phase}-${i}`;
              const done = checks[key];
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className="w-full flex items-start gap-3 rounded-lg border border-stone-200 px-3 py-2.5 hover:border-amber-400 transition text-left"
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-stone-300 shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm flex-1 ${done ? "text-stone-400 line-through" : "text-stone-700"}`}>{task.item}</span>
                  <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded shrink-0">{task.effort}</span>
                  <span className="text-[10px] text-stone-400 shrink-0 hidden md:block">{task.owner}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-amber-900">Important</div>
          <p className="text-xs text-amber-700 mt-0.5">
            This migration is a full rebuild on a new codebase — it cannot be executed from within the Base44 builder. This checklist serves as the engineering spec for the migration team. Progress is tracked locally in this session.
          </p>
        </div>
      </div>
    </div>
  );
}