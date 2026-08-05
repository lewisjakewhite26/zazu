import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { MIN_TOUCH_TARGET } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

export type IconButtonVariant = 'plain' | 'card';

type IconButtonProps = {
  children: React.ReactNode;
  onPress: PressableProps['onPress'];
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

/** Icon-only button with a guaranteed 44x44 (MIN_TOUCH_TARGET) hit area, regardless of the icon's own visual size. */
export function IconButton({
  children,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  style,
  disabled,
}: IconButtonProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: MIN_TOUCH_TARGET,
          height: MIN_TOUCH_TARGET,
          alignItems: 'center',
          justifyContent: 'center',
        },
        card: {
          borderRadius: MIN_TOUCH_TARGET / 2,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
      }),
    [colors],
  );

  return (
    <Pressable
      style={[styles.base, variant === 'card' && styles.card, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}
