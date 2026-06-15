import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PuzzleTile } from '@/components/puzzle/PuzzleTile';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useProgress } from '@/hooks/useProgress';
import { colors, fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import {
  buildBoardTiles,
  stripHtml,
  type PuzzleTileState,
} from '../../../lib/puzzle-utils';
import { hapticCorrect, hapticWrong } from '../../../lib/feedback';
import { stopAlarmSound } from '../../../lib/alarm-sound';

export function PuzzleScreen() {
  const router = useRouter();
  const { gymSessionWord } = useAlarmFlow();
  const { completeGym } = useProgress();
  const [roundIndex, setRoundIndex] = useState(0);
  const [tiles, setTiles] = useState<PuzzleTileState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState(0);
  const [locked, setLocked] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (!gymSessionWord) {
      router.replace('/');
      return;
    }
    void stopAlarmSound();
  }, [gymSessionWord, router]);

  const round = gymSessionWord?.gymRounds?.[roundIndex];

  useEffect(() => {
    if (!round) return;
    const board = buildBoardTiles(round.pairs).map((tile) => ({
      ...tile,
      state: 'idle' as const,
    }));
    setTiles(board);
    setSelectedId(null);
    setMatched(0);
    setLocked(false);
  }, [round, roundIndex]);

  const handleFinish = useCallback(async () => {
    if (!gymSessionWord || finishing) return;
    setFinishing(true);
    await completeGym(gymSessionWord.id);
    router.replace('/');
  }, [gymSessionWord, finishing, completeGym, router]);

  const advanceRound = useCallback(() => {
    if (!gymSessionWord) return;
    const nextRound = roundIndex + 1;
    if (nextRound >= (gymSessionWord.gymRounds?.length ?? gymSessionWord.rounds?.length ?? 0)) {
      void handleFinish();
      return;
    }
    setRoundIndex(nextRound);
  }, [gymSessionWord, roundIndex, handleFinish]);

  const handleTilePress = useCallback(
    (tileId: string) => {
      if (locked) return;

      const tile = tiles.find((entry) => entry.id === tileId);
      if (!tile || tile.state === 'correct' || tile.state === 'gone') return;

      if (selectedId === tileId) {
        setSelectedId(null);
        setTiles((current) =>
          current.map((entry) =>
            entry.id === tileId ? { ...entry, state: 'idle' } : entry,
          ),
        );
        return;
      }

      if (!selectedId) {
        setSelectedId(tileId);
        setTiles((current) =>
          current.map((entry) =>
            entry.id === tileId ? { ...entry, state: 'selected' } : entry,
          ),
        );
        return;
      }

      const selected = tiles.find((entry) => entry.id === selectedId);
      if (!selected) return;

      if (selected.side === tile.side) {
        setSelectedId(tileId);
        setTiles((current) =>
          current.map((entry) => {
            if (entry.id === selectedId) return { ...entry, state: 'idle' };
            if (entry.id === tileId) return { ...entry, state: 'selected' };
            return entry;
          }),
        );
        return;
      }

      const isMatch = selected.pairId === tile.pairId;

      if (isMatch) {
        hapticCorrect();
        const nextMatched = matched + 1;
        setMatched(nextMatched);
        setSelectedId(null);
        setTiles((current) =>
          current.map((entry) =>
            entry.id === tileId || entry.id === selectedId
              ? { ...entry, state: 'correct' }
              : entry,
          ),
        );

        if (nextMatched >= (round?.pairs.length ?? 0)) {
          setTimeout(() => {
            setTiles((current) =>
              current.map((entry) =>
                entry.state === 'correct' ? { ...entry, state: 'gone' } : entry,
              ),
            );
            setTimeout(advanceRound, 380);
          }, 520);
        }
        return;
      }

      setLocked(true);
      setSelectedId(null);
      hapticWrong();
      setTiles((current) =>
        current.map((entry) => {
          if (entry.id === tileId || entry.id === selectedId) {
            return { ...entry, state: 'wrong' };
          }
          return entry;
        }),
      );

      setTimeout(() => {
        setTiles((current) =>
          current.map((entry) =>
            entry.state === 'wrong' ? { ...entry, state: 'idle' } : entry,
          ),
        );
        setLocked(false);
      }, 480);
    },
    [locked, tiles, selectedId, matched, round, advanceRound],
  );

  const progressDots = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => (
        <View
          key={index}
          style={[styles.progressDot, index < roundIndex && styles.progressDotDone]}
        />
      )),
    [roundIndex],
  );

  if (!gymSessionWord || !round) return null;

  const rows = [];
  for (let i = 0; i < tiles.length; i += 2) {
    rows.push(tiles.slice(i, i + 2));
  }

  return (
    <LinearGradient colors={[colors.bgFrom, colors.bgMid, colors.bgTo]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <View style={styles.banner}>
              <Text style={styles.wordMain}>{gymSessionWord.word}</Text>
              <Text style={styles.wordRound}>{round.type}</Text>
            </View>

            <View style={styles.contextCard}>
              <Text style={styles.contextLabel}>{round.label}</Text>
              <Text style={styles.contextText}>{stripHtml(round.context)}</Text>
            </View>

            <View style={styles.progressRow}>{progressDots}</View>

            <View style={styles.board}>
              {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.boardRow}>
                  {row.map((tile) => (
                    <PuzzleTile
                      key={tile.id}
                      tile={tile}
                      onPress={() => handleTilePress(tile.id)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  banner: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  wordMain: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -0.5,
  },
  wordRound: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginTop: spacing.xs,
  },
  contextCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  contextLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.subtext,
    marginBottom: spacing.xs,
  },
  contextText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
    fontStyle: 'italic',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotDone: {
    backgroundColor: colors.blush,
    transform: [{ scale: 1.2 }],
  },
  board: {
    gap: spacing.sm,
  },
  boardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
