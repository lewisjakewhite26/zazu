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

import { typography } from '@/constants/theme';
import { MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

export type PrimaryButtonVariant = 'filled' | 'outline';
export type PrimaryButtonSize = 'primary' | 'demo';

export type PrimaryButtonProps = {
  label: string;
  onPress: PressableProps['onPress'];
  variant?: PrimaryButtonVariant;
  size?: PrimaryButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  size = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: '100%',
          minHeight: MIN_TOUCH_TARGET,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
        },
        filled: {
          backgroundColor: colors.primaryButtonBg,
          paddingVertical: 15,
          paddingHorizontal: spacing.lg,
        },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
          paddingVertical: 11,
          paddingHorizontal: 24,
        },
        pressed: {
          opacity: 0.85,
        },
        pressedOutline: {
          opacity: 0.7,
        },
        disabled: {
          opacity: 0.5,
        },
        label: {
          textAlign: 'center',
        },
        labelFilled: {
          ...typography.btnPrimary,
          color: colors.primaryButtonText,
        },
        labelOutline: {
          ...typography.btnDemo,
          color: colors.subtext,
        },
      }),
    [colors],
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
        pressed && !isDisabled && (isFilled ? styles.pressed : styles.pressedOutline),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFilled ? colors.primaryButtonText : colors.text} />
      ) : (
        <Text style={[styles.label, isFilled ? styles.labelFilled : styles.labelOutline]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
