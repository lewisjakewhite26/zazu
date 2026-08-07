import { describe, expect, it } from 'vitest';

import {
  buildReviewQueue,
  buildRootsDrillQuestions,
  buildUsageLabQuestions,
  computeNextReview,
  countReviewQueueDue,
  pickDrillWords,
  pickNextReviewWord,
} from '../lib/gym-modes';
import type { UserWordProgressLocal } from '../lib/morning-task';
import type { ZazuGymWord } from '../lib/supabase';

function makeWord(id: string, overrides: Partial<ZazuGymWord> = {}): ZazuGymWord {
  return {
    id,
    word: `Word${id}`,
    pronunciation: `pron-${id}`,
    pos: 'noun',
    definition: `Definition of word ${id}`,
    origin: `Origin of word ${id}`,
    gymRounds: [
      {
        type: 'Etymology',
        gymRoundType: 'etymology',
        label: 'Round 1',
        context: 'ctx',
        pairs: [{ a: `root-${id}`, b: `meaning-${id}` }],
      },
      {
        type: 'Usage',
        gymRoundType: 'usage',
        label: 'Round 3',
        context: 'ctx',
        pairs: [{ a: `fragment-${id}`, b: `completion-${id}` }],
      },
    ],
    ...overrides,
  };
}

function makeProgress(overrides: Partial<UserWordProgressLocal> & { wordId: string }): UserWordProgressLocal {
  return {
    alarmCompletedAt: null,
    gymCompletedAt: null,
    gymMastery: 0,
    gymWrongCount: 0,
    nextReviewAt: null,
    ...overrides,
  };
}

describe('computeNextReview', () => {
  it('schedules 1 day out on a word never reviewed before', () => {
    const now = Date.UTC(2026, 0, 1);
    const result = computeNextReview(undefined, false, now);

    expect(result.nextReviewIntervalDays).toBe(1);
    expect(result.nextReviewAt).toBe(new Date(now + 24 * 60 * 60 * 1000).toISOString());
  });

  it('doubles the interval on each clean pass', () => {
    const now = Date.UTC(2026, 0, 1);
    expect(computeNextReview(1, false, now).nextReviewIntervalDays).toBe(2);
    expect(computeNextReview(2, false, now).nextReviewIntervalDays).toBe(4);
    expect(computeNextReview(16, false, now).nextReviewIntervalDays).toBe(30); // capped
  });

  it('caps the interval at 30 days', () => {
    const now = Date.UTC(2026, 0, 1);
    expect(computeNextReview(30, false, now).nextReviewIntervalDays).toBe(30);
  });

  it('resets to 1 day on any wrong answer, regardless of previous interval', () => {
    const now = Date.UTC(2026, 0, 1);
    expect(computeNextReview(16, true, now).nextReviewIntervalDays).toBe(1);
  });
});

describe('review queue', () => {
  const now = Date.UTC(2026, 0, 10);
  const dayMs = 24 * 60 * 60 * 1000;

  const words = [makeWord('a'), makeWord('b'), makeWord('c'), makeWord('d')];

  it('excludes words never gym-completed, even if learned via the alarm', () => {
    const progress = [makeProgress({ wordId: 'a', gymCompletedAt: null })];
    const queue = buildReviewQueue(words, ['a'], progress, now);
    expect(queue).toHaveLength(0);
  });

  it('treats a completed word with no nextReviewAt as immediately due', () => {
    const progress = [makeProgress({ wordId: 'a', gymCompletedAt: '2026-01-01T00:00:00.000Z', nextReviewAt: null })];
    const queue = buildReviewQueue(words, ['a'], progress, now);
    expect(queue.map((w) => w.id)).toEqual(['a']);
  });

  it('excludes words whose review is scheduled in the future', () => {
    const progress = [
      makeProgress({
        wordId: 'a',
        gymCompletedAt: '2026-01-01T00:00:00.000Z',
        nextReviewAt: new Date(now + dayMs).toISOString(),
      }),
    ];
    expect(countReviewQueueDue(words, ['a'], progress, now)).toBe(0);
  });

  it('includes words whose review date has passed, sorted most-overdue first', () => {
    const progress = [
      makeProgress({
        wordId: 'a',
        gymCompletedAt: '2026-01-01T00:00:00.000Z',
        nextReviewAt: new Date(now - 1 * dayMs).toISOString(),
      }),
      makeProgress({
        wordId: 'b',
        gymCompletedAt: '2026-01-01T00:00:00.000Z',
        nextReviewAt: new Date(now - 5 * dayMs).toISOString(),
      }),
      makeProgress({
        wordId: 'c',
        gymCompletedAt: '2026-01-01T00:00:00.000Z',
        nextReviewAt: null, // never reviewed since completion - most overdue of all
      }),
    ];
    const queue = buildReviewQueue(words, ['a', 'b', 'c'], progress, now);
    expect(queue.map((w) => w.id)).toEqual(['c', 'b', 'a']);
  });

  it('only surfaces learned words even if others are also due', () => {
    const progress = [
      makeProgress({ wordId: 'a', gymCompletedAt: '2026-01-01T00:00:00.000Z', nextReviewAt: null }),
      makeProgress({ wordId: 'b', gymCompletedAt: '2026-01-01T00:00:00.000Z', nextReviewAt: null }),
    ];
    // 'b' is due but not in learnedWordIds, so it should be excluded.
    const queue = buildReviewQueue(words, ['a'], progress, now);
    expect(queue.map((w) => w.id)).toEqual(['a']);
  });

  it('pickNextReviewWord returns the most overdue word or null when nothing is due', () => {
    const progress = [makeProgress({ wordId: 'a', gymCompletedAt: '2026-01-01T00:00:00.000Z', nextReviewAt: null })];
    expect(pickNextReviewWord(words, ['a'], progress, now)?.id).toBe('a');
    expect(pickNextReviewWord(words, [], [], now)).toBeNull();
  });
});

describe('pickDrillWords', () => {
  const words = [makeWord('a'), makeWord('b'), makeWord('c')];

  it('only picks from learned words', () => {
    const picked = pickDrillWords(words, ['a', 'b'], undefined, 5);
    expect(picked.every((w) => ['a', 'b'].includes(w.id))).toBe(true);
    expect(picked).toHaveLength(2);
  });

  it('excludes the given word id (e.g. today\'s word) even if learned', () => {
    const picked = pickDrillWords(words, ['a', 'b', 'c'], 'b', 5);
    expect(picked.some((w) => w.id === 'b')).toBe(false);
    expect(picked).toHaveLength(2);
  });

  it('caps at the requested count', () => {
    const picked = pickDrillWords(words, ['a', 'b', 'c'], undefined, 2);
    expect(picked).toHaveLength(2);
  });

  it('returns an empty array when nothing is learned', () => {
    expect(pickDrillWords(words, [], undefined, 5)).toHaveLength(0);
  });
});

describe('MCQ question builders', () => {
  // A wider pool than the drill words so there's a real distractor pool to sample from.
  const allWords = Array.from({ length: 6 }, (_, i) => makeWord(String(i)));
  const drillWords = allWords.slice(0, 2);

  it('buildRootsDrillQuestions puts the correct meaning at correctIndex', () => {
    const questions = buildRootsDrillQuestions(drillWords, allWords);
    expect(questions).toHaveLength(drillWords.length);

    for (const q of questions) {
      expect(q.options[q.correctIndex]).toBe(`meaning-${q.wordId}`);
      // No duplicate options, and the correct answer only appears once.
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });

  it('buildUsageLabQuestions puts the correct completion at correctIndex', () => {
    const questions = buildUsageLabQuestions(drillWords, allWords);
    expect(questions).toHaveLength(drillWords.length);

    for (const q of questions) {
      expect(q.options[q.correctIndex]).toBe(`completion-${q.wordId}`);
    }
  });

  it('never includes another word\'s answer that happens to equal the correct one as a duplicate option', () => {
    // Two words sharing an identical meaning string - the builder must not
    // offer that string twice (once as "correct", once as a "distractor").
    const shared = [
      makeWord('x', {
        gymRounds: [
          {
            type: 'Etymology',
            gymRoundType: 'etymology',
            label: 'r',
            context: 'c',
            pairs: [{ a: 'root-x', b: 'shared meaning' }],
          },
        ],
      }),
      makeWord('y', {
        gymRounds: [
          {
            type: 'Etymology',
            gymRoundType: 'etymology',
            label: 'r',
            context: 'c',
            pairs: [{ a: 'root-y', b: 'shared meaning' }],
          },
        ],
      }),
    ];
    const questions = buildRootsDrillQuestions([shared[0]], shared);
    expect(questions).toHaveLength(1);
    expect(questions[0].options.filter((o) => o === 'shared meaning')).toHaveLength(1);
  });

  it('falls back to the display type label for demo/offline words that lack gymRoundType', () => {
    const demoWord = makeWord('demo', {
      gymRounds: [
        { type: 'Etymology', label: 'r', context: 'c', pairs: [{ a: 'root-demo', b: 'meaning-demo' }] },
      ],
    });
    const questions = buildRootsDrillQuestions([demoWord], [demoWord, ...allWords]);
    expect(questions).toHaveLength(1);
    expect(questions[0].options[questions[0].correctIndex]).toBe('meaning-demo');
  });

  it('skips a drill word cleanly if it has no round of the requested type', () => {
    const noEtymology = makeWord('bare', { gymRounds: [] });
    const questions = buildRootsDrillQuestions([noEtymology], allWords);
    expect(questions).toHaveLength(0);
  });
});
