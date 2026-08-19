import { useMemo } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { cardBlurIntensity } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type GlassCardProps = {
  children: React.ReactNode;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/** index.html card: var(--card) + border + backdrop-filter: blur(10px) */
export function GlassCard({
  children,
  borderRadius = 18,
  style,
  contentStyle,
}: GlassCardProps) {
  const { colors, blend } = useTheme();
  const isNight = blend >= 0.5;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.glassCardBorder,
          backgroundColor: colors.glassCardFill,
          borderRadius,
        },
        blur: {
          ...StyleSheet.absoluteFill,
        },
        inner: {
          position: 'relative',
        },
      }),
    [colors.glassCardBorder, colors.glassCardFill, borderRadius],
  );

  return (
    <View style={[styles.shell, style]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={cardBlurIntensity} tint={isNight ? 'dark' : 'light'} style={styles.blur} />
      ) : null}
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}
