import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type {
  IntroEtymology,
  MorningTask,
  MorningTaskDistractor,
  ZazuAlarmWord,
} from './morning-task';

export type { IntroEtymology, MorningTask, MorningTaskDistractor, ZazuAlarmWord };

export type WordPair = { a: string; b: string; pairRole?: string };

export type WordRound = {
  type: string;
  gymRoundType?: string;
  label: string;
  context: string;
  pairs: WordPair[];
};

export type ZazuGymWord = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  tier?: string;
  gymRounds: WordRound[];
  /** Legacy alias used by older puzzle code paths. */
  rounds?: WordRound[];
};

/** @deprecated Use ZazuGymWord. Kept for gradual migration. */
export type ZazuWord = ZazuGymWord & {
  rounds: WordRound[];
};

type AlarmRow = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  intro_etymology: IntroEtymology | null;
  tier?: string;
  morning_task: MorningTask;
};

type GymRow = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  tier?: string;
  gym_rounds: WordRound[] | null;
};

function readEnv(name: string): string | undefined {
  const env =
    typeof process !== 'undefined' && process.env ? process.env : undefined;
  if (!env) return undefined;
  return env[name];
}

function getSupabaseConfig() {
  const url =
    readEnv('VITE_SUPABASE_URL') ??
    readEnv('EXPO_PUBLIC_SUPABASE_URL') ??
    readEnv('SUPABASE_URL');
  const anonKey =
    readEnv('VITE_SUPABASE_ANON_KEY') ??
    readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') ??
    readEnv('SUPABASE_ANON_KEY');

  return { url, anonKey };
}

let client: SupabaseClient | null = null;

type AuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

/** Initialise Supabase with persistent auth (call once from AuthProvider). */
export function initSupabaseAuth(storage: AuthStorage): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || url.includes('YOUR_PROJECT')) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || url.includes('YOUR_PROJECT')) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

function mapAlarmRow(row: AlarmRow): ZazuAlarmWord {
  return {
    id: row.id,
    word: row.word,
    pronunciation: row.pronunciation,
    pos: row.pos,
    definition: row.definition,
    origin: row.origin,
    introEtymology: row.intro_etymology,
    tier: row.tier,
    morningTask: row.morning_task,
  };
}

function mapGymRounds(rounds: WordRound[] | null | undefined): WordRound[] {
  return (rounds ?? []).map((round) => ({
    type: round.type,
    gymRoundType: round.gymRoundType,
    label: round.label,
    context: round.context,
    pairs: (round.pairs ?? []).map((pair) => ({
      a: pair.a,
      b: pair.b,
      pairRole: pair.pairRole,
    })),
  }));
}

function mapGymRow(row: GymRow): ZazuGymWord {
  const gymRounds = mapGymRounds(row.gym_rounds);
  return {
    id: row.id,
    word: row.word,
    pronunciation: row.pronunciation,
    pos: row.pos,
    definition: row.definition,
    origin: row.origin,
    tier: row.tier,
    gymRounds,
    rounds: gymRounds,
  };
}

type DistractorRow = {
  id: string;
  task_type: MorningTaskDistractor['taskType'];
  answer_text: string;
  weight: number;
};

export function gymWordToLegacy(word: ZazuGymWord): ZazuWord {
  return {
    ...word,
    rounds: word.gymRounds,
  };
}

/** Same index for everyone each calendar day (UTC). */
export function pickWordOfDay<T>(words: T[]): T | null {
  if (!words.length) return null;
  const dayIndex = Math.floor(Date.now() / 86400000);
  return words[dayIndex % words.length];
}

/** Skip alarm-completed words until the library is exhausted, then cycle again. */
export function pickNextAlarmWord(
  words: ZazuAlarmWord[],
  learnedIds: string[],
): ZazuAlarmWord | null {
  if (!words.length) return null;
  const unlearned = words.filter((w) => !learnedIds.includes(w.id));
  const pool = unlearned.length > 0 ? unlearned : words;
  return pickWordOfDay(pool);
}

/** @deprecated Use pickNextAlarmWord. */
export function pickNextWord(words: ZazuGymWord[], learnedIds: string[]): ZazuGymWord | null {
  if (!words.length) return null;
  const unlearned = words.filter((w) => !learnedIds.includes(w.id));
  const pool = unlearned.length > 0 ? unlearned : words;
  return pickWordOfDay(pool);
}

export async function fetchAlarmWords(): Promise<ZazuAlarmWord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('get_words_for_alarm');

  if (error) {
    console.error('[Zazu] Alarm word fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: AlarmRow) => mapAlarmRow(row));
}

export async function fetchGymWords(): Promise<ZazuGymWord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('get_words_for_gym');

  if (error) {
    console.error('[Zazu] Gym word fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: GymRow) => mapGymRow(row));
}

export async function fetchMorningTaskDistractors(): Promise<MorningTaskDistractor[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('get_morning_task_distractors');

  if (error) {
    console.error('[Zazu] Distractor fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: DistractorRow) => ({
    id: row.id,
    taskType: row.task_type,
    answerText: row.answer_text,
    weight: row.weight,
  }));
}

/** @deprecated Use fetchGymWords for puzzle rounds or fetchAlarmWords for the alarm path. */
export async function fetchWords(): Promise<ZazuGymWord[]> {
  return fetchGymWords();
}
