import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { WordOfDayCard } from '@/components/home/WordOfDayCard';
import { AlarmCard } from '@/components/home/AlarmCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { colors, fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { ProgressDebugPanel } from '@/components/home/ProgressDebugPanel';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { useProgress } from '@/hooks/useProgress';
import { useAlarms, type Alarm } from '@/hooks/useAlarms';
import { useAlarmFlow } from '@/context/AlarmFlowContext';

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startFlow } = useAlarmFlow();
  const { loading: alarmsLoading, alarms, toggleAlarm } = useAlarms();
  const {
    loading: progressLoading,
    streak,
    coins,
    learnedWordIds,
    completeWord,
    setLastCompletedDateDebug,
  } = useProgress();
  const { loading: wordsLoading, alarmWordOfDay } = useWordLibrary(learnedWordIds);

  const handleToggleAlarm = useCallback(
    (id: string, enabled: boolean) => {
      void toggleAlarm(id, enabled);
    },
    [toggleAlarm],
  );

  const handleAddAlarm = useCallback(() => {
    router.push('/add-alarm');
  }, [router]);

  const handleDemoAlarm = useCallback(() => {
    if (!alarmWordOfDay) return;
    startFlow(alarmWordOfDay);
    router.push('/alarm');
  }, [startFlow, alarmWordOfDay, router]);

  return (
    <LinearGradient
      colors={[colors.bgFrom, colors.bgMid, colors.bgTo]}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.inner}>
          <HomeHeader streak={streak} coins={coins} loading={progressLoading} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <WordOfDayCard {...alarmWordOfDay} loading={wordsLoading} />

            <Text style={styles.sectionLabel}>{copy.home.yourAlarms}</Text>

            <View style={styles.alarmList}>
              {!alarmsLoading &&
                alarms.map((alarm: Alarm) => (
                  <AlarmCard key={alarm.id} alarm={alarm} onToggle={handleToggleAlarm} />
                ))}
            </View>

            <ProgressDebugPanel
              wordId={alarmWordOfDay.id}
              streak={streak}
              onSetLastCompleted={setLastCompletedDateDebug}
              onCompleteWord={completeWord}
            />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
            <PrimaryButton label={copy.home.addAlarm} onPress={handleAddAlarm} />
            <PrimaryButton
              label={copy.calendar.title}
              variant="outline"
              onPress={() => router.push('/calendar')}
              style={styles.secondaryButton}
            />
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
