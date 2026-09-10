import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ListOrdered, Plus, Loader2, Globe, TrendingUp, Users, DollarSign, Search,
  Rocket, Activity, Crown,
} from "lucide-react";

const NICHES = [
  { value: "epoxy_garage", label: "Epoxy Garage" },
  { value: "decorative_concrete", label: "Decorative Concrete" },
  { value: "polished_concrete", label: "Polished Concrete" },
  { value: "epoxy_flooring", label: "Epoxy Flooring" },
  { value: "garage_coating", label: "Garage Coating" },
  { value: "concrete_resurfacing", label: "Concrete Resurfacing" },
];

const PATTERNS = [
  { value: "near_me", label: "near me" },
  { value: "near_you", label: "near you" },
  { value: "near_me_city", label: "near me + city" },
  { value: "city_state", label: "city, state" },
  { value: "cost", label: "cost" },
  { value: "best", label: "best" },
  { value: "affordable", label: "affordable" },
  { value: "local", label: "local" },
  { value: "pro", label: "pro" },
];

const STATUS_COLORS = {
  queued: "bg-stone-100 text-stone-600",
  researching: "bg-blue-100 text-blue-700",
  generating: "bg-amber-100 text-amber-700",
  deploying: "bg-purple-100 text-purple-700",
  live: "bg-green-100 text-green-700",
  monitoring: "bg-teal-100 text-teal-700",
  optimizing: "bg-indigo-100 text-indigo-700",
  archived: "bg-stone-200 text-stone-500",
};

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-stone-100 text-stone-600",
  low: "bg-stone-50 text-stone-400",
};

export default function WebsiteQueue() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    keyword: "", niche: "epoxy_garage", keyword_pattern: "near_me",
    target_city: "", target_state: "", priority: "normal",
  });
  const [bulkText, setBulkText] = useState("");

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["websiteQueue"],
    queryFn: async () => {
      const res = await base44.entities.WebsiteQueue.list("-created_date", 500);
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => base44.entities.WebsiteQueue.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["websiteQueue"] }),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (items) => base44.entities.WebsiteQueue.bulkCreate(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websiteQueue"] });
      setBulkText("");
      setShowBulk(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.WebsiteQueue.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["websiteQueue"] }),
  });

  const submitForm = () => {
    if (!formData.keyword) return;
    createMutation.mutate({
      ...formData,
      search_volume: 0,
      leads_generated: 0,
      revenue: 0,
      seo_score: 0,
      aeo_score: 0,
      traffic_score: 0,
      monthly_visitors: 0,
    });
    setFormData({ keyword: "", niche: "epoxy_garage", keyword_pattern: "near_me", target_city: "", target_state: "", priority: "normal" });
    setShowForm(false);
  };

  const submitBulk = () => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const items = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        keyword: parts[0] || line,
        niche: parts[1] || "epoxy_garage",
        keyword_pattern: parts[2] || "near_me",
        target_city: parts[3] || "",
        target_state: parts[4] || "",
        priority: parts[5] || "normal",
        search_volume: 0, leads_generated: 0, revenue: 0,
        seo_score: 0, aeo_score: 0, traffic_score: 0, monthly_visitors: 0,
      };
    });
    if (items.length > 0) bulkCreateMutation.mutate(items);
  };

  const filtered = filter === "all" ? queue : queue.filter((q) => q.status === filter);

  const stats = {
    total: queue.length,
    live: queue.filter((q) => q.status === "live").length,
    queued: queue.filter((q) => q.status === "queued").length,
    traffic: queue.reduce((s, q) => s + (q.monthly_visitors || 0), 0),
    leads: queue.reduce((s, q) => s + (q.leads_generated || 0), 0),
    revenue: queue.reduce((s, q) => s + (q.revenue || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListOrdered className="h-7 w-7 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Website Queue</h1>
            <p className="text-sm text-stone-500">Mass-produce strategic "near me" lead-gen sites — queue, generate, deploy, monitor.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(!showBulk)} className="h-10 px-4 rounded-lg border border-stone-300 bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50">
            Bulk Add
          </button>
          <button onClick={() => setShowForm(!showForm)} className="h-10 px-4 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add to Queue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatBox icon={ListOrdered} label="Total" value={stats.total} />
        <StatBox icon={Rocket} label="Live" value={stats.live} />
        <StatBox icon={Activity} label="Queued" value={stats.queued} />
        <StatBox icon={TrendingUp} label="Monthly Visits" value={stats.traffic.toLocaleString()} />
        <StatBox icon={Users} label="Leads" value={stats.leads} />
        <StatBox icon={DollarSign} label="Revenue" value={`$${stats.revenue.toLocaleString()}`} />
      </div>

      {/* Bulk add */}
      {showBulk && (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h3 className="font-bold text-stone-900 mb-2">Bulk Add to Queue</h3>
          <p className="text-sm text-stone-500 mb-3">
            One per line. Format: keyword, niche, pattern, city, state, priority (comma-separated, niche/pattern/city/state/priority optional)
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"epoxy garage floor near me, epoxy_garage, near_me\npolished concrete near me, polished_concrete, near_me, Dallas, TX, high\ngarage coating cost, garage_coating, cost, , , normal"}
            className="w-full rounded-lg border border-stone-300 p-3 font-mono text-sm"
          />
          <button
            onClick={submitBulk}
            disabled={bulkCreateMutation.isPending}
            className="mt-3 h-10 px-5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 disabled:opacity-60"
          >
            {bulkCreateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Add ${bulkText.split("\n").filter(Boolean).length} Sites`}
          </button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h3 className="font-bold text-stone-900 mb-4">Add to Queue</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Keyword (e.g. epoxy garage floors near me)"
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              className="col-span-2 h-10 rounded-lg border border-stone-300 px-3 text-sm"
            />
            <select value={formData.niche} onChange={(e) => setFormData({ ...formData, niche: e.target.value })} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
              {NICHES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
            <select value={formData.keyword_pattern} onChange={(e) => setFormData({ ...formData, keyword_pattern: e.target.value })} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
              {PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <input placeholder="City" value={formData.target_city} onChange={(e) => setFormData({ ...formData, target_city: e.target.value })} className="h-10 rounded-lg border border-stone-300 px-3 text-sm" />
            <input placeholder="State" value={formData.target_state} onChange={(e) => setFormData({ ...formData, target_state: e.target.value })} className="h-10 rounded-lg border border-stone-300 px-3 text-sm" />
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="h-10 rounded-lg border border-stone-300 px-3 text-sm">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button onClick={submitForm} disabled={!formData.keyword || createMutation.isPending} className="mt-4 h-10 px-5 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 disabled:opacity-60">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Queue"}
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "queued", "researching", "generating", "deploying", "live", "monitoring"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
              filter === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {s} {s !== "all" && `(${queue.filter((q) => q.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Queue table — the "digital sheet" */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-stone-400">
            <ListOrdered className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No sites in queue yet. Add your first strategic keyword to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-500 bg-stone-50">
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3 text-right">SEO</th>
                <th className="px-4 py-3 text-right">Traffic</th>
                <th className="px-4 py-3 text-right">Leads</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3">URL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-900">{q.keyword}</div>
                    <div className="text-xs text-stone-400">{q.niche} · {q.keyword_pattern}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {q.target_city ? `${q.target_city}, ${q.target_state || ""}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[q.status] || STATUS_COLORS.queued}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${PRIORITY_COLORS[q.priority] || PRIORITY_COLORS.normal}`}>
                      {q.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ScoreBar value={q.seo_score || 0} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-stone-700">{(q.monthly_visitors || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-stone-700">{q.leads_generated || 0}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">${(q.revenue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {q.generated_url ? (
                      <a href={q.generated_url} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" /> Live
                      </a>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-stone-500 mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-stone-900">{value}</div>
    </div>
  );
}

function ScoreBar({ value }) {
  const color = value >= 75 ? "bg-green-500" : value >= 50 ? "bg-amber-500" : value > 0 ? "bg-orange-500" : "bg-stone-200";
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-16 h-2 rounded-full bg-stone-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-600 w-8 text-right">{value}</span>
    </div>
  );
}