// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_ALARMS, type Alarm } from './alarm';
import { requestNotificationPermissions, syncAlarmNotifications } from './alarm-notifications';

const STORAGE_KEY = 'zazu:alarms';

async function readAlarms(): Promise<Alarm[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ALARMS;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_ALARMS;
    return parsed.filter(
      (entry): entry is Alarm =>
        typeof entry?.id === 'string' &&
        typeof entry?.time === 'string' &&
        typeof entry?.label === 'string' &&
        typeof entry?.enabled === 'boolean',
    );
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

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const saved = await readAlarms();
        setAlarms(saved);
      })();
    }, []),
  );

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
    async (time: string, label: string) => {
      const id = `alarm-${Date.now()}`;
      await persistAlarms([...alarms, { id, time, label, enabled: true }]);
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
  };
}
