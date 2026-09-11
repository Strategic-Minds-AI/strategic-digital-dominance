import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SEO_ROUTES, SEO_LOCATIONS, locationPath } from "@/lib/seoConfig";
import { bustSeoOverrides } from "@/components/Seo";
import {
  Factory, Sparkles, Rocket, RefreshCw, Trash2, ExternalLink,
  Loader2, Wand2, CheckCircle2, AlertTriangle, FileText, Globe, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeoFactory() {
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Page generator form
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [intent, setIntent] = useState("");
  const [genBusy, setGenBusy] = useState(false);

  // AEO FAQ generator
  const [faqTopic, setFaqTopic] = useState("");
  const [faqRoute, setFaqRoute] = useState("/");
  const [faqBusy, setFaqBusy] = useState(false);

  // Quick actions
  const [actionBusy, setActionBusy] = useState({ opt: false, index: false, pull: false, sitemap: false, rss: false, gaps: false });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const loadPages = async () => {
    setLoadingPages(true);
    try {
      const rows = await base44.entities.GeneratedPage.list(200);
      setPages(rows);
    } catch { setPages([]); }
    setLoadingPages(false);
  };

  useEffect(() => { loadPages(); }, []);

  const generatePage = async () => {
    if (!keyword.trim()) { setError("Enter a keyword first."); return; }
    setGenBusy(true); setError(""); setMsg("");
    try {
      const res = await base44.functions.invoke("generateSeoPage", { keyword, city, intent });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setMsg(`Generated "${d.page.title}" → /${d.page.slug}`);
      setKeyword(""); setCity(""); setIntent("");
      await loadPages();
      bustSeoOverrides();
    } catch (e) { setError(e.message); }
    setGenBusy(false);
  };

  const deletePage = async (id, slug) => {
    if (!confirm(`Delete /${slug}? This removes the page.`)) return;
    try {
      await base44.entities.GeneratedPage.delete(id);
      await loadPages();
      bustSeoOverrides();
      setMsg(`Deleted /${slug}`);
    } catch (e) { setError(e.message); }
  };

  const generateFaq = async () => {
    if (!faqTopic.trim()) { setError("Enter a topic for the FAQ."); return; }
    setFaqBusy(true); setError(""); setMsg("");
    try {
      const res = await base44.functions.invoke('vercelAiGateway', {
        action: 'generateText',
        prompt: `Generate 6 concise FAQ Q&As about "${faqTopic}" for a garage floor coating company (EpoxyGarageFloorEstimate.com). Each answer must be factual, specific, and under 60 words. Pricing facts: $4-$12/sq ft installed; 2-car ~$2,400-$5,300; 3-car ~$3,600-$6,600; lasts 10-20 years; 1-2 day install. Return only JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } } } },
          },
        },
      });
      const faq = (res?.data?.parsed || {}).faq || [];
      const rows = await base44.entities.SeoContent.filter({ route: faqRoute });
      if (rows.length) {
        await base44.entities.SeoContent.update(rows[0].id, { faq });
      } else {
        const cfg = SEO_ROUTES[faqRoute] || {};
        await base44.entities.SeoContent.create({ route: faqRoute, title: cfg.title || faqTopic, description: cfg.description || "", faq, version: 1 });
      }
      bustSeoOverrides();
      setMsg(`Saved ${faq.length} FAQ Q&As to ${faqRoute}`);
      setFaqTopic("");
    } catch (e) { setError(e.message); }
    setFaqBusy(false);
  };

  const runAction = async (key, fn) => {
    setActionBusy((b) => ({ ...b, [key]: true })); setError(""); setMsg("");
    try {
      const res = await base44.functions.invoke(fn, {});
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      if (key === "opt") setMsg(`AI optimized ${d.improved || 0} pages.`);
      if (key === "index") setMsg(`Submitted ${d.urls || 0} URLs to indexers (IndexNow: ${d.indexNow?.status}, Yandex: ${d.yandex?.status}).`);
      if (key === "pull") setMsg(`Pulled Search Console data for ${d.siteUrl || "site"}.`);
      if (key === "sitemap") setMsg(`Dynamic sitemap generated — ${typeof d === "string" ? d.match(/<url>/g)?.length || "?" : "many"} URLs. View the function output to copy the XML.`);
      if (key === "rss") setMsg(`RSS feed generated — ${typeof d === "string" ? d.match(/<item>/g)?.length || 0 : 0} items.`);
      if (key === "gaps") setMsg(`Content gap auto-fill: found ${d.found || 0} topics, generated ${d.generated || 0} new pages.`);
    } catch (e) { setError(e.message); }
    setActionBusy((b) => ({ ...b, [key]: false }));
  };

  const routeKeys = Object.keys(SEO_ROUTES).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Factory className="h-6 w-6 text-amber-500" /> SEO & Content Factory
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Mass-produce keyword-targeted pages, generate AEO FAQ schema, and fire every indexing & optimization trick — all in one place.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {msg && !error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> {msg}
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Rocket className="h-5 w-5 text-amber-500" /> Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => runAction("pull", "pullSearchConsoleData")} disabled={actionBusy.pull}>
            {actionBusy.pull ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Pull Google data
          </Button>
          <Button onClick={() => runAction("opt", "optimizeSeo")} disabled={actionBusy.opt}>
            {actionBusy.opt ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />} Run AI optimizer
          </Button>
          <Button variant="outline" onClick={() => runAction("index", "submitToIndexers")} disabled={actionBusy.index}>
            {actionBusy.index ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />} Submit all URLs to indexers
          </Button>
          <Button variant="outline" onClick={() => runAction("sitemap", "generateSitemap")} disabled={actionBusy.sitemap}>
            {actionBusy.sitemap ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />} Generate dynamic sitemap
          </Button>
          <Button variant="outline" onClick={() => runAction("rss", "generateRss")} disabled={actionBusy.rss}>
            {actionBusy.rss ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />} Generate RSS feed
          </Button>
          <Button variant="outline" onClick={() => runAction("gaps", "fillContentGaps")} disabled={actionBusy.gaps}>
            {actionBusy.gaps ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />} Auto-fill content gaps
          </Button>
        </div>
      </div>

      {/* Content Factory — page generator */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Plus className="h-5 w-5 text-amber-500" /> Content Factory — generate a new SEO page</h2>
        <p className="text-sm text-stone-500">Enter a keyword (and optionally a city). AI writes a complete, original, optimized page and publishes it instantly to <code className="bg-stone-100 px-1 rounded">/{`{slug}`}</code>.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-stone-500">Keyword / topic *</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. polyaspartic vs epoxy" className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500">City (optional)</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Tampa" className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500">Intent (optional)</label>
            <input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="e.g. comparison" className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <Button onClick={generatePage} disabled={genBusy}>
          {genBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />} Generate page
        </Button>
      </div>

      {/* AEO Factory — FAQ generator */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-amber-500" /> AEO Factory — generate FAQ schema</h2>
        <p className="text-sm text-stone-500">Generate AI-powered FAQ Q&As for answer engines (Google AI Overviews, ChatGPT, Perplexity) and attach them to any route.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-stone-500">Topic *</label>
            <input value={faqTopic} onChange={(e) => setFaqTopic(e.target.value)} placeholder="e.g. epoxy floor maintenance" className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500">Attach to route</label>
            <select value={faqRoute} onChange={(e) => setFaqRoute(e.target.value)} className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {routeKeys.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <Button onClick={generateFaq} disabled={faqBusy}>
          {faqBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />} Generate & save FAQ
        </Button>
      </div>

      {/* Generated pages list */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-5 w-5 text-amber-500" /> Generated pages ({pages.length})</h2>
        {loadingPages ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-stone-400" /></div>
        ) : pages.length === 0 ? (
          <p className="text-sm text-stone-500">No pages yet. Use the Content Factory above to generate your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-stone-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Keyword</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-stone-600">{p.keyword || "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">/{p.slug}</td>
                    <td className="py-2 pr-4 max-w-xs truncate">{p.title}</td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                      <Link to={`/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 mr-3"><ExternalLink className="h-3.5 w-3.5" /> View</Link>
                      <button onClick={() => deletePage(p.id, p.slug)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coverage stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Static SEO routes" value={routeKeys.length} />
        <Stat label="Location pages" value={SEO_LOCATIONS.length} />
        <Stat label="AI-generated pages" value={pages.length} />
        <Stat label="Total indexable pages" value={routeKeys.length + pages.length} />
      </div>

      <p className="text-xs text-stone-400">
        Tip: generate pages for every question your customers ask (e.g. "how to clean epoxy garage floor", "polyaspartic vs epoxy cost", "best garage floor coating for hot climates"). Each new page is a new ranking opportunity and is auto-submitted to IndexNow.
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}