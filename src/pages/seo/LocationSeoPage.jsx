import React from "react";
import { Link, useParams } from "react-router-dom";
import SeoPage from "@/components/seo/SeoPage";
import PageNotFound from "@/lib/PageNotFound";
import {
  SEO_LOCATIONS,
  STATE_NAMES,
  citySlug,
  locationPath,
  locationSeoConfig,
} from "@/lib/seoConfig";
import { distanceMiles } from "@/lib/xpsLocations";

// Nearby locations: same-state first, then nearest by distance.
function nearbyLocations(loc, limit = 6) {
  const sameState = SEO_LOCATIONS.filter(
    (l) => l.state === loc.state && l.city !== loc.city
  );
  const others = SEO_LOCATIONS
    .filter((l) => l.state !== loc.state)
    .map((l) => ({ l, d: distanceMiles(loc.lat, loc.lng, l.lat, l.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, Math.max(0, limit - sameState.length))
    .map((x) => x.l);
  return [...sameState, ...others].slice(0, limit);
}

// Turn a kebab-case slug back into a title-cased city name.
// "fort-lauderdale" → "Fort Lauderdale", "st-petersburg" → "St Petersburg"
function deslugCity(slug) {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function LocationSeoPage() {
  const { state, citySlug: slug } = useParams();
  const stateUpper = (state || "").toUpperCase();
  const stateName = STATE_NAMES[stateUpper];

  // Invalid state code → 404
  if (!stateName) return <PageNotFound />;

  // 1. Real XPS store location → full page with nearby communities
  const loc = SEO_LOCATIONS.find(
    (l) => l.state === stateUpper && citySlug(l.city) === slug
  );

  // 2. Any other city → same rich page, synthetic location (no lat/lng)
  const synthetic = !loc ? { city: deslugCity(slug), state: stateUpper } : null;

  if (!loc && !synthetic) return <PageNotFound />;

  const useLoc = loc || synthetic;
  const cfg = locationSeoConfig(useLoc);
  const nearby = loc ? nearbyLocations(loc) : [];

  const sections = [
    {
      h2: `How much does an epoxy garage floor cost in ${useLoc.city}, ${useLoc.state}?`,
      body: [
        <p key="1">Garage floor coating pricing in {useLoc.city} depends on your garage size, the finish you choose, and the condition of your concrete. Most 2-car garages in the {stateName} area fall into a predictable range, but every floor is different.</p>,
        <p key="2">Instead of calling multiple contractors for quotes, get a preliminary range instantly with our estimator, then schedule a free consultation to confirm the details.</p>,
      ],
    },
    {
      h2: `What affects pricing in ${stateName}`,
      cards: [
        { t: "Garage size", d: "2-car and 3-car garages are the most common. Larger garages need more material and labor." },
        { t: "Concrete condition", d: "Cracks, stains, and existing coatings may require extra preparation before coating." },
        { t: "Climate & moisture", d: `Proper moisture testing matters in ${stateName} before any coating is applied.` },
        { t: "Finish selection", d: "Decorative flake, solid color, and metallic systems each carry different costs." },
        { t: "Coating removal", d: "If an old coating needs removal, expect additional preparation time and cost." },
        { t: "Timeline", d: "ASAP and within-30-day timelines help us prioritize your project." },
      ],
    },
    {
      h2: "Popular garage sizes",
      list: [
        "1-car garage: smaller footprint, often subject to a minimum project charge",
        "2-car garage: the most common project, typically 400–480 sq ft",
        "3-car garage: larger footprint, typically 600–720 sq ft",
        "4+ car garage: custom pricing based on actual dimensions",
      ],
    },
    {
      h2: "How the estimator works",
      body: [
        <p key="1">Answer a few simple questions about your garage — size, condition, desired finish, and timeline. In about 60 seconds you'll see a personalized estimated project range.</p>,
        <p key="2">If you'd like to move forward, book a free consultation and we'll confirm the details and schedule an in-home inspection for a final proposal.</p>,
      ],
    },
    {
      h2: "Frequently asked questions",
      cards: cfg.faq.map((f) => ({ t: f.q, d: f.a })),
    },
  ];

  if (nearby.length) {
    sections.push({
      h2: `Also serving nearby ${stateName} communities`,
      body: [
        <div key="nb" className="mt-4 flex flex-wrap gap-2">
          {nearby.map((n) => (
            <Link
              key={`${n.state}-${n.city}`}
              to={locationPath(n)}
              className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 hover:border-amber-300 hover:text-amber-700 transition"
            >
              {n.city}, {n.state}
            </Link>
          ))}
        </div>,
      ],
    });
  }

  return (
    <SeoPage
      slug={`${useLoc.state.toLowerCase()}/${citySlug(useLoc.city)}`}
      title={cfg.title}
      metaDescription={cfg.description}
      h1={`Epoxy Garage Floors in ${useLoc.city}, ${useLoc.state}`}
      breadcrumbs={[{ label: `${useLoc.city}, ${useLoc.state}` }]}
      intro={`Researching garage floor coating in ${useLoc.city}, ${useLoc.state}? Get a personalized price range in about 60 seconds — before you talk to anyone.`}
      sections={sections}
    />
  );
}