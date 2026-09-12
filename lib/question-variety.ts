/**
 * Rotates the instruction/question phrasing shown around Word Gym rounds,
 * the Morning Task, and the Roots Drill / Usage Lab practice modes.
 *
 * Every one of these used to be a single fixed sentence with only the word
 * swapped in (e.g. every word's Etymology round read "Where does X come
 * from? Match each root to its meaning."), so the ritual read as templated
 * rather than considered after a few days of daily use. This picks from a
 * pool of hand-written variants instead, deterministically per word (and
 * per round, for words with more than one round) so a given word always
 * shows the same phrasing on replay, but different words genuinely differ.
 */

/** Simple deterministic string hash (djb2-ish) -- stable across platforms/runs. */
function hashSeed(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickVariant<T>(pool: readonly T[], seed: string): T {
  const index = hashSeed(seed) % pool.length;
  return pool[index];
}

// ── Word Gym rounds: free daily words + all non-Literary theme packs ───────
// (Mythology, Loan Words, Games, Law, Architecture, Eponyms, Music, Science,
// Geography all share this exact round structure and phrasing.)

const ETYMOLOGY_ROUND: readonly ((word: string) => string)[] = [
  (word) => `Where does ${word} come from? Match each root to its meaning.`,
  (word) => `Match ${word}'s roots to their meanings.`,
  (word) => `What are ${word}'s roots? Match them below.`,
  (word) => `Match each root in ${word} to what it means.`,
  (word) => `Find where ${word} comes from. Match the roots.`,
  (word) => `${word} breaks into a few roots. Match each to its meaning.`,
  (word) => `Match the roots that make up ${word}.`,
  (word) => `See what ${word} is built from. Match each root.`,
  (word) => `Match each part of ${word} to its original meaning.`,
  (word) => `${word} comes from older words. Match the roots.`,
  (word) => `Break ${word} down. Match each root to its meaning.`,
  (word) => `Match each root of ${word} to what it meant originally.`,
];

const DEFINITION_ROUND: readonly ((word: string) => string)[] = [
  (word) => `What does ${word} mean? Match each clue to the right answer.`,
  (word) => `Match each clue to what ${word} means.`,
  (word) => `Match ${word}'s meaning to the right clue.`,
  (word) => `Work out what ${word} means. Match each clue.`,
  (word) => `Match each definition clue for ${word}.`,
  (word) => `What does ${word} mean? Match the clues below.`,
  (word) => `Match each clue below to ${word}'s real meaning.`,
  (word) => `Figure out what ${word} means. Match the clues.`,
  (word) => `Match the clues to work out ${word}'s meaning.`,
  (word) => `What does ${word} actually mean? Match each clue.`,
  (word) => `Match each clue to its correct meaning of ${word}.`,
  (word) => `Test what you know about ${word}. Match each clue.`,
];

const USAGE_ROUND: readonly ((word: string) => string)[] = [
  (word) => `How is ${word} used? Match each fragment to its correct completion.`,
  (_word) => `Match each sentence fragment to how it finishes.`,
  (word) => `See ${word} in a sentence. Match the fragments.`,
  (_word) => `Match each half of the sentence to its ending.`,
  (word) => `How does ${word} get used? Match the fragments below.`,
  (_word) => `Complete each sentence. Match the fragments.`,
  (word) => `Match each sentence about ${word} to its ending.`,
  (word) => `See how ${word} is used. Match the fragments.`,
  (_word) => `Match the start of each sentence to its ending.`,
  (word) => `How does ${word} show up in a sentence? Match the fragments.`,
  (_word) => `Match each fragment to finish the sentence.`,
  (word) => `See ${word} used in real sentences. Match the fragments.`,
];

const ROUND_POOLS: Record<string, readonly ((word: string) => string)[]> = {
  etymology: ETYMOLOGY_ROUND,
  definition: DEFINITION_ROUND,
  usage: USAGE_ROUND,
};

/**
 * Builds the instruction line for a Word Gym round (free words + every
 * non-Literary pack). `roundType` is matched case-insensitively against the
 * data's `round.type`/`gymRoundType` ("Etymology", "Definition", "Usage").
 * Falls back to the round's own stored `context` for any type this doesn't
 * recognise, so nothing goes blank if the data ever adds a new round type.
 */
export function buildRoundInstruction(
  roundType: string,
  word: string,
  wordId: string,
  fallback: string,
): string {
  const pool = ROUND_POOLS[roundType.toLowerCase()];
  if (!pool) return fallback;
  const variant = pickVariant(pool, `${wordId}:${roundType.toLowerCase()}`);
  return variant(word);
}

// ── Literary pack: Quote Completion / Contextual Definition rounds ─────────
// (The Etymology round type also exists in the Literary pack's data, but
// isn't currently surfaced anywhere in the app -- see GymScreen's Literary
// round, which only builds MCQ questions from these two round types.)

const QUOTE_COMPLETION_ROUND: readonly ((author: string, work: string) => string)[] = [
  (author, work) => `Complete ${author}'s line from ${work}.`,
  (author, work) => `Finish the line from ${author}'s ${work}.`,
  (_author, work) => `Complete this line from ${work}.`,
  (author, work) => `Fill in the missing words from ${author}'s ${work}.`,
  (author, work) => `Finish ${author}'s line, from ${work}.`,
  (author, work) => `Complete the quote from ${author}'s ${work}.`,
  (_author, work) => `What's missing from this line in ${work}?`,
  (author, work) => `Finish the sentence from ${author}'s ${work}.`,
  (_author, work) => `Complete the passage from ${work}.`,
  (_author, work) => `Fill in the gap in this line from ${work}.`,
  (author, work) => `Finish ${author}'s words, from ${work}.`,
  (_author, work) => `Complete the line, straight from ${work}.`,
];

const CONTEXTUAL_DEFINITION_ROUND: readonly ((word: string, author: string, work: string) => string)[] = [
  (word, author, _work) => `Read ${author}'s passage. What does ${word} mean here?`,
  (word, author, _work) => `What does ${word} mean in this line from ${author}?`,
  (word) => `Read the passage. What does ${word} mean here?`,
  (word, author, _work) => `In this line from ${author}, what does ${word} mean?`,
  (word, author, work) => `What does ${word} mean in ${author}'s ${work}?`,
  (word, author, _work) => `Read ${author}'s words. What does ${word} mean?`,
  (word, author, _work) => `Work out what ${word} means here, from ${author}.`,
  (word, _author, work) => `What does ${word} mean in this passage from ${work}?`,
  (word, author, _work) => `Read the line from ${author}. What does ${word} mean?`,
  (word, author, _work) => `What is ${word} saying here, in ${author}'s words?`,
  (word, _author, work) => `Read this passage from ${work}. What does ${word} mean?`,
  (word, author, work) => `What does ${word} mean in context, here in ${author}'s ${work}?`,
];

/** Builds the instruction line for a Literary pack Quote Completion round. */
export function buildQuoteCompletionInstruction(
  author: string,
  work: string,
  wordId: string,
): string {
  const variant = pickVariant(QUOTE_COMPLETION_ROUND, `${wordId}:quotecompletion`);
  return variant(author, work);
}

/** Builds the instruction line for a Literary pack Contextual Definition round. */
export function buildContextualDefinitionInstruction(
  word: string,
  author: string,
  work: string,
  wordId: string,
): string {
  const variant = pickVariant(CONTEXTUAL_DEFINITION_ROUND, `${wordId}:contextualdefinition`);
  return variant(word, author, work);
}

// ── Morning Task (the alarm-dismiss question) ───────────────────────────────

const MORNING_ROOT: readonly ((root: string) => string)[] = [
  (root) => `What does ${root} mean?`,
  (root) => `What is the meaning of ${root}?`,
  (root) => `${root} means what?`,
  (root) => `What does the root ${root} mean?`,
  (root) => `What's the meaning behind ${root}?`,
  (root) => `Which meaning fits ${root}?`,
  (root) => `${root}: what does it mean?`,
  (root) => `What does ${root} translate to?`,
  (root) => `Pick the meaning of ${root}.`,
  (root) => `What does ${root} actually mean?`,
  (root) => `Choose the correct meaning of ${root}.`,
  (root) => `What's ${root}'s meaning?`,
];

const MORNING_DEFINITION: readonly ((word: string) => string)[] = [
  (word) => `What does ${word} mean?`,
  (word) => `What is the meaning of ${word}?`,
  (word) => `Choose the correct meaning of ${word}.`,
  (word) => `Which definition fits ${word}?`,
  (word) => `What does ${word} actually mean?`,
  (word) => `Pick the right meaning of ${word}.`,
  (word) => `${word} means what?`,
  (word) => `What's the meaning of ${word}?`,
  (word) => `Which of these means ${word}?`,
  (word) => `Select the correct definition of ${word}.`,
  (word) => `What does ${word} translate to?`,
  (word) => `Choose what ${word} means.`,
];

const MORNING_ETYMOLOGY: readonly ((word: string) => string)[] = [
  (word) => `Which best describes where ${word} comes from?`,
  (word) => `Where does ${word} come from?`,
  (word) => `What's the origin of ${word}?`,
  (word) => `Which of these describes ${word}'s origin?`,
  (word) => `Where did ${word} originate?`,
  (word) => `Pick where ${word} comes from.`,
  (word) => `Which explains ${word}'s roots?`,
  (word) => `What's the history behind ${word}?`,
  (word) => `Choose where ${word} comes from.`,
  (word) => `Which of these is ${word}'s origin?`,
  (word) => `Where does ${word} trace back to?`,
  (word) => `Select ${word}'s true origin.`,
];

const MORNING_POOLS = {
  root: MORNING_ROOT,
  definition: MORNING_DEFINITION,
  etymology: MORNING_ETYMOLOGY,
} as const;

/** Builds the Morning Task's question line. `taskType` is 'root' | 'definition' | 'etymology'. */
export function buildMorningQuestion(
  taskType: keyof typeof MORNING_POOLS,
  word: string,
  sourceValue: string,
): string {
  const pool = MORNING_POOLS[taskType];
  const variant = pickVariant(pool, `${word.toLowerCase()}:${taskType}`);
  // The 'root' pool asks about the specific root text; the others ask about the word itself.
  return variant(taskType === 'root' ? sourceValue : word);
}

// ── Gym Modes: Roots Drill / Usage Lab (practice on already-learned words) ─

const ROOTS_DRILL: readonly ((word: string, root: string) => string)[] = [
  (word, root) => `In ${word}, what does "${root}" mean?`,
  (word, root) => `What does "${root}" mean in ${word}?`,
  (word, root) => `In ${word}, "${root}" means what?`,
  (word, root) => `${word} uses "${root}". What does it mean?`,
  (word, root) => `Inside ${word}, what does "${root}" mean?`,
  (word, root) => `What's the meaning of "${root}" in ${word}?`,
  (word, root) => `"${root}" appears in ${word}. What does it mean?`,
  (word, root) => `In the word ${word}, what does "${root}" mean?`,
  (word, root) => `What does "${root}" mean, as used in ${word}?`,
  (word, root) => `${word} contains "${root}". What does it mean?`,
  (word, root) => `Break down ${word}: what does "${root}" mean?`,
  (word, root) => `What does "${root}" mean here, in ${word}?`,
];

const USAGE_LAB: readonly ((fragment: string) => string)[] = [
  (fragment) => `Complete the sentence: "${fragment}…"`,
  (fragment) => `Finish the sentence: "${fragment}…"`,
  (fragment) => `How does this sentence end? "${fragment}…"`,
  (fragment) => `Complete it: "${fragment}…"`,
  (fragment) => `Finish it off: "${fragment}…"`,
  (fragment) => `What comes next? "${fragment}…"`,
  (fragment) => `Complete this: "${fragment}…"`,
  (fragment) => `How would you finish this? "${fragment}…"`,
  (fragment) => `Finish the thought: "${fragment}…"`,
  (fragment) => `Complete the line: "${fragment}…"`,
  (fragment) => `What's the ending? "${fragment}…"`,
  (fragment) => `Finish this sentence: "${fragment}…"`,
];

/** Builds a Roots Drill MCQ question. Seeded by wordId so it's stable per word. */
export function buildRootsDrillQuestion(word: string, root: string, wordId: string): string {
  const variant = pickVariant(ROOTS_DRILL, `${wordId}:rootsdrill`);
  return variant(word, root);
}

/** Builds a Usage Lab MCQ question. Seeded by wordId so it's stable per word. */
export function buildUsageLabQuestion(fragment: string, wordId: string): string {
  const variant = pickVariant(USAGE_LAB, `${wordId}:usagelab`);
  return variant(fragment);
}
