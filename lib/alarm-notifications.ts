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
import { Linking, Platform } from 'react-native';

import type { Alarm } from './alarm';

// Channel sound is immutable once a channel exists on a device, so moving from
// the default ping to the custom chime needs a NEW channel id. The old one is
// deleted in ensureAlarmNotificationChannel().
const LEGACY_ALARM_CHANNEL_ID = 'alarm';
const ALARM_CHANNEL_ID = 'alarm-v2';
// res/raw/alarm_chime.wav, copied in by plugins/withAlarmSound.js.
const ALARM_CHANNEL_SOUND = 'alarm_chime';
// Safety stop: an untouched alarm shouldn't ring all day.
const ALARM_RING_TIMEOUT_MS = 10 * 60 * 1000;

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

  await notifee.deleteChannel(LEGACY_ALARM_CHANNEL_ID).catch(() => undefined);
  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: 'Alarm',
    importance: AndroidImportance.HIGH,
    vibration: true,
    vibrationPattern: [300, 1000, 500, 1000],
    visibility: AndroidVisibility.PUBLIC,
    sound: ALARM_CHANNEL_SOUND,
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

// notify-kit keeps a single pending permission callback on Android. A second
// requestPermission() while one is open overwrites it, and the first promise
// never settles (this left the alarm list stuck on loading). Share one
// in-flight request, and skip the request entirely once permission is granted.
let permissionRequestInFlight: Promise<boolean> | null = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await ensureAlarmNotificationChannel();

  const current = await notifee.getNotificationSettings();
  if (current.authorizationStatus >= 1) return true;

  if (!permissionRequestInFlight) {
    permissionRequestInFlight = notifee
      .requestPermission()
      .then((settings) => settings.authorizationStatus >= 1)
      .finally(() => {
        permissionRequestInFlight = null;
      });
  }
  return permissionRequestInFlight;
}

export type AlarmPermissionStatus = {
  notificationsGranted: boolean;
  /** Android 12+ "Alarms & reminders" special access. Always true off Android. */
  exactAlarmGranted: boolean;
  /** True when the app is NOT battery-restricted. Always true off Android. */
  batteryUnrestricted: boolean;
  /**
   * Android 14+ "Full screen notifications" access. Without it the OS can show
   * the alarm as a plain heads-up instead of taking over the lock screen.
   * Needs notify-kit >= 10.6.0 to read; reports true when it can't be read.
   */
  fullScreenGranted: boolean;
};

const FULLY_GRANTED: AlarmPermissionStatus = {
  notificationsGranted: true,
  exactAlarmGranted: true,
  batteryUnrestricted: true,
  fullScreenGranted: true,
};

function readFullScreenGranted(settings: unknown): boolean {
  const value = (settings as { android?: { fullScreenIntent?: unknown } }).android?.fullScreenIntent;
  // Older notify-kit doesn't report it: assume granted rather than nag.
  return value === undefined || value === AndroidNotificationSetting.ENABLED;
}

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
    fullScreenGranted: readFullScreenGranted(settings),
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

export async function openFullScreenSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    // Android 14+: the per-app "Full screen notifications" page.
    await Linking.sendIntent('android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT');
  } catch {
    await Linking.openSettings();
  }
}

export async function openBatteryOptimizationSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  // Open Zazu's own App info page (App battery usage lives there). The generic
  // battery optimisation screen is a list of every app, and users had to hunt for Zazu.
  await Linking.openSettings();
}

export async function cancelAlarmNotification(id?: string): Promise<void> {
  if (!id || Platform.OS === 'web') return;
  await notifee.cancelTriggerNotification(id);
}

/**
 * The notification itself must keep ringing, not just the in-app chime: the
 * JS player only starts once the full-screen activity has launched, and
 * Android can demote or skip that launch (full-screen access off, device in
 * use, OEM limits). loopSound repeats the channel's chime until the
 * notification is cancelled or opened, so a failed launch is still an alarm.
 */
function alarmAndroidOptions() {
  return {
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
    sound: ALARM_CHANNEL_SOUND,
    loopSound: true,
    timeoutAfter: ALARM_RING_TIMEOUT_MS,
    // A notification left over from a previous firing blocks the next
    // one's full-screen wake (Android treats a repost under the same id
    // as an update, not a new notification) -- auto-clear on any tap.
    autoCancel: true,
  };
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
      android: alarmAndroidOptions(),
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
      android: alarmAndroidOptions(),
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
