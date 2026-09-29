import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const read = (route) => {
  const file = path.join(root, ...route.split('/').filter(Boolean), 'index.html');
  assert.ok(fs.existsSync(file), `missing server SEO shell: ${route}`);
  return fs.readFileSync(file, 'utf8');
};
const title = (html) => (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
const canonical = (html) => (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i) || [])[1] || '';
const robots = (html) => (html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i) || [])[1] || '';

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const homeTitle = title(home);
assert.equal(canonical(home), 'https://epoxyquotenearme.com/');

const article = read('/polyaspartic-vs-epoxy-garage-floor');
assert.notEqual(title(article), homeTitle, 'article shell must not reuse homepage title');
assert.equal(canonical(article), 'https://epoxyquotenearme.com/polyaspartic-vs-epoxy-garage-floor');

const pompano = read('/fl/pompano-beach');
assert.match(title(pompano), /Pompano Beach, FL/i);
assert.equal(canonical(pompano), 'https://epoxyquotenearme.com/fl/pompano-beach');
assert.match(robots(pompano), /index/i);

const alias = read('/florida/miami-gardens');
assert.equal(canonical(alias), 'https://epoxyquotenearme.com/fl/miami-gardens');
assert.match(robots(alias), /noindex/i);

const canonicalLocation = read('/fl/miami-gardens');
assert.match(title(canonicalLocation), /Miami Gardens, FL/i);
assert.equal(canonical(canonicalLocation), 'https://epoxyquotenearme.com/fl/miami-gardens');
assert.doesNotMatch(robots(canonicalLocation), /noindex/i);

assert.ok(!fs.existsSync(path.join(root, 'this-route-must-not-exist-apex-20260929', 'index.html')), 'invalid routes must not get shells');

console.log('PASS server SEO shells: unique metadata, canonical routes, alias consolidation, invalid-route exclusion');
