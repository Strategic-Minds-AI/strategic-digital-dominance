import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, FolderTree, Users, Calendar, FileText, Zap, CheckCircle2, AlertCircle, Shield, Clock, ChevronRight } from 'lucide-react';
import OrgChart from '@/components/google-workspace-os/OrgChart';
import DriveTree from '@/components/google-workspace-os/DriveTree';
import WeeklySchedule from '@/components/google-workspace-os/WeeklySchedule';
import AutonomousPipeline from '@/components/google-workspace-os/AutonomousPipeline';
import TemplateSystem from '@/components/google-workspace-os/TemplateSystem';

export default function GoogleWorkspaceOS() {
  const queryClient = useQueryClient();
  const [initializing, setInitializing] = useState(false);
  const [seedingAgents, setSeedingAgents] = useState(false);
  const [creatingTemplates, setCreatingTemplates] = useState(false);
  const [initResult, setInitResult] = useState(null);
  const [agentResult, setAgentResult] = useState(null);
  const [templateResult, setTemplateResult] = useState(null);
  const [error, setError] = useState('');

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['corporateAgents'],
    queryFn: async () => {
      const res = await base44.entities.AgentPersona.list('-created_date', 50);
      return res;
    },
  });

  const handleInitialize = useCallback(async () => {
    setInitializing(true);
    setError('');
    try {
      const res = await base44.functions.invoke('googleWorkspaceOS', { action: 'initialize' });
      setInitResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['corporateAgents'] });
    } catch (e) {
      setError(e.message);
    }
    setInitializing(false);
  }, [queryClient]);

  const handleSeedAgents = useCallback(async () => {
    setSeedingAgents(true);
    setError('');
    try {
      const res = await base44.functions.invoke('googleWorkspaceOS', { action: 'seed_agents' });
      setAgentResult(res.data);
      queryClient.invalidateQueries({ queryKey: ['corporateAgents'] });
    } catch (e) {
      setError(e.message);
    }
    setSeedingAgents(false);
  }, [queryClient]);

  const handleCreateTemplates = useCallback(async () => {
    setCreatingTemplates(true);
    setError('');
    try {
      const res = await base44.functions.invoke('googleWorkspaceOS', { action: 'create_templates' });
      setTemplateResult(res.data);
    } catch (e) {
      setError(e.message);
    }
    setCreatingTemplates(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Zap className="h-7 w-7 text-amber-500" />
            Google Workspace OS
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Strategic Minds AI — full company operating system. Drive, Calendar, Tasks, Gmail, Docs, Keep, Vault — all synced.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleInitialize}
            disabled={initializing}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:bg-amber-400 transition disabled:opacity-50"
          >
            {initializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {initializing ? 'Initializing...' : 'Initialize Full System'}
          </button>
          <button
            onClick={handleSeedAgents}
            disabled={seedingAgents}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
          >
            {seedingAgents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            {seedingAgents ? 'Seeding...' : 'Seed Agent Team'}
          </button>
          <button
            onClick={handleCreateTemplates}
            disabled={creatingTemplates}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
          >
            {creatingTemplates ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {creatingTemplates ? 'Creating...' : 'Create Templates'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Init Result */}
      {initResult && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-800">System Initialization Complete</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {initResult.results?.folders && (
              <ResultCard label="Drive Folders" value={initResult.results.folders.totalFolders || 0} url={initResult.results.folders.rootUrl} />
            )}
            {initResult.results?.tasks && (
              <ResultCard label="Tasks Lists" value={initResult.results.tasks.listsCreated || 0} />
            )}
            {initResult.results?.calendar && (
              <ResultCard label="Calendar Events" value={initResult.results.calendar.eventsCreated || 0} />
            )}
            {initResult.results?.agents && (
              <ResultCard label="Agent Personas" value={initResult.results.agents.created || 0} />
            )}
          </div>
          {initResult.results?.errors?.length > 0 && (
            <div className="mt-3 text-xs text-amber-700">
              ⚠️ Partial: {initResult.results.errors.join("; ")}
            </div>
          )}
        </div>
      )}

      {/* Agent Result */}
      {agentResult && (
        <div className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
          <span className="font-bold text-stone-800">Agent Team: </span>
          <span className="text-emerald-600">{agentResult.created || agentResult.agents?.created || 0} created</span>
          {agentResult.skipped > 0 && <span className="text-stone-500"> · {agentResult.skipped} already existed</span>}
        </div>
      )}

      {/* Template Result */}
      {templateResult && (
        <div className="rounded-xl border border-stone-200 bg-white p-3">
          <div className="text-sm font-bold text-stone-800 mb-2">
            Templates Created: {templateResult.docsCreated || 0}
          </div>
          {templateResult.docs?.length > 0 && (
            <div className="space-y-1">
              {templateResult.docs.map((d, i) => (
                <a key={i} href={d.url} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                  <FileText className="h-3 w-3" /> {d.name} <ChevronRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* System Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Org Chart */}
        <OrgChart agents={agents} loading={agentsLoading} />

        {/* Drive Tree */}
        <DriveTree />
      </div>

      {/* Weekly Schedule */}
      <WeeklySchedule />

      {/* Template System */}
      <TemplateSystem />

      {/* Autonomous Pipeline */}
      <AutonomousPipeline />

      {/* Footer */}
      <div className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-900 to-stone-800 p-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold">Strategic Minds AI — Operating System</h3>
              <p className="text-xs text-stone-400">Drive · Calendar · Tasks · Gmail · Docs · Keep · Vault · Contacts · Maps · Cloud</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Clock className="h-3.5 w-3.5" />
            Synced with GitHub · Vercel · Supabase · Railway · GoDaddy
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, url }) {
  return (
    <div className="rounded-lg bg-white p-3 border border-amber-200">
      <div className="text-2xl font-black text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
      {url && (
        <a href={url} target="_blank" rel="noopener" className="text-[10px] text-blue-600 hover:underline mt-1 block">
          Open in Drive →
        </a>
      )}
    </div>
  );
}