/**
 * Digital Dominance universal SitePack compiler (branch-only, no network, no publishing).
 * Uses the existing 20-industry catalog for taxonomy, not its unverified revenue,
 * pricing, search-volume or professional-qualification claims.
 *
 * Source visual: existing Epoxy Quote Near Me design is PROVISIONAL for other industries.
 * Legal, medical, and property content requires dedicated verified compliance.
 */
import { TOP_20_INDUSTRIES } from "../../src/data/topIndustries.js";

const slug = (v) => String(v || "").toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nonempty = (v) => typeof v === "string" && v.trim().length > 0;
const CONTROLLED_EVIDENCE_KEYS = Object.freeze([
  "source_commit", "template_approval", "verified_service_area",
  "unique_local_value", "qualified_business", "truthful_claims",
  "privacy_and_consent", "lead_delivery_test", "functional_e2e",
  "responsive_accessibility", "security_checks", "indexing_and_canonical",
  "deployment_identity", "rollback_receipt", "independent_guardian",
  "operator_release_approval"
]);

export const INDUSTRY_OPTIONS = Object.freeze(TOP_20_INDUSTRIES.map(({ id, label, services, pageTypes }) => ({
  id, label, suggested_services: [...services], suggested_page_types: [...pageTypes]
})));

const intakeForIndustry = (id) => {
  if (id === "epoxy_garage") return ["name", "contact_method", "garage_size", "floor_condition", "service_address", "contact_consent"];
  if (id === "personal_injury") return ["name", "contact_method", "jurisdiction", "incident_type", "incident_date", "contact_consent"];
  if (id === "emergency_dentist") return ["name", "contact_method", "care_request", "preferred_time", "contact_consent"];
  if (id === "towing") return ["name", "contact_method", "vehicle_type", "pickup_location", "contact_consent"];
  return ["name", "contact_method", "service_requested", "project_location", "contact_consent"];
};

const legalCaveats = (id) => {
  if (id === "personal_injury") return ["jurisdiction_and_bar_license", "legal_disclaimer", "no_outcome_guarantees", "confidential_intake_handling"];
  if (id === "emergency_dentist") return ["provider_license", "medical_content_review", "health_data_privacy", "no_unverified_availability_claim"];
  if (id === "pest_control") return ["applicable_applicator_licensing", "chemical_safety_disclosures"];
  if (id === "real_estate") return ["brokerage_license", "housing_discrimination_compliance", "listing_data_rights"];
  return ["applicable_licensing", "truthful_business_representation"];
};

function newPackIdentity({ industry_id, business_name, city, region, revision = 1 }) {
  return [slug(industry_id), slug(business_name), slug(region), slug(city), "v" + revision].join("__");
}

export function compileDraftSitePack(input) {
  if (!input || typeof input !== "object") throw new Error("SITEPACK_INPUT_REQUIRED");
  const industry = INDUSTRY_OPTIONS.find((i) => i.id === input.industry_id);
  if (!industry) throw new Error("UNKNOWN_INDUSTRY");
  if (!nonempty(input.business_name)) throw new Error("BUSINESS_NAME_REQUIRED");
  if (!nonempty(input.city) || !nonempty(input.region)) throw new Error("LOCATION_REQUIRED");
  if (input.mode && input.mode !== "preview") throw new Error("ONLY_PREVIEW_MODE_SUPPORTED");
  const identity = newPackIdentity(input);
  const submittedServices = Array.isArray(input.services) ? input.services : [];
  // A suggested service is NOT a claim that this business performs the service.
  const suggestions = industry.suggested_services;
  const selections = submittedServices.map(x => String(x).trim()).filter(Boolean);
  if (selections.some(x => !suggestions.includes(x))) throw new Error("SERVICE_NOT_IN_INDUSTRY_CATALOG");
  const design = {
    source_visual_reference: "src/components/seo/EpoxyContractorTemplate.jsx",
    status: "provisional",
    brand_pack: nonempty(input.brand_pack) ? input.brand_pack : null,
    website_design: nonempty(input.website_design) ? input.website_design : null,
    accent_color: /^#[0-9a-fA-F]{6}$/.test(input.accent_color || "") ? input.accent_color : "#D4AF37",
    logo_url: null
  };
  return {
    schema_version: "digital-dominance-industry-sitepack-v1",
    id: identity,
    revision: input.revision || 1,
    status: "DRAFT",
    environment: "preview",
    approved_for_publication: false,
    source: {
      repo: "Strategic-Minds-AI/strategic-digital-dominance",
      base44_original_app_id: "6a77f4491f0bf92de9a3ed8b",
      source_commit_sha: nonempty(input.source_commit_sha) ? input.source_commit_sha : null,
      template_id: nonempty(input.template_id) ? input.template_id : null
    },
    industry: {
      id: industry.id,
      label: industry.label,
      supported_page_types: industry.suggested_page_types,
      service_suggestions: suggestions,
      selected_services: selections,
      regulated_review_items: legalCaveats(industry.id)
    },
    business: {
      display_name: input.business_name.trim(),
      legal_identity: null,
      verified_business: false,
      contact_phone: null,
      real_address_verified: false,
      company_specific_proof: []
    },
    geography: {
      city: input.city.trim(),
      region: input.region.trim(),
      country: nonempty(input.country) ? input.country : "US",
      service_area_verified: false,
      local_value_evidence: null,
      route: "/" + slug(input.region) + "/" + slug(input.city)
    },
    design,
    content: {
      heading: "Preview: " + industry.label + " in " + input.city.trim(),
      body: "Internal draft. All service, licensing, availability and pricing claims require verification before publishing.",
      local_details_verified: false,
      testimonials: [],
      prices: [],
      faq_answers: []
    },
    components: {
      base_shell: ["navigation", "hero", "services", "faq", "contact", "footer"],
      industry_modules_requested: industry.id === "epoxy_garage" ? ["floor_estimator"] :
        industry.id === "personal_injury" ? ["case_intake"] :
        industry.id === "emergency_dentist" ? ["appointment_request"] :
        ["service_request"],
      modules_functionally_verified: false
    },
    conversion: {
      cta_label: industry.id === "personal_injury" ? "Request a Consultation" :
        industry.id === "epoxy_garage" ? "Request an Estimate" : "Request Information",
      intake_fields: intakeForIndustry(industry.id),
      lead_delivery_destination: null,
      active_submissions: false
    },
    seo: {
      robots: "noindex, nofollow, noarchive",
      sitemap_include: false,
      canonical_url: null,
      truthful_schema_approved: false
    },
    deployment: { preview_url: null, production_url: null, deployment_id: null, target: null },
    verification: Object.fromEntries(CONTROLLED_EVIDENCE_KEYS.map(k => [k, null])),
    release: { approved: false, approved_by: null, approval_id: null, eligible: false }
  };
}

/**
 * Clone does not inherit trust claims, release approvals, deployment identities,
 * contact details, verified service areas, or prices from its parent.
 */
export function cloneDraftSitePack(original, overrides = {}) {
  if (!original || original.schema_version !== "digital-dominance-industry-sitepack-v1") {
    throw new Error("INVALID_PARENT_SITEPACK");
  }
  return compileDraftSitePack({
    industry_id: overrides.industry_id || original.industry.id,
    business_name: overrides.business_name || original.business.display_name,
    city: overrides.city || original.geography.city,
    region: overrides.region || original.geography.region,
    country: overrides.country || original.geography.country,
    revision: Number(original.revision || 1) + 1,
    source_commit_sha: overrides.source_commit_sha || original.source.source_commit_sha,
    template_id: overrides.template_id || original.source.template_id,
    brand_pack: overrides.brand_pack || original.design.brand_pack,
    website_design: overrides.website_design || original.design.website_design,
    accent_color: overrides.accent_color || original.design.accent_color,
    services: Array.isArray(overrides.services) ? overrides.services : []
  });
}

/**
 * Pure, fail-closed release preflight, NOT a publish API.
 * Receipts must come from authenticated independent systems, not these
 * draft JSON files or a page with a green "live" status.
 */
export function evaluateProductionReadiness(pack, evidence = {}) {
  const blockers = [];
  if (!pack || pack.schema_version !== "digital-dominance-industry-sitepack-v1") {
    return { passed: false, blockers: ["invalid_sitepack"], mode: "dry_run" };
  }
  for (const key of CONTROLLED_EVIDENCE_KEYS) {
    if (!nonempty(evidence[key])) blockers.push("missing_" + key);
  }
  if (nonempty(evidence.source_commit) && evidence.source_commit !== pack.source.source_commit_sha) blockers.push("source_sha_drift");
  if (nonempty(evidence.operator_release_approval) && !evidence.operator_release_approval.startsWith("approved:")) {
    blockers.push("approval_not_proven");
  }
  if (nonempty(evidence.independent_guardian) &&
      evidence.independent_guardian === evidence.builder_identity) blockers.push("self_certification");
  if (pack.geography.service_area_verified !== true) blockers.push("location_not_verified");
  if (pack.content.local_details_verified !== true) blockers.push("local_content_not_verified");
  if (pack.components.modules_functionally_verified !== true) blockers.push("industry_modules_not_verified");
  if (pack.design.status !== "approved") blockers.push("visual_not_approved");
  if (pack.business.verified_business !== true) blockers.push("business_not_verified");
  if (pack.conversion.active_submissions !== true || !nonempty(pack.conversion.lead_delivery_destination)) {
    blockers.push("lead_path_not_verified");
  }
  // Production status never depends on old Base44 WebsiteTemplate.status=live.
  return { passed: blockers.length === 0, blockers: [...new Set(blockers)], mode: "dry_run" };
}

export function compilePreviewBatch(baseInput, locations) {
  if (!Array.isArray(locations) || !locations.length) throw new Error("EMPTY_BATCH");
  const seen = new Set();
  return locations.map((location) => {
    const pack = compileDraftSitePack({ ...baseInput, ...location, mode: "preview" });
    if (seen.has(pack.id)) throw new Error("DUPLICATE_SITE_IDENTITY");
    seen.add(pack.id);
    return pack;
  });
}
