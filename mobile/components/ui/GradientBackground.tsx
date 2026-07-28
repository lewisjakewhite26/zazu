import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { backgroundTransitionMs } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { blendThemePalette } from '../../../lib/adaptive-theme';

type GradientBackgroundProps = {
  children: React.ReactNode;
  style?: ViewProps['style'];
};

/** CSS linear-gradient(160deg, …) → start/end points */
const GRADIENT_START = { x: 0.08, y: 0 };
const GRADIENT_END = { x: 0.92, y: 1 };

export function GradientBackground({ children, style }: GradientBackgroundProps) {
  const { blend } = useTheme();
  const animatedBlend = useRef(new Animated.Value(blend)).current;
  const [gradientColors, setGradientColors] = useState(() => {
    const p = blendThemePalette(blend);
    return [p.bgFrom, p.bgMid, p.bgTo] as const;
  });

  useEffect(() => {
    const listener = animatedBlend.addListener(({ value }) => {
      const p = blendThemePalette(value);
      setGradientColors([p.bgFrom, p.bgMid, p.bgTo]);
    });
    Animated.timing(animatedBlend, {
      toValue: blend,
      duration: backgroundTransitionMs,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    return () => animatedBlend.removeListener(listener);
  }, [animatedBlend, blend]);

  const colors = useMemo(
    () => [gradientColors[0], gradientColors[1], gradientColors[2]],
    [gradientColors],
  );

  return (
    <LinearGradient
      colors={colors as [string, string, string]}
      locations={[0, 0.5, 1]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={[styles.root, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
