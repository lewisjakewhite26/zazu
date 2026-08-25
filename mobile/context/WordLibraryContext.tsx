import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEMO_ALARM_WORDS } from '../../lib/demo-alarm-words';
import { DEMO_GYM_WORDS } from '../../lib/demo-words';
import {
  fetchAlarmWords,
  fetchGymWords,
  getSupabase,
  pickNextAlarmWord,
  type ZazuAlarmWord,
  type ZazuGymWord,
} from '../../lib/supabase';

function useWordLibraryState() {
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [alarmWords, setAlarmWords] = useState<ZazuAlarmWord[]>(DEMO_ALARM_WORDS);
  const [gymWords, setGymWords] = useState<ZazuGymWord[]>(DEMO_GYM_WORDS);

  const loadWords = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetrying(true);
    } else {
      setLoading(true);
    }

    const supabase = getSupabase();
    if (!supabase) {
      setFetchFailed(true);
      setLoading(false);
      setRetrying(false);
      return;
    }

    const [alarm, gym] = await Promise.all([fetchAlarmWords(), fetchGymWords()]);

    if (alarm.length > 0) {
      setAlarmWords(alarm);
      setFetchFailed(false);
    } else {
      setFetchFailed(true);
    }

    if (gym.length > 0) {
      setGymWords(gym);
    }

    setLoading(false);
    setRetrying(false);
  }, []);

  useEffect(() => {
    void loadWords(false);
  }, [loadWords]);

  const retry = useCallback(() => {
    void loadWords(true);
  }, [loadWords]);

  const alarmWordOfDay = useMemo(
    () => pickNextAlarmWord(alarmWords) ?? alarmWords[0],
    [alarmWords],
  );

  const gymWordOfDay = useMemo(() => {
    if (!alarmWordOfDay) return gymWords[0];
    return (
      gymWords.find((word) => word.id === alarmWordOfDay.id) ??
      gymWords.find((word) => word.word === alarmWordOfDay.word) ??
      gymWords[0]
    );
  }, [alarmWordOfDay, gymWords]);

  return {
    loading,
    retrying,
    fetchFailed,
    retry,
    alarmWords,
    gymWords,
    alarmWordOfDay,
    gymWordOfDay,
    /** @deprecated Use alarmWordOfDay for display or gymWordOfDay for the Gym puzzle. */
    words: gymWords,
    wordOfDay: alarmWordOfDay,
  };
}

type WordLibraryContextValue = ReturnType<typeof useWordLibraryState>;

const WordLibraryContext = createContext<WordLibraryContextValue | null>(null);

/**
 * Runs the word-library fetch exactly once and shares it via context, so
 * every screen reads the same snapshot. Without this, each screen's own
 * useWordLibrary() call independently re-fetched alarm/gym words on its own
 * mount -- 7 call sites meant up to 7 redundant round trips for data that's
 * identical across the whole app (same pattern AlarmsContext already fixed
 * for alarms).
 */
export function WordLibraryProvider({ children }: { children: ReactNode }) {
  const value = useWordLibraryState();
  return <WordLibraryContext.Provider value={value}>{children}</WordLibraryContext.Provider>;
}

export function useWordLibrary(): WordLibraryContextValue {
  const context = useContext(WordLibraryContext);
  if (!context) {
    throw new Error('useWordLibrary must be used within WordLibraryProvider');
  }
  return context;
}
