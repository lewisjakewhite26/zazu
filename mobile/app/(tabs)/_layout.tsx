import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { copy } from '@/constants/copy';
import { useTheme } from '@/context/ThemeContext';

const isWeb = Platform.OS === 'web';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.subtext,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginTop: -2,
        },
        tabBarItemStyle: {
          borderRadius: 999,
          marginHorizontal: 2,
        },
        tabBarStyle: isWeb
          ? {
              position: 'absolute',
              bottom: 12,
              left: 20,
              right: 20,
              height: 62,
              backgroundColor: colors.card,
              borderTopColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 999,
              paddingTop: 6,
              paddingBottom: 8,
              elevation: 0,
              shadowOpacity: 0,
            }
          : {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopWidth: StyleSheet.hairlineWidth,
              paddingTop: 4,
              height: Platform.OS === 'ios' ? 88 : 64,
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: copy.home.tabHome,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          title: copy.home.tabGym,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
