import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Layout, Plus, Search, Copy, Trash2, Star, Eye, Code,
  Globe, Tag, Loader2, Check, X, Layers, FileCode, Rocket,
  Home, FileText, MapPin, Mail, HelpCircle, DollarSign,
  Image, Star as StarIcon, Calculator, CheckCircle, AlertCircle
} from "lucide-react";

const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CATEGORIES = [
  { value: "homepage", label: "Homepages", icon: Home, color: "amber" },
  { value: "landing_page", label: "Landing Pages", icon: Rocket, color: "blue" },
  { value: "service_page", label: "Service Pages", icon: FileText, color: "green" },
  { value: "location_page", label: "Location Pages", icon: MapPin, color: "purple" },
  { value: "blog_post", label: "Blog Posts", icon: FileCode, color: "stone" },
  { value: "about_page", label: "About Pages", icon: Layers, color: "indigo" },
  { value: "contact_page", label: "Contact Pages", icon: Mail, color: "pink" },
  { value: "faq_page", label: "FAQ Pages", icon: HelpCircle, color: "cyan" },
  { value: "cost_page", label: "Cost Pages", icon: DollarSign, color: "emerald" },
  { value: "gallery_page", label: "Gallery Pages", icon: Image, color: "orange" },
  { value: "reviews_page", label: "Reviews Pages", icon: StarIcon, color: "yellow" },
  { value: "estimate_funnel", label: "Estimate Funnels", icon: Calculator, color: "red" },
  { value: "thank_you_page", label: "Thank You Pages", icon: CheckCircle, color: "teal" },
  { value: "email_template", label: "Email Templates", icon: Mail, color: "violet" },
  { value: "component", label: "Components", icon: Code, color: "slate" },
  { value: "section", label: "Sections", icon: Layers, color: "zinc" },
  { value: "custom", label: "Custom", icon: AlertCircle, color: "rose" },
];

const COLOR_CLASSES = {
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  stone: "bg-stone-100 text-stone-700 border-stone-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  red: "bg-red-100 text-red-700 border-red-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  zinc: "bg-zinc-100 text-zinc-700 border-zinc-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function TemplateManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [form, setForm] = useState({
    name: "", slug: "", category: "homepage", niche: "", description: "",
    content: "", tags: "", color_scheme: "amber", is_default: false,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templateLibrary"],
    queryFn: () => base44.entities.TemplateLibrary.list("-created_date", 200),
  });

  const filtered = useMemo(() => {
    if (!templates) return [];
    return templates.filter((t) => {
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      if (nicheFilter && t.niche !== nicheFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const match = t.name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag?.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [templates, activeCategory, nicheFilter, search]);

  const categoryCounts = useMemo(() => {
    if (!templates) return {};
    const counts = {};
    templates.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [templates]);

  const niches = useMemo(() => {
    if (!templates) return [];
    return [...new Set(templates.map((t) => t.niche).filter(Boolean))];
  }, [templates]);

  const saveTemplate = async () => {
    if (!form.name || !form.slug) return;
    const payload = {
      ...form,
      slug: slugify(form.slug),
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: "active",
    };
    if (editing) {
      await base44.entities.TemplateLibrary.update(editing.id, payload);
    } else {
      await base44.entities.TemplateLibrary.create(payload);
    }
    setForm({ name: "", slug: "", category: "homepage", niche: "", description: "", content: "", tags: "", color_scheme: "amber", is_default: false });
    setEditing(null);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["templateLibrary"] });
  };

  const cloneTemplate = async (t) => {
    await base44.entities.TemplateLibrary.create({
      name: `${t.name} (Copy)`,
      slug: `${t.slug}-copy`,
      category: t.category,
      niche: t.niche,
      description: t.description,
      content: t.content,
      sections: t.sections || [],
      tags: t.tags || [],
      color_scheme: t.color_scheme,
      parent_template_id: t.id,
      status: "draft",
      is_default: false,
    });
    queryClient.invalidateQueries({ queryKey: ["templateLibrary"] });
  };

  const deleteTemplate = async (t) => {
    if (!confirm(`Delete "${t.name}"? This cannot be undone.`)) return;
    await base44.entities.TemplateLibrary.delete(t.id);
    queryClient.invalidateQueries({ queryKey: ["templateLibrary"] });
  };

  const setDefault = async (t) => {
    // Unset other defaults in same category
    const sameCategory = (templates || []).filter((x) => x.category === t.category && x.is_default);
    for (const x of sameCategory) {
      if (x.id !== t.id) await base44.entities.TemplateLibrary.update(x.id, { is_default: false });
    }
    await base44.entities.TemplateLibrary.update(t.id, { is_default: !t.is_default });
    queryClient.invalidateQueries({ queryKey: ["templateLibrary"] });
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name || "",
      slug: t.slug || "",
      category: t.category || "homepage",
      niche: t.niche || "",
      description: t.description || "",
      content: t.content || "",
      tags: (t.tags || []).join(", "),
      color_scheme: t.color_scheme || "amber",
      is_default: t.is_default || false,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Layout className="h-6 w-6 text-amber-500" /> Template Library
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            House every template for your sites — homepages, landing pages, service pages, and more. Clone, edit, and deploy.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ name: "", slug: "", category: "homepage", niche: "", description: "", content: "", tags: "", color_scheme: "amber", is_default: false }); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-2xl font-black text-stone-900">{templates?.length || 0}</div>
          <div className="text-xs text-stone-500">Total Templates</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-2xl font-black text-stone-900">{Object.keys(categoryCounts).length}</div>
          <div className="text-xs text-stone-500">Categories</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-2xl font-black text-stone-900">{(templates || []).filter((t) => t.is_default).length}</div>
          <div className="text-xs text-stone-500">Default Templates</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-2xl font-black text-stone-900">{(templates || []).reduce((sum, t) => sum + (t.deploy_count || 0), 0)}</div>
          <div className="text-xs text-stone-500">Total Deploys</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition border ${
            activeCategory === "all" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-transparent bg-white text-stone-600 hover:border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Layers className="h-4 w-4" /> All ({templates?.length || 0})
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.value] || 0;
          if (count === 0 && activeCategory !== cat.value) return null;
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition border ${
                activeCategory === cat.value ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-transparent bg-white text-stone-600 hover:border-stone-200 hover:bg-stone-50"
              }`}
            >
              <Icon className="h-4 w-4" /> {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name, description, or tags..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
          />
        </div>
        {niches.length > 0 && (
          <select
            value={nicheFilter}
            onChange={(e) => setNicheFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white"
          >
            <option value="">All Niches</option>
            {niches.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900">{editing ? "Edit Template" : "New Template"}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="Epoxy Pro Homepage" className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="epoxy-pro-homepage" className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none bg-white">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Niche (optional)</label>
              <input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="epoxy, water_damage, roofing..." className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Color Scheme</label>
              <input value={form.color_scheme} onChange={(e) => setForm({ ...form, color_scheme: e.target.value })} placeholder="amber, blue, dark..." className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="modern, conversion, emergency" className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this template does and who it's for..." rows={2} className="mt-1 w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Content (JSX, HTML, or JSON)</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="<div>Template content here...</div>" rows={10} className="mt-1 w-full px-3 py-2 text-sm font-mono border border-stone-200 rounded-lg focus:border-amber-500 outline-none resize-y" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm font-semibold text-stone-700">Set as default for this category</span>
          </label>
          <div className="flex gap-3">
            <button onClick={saveTemplate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400">
              <Check className="h-4 w-4" /> {editing ? "Update" : "Create"} Template
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewing(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-stone-900">{previewing.name}</h3>
                <p className="text-xs text-stone-500">{previewing.category} · {previewing.niche || "universal"}</p>
              </div>
              <button onClick={() => setPreviewing(null)} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewing.description && <p className="text-sm text-stone-600 mb-4">{previewing.description}</p>}
              {previewing.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {previewing.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded text-xs font-semibold bg-stone-100 text-stone-600"><Tag className="h-3 w-3 inline mr-1" />{tag}</span>
                  ))}
                </div>
              )}
              {previewing.content ? (
                <pre className="text-xs font-mono bg-stone-950 text-stone-200 p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">{previewing.content}</pre>
              ) : (
                <p className="text-sm text-stone-400 text-center py-8">No content yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-stone-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Layout className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No templates found. {search || nicheFilter ? "Try clearing filters." : "Create your first template."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const cat = CATEGORIES.find((c) => c.value === t.category) || CATEGORIES[CATEGORIES.length - 1];
            const colorClass = COLOR_CLASSES[cat.color] || COLOR_CLASSES.stone;
            return (
              <div key={t.id} className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorClass}`}>
                      {cat.icon && <cat.icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{t.name}</h3>
                      <p className="text-xs text-stone-400">{t.slug}</p>
                    </div>
                  </div>
                  {t.is_default && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Star className="h-3 w-3" /> DEFAULT
                    </span>
                  )}
                </div>

                {t.description && <p className="text-xs text-stone-500 line-clamp-2 mb-3">{t.description}</p>}

                <div className="flex flex-wrap gap-1 mb-3">
                  {t.tags?.slice(0, 4).map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-500">{tag}</span>
                  ))}
                  {t.niche && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-600">{t.niche}</span>}
                </div>

                {t.deploy_count > 0 && (
                  <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {t.deploy_count} deploys</span>
                    {t.conversion_rate > 0 && <span className="flex items-center gap-1"><Rocket className="h-3 w-3" /> {t.conversion_rate}% conv</span>}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setPreviewing(t)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button onClick={() => startEdit(t)} className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50" title="Edit">
                    <Code className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => cloneTemplate(t)} className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50" title="Clone">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDefault(t)} className={`px-3 py-2 rounded-lg border ${t.is_default ? "border-amber-400 text-amber-600 bg-amber-50" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`} title="Toggle default">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteTemplate(t)} className="px-3 py-2 rounded-lg border border-stone-200 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}