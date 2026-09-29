import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass, detail });
  if (!pass) failures.push({ name, detail });
};

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const vite = await readFile(path.join(root, 'vite.config.js'), 'utf8');
const client = await readFile(path.join(root, 'src/api/base44Client.js'), 'utf8');
const platformApi = await readFile(path.join(root, 'api/platform.js'), 'utf8');

check('Vite has no Base44 plugin import', !vite.includes('@base44/vite-plugin'));
check('Frontend client has no Base44 SDK import',
  !client.includes("from '@base44/sdk'") && !client.includes('from "@base44/sdk"'));
check('Compatibility client routes through platform boundary', client.includes("fetch('/api/platform'"));
check('Platform API fails closed for unmigrated capabilities', platformApi.includes("code: 'MIGRATION_REQUIRED'"));
check('Platform API declares no production mutation', platformApi.includes('productionMutation: false'));

const activeFiles = (await walk(path.join(root, 'src')))
  .filter(file => /\.(?:js|jsx|ts|tsx|mjs)$/.test(file));
const forbiddenImports = [];
for (const file of activeFiles) {
  const source = await readFile(file, 'utf8');
  if (/from\s+['"]@base44\/sdk['"]/.test(source) || /from\s+['"]base44:/.test(source)) {
    forbiddenImports.push(path.relative(root, file));
  }
}
check('Active src has no direct Base44 runtime imports', forbiddenImports.length === 0, forbiddenImports.join(', '));

for (const result of checks) {
  console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
}
if (failures.length) process.exit(1);
console.log(`\n${checks.length}/${checks.length} de-Base runtime checks passed.`);
