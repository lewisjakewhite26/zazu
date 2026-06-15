import { useEffect, useMemo, useState } from 'react';

import { DEMO_ALARM_WORDS } from '../../lib/demo-alarm-words';
import { DEMO_GYM_WORDS } from '../../lib/demo-words';
import {
  fetchAlarmWords,
  fetchGymWords,
  pickNextAlarmWord,
  type ZazuAlarmWord,
  type ZazuGymWord,
} from '../../lib/supabase';

export function useWordLibrary(learnedWordIds: string[] = []) {
  const [loading, setLoading] = useState(true);
  const [alarmWords, setAlarmWords] = useState<ZazuAlarmWord[]>(DEMO_ALARM_WORDS);
  const [gymWords, setGymWords] = useState<ZazuGymWord[]>(DEMO_GYM_WORDS);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [alarm, gym] = await Promise.all([fetchAlarmWords(), fetchGymWords()]);
      if (cancelled) return;

      if (alarm.length) setAlarmWords(alarm);
      if (gym.length) setGymWords(gym);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
    alarmWords,
    gymWords,
    alarmWordOfDay,
    gymWordOfDay,
    /** @deprecated Use alarmWordOfDay for display or gymWordOfDay for the Gym puzzle. */
    words: gymWords,
    wordOfDay: alarmWordOfDay,
  };
}
