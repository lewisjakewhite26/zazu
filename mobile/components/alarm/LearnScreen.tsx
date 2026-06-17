import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { OriginText } from '@/components/ui/OriginText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts, radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { stopAlarmSound } from '../../../lib/alarm-sound';

function IntroEtymology({ word }: { word: NonNullable<ReturnType<typeof useAlarmFlow>['sessionWord']> }) {
  const { colors } = useTheme();
  const spans = word.introEtymology?.spans;

  if (!spans?.length) {
    return <OriginText origin={word.origin} />;
  }

  return (
    <Text style={[styles.etymText, { color: colors.subtext }]}>
      {spans.map((span, index) => (
        <Text
          key={`${span.text}-${index}`}
          style={span.highlight ? [styles.etymStrong, { color: colors.text }] : undefined}
        >
          {span.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  etymText: {
    ...typography.etymBody,
  },
  etymStrong: {
    fontFamily: fonts.sansSemiBold,
  },
});

export function LearnScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord } = useAlarmFlow();

  useEffect(() => {
    if (!sessionWord) {
      router.replace('/');
      return;
    }
    void stopAlarmSound();
  }, [sessionWord, router]);

  const screenStyles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
          paddingVertical: 28,
        },
        inner: {
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          paddingHorizontal: spacing.lg,
        },
        eyebrow: {
          ...typography.eyebrow,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 10,
        },
        word: {
          ...typography.learnWord,
          color: colors.text,
          marginBottom: 6,
        },
        pron: {
          ...typography.learnPron,
          color: colors.subtext,
          marginBottom: 20,
        },
        cardContent: {
          paddingHorizontal: 20,
          paddingVertical: 18,
        },
        etymContent: {
          paddingHorizontal: 20,
          paddingVertical: 18,
          marginBottom: spacing.xl,
        },
        def: {
          ...typography.learnDef,
          color: colors.text,
        },
        etymLabel: {
          ...typography.etymLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 8,
        },
        cta: {
          marginTop: spacing.md,
        },
        wordLoadingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        },
        wordLoadingText: {
          ...typography.learnWord,
          fontSize: 32,
          color: colors.subtext,
          opacity: 0.45,
        },
      }),
    [colors],
  );

  if (!sessionWord) return null;

  const wordReady = Boolean(sessionWord.word?.trim());

  return (
    <GradientBackground>
      <SafeAreaView style={screenStyles.safeArea}>
        <ScrollView contentContainerStyle={screenStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={screenStyles.inner}>
            <Text style={screenStyles.eyebrow}>{copy.learn.eyebrow}</Text>
            {wordReady ? (
              <>
                <Text style={screenStyles.word}>{sessionWord.word}</Text>
                <Text style={screenStyles.pron}>
                  {sessionWord.pronunciation} · {sessionWord.pos}
                </Text>
              </>
            ) : (
              <View style={screenStyles.wordLoadingRow} accessibilityRole="progressbar">
                <LoadingSpinner size={20} />
                <Text style={screenStyles.wordLoadingText}>{copy.home.wordOfDayLoading}</Text>
              </View>
            )}

            <GlassCard borderRadius={radii.alarmCard} style={{ marginBottom: 14 }} contentStyle={screenStyles.cardContent}>
              <Text style={screenStyles.def}>{sessionWord.definition}</Text>
            </GlassCard>

            <GlassCard borderRadius={radii.alarmCard} contentStyle={screenStyles.etymContent}>
              <Text style={screenStyles.etymLabel}>{copy.learn.etymology}</Text>
              <IntroEtymology word={sessionWord} />
            </GlassCard>

            <PrimaryButton
              label={copy.learn.continue}
              variant="wake"
              onPress={() => router.push('/morning-task')}
              style={screenStyles.cta}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
