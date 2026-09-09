import React from "react";
import { useParams } from "react-router-dom";
import EpoxyContractorTemplate from "@/components/seo/EpoxyContractorTemplate";
import PageNotFound from "@/lib/PageNotFound";
import {
  SEO_LOCATIONS,
  STATE_NAMES,
  citySlug,
  locationSeoConfig,
} from "@/lib/seoConfig";

// Turn a kebab-case slug back into a title-cased city name.
// "fort-lauderdale" → "Fort Lauderdale", "st-petersburg" → "St Petersburg"
function deslugCity(slug) {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Resolve a state URL segment — accepts either a 2-letter code ("nc") or a
// slugified full name ("north-carolina") — to { code, name }.
function resolveState(segment) {
  const s = (segment || "").toLowerCase();
  for (const [code, name] of Object.entries(STATE_NAMES)) {
    if (code.toLowerCase() === s) return { code, name };
  }
  for (const [code, name] of Object.entries(STATE_NAMES)) {
    if (slugify(name) === s) return { code, name };
  }
  return null;
}

export default function LocationSeoPage() {
  const { state, citySlug: slug } = useParams();
  const resolved = resolveState(state);

  // Unrecognized state → 404
  if (!resolved) return <PageNotFound />;
  const { code: stateCode, name: stateName } = resolved;

  // 1. Real XPS store location → full page with nearby communities
  const loc = SEO_LOCATIONS.find(
    (l) => l.state === stateCode && citySlug(l.city) === slug
  );

  // 2. Any other city → same rich page, synthetic location (no lat/lng)
  const synthetic = !loc ? { city: deslugCity(slug), state: stateCode } : null;

  if (!loc && !synthetic) return <PageNotFound />;

  const useLoc = loc || synthetic;
  const cfg = locationSeoConfig(useLoc);

  return (
    <EpoxyContractorTemplate
      city={useLoc.city}
      stateCode={useLoc.state}
      stateName={stateName}
      seoConfig={cfg}
    />
  );
}