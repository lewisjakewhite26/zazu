import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { PuzzleTileState } from '../../../lib/puzzle-utils';

type PuzzleTileProps = {
  tile: PuzzleTileState;
  onPress: () => void;
};

export function PuzzleTile({ tile, onPress }: PuzzleTileProps) {
  const { colors, blend } = useTheme();
  const isNight = blend >= 0.5;
  const isSideA = tile.side === 'a';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        tile: {
          flex: 1,
          minHeight: 70,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 2,
          borderColor: 'transparent',
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.ink,
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 3 },
        },
        text: {
          textAlign: 'center',
          lineHeight: 20,
        },
        textA: {
          fontFamily: typography.puzzleWordMain.fontFamily,
          fontStyle: 'italic',
          fontSize: 14,
          color: isNight ? '#d0c0e8' : colors.subtext,
        },
        textB: {
          fontFamily: typography.mtOption.fontFamily,
          fontWeight: '700',
          fontSize: 14,
          color: colors.text,
        },
        selected: {
          borderColor: colors.blush,
          backgroundColor: 'rgba(240,160,188,0.18)',
          transform: [{ scale: 1.03 }],
        },
        correct: {
          borderColor: colors.correct,
          backgroundColor: 'rgba(168,216,176,0.2)',
        },
        wrong: {
          borderColor: colors.wrong,
          backgroundColor: 'rgba(232,97,122,0.1)',
        },
        gone: {
          opacity: 0,
        },
      }),
    [colors, isNight],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected: tile.state === 'selected',
        disabled: tile.state === 'correct' || tile.state === 'gone',
      }}
      disabled={tile.state === 'correct' || tile.state === 'gone'}
      onPress={onPress}
      style={[
        styles.tile,
        tile.state === 'selected' && styles.selected,
        tile.state === 'correct' && styles.correct,
        tile.state === 'wrong' && styles.wrong,
        tile.state === 'gone' && styles.gone,
      ]}
    >
      <Text style={[styles.text, isSideA ? styles.textA : styles.textB]}>{tile.text}</Text>
    </Pressable>
  );
}
