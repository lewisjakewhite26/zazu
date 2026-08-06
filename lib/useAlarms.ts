// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_ALARMS, type Alarm } from './alarm';
import { requestNotificationPermissions, syncAlarmNotifications } from './alarm-notifications';
import { DEFAULT_ALARM_SOUND_ID, isAlarmSoundId } from './alarm-sound';

const STORAGE_KEY = 'zazu:alarms';

async function readAlarms(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ALARMS;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_ALARMS;
    return parsed
      .filter(
        (entry): entry is Alarm =>
          typeof entry?.id === 'string' &&
          typeof entry?.time === 'string' &&
          typeof entry?.label === 'string' &&
          typeof entry?.enabled === 'boolean',
      )
      // Alarms saved before sound selection existed have no soundId yet.
      .map((entry) => ({
        ...entry,
        soundId: isAlarmSoundId(entry.soundId) ? entry.soundId : DEFAULT_ALARM_SOUND_ID,
      }));
  } catch {
    return DEFAULT_ALARMS;
  }
}

async function writeAlarms(alarms: Alarm[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

export function useAlarms() {
  const [loading, setLoading] = useState(true);
  const [alarms, setAlarms] = useState<Alarm[]>(DEFAULT_ALARMS);
  const [notificationsReady, setNotificationsReady] = useState(false);

  const persistAlarms = useCallback(async (next: Alarm[]) => {
    const synced = await syncAlarmNotifications(next);
    await writeAlarms(synced);
    setAlarms(synced);
    return synced;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const saved = await readAlarms();
      const granted = await requestNotificationPermissions();
      if (cancelled) return;

      setNotificationsReady(granted);
      const synced = await syncAlarmNotifications(saved);
      if (!cancelled) {
        await writeAlarms(synced);
        setAlarms(synced);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAlarm = useCallback(
    async (id: string, enabled: boolean) => {
      const next = alarms.map((alarm) => (alarm.id === id ? { ...alarm, enabled } : alarm));
      await persistAlarms(next);
    },
    [alarms, persistAlarms],
  );

  const replaceAlarms = useCallback(
    async (next: Alarm[]) => {
      await persistAlarms(next);
    },
    [persistAlarms],
  );

  const addAlarm = useCallback(
    async (time: string, label: string, soundId: Alarm['soundId'] = DEFAULT_ALARM_SOUND_ID) => {
      const id = `alarm-${Date.now()}`;
      await persistAlarms([...alarms, { id, time, label, enabled: true, soundId }]);
    },
    [alarms, persistAlarms],
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      const next = alarms.filter((alarm) => alarm.id !== id);
      await persistAlarms(next);
    },
    [alarms, persistAlarms],
  );

  return {
    loading,
    alarms,
    notificationsReady,
    toggleAlarm,
    replaceAlarms,
    addAlarm,
    deleteAlarm,
  };
}
