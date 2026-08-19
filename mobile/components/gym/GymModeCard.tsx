import { useMemo, type ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LockIcon, CaretRightIcon, type IconProps } from 'phosphor-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { fonts, radii } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

type GymModeCardProps = {
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  badgeLabel?: string;
  locked?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function GymModeCard({
  title,
  description,
  icon: Icon,
  badgeLabel,
  locked = false,
  disabled = false,
  onPress,
}: GymModeCardProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          marginBottom: spacing.md,
        },
        inner: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          gap: spacing.md,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.cardLavender,
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: {
          flex: 1,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
        },
        title: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 15,
          color: colors.text,
        },
        description: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 18,
          color: colors.subtext,
        },
        badge: {
          backgroundColor: colors.blush,
          borderRadius: radii.pill,
          paddingHorizontal: 8,
          paddingVertical: 2,
        },
        badgeText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          color: colors.ink,
        },
        pressable: {
          opacity: locked || disabled ? 0.85 : 1,
        },
      }),
    [colors, locked, disabled],
  );

  const accessibilityLabel = [title, description, badgeLabel].filter(Boolean).join('. ');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: locked || disabled }}
    >
      <GlassCard borderRadius={radii.alarmCard} style={styles.card} contentStyle={styles.inner}>
        <View style={styles.iconWrap}>
          {locked ? (
            <LockIcon size={22} color={colors.ink} />
          ) : (
            <Icon size={22} color={colors.ink} />
          )}
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badgeLabel ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
        <CaretRightIcon size={22} color={colors.subtext} />
      </GlassCard>
    </Pressable>
  );
}
