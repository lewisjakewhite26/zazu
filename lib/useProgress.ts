import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserWordProgressLocal } from './morning-task';
import { computeNextReview } from './gym-modes';

const STORAGE_KEYS = {
  streak: 'zazu:streak',
  lastCompletedDate: 'zazu:lastCompletedDate',
  coins: 'zazu:coins',
  learnedWordIds: 'zazu:learnedWordIds',
  wordProgress: 'zazu:wordProgress',
} as const;

export type CompleteWordOptions = {
  /** Awards +10 coins when true. Defaults to true. */
  noSnooze?: boolean;
  /** Seconds from alarm open to dismiss, for calendar history. */
  dismissSeconds?: number;
  /** True when the MCQ was answered correctly with no wrong attempts. Defaults to true. */
  firstTry?: boolean;
};

export type CompleteGymOptions = {
  wrongCount?: number;
  mastery?: number;
};

export type CompletionResult = {
  streak: number;
  coinsEarned: number;
  totalCoins: number;
  breakdown: {
    puzzle: number;
    noSnooze: number;
    streakBonus: number;
  };
};

export type GymCompletionResult = {
  coinsEarned: number;
  totalCoins: number;
  gymMastery: number;
};

/** Coins to spend unlocking a missed day's word (Vocabulary, free-tier catch-up). */
export const MISSED_WORD_UNLOCK_COST = 25;

export type UnlockMissedWordResult =
  | { ok: true; totalCoins: number }
  | { ok: false; reason: 'insufficient_coins' | 'already_completed' };

type ProgressState = {
  streak: number;
  lastCompletedDate: string | null;
  coins: number;
  learnedWordIds: string[];
  wordProgress: UserWordProgressLocal[];
};

const EMPTY_PROGRESS: ProgressState = {
  streak: 0,
  lastCompletedDate: null,
  coins: 0,
  learnedWordIds: [],
  wordProgress: [],
};

function toIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoDateTime(date: Date = new Date()): string {
  return date.toISOString();
}

function daysBetween(earlier: string, later: string): number {
  const start = new Date(`${earlier}T12:00:00`);
  const end = new Date(`${later}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function nextStreak(current: number, lastCompleted: string | null, today: string): number {
  if (!lastCompleted) return 1;
  if (lastCompleted === today) return current;

  const gap = daysBetween(lastCompleted, today);
  if (gap === 1) return current + 1;
  if (gap > 1) return 1;

  return current;
}

function coinsBreakdown(streak: number, noSnooze: boolean) {
  const puzzle = 15;
  const noSnoozeCoins = noSnooze ? 10 : 0;
  const streakBonus = streak >= 7 ? 25 : 0;
  return {
    puzzle,
    noSnooze: noSnoozeCoins,
    streakBonus,
    total: puzzle + noSnoozeCoins + streakBonus,
  };
}

function parseWordProgress(raw: string | null): UserWordProgressLocal[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is UserWordProgressLocal =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof entry.wordId === 'string',
    );
  } catch {
    return [];
  }
}

function getWordProgress(state: ProgressState, wordId: string): UserWordProgressLocal {
  return (
    state.wordProgress.find((entry) => entry.wordId === wordId) ?? {
      wordId,
      alarmCompletedAt: null,
      gymCompletedAt: null,
      gymMastery: 0,
      gymWrongCount: 0,
      nextReviewAt: null,
    }
  );
}

async function readProgress(): Promise<ProgressState> {
  const [streakRaw, coinsRaw, lastCompletedDate, learnedRaw, wordProgressRaw] =
    await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.streak),
      AsyncStorage.getItem(STORAGE_KEYS.coins),
      AsyncStorage.getItem(STORAGE_KEYS.lastCompletedDate),
      AsyncStorage.getItem(STORAGE_KEYS.learnedWordIds),
      AsyncStorage.getItem(STORAGE_KEYS.wordProgress),
    ]);

  const streak = Number.parseInt(streakRaw ?? '0', 10);
  const coins = Number.parseInt(coinsRaw ?? '0', 10);

  let learnedWordIds: string[] = [];
  if (learnedRaw) {
    try {
      const parsed = JSON.parse(learnedRaw) as unknown;
      learnedWordIds = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : [];
    } catch {
      learnedWordIds = [];
    }
  }

  return {
    streak: Number.isFinite(streak) ? streak : 0,
    coins: Number.isFinite(coins) ? coins : 0,
    lastCompletedDate: lastCompletedDate || null,
    learnedWordIds,
    wordProgress: parseWordProgress(wordProgressRaw),
  };
}

async function writeProgress(state: ProgressState): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.streak, String(state.streak)),
    AsyncStorage.setItem(STORAGE_KEYS.coins, String(state.coins)),
    AsyncStorage.setItem(STORAGE_KEYS.lastCompletedDate, state.lastCompletedDate ?? ''),
    AsyncStorage.setItem(STORAGE_KEYS.learnedWordIds, JSON.stringify(state.learnedWordIds)),
    AsyncStorage.setItem(STORAGE_KEYS.wordProgress, JSON.stringify(state.wordProgress)),
  ]);
}

function upsertWordProgress(
  entries: UserWordProgressLocal[],
  next: UserWordProgressLocal,
): UserWordProgressLocal[] {
  const index = entries.findIndex((entry) => entry.wordId === next.wordId);
  if (index === -1) return [...entries, next];
  const copy = entries.slice();
  copy[index] = next;
  return copy;
}

export function useProgress() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>([]);
  const [wordProgress, setWordProgress] = useState<UserWordProgressLocal[]>([]);

  const applyProgress = useCallback((saved: ProgressState) => {
    setStreak(saved.streak);
    setCoins(saved.coins);
    setLearnedWordIds(saved.learnedWordIds);
    setWordProgress(saved.wordProgress);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await readProgress();
      if (cancelled) return;
      applyProgress(saved);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyProgress]);

  /** Morning alarm completion. Updates streak, coins, and learnedWordIds only. */
  const completeWord = useCallback(
    async (wordId: string, options: CompleteWordOptions = {}) => {
      console.time('[Zazu] completeWord');
      try {
        const noSnooze = options.noSnooze ?? true;
        const today = toIsoDate();
        const now = toIsoDateTime();

        const saved = await readProgress();
        const newStreak = nextStreak(saved.streak, saved.lastCompletedDate, today);
        // Multiple alarms can all fire the same global word-of-the-day on the
        // same date -- without this, completing each one separately would
        // farm the puzzle/no-snooze/streak coin rewards repeatedly.
        const alreadyCompletedToday = saved.lastCompletedDate === today;
        const breakdown = alreadyCompletedToday
          ? { puzzle: 0, noSnooze: 0, streakBonus: 0, total: 0 }
          : coinsBreakdown(newStreak, noSnooze);
        const earned = breakdown.total;
        const newLearned = saved.learnedWordIds.includes(wordId)
          ? saved.learnedWordIds
          : [...saved.learnedWordIds, wordId];

        const existing = getWordProgress(saved, wordId);
        const nextWordProgress = upsertWordProgress(saved.wordProgress, {
          ...existing,
          wordId,
          alarmCompletedAt: now,
          coinsEarned: earned,
          dismissSeconds: options.dismissSeconds ?? existing.dismissSeconds ?? null,
          firstTry: options.firstTry ?? true,
        });

        const next: ProgressState = {
          streak: newStreak,
          lastCompletedDate: today,
          coins: saved.coins + earned,
          learnedWordIds: newLearned,
          wordProgress: nextWordProgress,
        };

        await writeProgress(next);
        applyProgress(next);

        return {
          streak: next.streak,
          coinsEarned: earned,
          totalCoins: next.coins,
          breakdown,
        };
      } finally {
        console.timeEnd('[Zazu] completeWord');
      }
    },
    [applyProgress],
  );

  /** Word Gym completion. Updates gym mastery and schedules the next spaced-repetition review. */
  const completeGym = useCallback(
    async (wordId: string, options: CompleteGymOptions = {}) => {
      const now = toIsoDateTime();
      const saved = await readProgress();
      const existing = getWordProgress(saved, wordId);
      const roundWrongCount = options.wrongCount ?? 0;
      const wrongCount = (existing.gymWrongCount ?? 0) + roundWrongCount;
      const gymMastery = Math.min(100, options.mastery ?? 100);
      const gymCoins = 20;

      const { nextReviewAt, nextReviewIntervalDays } = computeNextReview(
        existing.nextReviewIntervalDays,
        roundWrongCount > 0,
      );

      const nextWordProgress = upsertWordProgress(saved.wordProgress, {
        ...existing,
        wordId,
        gymCompletedAt: now,
        gymMastery,
        gymWrongCount: wrongCount,
        nextReviewAt,
        nextReviewIntervalDays,
      });

      const next: ProgressState = {
        ...saved,
        coins: saved.coins + gymCoins,
        wordProgress: nextWordProgress,
      };

      await writeProgress(next);
      applyProgress(next);

      return {
        coinsEarned: gymCoins,
        totalCoins: next.coins,
        gymMastery,
      } satisfies GymCompletionResult;
    },
    [applyProgress],
  );

  const getGymMastery = useCallback(
    (wordId: string) => getWordProgress({ wordProgress } as ProgressState, wordId).gymMastery,
    [wordProgress],
  );

  /** Roots Drill / Usage Lab MCQ answer. Only wrong answers are persisted, feeding the same wrong-count signal completeGym uses. */
  const recordMcqAnswer = useCallback(async (wordId: string, correct: boolean) => {
    if (correct) return;
    const saved = await readProgress();
    const existing = getWordProgress(saved, wordId);
    const next: ProgressState = {
      ...saved,
      wordProgress: upsertWordProgress(saved.wordProgress, {
        ...existing,
        wordId,
        gymWrongCount: (existing.gymWrongCount ?? 0) + 1,
      }),
    };
    await writeProgress(next);
    applyProgress(next);
  }, [applyProgress]);

  /**
   * Finishes the free Daily Ritual (today's word only, offered after the
   * alarm). Flat, modest reward -- smaller than a paid Gym completion, and
   * only paid out once per word per day so reopening the ritual to replay
   * for practice doesn't farm coins. No effect on gym mastery or review
   * scheduling, matching completeGymModeSession's scope.
   */
  const completeDailyRitual = useCallback(
    async (wordId: string) => {
      const DAILY_RITUAL_COINS = 10;
      const today = toIsoDate();
      const saved = await readProgress();
      const existing = getWordProgress(saved, wordId);
      const alreadyCompletedToday = existing.dailyRitualCompletedDate === today;
      const earned = alreadyCompletedToday ? 0 : DAILY_RITUAL_COINS;

      const next: ProgressState = {
        ...saved,
        coins: saved.coins + earned,
        wordProgress: upsertWordProgress(saved.wordProgress, {
          ...existing,
          wordId,
          dailyRitualCompletedDate: today,
        }),
      };

      await writeProgress(next);
      applyProgress(next);

      return { coinsEarned: earned, totalCoins: next.coins, alreadyCompletedToday };
    },
    [applyProgress],
  );

  /** Finishes a Roots Drill / Usage Lab session: flat coins per word answered, no effect on gym mastery or review scheduling. */
  const completeGymModeSession = useCallback(
    async (wordIds: string[], options: { coinsPerWord?: number } = {}) => {
      const coinsPerWord = options.coinsPerWord ?? 15;
      const earned = coinsPerWord * wordIds.length;

      const saved = await readProgress();
      const next: ProgressState = { ...saved, coins: saved.coins + earned };
      await writeProgress(next);
      applyProgress(next);

      return { coinsEarned: earned, totalCoins: next.coins };
    },
    [applyProgress],
  );

  /**
   * Spends coins to mark a missed day's word done, for Vocabulary's free-tier
   * catch-up flow. Deliberately not a call to completeWord() -- that also
   * touches streak/lastCompletedDate, which this pragmatically skips (no
   * streak repair, identical to an organic completion only in that
   * learnedWordIds/alarmCompletedAt end up the same). Only writes the two
   * fields Vocabulary already reads as "done."
   */
  const unlockMissedWord = useCallback(
    async (wordId: string, cost: number): Promise<UnlockMissedWordResult> => {
      const saved = await readProgress();
      const existing = getWordProgress(saved, wordId);

      if (saved.learnedWordIds.includes(wordId) || existing.alarmCompletedAt) {
        return { ok: false, reason: 'already_completed' };
      }
      if (saved.coins < cost) {
        return { ok: false, reason: 'insufficient_coins' };
      }

      const next: ProgressState = {
        ...saved,
        coins: saved.coins - cost,
        learnedWordIds: [...saved.learnedWordIds, wordId],
        wordProgress: upsertWordProgress(saved.wordProgress, {
          ...existing,
          wordId,
          alarmCompletedAt: toIsoDateTime(),
        }),
      };

      await writeProgress(next);
      applyProgress(next);

      return { ok: true, totalCoins: next.coins };
    },
    [applyProgress],
  );

  /** Dev only. Sets last completed date without changing streak or coins. */
  const setLastCompletedDateDebug = useCallback(async (isoDate: string) => {
    const saved = await readProgress();
    await writeProgress({ ...saved, lastCompletedDate: isoDate });
  }, []);

  return {
    loading,
    streak,
    coins,
    learnedWordIds,
    wordProgress,
    completeWord,
    completeGym,
    completeDailyRitual,
    getGymMastery,
    recordMcqAnswer,
    completeGymModeSession,
    unlockMissedWord,
    setLastCompletedDateDebug,
  };
}
