import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useAlarmSound } from '@/hooks/useAlarmSound';

function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function AlarmScreen() {
  const router = useRouter();
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

  if (!sessionWord) return null;

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <View style={styles.glow} />

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
            onPress={() => router.push('/learn')}
            style={styles.cta}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  orbOne: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.peach,
    opacity: 0.45,
    top: -60,
    left: -80,
  },
  orbTwo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.lavender,
    opacity: 0.4,
    bottom: -40,
    right: -60,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(249,201,168,0.12)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  bird: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  time: {
    fontFamily: fonts.serif,
    fontSize: 96,
    letterSpacing: -4,
    color: colors.text,
    lineHeight: 96,
    marginBottom: spacing.sm,
  },
  wordTease: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  wordEmphasis: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.subtext,
    marginBottom: spacing.xl,
  },
  cta: {
    maxWidth: 320,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
});
