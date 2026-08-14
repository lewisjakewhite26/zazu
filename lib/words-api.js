/**
 * Browser word loader for zazu.html (uses public/config.js + Supabase CDN).
 * Logic mirrors lib/supabase.ts.
 */

(function () {
  const DEFAULT_GYM_WORDS = typeof WORDS !== 'undefined' ? WORDS : [];

  /** Local (device) calendar date as YYYY-MM-DD - see lib/date-utils.ts for why not toISOString(). */
  function toLocalDateKey(date) {
    date = date || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function dateKeyToDayIndex(dateKey) {
    const parts = dateKey.split('-').map(Number);
    return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
  }

  /** Same word for every user on the same local calendar day - not personalized by learned status. */
  function pickWordOfDay(words) {
    if (!words?.length) return null;
    const dayIndex = dateKeyToDayIndex(toLocalDateKey());
    return words[((dayIndex % words.length) + words.length) % words.length];
  }

  function pickNextAlarmWord(words) {
    return pickWordOfDay(words);
  }

  /** @deprecated Use pickNextAlarmWord. */
  function pickNextWord(words) {
    return pickNextAlarmWord(words);
  }

  function getClient() {
    const cfg = window.ZAZU_CONFIG;
    if (!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) return null;
    if (typeof supabase === 'undefined' || !supabase.createClient) return null;
    return supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }

  function mapAlarmRow(row) {
    return {
      id: row.id,
      word: row.word,
      pronunciation: row.pronunciation,
      pos: row.pos,
      definition: row.definition,
      origin: row.origin,
      introEtymology: row.intro_etymology ?? null,
      tier: row.tier,
      morningTask: row.morning_task,
    };
  }

  function mapGymRow(row) {
    const gymRounds = (row.gym_rounds ?? []).map((round) => ({
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

  async function fetchAlarmWordsWithStatus() {
    const client = getClient();
    if (!client) {
      console.warn('[Zazu] No Supabase config — alarm words unavailable offline');
      return {
        words: [],
        error: null,
        usedFallback: false,
        source: 'inline',
      };
    }

    try {
      const { data, error } = await client.rpc('get_words_for_alarm');
      if (error) {
        console.error('[Zazu] Alarm word fetch failed:', error.message);
        return {
          words: [],
          error: error.message,
          usedFallback: true,
          source: 'fallback',
        };
      }
      if (!data?.length) {
        return {
          words: [],
          error: 'No alarm words returned from Supabase.',
          usedFallback: true,
          source: 'fallback',
        };
      }
      return {
        words: data.map(mapAlarmRow),
        error: null,
        usedFallback: false,
        source: 'supabase',
      };
    } catch (err) {
      const message = err?.message || 'Network error while loading alarm words.';
      console.error('[Zazu] Alarm word fetch failed:', message);
      return {
        words: [],
        error: message,
        usedFallback: true,
        source: 'fallback',
      };
    }
  }

  async function fetchGymWordsWithStatus() {
    const client = getClient();
    if (!client) {
      console.warn('[Zazu] No Supabase config — using inline WORDS fallback');
      return {
        words: DEFAULT_GYM_WORDS,
        error: null,
        usedFallback: false,
        source: 'inline',
      };
    }

    try {
      const { data, error } = await client.rpc('get_words_for_gym');
      if (error) {
        console.error('[Zazu] Gym word fetch failed:', error.message);
        return {
          words: DEFAULT_GYM_WORDS,
          error: error.message,
          usedFallback: true,
          source: 'fallback',
        };
      }
      if (!data?.length) {
        return {
          words: DEFAULT_GYM_WORDS,
          error: 'No gym words returned from Supabase.',
          usedFallback: true,
          source: 'fallback',
        };
      }
      return {
        words: data.map(mapGymRow),
        error: null,
        usedFallback: false,
        source: 'supabase',
      };
    } catch (err) {
      const message = err?.message || 'Network error while loading gym words.';
      console.error('[Zazu] Gym word fetch failed:', message);
      return {
        words: DEFAULT_GYM_WORDS,
        error: message,
        usedFallback: true,
        source: 'fallback',
      };
    }
  }

  async function fetchMorningTaskDistractors() {
    const client = getClient();
    if (!client) return [];
    const { data, error } = await client.rpc('get_morning_task_distractors');
    if (error) {
      console.error('[Zazu] Distractor fetch failed:', error.message);
      return [];
    }
    return (data ?? []).map((row) => ({
      id: row.id,
      taskType: row.task_type,
      answerText: row.answer_text,
      weight: row.weight,
    }));
  }

  /** @deprecated Use fetchGymWordsWithStatus or fetchAlarmWordsWithStatus. */
  async function fetchWordsWithStatus() {
    return fetchGymWordsWithStatus();
  }

  async function fetchAlarmWords() {
    const result = await fetchAlarmWordsWithStatus();
    return result.words;
  }

  async function fetchGymWords() {
    const result = await fetchGymWordsWithStatus();
    return result.words;
  }

  async function fetchWords() {
    return fetchGymWords();
  }

  window.ZazuWords = {
    fetch: fetchWords,
    fetchGymWords,
    fetchAlarmWords,
    fetchGymWordsWithStatus,
    fetchAlarmWordsWithStatus,
    fetchMorningTaskDistractors,
    fetchWithStatus: fetchWordsWithStatus,
    pickWordOfDay,
    pickNextWord,
    pickNextAlarmWord,
    getClient,
  };
})();
