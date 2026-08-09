import { useCallback, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 26;

export type SnoozeSliderProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SnoozeSlider({ value, min, max, onChange, disabled = false, style }: SnoozeSliderProps) {
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  // PanResponder is created once per trackWidth measurement, so it needs the
  // latest value/onChange without forcing a re-create on every parent render.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const valueFromX = useCallback(
    (x: number) => {
      if (trackWidth <= 0) return valueRef.current;
      const ratio = Math.max(0, Math.min(1, x / trackWidth));
      return Math.round(min + ratio * (max - min));
    },
    [trackWidth, min, max],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          onChangeRef.current(valueFromX(event.nativeEvent.locationX));
        },
        onPanResponderMove: (event) => {
          onChangeRef.current(valueFromX(event.nativeEvent.locationX));
        },
      }),
    [disabled, valueFromX],
  );

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * trackWidth - THUMB_SIZE / 2;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          opacity: disabled ? 0.5 : 1,
        },
        endsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        },
        endLabel: {
          ...typography.alarmSub,
          color: colors.subtext,
        },
        trackWrap: {
          height: THUMB_SIZE,
          justifyContent: 'center',
        },
        track: {
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: colors.border,
          overflow: 'hidden',
        },
        fill: {
          height: TRACK_HEIGHT,
          backgroundColor: colors.blush,
        },
        thumb: {
          position: 'absolute',
          top: (THUMB_SIZE - THUMB_SIZE) / 2,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: colors.blush,
        },
      }),
    [colors, disabled],
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.endsRow}>
        <Text style={styles.endLabel}>{min} min</Text>
        <Text style={styles.endLabel}>{max} min</Text>
      </View>
      <View
        style={styles.trackWrap}
        onLayout={handleLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Snooze duration"
        accessibilityValue={{ min, max, now: value, text: `${value} minutes` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') {
            onChangeRef.current(Math.min(max, value + 1));
          } else if (event.nativeEvent.actionName === 'decrement') {
            onChangeRef.current(Math.max(min, value - 1));
          }
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
        <View style={[styles.thumb, { left: Math.max(0, Math.min(trackWidth - THUMB_SIZE, thumbLeft)) }]} />
      </View>
    </View>
  );
}
