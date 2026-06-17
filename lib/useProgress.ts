// @ts-nocheck — resolved via mobile/node_modules at runtime; re-exported through mobile/hooks/useProgress.ts
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserWordProgressLocal } from './morning-task';

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
      const noSnooze = options.noSnooze ?? true;
      const today = toIsoDate();
      const now = toIsoDateTime();

      const saved = await readProgress();
      const newStreak = nextStreak(saved.streak, saved.lastCompletedDate, today);
      const earned = coinsBreakdown(newStreak, noSnooze).total;
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
        breakdown: coinsBreakdown(newStreak, noSnooze),
      };
    },
    [applyProgress],
  );

  /** Word Gym completion. Updates gym mastery only, not learnedWordIds. */
  const completeGym = useCallback(
    async (wordId: string, options: CompleteGymOptions = {}) => {
      const now = toIsoDateTime();
      const saved = await readProgress();
      const existing = getWordProgress(saved, wordId);
      const wrongCount = (existing.gymWrongCount ?? 0) + (options.wrongCount ?? 0);
      const gymMastery = Math.min(100, options.mastery ?? 100);
      const gymCoins = 20;

      const nextWordProgress = upsertWordProgress(saved.wordProgress, {
        ...existing,
        wordId,
        gymCompletedAt: now,
        gymMastery,
        gymWrongCount: wrongCount,
        nextReviewAt: null,
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
    getGymMastery,
    setLastCompletedDateDebug,
  };
}
