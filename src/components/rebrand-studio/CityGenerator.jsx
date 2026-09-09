import React, { useState, useMemo } from "react";
import { XPS_LOCATIONS, distanceMiles } from "@/lib/xpsLocations";
import { US_CITIES } from "@/lib/usCities";
import { MapPin, Radar, CheckCircle2, ChevronDown, ChevronUp, Building2 } from "lucide-react";

// Generate the list of US cities within `radius` miles of any selected XPS Xpress store.
// Each result city is anchored to its nearest store (with distance) so you can see coverage.
export function generateCitiesForStores(storeKeys, radiusMiles = 75) {
  const stores = XPS_LOCATIONS.filter((s) => storeKeys.includes(`${s.city}|${s.state}`) && s.status !== "coming_soon");
  if (!stores.length) return [];
  const seen = new Set();
  const results = [];
  for (const city of US_CITIES) {
    let nearest = null;
    let nearestDist = Infinity;
    for (const store of stores) {
      const d = distanceMiles(store.lat, store.lng, city.lat, city.lng);
      if (d < nearestDist) { nearestDist = d; nearest = store; }
    }
    if (nearest && nearestDist <= radiusMiles) {
      const key = `${city.city}|${city.state}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ ...city, distance: Math.round(nearestDist), nearestStore: nearest.city, nearestState: nearest.state });
    }
  }
  // Sort by nearest store then distance
  results.sort((a, b) => a.nearestStore.localeCompare(b.nearestStore) || a.distance - b.distance);
  return results;
}

export default function CityGenerator({ onApply, brand }) {
  const allStores = useMemo(
    () => XPS_LOCATIONS.filter((s) => s.status !== "coming_soon"),
    []
  );
  const [selected, setSelected] = useState(() => new Set(allStores.map((s) => `${s.city}|${s.state}`)));
  const [radius, setRadius] = useState(75);
  const [generated, setGenerated] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const toggleStore = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(allStores.map((s) => `${s.city}|${s.state}`)));
  const selectNone = () => setSelected(new Set());

  const run = () => {
    const cities = generateCitiesForStores(Array.from(selected), radius);
    setGenerated(cities);
  };

  const apply = () => {
    if (!generated) return;
    // Format: "City, ST" one per line — matches the mass-production textarea format
    const text = generated.map((c) => `${c.city}, ${c.state}`).join("\n");
    onApply(text);
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Radar className="h-5 w-5 text-amber-600" />
        <h4 className="font-bold text-stone-900 text-sm">XPS Xpress City Generator</h4>
        <span className="text-xs text-stone-500">— cities within {radius} mi of each store</span>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <label className="text-[10px] font-bold uppercase text-stone-500">Radius (miles)</label>
          <input type="number" min={10} max={300} value={radius} onChange={(e) => setRadius(Number(e.target.value) || 75)} className={inputCls + " mt-1 w-28"} />
        </div>
        <div className="flex gap-1.5">
          <button onClick={selectAll} className="h-10 px-3 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:border-amber-500">All stores</button>
          <button onClick={selectNone} className="h-10 px-3 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:border-amber-500">None</button>
        </div>
        <span className="text-xs text-stone-500 mb-2">{selected.size} of {allStores.length} stores selected</span>
      </div>

      <div className="mb-3">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-amber-600">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Hide" : "Show"} store list
        </button>
        {expanded && (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto p-1">
            {allStores.map((s) => {
              const key = `${s.city}|${s.state}`;
              const on = selected.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleStore(key)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium text-left transition ${on ? "border-amber-500 bg-amber-100 text-amber-800" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}
                >
                  <span className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${on ? "bg-amber-500 border-amber-500" : "border-stone-300"}`}>
                    {on && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </span>
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{s.city}, {s.state}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={run} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800">
          <Radar className="h-4 w-4" /> Generate Cities
        </button>
        {generated && (
          <button onClick={apply} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400">
            <Building2 className="h-4 w-4" /> Apply {generated.length} cities to Mass Production
          </button>
        )}
      </div>

      {generated && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-stone-600 mb-1.5">
            {generated.length} cities within {radius} mi of {selected.size} store{selected.size !== 1 ? "s" : ""}:
          </div>
          <div className="rounded-lg border border-stone-200 bg-white max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-stone-50 text-stone-500">
                <tr>
                  <th className="text-left px-2 py-1.5 font-semibold">City</th>
                  <th className="text-left px-2 py-1.5 font-semibold">Nearest Store</th>
                  <th className="text-right px-2 py-1.5 font-semibold">Dist (mi)</th>
                </tr>
              </thead>
              <tbody>
                {generated.map((c, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="px-2 py-1.5 text-stone-800">{c.city}, {c.state}</td>
                    <td className="px-2 py-1.5 text-stone-500">{c.nearestStore}, {c.nearestState}</td>
                    <td className="px-2 py-1.5 text-right text-stone-500">{c.distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}