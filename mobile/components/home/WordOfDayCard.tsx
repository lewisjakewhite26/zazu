import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { OriginText } from '@/components/ui/OriginText';
import { copy } from '@/constants/copy';
import { cardBlurIntensity, radii, typography } from '@/constants/theme';
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
  const { colors, blend } = useTheme();
  const isNight = blend >= 0.5;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: '100%',
          borderRadius: radii.wotd,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: 20,
        },
        gradient: {
          ...StyleSheet.absoluteFillObject,
        },
        blur: {
          ...StyleSheet.absoluteFillObject,
        },
        cardInner: {
          paddingTop: 22,
          paddingHorizontal: 22,
          paddingBottom: 20,
        },
        eyebrow: {
          ...typography.wotdEyebrow,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginBottom: 8,
        },
        word: {
          ...typography.wordHero,
          color: colors.text,
          marginBottom: 4,
        },
        wordLoading: {
          opacity: 0.45,
        },
        pronunciation: {
          ...typography.wotdPron,
          color: colors.subtext,
          marginBottom: 8,
        },
        posBadge: {
          alignSelf: 'flex-start',
          backgroundColor: colors.posBadgeBg,
          borderRadius: radii.pill,
          paddingHorizontal: 8,
          paddingVertical: 3,
          marginBottom: 8,
        },
        posText: {
          ...typography.posBadge,
          textTransform: 'uppercase',
          color: colors.subtext,
        },
        definition: {
          ...typography.wotdDef,
          color: colors.text,
          marginBottom: 10,
        },
        dimmed: {
          opacity: 0.3,
        },
        cardLoading: {
          minHeight: 180,
        },
        loadingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
        },
        loadingText: {
          ...typography.wotdDef,
          color: colors.subtext,
        },
      }),
    [colors],
  );

  const cardBody = loading ? (
    <View style={[styles.cardInner, styles.cardLoading]} accessibilityRole="progressbar">
      <Text style={styles.eyebrow}>{copy.home.wordOfDayEyebrow}</Text>
      <Text style={[styles.word, styles.wordLoading]}>{copy.home.wordOfDayLoading}</Text>
      <View style={styles.loadingRow}>
        <ActivityIndicator color={colors.subtext} size="small" />
        <Text style={styles.loadingText}>{copy.home.wordOfDayLoading}</Text>
      </View>
    </View>
  ) : (
    <View
      style={styles.cardInner}
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
      <OriginText origin={origin} />
    </View>
  );

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[colors.wotdGradientStart, colors.wotdGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {Platform.OS !== 'web' ? (
        <BlurView intensity={cardBlurIntensity} tint={isNight ? 'dark' : 'light'} style={styles.blur} />
      ) : null}
      {cardBody}
    </View>
  );
}
