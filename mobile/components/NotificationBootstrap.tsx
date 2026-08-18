import { useCallback, useEffect } from 'react';
import { AppState, DeviceEventEmitter, Platform } from 'react-native';
import notifee, { EventType, type Notification } from 'react-native-notify-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarms, type Alarm } from '@/hooks/useAlarms';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { preloadAlarmSound, DEFAULT_ALARM_SOUND_ID, type AlarmSoundId } from '../../lib/alarm-sound';
import { PENDING_ALARM_OPEN_KEY, PENDING_ALARM_WRITTEN_EVENT } from '../../lib/alarm-notifications';

// Stale breadcrumbs (app opened long after the alarm delivered, e.g. days
// later for an unrelated reason) shouldn't replay an old alarm.
const PENDING_ALARM_MAX_AGE_MS = 5 * 60 * 1000;

type NotificationBootstrapProps = {
  children: React.ReactNode;
};

export function NotificationBootstrap({ children }: NotificationBootstrapProps) {
  const router = useRouter();
  const { startFlow } = useAlarmFlow();
  const { alarmWordOfDay } = useWordLibrary();
  const { alarms } = useAlarms();

  const openAlarmFlow = useCallback(
    (notification?: Notification) => {
      if (!alarmWordOfDay) return;
      const alarmId = notification?.data?.alarmId as string | undefined;
      const soundId = alarms.find((alarm: Alarm) => alarm.id === alarmId)?.soundId ?? DEFAULT_ALARM_SOUND_ID;
      startFlow(alarmWordOfDay, { soundId, alarmId });
      router.push('/alarm');

      // Android only re-triggers full-screen display for a genuinely new
      // notification post -- if this one is left sitting in the tray, the
      // next firing under the same id is treated as an update and silently
      // skips the full-screen wake. Clearing it the moment it's engaged
      // keeps that id "fresh" for the next occurrence.
      if (Platform.OS !== 'web' && notification?.id) {
        void notifee.cancelNotification(notification.id);
      }
    },
    [alarmWordOfDay, alarms, startFlow, router],
  );

  // Covers the case the mount-time checks below miss: the alarm delivered
  // while the app was backgrounded (even just via the home button -- the
  // React tree stays alive the whole time, it never remounts), so notifee
  // routed it to the headless onBackgroundEvent handler in _layout.tsx
  // instead -- that context has no live navigation, so it just left this
  // breadcrumb. Re-checking on every foreground resume, not only on mount,
  // is what actually catches it.
  const checkPendingAlarm = useCallback(() => {
    if (!alarmWordOfDay) return;
    void AsyncStorage.getItem(PENDING_ALARM_OPEN_KEY).then((raw) => {
      if (!raw) return;
      void AsyncStorage.removeItem(PENDING_ALARM_OPEN_KEY);
      const pending = JSON.parse(raw) as { alarmId?: string; notificationId?: string; deliveredAt: number };
      if (Date.now() - pending.deliveredAt > PENDING_ALARM_MAX_AGE_MS) return;
      openAlarmFlow({ id: pending.notificationId, data: { alarmId: pending.alarmId } } as Notification);
    });
  }, [alarmWordOfDay, openAlarmFlow]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Prime every enabled alarm's chime at boot so the real alarm never pays
    // a decode/audio-session delay on its first play, whichever sound it uses.
    const soundIds = new Set<AlarmSoundId>([DEFAULT_ALARM_SOUND_ID]);
    for (const alarm of alarms) {
      if (alarm.enabled) soundIds.add(alarm.soundId);
    }
    for (const soundId of soundIds) {
      void preloadAlarmSound(soundId);
    }

    // On a cold launch this effect can run before `alarmWordOfDay` has
    // finished loading -- openAlarmFlow would silently bail (its
    // `!alarmWordOfDay` guard) on the one read of the launch notification,
    // dropping the app onto the home screen instead of the alarm flow.
    // Waiting for it to be ready first guarantees the read happens with
    // real data.
    if (alarmWordOfDay) {
      void notifee.getInitialNotification().then((initial) => {
        if (initial) openAlarmFlow(initial.notification);
      });
      checkPendingAlarm();
    }

    // The alarm's fullScreenAction usually relaunches an already-alive,
    // backgrounded app (rapid testing, or simply not force-killed since the
    // last alarm) via onNewIntent rather than a fresh onCreate --
    // getInitialNotification() only ever sees onCreate-time data, so it
    // stays silent on that path. DELIVERED fires the moment the trigger
    // executes regardless of press/launch semantics, so it's the one event
    // that reliably covers this case too.
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS || type === EventType.DELIVERED) {
        openAlarmFlow(detail.notification);
      }
    });

    return unsubscribe;
  }, [alarms, alarmWordOfDay, openAlarmFlow, checkPendingAlarm]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPendingAlarm();
    });
    return () => subscription.remove();
  }, [checkPendingAlarm]);

  // Catches the race where the background handler (mobile/app/_layout.tsx)
  // writes the breadcrumb within the same live process a few hundred ms
  // *after* every mount-time and AppState-driven read above already ran --
  // there's no further foreground transition left to trigger a re-check at
  // that point, so the write needs to actively announce itself instead.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = DeviceEventEmitter.addListener(PENDING_ALARM_WRITTEN_EVENT, checkPendingAlarm);
    return () => subscription.remove();
  }, [checkPendingAlarm]);

  return children;
}
