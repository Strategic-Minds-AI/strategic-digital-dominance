import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import EpoxyContractorTemplate from "@/components/seo/EpoxyContractorTemplate";
import candidatePack from "../../../site-factory/rollouts/epoxy-200.preview.json";

const STATE_NAMES = {
  ct: "Connecticut", dc: "District of Columbia", de: "Delaware",
  fl: "Florida", ga: "Georgia", ia: "Iowa", il: "Illinois",
  in: "Indiana", ky: "Kentucky", md: "Maryland", mi: "Michigan",
  nc: "North Carolina", nj: "New Jersey", ny: "New York",
  oh: "Ohio", ok: "Oklahoma", pa: "Pennsylvania", sc: "South Carolina",
  tn: "Tennessee", tx: "Texas", va: "Virginia", wi: "Wisconsin",
};

const candidates = candidatePack.locations;
const routeKey = (loc) => loc.state_code + "/" + loc.city_slug;

// Preview-only: do not expose customer forms or propagate draft location pages into search.
function usePreviewNoindex(title) {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]') || document.createElement("meta");
    const hadRobots = Boolean(robots.parentNode);
    const oldRobots = robots.getAttribute("content");
    robots.setAttribute("name", "robots");
    robots.setAttribute("content", "noindex,nofollow,noarchive");
    if (!hadRobots) document.head.appendChild(robots);
    document.title = title;
    return () => {
      document.title = previousTitle;
      if (hadRobots) {
        if (oldRobots === null) robots.removeAttribute("content");
        else robots.setAttribute("content", oldRobots);
      } else robots.remove();
    };
  }, [title]);
}

const previewLink = (loc) => "/site-previews/epoxy/" + routeKey(loc);

export function FactoryPreviewIndex() {
  usePreviewNoindex("Epoxy Site Factory | 200 Internal Previews");
  const count = candidates.length;
  return (
    <main className="min-h-screen bg-stone-950 p-5 md:p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-9">
          <p className="text-amber-400 font-bold text-xs uppercase tracking-[.2em]">Internal review only · No public launch</p>
          <h1 className="mt-3 text-4xl font-bold">Digital Dominance · Epoxy site previews</h1>
          <p className="mt-4 text-stone-300 max-w-3xl">
            {count} source-linked location candidates from the existing Epoxy Quote Near Me factory.
            These are not independently deployed sites. Service coverage, local content, pricing,
            customer lead delivery, accessibility and production approval remain unverified.
          </p>
          <p className="mt-3 text-sm text-amber-300">
            Every preview is noindex and customer interactions are disabled. Do not use the existing
            Website Factory “Deploy” status as evidence of a real deployment.
          </p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((loc) => (
            <Link key={loc.location_key} to={previewLink(loc)}
              className="rounded-xl border border-stone-700 bg-stone-900 p-4 hover:border-amber-400 focus:outline focus:outline-amber-400">
              <div className="text-amber-400 text-xs mb-2">CANDIDATE {loc.sequence} / {count}</div>
              <h2 className="text-lg font-semibold">{loc.city}, {loc.state_code.toUpperCase()}</h2>
              <div className="mt-2 text-xs text-stone-400">
                {loc.service_area_verification === "unverified" ? "Coverage unverified" : "Owner primary-market reference"}
              </div>
              <div className="mt-3 text-sm text-amber-400 font-medium">Inspect source-based visual →</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function FactoryPreviewPage() {
  const { state, citySlug } = useParams();
  const loc = candidates.find((c) => routeKey(c) === (state + "/" + citySlug));
  usePreviewNoindex("UNPUBLISHED VISUAL PREVIEW | " + (loc ? loc.city : "Not Found"));

  if (!loc || !loc.preview_noindex || loc.publish_approved) {
    return (
      <main className="min-h-screen bg-stone-950 text-white p-12">
        <h1>Preview unavailable</h1>
        <Link to="/site-previews/epoxy" className="text-amber-400">Return to catalog</Link>
      </main>
    );
  }

  const name = STATE_NAMES[loc.state_code] || loc.state_code.toUpperCase();
  const previewSeo = {
    title: "UNPUBLISHED PREVIEW: " + loc.city + ", " + loc.state_code.toUpperCase(),
    description: "Internal preview only; this is not a verified service-area or operating website.",
    faq: [
      {
        q: "Is this website accepting local projects?",
        a: "No. This candidate has not passed coverage, operations, or release validation.",
      },
      {
        q: "Are the displayed prices, testimonials and service claims verified?",
        a: "No. Elements reused from the original visual template are provisional until independently validated.",
      },
    ],
  };

  // Visual parity reference: render the *existing* EpoxyContractorTemplate directly.
  // The capture-phase guards and previewMode prevent activation of real lead forms,
  // funnel links, bookings, and page-view telemetry in the preview.
  const suppressAction = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="sticky top-0 z-[999] border-b-2 border-amber-400 bg-stone-950 p-3 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <strong className="text-amber-300">UNPUBLISHED VISUAL PREVIEW · {loc.sequence} / {candidates.length}</strong>
            <p className="text-xs text-stone-300">Noindex · No lead submissions · Market not independently verified · Not a live deployment</p>
          </div>
          <Link className="shrink-0 rounded bg-amber-400 px-4 py-2 text-sm font-bold text-stone-950" to="/site-previews/epoxy">All 200</Link>
        </div>
      </div>
      <div style={{ pointerEvents: "none" }} onClickCapture={suppressAction} onSubmitCapture={suppressAction}>
        <EpoxyContractorTemplate
          previewMode
          city={loc.city}
          stateCode={loc.state_code.toUpperCase()}
          stateName={name}
          seoConfig={previewSeo}
        />
      </div>
    </div>
  );
}
