/**
 * Import zazu-words.json into Supabase.
 * words → word_roots → word_rounds → word_pairs → word_morning_tasks
 * morning-distractors.json → morning_task_distractors
 *
 * Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   npm run seed
 *   npm run seed:dry
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { validateMorningTaskMatchesRules } from '../lib/morning-task-generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

dotenv.config({ path: resolve(root, '.env') });

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fileArg = args.find((a) => a.startsWith('--file='));
const jsonPath = resolve(
  root,
  fileArg ? fileArg.slice('--file='.length) : process.env.ZAZU_WORDS_JSON || 'zazu-words.json',
);
const distractorPath = resolve(root, 'morning-distractors.json');

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

function loadDistractors() {
  const raw = readFileSync(distractorPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.distractors)) {
    throw new Error(`${distractorPath} must have a distractors array`);
  }
  return data.distractors;
}

function gymRoundTypeFromLabel(typeLabel) {
  const value = String(typeLabel ?? '').toLowerCase();
  if (value.startsWith('definition')) return 'definition';
  if (value.startsWith('usage')) return 'usage';
  return 'etymology';
}

function validateWord(entry, index) {
  entry.tier = entry.tier ?? 'free';

  const required = ['word', 'pronunciation', 'pos', 'definition', 'origin', 'rounds'];
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

  validateMorningTaskMatchesRules(entry, index);
}

async function seedDistractors(supabase, distractors) {
  for (const item of distractors) {
    const { error } = await supabase.from('morning_task_distractors').upsert(
      {
        task_type: item.taskType,
        answer_text: item.answerText,
        weight: item.weight ?? 1,
        active: true,
      },
      { onConflict: 'task_type,answer_text' },
    );
    if (error) {
      throw new Error(`morning_task_distractors "${item.answerText}": ${error.message}`);
    }
  }
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
        intro_etymology: entry.introEtymology,
        gym_enabled: entry.gymEnabled ?? true,
      },
      { onConflict: 'word' },
    )
    .select('id')
    .single();

  if (wordError) throw new Error(`words upsert "${entry.word}": ${wordError.message}`);

  const wordId = wordRow.id;

  const { error: clearTaskError } = await supabase
    .from('word_morning_tasks')
    .delete()
    .eq('word_id', wordId);
  if (clearTaskError) {
    throw new Error(`word_morning_tasks delete "${entry.word}": ${clearTaskError.message}`);
  }

  const { error: clearRootsError } = await supabase.from('word_roots').delete().eq('word_id', wordId);
  if (clearRootsError) {
    throw new Error(`word_roots delete "${entry.word}": ${clearRootsError.message}`);
  }

  const rootIdByIndex = new Map();

  for (let ri = 0; ri < (entry.roots ?? []).length; ri++) {
    const root = entry.roots[ri];
    const { data: rootRow, error: rootError } = await supabase
      .from('word_roots')
      .insert({
        word_id: wordId,
        root_index: ri,
        root_text: root.rootText,
        root_language: root.rootLanguage,
        root_meaning: root.rootMeaning,
        show_in_intro: root.showInIntro !== false,
      })
      .select('id')
      .single();

    if (rootError) throw new Error(`word_roots "${entry.word}" r${ri}: ${rootError.message}`);
    rootIdByIndex.set(ri, rootRow.id);
  }

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

  const task = entry.morningTask;
  let sourceRootId = null;
  if (task.sourceKind === 'root') {
    sourceRootId = rootIdByIndex.get(0) ?? null;
    if (!sourceRootId) {
      throw new Error(`Word "${entry.word}": root morning task requires at least one root row`);
    }
  }

  const { error: taskError } = await supabase.from('word_morning_tasks').upsert(
    {
      word_id: wordId,
      task_type: task.taskType,
      source_kind: task.sourceKind,
      source_value: task.sourceValue,
      correct_answer: task.correctAnswer,
      hint: task.hint ?? null,
      source_root_id: sourceRootId,
      generator_version: task.generatorVersion ?? '1',
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'word_id' },
  );

  if (taskError) throw new Error(`word_morning_tasks "${entry.word}": ${taskError.message}`);

  return wordId;
}

async function main() {
  console.log(`Reading ${jsonPath}`);
  const words = loadWords();
  words.forEach(validateWord);

  const distractors = loadDistractors();
  const free = words.filter((w) => w.tier === 'free').length;
  const premium = words.filter((w) => w.tier === 'premium').length;
  const taskCounts = words.reduce((acc, w) => {
    acc[w.morningTask.taskType] = (acc[w.morningTask.taskType] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Found ${words.length} words (${free} free, ${premium} premium)`);
  console.log(
    `Morning tasks: root ${taskCounts.root ?? 0}, definition ${taskCounts.definition ?? 0}, etymology ${taskCounts.etymology ?? 0}`,
  );
  console.log(`Distractor pool: ${distractors.length} entries`);

  if (dryRun) {
    console.log('Dry run — validation passed, no database writes.');
    return;
  }

  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Seeding distractor pool…');
  await seedDistractors(supabase, distractors);
  console.log(`  ✓ ${distractors.length} distractors`);

  console.log('Seeding words…');
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
