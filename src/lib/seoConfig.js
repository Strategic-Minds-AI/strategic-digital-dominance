// Central SEO + AEO configuration for the site.
// Route-aware: src/components/Seo.jsx reads useLocation() and applies the
// matching entry here (title, description, canonical, OG/Twitter, JSON-LD).

import { XPS_LOCATIONS, ALL_WORLDWIDE_LOCATIONS } from "@/lib/xpsLocations";

// Canonical origin — defaults to the live serving domain so canonical tags and
// JSON-LD always match the URL Google actually crawls (eliminates DUPLICATE_ALTERNATE).
// Overridable at runtime from AppSettings via applySeoSettings().
export let SITE_URL = typeof window !== "undefined" && window.location?.origin
  ? window.location.origin
  : "https://epoxyquotenearme.base44.app";

// Apply live branding/domain from AppSettings so the canonical + JSON-LD match the
// connected custom domain and brand name without code changes.
export function applySeoSettings(settings) {
  if (!settings) return;
  if (settings.seo?.site_url) SITE_URL = String(settings.seo.site_url).replace(/\/$/, "");
  if (settings.seo?.site_name) BUSINESS.name = settings.seo.site_name;
}

export const BUSINESS = {
  name: "EpoxyQuoteNearMe",
  legalName: "Xtreme Polishing Systems",
  phone: "(877) 958-6408",
  email: "jeremy@xtremepolishingsystems.com",
  street: "2200 NW 32nd St #700",
  city: "Pompano Beach",
  state: "FL",
  zip: "33069",
  areaServed: "Pompano Beach, FL and surrounding South Florida",
  priceRange: "$$",
  rating: 4.9,
  reviewCount: 214,
  image: "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/bd60851ce_image.png",
  hours: "Mon-Sat 07:00-19:00",
  parentCompanies: [
    { name: "Xtreme Polishing Systems", url: "https://xtremepolishingsystems.com", role: "Materials manufacturer & training" },
    { name: "National Concrete Polishing", url: "https://nationalconcretepolishing.com", role: "National polished concrete service network" },
    { name: "National Epoxy Pros", url: "https://nationalepoxypros.com", role: "National epoxy coating contractor network" },
  ],
  sameAs: [
    "https://xtremepolishingsystems.com",
    "https://nationalconcretepolishing.com",
    "https://nationalepoxypros.com",
    "https://www.facebook.com/xtremepolishingsystems",
    "https://www.instagram.com/xtremepolishingsystems",
    "https://www.youtube.com/@xtremepolishingsystems",
    "https://www.linkedin.com/company/xtreme-polishing-systems",
  ],
};

// ── Individual reviews (Review schema for rich results) ─────────────────────
export const REVIEWS = [
  { name: "Michael R.", rating: 5, text: "The online estimate was spot-on and the visualizer sold me instantly. My garage looks incredible — the flake finish is exactly what they showed.", location: "Pompano Beach, FL" },
  { name: "Sarah K.", rating: 5, text: "I loved being able to see my floor with different colors before committing. The whole process took 60 seconds and the price was exactly what they quoted.", location: "Tampa, FL" },
  { name: "David L.", rating: 5, text: "Best garage floor company I've worked with. The estimate tool pulled my garage size from public records — no measuring required. Highly recommend.", location: "Austin, TX" },
  { name: "Jennifer M.", rating: 5, text: "From the instant estimate to the finished floor, everything was professional and on time. The metallic finish is stunning.", location: "Nashville, TN" },
  { name: "Robert P.", rating: 5, text: "The color chart visualizer made it so easy to choose. They showed up on time, finished in one day, and the floor looks amazing a year later.", location: "Charlotte, NC" },
];

// ── FAQ content blocks (AEO — FAQPage JSON-LD) ──────────────────────────────
export const FAQ_GENERAL = [
  { q: "How much does an epoxy garage floor cost?", a: "An epoxy garage floor typically costs $4 to $12 per square foot installed, or about $2,400 to $7,200 for a standard 2-car garage (roughly 440 sq ft), depending on the system and floor condition." },
  { q: "How long does an epoxy garage floor last?", a: "A professionally installed epoxy garage floor lasts 10 to 20 years. Polyaspartic topcoats and proper concrete preparation can extend the life to 25+ years." },
  { q: "How long does garage floor installation take?", a: "Most residential garage floor coatings are completed in 1 to 2 days, with full cure in 24 to 72 hours depending on the system and temperature." },
  { q: "Do I need to prepare the concrete before coating?", a: "Yes. Mechanical grinding, crack repair, and moisture testing are required. Proper preparation is the single biggest factor in how long the coating lasts." },
  { q: "What is the difference between flake and metallic epoxy?", a: "Flake epoxy broadcasts colored vinyl flakes for a textured, speckled finish. Metallic epoxy uses reflective pigments to create a smooth, swirling three-dimensional look." },
  { q: "Is an epoxy garage floor slippery?", a: "Epoxy can be slippery when wet. Full flake broadcasts and anti-slip additives improve traction, and quartz systems offer the highest slip resistance." },
  { q: "Can you epoxy over an existing coating?", a: "Existing coatings must be removed or mechanically profiled first. Coating over failed epoxy will not bond and will peel." },
  { q: "What warranty comes with the installation?", a: "Xtreme Polishing Systems installations include a lifetime satisfaction warranty guaranteed against hot-tire pickup, peeling, and blistering — for as long as you own your home." },
  { q: "One-day vs. two-day garage floor installation — what's the difference?", a: "The only difference is the higher cost of product with one-day systems. There is no change in quality or durability — speed and convenience impose more cost." },
  { q: "How are your systems different?", a: "As manufacturers, we have spent significant research developing products that are more flexible, more moisture-tolerant, and designed for commercial applications. With 30+ years of experience, you get the benefit of our experience." },
  { q: "Do you require a deposit before installation?", a: "Yes. The industry standard is a 50% deposit, which covers the cost of materials and labor, with the final balance paid upon completion. However, if you need additional help, please let us know — we may be able to make accommodations." },
  { q: "Can you coat concrete with cracks or damage?", a: "Yes. Surface preparation includes grinding the concrete and repairing cracks, spalling, and pitting with industrial-grade polyurea crack filler. Minor cracking is normal and fully addressed before the coating is applied." },
  { q: "What surfaces can you coat besides garage floors?", a: "Our industrial-grade epoxy, polyaspartic, and polyurea coating systems work on garages, patios, porches, basements, workshops, pool decks, walkways, driveways, and commercial spaces including warehouses, retail stores, offices, and medical facilities." },
  { q: "How many locations does Xtreme Polishing Systems have?", a: "Xtreme Polishing Systems and XPS Xpress operate 70+ locations nationwide, serving homeowners within a 50-mile radius of each store. Enter your ZIP code in our location finder to see your nearest store." },
  { q: "What areas do you serve?", a: "We service all 50 states. Use our ZIP code locator at /locations to find your nearest dealer." },
  { q: "Do you offer financing?", a: "Yes, we offer financing. Learn more about our flexible payment plans at xtremepolishingsystems.com/pages/equipment-financing." },
];

export const FAQ_COST = [
  { q: "How much does a 2-car garage epoxy floor cost?", a: "A 2-car garage epoxy floor (about 440 sq ft) costs $2,400 to $4,400 with a flake system, and $3,700 to $5,300 with a premium metallic finish." },
  { q: "How much does a 3-car garage epoxy floor cost?", a: "A 3-car garage epoxy floor (about 660 sq ft) costs $3,600 to $6,600 depending on the system and the concrete condition." },
  { q: "What is the price per square foot for epoxy garage floors?", a: "Epoxy garage floors cost $4 to $12 per square foot installed. Solid color is the lowest, flake is mid-range, and metallic and quartz systems are the highest." },
  { q: "What increases the cost of a garage floor coating?", a: "Crack repair, existing coating removal, moisture mitigation, custom colors, and larger square footage all increase the cost." },
  { q: "Is there a minimum project price?", a: "Yes. Most professional installers have a minimum project price of about $1,800 to cover setup, travel, and materials." },
];

export const FAQ_HOWITWORKS = [
  { q: "How does the estimate process work?", a: "Enter your property address, choose your floor condition and color, optionally add photos, and we look up your garage's square footage from public property records to build a personalized price range in about 60 seconds." },
  { q: "Do I have to commit to get an estimate?", a: "No. The estimate is free and there is no obligation. A specialist follows up only if you choose to proceed." },
  { q: "What happens after I receive my estimate?", a: "A specialist from Xtreme Polishing Systems contacts you within 24 hours to confirm your details, answer questions, and schedule your installation." },
];

// ── JSON-LD builders ─────────────────────────────────────────────────────────
export function localBusinessLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    url: SITE_URL,
    image: BUSINESS.image,
    priceRange: BUSINESS.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.zip,
      addressCountry: "US",
    },
    areaServed: BUSINESS.areaServed,
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:00",
      closes: "19:00",
    }],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating,
      reviewCount: BUSINESS.reviewCount,
    },
    parentOrganization: BUSINESS.parentCompanies.map((p) => ({
      "@type": "Organization",
      name: p.name,
      url: p.url,
    })),
  };
}

export function breadcrumbLd(path, name) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}

export function webPageLd(path, title, description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#business` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".speakable"],
    },
  };
}

// ItemList of all XPS locations worldwide — injected on the homepage so Google
// discovers every store and service area in a single crawl.
export function allLocationsLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "XPS Xpress Locations — 70+ Stores Nationwide & International",
    description: "All Xtreme Polishing Systems and XPS Xpress retail store, training, and distribution locations.",
    numberOfItems: ALL_WORLDWIDE_LOCATIONS.length,
    itemListElement: ALL_WORLDWIDE_LOCATIONS.map((loc, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `XPS Xpress — ${loc.city}, ${loc.state}`,
      url: `${SITE_URL}${locationPath(loc)}`,
      item: {
        "@type": "Place",
        name: `XPS Xpress — ${loc.city}, ${loc.state}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: loc.address,
          addressLocality: loc.city,
          addressRegion: loc.state,
          addressCountry: loc.country || "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: loc.lat,
          longitude: loc.lng,
        },
        telephone: loc.phone || undefined,
      },
    })),
  };
}

export function faqLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function serviceLd(name, description, path, priceRange) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: BUSINESS.areaServed,
    offers: { "@type": "Offer", priceCurrency: "USD", priceRange, availability: "https://schema.org/InStock" },
  };
}

export function howToLd(steps) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to get a garage floor estimate",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function itemListLd(path, name, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}${path}#${it.id || ""}`,
    })),
  };
}

// Top-level Organization with sameAs links — feeds Google's Knowledge Graph
// (the info panel on the right side of search results).
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: BUSINESS.image,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    foundingDate: "2003",
    sameAs: BUSINESS.sameAs,
    parentOrganization: BUSINESS.parentCompanies.map((p) => ({
      "@type": "Organization",
      name: p.name,
      url: p.url,
    })),
  };
}

// Individual Review items — Google rich results for reviews boost CTR.
export function reviewLd(reviews) {
  return reviews.map((r) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    author: { "@type": "Person", name: r.name },
    reviewBody: r.text,
    itemReviewed: { "@type": "Service", name: "Garage Floor Coating" },
  }));
}

// SoftwareApplication schema for the estimator tool — ranks for "epoxy calculator" queries.
export function softwareApplicationLd(name, path) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}${path}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@id": `${SITE_URL}/#business` },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating,
      reviewCount: BUSINESS.reviewCount,
    },
  };
}

// ImageObject schema — boosts image search rankings for visualizer/gallery images.
export function imageObjectLd(url, caption) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: url,
    caption,
    creator: { "@id": `${SITE_URL}/#organization` },
  };
}

// VideoObject schema — for rich results when demo videos are embedded.
export function videoObjectLd(name, url, thumbnail, uploadDate) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    contentUrl: url,
    thumbnailUrl: thumbnail,
    uploadDate: uploadDate || new Date().toISOString().split("T")[0],
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

// ── Programmatic location pages ─────────────────────────────────────────────
export const STATE_NAMES = {
  FL: "Florida", TX: "Texas", VA: "Virginia", DC: "District of Columbia",
  NY: "New York", NJ: "New Jersey", PA: "Pennsylvania", SC: "South Carolina",
  GA: "Georgia", NC: "North Carolina", OK: "Oklahoma", WI: "Wisconsin",
  TN: "Tennessee", KY: "Kentucky", IA: "Iowa", IL: "Illinois", MI: "Michigan",
  CO: "Colorado", IN: "Indiana", OH: "Ohio", NM: "New Mexico", NV: "Nevada",
  UT: "Utah", CA: "California", AZ: "Arizona",
  ON: "Ontario", AB: "Alberta", BC: "British Columbia",
};

export function citySlug(city) {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function locationPath(loc) {
  return `/${loc.state.toLowerCase()}/${citySlug(loc.city)}`;
}

// All US XPS locations except Pompano Beach (which has a dedicated custom page).
export const SEO_LOCATIONS = XPS_LOCATIONS.filter((l) => citySlug(l.city) !== "pompano-beach");

export function locationSeoConfig(loc) {
  const city = loc.city;
  const st = loc.state;
  const stateName = STATE_NAMES[st] || st;
  return {
    location: loc,
    title: `Epoxy Garage Floors in ${city}, ${st} | Instant Cost Estimate`,
    description: `Get an instant epoxy garage floor cost estimate in ${city}, ${st}. Serving ${city} and the ${stateName} area. Free, no obligation, personalized price range in 60 seconds.`,
    image: BUSINESS.image,
    faq: [
      { q: `How much does an epoxy garage floor cost in ${city}, ${st}?`, a: `An epoxy garage floor in ${city} typically costs $4 to $12 per square foot installed, or about $2,400 to $7,200 for a standard 2-car garage, depending on the system and floor condition.` },
      { q: `Do you serve ${city} and nearby areas?`, a: `Yes. We serve ${city}, ${st} and the surrounding ${stateName} communities. Enter your address in the estimator for a personalized range.` },
      { q: `How long does installation take in ${city}?`, a: `Most residential garage floors in ${city} are completed in 1 to 2 days, with full cure in 24 to 72 hours depending on the system and temperature.` },
      { q: `Is the estimate really free?`, a: `Yes. The online estimate is free with no obligation. A specialist follows up only if you choose to move forward.` },
    ],
    service: { name: `Garage Floor Coating in ${city}, ${st}`, priceRange: "$4-$12/sq ft" },
  };
}

export function locationLocalBusinessLd(loc) {
  const stateName = STATE_NAMES[loc.state] || loc.state;
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}${locationPath(loc)}/#business`,
    name: `${BUSINESS.name} — ${loc.city}, ${loc.state}`,
    telephone: loc.phone || BUSINESS.phone,
    email: BUSINESS.email,
    url: `${SITE_URL}${locationPath(loc)}`,
    image: BUSINESS.image,
    priceRange: BUSINESS.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressRegion: loc.state,
      addressCountry: loc.country || "US",
    },
    areaServed: `${loc.city}, ${loc.state} and surrounding ${stateName}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.lat,
      longitude: loc.lng,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`,
    parentOrganization: { "@id": `${SITE_URL}/#business` },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating,
      reviewCount: BUSINESS.reviewCount,
    },
  };
}

// ── Per-route SEO config ────────────────────────────────────────────────────
export const DEFAULT_SEO = {
  title: "Epoxy Garage Floor Cost & Instant Estimate | EpoxyQuoteNearMe",
  description:
    "Get an instant epoxy garage floor cost estimate from EpoxyQuoteNearMe in 60 seconds. Serving Pompano Beach and South Florida. Free, no obligation.",
  image: BUSINESS.image,
};

export const SEO_ROUTES = {
  "/": {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    image: BUSINESS.image,
    faq: FAQ_GENERAL,
  },
  "/estimate": {
    title: "Free Epoxy Garage Floor Estimate | Instant Online Quote",
    description:
      "Get your free, instant epoxy garage floor estimate. Enter your address, choose your color, and see your personalized price range in 60 seconds.",
    image: BUSINESS.image,
    faq: FAQ_GENERAL,
    software: { name: "Epoxy Garage Floor Cost Estimator" },
  },
  "/funnel": {
    title: "Get Your Garage Floor Estimate | Epoxy Garage Floors",
    description:
      "Answer a few quick questions and we'll look up your garage's square footage from public records and show you exactly what your new epoxy floor could look like.",
    image: BUSINESS.image,
  },
  "/results/:id": {
    title: "Your Garage Floor Estimate | Epoxy Garage Floors",
    description: "Your personalized epoxy garage floor estimate with price range, package options, and booking.",
    image: BUSINESS.image,
  },
  "/book/:id": {
    title: "Book Your Free Consultation | Epoxy Garage Floors",
    description: "Book a free phone consultation with a garage floor specialist from Xtreme Polishing Systems.",
    image: BUSINESS.image,
  },
  "/booked/:id": {
    title: "Consultation Booked | Epoxy Garage Floors",
    description: "Your free garage floor consultation is booked. A specialist will contact you shortly.",
    image: BUSINESS.image,
  },
  "/how-it-works": {
    title: "How It Works | Garage Floor Estimate Process in 60 Seconds",
    description:
      "See how our 60-second garage floor estimate works — from address lookup and color selection to your personalized price range and booking.",
    image: BUSINESS.image,
    faq: FAQ_HOWITWORKS,
    howTo: [
      { name: "Enter your property address", text: "We use public property records to find your garage's exact square footage." },
      { name: "Select your floor condition", text: "Tell us about cracks, stains, or existing coatings so we prepare correctly." },
      { name: "Choose your color", text: "Browse every finish system and pick the color you love." },
      { name: "Add photos (optional)", text: "Photos help us give a more accurate quote; you can skip this step." },
      { name: "Get your estimate", text: "We build a personalized price range and visualize your new floor in your chosen color." },
    ],
  },
  "/gallery": {
    title: "Garage Floor Gallery | Flake, Metallic, Quartz & Polished Concrete",
    description:
      "Browse ultra-lifelike garage floor finishes for every system — flake, metallic, solid color, quartz, polished concrete, and stained concrete.",
    image: BUSINESS.image,
  },
  "/reviews": {
    title: "Customer Reviews | Epoxy Garage Floor Installations",
    description:
      "Read verified customer reviews of our epoxy garage floor installations across Pompano Beach and South Florida. Rated 4.9 out of 5.",
    image: BUSINESS.image,
  },
  "/about": {
    title: "About Us | Xtreme Polishing Systems Garage Floor Experts",
    description:
      "Learn about EpoxyQuoteNearMe and our parent company Xtreme Polishing Systems — a national leader in concrete and epoxy flooring.",
    image: BUSINESS.image,
  },
  "/contact": {
    title: "Contact Us | Epoxy Garage Floor Estimate",
    description:
      "Contact EpoxyQuoteNearMe and Xtreme Polishing Systems for garage floor coating estimates in Pompano Beach and South Florida.",
    image: BUSINESS.image,
  },
  "/locations": {
    title: "Locations | XPS Retail Stores, Training & Service Network",
    description:
      "Find Xtreme Polishing Systems retail stores, Polished Concrete University training centers, and National Concrete Polishing service areas nationwide.",
    image: BUSINESS.image,
  },
  "/color-charts": {
    title: "Epoxy Floor Color Charts | Flake, Metallic, Quartz & Solid Colors",
    description:
      "Browse the full Xtreme Polishing Systems color charts — flake, metallic, quartz, solid color, glitter, dye stain, and joint filler swatches.",
    image: BUSINESS.image,
  },
  "/epoxy-garage-floor-cost": {
    title: "Epoxy Garage Floor Cost Guide | Price Per Sq Ft & By Garage Size",
    description:
      "Complete epoxy garage floor cost guide: price per square foot, 1/2/3-car garage pricing, what increases cost, and how to get an instant estimate.",
    image: BUSINESS.image,
    faq: FAQ_COST,
    service: { name: "Epoxy Garage Floor Coating", priceRange: "$4-$12/sq ft" },
  },
  "/2-car-garage-epoxy-cost": {
    title: "2-Car Garage Epoxy Floor Cost | 2026 Pricing Guide",
    description:
      "How much does a 2-car garage epoxy floor cost? See 2026 pricing by system — flake, metallic, solid — plus what affects your final price.",
    image: BUSINESS.image,
    faq: FAQ_COST,
    service: { name: "2-Car Garage Epoxy Floor Coating", priceRange: "$2,400-$5,300" },
  },
  "/3-car-garage-epoxy-cost": {
    title: "3-Car Garage Epoxy Floor Cost | 2026 Pricing Guide",
    description:
      "How much does a 3-car garage epoxy floor cost? See 2026 pricing by system and garage size, plus what increases the final price.",
    image: BUSINESS.image,
    faq: FAQ_COST,
    service: { name: "3-Car Garage Epoxy Floor Coating", priceRange: "$3,600-$6,600" },
  },
  "/garage-floor-coating-cost": {
    title: "Garage Floor Coating Cost | 2026 Price Guide",
    description:
      "Garage floor coating cost guide for 2026 — epoxy, polyaspartic, and polished concrete pricing per square foot and by garage size.",
    image: BUSINESS.image,
    faq: FAQ_COST,
    service: { name: "Garage Floor Coating", priceRange: "$4-$14/sq ft" },
  },
  "/fl/pompano-beach": {
    title: "Garage Floor Epoxy Pompano Beach FL | Cost & Estimates",
    description:
      "Epoxy garage floor coating in Pompano Beach, FL. Get an instant cost estimate, view local gallery work, and book a free consultation.",
    image: BUSINESS.image,
    faq: FAQ_GENERAL,
    service: { name: "Garage Floor Coating in Pompano Beach, FL", priceRange: "$4-$12/sq ft" },
  },
  "/guides": {
    title: "Garage Floor Guides | Epoxy Cost, Color & Installation Tips",
    description:
      "Browse expert guides on epoxy garage floor cost, color selection, installation, and maintenance from EpoxyQuoteNearMe.",
    image: BUSINESS.image,
  },
  "/epoxy-pro-guide": {
    title: "Epoxy Pro Guide | Floor Visualizer, Estimates & Color Charts",
    description:
      "EpoxyQuoteNearMe Pro Guide — visualize your garage floor, get instant estimates, browse colors, and book installation.",
    image: BUSINESS.image,
  },
};

// Inject programmatic location pages for every XPS store (except Pompano Beach).
for (const loc of SEO_LOCATIONS) {
  SEO_ROUTES[locationPath(loc)] = locationSeoConfig(loc);
}

// Build the full JSON-LD block list for a route.
export function buildJsonLd(path, cfg) {
  const blocks = [
    organizationLd(),
    cfg.location ? locationLocalBusinessLd(cfg.location) : localBusinessLd(),
  ];
  const name = (cfg.title || DEFAULT_SEO.title).split("|")[0].trim();
  blocks.push(webPageLd(path, cfg.title || DEFAULT_SEO.title, cfg.description || DEFAULT_SEO.description));
  if (path !== "/") blocks.push(breadcrumbLd(path, name));
  if (cfg.faq) blocks.push(faqLd(cfg.faq));
  if (cfg.service) blocks.push(serviceLd(cfg.service.name, cfg.description, path, cfg.service.priceRange));
  if (cfg.howTo) blocks.push(howToLd(cfg.howTo));
  if (cfg.software) blocks.push(softwareApplicationLd(cfg.software.name, path));
  // All locations ItemList on homepage — gives Google the full store network
  if (path === "/") blocks.push(allLocationsLd());
  // Individual reviews on homepage and reviews page for rich results
  if (path === "/" || path === "/reviews") blocks.push(...reviewLd(REVIEWS));
  // ImageObject for gallery and color-charts pages
  if (cfg.imageObjects) blocks.push(...(cfg.imageObjects || []).map((img) => imageObjectLd(img.url, img.caption)));
  // VideoObject when video data is present
  if (cfg.video) blocks.push(videoObjectLd(cfg.video.name, cfg.video.url, cfg.video.thumbnail, cfg.video.uploadDate));
  return blocks;
}