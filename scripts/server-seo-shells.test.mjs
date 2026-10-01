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

console.log('PASS server SEO shells: verified routes only, canonical metadata, aliases and unknown routes excluded');
