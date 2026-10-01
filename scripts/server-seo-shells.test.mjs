import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const read = (route) => {
  const file = path.join(root, ...route.split('/').filter(Boolean), 'index.html');
  assert.ok(fs.existsSync(file), `missing server shell: ${route}`);
  return fs.readFileSync(file, 'utf8');
};
const canonical = (html) => (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) || [])[1] || '';
const robots = (html) => (html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i) || [])[1] || '';

assert.equal(canonical(fs.readFileSync(path.join(root, 'index.html'), 'utf8')), 'https://epoxyquotenearme.com/');
assert.equal(canonical(read('/fl/miami')), 'https://epoxyquotenearme.com/fl/miami');
assert.match(read('/fl/miami'), /Miami, FL/i);
assert.match(robots(read('/fl/miami')), /index/i);
assert.equal(canonical(read('/fl/pompano-beach')), 'https://epoxyquotenearme.com/fl/pompano-beach');
assert.equal(canonical(read('/epoxy-garage-floor-cost')), 'https://epoxyquotenearme.com/epoxy-garage-floor-cost');
assert.ok(!fs.existsSync(path.join(root, 'florida', 'miami', 'index.html')), 'full-state aliases must not get server shells');
assert.ok(!fs.existsSync(path.join(root, 'tx', 'lubbock', 'index.html')), 'coming-soon stores must not get server shells');
assert.ok(!fs.existsSync(path.join(root, 'this-route-should-not-exist-20261001', 'index.html')), 'unknown routes must not get server shells');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.ok(sitemapUrls.includes('https://epoxyquotenearme.com/fl/miami'), 'verified Miami route must be in sitemap');
assert.ok(sitemapUrls.includes('https://epoxyquotenearme.com/epoxy-garage-floor-cost'), 'public cost guide must be in sitemap');
assert.ok(!sitemapUrls.some((url) => url.includes('/florida/')), 'full-state aliases must not be in sitemap');
assert.ok(!sitemapUrls.includes('https://epoxyquotenearme.com/download'), 'noindex app route must not be in sitemap');
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'sitemap must not contain duplicates');

console.log(`PASS server SEO shells: ${sitemapUrls.length} verified sitemap URLs, canonical metadata, aliases and unknown routes excluded`);
