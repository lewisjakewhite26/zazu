import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fonts } from '@/constants/theme';
import { MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

export type PrimaryButtonVariant = 'filled' | 'outline';

export type PrimaryButtonProps = {
  label: string;
  onPress: PressableProps['onPress'];
  variant?: PrimaryButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const { colors, blend } = useTheme();
  const labelOnInk = blend >= 0.5 ? '#2c1f2e' : colors.white;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: '100%',
          minHeight: MIN_TOUCH_TARGET,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
        },
        filled: {
          backgroundColor: colors.ink,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        pressed: {
          opacity: 0.85,
        },
        disabled: {
          opacity: 0.5,
        },
        label: {
          fontFamily: fonts.sansMedium,
          fontSize: 16,
          textAlign: 'center',
        },
        labelFilled: {
          color: labelOnInk,
        },
        labelOutline: {
          color: colors.subtext,
        },
      }),
    [colors, labelOnInk],
  );

  const isFilled = variant === 'filled';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isFilled ? styles.filled : styles.outline,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? labelOnInk : colors.text} />
      ) : (
        <Text style={[styles.label, isFilled ? styles.labelFilled : styles.labelOutline]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
