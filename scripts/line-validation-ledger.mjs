import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const base = process.argv[2] || 'origin/main';
const head = process.argv[3] || 'HEAD';
const output = process.env.LINE_VALIDATION_RECEIPT || 'line-validation-receipt.json';
const validatorVersion = 'nearme-line-validator-v1';

const diff = execFileSync('git', ['diff', '--unified=0', '--no-color', base, head, '--'], { encoding: 'utf8' });
let filePath = '';
let newLine = 0;
const receipts = [];

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"'${}]{12,}["']/i,
  /Bearer\s+[A-Za-z0-9._~+\/-]{24,}/,
];
const protectedMutationPatterns = [
  /domains?\.(?:purchase|register|transfer|renew)/i,
  /(?:dns|domain).*\.(?:create|update|delete)\(/i,
  /merge_pull_request\(/i,
];

function validateLine(line) {
  const failures = [];
  if (secretPatterns.some((pattern) => pattern.test(line))) failures.push('POTENTIAL_SECRET_LITERAL');
  if (protectedMutationPatterns.some((pattern) => pattern.test(line))) failures.push('PROTECTED_MUTATION_NOT_ALLOWED_IN_PATCH');
  if (/console\.log\([^)]*(?:accessToken|secret|password|apiKey)/i.test(line)) failures.push('SENSITIVE_LOGGING_RISK');
  return failures;
}

for (const raw of diff.split('\n')) {
  if (raw.startsWith('+++ b/')) {
    filePath = raw.slice(6);
    continue;
  }
  if (raw.startsWith('@@')) {
    const match = raw.match(/\+(\d+)(?:,(\d+))?/);
    newLine = match ? Number(match[1]) : 0;
    continue;
  }
  if (!filePath || raw.startsWith('--- ') || raw.startsWith('diff ') || raw.startsWith('index ')) continue;
  if (raw.startsWith('+') && !raw.startsWith('+++')) {
    const line = raw.slice(1);
    const failures = validateLine(line);
    const lineHash = createHash('sha256').update(`${filePath}:${newLine}:${line}`).digest('hex');
    receipts.push({
      receipt_id: `${filePath}:${newLine}:${lineHash.slice(0, 12)}`,
      file_path: filePath,
      line_number: newLine,
      line_hash: lineHash,
      validator_version: validatorVersion,
      checks: ['secret_literal', 'protected_mutation', 'sensitive_logging'],
      status: failures.length ? 'FAIL' : 'PASS',
      failure_reason: failures.join(','),
    });
    newLine += 1;
    continue;
  }
  if (!raw.startsWith('-')) newLine += 1;
}

const failed = receipts.filter((receipt) => receipt.status !== 'PASS');
const report = {
  validator_version: validatorVersion,
  base,
  head,
  generated_at: new Date().toISOString(),
  added_lines_checked: receipts.length,
  failures: failed.length,
  status: failed.length ? 'FAIL' : 'PASS',
  receipts,
};
writeFileSync(output, JSON.stringify(report, null, 2));
console.log(`LINE_VALIDATION ${report.status}: ${report.added_lines_checked} added lines, ${report.failures} failures`);
if (failed.length) {
  for (const receipt of failed.slice(0, 20)) console.error(`${receipt.file_path}:${receipt.line_number} ${receipt.failure_reason}`);
  process.exit(1);
}
