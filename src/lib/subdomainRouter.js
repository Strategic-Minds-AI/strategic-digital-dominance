// Subdomain routing logic — resolves wildcard subdomains to their location config.
// Used for mass-deployed city sites: cityslug.rootdomain.com → /state/city route.

/**
 * Convert a city name to a URL-safe slug.
 */
export function citySlug(city) {
  return (city || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
}

/**
 * Extract the city slug from a subdomain hostname.
 * @param {string} hostname — e.g. "tampa.epoxyfloors.com"
 * @param {string} rootDomain — e.g. "epoxyfloors.com"
 * @returns {string|null} — the subdomain slug (e.g. "tampa") or null
 */
export function extractCitySlug(hostname, rootDomain) {
  if (!hostname || !rootDomain) return null;
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const root = rootDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (host === root || !host.endsWith("." + root)) return null;
  const sub = host.slice(0, -("." + root).length);
  if (!sub || sub === "www" || sub.includes(".")) return null;
  return sub;
}

/**
 * Build the DNS records needed for wildcard subdomain routing.
 */
export function dnsInstructions(rootDomain, appDomain = "epoxyquotenearme.base44.app") {
  return [
    { type: "CNAME", name: "*", value: appDomain, ttl: 600, note: "Wildcard — catches all city subdomains" },
    { type: "CNAME", name: "@", value: appDomain, ttl: 600, note: "Root domain — main site" },
  ];
}

/**
 * Build a list of subdomain → location mappings from WebsiteTemplate records.
 * @param {Array} templates — WebsiteTemplate records
 * @param {string} rootDomain — root domain for subdomain generation
 * @returns {Array} — [{ subdomain, route, city, state }]
 */
export function buildSubdomainMappings(templates, rootDomain) {
  if (!rootDomain) return [];
  const root = rootDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (templates || [])
    .filter((t) => t.config?.primary_city)
    .map((t) => {
      const slug = citySlug(t.config.primary_city);
      const state = (t.config.primary_state || "").toLowerCase();
      return {
        subdomain: `${slug}.${root}`,
        route: state ? `/${state}/${slug}` : `/${slug}`,
        city: t.config.primary_city,
        state: t.config.primary_state || "",
        templateId: t.id,
        status: t.status,
      };
    });
}