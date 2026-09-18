import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, MapPin, Phone, Navigation } from "lucide-react";
import { ALL_XPS_LOCATIONS, nearestLocation } from "@/lib/xpsLocations";
import { useSettings } from "@/lib/useSettings";
import MapErrorBoundary from "@/components/home/MapErrorBoundary";

// Fix default marker icons in react-leaflet (webpack/CDN path issues)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Custom amber pin for XPS locations
const xpsIcon = L.divIcon({
  className: "",
  html: `<div style="background:#D9B835;color:#0c0a09;font-weight:700;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #0c0a09;"><span style="transform:rotate(45deg);font-size:13px;">X</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28]
});

const hqIcon = L.divIcon({
  className: "",
  html: `<div style="background:#0c0a09;color:#D9B835;font-weight:700;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.45);border:2px solid #D9B835;"><span style="transform:rotate(45deg);font-size:14px;">HQ</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30]
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="background:#2563eb;color:#fff;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Compass bearing (degrees) from point 1 to point 2 — used to aim Street
// View at the building facade.
function bearing(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Check if a coordinate pair is valid (finite numbers, not NaN)
function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng);
}

// Recenter the map when a target is set
function Recenter({ center, zoom, resetKey }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (center && isValidLatLng(center[0], center[1])) {
        map.flyTo(center, zoom, { duration: 1.4 });
      } else {
        map.flyTo([39.5, -98.35], 4, { duration: 1.2 });
      }
    } catch (e) {
      // Swallow Leaflet NaN LatLng errors — don't crash the page
      console.warn("[Recenter] flyTo failed:", e?.message || e);
    }
  }, [center, zoom, resetKey, map]);
  return null;
}

export default function LocationMap() {
  const { settings } = useSettings();
  const mapsKey = settings.google_maps_api_key;
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const mapRef = useRef(null);

  const handleReset = () => {
    setResult(null);
    setUserPos(null);
    setZip("");
    setError("");
    setResetKey((k) => k + 1);
  };

  const handleLookup = async (e) => {
    e?.preventDefault();
    const clean = zip.trim();
    if (!/^\d{5}$/.test(clean)) {
      setError("Enter a valid 5-digit ZIP code.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${clean}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      const place = data.places?.[0];
      if (!place) throw new Error("not found");
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      if (!isValidLatLng(lat, lng)) throw new Error("invalid coordinates");
      setUserPos({ lat, lng });
      const nearest = nearestLocation(lat, lng);
      // Use the store's precise geocoded coordinates when available; otherwise
      // runtime-geocode the address so Street View lands on the building.
      if (nearest.geocoded) {
        nearest.preciseLat = nearest.lat;
        nearest.preciseLng = nearest.lng;
      } else {
        const street = nearest.address.replace(/,?\s*(Suite|Ste|Unit|Apt|#)\s*.*/i, "");
        const fullAddr = `${street}, ${nearest.city}, ${nearest.state}`;
        try {
          let geoLat = null, geoLng = null;
          if (mapsKey) {
            try {
              const gRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddr)}&key=${mapsKey}`);
              const gData = await gRes.json();
              const loc = gData?.results?.[0]?.geometry?.location;
              if (gData?.status === "OK" && loc) { geoLat = loc.lat; geoLng = loc.lng; }
            } catch {}
          }
          if (geoLat === null) {
            const oRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddr)}&format=json&limit=1&countrycodes=us`);
            const oData = await oRes.json();
            if (oData?.[0]) { geoLat = parseFloat(oData[0].lat); geoLng = parseFloat(oData[0].lon); }
          }
          nearest.preciseLat = geoLat ?? nearest.lat;
          nearest.preciseLng = geoLng ?? nearest.lng;
        } catch {
          nearest.preciseLat = nearest.lat;
          nearest.preciseLng = nearest.lng;
        }
      }
      // Find the nearest Street View panorama and aim the camera at the
      // building facade by computing the bearing from the panorama toward
      // the geocoded building location.
      if (mapsKey && nearest.preciseLat) {
        try {
          const metaRes = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${nearest.preciseLat},${nearest.preciseLng}&key=${mapsKey}`);
          const meta = await metaRes.json();
          if (meta?.status === "OK" && meta.location) {
            nearest.panoId = meta.pano_id;
            nearest.heading = Math.round(bearing(meta.location.lat, meta.location.lng, nearest.preciseLat, nearest.preciseLng));
          }
        } catch {}
      }
      setResult(nearest);
    } catch {
      setError("We couldn't find that ZIP code. Please try another.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200 overflow-hidden bg-white shadow-sm">
      <div>
        {/* Map — full width so the entire USA is visible */}
        <div className="h-[380px] md:h-[460px] relative bg-stone-100">
          <MapErrorBoundary>
          {result && result.preciseLat && mapsKey ? (
            <iframe
              title="XPS Xpress storefront"
              src={`https://www.google.com/maps/embed/v1/streetview?key=${mapsKey}${result.panoId ? `&pano=${result.panoId}` : `&location=${result.preciseLat},${result.preciseLng}`}&heading=${result.heading ?? 0}&pitch=0`}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          ) : (
          <MapContainer
            center={[39.5, -98.35]}
            zoom={4}
            minZoom={3}
            maxZoom={18}
            zoomSnap={0.25}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {result && (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
            )}
            {ALL_XPS_LOCATIONS.filter((loc) => isValidLatLng(loc.lat, loc.lng)).map((loc, i) => (
              <Marker key={i} position={[loc.lat, loc.lng]} icon={loc.hq ? hqIcon : xpsIcon}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold text-stone-900">XPS Xpress — {loc.city}, {loc.state}</div>
                    <div className="text-stone-600">{loc.address}</div>
                    <a href={`tel:${loc.phone.replace(/[^\d]/g, "")}`} className="text-amber-600 font-semibold">{loc.phone}</a>
                    {loc.hq && <div className="text-[10px] font-bold text-amber-600 mt-1">HEADQUARTERS</div>}
                  </div>
                </Popup>
              </Marker>
            ))}
            {userPos && isValidLatLng(userPos.lat, userPos.lng) && (
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
                <Popup>You are here (ZIP {zip})</Popup>
              </Marker>
            )}
            <Recenter center={result ? [result.preciseLat || result.lat, result.preciseLng || result.lng] : userPos ? [userPos.lat, userPos.lng] : null} zoom={result ? 18 : 6} resetKey={resetKey} />
          </MapContainer>
          )}
          </MapErrorBoundary>
        </div>

        {/* Side panel */}
        <div className="p-6 lg:p-8 flex flex-col">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-amber-600">
            <MapPin className="h-4 w-4" /> FIND YOUR NEAREST STORE
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-stone-900">70+ XPS Xpress locations nationwide</h3>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            Enter your ZIP code and we'll show you the closest XPS Xpress epoxy supply store to your home.
          </p>

          <form onSubmit={handleLookup} className="mt-5 flex gap-2">
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="Enter ZIP code"
              inputMode="numeric"
              className="flex-1 h-12 px-4 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none text-stone-900 font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold transition"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span>{loading ? "Searching" : "Find"}</span>
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>}

          {result && (
            <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-700">
                <Navigation className="h-4 w-4" /> NEAREST LOCATION
              </div>
              <div className="mt-2 text-lg font-semibold text-stone-900">
                {result.city}, {result.state}
                {result.hq && <span className="ml-2 text-[10px] font-bold text-amber-600 align-middle">HQ</span>}
              </div>
              <div className="mt-1 text-sm text-stone-600">{result.address}</div>
              <div className="mt-1 text-sm text-stone-500">About {result.distance} miles from you</div>
              <button
                onClick={handleReset}
                className="mt-3 inline-flex h-9 px-3 items-center gap-1.5 rounded-lg border border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-900 text-xs font-semibold transition"
              >
                <MapPin className="h-3.5 w-3.5" /> View full map
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`XPS Xpress ${result.address} ${result.city} ${result.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-10 px-4 items-center gap-2 rounded-lg bg-stone-950 hover:bg-stone-800 text-white text-sm font-semibold transition"
              >
                <MapPin className="h-4 w-4" /> Get directions
              </a>
              <a href={`tel:${result.phone.replace(/[^\d]/g, "")}`} className="mt-2 flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800">
                <Phone className="h-4 w-4" /> {result.phone}
              </a>
            </div>
          )}

          {!result && !loading && (
            <p className="mt-5 text-xs text-stone-400">
              {ALL_XPS_LOCATIONS.length} stores shown on the map. Tap any pin for store details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}