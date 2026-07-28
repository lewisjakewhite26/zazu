/**
 * Normalise word-bank copy to match writing-rules.md:
 * - Round labels: middle dot separator (Round 1 of 3 · Etymology)
 * - Etymology origins and other strings: em dash → comma
 *
 * Usage:
 *   node scripts/normalize-word-copy.mjs
 *   node scripts/normalize-word-copy.mjs --dry-run
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const WORD_FILES = ['zazu-words.json'];

const BANNED_WORDS =
  /\b(delve|robust|comprehensive|leverage|seamlessly|seamless|utilize|embark|showcasing|testament to|underscores|game-changer|holistic|actionable|impactful|paradigm|intricate|ever-evolving|best practices)\b/gi;

/** @param {string} text */
export function normalizeCopy(text) {
  if (typeof text !== 'string' || !text.includes('—') && !text.includes(' -- ')) {
    return text;
  }

  let s = text;
  s = s.replace(/Round (\d) of 3 — /g, 'Round $1 of 3 · ');
  s = s.replace(/ — /g, ', ');
  s = s.replace(/—/g, ', ');
  s = s.replace(/ -- /g, ', ');
  return s;
}

/** @param {unknown} value */
function walk(value) {
  if (typeof value === 'string') {
    return normalizeCopy(value);
  }
  if (Array.isArray(value)) {
    return value.map(walk);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
  }
  return value;
}

/** @param {string} filePath */
function processJsonFile(relativePath) {
  const abs = resolve(root, relativePath);
  const raw = readFileSync(abs, 'utf8');
  const data = JSON.parse(raw);
  const normalised = walk(data);
  const output = `${JSON.stringify(normalised, null, 2)}\n`;

  if (output === raw || output === `${raw}\n`) {
    console.log(`  ${relativePath}: no changes`);
    return 0;
  }

  if (!dryRun) {
    writeFileSync(abs, output, 'utf8');
  }
  console.log(`  ${relativePath}: updated${dryRun ? ' (dry run)' : ''}`);
  return 1;
}

function processZazuHtml() {
  const abs = resolve(root, 'index.html');
  let html = readFileSync(abs, 'utf8');
  const marker = 'const WORDS = ';
  const start = html.indexOf(marker);
  if (start === -1) {
    console.log('  index.html: WORDS block not found');
    return 0;
  }

  const jsonStart = start + marker.length;
  let depth = 0;
  let jsonEnd = -1;
  let inString = false;
  let escape = false;

  for (let i = jsonStart; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
  }

  if (jsonEnd === -1) {
    throw new Error('Could not parse WORDS JSON in index.html');
  }

  const jsonText = html.slice(jsonStart, jsonEnd);
  const words = walk(JSON.parse(jsonText));
  const newJson = JSON.stringify(words);
  const newHtml = html.slice(0, jsonStart) + newJson + html.slice(jsonEnd);

  if (newHtml === html) {
    console.log('  index.html: no changes');
    return 0;
  }

  if (!dryRun) {
    writeFileSync(abs, newHtml, 'utf8');
  }
  console.log(`  index.html: WORDS updated${dryRun ? ' (dry run)' : ''}`);
  return 1;
}

function scanBannedWords(relativePath) {
  const abs = resolve(root, relativePath);
  const raw = readFileSync(abs, 'utf8');
  const hits = [...raw.matchAll(BANNED_WORDS)].map((m) => m[0].toLowerCase());
  const unique = [...new Set(hits)];
  if (unique.length) {
    console.warn(`  WARN ${relativePath}: banned words found: ${unique.join(', ')}`);
  }
}

console.log(dryRun ? 'Dry run — normalising word copy…' : 'Normalising word copy…');

let changed = 0;
for (const file of WORD_FILES) {
  changed += processJsonFile(file);
}
changed += processZazuHtml();

console.log('\nScanning for banned words (manual review if any)…');
for (const file of WORD_FILES) {
  scanBannedWords(file);
}

console.log(changed ? `\nDone. ${changed} file(s) changed.` : '\nDone. All files already clean.');
