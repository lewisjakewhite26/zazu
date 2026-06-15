import { Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import type { Alarm } from '@/types/home';

export type AlarmCardProps = {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
};

export function AlarmCard({ alarm, onToggle }: AlarmCardProps) {
  const { id, time, label, enabled } = alarm;

  return (
    <View style={[styles.card, !enabled && styles.cardOff]}>
      <View style={styles.info}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.meta}>{label}</Text>
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={copy.a11y.alarmToggle(time, enabled)}
        accessibilityState={{ checked: enabled }}
        hitSlop={8}
        onPress={() => onToggle(id, !enabled)}
        style={({ pressed }) => [
          styles.toggle,
          enabled ? styles.toggleOn : styles.toggleOff,
          pressed && styles.togglePressed,
        ]}
      >
        <View style={[styles.thumb, enabled && styles.thumbOn]} />
      </Pressable>
    </View>
  );
}

const TRACK_WIDTH = 44;
const THUMB_SIZE = 20;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  cardOff: {
    opacity: 0.38,
  },
  info: {
    flex: 1,
    paddingRight: spacing.md,
  },
  time: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -1,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.subtext,
    marginTop: 3,
  },
  toggle: {
    width: TRACK_WIDTH,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    borderRadius: 999,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: colors.blush,
  },
  toggleOff: {
    backgroundColor: colors.border,
  },
  togglePressed: {
    opacity: 0.85,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    transform: [{ translateX: 0 }],
  },
  thumbOn: {
    transform: [{ translateX: TRACK_WIDTH - THUMB_SIZE - 6 }],
  },
});
