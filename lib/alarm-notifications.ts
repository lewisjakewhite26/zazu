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

const ALARM_CHANNEL_ID = 'alarm';

/**
 * Android ignores per-notification vibration and routes it through the
 * channel instead — without this, a scheduled alarm falls back to the
 * default channel's single short buzz, nowhere near enough to wake someone.
 */
async function ensureAlarmNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Alarm',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 1000, 500, 1000],
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
}

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

  await ensureAlarmNotificationChannel();

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
      channelId: ALARM_CHANNEL_ID,
    },
  });
}

/**
 * One-shot reminder fired `minutes` from now, independent of the alarm's own
 * daily schedule (which is left untouched — snoozing doesn't cancel tomorrow's
 * alarm). Carries the same `alarmId` so NotificationBootstrap re-opens the
 * flow exactly like the original firing did.
 */
export async function scheduleSnoozeNotification(
  alarmId: string,
  minutes: number,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good morning',
      body: 'Time to wake up and learn a new word.',
      data: { alarmId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
      channelId: ALARM_CHANNEL_ID,
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
