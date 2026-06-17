import type { SupabaseClient, User } from '@supabase/supabase-js';

import { getSupabase } from './supabase';
import {
  clearLocalProgress,
  readProgress,
  writeProgress,
  type ProgressState,
} from './progress-storage';
import type { UserWordProgressLocal } from './morning-task';

type UserMetadata = {
  first_name?: string;
  streak?: number;
  coins?: number;
  last_completed_date?: string | null;
};

function getWordEntry(
  state: ProgressState,
  wordId: string,
): UserWordProgressLocal {
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

function collectWordIds(state: ProgressState): string[] {
  const ids = new Set(state.learnedWordIds);
  for (const entry of state.wordProgress) {
    ids.add(entry.wordId);
  }
  return [...ids];
}

export function getDisplayName(user: User | null): string | null {
  const meta = user?.user_metadata as UserMetadata | undefined;
  const name = meta?.first_name?.trim();
  return name || null;
}

export function userNeedsName(user: User | null): boolean {
  if (!user) return false;
  return !getDisplayName(user);
}

export async function migrateLocalProgressToSupabase(
  userId: string,
  local: ProgressState,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const wordIds = collectWordIds(local);
  const rows = wordIds.map((wordId) => {
    const entry = getWordEntry(local, wordId);
    return {
      user_id: userId,
      word_id: wordId,
      alarm_completed_at: entry.alarmCompletedAt,
      gym_completed_at: entry.gymCompletedAt,
      gym_mastery: entry.gymMastery ?? 0,
      gym_wrong_count: entry.gymWrongCount ?? 0,
      next_review_at: entry.nextReviewAt,
    };
  });

  if (rows.length > 0) {
    const { error } = await supabase.from('user_word_progress').upsert(rows, {
      onConflict: 'user_id,word_id',
    });
    if (error) throw error;
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      streak: local.streak,
      coins: local.coins,
      last_completed_date: local.lastCompletedDate,
    },
  });
  if (metaError) throw metaError;
}

export async function fetchRemoteProgress(user: User): Promise<ProgressState> {
  const supabase = getSupabase();
  if (!supabase) return { streak: 0, lastCompletedDate: null, coins: 0, learnedWordIds: [], wordProgress: [] };

  const meta = user.user_metadata as UserMetadata;
  const { data, error } = await supabase
    .from('user_word_progress')
    .select(
      'word_id, alarm_completed_at, gym_completed_at, gym_mastery, gym_wrong_count, next_review_at',
    )
    .eq('user_id', user.id);

  if (error) throw error;

  const wordProgress: UserWordProgressLocal[] = (data ?? []).map((row) => ({
    wordId: row.word_id,
    alarmCompletedAt: row.alarm_completed_at,
    gymCompletedAt: row.gym_completed_at,
    gymMastery: row.gym_mastery ?? 0,
    gymWrongCount: row.gym_wrong_count ?? 0,
    nextReviewAt: row.next_review_at,
  }));

  const learnedWordIds = wordProgress
    .filter((entry) => entry.alarmCompletedAt)
    .map((entry) => entry.wordId);

  return {
    streak: typeof meta.streak === 'number' ? meta.streak : 0,
    coins: typeof meta.coins === 'number' ? meta.coins : 0,
    lastCompletedDate: meta.last_completed_date ?? null,
    learnedWordIds,
    wordProgress,
  };
}

export async function hydrateLocalProgressFromUser(user: User): Promise<void> {
  const remote = await fetchRemoteProgress(user);
  await writeProgress(remote);
}

export async function migrateAnonymousProgressToAccount(user: User): Promise<void> {
  const local = await readProgress();
  const hasLocalData =
    local.streak > 0 ||
    local.coins > 0 ||
    local.learnedWordIds.length > 0 ||
    local.wordProgress.length > 0;

  if (hasLocalData) {
    await migrateLocalProgressToSupabase(user.id, local);
    await clearLocalProgress();
  }

  await hydrateLocalProgressFromUser(user);
}

export async function saveUserFirstName(
  supabase: SupabaseClient,
  firstName: string,
): Promise<void> {
  const trimmed = firstName.trim();
  if (!trimmed) throw new Error('Name is required');

  const { error } = await supabase.auth.updateUser({
    data: { first_name: trimmed },
  });
  if (error) throw error;
}
