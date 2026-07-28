import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmOrbs } from '@/components/ui/AlarmOrbs';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarmSound } from '@/hooks/useAlarmSound';

function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AlarmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { sessionWord } = useAlarmFlow();
  const [clock, setClock] = useState(formatClock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setClock(formatClock(new Date())), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sessionWord) {
      router.replace('/');
    }
  }, [sessionWord, router]);

  useAlarmSound(Boolean(sessionWord));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        content: {
          flex: 1,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
        },
        bird: {
          fontSize: 48,
          marginBottom: spacing.md,
          zIndex: 1,
        },
        label: {
          ...typography.alarmLabel,
          color: colors.subtext,
          textTransform: 'uppercase',
          marginBottom: 10,
          zIndex: 1,
        },
        time: {
          ...typography.alarmBigTime,
          color: colors.text,
          marginBottom: spacing.sm,
          zIndex: 1,
        },
        wordTease: {
          ...typography.alarmTease,
          color: colors.subtext,
          marginBottom: 6,
          zIndex: 1,
        },
        wordEmphasis: {
          fontFamily: typography.learnWord.fontFamily,
          fontStyle: 'italic',
          color: colors.text,
        },
        sub: {
          ...typography.alarmSub,
          color: colors.subtext,
          marginBottom: 44,
          zIndex: 1,
        },
        cta: {
          maxWidth: 320,
          zIndex: 1,
        },
      }),
    [colors],
  );

  if (!sessionWord) return null;

  return (
    <GradientBackground>
      <AlarmOrbs />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.bird}>🐦</Text>
          <Text style={styles.label}>{copy.alarm.goodMorning}</Text>
          <Text style={styles.time}>{clock}</Text>
          <Text style={styles.wordTease}>
            {copy.alarm.todaysWord}{' '}
            <Text style={styles.wordEmphasis}>{sessionWord.word}</Text>
          </Text>
          <Text style={styles.sub}>{copy.alarm.learnSub}</Text>
          <PrimaryButton
            label={copy.alarm.wakeCta}
            variant="wake"
            onPress={() => router.push('/learn')}
            style={styles.cta}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
