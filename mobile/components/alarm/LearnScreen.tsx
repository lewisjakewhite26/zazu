import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { stopAlarmSound } from '../../../lib/alarm-sound';

function IntroEtymology({ word }: { word: NonNullable<ReturnType<typeof useAlarmFlow>['sessionWord']> }) {
  const { colors } = useTheme();
  const spans = word.introEtymology?.spans;

  if (!spans?.length) {
    return (
      <Text style={[styles.etymText, { color: colors.subtext }]}>
        {word.origin.replace(/<[^>]+>/g, '')}
      </Text>
    );
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

  if (!sessionWord) return null;

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <Text style={[styles.eyebrow, { color: colors.subtext }]}>{copy.learn.eyebrow}</Text>
            <Text style={[styles.word, { color: colors.text }]}>{sessionWord.word}</Text>
            <Text style={[styles.pron, { color: colors.subtext }]}>
              {sessionWord.pronunciation} · {sessionWord.pos}
            </Text>

            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.def, { color: colors.text }]}>{sessionWord.definition}</Text>
            </View>

            <View style={[styles.etymBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.etymLabel, { color: colors.subtext }]}>{copy.learn.etymology}</Text>
              <IntroEtymology word={sessionWord} />
            </View>

            <PrimaryButton
              label={copy.learn.continue}
              onPress={() => router.push('/morning-task')}
              style={styles.cta}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },
  inner: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  word: {
    fontFamily: fonts.serif,
    fontSize: 42,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  pron: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  def: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  etymBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  etymLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  etymText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  etymStrong: {
    fontFamily: fonts.sansSemiBold,
  },
  cta: {
    marginTop: spacing.sm,
  },
});
