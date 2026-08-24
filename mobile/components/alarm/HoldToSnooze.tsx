import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { ClockIcon } from 'phosphor-react-native';

import { typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { hapticSelect, hapticSuccess } from '../../../lib/feedback';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const DIAL_SIZE = 104;
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CORE_SIZE = 66;
const ICON_SIZE = 24;
const HOLD_MS = 1800;
const CHECK_PATH_LENGTH = 20;

export type HoldToSnoozeProps = {
  minutes: number;
  onConfirm: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Press-and-hold snooze control: a gradient ring grows and sweeps in as you hold; release early and nothing happens. */
export function HoldToSnooze({ minutes, onConfirm, disabled = false, style }: HoldToSnoozeProps) {
  const { colors } = useTheme();
  const [holding, setHolding] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const morph = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const timingRef = useRef<Animated.CompositeAnimation | null>(null);

  const gradientId = useMemo(() => 'holdToSnoozeGradient', []);

  const reset = useCallback(() => {
    setHolding(false);
    Animated.timing(scale, { toValue: 1, duration: 220, useNativeDriver: false }).start();
    Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  }, [progress, scale]);

  const complete = useCallback(() => {
    setHolding(false);
    setConfirmed(true);
    hapticSuccess();
    ripple.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.22, duration: 160, useNativeDriver: false }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: false }),
      ]),
      Animated.timing(ripple, { toValue: 1, duration: 620, useNativeDriver: false }),
      Animated.timing(morph, { toValue: 1, duration: 360, delay: 120, useNativeDriver: false }),
    ]).start();
    onConfirm();
  }, [morph, onConfirm, progress, ripple, scale]);

  const startHold = useCallback(() => {
    if (disabled || confirmed) return;
    setHolding(true);
    hapticSelect();
    scale.setValue(1);
    progress.setValue(0);
    Animated.timing(scale, { toValue: 1.12, duration: 180, useNativeDriver: false }).start();
    timingRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
    timingRef.current.start(({ finished }) => {
      if (finished) complete();
    });
  }, [complete, confirmed, disabled, progress, scale]);

  const cancelHold = useCallback(() => {
    if (!holding) return;
    timingRef.current?.stop();
    reset();
  }, [holding, reset]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });

  const clockOpacity = morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const clockTransform = morph.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const checkOpacity = morph;
  const checkDashoffset = morph.interpolate({
    inputRange: [0, 1],
    outputRange: [CHECK_PATH_LENGTH, 0],
  });
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.1] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { alignItems: 'center', gap: 10 },
        dial: { width: DIAL_SIZE, height: DIAL_SIZE, alignItems: 'center', justifyContent: 'center' },
        core: {
          position: 'absolute',
          width: CORE_SIZE,
          height: CORE_SIZE,
          borderRadius: CORE_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: holding ? colors.blush : confirmed ? colors.ink : colors.card,
          borderWidth: 1,
          borderColor: holding || confirmed ? colors.blush : colors.border,
        },
        iconLayer: { position: 'absolute' },
        ripple: {
          position: 'absolute',
          width: DIAL_SIZE - 8,
          height: DIAL_SIZE - 8,
          borderRadius: (DIAL_SIZE - 8) / 2,
          borderWidth: 2,
          borderColor: colors.blush,
        },
        caption: {
          ...typography.alarmSub,
          fontSize: 13,
          color: colors.subtext,
        },
      }),
    [colors, confirmed, holding],
  );

  const iconColor = holding || confirmed ? colors.white : colors.text;
  const caption = confirmed ? `Snoozing ${minutes} minutes…` : holding ? 'Keep holding…' : 'Hold to snooze';

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        onPressIn={startHold}
        onPressOut={cancelHold}
        disabled={disabled || confirmed}
        accessibilityRole="button"
        accessibilityLabel={`Snooze ${minutes} minutes`}
        accessibilityHint="Press and hold to snooze the alarm"
        accessibilityActions={[{ name: 'activate', label: 'Snooze' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'activate' && !disabled && !confirmed) {
            complete();
          }
        }}
      >
        <Animated.View style={[styles.dial, { transform: [{ scale }] }]}>
          <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
            <Defs>
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={colors.peach} />
                <Stop offset="50%" stopColor={colors.blush} />
                <Stop offset="100%" stopColor={colors.lavender} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={DIAL_SIZE / 2}
              cy={DIAL_SIZE / 2}
              r={RING_RADIUS}
              stroke={colors.border}
              strokeWidth={3}
              fill="none"
            />
            <AnimatedCircle
              cx={DIAL_SIZE / 2}
              cy={DIAL_SIZE / 2}
              r={RING_RADIUS}
              stroke={`url(#${gradientId})`}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              origin={`${DIAL_SIZE / 2}, ${DIAL_SIZE / 2}`}
            />
          </Svg>

          <Animated.View
            style={[
              styles.ripple,
              { opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
            ]}
            pointerEvents="none"
          />

          <View style={styles.core}>
            <Animated.View
              style={[styles.iconLayer, { opacity: clockOpacity, transform: [{ scale: clockTransform.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) }, { rotate: clockTransform.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '35deg'] }) }] }]}
            >
              <ClockIcon size={ICON_SIZE} color={iconColor} weight="regular" />
            </Animated.View>
            <Animated.View style={[styles.iconLayer, { opacity: checkOpacity }]}>
              <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
                <AnimatedPath
                  d="M20 6 9 17l-5-5"
                  fill="none"
                  stroke={colors.white}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={CHECK_PATH_LENGTH}
                  strokeDashoffset={checkDashoffset}
                />
              </Svg>
            </Animated.View>
          </View>
        </Animated.View>
      </Pressable>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}
