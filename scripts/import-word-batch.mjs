/**
 * Import a batch of word entries into zazu-words.json.
 *
 * Accepts Claude-style snake_case fields (intro_etymology, morning_task, roots)
 * or Zazu camelCase. Regenerates roots / introEtymology / morningTask from
 * rounds via enrichWordEntry so seed validation passes.
 *
 * Usage:
 *   node scripts/import-word-batch.mjs path/to/batch.json
 *   node scripts/import-word-batch.mjs path/to/batch.json --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  enrichWordEntry,
  validateMorningTaskMatchesRules,
} from '../lib/morning-task-generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const wordsPath = resolve(root, process.env.ZAZU_WORDS_JSON || 'zazu-words.json');
const inputPath = resolve(process.cwd(), process.argv[2] ?? 'batch-import.json');
const dryRun = process.argv.includes('--dry-run');

function loadBatch(path) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    const files = readdirSync(path)
      .filter((name) => name.endsWith('.json'))
      .sort();
    return files.flatMap((name) => loadJson(resolve(path, name)));
  }
  return loadJson(path);
}

function fixRoundLabel(label) {
  return String(label).replace(/\s--\s/g, ' · ');
}

function normalizeRoots(rawRoots) {
  if (!Array.isArray(rawRoots)) return undefined;
  return rawRoots.map((rootEntry) => ({
    rootText: rootEntry.rootText ?? rootEntry.root_text,
    rootLanguage: rootEntry.rootLanguage ?? rootEntry.root_language ?? null,
    rootMeaning: rootEntry.rootMeaning ?? rootEntry.root_meaning,
    showInIntro: rootEntry.showInIntro ?? rootEntry.show_in_intro ?? true,
  }));
}

function normalizeIntro(raw) {
  if (raw.introEtymology?.spans) return raw.introEtymology;
  if (!Array.isArray(raw.intro_etymology)) return undefined;
  return {
    spans: raw.intro_etymology.map((span) => ({
      text: span.text,
      highlight: Boolean(span.highlight),
    })),
  };
}

function normalizeMorningTask(raw) {
  const mt = raw.morningTask ?? raw.morning_task;
  if (!mt) return undefined;
  const taskType = mt.taskType ?? mt.task_type;
  let sourceKind = mt.sourceKind ?? mt.source_kind;
  if (!sourceKind) {
    if (taskType === 'root') sourceKind = 'root';
    else if (taskType === 'definition') sourceKind = 'definition';
    else if (taskType === 'etymology') sourceKind = 'origin_summary';
    else sourceKind = taskType;
  }
  const hints = {
    root: 'Check the highlighted roots in the etymology line.',
    definition: 'Check the definition you just read.',
    etymology: 'Read the etymology line again.',
  };
  return {
    taskType,
    sourceKind,
    sourceValue: mt.sourceValue ?? mt.source_value,
    correctAnswer: mt.correctAnswer ?? mt.correct_answer,
    hint: mt.hint ?? hints[taskType] ?? 'Check the word details again.',
    generatorVersion: mt.generatorVersion ?? '1',
  };
}

function normalizeEntry(raw) {
  const rounds = (raw.rounds ?? []).map((round) => ({
    type: round.type,
    label: fixRoundLabel(round.label),
    context: round.context,
    pairs: round.pairs,
  }));

  for (const round of rounds) {
    if (!/^Round [123] of 3 · (Etymology|Definition|Usage)$/.test(round.label)) {
      throw new Error(`Word "${raw.word}": invalid round label "${round.label}"`);
    }
  }

  const base = {
    word: raw.word,
    pronunciation: raw.pronunciation,
    pos: raw.pos,
    definition: raw.definition,
    origin: String(raw.origin).replace(/\s--\s/g, ','),
    tier: raw.tier ?? 'free',
    rounds,
  };

  const enriched = enrichWordEntry(base);
  return enriched;
}

function loadJson(path) {
  const data = JSON.parse(readFileSync(path, 'utf8'));
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  throw new Error(`${path} must be a JSON array or object`);
}

const existing = loadJson(wordsPath);
const batch = loadBatch(inputPath);
const existingNames = new Set(existing.map((entry) => entry.word.toLowerCase()));

const added = [];
const skipped = [];

for (let i = 0; i < batch.length; i += 1) {
  const raw = batch[i];
  const key = String(raw.word ?? '').toLowerCase();
  if (!key) {
    throw new Error(`Batch entry #${i + 1}: missing word`);
  }
  if (existingNames.has(key)) {
    skipped.push(raw.word);
    continue;
  }

  const entry = normalizeEntry(raw);
  validateMorningTaskMatchesRules(entry, existing.length + added.length);
  added.push(entry);
  existingNames.add(key);
}

console.log(`Input: ${inputPath}`);
console.log(`Existing words: ${existing.length}`);
console.log(`Importing: ${added.length}`);
if (skipped.length) console.log(`Skipped duplicates: ${skipped.join(', ')}`);

if (added.length === 0) {
  console.log('Nothing to add.');
  process.exit(0);
}

const merged = [...existing, ...added];

if (dryRun) {
  console.log('Dry run — no files written.');
  console.log(`Would write ${merged.length} words to ${wordsPath}`);
  added.forEach((entry) => console.log(`  + ${entry.word}`));
  process.exit(0);
}

writeFileSync(wordsPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
console.log(`Wrote ${merged.length} words to ${wordsPath}`);
added.forEach((entry) => console.log(`  + ${entry.word}`));
