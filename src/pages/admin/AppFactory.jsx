import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Smartphone, Plus, Rocket, Check, Loader2, Download } from "lucide-react";

const DEFAULT_NAV = [
  { label: "Home", icon: "Home", route: "/" },
  { label: "Estimate", icon: "Calculator", route: "/estimate" },
  { label: "Visualizer", icon: "Eye", route: "/funnel" },
  { label: "Gallery", icon: "Images", route: "/gallery" },
  { label: "Contact", icon: "Phone", route: "/contact" },
];

export default function AppFactory() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [building, setBuilding] = useState(null);
  const [form, setForm] = useState({
    app_name: "",
    app_slug: "",
    template_id: "",
    platform: "pwa",
    manifest: {
      name: "",
      short_name: "",
      theme_color: "#D4AF37",
      background_color: "#FFFFFF",
      display: "standalone",
      orientation: "portrait",
    },
    nav_config: DEFAULT_NAV,
  });

  const { data: builds, isLoading } = useQuery({
    queryKey: ["appBuilds"],
    queryFn: () => base44.entities.AppBuild.list("-created_date", 50),
  });

  const { data: templates } = useQuery({
    queryKey: ["websiteTemplates"],
    queryFn: () => base44.entities.WebsiteTemplate.list("-created_date", 50),
  });

  const createBuild = async () => {
    if (!form.app_name || !form.app_slug) return;
    const slug = form.app_slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    await base44.entities.AppBuild.create({
      ...form,
      app_slug: slug,
      manifest: { ...form.manifest, name: form.manifest.name || form.app_name, short_name: form.manifest.short_name || form.app_name.substring(0, 12) },
      status: "queued",
    });
    setForm({ app_name: "", app_slug: "", template_id: "", platform: "pwa", manifest: { name: "", short_name: "", theme_color: "#D4AF37", background_color: "#FFFFFF", display: "standalone", orientation: "portrait" }, nav_config: DEFAULT_NAV });
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["appBuilds"] });
  };

  const build = async (appBuild) => {
    setBuilding(appBuild.id);
    try {
      // Update to building status
      await base44.entities.AppBuild.update(appBuild.id, { status: "building" });
      queryClient.invalidateQueries({ queryKey: ["appBuilds"] });

      // Simulate PWA build — generates manifest.json and configures bottom nav
      await new Promise((r) => setTimeout(r, 2000));

      await base44.entities.AppBuild.update(appBuild.id, {
        status: "built",
        build_log: JSON.stringify({
          steps: ["manifest_generated", "icons_created", "nav_configured", "service_worker_updated"],
          manifest: appBuild.manifest,
          nav: appBuild.nav_config,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["appBuilds"] });
    } catch (e) {
      console.error("Build failed:", e);
    }
    setBuilding(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-amber-500" /> App Factory
          </h1>
          <p className="text-sm text-stone-500 mt-1">Generate PWA mobile apps with bottom button navigation from any website template.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> New App Build
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h3 className="font-bold text-stone-900 mb-4">Configure PWA Build</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">App Name</label>
              <input value={form.app_name} onChange={(e) => setForm({ ...form, app_name: e.target.value })} placeholder="Epoxy Pro Florida" className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">App Slug</label>
              <input value={form.app_slug} onChange={(e) => setForm({ ...form, app_slug: e.target.value })} placeholder="epoxy-pro-fl" className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Source Template</label>
              <select value={form.template_id} onChange={(e) => setForm({ ...form, template_id: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none">
                <option value="">— Select template —</option>
                {(templates || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none">
                <option value="pwa">PWA (Progressive Web App)</option>
                <option value="ios">iOS Native</option>
                <option value="android">Android Native</option>
                <option value="both">iOS + Android</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Theme Color</label>
              <input type="color" value={form.manifest.theme_color} onChange={(e) => setForm({ ...form, manifest: { ...form.manifest, theme_color: e.target.value } })} className="mt-1 w-full h-10 rounded-lg border border-stone-200" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Background Color</label>
              <input type="color" value={form.manifest.background_color} onChange={(e) => setForm({ ...form, manifest: { ...form.manifest, background_color: e.target.value } })} className="mt-1 w-full h-10 rounded-lg border border-stone-200" />
            </div>
          </div>

          {/* Bottom nav config */}
          <div className="mt-4">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Bottom Navigation Buttons</label>
            <div className="mt-2 space-y-2">
              {form.nav_config.map((nav, i) => (
                <div key={i} className="flex gap-2">
                  <input value={nav.label} onChange={(e) => { const nc = [...form.nav_config]; nc[i] = { ...nc[i], label: e.target.value }; setForm({ ...form, nav_config: nc }); }} placeholder="Label" className="flex-1 h-10 px-3 rounded-lg border border-stone-200 text-sm" />
                  <input value={nav.icon} onChange={(e) => { const nc = [...form.nav_config]; nc[i] = { ...nc[i], icon: e.target.value }; setForm({ ...form, nav_config: nc }); }} placeholder="Icon" className="w-32 h-10 px-3 rounded-lg border border-stone-200 text-sm" />
                  <input value={nav.route} onChange={(e) => { const nc = [...form.nav_config]; nc[i] = { ...nc[i], route: e.target.value }; setForm({ ...form, nav_config: nc }); }} placeholder="/route" className="w-32 h-10 px-3 rounded-lg border border-stone-200 text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={createBuild} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400">
              <Check className="h-4 w-4" /> Queue Build
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-stone-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(builds || []).map((b) => (
            <div key={b.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-stone-900">{b.app_name}</h3>
                  <p className="text-xs text-stone-400">{b.app_slug}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${b.status === "built" || b.status === "published" ? "bg-green-100 text-green-700" : b.status === "building" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}`}>
                  {b.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="px-2 py-1 rounded bg-stone-100 font-semibold uppercase">{b.platform}</span>
                {b.manifest?.theme_color && <span className="inline-block w-4 h-4 rounded border border-stone-200" style={{ background: b.manifest.theme_color }} />}
                <span>{b.nav_config?.length || 0} nav buttons</span>
              </div>
              <div className="flex gap-2 mt-4">
                {b.status === "queued" && (
                  <button
                    onClick={() => build(b)}
                    disabled={building === b.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-60"
                  >
                    {building === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
                    {building === b.id ? "Building..." : "Build PWA"}
                  </button>
                )}
                {(b.status === "built" || b.status === "published") && (
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 text-white text-xs font-bold hover:bg-stone-800">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
              </div>
            </div>
          ))}
          {!isLoading && (!builds || builds.length === 0) && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No app builds yet. Create your first PWA build to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}