import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { CaretLeftIcon } from 'phosphor-react-native';

import { IconButton } from '@/components/ui/IconButton';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  titleStyle?: StyleProp<TextStyle>;
  onBack: () => void;
  backAccessibilityLabel?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Shared back-button + title row used across every screen with a back navigation. */
export function ScreenHeader({
  title,
  subtitle,
  titleStyle,
  onBack,
  backAccessibilityLabel = 'Go back',
  right,
  style,
}: ScreenHeaderProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        },
        left: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          flex: 1,
        },
        title: {
          fontFamily: fonts.sansMedium,
          fontSize: 17,
          color: colors.text,
        },
        subtitle: {
          fontFamily: fonts.sans,
          fontSize: 12,
          color: colors.subtext,
          marginTop: 2,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <IconButton onPress={onBack} accessibilityLabel={backAccessibilityLabel}>
          <CaretLeftIcon size={24} color={colors.text} />
        </IconButton>
        {title ? (
          <View>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
      </View>
      {right}
    </View>
  );
}
