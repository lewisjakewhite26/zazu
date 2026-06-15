import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { WordOfDayCard } from '@/components/home/WordOfDayCard';
import { AlarmCard } from '@/components/home/AlarmCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import type { Alarm, HomeStats, WordOfDay } from '@/types/home';

const PLACEHOLDER_WORD: WordOfDay = {
  word: 'Matutinal',
  pronunciation: 'mat·yoo·TY·nl',
  pos: 'adjective',
  definition: 'Of, relating to, or occurring in the morning.',
  origin: copy.placeholder.matutinalOrigin,
};

const INITIAL_ALARMS: Alarm[] = [
  { id: '1', time: '07:30', label: copy.home.weekdaysPack, enabled: true },
  { id: '2', time: '09:00', label: copy.home.weekendsPack, enabled: false },
];

const INITIAL_STATS: HomeStats = {
  streak: 7,
  coins: 340,
};

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [alarms, setAlarms] = useState<Alarm[]>(INITIAL_ALARMS);

  const handleToggleAlarm = useCallback((id: string, enabled: boolean) => {
    setAlarms((current) =>
      current.map((alarm) => (alarm.id === id ? { ...alarm, enabled } : alarm)),
    );
  }, []);

  const handleAddAlarm = useCallback(() => {
    // Navigation to add-alarm flow will be wired in a later step.
  }, []);

  const handleDemoAlarm = useCallback(() => {
    // Navigation to alarm demo flow will be wired in a later step.
  }, []);

  return (
    <LinearGradient
      colors={[colors.bgFrom, colors.bgMid, colors.bgTo]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.inner}>
          <HomeHeader streak={INITIAL_STATS.streak} coins={INITIAL_STATS.coins} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <WordOfDayCard {...PLACEHOLDER_WORD} />

            <Text style={styles.sectionLabel}>{copy.home.yourAlarms}</Text>

            <View style={styles.alarmList}>
              {alarms.map((alarm) => (
                <AlarmCard key={alarm.id} alarm={alarm} onToggle={handleToggleAlarm} />
              ))}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
            <PrimaryButton label={copy.home.addAlarm} onPress={handleAddAlarm} />
            <PrimaryButton
              label={copy.home.tryTheAlarm}
              variant="outline"
              onPress={handleDemoAlarm}
              style={styles.secondaryButton}
            />
          </View>
        </View>
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
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    width: '100%',
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginBottom: spacing.sm,
  },
  alarmList: {
    width: '100%',
    gap: spacing.sm,
  },
  footer: {
    width: '100%',
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: 'transparent',
  },
  secondaryButton: {
    marginTop: 0,
  },
});
