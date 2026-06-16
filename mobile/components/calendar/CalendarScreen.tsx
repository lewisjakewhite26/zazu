import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CalendarIconRow,
  resolveGymDisplay,
} from '@/components/calendar/CalendarIconRow';
import { useCalendarStyles } from '@/components/calendar/calendarStyles';
import { WordDetailSheet } from '@/components/calendar/WordDetailSheet';
import { copy } from '@/constants/copy';
import { useProgress } from '@/hooks/useProgress';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import {
  buildCalendarEntries,
  countLearnedForTier,
  isDayAccessibleForFree,
  type CalendarDayEntry,
} from '../../../lib/calendar-utils';

const HISTORY_DAYS = 30;
const OLDER_PREVIEW_COUNT = 4;

function showGoldUpsell() {
  Alert.alert(copy.calendar.unlockGold.replace(' ↗', ''), copy.calendar.goldPricing);
}

type DayCardProps = {
  entry: CalendarDayEntry;
  isGold: boolean;
  onPress: (entry: CalendarDayEntry) => void;
};

function DayCard({ entry, isGold, onPress }: DayCardProps) {
  const { styles, cardVariantStyle, colors } = useCalendarStyles();
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
          <View style={styles.cardLockedOverlay} pointerEvents="none">
            <MaterialCommunityIcons name="lock" size={18} color={colors.subtext} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function OlderWordsBlurGrid({ entries }: { entries: CalendarDayEntry[] }) {
  const { styles, cardVariantStyle, blend } = useCalendarStyles();
  const blurTint = blend >= 0.5 ? 'dark' : 'light';

  const grid = (
    <View style={styles.grid}>
      {entries.map((entry) => (
        <View key={entry.dayOffset} style={styles.gridItem}>
          <View style={[styles.dayCard, cardVariantStyle(entry.variant)]}>
            <View>
              <Text style={styles.cardDate}>{entry.dateLabelShort}</Text>
              <Text style={styles.cardWord}>{entry.word.word}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (Platform.OS === 'web') {
    return <View style={localStyles.webBlur}>{grid}</View>;
  }

  return (
    <BlurView intensity={18} tint={blurTint} style={localStyles.blurWrap}>
      {grid}
    </BlurView>
  );
}

export function CalendarScreen() {
  const router = useRouter();
  const { styles, colors } = useCalendarStyles();
  const { loading: progressLoading, streak, learnedWordIds, wordProgress } = useProgress();
  const { loading: wordsLoading, alarmWords } = useWordLibrary(learnedWordIds);
  const [isGold, setIsGold] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CalendarDayEntry | null>(null);

  const loading = progressLoading || wordsLoading;

  const entries = useMemo(
    () => buildCalendarEntries(alarmWords, learnedWordIds, wordProgress, HISTORY_DAYS),
    [alarmWords, learnedWordIds, wordProgress],
  );

  const todayEntry = entries[0] ?? null;
  const weekEntries = entries.filter((entry) => entry.dayOffset >= 1 && entry.dayOffset <= 4);
  const olderEntries = entries.filter((entry) => entry.dayOffset >= 5);
  const olderPreview = olderEntries.slice(0, OLDER_PREVIEW_COUNT);
  const lockedOlderCount = olderEntries.length;
  const wordsLearned = countLearnedForTier(entries, isGold);

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
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nav}>
          <View style={localStyles.navLeft}>
            <Pressable
              onPress={() => router.back()}
              style={localStyles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color={colors.text} />
            </Pressable>
            <View>
              <Text style={styles.navTitle}>{copy.calendar.title}</Text>
              <Text style={styles.navSub}>
                {loading ? copy.home.wordOfDayLoading : copy.calendar.wordsLearned(wordsLearned)}
              </Text>
            </View>
          </View>
          <View style={styles.streakPill}>
            <MaterialCommunityIcons name="fire" size={14} color={colors.streakFlame} />
            <Text style={styles.streakPillText}>
              {loading ? '—' : copy.calendar.streakDays(streak)}
            </Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{copy.calendar.previewAs}</Text>
          <View style={styles.toggleWrap}>
            <Pressable
              style={[styles.toggleOpt, !isGold && styles.toggleOptActive]}
              onPress={() => setIsGold(false)}
            >
              <Text
                style={[styles.toggleOptText, !isGold && styles.toggleOptTextActive]}
              >
                {copy.calendar.freeUser}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleOpt, isGold && styles.toggleOptActive]}
              onPress={() => setIsGold(true)}
            >
              <Text style={[styles.toggleOptText, isGold && styles.toggleOptTextActive]}>
                {copy.calendar.goldUser}
              </Text>
            </Pressable>
          </View>
        </View>

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

            <Text style={styles.sectionLabel}>{copy.calendar.thisWeek}</Text>
            <View style={styles.grid}>
              {weekEntries.map((entry) => (
                <DayCard key={entry.dayOffset} entry={entry} isGold={isGold} onPress={openEntry} />
              ))}
            </View>

            <Text style={styles.sectionLabel}>{copy.calendar.olderWords}</Text>
            {isGold ? (
              <View style={styles.grid}>
                {olderEntries.map((entry) => (
                  <DayCard key={entry.dayOffset} entry={entry} isGold={isGold} onPress={openEntry} />
                ))}
              </View>
            ) : (
              <>
                <View style={styles.lockWrap}>
                  <OlderWordsBlurGrid entries={olderPreview} />
                  <View style={styles.lockOverlay} pointerEvents="none">
                    <MaterialCommunityIcons name="lock" size={22} color={colors.subtext} />
                    <Text style={styles.lockTitle}>
                      {copy.calendar.lockTitle(lockedOlderCount)}
                    </Text>
                    <Text style={styles.lockSub}>{copy.calendar.lockSub}</Text>
                  </View>
                </View>

                <Pressable style={styles.goldBtn} onPress={showGoldUpsell}>
                  <Text style={styles.goldBtnText}>{copy.calendar.unlockGold}</Text>
                </Pressable>
                <Text style={styles.goldSub}>{copy.calendar.goldPricing}</Text>
              </>
            )}
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
  );
}

const localStyles = StyleSheet.create({
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  blurWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  webBlur: {
    opacity: 0.45,
  },
});
