import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, Users, Radar, DollarSign, Globe, Activity, TrendingUp, MessageSquare, Rocket } from 'lucide-react';

const METRICS = [
  { key: 'leads', label: 'Total Leads', entity: 'Lead', icon: Users, color: 'amber' },
  { key: 'contractors', label: 'Scraped Contractors', entity: 'ContractorRecord', icon: Radar, color: 'emerald' },
  { key: 'competitors', label: 'Competitors Tracked', entity: 'CompetitorInsight', icon: TrendingUp, color: 'rose' },
  { key: 'campaigns', label: 'Active Campaigns', entity: 'LaunchCampaign', icon: Rocket, color: 'blue' },
  { key: 'templates', label: 'Website Templates', entity: 'WebsiteTemplate', icon: Globe, color: 'violet' },
  { key: 'agents', label: 'Active Agents', entity: 'AgentPersona', icon: Activity, color: 'amber' },
  { key: 'deployments', label: 'Deployments', entity: 'DeploymentRecord', icon: Globe, color: 'emerald' },
  { key: 'actions', label: 'Agent Actions', entity: 'AgentAction', icon: MessageSquare, color: 'blue' },
];

const colorMap = {
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
};

function MetricCard({ metric }) {
  const Icon = metric.icon;
  const { data, isLoading } = useQuery({
    queryKey: [`metric-${metric.key}`],
    queryFn: async () => {
      try {
        const items = await base44.entities[metric.entity].list('-created_date', 1);
        return items;
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });

  const count = data?.length || 0;

  return (
    <div className={`rounded-xl border-2 p-4 ${colorMap[metric.color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-6 w-6" />
        {isLoading ? (
          <div className="h-6 w-12 bg-stone-200 rounded animate-pulse" />
        ) : (
          <span className="text-2xl font-black">{count}</span>
        )}
      </div>
      <p className="text-xs font-bold">{metric.label}</p>
    </div>
  );
}

export default function MetricDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-amber-600" />
        <div>
          <h3 className="text-lg font-bold text-stone-900">System Metrics</h3>
          <p className="text-sm text-stone-500">Every launched system gets tracked here in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map((m) => (
          <MetricCard key={m.key} metric={m} />
        ))}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h4 className="text-sm font-bold text-stone-700 mb-2">How It Works</h4>
        <p className="text-xs text-stone-500">
          Each system you launch automatically creates its own metric tracking. As agents run, campaigns launch, and leads flow in,
          the numbers update in real-time. Use these metrics to measure dominance progress and identify which systems need more resources.
        </p>
      </div>
    </div>
  );
}