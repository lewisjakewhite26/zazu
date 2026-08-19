import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { copy } from '@/constants/copy';
import { cardBlurIntensity, fonts, radii, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { WordOfDay } from '@/types/home';

export type WordOfDayCardProps = WordOfDay & {
  loading?: boolean;
};

export function WordOfDayCard({ word, definition, loading = false }: WordOfDayCardProps) {
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
          ...StyleSheet.absoluteFill,
        },
        blur: {
          ...StyleSheet.absoluteFill,
        },
        cardInner: {
          paddingVertical: 22,
          paddingHorizontal: 22,
        },
        eyebrow: {
          ...typography.wotdEyebrow,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginBottom: 8,
        },
        word: {
          fontFamily: fonts.serif,
          fontSize: 42,
          letterSpacing: -0.84,
          color: colors.text,
        },
        wordLoading: {
          opacity: 0.45,
        },
        cardLoading: {
          minHeight: 100,
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
        <LoadingSpinner size={16} />
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
