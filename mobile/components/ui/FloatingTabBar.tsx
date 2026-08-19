import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { BarbellIcon, HouseIcon, type IconProps } from 'phosphor-react-native';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardBlurIntensity } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const TAB_ICONS: Record<string, ComponentType<IconProps>> = {
  index: HouseIcon,
  gym: BarbellIcon,
};

/** Space to reserve above the floating tab bar (pill + padding; add safe-area separately). */
export const FLOATING_TAB_BAR_BODY = 64;

export function floatingTabBarClearance(bottomInset: number): number {
  return FLOATING_TAB_BAR_BODY + Math.max(bottomInset, 10);
}

/** index.html .app-tab-bar — centred floating pill with blush active state */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, blend } = useTheme();
  const isNight = blend >= 0.5;

  return (
    <View
      style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 10) }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pill,
          {
            borderColor: colors.border,
            shadowOpacity: isNight ? 0.35 : 0.12,
          },
        ]}
      >
        {Platform.OS !== 'web' ? (
          <BlurView
            intensity={cardBlurIntensity}
            tint={isNight ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name] ?? HouseIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const activeFg = isNight ? colors.wakeButtonTextNight : colors.white;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tab,
                isFocused && {
                  backgroundColor: isNight ? colors.wakeButtonBgNight : colors.ink,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Icon
                size={18}
                color={isFocused ? activeFg : colors.subtext}
                weight={isFocused ? 'fill' : 'regular'}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? activeFg : colors.subtext,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  pill: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 300,
    borderRadius: 100,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 4,
    shadowColor: '#1a1225',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 7,
    paddingHorizontal: 4,
    minHeight: 46,
    borderRadius: 100,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.63,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});
