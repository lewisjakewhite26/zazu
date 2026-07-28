import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';

/** index.html #screenAd — shown after Word Gym puzzle */
export function AdScreen() {
  const router = useRouter();
  const { colors, blend } = useTheme();
  const { gymSessionWord, gymCompletionResult } = useAlarmFlow();
  const isNight = blend >= 0.5;

  useEffect(() => {
    if (!gymSessionWord || !gymCompletionResult) {
      router.replace('/(tabs)/gym');
    }
  }, [gymSessionWord, gymCompletionResult, router]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        inner: {
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.lg,
        },
        eyebrow: {
          ...typography.eyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
        },
        card: {
          width: '100%',
          maxWidth: 320,
        },
        cardInner: {
          paddingHorizontal: 22,
          paddingVertical: 26,
        },
        pill: {
          alignSelf: 'flex-start',
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          backgroundColor: isNight ? colors.adPillBgNight : colors.adPillBg,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: radii.pill,
          marginBottom: spacing.md,
          overflow: 'hidden',
        },
        brand: {
          ...typography.adBrand,
          color: colors.text,
          marginBottom: spacing.xs,
        },
        body: {
          ...typography.adCopy,
          color: colors.subtext,
          marginBottom: spacing.md,
        },
        skip: {
          padding: spacing.sm,
        },
        skipText: {
          fontFamily: typography.btnDemo.fontFamily,
          fontSize: 13,
          color: colors.subtext,
        },
      }),
    [colors, isNight],
  );

  if (!gymSessionWord || !gymCompletionResult) return null;

  const handleSkip = () => {
    router.replace('/gym-success');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          <Text style={styles.eyebrow}>{copy.ad.eyebrow}</Text>

          <GlassCard borderRadius={24} style={styles.card} contentStyle={styles.cardInner}>
            <Text style={styles.pill}>{copy.ad.pill}</Text>
            <Text style={styles.brand}>{copy.ad.brand}</Text>
            <Text style={styles.body}>{copy.ad.copy}</Text>
            <PrimaryButton label={copy.ad.cta} variant="wake" onPress={handleSkip} />
          </GlassCard>

          <Pressable style={styles.skip} onPress={handleSkip} accessibilityRole="button">
            <Text style={styles.skipText}>{copy.ad.skip}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
