import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, Github, Database, Server, Globe, Loader2, CheckCircle2, AlertCircle, Rocket } from 'lucide-react';

const SERVICES = [
  { id: 'drive', name: 'Google Drive', icon: Cloud, desc: 'Provision folder structure & artifacts', action: 'provision_drive' },
  { id: 'github', name: 'GitHub Repo', icon: Github, desc: 'Create repo & push initial code', action: 'provision_github' },
  { id: 'supabase', name: 'Supabase', icon: Database, desc: 'Provision database & auth', action: 'provision_supabase' },
  { id: 'vercel', name: 'Vercel Deploy', icon: Server, desc: 'Deploy to production', action: 'provision_vercel' },
  { id: 'domain', name: 'Purchase URL', icon: Globe, desc: 'Buy domain via GoDaddy API', action: 'provision_domain' },
];

export default function ProvisioningSystem({ vision }) {
  const [provisioning, setProvisioning] = useState(null);
  const [results, setResults] = useState({});
  const [domainQuery, setDomainQuery] = useState('');
  const [domainResults, setDomainResults] = useState(null);
  const [error, setError] = useState(null);

  const provision = async (service) => {
    setProvisioning(service.id);
    setError(null);
    try {
      let result;
      if (service.id === 'domain') {
        result = await base44.functions.invoke('godaddyApi', { action: 'searchDomains', query: domainQuery || vision?.split(' ').slice(0, 2).join('') || 'ai-system' });
        setDomainResults(result.data || result);
      } else if (service.id === 'github') {
        result = await base44.functions.invoke('githubSync', { action: 'provision_repo', vision });
      } else if (service.id === 'vercel') {
        result = await base44.functions.invoke('vercelManager', { action: 'provision_project', vision });
      } else if (service.id === 'supabase') {
        result = await base44.functions.invoke('supabaseMigrationDeploy', { action: 'provision', vision });
      } else if (service.id === 'drive') {
        result = await base44.functions.invoke('googleWorkspaceSync', { action: 'provision_drive', vision });
      }
      setResults((prev) => ({ ...prev, [service.id]: { success: true, data: result?.data || result } }));
    } catch (e) {
      setResults((prev) => ({ ...prev, [service.id]: { success: false, error: e.message } }));
    } finally {
      setProvisioning(null);
    }
  };

  const provisionAll = async () => {
    for (const s of SERVICES) {
      await provision(s);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-black text-stone-900">Automated Provisioning System</h3>
        </div>
        <button onClick={provisionAll} disabled={!!provisioning} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-50">
          {provisioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {provisioning ? `Provisioning ${provisioning}...` : 'Provision All'}
        </button>
      </div>

      <div className="flex gap-2">
        <input value={domainQuery} onChange={(e) => setDomainQuery(e.target.value)} placeholder="Search domain name (e.g. ai-system)..." className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
        <button onClick={() => provision(SERVICES.find((s) => s.id === 'domain'))} disabled={provisioning === 'domain'} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 flex items-center gap-1.5">
          {provisioning === 'domain' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
          Search Domains
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const res = results[s.id];
          return (
            <div key={s.id} className={`rounded-xl border-2 p-3 ${res?.success ? 'border-green-300 bg-green-50' : res?.error ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-bold text-stone-900">{s.name}</span>
              </div>
              <p className="text-xs text-stone-400 mb-2">{s.desc}</p>
              <button onClick={() => provision(s)} disabled={provisioning === s.id} className="w-full rounded-lg bg-stone-900 text-white text-xs font-bold py-1.5 hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {provisioning === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : res?.success ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {provisioning === s.id ? 'Provisioning...' : res?.success ? 'Provisioned' : 'Provision'}
              </button>
              {res?.error && <p className="text-xs text-red-500 mt-1">{res.error}</p>}
            </div>
          );
        })}
      </div>

      {domainResults?.domains?.length > 0 && (
        <div className="rounded-lg border border-stone-200 p-3">
          <p className="text-xs font-bold text-stone-500 mb-2">AVAILABLE DOMAINS</p>
          <div className="space-y-1">
            {domainResults.domains.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700">{d.domain || d.fqdn}</span>
                <span className="text-amber-600 font-bold">{d.price || '$12.99'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}