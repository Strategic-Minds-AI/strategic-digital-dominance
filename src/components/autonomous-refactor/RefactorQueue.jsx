import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock, Zap, FileCode, RefreshCw } from 'lucide-react';

const STATUS_ICONS = {
  identified: Clock,
  planning: Loader2,
  planned: FileCode,
  executing: Loader2,
  executed: FileCode,
  validating: Loader2,
  validated: CheckCircle2,
  failed: AlertCircle,
  converged: CheckCircle2,
  skipped: Clock,
};

const STATUS_COLORS = {
  identified: 'text-stone-500 bg-stone-100',
  planning: 'text-blue-600 bg-blue-100',
  planned: 'text-blue-600 bg-blue-100',
  executing: 'text-amber-600 bg-amber-100',
  executed: 'text-amber-600 bg-amber-100',
  validating: 'text-purple-600 bg-purple-100',
  validated: 'text-emerald-600 bg-emerald-100',
  failed: 'text-red-600 bg-red-100',
  converged: 'text-emerald-600 bg-emerald-100',
  skipped: 'text-stone-400 bg-stone-100',
};

const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-100',
  high: 'text-orange-600 bg-orange-100',
  medium: 'text-amber-600 bg-amber-100',
  low: 'text-stone-500 bg-stone-100',
};

export default function RefactorQueue() {
  const queryClient = useQueryClient();
  const [expandedJob, setExpandedJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['refactorJobs', filterStatus],
    queryFn: async () => {
      const all = await base44.entities.RefactorJob.list('-created_date', 100);
      if (filterStatus === 'all') return all;
      return all.filter(j => j.status === filterStatus);
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ jobId, action }) => {
      const res = await base44.functions.invoke('autonomousRefactorEngine', { action, job_id: jobId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refactorJobs'] });
      queryClient.invalidateQueries({ queryKey: ['refactorStats'] });
    },
  });

  const toggleJob = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleProcess = (jobId, action) => {
    processMutation.mutate({ jobId, action });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
        <FileCode className="h-10 w-10 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">No refactoring jobs yet. Run a scan to identify opportunities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-stone-900">Refactor Queue — {jobs.length} jobs</h2>
        <div className="flex gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['refactorJobs'] })}
            className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="all">All Status</option>
            <option value="identified">Identified</option>
            <option value="planned">Planned</option>
            <option value="executed">Executed</option>
            <option value="validated">Validated</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {jobs.map((job) => {
        const StatusIcon = STATUS_ICONS[job.status] || Clock;
        const isExpanded = expandedJob === job?.id;
        const isProcessing = processMutation.isPending && processMutation.variables?.jobId === job?.job_id;

        return (
          <div key={job.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden">
            <div
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50"
              onClick={() => toggleJob(job.id)}
            >
              <StatusIcon className={`h-4 w-4 shrink-0 ${job.status === 'planning' || job.status === 'executing' || job.status === 'validating' ? 'animate-spin' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-semibold text-stone-900 truncate">{job.target_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status] || 'bg-stone-100'}`}>
                    {job.status}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SEVERITY_COLORS[job.severity] || 'bg-stone-100'}`}>
                    {job.severity}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 truncate">{job.issue_description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {job.validation_score > 0 && (
                  <span className="text-xs font-bold text-stone-700">Score: {job.validation_score}</span>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-stone-100 p-4 space-y-3 bg-stone-50">
                {/* Issue details */}
                <div>
                  <h4 className="text-xs font-bold tracking-wide text-stone-500 uppercase mb-1">Issue</h4>
                  <p className="text-sm text-stone-700">{job.issue_description}</p>
                  <div className="flex gap-3 mt-1 text-xs text-stone-500">
                    <span>Type: <span className="font-medium text-stone-700 capitalize">{job.issue_type?.replace(/_/g, ' ')}</span></span>
                    <span>Target: <span className="font-medium text-stone-700 capitalize">{job.target_type?.replace(/_/g, ' ')}</span></span>
                  </div>
                </div>

                {/* Refactor plan */}
                {job.refactor_plan && (
                  <div>
                    <h4 className="text-xs font-bold tracking-wide text-stone-500 uppercase mb-1">Refactoring Plan</h4>
                    <PlanDisplay plan={job.refactor_plan} />
                  </div>
                )}

                {/* Validation result */}
                {job.validation_result && (
                  <div>
                    <h4 className="text-xs font-bold tracking-wide text-stone-500 uppercase mb-1">Validation</h4>
                    <ValidationDisplay result={job.validation_result} />
                  </div>
                )}

                {/* Error log */}
                {job.error_log && (
                  <div className="p-2 bg-red-50 rounded text-xs text-red-700">
                    <span className="font-bold">Error: </span>{job.error_log}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.status === 'identified' && (
                    <button
                      onClick={() => handleProcess(job.job_id, 'plan')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileCode className="h-3 w-3" />}
                      Generate Plan
                    </button>
                  )}
                  {job.status === 'planned' && (
                    <button
                      onClick={() => handleProcess(job.job_id, 'execute')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                      Execute Refactor
                    </button>
                  )}
                  {job.status === 'executed' && (
                    <button
                      onClick={() => handleProcess(job.job_id, 'validate')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                      Validate
                    </button>
                  )}
                  {(job.status === 'identified' || job.status === 'planned' || job.status === 'executed') && (
                    <button
                      onClick={() => {
                        handleProcess(job.job_id, 'plan');
                        setTimeout(() => handleProcess(job.job_id, 'execute'), 2000);
                        setTimeout(() => handleProcess(job.job_id, 'validate'), 4000);
                      }}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Zap className="h-3 w-3" />
                      Auto-Process All Phases
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlanDisplay({ plan }) {
  try {
    const p = typeof plan === 'string' ? JSON.parse(plan) : plan;
    return (
      <div className="space-y-2 text-sm">
        <p className="text-stone-700">{p.plan_summary}</p>
        {p.steps && p.steps.length > 0 && (
          <div>
            <span className="text-xs font-bold text-stone-500">Steps:</span>
            <ol className="list-decimal list-inside text-stone-600 ml-2">
              {p.steps.map((s, i) => <li key={i} className="text-xs">{s}</li>)}
            </ol>
          </div>
        )}
        {p.files_to_modify && p.files_to_modify.length > 0 && (
          <div>
            <span className="text-xs font-bold text-stone-500">Files to modify:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {p.files_to_modify.map((f, i) => (
                <code key={i} className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-700">{f}</code>
              ))}
            </div>
          </div>
        )}
        {p.files_to_create && p.files_to_create.length > 0 && (
          <div>
            <span className="text-xs font-bold text-stone-500">New files:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {p.files_to_create.map((f, i) => (
                <code key={i} className="text-xs bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">{f.path}</code>
              ))}
            </div>
          </div>
        )}
        {p.estimated_improvement && (
          <p className="text-xs text-emerald-600"><span className="font-bold">Improvement: </span>{p.estimated_improvement}</p>
        )}
      </div>
    );
  } catch {
    return <pre className="text-xs text-stone-600 overflow-x-auto">{plan}</pre>;
  }
}

function ValidationDisplay({ result }) {
  try {
    const v = typeof result === 'string' ? JSON.parse(result) : result;
    return (
      <div className="space-y-1 text-sm">
        <div className="flex gap-4">
          <span className={v.passed ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
            {v.passed ? '✓ PASSED' : '✗ FAILED'}
          </span>
          <span className="text-stone-700">Score: <span className="font-bold">{v.score}/100</span></span>
          <span className="text-stone-500">Recommendation: <span className="font-bold capitalize">{v.recommendation}</span></span>
        </div>
        {v.issues_found && v.issues_found.length > 0 && (
          <div>
            <span className="text-xs font-bold text-red-500">Issues:</span>
            <ul className="list-disc list-inside text-xs text-red-600 ml-2">
              {v.issues_found.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </div>
        )}
        {v.improvements && v.improvements.length > 0 && (
          <div>
            <span className="text-xs font-bold text-emerald-500">Improvements:</span>
            <ul className="list-disc list-inside text-xs text-emerald-600 ml-2">
              {v.improvements.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  } catch {
    return <pre className="text-xs text-stone-600 overflow-x-auto">{result}</pre>;
  }
}