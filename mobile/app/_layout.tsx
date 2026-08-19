import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { DMSerifText_400Regular } from '@expo-google-fonts/dm-serif-text';
import notifee, { EventType } from 'react-native-notify-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { AlarmFlowProvider } from '@/context/AlarmFlowContext';
import { AlarmsProvider } from '@/context/AlarmsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationBootstrap } from '@/components/NotificationBootstrap';
import { AppAlertHost } from '@/components/ui/AppAlert';
import { PENDING_ALARM_OPEN_KEY, PENDING_ALARM_WRITTEN_EVENT } from '../../lib/alarm-notifications';

export { ErrorBoundary } from 'expo-router';

// Must be registered before the app finishes initializing. When the alarm
// fires while the app is backgrounded, notifee often routes the DELIVERED
// event here instead of onForegroundEvent -- and this headless context has
// no live React tree to navigate with. Leaving a breadcrumb lets
// NotificationBootstrap pick up the alarm once the real app mounts.
//
// The process is almost always still alive when this runs (confirmed via
// matching PIDs in logcat between this handler and the live app's own
// logging), sharing the same JS runtime as NotificationBootstrap -- but this
// handler can fire within milliseconds of the app becoming foreground (the
// full-screen intent and this DELIVERED event both fire off the same alarm
// trigger, racing each other). That race means NotificationBootstrap's own
// mount-time and AppState-driven reads can all run *before* this write
// completes, with no further foreground transition left to trigger a
// re-check. Emitting this event the instant the write finishes lets it
// react immediately instead of depending on catching a state transition
// that may have already happened.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.DELIVERED) return;
  const alarmId = detail.notification?.data?.alarmId as string | undefined;
  await AsyncStorage.setItem(
    PENDING_ALARM_OPEN_KEY,
    JSON.stringify({ alarmId, notificationId: detail.notification?.id, deliveredAt: Date.now() }),
  );
  DeviceEventEmitter.emit(PENDING_ALARM_WRITTEN_EVENT);
});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSerifText_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AlarmFlowProvider>
              <AlarmsProvider>
                <NotificationBootstrap>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="add-alarm" options={{ headerShown: false, presentation: 'modal' }} />
                    <Stack.Screen name="alarm" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="learn" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="morning-task" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="puzzle" options={{ headerShown: false }} />
                    <Stack.Screen name="gym-mcq" options={{ headerShown: false }} />
                    <Stack.Screen name="gym-literary-round" options={{ headerShown: false }} />
                    <Stack.Screen name="ad" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="success" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="daily-ritual" options={{ headerShown: false }} />
                    <Stack.Screen name="gym-success" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="calendar" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'modal' }} />
                    <Stack.Screen name="gold" options={{ headerShown: false, presentation: 'modal' }} />
                    <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                  </Stack>
                  <AppAlertHost />
                </NotificationBootstrap>
              </AlarmsProvider>
            </AlarmFlowProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
