import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Rocket, Plus, Play, Pause, Check, Loader2, MapPin, TrendingUp, DollarSign, Calendar } from "lucide-react";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function NationalLaunch() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mode: "manual",
    target_states: [],
    target_cities: [],
    budget: 0,
    start_date: "",
    end_date: "",
    auto_deploy: false,
  });
  const [cityInput, setCityInput] = useState({ city: "", state: "FL" });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["launchCampaigns"],
    queryFn: () => base44.entities.LaunchCampaign.list("-created_date", 50),
  });

  const { data: templates } = useQuery({
    queryKey: ["websiteTemplates"],
    queryFn: () => base44.entities.WebsiteTemplate.list("-created_date", 50),
  });

  const toggleState = (st) => {
    const arr = form.target_states || [];
    setForm({ ...form, target_states: arr.includes(st) ? arr.filter((s) => s !== st) : [...arr, st] });
  };

  const addCity = () => {
    if (!cityInput.city) return;
    setForm({ ...form, target_cities: [...(form.target_cities || []), { ...cityInput, status: "pending" }] });
    setCityInput({ city: "", state: "FL" });
  };

  const createCampaign = async () => {
    if (!form.name) return;
    await base44.entities.LaunchCampaign.create({
      ...form,
      status: "planning",
      metrics: { sites_deployed: 0, leads_generated: 0, appointments_booked: 0, revenue: 0 },
      spent: 0,
    });
    setForm({ name: "", mode: "manual", target_states: [], target_cities: [], budget: 0, start_date: "", end_date: "", auto_deploy: false });
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["launchCampaigns"] });
  };

  const toggleCampaignStatus = async (c) => {
    const newStatus = c.status === "active" ? "paused" : "active";
    await base44.entities.LaunchCampaign.update(c.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["launchCampaigns"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-amber-500" /> National Launch System
          </h1>
          <p className="text-sm text-stone-500 mt-1">Deploy website templates across cities and states with manual, automated, or autonomous modes.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-6">
          <h3 className="font-bold text-stone-900 mb-4">Create Launch Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Campaign Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Florida National Launch Q4 2026" className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Launch Mode</label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none">
                <option value="manual">Manual — I approve each deploy</option>
                <option value="automated">Automated — Step-by-step with prompts</option>
                <option value="autonomous">Autonomous — Full auto-deploy all cities</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Budget ($)</label>
              <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Auto-Deploy New Cities</label>
              <select value={form.auto_deploy ? "yes" : "no"} onChange={(e) => setForm({ ...form, auto_deploy: e.target.value === "yes" })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none">
                <option value="no">No — Manual approval</option>
                <option value="yes">Yes — Deploy automatically</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 focus:border-amber-500 outline-none" />
            </div>
          </div>

          {/* Target states */}
          <div className="mt-4">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Target States ({(form.target_states || []).length} selected)</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {US_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => toggleState(st)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${(form.target_states || []).includes(st) ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Target cities */}
          <div className="mt-4">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Target Cities ({(form.target_cities || []).length})</label>
            <div className="mt-2 flex gap-2">
              <input value={cityInput.city} onChange={(e) => setCityInput({ ...cityInput, city: e.target.value })} placeholder="City name" className="flex-1 h-10 px-3 rounded-lg border border-stone-200 text-sm" />
              <select value={cityInput.state} onChange={(e) => setCityInput({ ...cityInput, state: e.target.value })} className="w-24 h-10 px-2 rounded-lg border border-stone-200 text-sm">
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={addCity} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold">Add</button>
            </div>
            {(form.target_cities || []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.target_cities.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 text-stone-600 text-xs font-semibold">
                    <MapPin className="h-3 w-3" /> {c.city}, {c.state}
                    <button onClick={() => setForm({ ...form, target_cities: form.target_cities.filter((_, idx) => idx !== i) })} className="text-stone-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={createCampaign} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400">
              <Check className="h-4 w-4" /> Create Campaign
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
        <div className="space-y-4">
          {(campaigns || []).map((c) => (
            <div key={c.id} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">{c.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.status === "active" ? "bg-green-100 text-green-700" : c.status === "paused" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}`}>
                      {c.status?.toUpperCase()}
                    </span>
                    <span className="text-xs text-stone-400 font-semibold uppercase">{c.mode} mode</span>
                    {c.auto_deploy && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">AUTO-DEPLOY</span>}
                  </div>
                </div>
                <button
                  onClick={() => toggleCampaignStatus(c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold ${c.status === "active" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-500 text-white hover:bg-green-600"}`}
                >
                  {c.status === "active" ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Activate</>}
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-stone-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold uppercase"><MapPin className="h-3 w-3" /> Cities</div>
                  <div className="text-xl font-bold text-stone-900 mt-1">{c.target_cities?.length || 0}</div>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold uppercase"><TrendingUp className="h-3 w-3" /> Sites Live</div>
                  <div className="text-xl font-bold text-stone-900 mt-1">{c.metrics?.sites_deployed || 0}</div>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold uppercase"><TrendingUp className="h-3 w-3" /> Leads</div>
                  <div className="text-xl font-bold text-stone-900 mt-1">{c.metrics?.leads_generated || 0}</div>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold uppercase"><DollarSign className="h-3 w-3" /> Revenue</div>
                  <div className="text-xl font-bold text-stone-900 mt-1">${(c.metrics?.revenue || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Target states */}
              {c.target_states?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.target_states.map((s) => <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-500">{s}</span>)}
                </div>
              )}

              {/* Budget */}
              <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
                <span>Budget: <strong className="text-stone-900">${(c.budget || 0).toLocaleString()}</strong></span>
                <span>Spent: <strong className="text-stone-900">${(c.spent || 0).toLocaleString()}</strong></span>
                {c.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.start_date}{c.end_date ? ` → ${c.end_date}` : ""}</span>}
              </div>
            </div>
          ))}
          {!isLoading && (!campaigns || campaigns.length === 0) && (
            <div className="text-center py-12 text-stone-400">
              <Rocket className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No campaigns yet. Create your first national launch campaign.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}