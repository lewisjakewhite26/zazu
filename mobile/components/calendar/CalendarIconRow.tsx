import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { colors, fonts } from '@/constants/theme';
import { copy } from '@/constants/copy';
import { formatDismissTime } from '../../../lib/calendar-utils';

type GymDisplay = 'done' | 'skipped' | 'gold' | 'pending';

type CalendarIconRowProps = {
  completed: boolean;
  dismissSeconds: number | null;
  gymDisplay: GymDisplay;
  layout?: 'hero' | 'card';
};

function gymIconName(display: GymDisplay): keyof typeof MaterialCommunityIcons.glyphMap {
  if (display === 'gold') return 'lock';
  return 'dumbbell';
}

function gymLabel(display: GymDisplay): string {
  if (display === 'gold') return copy.calendar.gold;
  if (display === 'skipped') return copy.calendar.skipped;
  return copy.calendar.gym;
}

export function CalendarIconRow({
  completed,
  dismissSeconds,
  gymDisplay,
  layout = 'card',
}: CalendarIconRowProps) {
  const iconSize = layout === 'hero' ? 16 : 14;
  const labelStyle = layout === 'hero' ? styles.heroLabel : styles.cardLabel;
  const containerStyle = layout === 'hero' ? styles.heroRow : styles.cardRow;

  return (
    <View style={containerStyle}>
      <View style={styles.iconItem}>
        <MaterialCommunityIcons
          name={completed ? 'check' : 'minus'}
          size={iconSize}
          color={completed ? colors.correctIcon : colors.lavender}
        />
        <Text style={labelStyle}>{completed ? copy.calendar.done : copy.calendar.notCompleted}</Text>
      </View>
      <View style={styles.iconItem}>
        <MaterialCommunityIcons name="clock-outline" size={iconSize} color={colors.lavender} />
        <Text style={labelStyle}>{formatDismissTime(dismissSeconds)}</Text>
      </View>
      <View style={styles.iconItem}>
        <MaterialCommunityIcons
          name={gymIconName(gymDisplay)}
          size={iconSize}
          color={gymDisplay === 'done' ? colors.correctIcon : colors.lavender}
        />
        <Text style={labelStyle}>{gymLabel(gymDisplay)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  iconItem: {
    alignItems: 'center',
    gap: 2,
  },
  heroLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: colors.subtext,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  cardLabel: {
    fontFamily: fonts.sans,
    fontSize: 9,
    color: colors.subtext,
    textTransform: 'lowercase',
  },
});

export function resolveGymDisplay(
  isGold: boolean,
  gymCompleted: boolean,
  completed: boolean,
): GymDisplay {
  if (!isGold) return 'gold';
  if (!completed) return 'pending';
  return gymCompleted ? 'done' : 'skipped';
}
