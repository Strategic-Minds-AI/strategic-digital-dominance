import React from "react";
import { Clock, MousePointer, Webhook, Calendar, Bot, FileText, CreditCard, Radio } from "lucide-react";

const WORKFLOWS = [
  { name: "Swarm Autopilot", trigger: "scheduled", triggerDetail: "Every 30 minutes", purpose: "Audit → Fix → Heal → Harden → Optimize cycle across all systems", icon: Bot, active: true },
  { name: "Daily Lead Engine", trigger: "scheduled", triggerDetail: "Daily", purpose: "Scrape + enrich + score new leads from all sources", icon: Clock, active: true },
  { name: "Immediate Lead Follow-Up", trigger: "entity", triggerDetail: "Lead.created", purpose: "Instant outreach on new lead creation", icon: MousePointer, active: true },
  { name: "Lead Follow-Up", trigger: "scheduled", triggerDetail: "Multi-touch sequence", purpose: "Nurture sequence for unresponsive leads", icon: Clock, active: true },
  { name: "Social Media Autopilot", trigger: "scheduled", triggerDetail: "Daily", purpose: "AI content generation + Facebook auto-publish", icon: Calendar, active: true },
  { name: "Review Request", trigger: "entity", triggerDetail: "ClientProject → complete", purpose: "Auto-request Google review on project completion", icon: FileText, active: true },
  { name: "SEO Optimizer", trigger: "scheduled", triggerDetail: "Daily", purpose: "Content gap analysis + meta optimization", icon: Clock, active: true },
  { name: "SEO Update Notifier", trigger: "scheduled", triggerDetail: "Scheduled", purpose: "Alert on ranking changes and new GSC data", icon: Radio, active: true },
  { name: "Competitor Scanner", trigger: "scheduled", triggerDetail: "Scheduled", purpose: "Monitor competitor pricing, reviews, and activity", icon: Radio, active: true },
  { name: "Sitemap Auto-Update", trigger: "scheduled", triggerDetail: "Scheduled", purpose: "Regenerate sitemap + ping indexers", icon: Clock, active: true },
  { name: "Questionnaire Enforcement", trigger: "entity", triggerDetail: "Entity trigger", purpose: "Compliance gate enforcement", icon: MousePointer, active: true },
];

const TRIGGER_STYLES = {
  scheduled: { icon: Clock, label: "Scheduled", color: "blue" },
  entity: { icon: MousePointer, label: "Entity Trigger", color: "purple" },
  connector: { icon: Webhook, label: "Connector Webhook", color: "emerald" },
  app_payment: { icon: CreditCard, label: "Payment Event", color: "amber" },
};

export default function WorkflowsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900">Workflow Registry (Automations)</h2>
        <span className="text-xs text-stone-500">{WORKFLOWS.length} workflows · all active</span>
      </div>

      <div className="space-y-2">
        {WORKFLOWS.map((wf) => {
          const Icon = wf.icon;
          const trigger = TRIGGER_STYLES[wf.trigger] || TRIGGER_STYLES.scheduled;
          const TriggerIcon = trigger.icon;
          return (
            <div key={wf.name} className="rounded-xl border border-stone-200 p-4 hover:border-amber-400 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-stone-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-stone-900">{wf.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                  </div>
                  <p className="text-xs text-stone-500 mb-2">{wf.purpose}</p>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-${trigger.color}-100 text-${trigger.color}-700`}>
                      <TriggerIcon className="h-3 w-3" /> {trigger.label}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">{wf.triggerDetail}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-stone-900 p-5 text-white">
        <h3 className="text-sm font-bold text-amber-400 mb-3">Available Workflow Triggers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {Object.entries(TRIGGER_STYLES).map(([key, val]) => {
            const Icon = val.icon;
            return (
              <div key={key} className="flex items-center gap-2 rounded-lg bg-stone-800 px-3 py-2">
                <Icon className="h-4 w-4 text-amber-400" />
                <div>
                  <div className="font-bold text-white">{val.label}</div>
                  <div className="text-[10px] text-stone-400 font-mono">{key}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-stone-700 text-xs text-stone-400">
          Migration: Each workflow becomes a Vercel Cron job or Railway worker with the same trigger cadence.
        </div>
      </div>
    </div>
  );
}