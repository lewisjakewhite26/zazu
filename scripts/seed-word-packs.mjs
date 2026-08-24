/**
 * Import THEMATIC PACKS/games-master.json and THEMATIC PACKS/loan words/*.json
 * into the core words/word_rounds/word_pairs tables (pack_id/subpack_id
 * columns from 010_word_packs.sql), reusing the same shape as the core word
 * bank -- unlike Literary, which needed an isolated table.
 *
 * Deliberately does NOT touch word_roots or word_morning_tasks: pack words
 * never reach the alarm, so those tables have no consumer here. gym_enabled
 * is forced to false regardless of the source JSON, keeping pack words out
 * of the general Gym pool (Roots Drill / Usage Lab distractor sampling).
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node scripts/seed-word-packs.mjs            # dry run by default
 *   node scripts/seed-word-packs.mjs --apply     # write to Supabase
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

const SOURCES = [
  resolve(root, 'THEMATIC PACKS', 'games-master.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-african.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-americas.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-classical.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-curious.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-east-asian.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-french.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-nordic.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-german-yiddish.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-italian.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-spanish.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-middle-eastern.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-south-asian.json'),
  resolve(root, 'THEMATIC PACKS', 'loan words', 'loan-pacific.json'),
  resolve(root, 'THEMATIC PACKS', 'eponym words', 'eponym-literary.json'),
  resolve(root, 'THEMATIC PACKS', 'eponym words', 'eponym-fashion.json'),
  resolve(root, 'THEMATIC PACKS', 'eponym words', 'eponym-food.json'),
  resolve(root, 'THEMATIC PACKS', 'eponym words', 'eponym-politics.json'),
  resolve(root, 'THEMATIC PACKS', 'eponym words', 'eponym-invention.json'),
  resolve(root, 'THEMATIC PACKS', 'science words', 'science-biology.json'),
  resolve(root, 'THEMATIC PACKS', 'science words', 'science-chemistry.json'),
  resolve(root, 'THEMATIC PACKS', 'science words', 'science-earth.json'),
  resolve(root, 'THEMATIC PACKS', 'science words', 'science-physics.json'),
  resolve(root, 'THEMATIC PACKS', 'science words', 'science-computing.json'),
];

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
  const words = [];
  for (const path of SOURCES) {
    const raw = readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error(`${path} must be a JSON array of word objects`);
    }
    words.push(...data);
  }
  return words;
}

function validateEntry(entry, index) {
  const required = ['word', 'pronunciation', 'pos', 'definition', 'origin', 'tier', 'packId', 'rounds'];
  for (const key of required) {
    if (entry[key] == null || entry[key] === '') {
      throw new Error(`Pack word #${index + 1} (${entry.word ?? 'unknown'}): missing "${key}"`);
    }
  }
  if (entry.tier !== 'premium') {
    throw new Error(`Pack word "${entry.word}": tier must be "premium" (got "${entry.tier}") -- packs must never leak free`);
  }
  if (!Array.isArray(entry.rounds) || entry.rounds.length !== 3) {
    throw new Error(`Pack word "${entry.word}": must have exactly 3 rounds`);
  }
  entry.rounds.forEach((round, ri) => {
    for (const key of ['type', 'label', 'context', 'pairs']) {
      if (!round[key]) throw new Error(`Pack word "${entry.word}" round ${ri + 1}: missing "${key}"`);
    }
    if (!Array.isArray(round.pairs) || round.pairs.length < 1) {
      throw new Error(`Pack word "${entry.word}" round ${ri + 1}: pairs must be a non-empty array`);
    }
    round.pairs.forEach((pair, pi) => {
      if (!pair.a || !pair.b) {
        throw new Error(`Pack word "${entry.word}" round ${ri + 1} pair ${pi + 1}: needs "a" and "b"`);
      }
    });
  });
}

function gymRoundTypeFromLabel(typeLabel) {
  const value = String(typeLabel ?? '').toLowerCase();
  if (value.startsWith('definition')) return 'definition';
  if (value.startsWith('usage')) return 'usage';
  return 'etymology';
}

/** Refuses to upsert over a word that already exists as a non-pack (core word bank) row -- the shared `words.word` unique constraint would otherwise silently overwrite it. */
async function checkNoCollisions(supabase, words) {
  const wordTexts = words.map((w) => w.word);
  const { data, error } = await supabase.from('words').select('word, pack_id').in('word', wordTexts);
  if (error) throw new Error(`Collision check failed: ${error.message}`);

  const collisions = (data ?? []).filter((row) => row.pack_id == null);
  if (collisions.length > 0) {
    const names = collisions.map((row) => row.word).join(', ');
    throw new Error(
      `Refusing to seed: ${collisions.length} pack word(s) already exist as core/free words: ${names}`,
    );
  }
}

async function upsertPackWord(supabase, entry, displayOrder) {
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
        intro_etymology: entry.introEtymology ?? null,
        gym_enabled: false,
        pack_id: entry.packId,
        subpack_id: entry.subpack?.id ?? null,
      },
      { onConflict: 'word' },
    )
    .select('id')
    .single();

  if (wordError) throw new Error(`words upsert "${entry.word}": ${wordError.message}`);

  const wordId = wordRow.id;

  const { error: clearRoundsError } = await supabase.from('word_rounds').delete().eq('word_id', wordId);
  if (clearRoundsError) {
    throw new Error(`word_rounds delete "${entry.word}": ${clearRoundsError.message}`);
  }

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
        gym_round_type: gymRoundTypeFromLabel(round.type),
        gym_only: true,
      })
      .select('id')
      .single();

    if (roundError) throw new Error(`word_rounds "${entry.word}" r${ri}: ${roundError.message}`);

    const pairs = round.pairs.map((pair, pi) => ({
      round_id: roundRow.id,
      pair_index: pi,
      side_a: pair.a,
      side_b: pair.b,
      pair_role: pair.pairRole ?? 'match',
    }));

    const { error: pairsError } = await supabase.from('word_pairs').insert(pairs);
    if (pairsError) throw new Error(`word_pairs "${entry.word}" r${ri}: ${pairsError.message}`);
  }

  return wordId;
}

async function main() {
  const words = loadWords();
  words.forEach(validateEntry);

  const byPack = words.reduce((acc, w) => {
    acc[w.packId] = (acc[w.packId] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Found ${words.length} pack words across ${SOURCES.length} source files`);
  console.log(`By pack: ${Object.entries(byPack).map(([k, v]) => `${k} ${v}`).join(', ')}`);

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

  console.log('Checking for collisions with existing core/free words…');
  await checkNoCollisions(supabase, words);

  console.log('Seeding pack words…');
  for (let i = 0; i < words.length; i++) {
    const id = await upsertPackWord(supabase, words[i], i);
    console.log(`  ✓ ${words[i].word} (${words[i].packId}) (${id})`);
  }

  console.log(`Done — ${words.length} pack words synced.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
