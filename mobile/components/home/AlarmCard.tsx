import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MoonIcon, SunIcon, TrashIcon } from 'phosphor-react-native';

import { AnimatedToggle } from '@/components/ui/AnimatedToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { IconButton } from '@/components/ui/IconButton';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { Alarm } from '@/types/home';

export type AlarmCardProps = {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string, time: string) => void;
};

export function AlarmCard({ alarm, onToggle, onDelete }: AlarmCardProps) {
  const { colors } = useTheme();
  const { id, time, label, enabled } = alarm;
  const hour = Number.parseInt(time.slice(0, 2), 10);
  const isDaytime = hour >= 5 && hour < 18;
  const TimeOfDayIcon = isDaytime ? SunIcon : MoonIcon;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
        },
        cardOff: {
          opacity: 0.38,
        },
        cardInner: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 15,
          paddingHorizontal: 18,
          gap: spacing.sm,
        },
        info: {
          flex: 1,
          paddingRight: spacing.md,
        },
        time: {
          ...typography.alarmTime,
          color: colors.text,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          marginTop: 3,
        },
        meta: {
          ...typography.alarmMeta,
          color: colors.subtext,
        },
        actions: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        },
      }),
    [colors],
  );

  return (
    <GlassCard
      borderRadius={radii.alarmCard}
      style={[styles.card, !enabled && styles.cardOff]}
      contentStyle={styles.cardInner}
    >
      <View style={styles.info}>
        <Text style={styles.time}>{time}</Text>
        <View style={styles.metaRow}>
          <TimeOfDayIcon size={13} color={colors.subtext} />
          <Text style={styles.meta}>{label}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AnimatedToggle
          value={enabled}
          onValueChange={(next) => onToggle(id, next)}
          accessibilityLabel={copy.a11y.alarmToggle(time, enabled)}
        />
        <IconButton
          onPress={() => onDelete(id, time)}
          accessibilityLabel={copy.a11y.deleteAlarm(time)}
        >
          <TrashIcon size={18} color={colors.subtext} />
        </IconButton>
      </View>
    </GlassCard>
  );
}
