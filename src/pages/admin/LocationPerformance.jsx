import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, TrendingUp, Users, MousePointerClick, Trophy, Search, ArrowUpDown } from "lucide-react";

function toSlug(city) {
  return (city || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
}

export default function LocationPerformance() {
  const [sortBy, setSortBy] = useState("leads");
  const [search, setSearch] = useState("");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["perf-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
  });

  const { data: events } = useQuery({
    queryKey: ["perf-pageviews"],
    queryFn: () => base44.entities.FunnelEvent.filter({ event: "page_view" }, "-created_date", 500),
  });

  // Aggregate leads by normalized city-state key
  const leadMap = useMemo(() => {
    const map = {};
    for (const lead of leads || []) {
      const state = (lead.state || "").toLowerCase();
      const slug = toSlug(lead.city);
      const key = `${state}-${slug}`;
      if (!map[key]) map[key] = { key, city: lead.city || slug, state: lead.state || "", leads: 0, revenue: 0 };
      map[key].leads++;
      if (lead.status === "WON" && lead.won_value) map[key].revenue += lead.won_value;
    }
    return map;
  }, [leads]);

  // Aggregate page views by parsing /{state}/{city} from event meta
  const viewMap = useMemo(() => {
    const map = {};
    for (const ev of events || []) {
      let meta = {};
      try { meta = JSON.parse(ev.meta || "{}"); } catch {}
      const m = (meta.path || "").match(/^\/([a-z]{2})\/([a-z0-9-]+)/i);
      if (!m) continue;
      const key = `${m[1].toLowerCase()}-${m[2].toLowerCase()}`;
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [events]);

  // Merge into sortable rows
  const rows = useMemo(() => {
    const allKeys = new Set([...Object.keys(leadMap), ...Object.keys(viewMap)]);
    const arr = [...allKeys].map((key) => {
      const c = leadMap[key] || { key, city: key.split("-").slice(1).join("-"), state: key.split("-")[0].toUpperCase(), leads: 0, revenue: 0 };
      const views = viewMap[key] || 0;
      const leadCount = c.leads || 0;
      return {
        key,
        city: c.city,
        state: c.state,
        leads: leadCount,
        pageViews: views,
        conversion: views > 0 ? ((leadCount / views) * 100).toFixed(1) + "%" : "—",
        revenue: c.revenue || 0,
      };
    });
    arr.sort((a, b) => {
      if (sortBy === "leads") return b.leads - a.leads;
      if (sortBy === "views") return b.pageViews - a.pageViews;
      if (sortBy === "conversion") return (parseFloat(b.conversion) || 0) - (parseFloat(a.conversion) || 0);
      if (sortBy === "revenue") return b.revenue - a.revenue;
      return 0;
    });
    return arr;
  }, [leadMap, viewMap, sortBy]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.city.toLowerCase().includes(q) || r.state.toLowerCase().includes(q);
  });

  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalViews = rows.reduce((s, r) => s + r.pageViews, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const topCity = rows[0];

  const cardCls = "rounded-2xl border border-stone-200 bg-white p-5";
  const statCls = "flex items-center gap-3";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-amber-500" /> Location Performance
        </h1>
        <p className="text-stone-500 mt-1">See which cities are generating the most clicks and leads across all your location sites.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={cardCls}>
          <div className={statCls}><div className="h-10 w-10 rounded-lg bg-amber-50 grid place-items-center"><Users className="h-5 w-5 text-amber-600" /></div><div><div className="text-2xl font-bold text-stone-900">{totalLeads}</div><div className="text-xs text-stone-500">Total Leads</div></div></div>
        </div>
        <div className={cardCls}>
          <div className={statCls}><div className="h-10 w-10 rounded-lg bg-blue-50 grid place-items-center"><MousePointerClick className="h-5 w-5 text-blue-600" /></div><div><div className="text-2xl font-bold text-stone-900">{totalViews.toLocaleString()}</div><div className="text-xs text-stone-500">Page Views</div></div></div>
        </div>
        <div className={cardCls}>
          <div className={statCls}><div className="h-10 w-10 rounded-lg bg-green-50 grid place-items-center"><TrendingUp className="h-5 w-5 text-green-600" /></div><div><div className="text-2xl font-bold text-stone-900">{totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0"}%</div><div className="text-xs text-stone-500">Conversion Rate</div></div></div>
        </div>
        <div className={cardCls}>
          <div className={statCls}><div className="h-10 w-10 rounded-lg bg-purple-50 grid place-items-center"><Trophy className="h-5 w-5 text-purple-600" /></div><div className="min-w-0"><div className="text-lg font-bold text-stone-900 truncate">{topCity ? `${topCity.city}, ${topCity.state}` : "—"}</div><div className="text-xs text-stone-500">Top City ({topCity?.leads || 0} leads)</div></div></div>
        </div>
      </div>

      {/* Search + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search city or state…" className="w-full h-10 pl-9 pr-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none" />
        </div>
        <div className="flex gap-1">
          {[
            { id: "leads", label: "Leads" },
            { id: "views", label: "Views" },
            { id: "conversion", label: "Conv %" },
            { id: "revenue", label: "Revenue" },
          ].map((s) => (
            <button key={s.id} onClick={() => setSortBy(s.id)} className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${sortBy === s.id ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
            No location data yet. Page views appear as visitors browse your city pages; leads appear as estimates are submitted.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-stone-600">#</th>
                  <th className="text-left px-4 py-3 font-bold text-stone-600">City</th>
                  <th className="text-left px-4 py-3 font-bold text-stone-600">State</th>
                  <th className="text-right px-4 py-3 font-bold text-stone-600">Page Views</th>
                  <th className="text-right px-4 py-3 font-bold text-stone-600">Leads</th>
                  <th className="text-right px-4 py-3 font-bold text-stone-600">Conv. Rate</th>
                  <th className="text-right px-4 py-3 font-bold text-stone-600">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.slice(0, 100).map((r, i) => (
                  <tr key={r.key} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{r.city}</td>
                    <td className="px-4 py-3 text-stone-600">{r.state}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-600">{r.pageViews.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-stone-900">{r.leads}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-600">{r.conversion}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-green-600 font-semibold">{r.revenue > 0 ? `$${r.revenue.toLocaleString()}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {filtered.length > 100 && <p className="text-xs text-stone-400 text-center">Showing top 100 of {filtered.length} cities. Use search to find specific locations.</p>}
    </div>
  );
}