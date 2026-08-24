import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { dateKeyToDayIndex, toLocalDateKey } from './date-utils';
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

function getSupabaseConfig() {
  // Deliberately static `process.env.X` member expressions, not a dynamic
  // lookup keyed by a runtime string -- Expo/Metro's env-var inlining (and
  // Vite's for web) only replaces literal expressions it can find via static
  // analysis of the source. A dynamic `env[name]` helper is invisible to that
  // pass, so on native (no real runtime process.env) every lookup silently
  // resolved to undefined and the app permanently fell back to demo data.
  const url =
    process.env.VITE_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;
  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

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

/**
 * Same word for every user on the same local calendar day - global and
 * date-keyed, not personalized by learned status (previously filtered by
 * `learnedIds`, which meant the alarm screen, home screen, and Gym tab could
 * each resolve a different word depending on which caller passed real
 * learned IDs vs. an empty array - see POST_APP_TEST_ROADMAP.md #3).
 */
export function pickWordOfDay<T>(words: T[], dateKey: string = toLocalDateKey()): T | null {
  if (!words.length) return null;
  const dayIndex = dateKeyToDayIndex(dateKey);
  return words[((dayIndex % words.length) + words.length) % words.length];
}

export function pickNextAlarmWord(words: ZazuAlarmWord[]): ZazuAlarmWord | null {
  return pickWordOfDay(words);
}

/** @deprecated Use pickNextAlarmWord. */
export function pickNextWord(words: ZazuGymWord[]): ZazuGymWord | null {
  return pickWordOfDay(words);
}

/** Above this, a hung RPC would otherwise block the alarm/puzzle screen forever. */
const RPC_TIMEOUT_MS = 8000;

/** Races a Supabase call against a timeout so a stalled network request can't hang the caller indefinitely. */
function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function fetchAlarmWords(): Promise<ZazuAlarmWord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  console.time('[Zazu] rpc:get_words_for_alarm');
  try {
    const { data, error } = await withTimeout(
      supabase.rpc('get_words_for_alarm'),
      RPC_TIMEOUT_MS,
      'get_words_for_alarm',
    );

    if (error) {
      console.error('[Zazu] Alarm word fetch failed:', error.message);
      return [];
    }

    return (data ?? []).map((row: AlarmRow) => mapAlarmRow(row));
  } catch (error) {
    console.error('[Zazu] Alarm word fetch failed:', error instanceof Error ? error.message : error);
    return [];
  } finally {
    console.timeEnd('[Zazu] rpc:get_words_for_alarm');
  }
}

export async function fetchGymWords(): Promise<ZazuGymWord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  console.time('[Zazu] rpc:get_words_for_gym');
  try {
    const { data, error } = await withTimeout(
      supabase.rpc('get_words_for_gym'),
      RPC_TIMEOUT_MS,
      'get_words_for_gym',
    );

    if (error) {
      console.error('[Zazu] Gym word fetch failed:', error.message);
      return [];
    }

    return (data ?? []).map((row: GymRow) => mapGymRow(row));
  } catch (error) {
    console.error('[Zazu] Gym word fetch failed:', error instanceof Error ? error.message : error);
    return [];
  } finally {
    console.timeEnd('[Zazu] rpc:get_words_for_gym');
  }
}

export async function fetchMorningTaskDistractors(): Promise<MorningTaskDistractor[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  console.time('[Zazu] rpc:get_morning_task_distractors');
  try {
    const { data, error } = await withTimeout(
      supabase.rpc('get_morning_task_distractors'),
      RPC_TIMEOUT_MS,
      'get_morning_task_distractors',
    );

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
  } catch (error) {
    console.error('[Zazu] Distractor fetch failed:', error instanceof Error ? error.message : error);
    return [];
  } finally {
    console.timeEnd('[Zazu] rpc:get_morning_task_distractors');
  }
}

/** @deprecated Use fetchGymWords for puzzle rounds or fetchAlarmWords for the alarm path. */
export async function fetchWords(): Promise<ZazuGymWord[]> {
  return fetchGymWords();
}
