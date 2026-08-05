import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const COLUMN_WIDTH = 64;
const SCROLL_SETTLE_MS = 120;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

type WheelColumnProps = {
  values: number[];
  selected: number;
  onChange: (value: number) => void;
  textColor: string;
};

function WheelColumn({ values, selected, onChange, textColor }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialIndex = values.indexOf(selected);

  useEffect(() => {
    // Set initial scroll position after mount (contentOffset isn't reliable on web).
    scrollRef.current?.scrollTo({ y: initialIndex * ITEM_HEIGHT, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  const snapToIndex = (index: number, animated: boolean) => {
    const clamped = Math.max(0, Math.min(values.length - 1, index));
    scrollRef.current?.scrollTo?.({ y: clamped * ITEM_HEIGHT, animated });
    onChange(values[clamped]);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        if (settleTimer.current) clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(() => {
          snapToIndex(Math.round(y / ITEM_HEIGHT), true);
        }, SCROLL_SETTLE_MS);
      },
    },
  );

  return (
    <View style={styles.column}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2 }}
      >
        {values.map((value, index) => {
          const inputRange = [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
          ];
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.25, 0.5, 1, 0.5, 0.25],
            extrapolate: 'clamp',
          });
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.82, 0.92, 1.15, 0.92, 0.82],
            extrapolate: 'clamp',
          });
          return (
            <Pressable key={value} onPress={() => snapToIndex(index, true)} style={styles.item}>
              <Animated.Text style={[styles.itemText, { color: textColor, opacity, transform: [{ scale }] }]}>
                {pad2(value)}
              </Animated.Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

export type TimeWheelPickerProps = {
  hour: number;
  minute: number;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function TimeWheelPicker({ hour, minute, onChangeHour, onChangeMinute, style }: TimeWheelPickerProps) {
  const { colors } = useTheme();

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor: colors.card, borderColor: colors.border }, style],
    [colors, style],
  );

  const highlightStyle = useMemo(
    () => [styles.highlight, { backgroundColor: colors.overlay, borderColor: colors.border }],
    [colors],
  );

  return (
    <View style={containerStyle}>
      <View pointerEvents="none" style={highlightStyle} />
      <WheelColumn values={HOURS} selected={hour} onChange={onChangeHour} textColor={colors.text} />
      <Text style={[styles.colon, { color: colors.text }]}>:</Text>
      <WheelColumn values={MINUTES} selected={minute} onChange={onChangeMinute} textColor={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: WHEEL_HEIGHT,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderWidth: 1,
  },
  column: {
    width: COLUMN_WIDTH,
    height: WHEEL_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 26,
    fontWeight: '600',
  },
  colon: {
    fontSize: 26,
    fontWeight: '600',
    marginHorizontal: 4,
  },
});
