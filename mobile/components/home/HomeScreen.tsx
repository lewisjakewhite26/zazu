import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon } from 'phosphor-react-native';

import { AlarmPermissionBanner } from '@/components/home/AlarmPermissionBanner';
import { WordLibraryErrorBanner } from '@/components/home/WordLibraryErrorBanner';
import { HomeHeader } from '@/components/home/HomeHeader';
import { WordOfDayCard } from '@/components/home/WordOfDayCard';
import { AlarmCard } from '@/components/home/AlarmCard';
import { showAppAlert } from '@/components/ui/AppAlert';
import { Divider } from '@/components/ui/Divider';
import { GlassCard } from '@/components/ui/GlassCard';
import { IconButton } from '@/components/ui/IconButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { floatingTabBarClearance } from '@/components/ui/FloatingTabBar';
import { copy } from '@/constants/copy';
import { radii, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { useProgress } from '@/hooks/useProgress';
import { useAlarms, type Alarm } from '@/hooks/useAlarms';

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { loading: alarmsLoading, alarms, permissionStatus, toggleAlarm, deleteAlarm } = useAlarms();
  const { loading: progressLoading, streak, coins } = useProgress();
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

            {!alarmsLoading && alarms.length > 0 ? (
              <GlassCard borderRadius={radii.alarmCard} style={styles.alarmList}>
                {alarms.map((alarm: Alarm, index: number) => (
                  <View key={alarm.id}>
                    {index > 0 ? <Divider /> : null}
                    <AlarmCard
                      alarm={alarm}
                      onToggle={handleToggleAlarm}
                      onDelete={handleDeleteAlarm}
                    />
                  </View>
                ))}
              </GlassCard>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: floatingTabBarClearance(insets.bottom) },
            ]}
          >
            <IconButton
              onPress={handleAddAlarm}
              accessibilityLabel={copy.home.addAlarm}
              variant="card"
              style={styles.addAlarmFab}
            >
              <PlusIcon size={24} color={colors.text} />
            </IconButton>
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
    marginBottom: 18,
  },
  footer: {
    width: '100%',
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  addAlarmFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});
