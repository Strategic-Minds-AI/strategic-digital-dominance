import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Database, Lock, Unlock } from "lucide-react";

const ENTITIES = [
  { name: "Lead", group: "Lead Lifecycle", rls: false, core: true },
  { name: "ClientProject", group: "Lead Lifecycle", rls: false, core: true },
  { name: "ProjectUpdate", group: "Lead Lifecycle", rls: false, core: false },
  { name: "ChatMessage", group: "Lead Lifecycle", rls: false, core: false },
  { name: "Appointment", group: "Lead Lifecycle", rls: false, core: false },
  { name: "Referral", group: "Lead Lifecycle", rls: false, core: false },
  { name: "MaintenancePlan", group: "Lead Lifecycle", rls: false, core: false },
  { name: "Rating", group: "Lead Lifecycle", rls: false, core: false },
  { name: "Comment", group: "Lead Lifecycle", rls: false, core: false },
  { name: "SwarmTask", group: "Swarm Intelligence", rls: true, core: true },
  { name: "SwarmMessage", group: "Swarm Intelligence", rls: true, core: true },
  { name: "SwarmAudit", group: "Swarm Intelligence", rls: true, core: true },
  { name: "AgentPersona", group: "Swarm Intelligence", rls: false, core: false },
  { name: "AgentTemplate", group: "Swarm Intelligence", rls: false, core: false },
  { name: "IntelligenceReport", group: "Swarm Intelligence", rls: false, core: false },
  { name: "AnalyticsSnapshot", group: "Swarm Intelligence", rls: false, core: false },
  { name: "StrategyDocument", group: "Swarm Intelligence", rls: false, core: false },
  { name: "WebsiteTemplate", group: "Website Factory", rls: false, core: true },
  { name: "AppBuild", group: "Website Factory", rls: false, core: false },
  { name: "LaunchCampaign", group: "Website Factory", rls: false, core: true },
  { name: "GeneratedPage", group: "Website Factory", rls: false, core: false },
  { name: "SeoContent", group: "Website Factory", rls: false, core: false },
  { name: "CompetitorInsight", group: "Website Factory", rls: false, core: false },
  { name: "SocialPost", group: "Website Factory", rls: true, core: false },
  { name: "AppSettings", group: "System", rls: false, core: true },
  { name: "ApiKey", group: "System", rls: true, core: false },
  { name: "ClientPackage", group: "System", rls: false, core: false },
  { name: "PropertyLookup", group: "System", rls: true, core: false },
  { name: "SopLog", group: "System", rls: false, core: false },
  { name: "Sop", group: "System", rls: false, core: false },
  { name: "EmailLog", group: "System", rls: false, core: false },
  { name: "FunnelEvent", group: "System", rls: false, core: false },
  { name: "QuestionnaireResponse", group: "System", rls: false, core: false },
  { name: "Base44Purchase", group: "System", rls: false, core: false },
  { name: "Tool", group: "System", rls: false, core: false },
  { name: "TestRun", group: "System", rls: true, core: false },
  { name: "AiVoiceSession", group: "System", rls: false, core: false },
];

const GROUPS = ["Lead Lifecycle", "Swarm Intelligence", "Website Factory", "System"];

export default function DataTab() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results = {};
      await Promise.all(
        ENTITIES.map(async (e) => {
          try {
            const list = await base44.entities[e.name].list("-created_date", 1);
            results[e.name] = list?.length || 0;
          } catch {
            results[e.name] = null;
          }
        })
      );
      setCounts(results);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900">Entity Catalog (Data Model)</h2>
        <span className="text-xs text-stone-500">{ENTITIES.length} entities · {ENTITIES.filter(e => e.rls).length} RLS-secured</span>
      </div>

      {GROUPS.map((group) => {
        const groupEntities = ENTITIES.filter((e) => e.group === group);
        return (
          <div key={group}>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">{group} ({groupEntities.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {groupEntities.map((e) => (
                <div key={e.name} className="rounded-lg border border-stone-200 p-3 hover:border-amber-400 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-stone-900 font-mono">{e.name}</span>
                    {e.rls ? (
                      <Lock className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-stone-300" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    {e.core && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">CORE</span>}
                    {e.rls && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">RLS: ADMIN</span>}
                    <span className="text-stone-400 ml-auto">
                      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : counts[e.name] !== null ? `${counts[e.name]} records` : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start gap-2">
          <Database className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-900">Migration Note</div>
            <p className="text-xs text-amber-700 mt-0.5">
              Each entity maps to a Supabase Postgres table. Built-in fields (id, created_date, updated_date, created_by_id) become standard columns. RLS policies on Base44 entities translate to Supabase RLS using <code className="text-[10px] bg-amber-100 px-1 rounded">auth.role() = 'admin'</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}