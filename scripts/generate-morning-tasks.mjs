/**
 * Add roots, introEtymology, and morningTask blocks to zazu-words.json.
 *
 * Usage:
 *   npm run words:morning-tasks
 *   node scripts/generate-morning-tasks.mjs --check
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrichWordEntry, validateMorningTaskMatchesRules } from '../lib/morning-task-generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const jsonPath = resolve(root, process.env.ZAZU_WORDS_JSON || 'zazu-words.json');
const checkOnly = process.argv.includes('--check');

const raw = readFileSync(jsonPath, 'utf8');
const words = JSON.parse(raw);
if (!Array.isArray(words)) {
  throw new Error(`${jsonPath} must be a JSON array`);
}

if (checkOnly) {
  words.forEach((entry, index) => validateMorningTaskMatchesRules(entry, index));
  console.log(`Morning task blocks valid for ${words.length} words.`);
  process.exit(0);
}

const enriched = words.map((entry) => {
  const next = enrichWordEntry(entry);
  return {
    ...entry,
    roots: next.roots,
    introEtymology: next.introEtymology,
    morningTask: next.morningTask,
  };
});

writeFileSync(jsonPath, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8');

const byType = enriched.reduce((acc, w) => {
  acc[w.morningTask.taskType] = (acc[w.morningTask.taskType] ?? 0) + 1;
  return acc;
}, {});

console.log(`Updated ${jsonPath}`);
console.log(`  root: ${byType.root ?? 0}, definition: ${byType.definition ?? 0}, etymology: ${byType.etymology ?? 0}`);
