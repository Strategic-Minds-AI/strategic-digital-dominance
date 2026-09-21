import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  GraduationCap,
  HardHat,
  Building2,
  Phone,
  MapPin,
  ExternalLink,
  ArrowRight,
  Calendar
} from "lucide-react";
import { XPS_LOCATIONS, XPS_CANADA_LOCATIONS, ALL_XPS_LOCATIONS } from "@/lib/xpsLocations";
import {
  PCU_LOCATIONS,
  NCP_INFO,
  NCP_SERVICE_AREAS,
  NEP_INFO
} from "@/lib/brandLocations";
import { trackEvent } from "@/lib/tracking";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import Footer from "@/components/home/Footer";

// Group the XPS Xpress stores by state for a readable listing.
function groupByState(locations) {
  const map = {};
  for (const loc of locations) {
    if (!map[loc.state]) map[loc.state] = [];
    map[loc.state].push(loc);
  }
  return Object.keys(map)
    .sort()
    .map((state) => ({ state, stores: map[state] }));
}

const STATE_NAMES = {
  FL: "Florida", TX: "Texas", VA: "Virginia", DC: "District of Columbia",
  NY: "New York", NJ: "New Jersey", PA: "Pennsylvania", SC: "South Carolina",
  GA: "Georgia", NC: "North Carolina", OK: "Oklahoma", WI: "Wisconsin",
  TN: "Tennessee", KY: "Kentucky", IA: "Iowa", IL: "Illinois", MI: "Michigan",
  CO: "Colorado", IN: "Indiana", OH: "Ohio", NM: "New Mexico", NV: "Nevada",
  UT: "Utah", CA: "California", AZ: "Arizona",
  ON: "Ontario",
  BC: "British Columbia",
  AB: "Alberta"
};

function SectionHeader({ icon: Icon, kicker, title, subtitle }) {
  return (
    <div className="mb-10">
      <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-amber-600">
        <Icon className="h-4 w-4" /> {kicker}
      </div>
      <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-stone-600 max-w-3xl leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

export default function Locations() {
  useEffect(() => {
    trackEvent("page_view", { page: "/locations" });
  }, []);

  const grouped = groupByState(XPS_LOCATIONS);
  const canadaGrouped = groupByState(XPS_CANADA_LOCATIONS);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-stone-950 text-white px-6 pt-16 pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BackButton className="text-stone-300 hover:text-white" showLabel={false} />
              <Logo />
            </div>
            <Link to="/funnel" className="text-sm text-amber-400 hover:text-amber-300 font-semibold">Free Estimate →</Link>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-amber-400">
            <MapPin className="h-4 w-4" /> OUR LOCATIONS
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">
            Find us nationwide
          </h1>
          <p className="mt-4 text-stone-300 max-w-2xl leading-relaxed">
            The Xtreme Polishing Systems family covers the country through four
            brands — retail epoxy supply stores, hands-on training centers, a
            residential contractor network, and a nationwide commercial
            installation service.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <div className="text-2xl font-bold text-amber-400">{ALL_XPS_LOCATIONS.length}</div>
              <div className="text-xs text-stone-400">XPS Xpress stores</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <div className="text-2xl font-bold text-amber-400">{PCU_LOCATIONS.length}</div>
              <div className="text-xs text-stone-400">Training centers</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <div className="text-2xl font-bold text-amber-400">{NCP_SERVICE_AREAS.length}</div>
              <div className="text-xs text-stone-400">Service areas</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <div className="text-2xl font-bold text-amber-400">47</div>
              <div className="text-xs text-stone-400">States (NEP)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. XPS Xpress stores */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            icon={Store}
            kicker="RETAIL SUPPLY STORES"
            title="XPS Xpress — Xtreme Polishing Systems"
            subtitle="Premium epoxy, coatings, and concrete supply stores with nationwide shipping and in-store expert advice. Use the ZIP-code locator on the home page for Street View of any storefront."
          />
          <div className="space-y-8">
            {grouped.map(({ state, stores }) => (
              <div key={state}>
                <h3 className="text-sm font-bold tracking-[0.15em] text-stone-500 uppercase mb-3 pb-2 border-b border-stone-200">
                  {STATE_NAMES[state] || state} · {stores.length}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stores.map((s) => (
                    <div
                      key={`${s.city}-${s.state}`}
                      className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-stone-900 leading-snug">
                          {s.city}
                          {s.hq && (
                            <span className="ml-2 text-[10px] font-bold text-amber-600 align-middle">
                              HQ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-stone-600">{s.address}</div>
                      <a
                        href={`tel:${s.phone.replace(/[^\d]/g, "")}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
                      >
                        <Phone className="h-3.5 w-3.5" /> {s.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Canada */}
          <div className="pt-6">
            <h3 className="text-sm font-bold tracking-[0.15em] text-stone-500 uppercase mb-3 pb-2 border-b border-stone-200">
              Canada
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {XPS_CANADA_LOCATIONS.map((s) => (
                <div key={`ca-${s.city}`} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 flex flex-col">
                  <div className="font-semibold text-stone-900 leading-snug">{s.city}</div>
                  <div className="mt-1 text-xs text-stone-600">{s.address}</div>
                  <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800">
                    <Phone className="h-3.5 w-3.5" /> {s.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Polished Concrete University */}
      <section className="px-6 py-16 md:py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            icon={GraduationCap}
            kicker="HANDS-ON TRAINING"
            title="Polished Concrete University"
            subtitle="The world's #1 trade school for epoxy and polished concrete. 5-day certification classes run every month at the main training center, with additional training hosted at select XPS Xpress stores."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {PCU_LOCATIONS.map((p) => (
              <div
                key={`${p.city}-${p.state}`}
                className={`rounded-2xl border p-5 flex flex-col ${
                  p.hq
                    ? "border-amber-300 bg-amber-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-stone-900">{p.name}</h3>
                  {p.hq && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded">
                      MAIN CAMPUS
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-stone-600">
                  {p.address}
                  {p.zip ? `, ${p.city}, ${p.state} ${p.zip}` : `, ${p.city}, ${p.state}`}
                </div>
                <div className="mt-1 text-xs text-stone-500 italic">{p.note}</div>
                <div className="mt-3 flex flex-col gap-1">
                  <a
                    href={`tel:${p.phone.replace(/[^\d]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800"
                  >
                    <Phone className="h-4 w-4" /> {p.phone}
                  </a>
                  {p.alt_phone && (
                    <a
                      href={`tel:${p.alt_phone.replace(/[^\d]/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700"
                    >
                      <Phone className="h-3.5 w-3.5" /> {p.alt_phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. National Concrete Polishing */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            icon={HardHat}
            kicker="RESIDENTIAL CONTRACTOR"
            title="National Concrete Polishing"
            subtitle="Our contractor and installation arm — epoxy coatings and polished concrete for residential garages and commercial spaces. Headquartered in Pompano Beach and serving the cities below nationwide."
          />
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-wider text-amber-700">HEADQUARTERS</div>
              <div className="mt-1 font-semibold text-stone-900">{NCP_INFO.hq_address}</div>
            </div>
            <a
              href={`tel:${NCP_INFO.phone.replace(/[^\d]/g, "")}`}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-sm font-semibold transition"
            >
              <Phone className="h-4 w-4" /> {NCP_INFO.phone}
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {NCP_SERVICE_AREAS.map((a) => (
              <div
                key={`${a.city}-${a.state}`}
                className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-sm text-stone-700 leading-tight">
                  {a.city}, <span className="text-stone-400">{a.state}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-400">
            Service-area cities — crews travel to your project; not all cities have a physical storefront.
          </p>
        </div>
      </section>

      {/* 4. National Epoxy Pros */}
      <section className="px-6 py-16 md:py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            icon={Building2}
            kicker="COMMERCIAL & INDUSTRIAL"
            title="National Epoxy Pros"
            subtitle={NEP_INFO.description}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {NEP_INFO.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white border border-stone-200 p-5 text-center"
              >
                <div className="text-3xl font-extrabold text-stone-900">{s.value}</div>
                <div className="mt-1 text-xs text-stone-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-stone-900">{NEP_INFO.name}</div>
              <div className="text-sm text-stone-500">{NEP_INFO.tagline} · Nationwide service, no storefronts</div>
            </div>
            <a
              href={NEP_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition"
            >
              Request a bid <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-amber-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-950">
            Ready to get floored?
          </h2>
          <p className="mt-3 text-stone-900/80">
            Get a free, no-obligation estimate for your garage floor in under two minutes.
          </p>
          <Link
            to="/funnel"
            className="mt-6 inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-stone-950 hover:bg-stone-800 text-white font-bold transition"
          >
            Start my estimate <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/"
            className="mt-4 block inline-flex items-center gap-1.5 text-sm font-semibold text-stone-800 hover:text-stone-950"
          >
            <Calendar className="h-4 w-4" /> Or use the store locator on the home page
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}