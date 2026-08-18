import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlarmPermissionBanner } from '@/components/home/AlarmPermissionBanner';
import { WordLibraryErrorBanner } from '@/components/home/WordLibraryErrorBanner';
import { HomeHeader } from '@/components/home/HomeHeader';
import { WordOfDayCard } from '@/components/home/WordOfDayCard';
import { AlarmCard } from '@/components/home/AlarmCard';
import { showAppAlert } from '@/components/ui/AppAlert';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { floatingTabBarClearance } from '@/components/ui/FloatingTabBar';
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
  const { colors } = useTheme();
  const { startFlow } = useAlarmFlow();
  const { loading: alarmsLoading, alarms, permissionStatus, toggleAlarm, deleteAlarm, addAlarm } = useAlarms();
  const {
    loading: progressLoading,
    streak,
    coins,
    completeWord,
    setLastCompletedDateDebug,
  } = useProgress();
  const {
    loading: wordsLoading,
    fetchFailed: wordsFetchFailed,
    retry: retryWordLibrary,
    retrying: wordsRetrying,
    alarmWordOfDay,
  } = useWordLibrary();

  const handleToggleAlarm = useCallback(
    (id: string, enabled: boolean) => {
      void toggleAlarm(id, enabled);
    },
    [toggleAlarm],
  );

  const handleDeleteAlarm = useCallback(
    (id: string, time: string) => {
      showAppAlert({
        title: copy.addAlarm.deleteTitle,
        message: copy.addAlarm.deleteMessage(time),
        buttons: [
          { text: copy.addAlarm.cancel, style: 'cancel' },
          {
            text: copy.addAlarm.deleteConfirm,
            style: 'destructive',
            onPress: () => void deleteAlarm(id),
          },
        ],
      });
    },
    [deleteAlarm],
  );

  const handleAddAlarm = useCallback(() => {
    router.push('/add-alarm');
  }, [router]);

  const handleDemoAlarm = useCallback(() => {
    if (!alarmWordOfDay) return;
    startFlow(alarmWordOfDay, { isDemo: true });
    router.push('/alarm');
  }, [startFlow, alarmWordOfDay, router]);

  // Schedules a real notification (not the JS-only demo above) 2 minutes
  // out, exercising the actual AlarmManager/lock-screen path -- avoids
  // hand-setting the time-wheel picker for every locked-phone test round.
  const handleQuickTestAlarm = useCallback(() => {
    const target = new Date(Date.now() + 2 * 60 * 1000);
    const time = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;
    void addAlarm(time, 'Quick test (+2 min)');
  }, [addAlarm]);

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
            <AlarmPermissionBanner status={permissionStatus} />

            {wordsFetchFailed ? (
              <WordLibraryErrorBanner onRetry={retryWordLibrary} retrying={wordsRetrying} />
            ) : null}

            <WordOfDayCard {...alarmWordOfDay} loading={wordsLoading} />

            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>
              {copy.home.yourAlarms}
            </Text>

            <View style={styles.alarmList}>
              {!alarmsLoading &&
                alarms.map((alarm: Alarm) => (
                  <AlarmCard
                    key={alarm.id}
                    alarm={alarm}
                    onToggle={handleToggleAlarm}
                    onDelete={handleDeleteAlarm}
                  />
                ))}
            </View>

            <ProgressDebugPanel
              wordId={alarmWordOfDay.id}
              streak={streak}
              onSetLastCompleted={setLastCompletedDateDebug}
              onCompleteWord={completeWord}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: floatingTabBarClearance(insets.bottom) },
            ]}
          >
            <PrimaryButton label={copy.home.addAlarm} onPress={handleAddAlarm} style={styles.addAlarmBtn} />
            <PrimaryButton
              label={copy.home.tryTheAlarm}
              variant="outline"
              size="demo"
              onPress={handleDemoAlarm}
            />
            <PrimaryButton
              label="Quick test alarm (+2 min)"
              variant="outline"
              size="demo"
              onPress={handleQuickTestAlarm}
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
});
