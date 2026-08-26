import { getSupabase, type WordRound, type ZazuGymWord } from './supabase';

export type PackWord = ZazuGymWord & {
  packId: string;
  subpackId: string | null;
};

type PackWordRow = {
  id: string;
  word: string;
  pronunciation: string;
  pos: string;
  definition: string;
  origin: string;
  tier?: string;
  pack_id: string;
  subpack_id: string | null;
  gym_rounds: WordRound[] | null;
};

/** Above this, a hung RPC would otherwise block the pack-detail screen forever. */
const RPC_TIMEOUT_MS = 8000;

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

function mapRow(row: PackWordRow): PackWord {
  return {
    id: row.id,
    word: row.word,
    pronunciation: row.pronunciation,
    pos: row.pos,
    definition: row.definition,
    origin: row.origin,
    tier: row.tier,
    packId: row.pack_id,
    subpackId: row.subpack_id,
    gymRounds: row.gym_rounds ?? [],
    rounds: row.gym_rounds ?? [],
  };
}

export type PackWordsResult = {
  words: PackWord[];
  /** True only when the fetch itself failed -- lets the caller tell "empty pack" from "couldn't load". */
  failed: boolean;
};

/** RLS-gated the same as the main word bank -- every pack word is tier='premium', so this returns [] for free users, guests, or if Supabase isn't configured (not a failure in those cases). */
export async function fetchPackWords(packId: string): Promise<PackWordsResult> {
  const supabase = getSupabase();
  if (!supabase) return { words: [], failed: false };

  try {
    const { data, error } = await withTimeout(
      supabase.rpc('get_words_for_pack', { p_pack_id: packId }),
      RPC_TIMEOUT_MS,
      'get_words_for_pack',
    );

    if (error) {
      console.error('[Zazu] Pack word fetch failed:', error.message);
      return { words: [], failed: true };
    }

    return { words: (data ?? []).map((row: PackWordRow) => mapRow(row)), failed: false };
  } catch (error) {
    console.error('[Zazu] Pack word fetch failed:', error instanceof Error ? error.message : error);
    return { words: [], failed: true };
  }
}
