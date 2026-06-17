// @ts-nocheck — AsyncStorage resolved via mobile/node_modules at runtime
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserWordProgressLocal } from './morning-task';

export const PROGRESS_STORAGE_KEYS = {
  streak: 'zazu:streak',
  lastCompletedDate: 'zazu:lastCompletedDate',
  coins: 'zazu:coins',
  learnedWordIds: 'zazu:learnedWordIds',
  wordProgress: 'zazu:wordProgress',
} as const;

export const AUTH_STORAGE_KEYS = {
  hasOnboarded: 'zazu:hasOnboarded',
  isAnonymous: 'zazu:isAnonymous',
} as const;

export type ProgressState = {
  streak: number;
  lastCompletedDate: string | null;
  coins: number;
  learnedWordIds: string[];
  wordProgress: UserWordProgressLocal[];
};

export const EMPTY_PROGRESS: ProgressState = {
  streak: 0,
  lastCompletedDate: null,
  coins: 0,
  learnedWordIds: [],
  wordProgress: [],
};

function parseWordProgress(raw: string | null): UserWordProgressLocal[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is UserWordProgressLocal =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as UserWordProgressLocal).wordId === 'string',
    );
  } catch {
    return [];
  }
}

export async function readProgress(): Promise<ProgressState> {
  const [streakRaw, coinsRaw, lastCompletedDate, learnedRaw, wordProgressRaw] =
    await Promise.all([
      AsyncStorage.getItem(PROGRESS_STORAGE_KEYS.streak),
      AsyncStorage.getItem(PROGRESS_STORAGE_KEYS.coins),
      AsyncStorage.getItem(PROGRESS_STORAGE_KEYS.lastCompletedDate),
      AsyncStorage.getItem(PROGRESS_STORAGE_KEYS.learnedWordIds),
      AsyncStorage.getItem(PROGRESS_STORAGE_KEYS.wordProgress),
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

export async function writeProgress(state: ProgressState): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(PROGRESS_STORAGE_KEYS.streak, String(state.streak)),
    AsyncStorage.setItem(PROGRESS_STORAGE_KEYS.coins, String(state.coins)),
    AsyncStorage.setItem(
      PROGRESS_STORAGE_KEYS.lastCompletedDate,
      state.lastCompletedDate ?? '',
    ),
    AsyncStorage.setItem(
      PROGRESS_STORAGE_KEYS.learnedWordIds,
      JSON.stringify(state.learnedWordIds),
    ),
    AsyncStorage.setItem(
      PROGRESS_STORAGE_KEYS.wordProgress,
      JSON.stringify(state.wordProgress),
    ),
  ]);
}

export async function clearLocalProgress(): Promise<void> {
  await Promise.all(
    Object.values(PROGRESS_STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key)),
  );
}

export async function readOnboardingFlags(): Promise<{
  hasOnboarded: boolean;
  isAnonymous: boolean;
}> {
  const [hasOnboardedRaw, isAnonymousRaw] = await Promise.all([
    AsyncStorage.getItem(AUTH_STORAGE_KEYS.hasOnboarded),
    AsyncStorage.getItem(AUTH_STORAGE_KEYS.isAnonymous),
  ]);
  return {
    hasOnboarded: hasOnboardedRaw === 'true',
    isAnonymous: isAnonymousRaw === 'true',
  };
}

export async function setOnboardingFlags(flags: {
  hasOnboarded?: boolean;
  isAnonymous?: boolean;
}): Promise<void> {
  const tasks: Promise<void>[] = [];
  if (flags.hasOnboarded !== undefined) {
    tasks.push(
      AsyncStorage.setItem(AUTH_STORAGE_KEYS.hasOnboarded, String(flags.hasOnboarded)),
    );
  }
  if (flags.isAnonymous !== undefined) {
    tasks.push(
      AsyncStorage.setItem(AUTH_STORAGE_KEYS.isAnonymous, String(flags.isAnonymous)),
    );
  }
  await Promise.all(tasks);
}
