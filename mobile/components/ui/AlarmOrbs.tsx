import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

import { colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const ORB_ONE_SIZE = 460;
const ORB_TWO_SIZE = 420;

type GlowOrbProps = {
  size: number;
  color: string;
  peakOpacity: number;
  style: { top?: number; bottom?: number; left?: number; right?: number };
};

/** A radial-gradient blob (colour -> transparent) instead of a flat circle, so it has no hard edge. */
function GlowOrb({ size, color, peakOpacity, style }: GlowOrbProps) {
  const gradientId = useMemo(() => `alarmOrbGradient-${color}-${size}`, [color, size]);

  return (
    <Svg
      width={size}
      height={size}
      style={[glowOrbStyles.orb, style]}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={peakOpacity} />
          <Stop offset="45%" stopColor={color} stopOpacity={peakOpacity * 0.55} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="50%" cy="50%" r="50%" fill={`url(#${gradientId})`} />
    </Svg>
  );
}

const glowOrbStyles = StyleSheet.create({
  orb: {
    position: 'absolute',
  },
});

/** index.html .alarm-orb + .alarm-glow on #screenAlarm */
export function AlarmOrbs() {
  const { colors: themeColors, blend } = useTheme();
  const isNight = blend >= 0.5;
  const orbPeakOpacity = isNight ? 0.28 : 0.4;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        glow: {
          ...StyleSheet.absoluteFill,
          backgroundColor: isNight ? themeColors.alarmGlowDark : themeColors.alarmGlowLight,
          opacity: isNight ? 1 : 0.75,
        },
      }),
    [isNight, themeColors.alarmGlowDark, themeColors.alarmGlowLight],
  );

  return (
    <>
      <View style={styles.glow} pointerEvents="none" />
      <GlowOrb
        size={ORB_ONE_SIZE}
        color={colors.peach}
        peakOpacity={orbPeakOpacity}
        style={{ top: -ORB_ONE_SIZE * 0.4, left: -ORB_ONE_SIZE * 0.42 }}
      />
      <GlowOrb
        size={ORB_TWO_SIZE}
        color={colors.lavender}
        peakOpacity={orbPeakOpacity * 0.85}
        style={{ bottom: -ORB_TWO_SIZE * 0.35, right: -ORB_TWO_SIZE * 0.38 }}
      />
    </>
  );
}
