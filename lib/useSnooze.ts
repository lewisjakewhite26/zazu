import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SNOOZE_MINUTES,
  SNOOZE_MIN_MINUTES,
  SNOOZE_MAX_MINUTES,
  isSnoozeAvailable,
  toIsoDate,
} from './snooze-logic';

export { SNOOZE_MINUTES, SNOOZE_MIN_MINUTES, SNOOZE_MAX_MINUTES, isSnoozeAvailable };

const STORAGE_KEY = 'zazu:snoozedDate';
const DURATION_STORAGE_KEY = 'zazu:snoozeDurationMinutes';

/** Tracks whether today's snooze has already been used - capped at one per morning, resets at midnight. */
export function useSnooze() {
  const [loading, setLoading] = useState(true);
  const [snoozedDate, setSnoozedDate] = useState<string | null>(null);
  const [snoozeMinutes, setSnoozeMinutesState] = useState(SNOOZE_MINUTES);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (cancelled) return;
      setSnoozedDate(value);
      setLoading(false);
    });
    AsyncStorage.getItem(DURATION_STORAGE_KEY).then((value) => {
      if (cancelled || !value) return;
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= SNOOZE_MIN_MINUTES && parsed <= SNOOZE_MAX_MINUTES) {
        setSnoozeMinutesState(parsed);
      }
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

  const setSnoozeMinutes = useCallback(async (minutes: number) => {
    setSnoozeMinutesState(minutes);
    await AsyncStorage.setItem(DURATION_STORAGE_KEY, String(minutes));
  }, []);

  return { loading, canSnooze, recordSnooze, snoozeMinutes, setSnoozeMinutes };
}
