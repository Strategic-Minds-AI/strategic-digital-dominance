import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Wand2, Loader2, Sparkles, ScanLine, Eye, Save, CheckCircle2, AlertCircle,
  Image as ImageIcon, FileText, Rocket, Globe, Copy
} from "lucide-react";

const DEPLOY_TARGETS = [
  { id: "vercel", label: "Vercel", hint: "Frontend hosting (Next/Vite)" },
  { id: "supabase", label: "Supabase", hint: "Backend + DB + storage" },
  { id: "git", label: "Git Repo", hint: "Push source to a repo" },
  { id: "drive", label: "Google Drive", hint: "Export assets + config" },
];

const emptyConfig = {
  company_name: "", phone: "", email: "", domain: "",
  service_area: "", primary_city: "", primary_state: "", color_scheme: "amber",
};

export default function RebrandStudio() {
  const queryClient = useQueryClient();
  const [brand, setBrand] = useState({ ...emptyConfig, name: "", slug: "", tagline: "", logoStyle: "" });
  const [logoUrl, setLogoUrl] = useState("");
  const [genLogo, setGenLogo] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [deployTarget, setDeployTarget] = useState("vercel");
  const [saving, setSaving] = useState(false);
  const [savedTpl, setSavedTpl] = useState(null);
  const [error, setError] = useState(null);

  const { data: templates } = useQuery({
    queryKey: ["websiteTemplates"],
    queryFn: () => base44.entities.WebsiteTemplate.list("-created_date", 50),
  });

  const upd = (k, v) => setBrand({ ...brand, [k]: v });

  const generateLogo = async () => {
    if (!brand.company_name) { setError("Enter a company name first."); return; }
    setGenLogo(true); setError(null);
    try {
      const res = await base44.functions.invoke("rebrandStudio", {
        action: "generateLogo",
        companyName: brand.company_name,
        tagline: brand.tagline,
        style: brand.logoStyle,
      });
      setLogoUrl(res.data?.logo_url || "");
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setGenLogo(false); }
  };

  const runScan = async () => {
    setScanning(true); setScanError(null); setScan(null);
    try {
      const res = await base44.functions.invoke("rebrandStudio", { action: "scanSite", url: "https://epoxyquotenearme.base44.app" });
      setScan(res.data?.scan || null);
    } catch (e) { setScanError(e.response?.data?.error || e.message); }
    finally { setScanning(false); }
  };

  const saveTemplate = async () => {
    if (!brand.name || !brand.slug) { setError("Template name and slug are required."); return; }
    setSaving(true); setError(null);
    try {
      const slug = brand.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const tpl = await base44.entities.WebsiteTemplate.create({
        name: brand.name,
        slug,
        config: {
          company_name: brand.company_name, phone: brand.phone, email: brand.email,
          domain: brand.domain, service_area: brand.service_area,
          primary_city: brand.primary_city, primary_state: brand.primary_state,
          color_scheme: brand.color_scheme, pricing_tier: "standard",
          hero_image_url: logoUrl,
        },
        status: "configured",
        pwa_enabled: true,
        launch_mode: "manual",
        deploy_log: JSON.stringify({ deploy_target: deployTarget, rebrand_scan: scan ? "attached" : "none" }),
      });
      setSavedTpl(tpl);
      queryClient.invalidateQueries({ queryKey: ["websiteTemplates"] });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const labelCls = "text-xs font-bold text-stone-500 uppercase tracking-wide";
  const stepCls = "rounded-2xl border border-stone-200 bg-white p-6";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-amber-500" /> Rebrand Studio
        </h1>
        <p className="text-sm text-stone-500 mt-1">Intelligent rebrand workflow — generate a transparent logo, scan the site for everything that must change, preview the brand, and save a deploy-ready template.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><span className="text-sm text-red-700">{error}</span></div>}

      {/* STEP 1 — Brand details */}
      <div className={stepCls}>
        <div className="flex items-center gap-2 mb-4"><span className="h-7 w-7 rounded-full bg-amber-500 text-stone-950 grid place-items-center font-bold text-sm">1</span><h3 className="font-bold text-stone-900">Brand Details</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Template Name</label><input value={brand.name} onChange={(e) => upd("name", e.target.value)} placeholder="Epoxy Pro — Tampa" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Slug</label><input value={brand.slug} onChange={(e) => upd("slug", e.target.value)} placeholder="epoxy-pro-tampa" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Company Name</label><input value={brand.company_name} onChange={(e) => upd("company_name", e.target.value)} placeholder="Tampa Epoxy Floors" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Tagline (optional)</label><input value={brand.tagline} onChange={(e) => upd("tagline", e.target.value)} placeholder="Florida's #1 Garage Floor Coating" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Phone</label><input value={brand.phone} onChange={(e) => upd("phone", e.target.value)} placeholder="+1 813-555-0100" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Email</label><input value={brand.email} onChange={(e) => upd("email", e.target.value)} placeholder="info@tampaepoxy.com" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Domain</label><input value={brand.domain} onChange={(e) => upd("domain", e.target.value)} placeholder="tampaepoxy.com" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Service Area</label><input value={brand.service_area} onChange={(e) => upd("service_area", e.target.value)} placeholder="Tampa Bay, FL" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Primary City</label><input value={brand.primary_city} onChange={(e) => upd("primary_city", e.target.value)} placeholder="Tampa" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Primary State</label><input value={brand.primary_state} onChange={(e) => upd("primary_state", e.target.value)} placeholder="FL" className={inputCls + " mt-1"} /></div>
          <div><label className={labelCls}>Color Scheme</label>
            <select value={brand.color_scheme} onChange={(e) => upd("color_scheme", e.target.value)} className={inputCls + " mt-1"}>
              <option value="amber">Amber / Gold</option><option value="blue">Blue</option><option value="green">Green</option><option value="red">Red</option><option value="charcoal">Charcoal</option>
            </select>
          </div>
          <div><label className={labelCls}>Logo Style Hint (optional)</label><input value={brand.logoStyle} onChange={(e) => upd("logoStyle", e.target.value)} placeholder="Bold, industrial, metallic gold + black" className={inputCls + " mt-1"} /></div>
        </div>
      </div>

      {/* STEP 2 — Logo generator */}
      <div className={stepCls}>
        <div className="flex items-center gap-2 mb-4"><span className="h-7 w-7 rounded-full bg-amber-500 text-stone-950 grid place-items-center font-bold text-sm">2</span><h3 className="font-bold text-stone-900">Logo Generator (transparent PNG)</h3></div>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 w-full">
            <p className="text-sm text-stone-500 mb-3">Generates a transparent-background logo emblem using the AI gateway (gpt_image_1). Uses the company name + tagline + style hint above.</p>
            <button onClick={generateLogo} disabled={genLogo} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-60">
              {genLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {genLogo ? "Generating…" : "Generate Logo"}
            </button>
            {logoUrl && (
              <div className="mt-4 flex items-center gap-3">
                <a href={logoUrl} target="_blank" rel="noopener" className="text-xs text-amber-600 hover:underline flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Open logo URL</a>
                <button onClick={() => navigator.clipboard?.writeText(logoUrl)} className="text-xs text-stone-500 hover:text-amber-600 flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy URL</button>
              </div>
            )}
          </div>
          <div className="w-40 h-40 rounded-xl border-2 border-dashed border-stone-200 grid place-items-center bg-stone-50 overflow-hidden shrink-0">
            {logoUrl ? <img src={logoUrl} alt="Generated logo" className="w-full h-full object-contain" /> : <ImageIcon className="h-8 w-8 text-stone-300" />}
          </div>
        </div>
      </div>

      {/* STEP 3 — Content scan */}
      <div className={stepCls}>
        <div className="flex items-center gap-2 mb-4"><span className="h-7 w-7 rounded-full bg-amber-500 text-stone-950 grid place-items-center font-bold text-sm">3</span><h3 className="font-bold text-stone-900">Content Scan — Find Everything to Rebrand</h3></div>
        <p className="text-sm text-stone-500 mb-3">Scrapes the live site and uses AI to identify every piece of content (company name, phone, email, address, colors, keywords, CTAs, per-page changes) that must be swapped to rebrand.</p>
        <button onClick={runScan} disabled={scanning} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-60">
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />} {scanning ? "Scanning…" : "Scan Live Site"}
        </button>
        {scanError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{scanError}</div>}
        {scan && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {scan.company_name && <div className="rounded-lg bg-stone-50 p-3"><div className="text-[10px] font-bold uppercase text-stone-400">Current Company</div><div className="text-stone-800 font-semibold">{scan.company_name}</div></div>}
              {scan.phone && <div className="rounded-lg bg-stone-50 p-3"><div className="text-[10px] font-bold uppercase text-stone-400">Phone</div><div className="text-stone-800 font-semibold">{scan.phone}</div></div>}
              {scan.email && <div className="rounded-lg bg-stone-50 p-3"><div className="text-[10px] font-bold uppercase text-stone-400">Email</div><div className="text-stone-800 font-semibold">{scan.email}</div></div>}
              {scan.address && <div className="rounded-lg bg-stone-50 p-3"><div className="text-[10px] font-bold uppercase text-stone-400">Address</div><div className="text-stone-800 font-semibold">{scan.address}</div></div>}
              {scan.service_area && <div className="rounded-lg bg-stone-50 p-3"><div className="text-[10px] font-bold uppercase text-stone-400">Service Area</div><div className="text-stone-800 font-semibold">{scan.service_area}</div></div>}
              {scan.color_scheme && <div className="rounded-lg bg-stone-50 p-3"><div className="text-[10px] font-bold uppercase text-stone-400">Color Scheme</div><div className="text-stone-800 font-semibold">{scan.color_scheme}</div></div>}
            </div>
            {scan.minimum_changes?.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase text-stone-400 mb-2 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Minimum Changes to Launch</div>
                <ul className="space-y-1.5">
                  {scan.minimum_changes.map((c, i) => <li key={i} className="text-sm text-stone-700 flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /> {c}</li>)}
                </ul>
              </div>
            )}
            {scan.pages?.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase text-stone-400 mb-2">Per-Page Changes</div>
                <div className="space-y-2">
                  {scan.pages.map((p, i) => (
                    <div key={i} className="rounded-lg border border-stone-200 p-3">
                      <div className="text-sm font-semibold text-stone-900">{p.page}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{p.content_summary}</div>
                      {p.changes_needed?.length > 0 && <ul className="mt-2 space-y-1">{p.changes_needed.map((c, j) => <li key={j} className="text-xs text-stone-600 flex items-start gap-1.5"><span className="text-amber-500">•</span> {c}</li>)}</ul>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 4 — Preview & Save */}
      <div className={stepCls}>
        <div className="flex items-center gap-2 mb-4"><span className="h-7 w-7 rounded-full bg-amber-500 text-stone-950 grid place-items-center font-bold text-sm">4</span><h3 className="font-bold text-stone-900">Preview & Save Template</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview card */}
          <div>
            <div className="text-xs font-bold uppercase text-stone-400 mb-2 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Brand Preview</div>
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="bg-stone-950 px-4 py-3 flex items-center gap-3">
                {logoUrl ? <img src={logoUrl} alt="logo" className="h-8 w-8 object-contain" /> : <div className="h-8 w-8 rounded bg-stone-700 grid place-items-center text-stone-400 text-xs">LOGO</div>}
                <div className="text-white font-bold text-sm truncate">{brand.company_name || "Your Company"}</div>
                <a href={`tel:${brand.phone}`} className="ml-auto h-7 px-3 inline-flex items-center gap-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold">Call Us</a>
              </div>
              <div className="bg-gradient-to-b from-stone-50 to-white p-5 text-center">
                <div className="text-lg font-extrabold text-stone-900">{brand.company_name || "Your Company"}</div>
                {brand.tagline && <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide mt-1">{brand.tagline}</div>}
                <div className="text-sm text-stone-500 mt-2">{brand.service_area || "Service area"} · {brand.phone || "Phone"}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold">Get Free Estimate</div>
              </div>
            </div>
            <a href="https://epoxyquotenearme.base44.app" target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"><Globe className="h-3.5 w-3.5" /> Open live site reference</a>
          </div>

          {/* Deploy target + save */}
          <div>
            <div className="text-xs font-bold uppercase text-stone-400 mb-2 flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5" /> Deploy Target</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {DEPLOY_TARGETS.map((t) => (
                <button key={t.id} onClick={() => setDeployTarget(t.id)} className={`text-left p-3 rounded-xl border transition ${deployTarget === t.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}>
                  <div className="text-sm font-bold text-stone-900">{t.label}</div>
                  <div className="text-[11px] text-stone-500">{t.hint}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mb-4">Saving creates a configured <strong>WebsiteTemplate</strong> (logo + brand config + scan attached) ready for the Website Factory / National Launch. Actual deployment to each platform is wired in the next step.</p>
            <button onClick={saveTemplate} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? "Saving…" : "Save Rebranded Template"}
            </button>
            {savedTpl && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div className="text-sm text-green-700">Saved template <strong>{savedTpl.name}</strong> ({savedTpl.slug}). Deploy it from the Website Factory.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Existing templates */}
      <div className="border-t border-stone-100 pt-4">
        <h3 className="font-semibold text-stone-700 text-sm mb-2">Saved Rebranded Templates ({(templates || []).length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(templates || []).map((t) => (
            <div key={t.id} className="rounded-xl border border-stone-200 bg-white p-3 flex items-center gap-3">
              {t.config?.hero_image_url ? <img src={t.config.hero_image_url} alt="logo" className="h-10 w-10 object-contain rounded bg-stone-50" /> : <div className="h-10 w-10 rounded bg-stone-100 grid place-items-center text-stone-400 text-[10px]">LOGO</div>}
              <div className="min-w-0">
                <div className="text-sm font-semibold text-stone-900 truncate">{t.name}</div>
                <div className="text-xs text-stone-400 truncate">{t.config?.company_name || t.slug}</div>
              </div>
              <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${t.status === "live" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>{(t.status || "").toUpperCase()}</span>
            </div>
          ))}
          {(!templates || templates.length === 0) && <p className="text-sm text-stone-400">No templates yet.</p>}
        </div>
      </div>
    </div>
  );
}