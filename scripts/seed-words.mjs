/**
 * Import zazu-words.json into Supabase (words → word_rounds → word_pairs).
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   npm run seed
 *   npm run seed:dry
 *   node scripts/seed-words.mjs --file ./zazu-words.json
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
const dryRun = args.includes('--dry-run');
const fileArg = args.find((a) => a.startsWith('--file='));
const jsonPath = resolve(
  root,
  fileArg ? fileArg.slice('--file='.length) : process.env.ZAZU_WORDS_JSON || 'zazu-words.json'
);

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.includes('YOUR_PROJECT')) {
    console.error(`Missing or placeholder env var: ${name}`);
    console.error('Copy .env.example → .env and add your Supabase credentials.');
    process.exit(1);
  }
  return value;
}

function loadWords() {
  const raw = readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${jsonPath} must be a JSON array of word objects`);
  }
  return data;
}

function validateWord(entry, index) {
  const required = ['word', 'pronunciation', 'pos', 'definition', 'origin', 'tier', 'rounds'];
  for (const key of required) {
    if (entry[key] == null || entry[key] === '') {
      throw new Error(`Word #${index + 1} (${entry.word ?? 'unknown'}): missing "${key}"`);
    }
  }
  if (!['free', 'premium'].includes(entry.tier)) {
    throw new Error(`Word "${entry.word}": tier must be "free" or "premium"`);
  }
  if (!Array.isArray(entry.rounds) || entry.rounds.length !== 3) {
    throw new Error(`Word "${entry.word}": must have exactly 3 rounds`);
  }
  entry.rounds.forEach((round, ri) => {
    for (const key of ['type', 'label', 'context', 'pairs']) {
      if (!round[key]) throw new Error(`Word "${entry.word}" round ${ri + 1}: missing "${key}"`);
    }
    if (!Array.isArray(round.pairs) || round.pairs.length < 1) {
      throw new Error(`Word "${entry.word}" round ${ri + 1}: pairs must be a non-empty array`);
    }
    round.pairs.forEach((pair, pi) => {
      if (!pair.a || !pair.b) {
        throw new Error(`Word "${entry.word}" round ${ri + 1} pair ${pi + 1}: needs "a" and "b"`);
      }
    });
  });
}

async function upsertWord(supabase, entry, displayOrder) {
  const { data: wordRow, error: wordError } = await supabase
    .from('words')
    .upsert(
      {
        word: entry.word,
        pronunciation: entry.pronunciation,
        pos: entry.pos,
        definition: entry.definition,
        origin: entry.origin,
        tier: entry.tier,
        display_order: displayOrder,
      },
      { onConflict: 'word' }
    )
    .select('id')
    .single();

  if (wordError) throw new Error(`words upsert "${entry.word}": ${wordError.message}`);

  const wordId = wordRow.id;

  // Replace rounds/pairs on re-seed
  await supabase.from('word_rounds').delete().eq('word_id', wordId);

  for (let ri = 0; ri < entry.rounds.length; ri++) {
    const round = entry.rounds[ri];
    const { data: roundRow, error: roundError } = await supabase
      .from('word_rounds')
      .insert({
        word_id: wordId,
        round_index: ri,
        type: round.type,
        label: round.label,
        context: round.context,
      })
      .select('id')
      .single();

    if (roundError) throw new Error(`word_rounds "${entry.word}" r${ri}: ${roundError.message}`);

    const pairs = round.pairs.map((pair, pi) => ({
      round_id: roundRow.id,
      pair_index: pi,
      side_a: pair.a,
      side_b: pair.b,
    }));

    const { error: pairsError } = await supabase.from('word_pairs').insert(pairs);
    if (pairsError) throw new Error(`word_pairs "${entry.word}" r${ri}: ${pairsError.message}`);
  }

  return wordId;
}

async function main() {
  console.log(`Reading ${jsonPath}`);
  const words = loadWords();
  words.forEach(validateWord);

  const free = words.filter((w) => w.tier === 'free').length;
  const premium = words.filter((w) => w.tier === 'premium').length;
  console.log(`Found ${words.length} words (${free} free, ${premium} premium)`);

  if (dryRun) {
    console.log('Dry run — validation passed, no database writes.');
    return;
  }

  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Seeding Supabase…');
  for (let i = 0; i < words.length; i++) {
    const id = await upsertWord(supabase, words[i], i + 1);
    console.log(`  ✓ ${words[i].word} (${id})`);
  }

  console.log(`Done — ${words.length} words synced.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
