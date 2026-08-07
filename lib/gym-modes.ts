/**
 * Word Gym practice modes beyond the daily 3-round puzzle: a spaced-repetition
 * review queue, and two MCQ drills (roots, usage) built from data every word
 * already has — the Etymology and Usage rounds used by the main puzzle.
 */
import type { WordRound, ZazuGymWord } from './supabase';
import type { UserWordProgressLocal } from './morning-task';

export type GymMcqQuestion = {
  wordId: string;
  word: string;
  question: string;
  options: string[];
  correctIndex: number;
};

const REVIEW_INITIAL_INTERVAL_DAYS = 1;
const REVIEW_MAX_INTERVAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const DRILL_QUESTION_COUNT = 5;
const DRILL_OPTION_COUNT = 3;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

/** Etymology rounds carry root->meaning pairs, Usage rounds carry fragment->completion pairs. */
function findRound(word: ZazuGymWord, roundType: 'etymology' | 'usage'): WordRound | null {
  const rounds = word.gymRounds ?? [];
  return (
    rounds.find((round) => round.gymRoundType === roundType) ??
    // Demo/offline fallback words only set the display `type` label, not `gymRoundType`.
    rounds.find((round) => round.type?.toLowerCase() === roundType) ??
    null
  );
}

/** Pick a handful of already-learned words to quiz on, excluding today's word so a drill doesn't just repeat it. */
export function pickDrillWords(
  gymWords: ZazuGymWord[],
  learnedWordIds: string[],
  excludeWordId?: string,
  count: number = DRILL_QUESTION_COUNT,
): ZazuGymWord[] {
  const learned = gymWords.filter((word) => learnedWordIds.includes(word.id) && word.id !== excludeWordId);
  return sample(learned, Math.min(count, learned.length));
}

function buildQuestionsForRoundType(
  drillWords: ZazuGymWord[],
  allGymWords: ZazuGymWord[],
  roundType: 'etymology' | 'usage',
  questionFor: (word: ZazuGymWord, promptSide: string) => string,
): GymMcqQuestion[] {
  // Pool every {a,b} pair of this round type across the whole library, so
  // wrong options read as plausible near-misses rather than random text.
  const allPairs: { wordId: string; b: string }[] = [];
  for (const word of allGymWords) {
    const round = findRound(word, roundType);
    if (!round) continue;
    for (const pair of round.pairs) {
      if (pair.a && pair.b) allPairs.push({ wordId: word.id, b: pair.b });
    }
  }

  const questions: GymMcqQuestion[] = [];

  for (const word of drillWords) {
    const round = findRound(word, roundType);
    const ownPairs = (round?.pairs ?? []).filter((pair) => pair.a && pair.b);
    if (!ownPairs.length) continue;

    const target = ownPairs[Math.floor(Math.random() * ownPairs.length)];
    const correctAnswer = target.b;

    const distractorPool = allPairs.filter(
      (pair) =>
        pair.wordId !== word.id && pair.b.trim().toLowerCase() !== correctAnswer.trim().toLowerCase(),
    );
    const distractors = Array.from(new Set(sample(distractorPool, DRILL_OPTION_COUNT - 1).map((p) => p.b)));

    const options = shuffle([correctAnswer, ...distractors]);
    const correctIndex = options.indexOf(correctAnswer);

    questions.push({
      wordId: word.id,
      word: word.word,
      question: questionFor(word, target.a),
      options,
      correctIndex,
    });
  }

  return questions;
}

/** MCQ: given a word's root, pick its meaning. Built from each word's own Etymology round. */
export function buildRootsDrillQuestions(
  drillWords: ZazuGymWord[],
  allGymWords: ZazuGymWord[],
): GymMcqQuestion[] {
  return buildQuestionsForRoundType(
    drillWords,
    allGymWords,
    'etymology',
    (word, root) => `In ${word.word}, what does "${root}" mean?`,
  );
}

/** MCQ: given a sentence fragment, pick how it's completed. Built from each word's own Usage round. */
export function buildUsageLabQuestions(
  drillWords: ZazuGymWord[],
  allGymWords: ZazuGymWord[],
): GymMcqQuestion[] {
  return buildQuestionsForRoundType(
    drillWords,
    allGymWords,
    'usage',
    (_word, fragment) => `Complete the sentence: "${fragment}…"`,
  );
}

// ── Spaced-repetition review queue ──────────────────────────────────────────

function isReviewDue(entry: UserWordProgressLocal | undefined, now: number): boolean {
  if (!entry?.gymCompletedAt) return false;
  if (!entry.nextReviewAt) return true;
  return new Date(entry.nextReviewAt).getTime() <= now;
}

/** Words already gym-practised at least once whose review interval has elapsed, most overdue first. */
export function buildReviewQueue(
  gymWords: ZazuGymWord[],
  learnedWordIds: string[],
  wordProgress: UserWordProgressLocal[],
  now: number = Date.now(),
): ZazuGymWord[] {
  const progressByWordId = new Map(wordProgress.map((entry) => [entry.wordId, entry]));

  return gymWords
    .filter((word) => learnedWordIds.includes(word.id))
    .filter((word) => isReviewDue(progressByWordId.get(word.id), now))
    .sort((a, b) => {
      const aAt = progressByWordId.get(a.id)?.nextReviewAt;
      const bAt = progressByWordId.get(b.id)?.nextReviewAt;
      // No nextReviewAt yet means never reviewed since first completion - most overdue.
      if (!aAt && !bAt) return 0;
      if (!aAt) return -1;
      if (!bAt) return 1;
      return new Date(aAt).getTime() - new Date(bAt).getTime();
    });
}

export function countReviewQueueDue(
  gymWords: ZazuGymWord[],
  learnedWordIds: string[],
  wordProgress: UserWordProgressLocal[],
  now: number = Date.now(),
): number {
  return buildReviewQueue(gymWords, learnedWordIds, wordProgress, now).length;
}

export function pickNextReviewWord(
  gymWords: ZazuGymWord[],
  learnedWordIds: string[],
  wordProgress: UserWordProgressLocal[],
  now: number = Date.now(),
): ZazuGymWord | null {
  return buildReviewQueue(gymWords, learnedWordIds, wordProgress, now)[0] ?? null;
}

/** Doubles the review interval on a clean pass, resets to 1 day on any wrong answer. Capped at 30 days. */
export function computeNextReview(
  previousIntervalDays: number | undefined,
  wasWrong: boolean,
  now: number = Date.now(),
): { nextReviewAt: string; nextReviewIntervalDays: number } {
  const nextIntervalDays = wasWrong
    ? REVIEW_INITIAL_INTERVAL_DAYS
    : previousIntervalDays === undefined
      ? REVIEW_INITIAL_INTERVAL_DAYS
      : Math.min(REVIEW_MAX_INTERVAL_DAYS, previousIntervalDays * 2);

  return {
    nextReviewAt: new Date(now + nextIntervalDays * DAY_MS).toISOString(),
    nextReviewIntervalDays: nextIntervalDays,
  };
}
