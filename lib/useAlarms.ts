// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_ALARMS, type Alarm } from './alarm';
import {
  cancelAlarmNotification,
  getAlarmPermissionStatus,
  requestNotificationPermissions,
  syncAlarmNotifications,
  type AlarmPermissionStatus,
} from './alarm-notifications';
import { DEFAULT_ALARM_SOUND_ID, isAlarmSoundId } from './alarm-sound';

const UNKNOWN_PERMISSION_STATUS: AlarmPermissionStatus = {
  notificationsGranted: false,
  exactAlarmGranted: false,
  batteryUnrestricted: false,
};

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
  const [permissionStatus, setPermissionStatus] = useState<AlarmPermissionStatus>(
    UNKNOWN_PERMISSION_STATUS,
  );

  const refreshPermissionStatus = useCallback(async () => {
    const status = await getAlarmPermissionStatus();
    setPermissionStatus(status);
    return status;
  }, []);

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
      await requestNotificationPermissions();
      if (cancelled) return;

      await refreshPermissionStatus();
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
  }, [refreshPermissionStatus]);

  // Exact-alarm and battery-optimization grants happen in system Settings,
  // outside any in-app callback -- foreground is the only moment we can
  // notice the user came back having fixed (or revoked) them. Notifications
  // gets the same "always ask again if missing" treatment, but via the OS's
  // own dialog rather than a custom one -- requestNotificationPermissions()
  // is a no-op silently returning the current status once permanently denied,
  // so this is safe to call on every foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void (async () => {
        await requestNotificationPermissions();
        await refreshPermissionStatus();
      })();
    });
    return () => subscription.remove();
  }, [refreshPermissionStatus]);

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
      // syncAlarmNotifications only touches IDs still present in `next`, so
      // the deleted alarm's own daily-repeating trigger (and any pending
      // snooze, which is a separate trigger id) would otherwise never be
      // cancelled and would keep firing on the device indefinitely.
      await cancelAlarmNotification(id);
      await cancelAlarmNotification(`${id}-snooze`);
      await persistAlarms(next);
    },
    [alarms, persistAlarms],
  );

  return {
    loading,
    alarms,
    permissionStatus,
    refreshPermissionStatus,
    toggleAlarm,
    replaceAlarms,
    addAlarm,
    deleteAlarm,
  };
}
