import { useMemo } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { WordOfDay } from '@/types/home';

export type WordOfDayCardProps = WordOfDay & {
  loading?: boolean;
};

export function WordOfDayCard({
  word,
  pronunciation,
  pos,
  definition,
  origin,
  loading = false,
}: WordOfDayCardProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: 'rgba(249,201,168,0.35)',
          padding: spacing.lg,
          marginBottom: spacing.lg,
        },
        eyebrow: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginBottom: spacing.sm,
        },
        word: {
          fontFamily: fonts.serif,
          fontSize: 32,
          color: colors.text,
          letterSpacing: -0.5,
          marginBottom: spacing.xs,
        },
        pronunciation: {
          fontFamily: fonts.sans,
          fontSize: 13,
          fontStyle: 'italic',
          color: colors.subtext,
          marginBottom: spacing.sm,
        },
        posBadge: {
          alignSelf: 'flex-start',
          backgroundColor: colors.border,
          borderRadius: 999,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
          marginBottom: spacing.sm,
        },
        posText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.subtext,
        },
        definition: {
          fontFamily: fonts.sans,
          fontSize: 15,
          lineHeight: 23,
          color: colors.text,
          marginBottom: spacing.sm,
        },
        origin: {
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 18,
          color: colors.subtext,
        },
        cardLoading: {
          minHeight: 180,
          justifyContent: 'flex-start',
        },
        loadingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginTop: spacing.md,
        },
        loadingText: {
          fontFamily: fonts.sans,
          fontSize: 15,
          color: colors.subtext,
        },
      }),
    [colors],
  );

  if (loading) {
    return (
      <View style={[styles.card, styles.cardLoading]} accessibilityRole="progressbar">
        <Text style={styles.eyebrow}>{copy.home.wordOfDayEyebrow}</Text>
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.subtext} size="small" />
          <Text style={styles.loadingText}>{copy.home.wordOfDayLoading}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={copy.a11y.wordOfDay(word, definition)}
    >
      <Text style={styles.eyebrow}>{copy.home.wordOfDayEyebrow}</Text>
      <Text style={styles.word}>{word}</Text>
      <Text style={styles.pronunciation}>{pronunciation}</Text>
      <View style={styles.posBadge}>
        <Text style={styles.posText}>{pos}</Text>
      </View>
      <Text style={styles.definition}>{definition}</Text>
      <Text style={styles.origin}>{stripOriginTags(origin)}</Text>
    </View>
  );
}

function stripOriginTags(origin: string): string {
  return origin.replace(/<\/?strong>/g, '');
}
