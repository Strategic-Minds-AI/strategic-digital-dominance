import React from 'react';
import { Calendar, Clock, Search, Coffee, BarChart3, Code, Mail, FileText } from 'lucide-react';

const SCHEDULE = [
  {
    day: 'Monday',
    time: '9:00 AM',
    title: 'Weekly Opportunity Scan',
    description: 'Automated scan of Google Trends, competitor data, market gaps. Results → Drive/Research/Opportunity Scanner.',
    icon: Search,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    recurring: 'Weekly',
  },
  {
    day: 'Weekdays',
    time: '8:30 AM',
    title: 'Daily Agent Standup',
    description: 'Swarm standup — review yesterday, assign today, check system health.',
    icon: Coffee,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    recurring: 'Mon-Fri',
  },
  {
    day: 'Friday',
    time: '4:00 PM',
    title: 'Weekly Company Review',
    description: 'CEO + all VPs review progress, opportunities, deals, system health.',
    icon: BarChart3,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    recurring: 'Weekly',
  },
  {
    day: 'Weekly',
    time: 'Auto',
    title: 'Autonomous Code Pipeline',
    description: 'Cron-driven coding cycle: generate → validate → QA → deploy. Separate validator + QA agent.',
    icon: Code,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    recurring: 'Cron-driven',
  },
  {
    day: 'Daily',
    time: 'Auto',
    title: 'Email & Lead Sync',
    description: 'Gmail inbox processing, HubSpot sync, lead routing through corporate agents.',
    icon: Mail,
    color: 'text-stone-600 bg-stone-50 border-stone-200',
    recurring: 'Continuous',
  },
  {
    day: 'On-Demand',
    time: 'Auto',
    title: 'Template Generation',
    description: 'Proposals, invoices, onboarding questionnaires, SOWs, project briefs — generated in Google Docs.',
    icon: FileText,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    recurring: 'Triggered',
  },
];

export default function WeeklySchedule() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200">
        <div className="h-9 w-9 rounded-lg bg-stone-900 grid place-items-center">
          <Calendar className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-stone-900">Operating Schedule</h2>
          <p className="text-xs text-stone-500">Hour-by-hour, day-by-day, week-by-week automated cadence</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SCHEDULE.map((item, i) => (
          <div key={i} className={`rounded-xl border p-3 ${item.color}`}>
            <div className="flex items-start gap-2 mb-2">
              <item.icon className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-stone-600">{item.day}</span>
                  <span className="text-[10px] text-stone-400">·</span>
                  <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> {item.time}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-600">{item.description}</p>
            <span className="text-[9px] font-bold uppercase tracking-wide text-stone-400 mt-2 block">{item.recurring}</span>
          </div>
        ))}
      </div>
    </div>
  );
}