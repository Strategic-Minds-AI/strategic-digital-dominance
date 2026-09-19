import React, { useState, useEffect } from "react";
import { Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, ShieldCheck, Globe, FileText, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSandbox } from "./SandboxContext";
import SandboxCard, { StatusBadge } from "./SandboxCard";

const CHECKLIST = [
  { id: "domain", label: "Domain Purchase", icon: Globe },
  { id: "vercel", label: "Vercel Project + Domain Attach", icon: Rocket },
  { id: "content", label: "Content Deploy", icon: FileText },
  { id: "sitemap", label: "Sitemap Generation", icon: FileText },
  { id: "gsc", label: "GSC Property + Sitemap Submit", icon: Search },
  { id: "indexnow", label: "IndexNow Ping", icon: Search },
  { id: "directories", label: "Directory Submissions", icon: Globe },
  { id: "social", label: "Social Profile Creation + First Posts", icon: Rocket },
];

export default function LaunchTab() {
  const { campaign, markTabComplete } = useSandbox();
  const [launching, setLaunching] = useState(false);
  const [campaignState, setCampaignState] = useState(null);
  const [stepStatus, setStepStatus] = useState({});
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  const launch = async () => {
    setLaunching(true);
    setError(null);
    setStepStatus({});
    try {
      const res = await base44.functions.invoke("dominanceEngine", {
        action: "launch",
        niche_id: campaign.nicheId,
        keyword: campaign.keyword,
        city: campaign.city,
        state: campaign.state,
        business_name: campaign.businessName,
        domain: campaign.domain,
        auto_purchase_domain: campaign.autoPurchase,
        auto_deploy_vercel: true,
      });
      const data = res?.data || res;
      setCampaignState(data);
      if (data?.campaign_id) {
        pollStatus(data.campaign_id);
      }
    } catch (e) {
      setError(e.message || "Launch failed");
      setLaunching(false);
    }
  };

  const pollStatus = async (campaignId) => {
    setPolling(true);
    let done = false;
    while (!done) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await base44.functions.invoke("dominanceEngine", { action: "getStatus", campaign_id: campaignId });
        const c = res?.data?.campaign;
        setCampaignState(c);
        if (c?.status === "completed" || c?.status === "failed") {
          done = true;
          if (c.status === "completed") {
            markTabComplete("launch");
            runAudit(c);
          }
        }
      } catch {
        done = true;
      }
    }
    setPolling(false);
    setLaunching(false);
  };

  const runAudit = async (c) => {
    try {
      const res = await base44.functions.invoke("siteHealthChecker", { url: c.vercel_deployment_url || `https://${c.domain}` });
      setAudit(res?.data || res);
    } catch {
      setAudit({ error: "Audit failed" });
    }
  };

  const phaseStatus = campaignState?.phase_status || {};

  return (
    <div className="space-y-4">
      {/* Launch control */}
      <SandboxCard title="Dominance Engine Launch" icon={Rocket} subtitle="Full 8-phase automated pipeline">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={launch} disabled={launching} className="ds-btn-primary">
            {launching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {launching ? "Launching..." : "Launch Dominance Campaign"}
          </button>
          {campaignState && <StatusBadge status={campaignState.status === "completed" ? "passed" : campaignState.status === "failed" ? "failed" : "running"} label={campaignState.status?.toUpperCase()} />}
        </div>

        {campaignState?.progress_percent !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="ds-label text-stone-500">Progress</span>
              <span className="ds-font-mono text-sm font-semibold text-amber-600">{campaignState.progress_percent}%</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all" style={{ width: `${campaignState.progress_percent}%` }} />
            </div>
            <p className="text-xs text-stone-500 mt-1">{campaignState.current_step_description}</p>
          </div>
        )}

        {/* Phase grid */}
        {Object.keys(phaseStatus).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(phaseStatus).map(([phase, status]) => (
              <div key={phase} className="flex items-center gap-2 px-2 py-1.5 border border-stone-200 rounded">
                {status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : status === "running" ? <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" /> : <XCircle className="h-3.5 w-3.5 text-stone-300" />}
                <span className="ds-label text-stone-600 truncate">{phase.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        )}
      </SandboxCard>

      {/* Checklist */}
      <SandboxCard title="Launch Checklist" icon={ShieldCheck} subtitle="Every step from provisioning to post-launch audit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CHECKLIST.map((step) => {
            const phaseDone = phaseStatus[step.id] === "completed" || phaseStatus[step.id] === "running";
            return (
              <div key={step.id} className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded">
                <step.icon className="h-4 w-4 text-stone-500" />
                <span className="text-sm text-stone-900 flex-1">{step.label}</span>
                {launching && phaseDone ? (
                  <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                ) : phaseStatus[step.id] === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <span className="ds-label text-stone-400">PENDING</span>
                )}
              </div>
            );
          })}
        </div>
      </SandboxCard>

      {/* Post-launch results */}
      {campaignState?.status === "completed" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SandboxCard>
              <div className="ds-label text-stone-500 mb-1">Deployed URL</div>
              {campaignState.vercel_deployment_url ? (
                <a href={campaignState.vercel_deployment_url} target="_blank" rel="noopener noreferrer" className="ds-font-mono text-sm text-amber-600 hover:underline flex items-center gap-1">
                  {campaignState.vercel_deployment_url} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-stone-400">Pending</span>
              )}
            </SandboxCard>
            <SandboxCard>
              <div className="ds-label text-stone-500 mb-1">Pages Generated</div>
              <div className="ds-font-mono text-xl font-bold text-stone-900">{campaignState.pages_generated || 0}</div>
            </SandboxCard>
            <SandboxCard>
              <div className="ds-label text-stone-500 mb-1">Fame Score</div>
              <div className="ds-font-mono text-xl font-bold text-amber-600">{campaignState.fame_score || 0}/100</div>
            </SandboxCard>
          </div>

          {audit && (
            <SandboxCard title="Post-Launch Audit Report" icon={ShieldCheck} subtitle="Live site health check">
              {audit.error ? (
                <div className="text-sm text-red-600">{audit.error}</div>
              ) : (
                <div className="space-y-1">
                  <AuditRow label="HTTP Status" value={audit.http_status || audit.status || "—"} ok={audit.http_status === 200 || audit.status === 200} />
                  <AuditRow label="SSL" value={audit.ssl_valid ? "Valid" : "Invalid"} ok={audit.ssl_valid} />
                  <AuditRow label="Title Tag" value={audit.title ? "Present" : "Missing"} ok={!!audit.title} />
                  <AuditRow label="Meta Description" value={audit.meta_description ? "Present" : "Missing"} ok={!!audit.meta_description} />
                  <AuditRow label="Schema Markup" value={audit.schema_present ? "Present" : "Missing"} ok={audit.schema_present} />
                  <AuditRow label="Broken Links" value={audit.broken_links?.length || 0} ok={(audit.broken_links?.length || 0) === 0} />
                </div>
              )}
            </SandboxCard>
          )}
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <XCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* GSC submission */}
      <SandboxCard title="Google Search Console Submission" icon={Search} subtitle="Immediate indexing request">
        {campaignState?.domain && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://search.google.com/search-console?url=${encodeURIComponent(campaignState.domain)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn-ghost"
            >
              <ExternalLink className="h-4 w-4" /> Open GSC for {campaignState.domain}
            </a>
            <a
              href={`https://www.google.com/ping?sitemap=https://${campaignState.domain}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn-ghost"
            >
              <ExternalLink className="h-4 w-4" /> Ping Sitemap
            </a>
          </div>
        )}
      </SandboxCard>
    </div>
  );
}

function AuditRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
      <span className="ds-label text-stone-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="ds-font-mono text-sm text-stone-900">{value}</span>
        {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-red-600" />}
      </div>
    </div>
  );
}