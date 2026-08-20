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
import { CaretDownIcon, CaretUpIcon, CoinsIcon, LockIcon } from 'phosphor-react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarIconRow, resolveGymDisplay } from '@/components/calendar/CalendarIconRow';
import { useCalendarStyles } from '@/components/calendar/calendarStyles';
import { WordDetailSheet } from '@/components/calendar/WordDetailSheet';
import { showAppAlert } from '@/components/ui/AppAlert';
import { floatingTabBarClearance } from '@/components/ui/FloatingTabBar';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { HomeHeader } from '@/components/home/HomeHeader';
import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme, type AppThemeColors } from '@/context/ThemeContext';
import { useProgress } from '@/hooks/useProgress';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { useLiteraryWords } from '@/hooks/useLiteraryWords';
import { buildLiteraryQuestions } from '../../../lib/literary-words';
import { MISSED_WORD_UNLOCK_COST } from '../../../lib/useProgress';
import { WORD_PACKS, type WordPack } from '../../../lib/word-packs';
import {
  buildCalendarEntries,
  countLearnedForTier,
  groupEntriesByMonth,
  type CalendarDayEntry,
  type CalendarMonthGroup,
} from '../../../lib/calendar-utils';

const HISTORY_DAYS = 30;

type DayCardProps = {
  entry: CalendarDayEntry;
  isGold: boolean;
  onOpen: (entry: CalendarDayEntry) => void;
  onUnlock: (entry: CalendarDayEntry) => void;
};

function DayCard({ entry, isGold, onOpen, onUnlock }: DayCardProps) {
  const { styles, cardVariantStyle, colors, blend } = useCalendarStyles();
  const missed = !entry.completed;
  const gymDisplay = resolveGymDisplay(isGold, entry.gymCompleted, entry.completed);

  return (
    <Pressable
      style={styles.gridItem}
      onPress={() => (missed ? onUnlock(entry) : onOpen(entry))}
      accessibilityRole="button"
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
        {missed ? (
          <>
            {Platform.OS === 'web' ? (
              <View style={styles.cardLockedBlurWeb} pointerEvents="none" />
            ) : (
              <BlurView
                intensity={75}
                tint={blend >= 0.5 ? 'dark' : 'light'}
                blurMethod="dimezisBlurView"
                style={styles.cardLockedBlurNative}
                pointerEvents="none"
              />
            )}
            <View style={styles.cardLockedIconWrap} pointerEvents="none">
              <View style={styles.cardLockedIconBadge}>
                <CoinsIcon size={16} color={colors.text} />
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
  onOpen: (entry: CalendarDayEntry) => void;
  onUnlock: (entry: CalendarDayEntry) => void;
};

function MonthSection({ group, expanded, onToggle, isGold, onOpen, onUnlock }: MonthSectionProps) {
  const { styles, colors } = useCalendarStyles();
  const CaretIcon = expanded ? CaretUpIcon : CaretDownIcon;

  return (
    <View style={styles.monthSection}>
      <Pressable
        style={styles.monthHeader}
        onPress={() => onToggle(group.key)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.monthHeaderLabel}>{group.label}</Text>
        <View style={styles.monthHeaderRight}>
          <Text style={styles.monthHeaderCount}>
            {copy.calendar.monthWordCount(group.entries.length)}
          </Text>
          <CaretIcon size={16} color={colors.subtext} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.grid}>
          {group.entries.map((entry) => (
            <DayCard
              key={entry.dayOffset}
              entry={entry}
              isGold={isGold}
              onOpen={onOpen}
              onUnlock={onUnlock}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function createLocalStyles(colors: AppThemeColors) {
  return StyleSheet.create({
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
      paddingBottom: spacing.sm,
    },
    eyebrow: {
      ...typography.eyebrow,
      color: colors.subtext,
      textTransform: 'uppercase',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontFamily: fonts.sans,
      fontSize: 13,
      color: colors.subtext,
      marginBottom: spacing.md,
    },
    packsSection: {
      marginTop: spacing.xl,
    },
    packsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    packCard: {
      width: '48%',
      borderRadius: 16,
      padding: 14,
      minHeight: 108,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.glassCardBorder,
      backgroundColor: colors.glassCardFill,
      overflow: 'hidden',
    },
    packCardDisabled: {
      opacity: 0.5,
    },
    packTitle: {
      fontFamily: fonts.serif,
      fontSize: 17,
      color: colors.text,
      marginBottom: 4,
    },
    packDescription: {
      fontFamily: fonts.sans,
      fontSize: 11,
      lineHeight: 15,
      color: colors.subtext,
    },
    packCount: {
      fontFamily: fonts.sansMedium,
      fontSize: 10,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.subtext,
      marginTop: 8,
    },
    packLockedBlur: {
      ...StyleSheet.absoluteFill,
      borderRadius: 16,
      overflow: 'hidden',
    },
    packLockedIconWrap: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    packLockedIconBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.sheetBg,
      borderWidth: 0.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingWrap: {
      paddingVertical: 48,
      alignItems: 'center',
    },
  });
}

type PackCardProps = {
  pack: WordPack;
  isGold: boolean;
  onPress: (pack: WordPack) => void;
};

function PackCard({ pack, isGold, onPress }: PackCardProps) {
  const { colors, blend } = useTheme();
  const styles = useMemo(() => createLocalStyles(colors), [colors]);
  const disabled = pack.status === 'coming_soon';
  const locked = !disabled && !isGold;

  return (
    <Pressable
      style={styles.packCard}
      onPress={() => onPress(pack)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={disabled ? styles.packCardDisabled : undefined}>
        <Text style={styles.packTitle}>{pack.title}</Text>
        <Text style={styles.packDescription}>{pack.description}</Text>
      </View>
      <Text style={styles.packCount}>
        {disabled ? copy.calendar.comingSoon : copy.vocabulary.packWordCount(pack.wordCount)}
      </Text>

      {locked ? (
        <>
          {Platform.OS === 'web' ? (
            <View
              style={[
                styles.packLockedBlur,
                { backgroundColor: blend >= 0.5 ? 'rgba(14,12,26,0.55)' : 'rgba(254,252,251,0.55)' },
              ]}
              pointerEvents="none"
            />
          ) : (
            <BlurView
              intensity={75}
              tint={blend >= 0.5 ? 'dark' : 'light'}
              blurMethod="dimezisBlurView"
              style={styles.packLockedBlur}
              pointerEvents="none"
            />
          )}
          <View style={styles.packLockedIconWrap} pointerEvents="none">
            <View style={styles.packLockedIconBadge}>
              <LockIcon size={16} color={colors.text} />
            </View>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

export function VocabularyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { styles: calendarStyles } = useCalendarStyles();
  const localStyles = useMemo(() => createLocalStyles(colors), [colors]);

  const {
    loading: progressLoading,
    streak,
    coins,
    learnedWordIds,
    wordProgress,
    unlockMissedWord,
  } = useProgress();
  const { loading: wordsLoading, alarmWords } = useWordLibrary();
  const { isGold, setDevGoldPreview, loading: subscriptionLoading } = useSubscription();
  const { literaryWords } = useLiteraryWords(isGold);
  const { startGymModeSession } = useAlarmFlow();

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
  // No free/Gold split on this count any more -- the depth gate is gone (decision 5).
  const wordsLearned = countLearnedForTier(entries, true);

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

  const openEntry = useCallback((entry: CalendarDayEntry) => setSelectedEntry(entry), []);
  const closeSheet = useCallback(() => setSelectedEntry(null), []);

  const handleUnlock = useCallback(
    (entry: CalendarDayEntry) => {
      showAppAlert({
        title: copy.calendar.unlockMissedTitle(entry.word.word),
        message: copy.calendar.unlockMissedMessage(MISSED_WORD_UNLOCK_COST),
        buttons: [
          { text: copy.calendar.unlockMissedCancel, style: 'cancel' },
          {
            text: copy.calendar.unlockMissedConfirm(MISSED_WORD_UNLOCK_COST),
            onPress: async () => {
              const result = await unlockMissedWord(entry.word.id, MISSED_WORD_UNLOCK_COST);
              if (!result.ok && result.reason === 'insufficient_coins') {
                showAppAlert({
                  title: copy.calendar.insufficientCoinsTitle,
                  message: copy.calendar.insufficientCoinsMessage(coins, MISSED_WORD_UNLOCK_COST),
                });
              }
            },
          },
        ],
      });
    },
    [unlockMissedWord, coins],
  );

  const handlePackPress = useCallback(
    (pack: WordPack) => {
      if (pack.status === 'coming_soon') return;
      if (!isGold) {
        router.push('/gold');
        return;
      }
      if (pack.kind === 'literary') {
        const questions = buildLiteraryQuestions(literaryWords, 3);
        if (questions.length === 0) return;
        startGymModeSession({ mode: 'literary', literaryQuestions: questions });
        router.push('/gym-literary-round');
        return;
      }
      router.push({ pathname: '/pack', params: { packId: pack.id } } as unknown as Href);
    },
    [isGold, literaryWords, startGymModeSession, router],
  );

  const heroGymDisplay = todayEntry
    ? resolveGymDisplay(isGold, todayEntry.gymCompleted, todayEntry.completed)
    : 'pending';

  return (
    <GradientBackground>
      <SafeAreaView style={localStyles.safeArea} edges={['top', 'left', 'right']}>
        <View style={localStyles.inner}>
          <HomeHeader streak={streak} coins={coins} loading={progressLoading} />

          <ScrollView
            style={localStyles.scroll}
            contentContainerStyle={[
              localStyles.scrollContent,
              { paddingBottom: floatingTabBarClearance(insets.bottom) },
            ]}
            showsVerticalScrollIndicator={false}
          >
          {__DEV__ ? (
            <View style={calendarStyles.toggleRow}>
              <Text style={calendarStyles.toggleLabel}>{copy.calendar.previewAs}</Text>
              <View style={calendarStyles.toggleWrap}>
                <Pressable
                  style={[calendarStyles.toggleOpt, !isGold && calendarStyles.toggleOptActive]}
                  onPress={() => setDevGoldPreview(false)}
                >
                  <Text
                    style={[
                      calendarStyles.toggleOptText,
                      !isGold && calendarStyles.toggleOptTextActive,
                    ]}
                  >
                    {copy.calendar.freeUser}
                  </Text>
                </Pressable>
                <Pressable
                  style={[calendarStyles.toggleOpt, isGold && calendarStyles.toggleOptActive]}
                  onPress={() => setDevGoldPreview(true)}
                >
                  <Text
                    style={[
                      calendarStyles.toggleOptText,
                      isGold && calendarStyles.toggleOptTextActive,
                    ]}
                  >
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
              <Text style={localStyles.eyebrow}>{copy.calendar.yourWordsSection}</Text>
              <Text style={localStyles.subtitle}>{copy.calendar.wordsLearned(wordsLearned)}</Text>

              <Text style={calendarStyles.sectionLabel}>{copy.calendar.today}</Text>
              {todayEntry ? (
                <Pressable
                  style={calendarStyles.heroCard}
                  onPress={() => openEntry(todayEntry)}
                  accessibilityRole="button"
                >
                  <View>
                    <Text style={calendarStyles.heroBadge}>{copy.calendar.today}</Text>
                    <Text style={calendarStyles.heroWord}>{todayEntry.word.word}</Text>
                    <Text style={calendarStyles.heroDate}>{todayEntry.dateLabelLong}</Text>
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
                  onOpen={openEntry}
                  onUnlock={handleUnlock}
                />
              ))}

              <View style={localStyles.packsSection}>
                <Text style={localStyles.eyebrow}>{copy.calendar.wordPacksSection}</Text>
                <Text style={localStyles.subtitle}>{copy.calendar.wordPacksSub}</Text>
                <View style={localStyles.packsGrid}>
                  {WORD_PACKS.map((pack) => (
                    <PackCard key={pack.id} pack={pack} isGold={isGold} onPress={handlePackPress} />
                  ))}
                </View>
              </View>
            </>
          )}
          </ScrollView>
        </View>

        <WordDetailSheet
          visible={selectedEntry != null}
          entry={selectedEntry}
          isGold={isGold}
          streak={Math.max(1, streak - (selectedEntry?.dayOffset ?? 0))}
          onClose={closeSheet}
          onUnlockGold={() => {
            closeSheet();
            router.push('/gold');
          }}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
