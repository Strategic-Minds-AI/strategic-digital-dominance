import fs from 'node:fs';
import path from 'node:path';
import { XPS_LOCATIONS } from '../src/lib/xpsLocations.js';

const SITE = 'https://epoxyquotenearme.com';

const STATIC_SEO = {
  '/estimate': ['Free Epoxy Garage Floor Estimate | Instant Online Quote', 'Get your free, instant epoxy garage floor estimate. Enter your address, choose your color, and see your personalized price range.'],
  '/how-it-works': ['How It Works | Garage Floor Estimate Process', 'See how the garage floor estimate process works, from property details through a personalized price range and booking.'],
  '/gallery': ['Garage Floor Gallery | Flake, Metallic, Quartz & Polished Concrete', 'Browse garage floor finish examples across flake, metallic, quartz, solid color, and polished concrete systems.'],
  '/reviews': ['Customer Reviews | Epoxy Garage Floor Installations', 'Read customer reviews and learn about epoxy garage floor installation experiences.'],
  '/about': ['About EpoxyQuoteNearMe | Xtreme Polishing Systems', 'Learn about EpoxyQuoteNearMe and Xtreme Polishing Systems.'],
  '/contact': ['Contact EpoxyQuoteNearMe', 'Contact EpoxyQuoteNearMe for garage floor coating information and estimate support.'],
  '/locations': ['XPS Locations | Retail, Training & Service Network', 'Find Xtreme Polishing Systems retail, training, and service locations.'],
  '/color-charts': ['Epoxy Floor Color Charts | Flake, Metallic, Quartz & Solid Colors', 'Browse floor coating color charts and finish systems.'],
  '/guides': ['Garage Floor Guides | Cost, Color & Installation', 'Browse garage floor guides covering cost, color selection, installation, and maintenance.'],
  '/epoxy-garage-floor-cost': ['Epoxy Garage Floor Cost Guide | Price Per Sq Ft & Garage Size', 'Review epoxy garage floor cost factors, garage-size examples, and estimate options.'],
  '/2-car-garage-epoxy-cost': ['2-Car Garage Epoxy Floor Cost | Pricing Guide', 'Review cost factors for a two-car garage epoxy floor.'],
  '/3-car-garage-epoxy-cost': ['3-Car Garage Epoxy Floor Cost | Pricing Guide', 'Review cost factors for a three-car garage epoxy floor.'],
  '/garage-floor-coating-cost': ['Garage Floor Coating Cost | Pricing Guide', 'Compare garage floor coating cost factors and system choices.'],
  '/polyaspartic-vs-epoxy-garage-floor': ['Polyaspartic vs. Epoxy Garage Floors', 'Compare polyaspartic and epoxy garage floor coatings by cure time, UV stability, durability, and use case.'],
};

const slugify = (value = '') => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function replaceOrInsert(html, pattern, replacement) {
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace('</head>', `    ${replacement}\n  </head>`);
}

function injectMetadata(template, { title, description, route, robots = 'index, follow' }) {
  const canonical = SITE + (route === '/' ? '/' : route);
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceOrInsert(html, /<meta[^>]+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsert(html, /<meta[^>]+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${escapeHtml(robots)}" />`);
  html = replaceOrInsert(html, /<link[^>]+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  html = replaceOrInsert(html, /<meta[^>]+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsert(html, /<meta[^>]+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsert(html, /<meta[^>]+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  return html;
}

function writeShell(distDir, template, route, meta) {
  const target = path.join(distDir, ...route.split('/').filter(Boolean), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, injectMetadata(template, { ...meta, route }));
}

function sitemapXml(routes) {
  const now = new Date().toISOString().slice(0, 10);
  const rows = [...routes].sort().map((route) => {
    const url = SITE + (route === '/' ? '/' : route);
    return `  <url><loc>${url}</loc><lastmod>${now}</lastmod></url>`;
  });
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...rows, '</urlset>', ''].join('\n');
}

function verifiedStoreRoutes() {
  return XPS_LOCATIONS
    .filter((location) => location.status !== 'coming_soon')
    .map((location) => ({
      route: `/${String(location.state).toLowerCase()}/${slugify(location.city)}`,
      title: `Epoxy Garage Floors in ${location.city}, ${location.state} | EpoxyQuoteNearMe`,
      description: `Explore garage floor coating options near the verified XPS location in ${location.city}, ${location.state}.`,
    }));
}

export function generateServerSeoShells(rootDir = process.cwd()) {
  const distDir = path.join(rootDir, 'dist');
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) throw new Error('SERVER_SEO_TEMPLATE_MISSING');

  const template = fs.readFileSync(templatePath, 'utf8');
  const home = injectMetadata(template, {
    title: 'Epoxy Garage Floor Cost & Instant Estimate | EpoxyQuoteNearMe',
    description: 'Get an instant epoxy garage floor cost estimate and review garage floor coating options.',
    route: '/',
  });
  fs.writeFileSync(templatePath, home);

  const emitted = new Set(['/']);
  for (const [route, [title, description]] of Object.entries(STATIC_SEO)) {
    writeShell(distDir, home, route, { title, description });
    emitted.add(route);
  }
  for (const item of verifiedStoreRoutes()) {
    writeShell(distDir, home, item.route, item);
    emitted.add(item.route);
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml(emitted));
  return { emitted: [...emitted].sort() };
}

export function serverSeoShellsPlugin() {
  return {
    name: 'verified-server-seo-shells',
    apply: 'build',
    closeBundle() {
      generateServerSeoShells();
    },
  };
}
