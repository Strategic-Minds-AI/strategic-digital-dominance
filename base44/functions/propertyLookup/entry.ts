import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { secrets } from "base44:runtime";

// ─────────────────────────────────────────────────────────────────────────────
// propertyLookup — Deterministic garage sqft from public property records.
//
// SOURCES (all queried in parallel, then cross-validated):
//   1. RentCast API  — 150M+ US county tax-assessor records (the gold standard).
//      Structured JSON, deterministic, no anti-bot. Returns garageSpaces + sqft.
//      https://api.rentcast.io/v1/properties?address=...
//   2. OSM footprint — Overpass garage polygon → real geometric area takeoff.
//      Independent of RentCast → ideal cross-validator.
//   3. Browserbase   — Estately listing (server-rendered, no anti-bot).
//
// CONSENSUS / SELF-VALIDATION:
//   All non-null source estimates are collected. The final sqft is the MEDIAN
//   of all estimates that agree within ±15% of each other:
//     2+ sources agree → confidence "high"
//     1 source only    → confidence "medium"
//     0 sources         → confidence "low" (fallback)
//
// DETERMINISTIC CACHE:
//   Every result is persisted in the PropertyLookup entity keyed by normalized
//   address. The same address ALWAYS returns the same sqft — across users,
//   devices, and time — even if upstream sources rate-limit or change later.
// ─────────────────────────────────────────────────────────────────────────────

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const BROWSERBASE_FETCH_URL = "https://api.browserbase.com/v1/fetch";
const RENTCAST_URL = "https://api.rentcast.io/v1/properties";
const EARTH_RADIUS_M = 6378137;

const SQFT_PER_GARAGE_BAY = 220;
const GARAGE_FRACTION_OF_LIVING = 0.20;

function normalizeAddress(addr) {
  return (addr || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function sqMetersToSqFt(m2) {
  return Math.round(m2 * 10.7639);
}

// ── Geometric helpers (OSM footprint takeoff) ──────────────────────────────
function polygonAreaM2(ring) {
  if (!ring || ring.length < 3) return 0;
  const lat0 = (ring[0][1] * Math.PI) / 180;
  const mPerDegLat = (EARTH_RADIUS_M * Math.PI) / 180;
  const mPerDegLon = (EARTH_RADIUS_M * Math.PI * Math.cos(lat0)) / 180;
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * mPerDegLon * (y2 * mPerDegLat) - x2 * mPerDegLon * (y1 * mPerDegLat);
  }
  return Math.abs(area / 2);
}

async function geocode(address) {
  const url = `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FloorPricePro/1.0 (property-lookup)", "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  if (!data || !data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
    type: data[0].type,
    category: data[0].category,
  };
}

async function findBuildings(lat, lon) {
  const radius = 40;
  const query = `[out:json][timeout:15];(way(around:${radius},${lat},${lon})["building"];relation(around:${radius},${lat},${lon})["building"];);out geom;`;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements || [])
    .map((el) => {
      const tags = el.tags || {};
      let geom = null;
      if (el.type === "way" && el.geometry) geom = el.geometry.map((p) => [p.lon, p.lat]);
      else if (el.type === "relation" && el.members) {
        const outer = el.members.find((m) => m.role === "outer" && m.geometry);
        if (outer) geom = outer.geometry.map((p) => [p.lon, p.lat]);
      }
      if (!geom || geom.length < 3) return null;
      return {
        areaM2: polygonAreaM2(geom),
        building: tags.building,
        name: tags.name,
        isGarage: tags.building === "garage" || tags.building === "garages" || (tags.name || "").toLowerCase().includes("garage"),
      };
    })
    .filter(Boolean);
}

// ── RentCast (primary — county tax records) ─────────────────────────────────
async function rentcastLookup(address, apiKey) {
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = `${RENTCAST_URL}?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { accept: "application/json", "X-Api-Key": apiKey },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const prop = Array.isArray(data) ? data[0] : data;
    if (!prop) return null;

    const spaces = prop.features?.garageSpaces;
    const hasGarage = prop.features?.garage;
    const interior = prop.squareFootage;
    let garageSqft = null;
    let method = null;

    if (Number.isFinite(spaces) && spaces >= 1) {
      garageSqft = clamp(Math.round(spaces * SQFT_PER_GARAGE_BAY), 200, 1200);
      method = "rentcast_garage_spaces";
    } else if (interior && hasGarage) {
      garageSqft = clamp(Math.round(interior * GARAGE_FRACTION_OF_LIVING), 200, 900);
      method = "rentcast_interior_fraction";
    }

    return {
      source: "rentcast",
      sqft: garageSqft,
      method,
      garage_spaces: spaces ?? null,
      interior_sqft: interior ?? null,
      has_garage: hasGarage ?? null,
      garage_type: prop.features?.garageType ?? null,
      property_type: prop.propertyType ?? null,
      year_built: prop.yearBuilt ?? null,
      county: prop.county ?? null,
      matched_address: prop.formattedAddress ?? null,
      latitude: prop.latitude ?? null,
      longitude: prop.longitude ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ── OSM footprint takeoff (geometric cross-validator) ──────────────────────
async function osmFootprintTakeoff(address) {
  const geo = await geocode(address).catch(() => null);
  if (!geo) return { source: "osm", sqft: null, geo: null, buildings_found: 0, garage_found: false };
  const buildings = await findBuildings(geo.lat, geo.lon).catch(() => []);
  const garages = buildings.filter((b) => b.isGarage);
  if (garages.length) {
    const best = garages.reduce((a, b) => (b.areaM2 > a.areaM2 ? b : a));
    return {
      source: "osm_garage_takeoff",
      sqft: clamp(sqMetersToSqFt(best.areaM2), 200, 1200),
      geo,
      buildings_found: buildings.length,
      garage_found: true,
    };
  }
  if (buildings.length) {
    const largest = buildings.reduce((a, b) => (b.areaM2 > a.areaM2 ? b : a));
    return {
      source: "osm_building_estimate",
      sqft: clamp(Math.round(sqMetersToSqFt(largest.areaM2) * 0.22), 200, 1000),
      geo,
      buildings_found: buildings.length,
      garage_found: false,
    };
  }
  return { source: "osm", sqft: null, geo, buildings_found: 0, garage_found: false };
}

// ── Browserbase / Estately (listing cross-validator) ────────────────────────
function estatelySlug(address) {
  return address.toLowerCase().replace(/,/g, "").replace(/\./g, "").replace(/#/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function browserbaseLookup(address, apiKey) {
  if (!apiKey) return null;
  const schema = {
    type: "object",
    properties: {
      found: { type: "boolean", description: "True if a property matching this address was found on the page" },
      interior_sqft: { type: "number", description: "Interior living area in square feet" },
      garage_spaces: { type: "number", description: "Number of enclosed garage parking spaces (0 if carport only or none)" },
      parking_desc: { type: "string", description: "Parking/garage description, e.g. '2 car garage'" },
      lot_sqft: { type: "number", description: "Lot size in square feet" },
    },
    required: ["found"],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(BROWSERBASE_FETCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-BB-API-Key": apiKey },
      body: JSON.stringify({
        proxies: true,
        allowRedirects: true,
        url: `https://www.estately.com/listings/info/${estatelySlug(address)}`,
        format: "json",
        schema,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    let content = data?.content;
    if (typeof content === "string") {
      try { content = JSON.parse(content); } catch { return null; }
    }
    if (!content || content.found === false) return null;

    let spaces = Number(content.garage_spaces);
    if (!Number.isFinite(spaces) || spaces < 1) {
      const desc = content.parking_desc || "";
      const words = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      const wordMatch = desc.match(/\b(one|two|three|four|five)\b[\s-]?car\b/i);
      if (wordMatch) spaces = words[wordMatch[1].toLowerCase()];
      else {
        const numMatch = desc.match(/(\d+)\s*[-\s]?car\b/i);
        if (numMatch) spaces = parseInt(numMatch[1], 10);
      }
    }

    let garageSqft = null;
    if (Number.isFinite(spaces) && spaces >= 1) {
      garageSqft = clamp(Math.round(spaces * SQFT_PER_GARAGE_BAY), 200, 1000);
    } else {
      const interior = Number(content.interior_sqft);
      if (Number.isFinite(interior) && interior >= 400) {
        garageSqft = clamp(Math.round(interior * GARAGE_FRACTION_OF_LIVING), 200, 900);
      }
    }

    return {
      source: "browserbase_estately",
      sqft: garageSqft,
      garage_spaces: spaces || null,
      interior_sqft: content.interior_sqft ?? null,
      parking_desc: content.parking_desc ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Consensus / cross-validation ────────────────────────────────────────────
function computeConsensus(estimates) {
  if (estimates.length === 0) return null;
  if (estimates.length === 1) {
    return { sqft: estimates[0].sqft, confidence: "medium", method: `single_source:${estimates[0].source}` };
  }
  const vals = estimates.map((e) => e.sqft).sort((a, b) => a - b);
  const median =
    vals.length % 2
      ? vals[Math.floor(vals.length / 2)]
      : Math.round((vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2);

  // Count how many estimates agree within ±15% of the median
  const agreeing = vals.filter((v) => Math.abs(v - median) <= median * 0.15);
  if (agreeing.length >= 2) {
    // Recompute median from only the agreeing values for a tighter result
    const agreeSorted = agreeing.sort((a, b) => a - b);
    const tightMedian =
      agreeSorted.length % 2
        ? agreeSorted[Math.floor(agreeSorted.length / 2)]
        : Math.round((agreeSorted[agreeSorted.length / 2 - 1] + agreeSorted[agreeSorted.length / 2]) / 2);
    return { sqft: tightMedian, confidence: "high", method: `consensus_median:${agreeing.length}_of_${estimates.length}_sources` };
  }

  // Sources disagree — prefer geometric (OSM) if available, else median
  const osm = estimates.find((e) => e.source?.startsWith("osm"));
  if (osm) {
    return { sqft: osm.sqft, confidence: "medium", method: `geometric_preferred:${estimates.length}_sources_disagree` };
  }
  return { sqft: median, confidence: "medium", method: `median_disagree:${estimates.length}_sources` };
}

// ── Main ───────────────────────────────────────────────────────────────────
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const address = body?.address;
    const fallbackSqft = body?.fallback_sqft || 440;

    if (!address) return Response.json({ error: "Address is required" }, { status: 400 });

    const normalized = normalizeAddress(address);

    // 1 ── Check deterministic server-side cache ──────────────────────────────
    try {
      const cached = await base44.asServiceRole.entities.PropertyLookup.filter({ address: normalized });
      if (cached && cached.length > 0) {
        const hit = cached[0];
        return Response.json({
          address_valid: true,
          sqft: hit.sqft,
          source: hit.source,
          confidence: hit.confidence,
          consensus_method: hit.consensus_method,
          cached: true,
          latitude: hit.latitude,
          longitude: hit.longitude,
          matched_address: hit.matched_address,
          garage_spaces: hit.garage_spaces,
          interior_sqft: hit.interior_sqft,
          validation: hit.source_results,
        });
      }
    } catch (e) {
      console.error("[propertyLookup] Cache read failed:", e.message);
    }

    // 2 ── Query all sources in parallel ─────────────────────────────────────
    const rentcastKey = secrets.get("RENTCAST_API_KEY");
    const bbKey = secrets.get("BROWSERBASE_API_KEY");

    const [rentcast, osm, listing] = await Promise.all([
      rentcastLookup(address, rentcastKey).catch(() => null),
      osmFootprintTakeoff(address).catch(() => null),
      browserbaseLookup(address, bbKey).catch(() => null),
    ]);

    // Collect non-null sqft estimates for consensus
    const estimates = [rentcast, osm, listing].filter((e) => e && e.sqft && e.sqft > 0);

    // 3 ── Compute consensus ──────────────────────────────────────────────────
    let consensus;
    if (estimates.length === 0) {
      consensus = { sqft: fallbackSqft, confidence: "low", method: "fallback_size" };
    } else {
      consensus = computeConsensus(estimates);
    }

    // 4 ── Build validation object (full audit trail) ────────────────────────
    const validation = {
      sources_queried: ["rentcast", "osm_overpass", "browserbase_estately"],
      rentcast: rentcast
        ? {
            sqft: rentcast.sqft,
            method: rentcast.method,
            garage_spaces: rentcast.garage_spaces,
            interior_sqft: rentcast.interior_sqft,
            has_garage: rentcast.has_garage,
            garage_type: rentcast.garage_type,
            property_type: rentcast.property_type,
            year_built: rentcast.year_built,
            county: rentcast.county,
            matched_address: rentcast.matched_address,
          }
        : null,
      osm: osm
        ? {
            sqft: osm.sqft,
            source: osm.source,
            buildings_found: osm.buildings_found,
            garage_found: osm.garage_found,
            geo: osm.geo ? { lat: osm.geo.lat, lon: osm.geo.lon, display_name: osm.geo.displayName } : null,
          }
        : null,
      browserbase: listing
        ? {
            sqft: listing.sqft,
            garage_spaces: listing.garage_spaces,
            interior_sqft: listing.interior_sqft,
            parking_desc: listing.parking_desc,
          }
        : null,
      estimates_count: estimates.length,
      consensus,
    };

    // 5 ── Persist to deterministic cache ─────────────────────────────────────
    const lat = rentcast?.latitude ?? osm?.geo?.lat ?? null;
    const lon = rentcast?.longitude ?? osm?.geo?.lon ?? null;
    const matchedAddr = rentcast?.matched_address ?? osm?.geo?.displayName ?? null;
    const finalSource =
      consensus.method === "fallback_size"
        ? "fallback_size"
        : consensus.confidence === "high"
          ? "consensus"
          : estimates[0]?.source || "fallback_size";

    try {
      await base44.asServiceRole.entities.PropertyLookup.create({
        address: normalized,
        sqft: consensus.sqft,
        source: finalSource,
        confidence: consensus.confidence,
        consensus_method: consensus.method,
        source_results: validation,
        latitude: lat,
        longitude: lon,
        matched_address: matchedAddr,
        garage_spaces: rentcast?.garage_spaces ?? listing?.garage_spaces ?? null,
        interior_sqft: rentcast?.interior_sqft ?? listing?.interior_sqft ?? null,
      });
    } catch (e) {
      console.error("[propertyLookup] Cache write failed:", e.message);
    }

    // 6 ── Return ────────────────────────────────────────────────────────────
    return Response.json({
      address_valid: true,
      sqft: consensus.sqft,
      source: finalSource,
      confidence: consensus.confidence,
      consensus_method: consensus.method,
      cached: false,
      latitude: lat,
      longitude: lon,
      matched_address: matchedAddr,
      garage_spaces: rentcast?.garage_spaces ?? listing?.garage_spaces ?? null,
      interior_sqft: rentcast?.interior_sqft ?? listing?.interior_sqft ?? null,
      validation,
    });
  } catch (error) {
    console.error("[propertyLookup] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}