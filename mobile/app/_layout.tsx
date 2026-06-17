import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AlarmFlowProvider } from '@/context/AlarmFlowContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationBootstrap } from '@/components/NotificationBootstrap';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSerifDisplay_400Regular,
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
        <AlarmFlowProvider>
          <NotificationBootstrap>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="add-alarm" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="alarm" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="learn" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="morning-task" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="puzzle" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="ad" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="success" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="gym-success" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="calendar" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="gold" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            </Stack>
          </NotificationBootstrap>
        </AlarmFlowProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
