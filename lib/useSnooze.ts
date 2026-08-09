// @ts-nocheck — resolved via mobile/node_modules at runtime; re-exported through mobile/hooks/useSnooze.ts
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SNOOZE_MINUTES, SNOOZE_MIN_MINUTES, SNOOZE_MAX_MINUTES, isSnoozeAvailable, toIsoDate } from './snooze-logic';

export { SNOOZE_MINUTES, SNOOZE_MIN_MINUTES, SNOOZE_MAX_MINUTES, isSnoozeAvailable };

const STORAGE_KEY = 'zazu:snoozedDate';

/** Tracks whether today's snooze has already been used - capped at one per morning, resets at midnight. */
export function useSnooze() {
  const [loading, setLoading] = useState(true);
  const [snoozedDate, setSnoozedDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (cancelled) return;
      setSnoozedDate(value);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const canSnooze = !loading && isSnoozeAvailable(snoozedDate, toIsoDate());

  const recordSnooze = useCallback(async () => {
    const today = toIsoDate();
    await AsyncStorage.setItem(STORAGE_KEY, today);
    setSnoozedDate(today);
  }, []);

  return { loading, canSnooze, recordSnooze };
}
