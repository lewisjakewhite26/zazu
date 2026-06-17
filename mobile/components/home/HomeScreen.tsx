import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/HomeHeader';
import { WordOfDayCard } from '@/components/home/WordOfDayCard';
import { AlarmCard } from '@/components/home/AlarmCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ProgressDebugPanel } from '@/components/home/ProgressDebugPanel';
import { copy } from '@/constants/copy';
import { typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { useProgress } from '@/hooks/useProgress';
import { useAlarms, type Alarm } from '@/hooks/useAlarms';
import { useAlarmFlow } from '@/context/AlarmFlowContext';

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, blend, toggleOverride } = useTheme();
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

  const themeToggleLabel =
    blend >= 0.5 ? copy.home.switchToLightMode : copy.home.switchToDarkMode;

  return (
    <GradientBackground>
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

            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>
              {copy.home.yourAlarms}
            </Text>

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

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <PrimaryButton label={copy.home.addAlarm} onPress={handleAddAlarm} style={styles.addAlarmBtn} />
            <PrimaryButton
              label={copy.home.tryTheAlarm}
              variant="outline"
              size="demo"
              onPress={handleDemoAlarm}
            />
            <PrimaryButton
              label={themeToggleLabel}
              variant="outline"
              size="demo"
              onPress={toggleOverride}
              style={styles.themeBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
    ...typography.sectionLabel,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  alarmList: {
    width: '100%',
    gap: 10,
    marginBottom: 18,
  },
  footer: {
    width: '100%',
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  addAlarmBtn: {
    marginBottom: 4,
  },
  themeBtn: {
    marginTop: 0,
  },
});
