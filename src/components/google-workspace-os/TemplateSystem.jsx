import React from 'react';
import { FileText, FileCheck, FileSpreadsheet, ClipboardList, FileSignature, Mail } from 'lucide-react';

const TEMPLATES = [
  { name: 'Client Proposal', icon: FileText, color: 'text-blue-600 bg-blue-50', desc: 'Standard proposal with scope, timeline, investment' },
  { name: 'Invoice', icon: FileSpreadsheet, color: 'text-green-600 bg-green-50', desc: 'Line items, payment terms, auto-numbered' },
  { name: 'Onboarding Questionnaire', icon: ClipboardList, color: 'text-amber-600 bg-amber-50', desc: '30 questions for skip tracing research' },
  { name: 'Statement of Work', icon: FileSignature, color: 'text-violet-600 bg-violet-50', desc: 'Phases, deliverables, acceptance criteria' },
  { name: 'Project Brief', icon: FileCheck, color: 'text-cyan-600 bg-cyan-50', desc: 'Team, tech stack, milestones, risks' },
  { name: 'Email Templates', icon: Mail, color: 'text-stone-600 bg-stone-50', desc: 'Follow-ups, reviews, support responses' },
];

export default function TemplateSystem() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200">
        <div className="h-9 w-9 rounded-lg bg-stone-900 grid place-items-center">
          <FileText className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-stone-900">Template Document System</h2>
          <p className="text-xs text-stone-500">Google Docs templates — click "Create Templates" to generate</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl, i) => (
          <div key={i} className="rounded-xl border border-stone-200 p-3 hover:border-amber-400 transition">
            <div className={`h-8 w-8 rounded-lg ${tpl.color} grid place-items-center mb-2`}>
              <tpl.icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-stone-900">{tpl.name}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">{tpl.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}