import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View, type LayoutChangeEvent, type View as RNView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fonts } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { hapticSelect } from '../../../lib/feedback';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 30;
/** Extra vertical touch area above/below the visible track so the real hit target clears MIN_TOUCH_TARGET. */
const TRACK_VERTICAL_PADDING = 14;

export type SnoozeDurationSliderProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

/** Big serif numeral + a peach-blush-lavender gradient track -- the same palette as the hold-to-snooze ring, so the two controls read as one system. */
export function SnoozeDurationSlider({ value, min, max, onChange }: SnoozeDurationSliderProps) {
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const thumbScale = useRef(new Animated.Value(1)).current;
  const trackRef = useRef<RNView>(null);
  // Page-relative, not locationX -- locationX is relative to whichever native
  // view the touch currently sits over, and that reference frame silently
  // flips mid-drag as a finger crosses from the track into its parent's
  // padding area, producing exactly the "doesn't track my finger" / "jumps
  // mid-drag" bugs this was rebuilt to fix. pageX measured once against the
  // screen never changes mid-gesture.
  const trackPageXRef = useRef(0);

  const valueRef = useRef(value);
  valueRef.current = value;
  const displayRef = useRef(displayValue);
  displayRef.current = displayValue;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    trackRef.current?.measure((_x, _y, _width, _height, pageX) => {
      trackPageXRef.current = pageX;
    });
  };

  const valueFromPageX = useCallback(
    (pageX: number) => {
      if (trackWidth <= 0) return displayRef.current;
      const x = pageX - trackPageXRef.current;
      const ratio = Math.max(0, Math.min(1, x / trackWidth));
      return Math.round(min + ratio * (max - min));
    },
    [trackWidth, min, max],
  );

  const applyValue = useCallback((next: number) => {
    if (next !== displayRef.current) {
      hapticSelect();
      setDisplayValue(next);
    }
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          setDragging(true);
          Animated.spring(thumbScale, { toValue: 1.3, useNativeDriver: true, friction: 5 }).start();
          applyValue(valueFromPageX(event.nativeEvent.pageX));
        },
        onPanResponderMove: (event) => {
          applyValue(valueFromPageX(event.nativeEvent.pageX));
        },
        onPanResponderRelease: () => {
          setDragging(false);
          Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
          onChangeRef.current(displayRef.current);
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          Animated.spring(thumbScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
          onChangeRef.current(displayRef.current);
        },
      }),
    [applyValue, thumbScale, valueFromPageX],
  );

  const shownValue = dragging ? displayValue : value;
  const ratio = max > min ? (shownValue - min) / (max - min) : 0;
  const fillWidth = ratio * trackWidth;
  const thumbLeft = fillWidth - THUMB_SIZE / 2;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { width: '100%' },
        numeralRow: {
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 7,
          marginBottom: 16,
        },
        numeral: {
          fontFamily: fonts.serif,
          fontSize: 44,
          lineHeight: 46,
          color: colors.text,
          minWidth: 58,
          textAlign: 'right',
          fontVariant: ['tabular-nums'],
        },
        unit: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: colors.subtext,
        },
        trackTouchArea: {
          justifyContent: 'center',
          paddingVertical: TRACK_VERTICAL_PADDING,
        },
        track: {
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: colors.border,
          overflow: 'hidden',
        },
        fill: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          borderRadius: TRACK_HEIGHT / 2,
          overflow: 'hidden',
        },
        thumb: {
          position: 'absolute',
          top: TRACK_VERTICAL_PADDING + TRACK_HEIGHT / 2 - THUMB_SIZE / 2,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: colors.text,
          borderWidth: 3,
          borderColor: colors.card,
          shadowColor: '#1a1225',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        },
        endsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 2,
        },
        endLabel: {
          fontFamily: fonts.sans,
          fontSize: 11,
          color: colors.subtext,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.numeralRow}>
        <Text style={styles.numeral}>{shownValue}</Text>
        <Text style={styles.unit}>min</Text>
      </View>

      <View ref={trackRef} style={styles.trackTouchArea} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View
          style={styles.track}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Snooze duration"
          accessibilityValue={{ min, max, now: shownValue, text: `${shownValue} minutes` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') {
              onChangeRef.current(Math.min(max, value + 1));
            } else if (event.nativeEvent.actionName === 'decrement') {
              onChangeRef.current(Math.max(min, value - 1));
            }
          }}
        >
          <View style={[styles.fill, { width: fillWidth }]}>
            <LinearGradient
              colors={[colors.peach, colors.blush, colors.lavender]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: trackWidth || '100%', height: '100%' }}
            />
          </View>
        </View>
        <Animated.View
          style={[styles.thumb, { left: thumbLeft, transform: [{ scale: thumbScale }] }]}
          pointerEvents="none"
        />
      </View>

      <View style={styles.endsRow}>
        <Text style={styles.endLabel}>{min} min</Text>
        <Text style={styles.endLabel}>{max} min</Text>
      </View>
    </View>
  );
}
