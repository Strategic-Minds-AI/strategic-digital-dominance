import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import ts from 'typescript';
import { ESLint } from 'eslint';

const base = process.argv[2] || 'origin/main';
const head = process.argv[3] || 'HEAD';
const names = execFileSync('git', ['diff', '--name-only', base, head, '--'], { encoding: 'utf8' })
  .split('\n')
  .map((value) => value.trim())
  .filter(Boolean);

const codeFiles = names.filter((file) => /\.(?:[cm]?[jt]sx?)$/.test(file) && fs.existsSync(file));
const syntaxFailures = [];

function scriptKind(file) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (file.endsWith('.ts')) return ts.ScriptKind.TS;
  if (file.endsWith('.jsx')) return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
}

for (const file of codeFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind(file));
  for (const diagnostic of parsed.parseDiagnostics || []) {
    const pos = diagnostic.start === undefined ? null : parsed.getLineAndCharacterOfPosition(diagnostic.start);
    syntaxFailures.push({
      file,
      line: pos ? pos.line + 1 : null,
      column: pos ? pos.character + 1 : null,
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
    });
  }
}

const lintFiles = names.filter((file) =>
  /^src\//.test(file) &&
  /\.(?:js|jsx|mjs|cjs)$/.test(file) &&
  fs.existsSync(file)
);
let lintErrors = [];
if (lintFiles.length) {
  const eslint = new ESLint({ fix: false });
  const results = await eslint.lintFiles(lintFiles);
  lintErrors = results.flatMap((result) =>
    result.messages
      .filter((message) => message.severity === 2)
      .map((message) => ({
        file: result.filePath,
        line: message.line,
        column: message.column,
        rule: message.ruleId,
        message: message.message,
      }))
  );
}

console.log(`CHANGED_VALIDATION files=${codeFiles.length} syntax_failures=${syntaxFailures.length} lint_files=${lintFiles.length} lint_errors=${lintErrors.length}`);
for (const failure of [...syntaxFailures, ...lintErrors].slice(0, 100)) console.error(JSON.stringify(failure));
if (syntaxFailures.length || lintErrors.length) process.exit(1);
