import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { OriginText } from '@/components/ui/OriginText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme } from '@/context/ThemeContext';
import { hapticSuccess } from '../../../lib/feedback';

export function GymSuccessScreen() {
  const router = useRouter();
  const { colors, blend } = useTheme();
  const { gymSessionWord, gymCompletionResult, clearFlow } = useAlarmFlow();
  const isNight = blend >= 0.5;

  useEffect(() => {
    if (!gymSessionWord || !gymCompletionResult) {
      router.replace('/(tabs)/gym');
      return;
    }
    hapticSuccess();
  }, [gymSessionWord, gymCompletionResult, router]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        glow: {
          ...StyleSheet.absoluteFill,
          backgroundColor: 'rgba(200,180,232,0.18)',
        },
        safeArea: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingVertical: 40,
        },
        inner: {
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
        },
        icon: {
          marginBottom: spacing.md,
        },
        heading: {
          ...typography.successHeading,
          color: colors.text,
          marginBottom: 4,
          textAlign: 'center',
        },
        sub: {
          ...typography.successSub,
          color: colors.subtext,
          marginBottom: 24,
          textAlign: 'center',
        },
        wordCard: {
          width: '100%',
          maxWidth: 320,
          borderRadius: radii.wotd,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 22,
          paddingVertical: 20,
          marginBottom: 14,
          overflow: 'hidden',
        },
        wordCardLabel: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 8,
        },
        word: {
          fontFamily: fonts.serif,
          fontSize: 27,
          color: colors.text,
          letterSpacing: -0.54,
          marginBottom: 3,
        },
        pronunciation: {
          fontFamily: fonts.sans,
          fontSize: 12,
          fontStyle: 'italic',
          color: colors.subtext,
          marginBottom: 8,
        },
        definition: {
          fontFamily: fonts.sans,
          fontSize: 13,
          lineHeight: 20,
          color: colors.text,
          marginBottom: 8,
        },
        masteryBanner: {
          width: '100%',
          maxWidth: 320,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.cardLavenderBorder,
          paddingHorizontal: 16,
          paddingVertical: 11,
          marginBottom: 12,
          overflow: 'hidden',
        },
        masteryBannerLabel: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          color: colors.text,
        },
        masteryBannerValue: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          color: colors.lavender,
        },
        coinsCard: {
          width: '100%',
          maxWidth: 320,
          marginBottom: 18,
        },
        coinsContent: {
          paddingHorizontal: 20,
          paddingVertical: 16,
        },
        coinsTitle: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 10,
        },
        coinRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 5,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 10,
        },
        coinLabel: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.text,
        },
        coinAmount: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 13,
          color: colors.gold,
        },
        doneBtn: {
          maxWidth: 320,
        },
      }),
    [colors],
  );

  if (!gymSessionWord || !gymCompletionResult) {
    return null;
  }

  const { coinsEarned, gymMastery } = gymCompletionResult;

  const handleDone = () => {
    clearFlow();
    router.replace('/(tabs)/gym');
  };

  const wordGradient = isNight
    ? [colors.successWordGradientStartNight, colors.successWordGradientEndNight]
    : [colors.successWordGradientStart, colors.successWordGradientEnd];

  const masteryGradient = ['rgba(200,180,232,0.2)', 'rgba(200,180,232,0.28)'];

  return (
    <GradientBackground>
      <View style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <MaterialCommunityIcons
              name="dumbbell"
              size={48}
              color={colors.lavender}
              style={styles.icon}
            />
            <Text style={styles.heading}>{copy.gymSuccess.heading}</Text>
            <Text style={styles.sub}>{copy.gymSuccess.sub}</Text>

            <LinearGradient colors={wordGradient as [string, string]} style={styles.wordCard}>
              <Text style={styles.wordCardLabel}>{copy.gymSuccess.wordPractised}</Text>
              <Text style={styles.word}>{gymSessionWord.word}</Text>
              <Text style={styles.pronunciation}>{gymSessionWord.pronunciation}</Text>
              <Text style={styles.definition}>{gymSessionWord.definition}</Text>
              <OriginText origin={gymSessionWord.origin} />
            </LinearGradient>

            <LinearGradient colors={masteryGradient as [string, string]} style={styles.masteryBanner}>
              <Text style={styles.masteryBannerLabel}>{copy.gymSuccess.masteryLabel}</Text>
              <Text style={styles.masteryBannerValue}>
                {copy.gymSuccess.masteryPercent(gymMastery)}
              </Text>
            </LinearGradient>

            <GlassCard borderRadius={radii.alarmCard} style={styles.coinsCard} contentStyle={styles.coinsContent}>
              <Text style={styles.coinsTitle}>{copy.gymSuccess.coinsEarned}</Text>
              <View style={styles.coinRow}>
                <Text style={styles.coinLabel}>{copy.gymSuccess.gymCompleted}</Text>
                <Text style={styles.coinAmount}>+{coinsEarned} 🪙</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.coinLabel, { fontFamily: fonts.sansSemiBold }]}>
                  {copy.gymSuccess.total}
                </Text>
                <Text style={styles.coinAmount}>+{coinsEarned} 🪙</Text>
              </View>
            </GlassCard>

            <PrimaryButton label={copy.gymSuccess.done} variant="outline" onPress={handleDone} style={styles.doneBtn} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
