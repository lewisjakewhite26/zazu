import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedToggle } from '@/components/ui/AnimatedToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { Alarm } from '@/types/home';

export type AlarmCardProps = {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
};

export function AlarmCard({ alarm, onToggle }: AlarmCardProps) {
  const { colors } = useTheme();
  const { id, time, label, enabled } = alarm;

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
        },
        info: {
          flex: 1,
          paddingRight: spacing.md,
        },
        time: {
          ...typography.alarmTime,
          color: colors.text,
        },
        meta: {
          ...typography.alarmMeta,
          color: colors.subtext,
          marginTop: 3,
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
        <Text style={styles.meta}>{label}</Text>
      </View>

      <AnimatedToggle
        value={enabled}
        onValueChange={(next) => onToggle(id, next)}
        accessibilityLabel={copy.a11y.alarmToggle(time, enabled)}
      />
    </GlassCard>
  );
}
