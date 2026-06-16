import { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme, type AppThemeColors } from '@/context/ThemeContext';
import { useWordLibrary } from '@/hooks/useWordLibrary';
import { morningQuestionText } from '../../../lib/morning-task';
import {
  formatDismissTime,
  type CalendarDayEntry,
} from '../../../lib/calendar-utils';

type WordDetailSheetProps = {
  visible: boolean;
  entry: CalendarDayEntry | null;
  isGold: boolean;
  streak: number;
  onClose: () => void;
  onUnlockGold: () => void;
};

type SheetStyles = ReturnType<typeof createSheetStyles>;

function createSheetStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    sheet: {
      width: '100%',
      maxWidth: 390,
      maxHeight: '88%',
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 18,
    },
    eyebrow: {
      fontFamily: fonts.sansMedium,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.subtext,
      marginBottom: 6,
    },
    word: {
      fontFamily: fonts.serif,
      fontSize: 34,
      color: colors.text,
      letterSpacing: -1,
      marginBottom: 2,
    },
    pron: {
      fontFamily: fonts.sans,
      fontSize: 13,
      color: colors.subtext,
      fontStyle: 'italic',
      marginBottom: 14,
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    def: {
      fontFamily: fonts.sans,
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 10,
    },
    etymBox: {
      padding: 12,
      backgroundColor: colors.sheetSecondary,
      borderRadius: 12,
      marginBottom: 14,
    },
    etymText: {
      fontFamily: fonts.sans,
      fontSize: 13,
      color: colors.subtext,
      lineHeight: 20,
    },
    etymStrong: {
      color: colors.gold,
      fontFamily: fonts.sansMedium,
    },
    taskBox: {
      padding: 12,
      backgroundColor: colors.sheetSecondary,
      borderRadius: 12,
      marginBottom: 14,
    },
    taskLabel: {
      fontFamily: fonts.sansMedium,
      fontSize: 10,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.subtext,
      marginBottom: 6,
    },
    taskQ: {
      fontFamily: fonts.sans,
      fontSize: 13,
      color: colors.text,
      marginBottom: 6,
    },
    taskAnsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    taskAns: {
      fontFamily: fonts.sansMedium,
      fontSize: 13,
      color: colors.correctIcon,
    },
    taskTries: {
      fontFamily: fonts.sans,
      fontSize: 11,
      color: colors.subtext,
      marginTop: 4,
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.cardPeach,
      borderWidth: 0.5,
      borderColor: colors.cardPeachBorder,
      borderRadius: 12,
      marginBottom: 14,
    },
    streakText: {
      fontFamily: fonts.sans,
      fontSize: 13,
      color: colors.text,
    },
    statGrid: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.sheetSecondary,
      borderRadius: 12,
      padding: 12,
    },
    statLabel: {
      fontFamily: fonts.sans,
      fontSize: 11,
      color: colors.subtext,
      marginBottom: 4,
    },
    statVal: {
      fontFamily: fonts.sansMedium,
      fontSize: 19,
      color: colors.text,
    },
    statSub: {
      fontFamily: fonts.sans,
      fontSize: 11,
      color: colors.subtext,
      marginTop: 2,
    },
    gymRow: {
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
    },
    gymInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: colors.sheetSecondary,
    },
    gymLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    gymLeftText: {
      fontFamily: fonts.sans,
      fontSize: 13,
      color: colors.text,
      flexShrink: 1,
    },
    gymBtn: {
      borderWidth: 0.5,
      borderColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 100,
    },
    gymBtnText: {
      fontFamily: fonts.sans,
      fontSize: 12,
      color: colors.subtext,
    },
    gymLock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: colors.sheetSecondary,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 16,
    },
    gymLockLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    gymLockIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.card,
      borderWidth: 0.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    gymLockTitle: {
      fontFamily: fonts.sansMedium,
      fontSize: 13,
      color: colors.text,
    },
    gymLockSub: {
      fontFamily: fonts.sans,
      fontSize: 11,
      color: colors.subtext,
      marginTop: 1,
    },
    gymUnlockBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 100,
      backgroundColor: colors.cardDawn,
      borderWidth: 0.5,
      borderColor: colors.cardDawnBorder,
    },
    gymUnlockText: {
      fontFamily: fonts.sansMedium,
      fontSize: 12,
      color: colors.gold,
    },
    closeBtn: {
      width: '100%',
      paddingVertical: 13,
      backgroundColor: colors.sheetSecondary,
      borderRadius: 100,
      alignItems: 'center',
      marginTop: 8,
    },
    closeBtnText: {
      fontFamily: fonts.sansMedium,
      fontSize: 14,
      color: colors.text,
    },
  });
}

function IntroEtymologyText({
  entry,
  styles,
}: {
  entry: CalendarDayEntry;
  styles: SheetStyles;
}) {
  const spans = entry.word.introEtymology?.spans;
  if (!spans?.length) {
    return (
      <Text style={styles.etymText}>
        {entry.word.origin.replace(/<[^>]+>/g, '')}
      </Text>
    );
  }

  return (
    <Text style={styles.etymText}>
      {spans.map((span, index) => (
        <Text
          key={`${span.text}-${index}`}
          style={span.highlight ? (styles.etymStrong as TextStyle) : undefined}
        >
          {span.text}
        </Text>
      ))}
    </Text>
  );
}

export function WordDetailSheet({
  visible,
  entry,
  isGold,
  streak,
  onClose,
  onUnlockGold,
}: WordDetailSheetProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { startGymFlow } = useAlarmFlow();
  const { gymWords } = useWordLibrary([]);

  const styles = useMemo(() => createSheetStyles(colors), [colors]);

  const openGym = () => {
    if (!entry) return;
    const gymWord =
      gymWords.find((word) => word.id === entry.word.id) ??
      gymWords.find((word) => word.word === entry.word.word);
    if (!gymWord) return;
    onClose();
    startGymFlow(gymWord);
    router.push('/puzzle');
  };

  if (!entry) return null;

  const task = entry.word.morningTask;
  const taskQuestion = morningQuestionText(entry.word.word, task);
  const dismissLabel = formatDismissTime(entry.dismissSeconds);
  const coinsLabel =
    entry.coinsEarned != null ? String(entry.coinsEarned) : copy.calendar.notCompleted;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.eyebrow}>{entry.dateLabelLong}</Text>
            <Text style={styles.word}>{entry.word.word}</Text>
            <Text style={styles.pron}>
              {entry.word.pronunciation} · {entry.word.pos}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.def}>{entry.word.definition}</Text>
            <View style={styles.etymBox}>
              <IntroEtymologyText entry={entry} styles={styles} />
            </View>

            <View style={styles.taskBox}>
              <Text style={styles.taskLabel}>{copy.calendar.morningTask}</Text>
              <Text style={styles.taskQ}>{taskQuestion}</Text>
              {entry.completed ? (
                <>
                  <View style={styles.taskAnsRow}>
                    <MaterialCommunityIcons name="check" size={14} color={colors.correctIcon} />
                    <Text style={styles.taskAns}>{task.correctAnswer}</Text>
                  </View>
                  <Text style={styles.taskTries}>
                    {entry.firstTry ? copy.calendar.gotFirstTry : copy.calendar.neededHint}
                  </Text>
                </>
              ) : (
                <Text style={styles.taskTries}>{copy.calendar.notCompleted}</Text>
              )}
            </View>

            <View style={styles.streakRow}>
              <MaterialCommunityIcons name="fire" size={16} color={colors.streakFlame} />
              <Text style={styles.streakText}>{copy.calendar.streakDayOf(streak)}</Text>
            </View>

            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{copy.calendar.timeToDismiss}</Text>
                <Text style={styles.statVal}>{dismissLabel}</Text>
                <Text style={styles.statSub}>{copy.calendar.alarmToDone}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{copy.calendar.coinsEarned}</Text>
                <Text style={styles.statVal}>{coinsLabel}</Text>
                <Text style={styles.statSub}>{copy.calendar.thatMorning}</Text>
              </View>
            </View>

            {!isGold ? (
              <View style={styles.gymLock}>
                <View style={styles.gymLockLeft}>
                  <View style={styles.gymLockIcon}>
                    <MaterialCommunityIcons name="lock" size={16} color={colors.subtext} />
                  </View>
                  <View>
                    <Text style={styles.gymLockTitle}>{copy.calendar.wordGym}</Text>
                    <Text style={styles.gymLockSub}>{copy.calendar.goldFeature}</Text>
                  </View>
                </View>
                <Pressable style={styles.gymUnlockBtn} onPress={onUnlockGold}>
                  <Text style={styles.gymUnlockText}>{copy.calendar.unlock}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.gymRow}>
                <View style={styles.gymInner}>
                  <View style={styles.gymLeft}>
                    <MaterialCommunityIcons
                      name="dumbbell"
                      size={16}
                      color={entry.gymCompleted ? colors.correctIcon : colors.subtext}
                    />
                    <Text style={styles.gymLeftText}>
                      {entry.gymCompleted
                        ? copy.calendar.gymCompleted
                        : copy.calendar.gymNotDone}
                    </Text>
                  </View>
                  <Pressable style={styles.gymBtn} onPress={openGym}>
                    <Text style={styles.gymBtnText}>{copy.calendar.openGym}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{copy.calendar.sheetDone}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
