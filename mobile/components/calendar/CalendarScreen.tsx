import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CaretDownIcon, CaretUpIcon, FireIcon, LockIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CalendarIconRow,
  resolveGymDisplay,
} from '@/components/calendar/CalendarIconRow';
import { useCalendarStyles } from '@/components/calendar/calendarStyles';
import { WordDetailSheet } from '@/components/calendar/WordDetailSheet';
import { showAppAlert } from '@/components/ui/AppAlert';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { copy } from '@/constants/copy';
import { useSubscription } from '@/context/SubscriptionContext';
import { useProgress } from '@/hooks/useProgress';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import {
  buildCalendarEntries,
  countLearnedForTier,
  groupEntriesByMonth,
  isDayAccessibleForFree,
  type CalendarDayEntry,
  type CalendarMonthGroup,
} from '../../../lib/calendar-utils';

const HISTORY_DAYS = 30;

function showGoldUpsell() {
  showAppAlert({
    title: copy.calendar.unlockGold.replace(' ↗', ''),
    message: copy.calendar.goldPricing,
  });
}

type DayCardProps = {
  entry: CalendarDayEntry;
  isGold: boolean;
  onPress: (entry: CalendarDayEntry) => void;
};

function DayCard({ entry, isGold, onPress }: DayCardProps) {
  const { styles, cardVariantStyle, colors, blend } = useCalendarStyles();
  const locked = !isGold && !isDayAccessibleForFree(entry.dayOffset);
  const gymDisplay = resolveGymDisplay(isGold, entry.gymCompleted, entry.completed);

  return (
    <Pressable
      style={styles.gridItem}
      onPress={() => {
        if (!locked) onPress(entry);
      }}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
    >
      <View style={[styles.dayCard, cardVariantStyle(entry.variant)]}>
        <View>
          <Text style={styles.cardDate}>{entry.dateLabelShort}</Text>
          <Text style={styles.cardWord}>{entry.word.word}</Text>
        </View>
        <CalendarIconRow
          completed={entry.completed}
          dismissSeconds={entry.dismissSeconds}
          gymDisplay={gymDisplay}
          layout="card"
        />
        {locked ? (
          <>
            {Platform.OS === 'web' ? (
              <View style={styles.cardLockedBlurWeb} pointerEvents="none" />
            ) : (
              <BlurView
                intensity={22}
                tint={blend >= 0.5 ? 'dark' : 'light'}
                style={styles.cardLockedBlurNative}
                pointerEvents="none"
              />
            )}
            <View style={styles.cardLockedIconWrap} pointerEvents="none">
              <View style={styles.cardLockedIconBadge}>
                <LockIcon size={16} color={colors.text} />
              </View>
            </View>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

type MonthSectionProps = {
  group: CalendarMonthGroup;
  expanded: boolean;
  onToggle: (key: string) => void;
  isGold: boolean;
  onPressEntry: (entry: CalendarDayEntry) => void;
};

function MonthSection({ group, expanded, onToggle, isGold, onPressEntry }: MonthSectionProps) {
  const { styles, colors, blend } = useCalendarStyles();
  const allLocked = !isGold && group.entries.every((entry) => !isDayAccessibleForFree(entry.dayOffset));
  const CaretIcon = expanded ? CaretUpIcon : CaretDownIcon;

  const handlePress = () => {
    if (allLocked) {
      showGoldUpsell();
      return;
    }
    onToggle(group.key);
  };

  return (
    <View style={styles.monthSection}>
      <Pressable
        style={styles.monthHeader}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={allLocked ? undefined : { expanded }}
      >
        <Text style={styles.monthHeaderLabel}>{group.label}</Text>
        <View style={styles.monthHeaderRight}>
          <Text style={styles.monthHeaderCount}>
            {copy.calendar.monthWordCount(group.entries.length)}
          </Text>
          {allLocked ? null : <CaretIcon size={16} color={colors.subtext} />}
        </View>

        {allLocked ? (
          <>
            {Platform.OS === 'web' ? (
              <View style={styles.monthHeaderBlurWeb} pointerEvents="none" />
            ) : (
              <BlurView
                intensity={16}
                tint={blend >= 0.5 ? 'dark' : 'light'}
                style={styles.monthHeaderBlurNative}
                pointerEvents="none"
              />
            )}
            <View style={styles.monthHeaderLockWrap} pointerEvents="none">
              <LockIcon size={16} color={colors.text} />
            </View>
          </>
        ) : null}
      </Pressable>

      {expanded && !allLocked ? (
        <View style={styles.grid}>
          {group.entries.map((entry) => (
            <DayCard key={entry.dayOffset} entry={entry} isGold={isGold} onPress={onPressEntry} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function CalendarScreen() {
  const router = useRouter();
  const { styles, colors } = useCalendarStyles();
  const { loading: progressLoading, streak, learnedWordIds, wordProgress } = useProgress();
  const { loading: wordsLoading, alarmWords } = useWordLibrary(learnedWordIds);
  const { isGold, setDevGoldPreview, loading: subscriptionLoading } = useSubscription();
  const [selectedEntry, setSelectedEntry] = useState<CalendarDayEntry | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const hasSetDefaultExpanded = useRef(false);

  const loading = progressLoading || wordsLoading || subscriptionLoading;

  const entries = useMemo(
    () => buildCalendarEntries(alarmWords, learnedWordIds, wordProgress, HISTORY_DAYS),
    [alarmWords, learnedWordIds, wordProgress],
  );

  const todayEntry = entries[0] ?? null;
  const monthGroups = useMemo(() => groupEntriesByMonth(entries.slice(1)), [entries]);
  const wordsLearned = countLearnedForTier(entries, isGold);

  useEffect(() => {
    if (!hasSetDefaultExpanded.current && monthGroups.length > 0) {
      setExpandedMonths(new Set([monthGroups[0].key]));
      hasSetDefaultExpanded.current = true;
    }
  }, [monthGroups]);

  const toggleMonth = useCallback((key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const openEntry = useCallback((entry: CalendarDayEntry) => {
    setSelectedEntry(entry);
  }, []);

  const closeSheet = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const heroGymDisplay = todayEntry
    ? resolveGymDisplay(isGold, todayEntry.gymCompleted, todayEntry.completed)
    : 'pending';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          style={styles.nav}
          title={copy.calendar.title}
          titleStyle={styles.navTitle}
          subtitle={loading ? copy.home.wordOfDayLoading : copy.calendar.wordsLearned(wordsLearned)}
          onBack={() => router.back()}
          right={
            <View style={styles.streakPill}>
              <FireIcon size={14} color={colors.streakFlame} />
              <Text style={styles.streakPillText}>
                {loading ? '—' : copy.calendar.streakDays(streak)}
              </Text>
            </View>
          }
        />

        {__DEV__ ? (
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{copy.calendar.previewAs}</Text>
            <View style={styles.toggleWrap}>
              <Pressable
                style={[styles.toggleOpt, !isGold && styles.toggleOptActive]}
                onPress={() => setDevGoldPreview(false)}
              >
                <Text
                  style={[styles.toggleOptText, !isGold && styles.toggleOptTextActive]}
                >
                  {copy.calendar.freeUser}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleOpt, isGold && styles.toggleOptActive]}
                onPress={() => setDevGoldPreview(true)}
              >
                <Text style={[styles.toggleOptText, isGold && styles.toggleOptTextActive]}>
                  {copy.calendar.goldUser}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View style={localStyles.loadingWrap}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>{copy.calendar.today}</Text>
            {todayEntry ? (
              <Pressable
                style={styles.heroCard}
                onPress={() => openEntry(todayEntry)}
                accessibilityRole="button"
              >
                <View>
                  <Text style={styles.heroBadge}>{copy.calendar.today}</Text>
                  <Text style={styles.heroWord}>{todayEntry.word.word}</Text>
                  <Text style={styles.heroDate}>{todayEntry.dateLabelLong}</Text>
                </View>
                <CalendarIconRow
                  completed={todayEntry.completed}
                  dismissSeconds={todayEntry.dismissSeconds}
                  gymDisplay={heroGymDisplay}
                  layout="hero"
                />
              </Pressable>
            ) : null}

            {monthGroups.map((group) => (
              <MonthSection
                key={group.key}
                group={group}
                expanded={expandedMonths.has(group.key)}
                onToggle={toggleMonth}
                isGold={isGold}
                onPressEntry={openEntry}
              />
            ))}

            {!isGold ? (
              <>
                <Pressable style={styles.goldBtn} onPress={showGoldUpsell}>
                  <Text style={styles.goldBtnText}>{copy.calendar.unlockGold}</Text>
                </Pressable>
                <Text style={styles.goldSub}>{copy.calendar.goldPricing}</Text>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <WordDetailSheet
        visible={selectedEntry != null}
        entry={selectedEntry}
        isGold={isGold}
        streak={Math.max(1, streak - (selectedEntry?.dayOffset ?? 0))}
        onClose={closeSheet}
        onUnlockGold={showGoldUpsell}
      />
      </SafeAreaView>
    </GradientBackground>
  );
}

const localStyles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
});
