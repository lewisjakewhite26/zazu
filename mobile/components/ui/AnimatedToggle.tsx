import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { colors as staticColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const THUMB_OFFSET = 3;
const THUMB_TRAVEL = 18;

type AnimatedToggleProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  accessibilityLabel: string;
};

/** index.html .toggle — 44×26 track, 20px thumb, translateX(18px) on */
export function AnimatedToggle({ value, onValueChange, accessibilityLabel }: AnimatedToggleProps) {
  const { colors } = useTheme();
  const thumbX = useRef(new Animated.Value(value ? THUMB_TRAVEL : 0)).current;

  useEffect(() => {
    Animated.timing(thumbX, {
      toValue: value ? THUMB_TRAVEL : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [thumbX, value]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hit: {
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          justifyContent: 'center',
        },
        track: {
          ...StyleSheet.absoluteFill,
          borderRadius: 100,
          backgroundColor: value ? colors.blush : colors.border,
        },
        thumb: {
          position: 'absolute',
          top: THUMB_OFFSET,
          left: THUMB_OFFSET,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: staticColors.white,
          shadowColor: staticColors.toggleThumbShadow,
          shadowOpacity: 1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        },
      }),
    [colors.blush, colors.border, value],
  );

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.hit}
    >
      <Animated.View style={styles.track} />
      <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
    </Pressable>
  );
}
