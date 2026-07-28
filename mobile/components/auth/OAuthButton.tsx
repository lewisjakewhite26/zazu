import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { fonts } from '@/constants/theme';
import { MIN_TOUCH_TARGET, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

export type OAuthProvider = 'apple' | 'google';

type OAuthButtonProps = {
  provider: OAuthProvider;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OAuthButton({
  provider,
  onPress,
  disabled = false,
  loading = false,
  style,
}: OAuthButtonProps) {
  const { colors } = useTheme();
  const isApple = provider === 'apple';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: '100%',
          minHeight: MIN_TOUCH_TARGET,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
        },
        apple: {
          backgroundColor: colors.appleButtonBg,
        },
        google: {
          backgroundColor: colors.white,
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        pressed: {
          opacity: 0.88,
        },
        disabled: {
          opacity: 0.5,
        },
        label: {
          fontFamily: fonts.sansMedium,
          fontSize: 16,
        },
        appleLabel: {
          color: colors.appleButtonText,
        },
        googleLabel: {
          color: colors.text,
        },
      }),
    [colors],
  );

  const isDisabled = disabled || loading;
  const label = isApple ? 'Continue with Apple' : 'Continue with Google';
  const iconName = isApple ? 'apple' : 'google';
  const iconColor = isApple ? colors.appleButtonText : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isApple ? styles.apple : styles.google,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
          <Text style={[styles.label, isApple ? styles.appleLabel : styles.googleLabel]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
