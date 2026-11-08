import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="wake" />
      <Stack.Screen name="ready" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="name" />
    </Stack>
  );
}
