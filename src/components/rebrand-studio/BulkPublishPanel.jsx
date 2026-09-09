import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Rocket, Globe, Loader2, CheckCircle2, AlertCircle, Copy } from "lucide-react";

const PUBLISHED_URL = "https://epoxyquotenearme.com";
const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Path-based city page mappings — each template resolves to /{state}/{city}
// on the primary domain (rendered by the full contractor template). No subdomains.
function buildPathMappings(templates) {
  return (templates || [])
    .filter((t) => t.config?.primary_city && t.config?.primary_state)
    .map((t) => {
      const city = t.config.primary_city;
      const state = t.config.primary_state;
      return {
        templateId: t.id,
        url: `${PUBLISHED_URL}/${slugify(state)}/${slugify(city)}`,
        city,
        state,
        status: t.status,
      };
    });
}

export default function BulkPublishPanel({ brand, logoUrl, templates, rootDomain }) {
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const mappings = buildPathMappings(templates);

  const bulkPublish = async () => {
    if (!brand.company_name) { setError("Enter a company name in Step 1 first."); return; }
    setPublishing(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke("rebrandStudio", {
        action: "bulkPublish",
        brand,
        logoUrl,
      });
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["websiteTemplates"] });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setPublishing(false); }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-full bg-amber-500 text-stone-950 grid place-items-center font-bold text-sm">6</span>
        <h3 className="font-bold text-stone-900">Bulk Publish & DNS Routing</h3>
      </div>

      {/* Bulk publish */}
      <div className="rounded-xl border border-stone-200 p-4">
        <h4 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5"><Rocket className="h-4 w-4 text-amber-500" /> Push Brand Updates to All Sites</h4>
        <p className="text-sm text-stone-500 mb-3">Updates company name, phone, email, color scheme, and logo on all <strong>{(templates || []).length}</strong> saved templates at once. City-specific fields (slug, service area, domain) are preserved.</p>
        <button onClick={bulkPublish} disabled={publishing || !brand.company_name} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-60">
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} {publishing ? "Publishing…" : `Push to All ${(templates || []).length} Sites`}
        </button>
        {error && <div className="mt-3 flex items-start gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}</div>}
        {result && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span className="text-sm text-green-700">Updated <strong>{result.updated}</strong> templates with the latest brand config.</span>
          </div>
        )}
      </div>

      {/* Live URL routing */}
      <div className="rounded-xl border border-stone-200 p-4">
        <h4 className="font-semibold text-stone-800 text-sm mb-2 flex items-center gap-1.5"><Globe className="h-4 w-4 text-blue-500" /> Live URL Routing — Path-Based City Pages</h4>
        <p className="text-sm text-stone-500 mb-3">Each template publishes to a path-based city page on <code className="bg-stone-100 px-1 rounded">epoxyquotenearme.com</code> — no subdomains or DNS setup required. Pages are served by the full contractor template at <code className="bg-stone-100 px-1 rounded">/{`{state}`}/{`{city}`}</code>.</p>
        <div className="text-xs text-stone-500 mb-2">
          <strong>{mappings.length}</strong> city pages will be live:
        </div>
        <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-100 divide-y divide-stone-50">
          {mappings.slice(0, 80).map((m) => (
            <div key={m.templateId} className="px-3 py-2 text-xs flex items-center justify-between gap-2">
              <a href={m.url} target="_blank" rel="noopener" className="font-mono text-amber-600 hover:underline truncate">{m.url.replace(/^https?:\/\//, "")}</a>
              <span className="text-stone-400 shrink-0">→ {m.city}, {m.state}</span>
            </div>
          ))}
        </div>
        {mappings.length > 80 && <p className="text-xs text-stone-400 mt-1">+ {mappings.length - 80} more…</p>}
        {mappings.length === 0 && <p className="text-sm text-stone-400">Add a primary city and state to each template to generate its live URL.</p>}
      </div>
    </div>
  );
}