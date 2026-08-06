import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { preloadAlarmSound } from '../../lib/alarm-sound';

type NotificationBootstrapProps = {
  children: React.ReactNode;
};

export function NotificationBootstrap({ children }: NotificationBootstrapProps) {
  const router = useRouter();
  const { startFlow } = useAlarmFlow();
  const { alarmWordOfDay } = useWordLibrary([]);

  const openAlarmFlow = useCallback(() => {
    if (!alarmWordOfDay) return;
    startFlow(alarmWordOfDay);
    router.push('/alarm');
  }, [alarmWordOfDay, startFlow, router]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Prime the chime once at boot so the real alarm never pays a
    // decode/audio-session delay on its first play.
    void preloadAlarmSound();

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openAlarmFlow();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      openAlarmFlow();
    });

    return () => subscription.remove();
  }, [openAlarmFlow]);

  return children;
}
