// @ts-nocheck
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Alarm } from './alarm';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ?? false;
}

export async function cancelAlarmNotification(notificationId?: string): Promise<void> {
  if (!notificationId || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
  if (!alarm.enabled || Platform.OS === 'web') return null;

  const parsed = parseTime(alarm.time);
  if (!parsed) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good morning',
      body: 'Time to wake up and learn a new word.',
      data: { alarmId: alarm.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsed.hour,
      minute: parsed.minute,
    },
  });
}

export async function syncAlarmNotifications(alarms: Alarm[]): Promise<Alarm[]> {
  if (Platform.OS === 'web') return alarms;

  const synced: Alarm[] = [];

  for (const alarm of alarms) {
    await cancelAlarmNotification(alarm.notificationId);

    if (!alarm.enabled) {
      synced.push({ ...alarm, notificationId: undefined });
      continue;
    }

    const notificationId = await scheduleAlarmNotification(alarm);
    synced.push({ ...alarm, notificationId: notificationId ?? undefined });
  }

  return synced;
}
