import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TOOL_CATEGORIES, ALL_TOOLS } from "@/lib/toolCatalog";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, CheckCircle2, Circle, Factory, Smartphone, Rocket, ChevronRight } from "lucide-react";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";

const COLOR_MAP = {
  blue: "border-blue-500 bg-blue-50 text-blue-700",
  green: "border-green-500 bg-green-50 text-green-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  purple: "border-purple-500 bg-purple-50 text-purple-700",
  emerald: "border-emerald-500 bg-emerald-50 text-emerald-700",
  stone: "border-stone-500 bg-stone-100 text-stone-700",
};

export default function ToolHub() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const queryClient = useQueryClient();

  const { data: tools } = useQuery({
    queryKey: ["tools"],
    queryFn: () => base44.entities.Tool.list(),
  });

  const activeToolNames = useMemo(() => {
    return new Set((tools || []).filter((t) => t.active).map((t) => t.name));
  }, [tools]);

  const filtered = useMemo(() => {
    if (!search) return ALL_TOOLS;
    const q = search.toLowerCase();
    return ALL_TOOLS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.categoryName.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleTool = async (tool) => {
    const existing = (tools || []).find((t) => t.name === tool.name);
    if (existing) {
      await base44.entities.Tool.update(existing.id, { active: !existing.active });
    } else {
      await base44.entities.Tool.create({
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        edition: "home-designer",
        active: true,
        order: 0,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["tools"] });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="text-stone-300 hover:text-white" showLabel={false} />
            <Logo />
          </div>
          <span className="text-sm font-semibold text-amber-500 tracking-wide">XTREME TOOL HUB</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Tool Selection Hub</h1>
          <p className="mt-2 text-stone-500">
            All tools from the Xtreme platform — Cloud Browser, Auto Leads, Visualizer, Comms, SEO Generator, and Xtreme OS.
            Toggle tools on/off to control which are active in your app.
          </p>
        </div>

        {/* Factory quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/website-factory" className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-amber-500 transition group">
            <Factory className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-stone-900">Website Factory</h3>
            <p className="text-sm text-stone-500 mt-1">Turn this site into a template and generate new variants.</p>
            <ChevronRight className="h-4 w-4 text-stone-400 mt-3 group-hover:text-amber-500 transition" />
          </Link>
          <Link to="/admin/app-factory" className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-amber-500 transition group">
            <Smartphone className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-stone-900">App Factory</h3>
            <p className="text-sm text-stone-500 mt-1">Generate PWA mobile apps with bottom navigation.</p>
            <ChevronRight className="h-4 w-4 text-stone-400 mt-3 group-hover:text-amber-500 transition" />
          </Link>
          <Link to="/admin/national-launch" className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-amber-500 transition group">
            <Rocket className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-stone-900">National Launch</h3>
            <p className="text-sm text-stone-500 mt-1">Deploy sites across cities and states nationally.</p>
            <ChevronRight className="h-4 w-4 text-stone-400 mt-3 group-hover:text-amber-500 transition" />
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search 80+ tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-stone-200 bg-white text-stone-900 focus:border-amber-500 outline-none"
          />
        </div>

        {/* Category filter */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCat(null)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!activeCat ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"}`}
            >
              All ({ALL_TOOLS.length})
            </button>
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeCat === cat.id ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"}`}
              >
                {cat.name} ({cat.tools.length})
              </button>
            ))}
          </div>
        )}

        {/* Tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(search ? filtered : ALL_TOOLS.filter((t) => !activeCat || t.category === activeCat)).map((tool) => {
            const isActive = activeToolNames.has(tool.name);
            return (
              <button
                key={tool.name}
                onClick={() => toggleTool(tool)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition ${isActive ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"}`}
              >
                <div className="mt-0.5">
                  {isActive ? <CheckCircle2 className="h-5 w-5 text-amber-500" /> : <Circle className="h-5 w-5 text-stone-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{tool.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${COLOR_MAP[TOOL_CATEGORIES.find((c) => c.id === tool.category)?.color] || "border-stone-300 bg-stone-100 text-stone-600"}`}>
                      {tool.categoryName}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{tool.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}