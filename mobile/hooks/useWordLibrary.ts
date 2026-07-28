import { useCallback, useEffect, useMemo, useState } from 'react';

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

export function useWordLibrary(learnedWordIds: string[] = []) {
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
    () => pickNextAlarmWord(alarmWords, learnedWordIds) ?? alarmWords[0],
    [alarmWords, learnedWordIds],
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
