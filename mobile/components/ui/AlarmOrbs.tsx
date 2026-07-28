import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

/** index.html .alarm-orb + .alarm-glow on #screenAlarm */
export function AlarmOrbs() {
  const { colors: themeColors, blend } = useTheme();
  const isNight = blend >= 0.5;
  const orbOpacity = isNight ? 0.3 : 0.55;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        glow: {
          ...StyleSheet.absoluteFill,
          backgroundColor: isNight ? themeColors.alarmGlowDark : themeColors.alarmGlowLight,
          opacity: isNight ? 1 : 0.75,
        },
        orb: {
          position: 'absolute',
          borderRadius: 999,
          pointerEvents: 'none',
        },
        orbOne: {
          width: 280,
          height: 280,
          backgroundColor: colors.peach,
          top: -60,
          left: -80,
          opacity: orbOpacity,
        },
        orbTwo: {
          width: 240,
          height: 240,
          backgroundColor: colors.lavender,
          bottom: -40,
          right: -60,
          opacity: orbOpacity * 0.85,
        },
        orbThree: {
          width: 180,
          height: 180,
          backgroundColor: colors.blush,
          top: '40%',
          left: '50%',
          marginLeft: -90,
          marginTop: -90,
          opacity: orbOpacity * 0.65,
        },
      }),
    [isNight, orbOpacity, themeColors.alarmGlowDark, themeColors.alarmGlowLight],
  );

  return (
    <>
      <View style={styles.glow} pointerEvents="none" />
      <View style={[styles.orb, styles.orbOne]} />
      <View style={[styles.orb, styles.orbTwo]} />
      <View style={[styles.orb, styles.orbThree]} />
    </>
  );
}
