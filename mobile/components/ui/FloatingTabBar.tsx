import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { BarbellIcon, BookOpenIcon, HouseIcon, type IconProps } from 'phosphor-react-native';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardBlurIntensity, fonts } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const TAB_ICONS: Record<string, ComponentType<IconProps>> = {
  index: HouseIcon,
  gym: BarbellIcon,
  vocabulary: BookOpenIcon,
};

/** Height of the bar above the safe-area inset. Screens reserve this plus the inset. */
export const FLOATING_TAB_BAR_BODY = 58;

export function floatingTabBarClearance(bottomInset: number): number {
  return FLOATING_TAB_BAR_BODY + Math.max(bottomInset, 10);
}

/**
 * A flat bar on the bottom edge: frosted like the app's glass cards, a
 * hairline on top, and the active tab marked by ink colour and a short rule
 * on that hairline. No floating capsule, no filled active pill.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, blend } = useTheme();
  const isNight = blend >= 0.5;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={cardBlurIntensity} tint={isNight ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
      <View style={[styles.hairline, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const Icon = TAB_ICONS[route.name] ?? HouseIcon;
          const tint = isFocused ? colors.text : colors.subtext;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={[styles.rule, { backgroundColor: isFocused ? colors.text : 'transparent' }]} />
              <Icon size={22} color={tint} weight={isFocused ? 'fill' : 'regular'} />
              <Text
                style={[styles.label, { color: tint, fontFamily: isFocused ? fonts.sansSemiBold : fonts.sansMedium }]}
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
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    height: FLOATING_TAB_BAR_BODY,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  rule: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0,
  },
});
