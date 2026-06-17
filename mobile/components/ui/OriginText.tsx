import { useMemo } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { fonts, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type OriginTextProps = {
  origin: string;
  style?: StyleProp<TextStyle>;
};

/** index.html .wotd-origin — subtext body, <strong> in gold */
export function OriginText({ origin, style }: OriginTextProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          ...typography.wotdOrigin,
          color: colors.subtext,
        },
        strong: {
          color: colors.gold,
          fontFamily: fonts.sansSemiBold,
        },
      }),
    [colors.gold, colors.subtext],
  );

  const parts = origin.split(/(<\/?strong>)/gi);
  const nodes: React.ReactNode[] = [];
  let inStrong = false;

  parts.forEach((part, index) => {
    if (part.toLowerCase() === '<strong>') {
      inStrong = true;
      return;
    }
    if (part.toLowerCase() === '</strong>') {
      inStrong = false;
      return;
    }
    if (!part) return;
    nodes.push(
      <Text key={`${index}-${part.slice(0, 8)}`} style={inStrong ? styles.strong : undefined}>
        {part}
      </Text>,
    );
  });

  return <Text style={[styles.base, style]}>{nodes}</Text>;
}
