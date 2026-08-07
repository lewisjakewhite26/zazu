/**
 * Import THEMATIC PACKS/zazu-words-literary.json into the literary_words table.
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node scripts/seed-literary-words.mjs            # dry run by default
 *   node scripts/seed-literary-words.mjs --apply     # write to Supabase
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

dotenv.config({ path: resolve(root, '.env') });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const jsonPath = resolve(root, 'THEMATIC PACKS', 'zazu-words-literary.json');

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.includes('YOUR_PROJECT')) {
    console.error(`Missing or placeholder env var: ${name}`);
    console.error('Copy .env.example → .env and add your Supabase credentials.');
    process.exit(1);
  }
  return value;
}

function loadLiteraryWords() {
  const raw = readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${jsonPath} must be a JSON array of literary word objects`);
  }
  return data;
}

function validateEntry(entry, index) {
  const required = ['word', 'pronunciation', 'pos', 'definition', 'origin', 'authorGroup', 'source', 'rounds'];
  for (const key of required) {
    if (entry[key] == null || entry[key] === '') {
      throw new Error(`Literary word #${index + 1} (${entry.word ?? 'unknown'}): missing "${key}"`);
    }
  }
  if (entry.tier !== 'premium') {
    throw new Error(`Literary word "${entry.word}": tier must be "premium" (got "${entry.tier}")`);
  }
  if (!Array.isArray(entry.rounds) || entry.rounds.length !== 3) {
    throw new Error(`Literary word "${entry.word}": must have exactly 3 rounds`);
  }
  const mcqRounds = entry.rounds.filter((r) => r.format === 'mcq');
  if (mcqRounds.length !== 2) {
    throw new Error(`Literary word "${entry.word}": expected exactly 2 mcq-format rounds, found ${mcqRounds.length}`);
  }
  for (const round of mcqRounds) {
    if (!Array.isArray(round.options) || round.options.length < 2) {
      throw new Error(`Literary word "${entry.word}" round "${round.type}": needs at least 2 options`);
    }
    if (typeof round.correctIndex !== 'number' || !round.options[round.correctIndex]) {
      throw new Error(`Literary word "${entry.word}" round "${round.type}": correctIndex out of range`);
    }
  }
}

async function main() {
  console.log(`Reading ${jsonPath}`);
  const words = loadLiteraryWords();
  words.forEach(validateEntry);

  const byAuthor = words.reduce((acc, w) => {
    acc[w.authorGroup] = (acc[w.authorGroup] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Found ${words.length} literary words`);
  console.log(`By author group: ${Object.entries(byAuthor).map(([k, v]) => `${k} ${v}`).join(', ')}`);

  if (!apply) {
    console.log('');
    console.log('Dry run — validation passed, no database writes. Re-run with --apply to write to Supabase.');
    return;
  }

  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Seeding literary_words…');
  for (let i = 0; i < words.length; i++) {
    const entry = words[i];
    const { error } = await supabase.from('literary_words').upsert(
      {
        word: entry.word,
        pronunciation: entry.pronunciation,
        pos: entry.pos,
        definition: entry.definition,
        origin: entry.origin,
        tier: entry.tier,
        pack_id: entry.packId ?? 'literary',
        author_group: entry.authorGroup,
        source: entry.source,
        rounds: entry.rounds,
        roots: entry.roots ?? null,
        intro_etymology: entry.introEtymology ?? null,
        morning_task: entry.morningTask ?? null,
        subpack: entry.subpack ?? null,
        display_order: i,
      },
      { onConflict: 'word' },
    );

    if (error) throw new Error(`literary_words upsert "${entry.word}": ${error.message}`);
    console.log(`  ✓ ${entry.word}`);
  }

  console.log(`Done — ${words.length} literary words synced.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
