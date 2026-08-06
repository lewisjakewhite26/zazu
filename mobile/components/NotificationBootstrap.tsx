import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarms, type Alarm } from '@/hooks/useAlarms';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { preloadAlarmSound, DEFAULT_ALARM_SOUND_ID, type AlarmSoundId } from '../../lib/alarm-sound';

type NotificationBootstrapProps = {
  children: React.ReactNode;
};

export function NotificationBootstrap({ children }: NotificationBootstrapProps) {
  const router = useRouter();
  const { startFlow } = useAlarmFlow();
  const { alarmWordOfDay } = useWordLibrary([]);
  const { alarms } = useAlarms();

  const openAlarmFlow = useCallback(
    (response?: Notifications.NotificationResponse) => {
      if (!alarmWordOfDay) return;
      const alarmId = response?.notification.request.content.data?.alarmId as string | undefined;
      const soundId = alarms.find((alarm: Alarm) => alarm.id === alarmId)?.soundId ?? DEFAULT_ALARM_SOUND_ID;
      startFlow(alarmWordOfDay, { soundId });
      router.push('/alarm');
    },
    [alarmWordOfDay, alarms, startFlow, router],
  );

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

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openAlarmFlow(response);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openAlarmFlow(response);
    });

    return () => subscription.remove();
  }, [alarms, openAlarmFlow]);

  return children;
}
