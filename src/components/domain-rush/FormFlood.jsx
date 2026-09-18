import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, Globe, Shield, TrendingUp, Bot, ExternalLink } from "lucide-react";

export default function FormFlood({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [businessName, setBusinessName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "generateFormFlood",
        keyword, businessName, domain,
      });
      setPlan(res.data?.form_flood_plan);
    } catch (e) {
      setError(e.message || "Plan generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Bot className="h-5 w-5 text-amber-500" />
            Form Flood Generator
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Generates a plan to use cloud browsers, form-filling agents, and AI to join every digital agency, directory, social page, forum, group, and account that would skyrocket digital growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Business Name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Pro Epoxy Garage" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Domain</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="epoxygaragenearme.com" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "Generating form flood plan..." : "Generate Form Flood Plan"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !plan && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Researching every platform, directory, and group to join...</p>
        </div>
      )}

      {plan?.platforms && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <Globe className="h-5 w-5 text-amber-500 mb-1" />
              <div className="text-2xl font-black text-stone-900">{plan.platforms.length}</div>
              <div className="text-xs text-stone-500">Platforms to Join</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <Bot className="h-5 w-5 text-emerald-500 mb-1" />
              <div className="text-2xl font-black text-emerald-600">{plan.platforms.filter(p => p.automation_possible).length}</div>
              <div className="text-xs text-emerald-700">Automatable</div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <TrendingUp className="h-5 w-5 text-amber-500 mb-1" />
              <div className="text-2xl font-black text-amber-600">{Math.round(plan.platforms.reduce((s, p) => s + (p.seo_value || 0), 0) / plan.platforms.length)}</div>
              <div className="text-xs text-amber-700">Avg SEO Value</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.platforms.map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{p.platform_name}</h3>
                    <p className="text-xs text-stone-500">{p.category}</p>
                  </div>
                  {p.automation_possible ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Bot className="h-2.5 w-2.5" /> Auto
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600">
                      Manual
                    </span>
                  )}
                </div>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 mb-2">
                    <ExternalLink className="h-3 w-3" /> {p.url}
                  </a>
                )}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-stone-400" /> {p.signup_difficulty}
                  </span>
                  <span className="text-stone-400">SEO: {p.seo_value}/10</span>
                  <span className="text-stone-400">Growth: {p.growth_potential}/10</span>
                </div>
                {p.form_fields_needed?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <p className="text-[10px] text-stone-500 mb-1">Fields needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {p.form_fields_needed.map((f, j) => (
                        <span key={j} className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {p.verification_needed && (
                  <p className="text-[10px] text-amber-600 mt-1">⚠ {p.verification_needed}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}