// @ts-nocheck
import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidLaunchActivityFlag,
  AndroidNotificationSetting,
  AndroidVisibility,
  RepeatFrequency,
  TriggerType,
} from 'react-native-notify-kit';
import { Platform } from 'react-native';

import type { Alarm } from './alarm';

const ALARM_CHANNEL_ID = 'alarm';

/**
 * When a notification's DELIVERED event arrives in the headless background
 * context (app deeply backgrounded, not just paused), there's no live React
 * tree to navigate with. The background handler leaves a breadcrumb here;
 * NotificationBootstrap picks it up once the real app mounts.
 */
export const PENDING_ALARM_OPEN_KEY = 'zazu:pendingAlarmOpen';

/**
 * Emitted (same JS runtime, since the process is almost always still alive
 * when the background handler runs) the instant the breadcrumb above is
 * written, so a live NotificationBootstrap can react immediately rather than
 * relying on a foreground/AppState transition that may have already fired
 * moments earlier -- the two can race within the same alarm firing.
 */
export const PENDING_ALARM_WRITTEN_EVENT = 'zazu:pendingAlarmWritten';

/**
 * Android ignores per-notification vibration and routes it through the
 * channel instead — without this, a scheduled alarm falls back to the
 * default channel's single short buzz, nowhere near enough to wake someone.
 */
async function ensureAlarmNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: 'Alarm',
    importance: AndroidImportance.HIGH,
    vibration: true,
    vibrationPattern: [300, 1000, 500, 1000],
    visibility: AndroidVisibility.PUBLIC,
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

/** Next local epoch timestamp matching `hour:minute` — today if still ahead, else tomorrow. */
function nextOccurrence(hour: number, minute: number): number {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await ensureAlarmNotificationChannel();

  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

export type AlarmPermissionStatus = {
  notificationsGranted: boolean;
  /** Android 12+ "Alarms & reminders" special access. Always true off Android. */
  exactAlarmGranted: boolean;
  /** True when the app is NOT battery-restricted. Always true off Android. */
  batteryUnrestricted: boolean;
};

const FULLY_GRANTED: AlarmPermissionStatus = {
  notificationsGranted: true,
  exactAlarmGranted: true,
  batteryUnrestricted: true,
};

/**
 * Read-only status check (no prompts) — safe to call on every app foreground
 * to notice permissions the user granted or revoked from Settings, which the
 * app has no other way to learn about.
 */
export async function getAlarmPermissionStatus(): Promise<AlarmPermissionStatus> {
  if (Platform.OS === 'web') return { ...FULLY_GRANTED, notificationsGranted: false };

  const settings = await notifee.getNotificationSettings();
  const notificationsGranted = settings.authorizationStatus >= 1;

  if (Platform.OS !== 'android') {
    return { ...FULLY_GRANTED, notificationsGranted };
  }

  const batteryRestricted = await notifee.isBatteryOptimizationEnabled();

  return {
    notificationsGranted,
    exactAlarmGranted: settings.android.alarm === AndroidNotificationSetting.ENABLED,
    batteryUnrestricted: !batteryRestricted,
  };
}

export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'web') return;
  await notifee.openNotificationSettings(ALARM_CHANNEL_ID);
}

export async function openExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await notifee.openAlarmPermissionSettings();
}

export async function openBatteryOptimizationSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await notifee.openBatteryOptimizationSettings();
}

export async function cancelAlarmNotification(id?: string): Promise<void> {
  if (!id || Platform.OS === 'web') return;
  await notifee.cancelTriggerNotification(id);
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<void> {
  if (!alarm.enabled || Platform.OS === 'web') return;

  const parsed = parseTime(alarm.time);
  if (!parsed) return;

  await notifee.createTriggerNotification(
    {
      id: alarm.id,
      title: 'Good morning',
      body: 'Time to wake up and learn a new word.',
      data: { alarmId: alarm.id },
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default', launchActivity: 'default' },
        fullScreenAction: {
          id: 'default',
          launchActivity: 'default',
          // The app process usually survives between firings (rarely fully
          // killed), so Android just resumes the existing activity instead
          // of creating a new one -- and turnScreenOn only fires on actual
          // creation. Forcing a fresh task/activity here is what makes the
          // screen wake reliably instead of only occluding a black display.
          launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK, AndroidLaunchActivityFlag.CLEAR_TASK],
        },
        sound: 'default',
        // A notification left over from a previous firing blocks the next
        // one's full-screen wake (Android treats a repost under the same id
        // as an update, not a new notification) -- auto-clear on any tap.
        autoCancel: true,
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: nextOccurrence(parsed.hour, parsed.minute),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
    },
  );
}

/**
 * One-shot reminder fired `minutes` from now, independent of the alarm's own
 * daily schedule (which is left untouched — snoozing doesn't cancel tomorrow's
 * alarm). Carries the same `alarmId` so NotificationBootstrap re-opens the
 * flow exactly like the original firing did.
 */
export async function scheduleSnoozeNotification(alarmId: string, minutes: number): Promise<void> {
  if (Platform.OS === 'web') return;

  await notifee.createTriggerNotification(
    {
      id: `${alarmId}-snooze`,
      title: 'Good morning',
      body: 'Time to wake up and learn a new word.',
      data: { alarmId },
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default', launchActivity: 'default' },
        fullScreenAction: {
          id: 'default',
          launchActivity: 'default',
          // The app process usually survives between firings (rarely fully
          // killed), so Android just resumes the existing activity instead
          // of creating a new one -- and turnScreenOn only fires on actual
          // creation. Forcing a fresh task/activity here is what makes the
          // screen wake reliably instead of only occluding a black display.
          launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK, AndroidLaunchActivityFlag.CLEAR_TASK],
        },
        sound: 'default',
        // A notification left over from a previous firing blocks the next
        // one's full-screen wake (Android treats a repost under the same id
        // as an update, not a new notification) -- auto-clear on any tap.
        autoCancel: true,
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + minutes * 60 * 1000,
      alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
    },
  );
}

export async function syncAlarmNotifications(alarms: Alarm[]): Promise<Alarm[]> {
  if (Platform.OS === 'web') return alarms;

  for (const alarm of alarms) {
    await cancelAlarmNotification(alarm.id);
    if (alarm.enabled) {
      await scheduleAlarmNotification(alarm);
    }
  }

  return alarms;
}
