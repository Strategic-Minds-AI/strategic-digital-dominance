import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, CheckCircle2, Clock, Zap, FileCode, TrendingUp } from 'lucide-react';

export default function RefactorStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['refactorStats'],
    queryFn: async () => {
      const res = await base44.functions.invoke('autonomousRefactorEngine', { action: 'status' });
      return res.data;
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-3 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const identified = stats.by_status?.identified || 0;
  const planned = stats.by_status?.planned || 0;
  const validated = stats.validated_count || 0;
  const failed = stats.by_status?.failed || 0;
  const critical = stats.by_severity?.critical || 0;
  const avgScore = stats.avg_validation_score || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      <StatCard icon={FileCode} label="Total Jobs" value={stats.total_jobs || 0} color="text-stone-700" />
      <StatCard icon={Clock} label="Identified" value={identified} color="text-amber-600" />
      <StatCard icon={Zap} label="Planned" value={planned} color="text-blue-600" />
      <StatCard icon={CheckCircle2} label="Validated" value={validated} color="text-emerald-600" />
      <StatCard icon={AlertCircle} label="Failed" value={failed} color="text-red-600" />
      <StatCard icon={TrendingUp} label="Avg Score" value={`${avgScore}/100`} color="text-purple-600" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}