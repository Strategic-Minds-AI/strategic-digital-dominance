import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://epoxyquotenearme.com';
const FULL_STATE_TO_CODE = {
  alabama:'al', alaska:'ak', arizona:'az', arkansas:'ar', california:'ca',
  colorado:'co', connecticut:'ct', delaware:'de', florida:'fl', georgia:'ga',
  hawaii:'hi', idaho:'id', illinois:'il', indiana:'in', iowa:'ia',
  kansas:'ks', kentucky:'ky', louisiana:'la', maine:'me', maryland:'md',
  massachusetts:'ma', michigan:'mi', minnesota:'mn', mississippi:'ms', missouri:'mo',
  montana:'mt', nebraska:'ne', nevada:'nv', 'new-hampshire':'nh', 'new-jersey':'nj',
  'new-mexico':'nm', 'new-york':'ny', 'north-carolina':'nc', 'north-dakota':'nd',
  ohio:'oh', oklahoma:'ok', oregon:'or', pennsylvania:'pa', 'rhode-island':'ri',
  'south-carolina':'sc', 'south-dakota':'sd', tennessee:'tn', texas:'tx', utah:'ut',
  vermont:'vt', virginia:'va', washington:'wa', 'west-virginia':'wv', wisconsin:'wi',
  wyoming:'wy', 'district-of-columbia':'dc'
};

const ARTICLE_META = {
  '/polyaspartic-vs-epoxy-garage-floor': {
    title: 'Polyaspartic vs. Epoxy Garage Floors | EpoxyQuoteNearMe',
    description: 'Compare polyaspartic and epoxy garage floor coatings by cost, cure time, UV stability, durability, and best-use scenarios.'
  }
};

function escapeHtml(value='') {
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('"','&quot;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

function humanize(slug='') {
  return slug.split('-').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function pathsFromSitemap(file) {
  if (!fs.existsSync(file)) return [];
  const xml = fs.readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
}

function routeMeta(route) {
  if (ARTICLE_META[route]) {
    return {...ARTICLE_META[route], canonical: route, robots: 'index, follow'};
  }

  const parts = route.split('/').filter(Boolean);
  if (parts.length === 2) {
    const [statePart, citySlug] = parts;
    const city = humanize(citySlug);
    const stateLower = statePart.toLowerCase();

    if (FULL_STATE_TO_CODE[stateLower]) {
      const code = FULL_STATE_TO_CODE[stateLower];
      const canonical = `/${code}/${citySlug}`;
      return {
        title: `Epoxy Garage Floors in ${city}, ${code.toUpperCase()} | EpoxyQuoteNearMe`,
        description: `Compare epoxy and garage floor coating options in ${city}, ${code.toUpperCase()}. Get a fast personalized estimate and review local installation considerations.`,
        canonical,
        robots: 'noindex, follow',
        derivedCanonical: canonical
      };
    }

    if (/^[a-z]{2}$/i.test(statePart)) {
      const code = statePart.toLowerCase();
      return {
        title: `Epoxy Garage Floors in ${city}, ${code.toUpperCase()} | EpoxyQuoteNearMe`,
        description: `Compare epoxy and garage floor coating options in ${city}, ${code.toUpperCase()}. Get a fast personalized estimate and review local installation considerations.`,
        canonical: route,
        robots: 'index, follow'
      };
    }
  }

  if (parts.length === 1) {
    const label = humanize(parts[0]);
    return {
      title: `${label} | EpoxyQuoteNearMe`,
      description: `Learn about ${label.toLowerCase()} and get a personalized garage floor coating estimate from EpoxyQuoteNearMe.`,
      canonical: route,
      robots: 'index, follow'
    };
  }

  return null;
}

function replaceOrInsert(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

function injectMetadata(template, meta) {
  const canonicalUrl = SITE + meta.canonical;
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceOrInsert(
    html,
    /<meta[^>]+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  html = replaceOrInsert(
    html,
    /<meta[^>]+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`
  );
  html = replaceOrInsert(
    html,
    /<link[^>]+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );
  html = replaceOrInsert(
    html,
    /<meta[^>]+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = replaceOrInsert(
    html,
    /<meta[^>]+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = replaceOrInsert(
    html,
    /<meta[^>]+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );
  html = replaceOrInsert(
    html,
    /<meta[^>]+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = replaceOrInsert(
    html,
    /<meta[^>]+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  return html;
}

function writeShell(distDir, template, route, meta) {
  const target = path.join(distDir, ...route.split('/').filter(Boolean), 'index.html');
  fs.mkdirSync(path.dirname(target), {recursive:true});
  fs.writeFileSync(target, injectMetadata(template, meta));
}

export function generateServerSeoShells(rootDir=process.cwd()) {
  const distDir = path.join(rootDir, 'dist');
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) throw new Error('SERVER_SEO_TEMPLATE_MISSING');

  const template = fs.readFileSync(templatePath, 'utf8');
  const home = injectMetadata(template, {
    title: 'Epoxy Garage Floor Cost & Instant Estimate | EpoxyQuoteNearMe',
    description: 'Get an instant epoxy garage floor cost estimate in about 60 seconds. Free, no obligation, personalized price range for your garage.',
    canonical: '/',
    robots: 'index, follow'
  });
  fs.writeFileSync(templatePath, home);
  const sources = [
    path.join(rootDir, 'public', 'sitemap.xml'),
    path.join(rootDir, 'public', 'sitemap-epn.xml')
  ];
  const inputRoutes = [...new Set(sources.flatMap(pathsFromSitemap))]
    .filter((route) => route !== '/');

  const emitted = new Set();
  for (const route of inputRoutes) {
    const meta = routeMeta(route);
    if (!meta) continue;
    writeShell(distDir, home, route, meta);
    emitted.add(route);

    if (meta.derivedCanonical && !emitted.has(meta.derivedCanonical)) {
      const canonicalMeta = routeMeta(meta.derivedCanonical);
      if (canonicalMeta) {
        writeShell(distDir, home, meta.derivedCanonical, canonicalMeta);
        emitted.add(meta.derivedCanonical);
      }
    }
  }
  return {emitted:[...emitted].sort()};
}

export function serverSeoShellsPlugin() {
  return {
    name: 'server-seo-shells',
    apply: 'build',
    closeBundle() {
      generateServerSeoShells();
    }
  };
}
