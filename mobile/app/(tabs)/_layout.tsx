import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { copy } from '@/constants/copy';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: copy.home.tabHome }} />
      <Tabs.Screen name="gym" options={{ title: copy.home.tabGym }} />
      <Tabs.Screen name="vocabulary" options={{ title: copy.home.tabVocabulary }} />
    </Tabs>
  );
}
