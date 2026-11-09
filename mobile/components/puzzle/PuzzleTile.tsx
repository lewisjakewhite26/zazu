import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';
import type { PuzzleTileState } from '../../../lib/puzzle-utils';

type PuzzleTileProps = {
  tile: PuzzleTileState;
  onPress: () => void;
};

export function PuzzleTile({ tile, onPress }: PuzzleTileProps) {
  const { colors } = useTheme();
  const isSideA = tile.side === 'a';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        tile: {
          flex: 1,
          minHeight: 64,
          borderRadius: 14,
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: colors.border,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        text: {
          textAlign: 'center',
          lineHeight: 21,
        },
        // Roots / prompts: the real serif italic, in full ink (was pale lavender).
        textA: {
          fontFamily: fonts.serifItalic,
          fontSize: 17,
          color: colors.text,
        },
        // Meanings: medium sans, not heavy bold, so both columns feel like one set.
        textB: {
          fontFamily: fonts.sansMedium,
          fontSize: 15,
          color: colors.text,
        },
        // Neutral ink outline: pink/red read as "wrong". Red is kept for mistakes only.
        selected: {
          borderColor: colors.text,
          transform: [{ scale: 1.02 }],
        },
        correct: {
          borderColor: colors.correctIcon,
          backgroundColor: 'rgba(168,216,176,0.22)',
        },
        wrong: {
          borderColor: colors.wrong,
          backgroundColor: 'rgba(232,97,122,0.12)',
        },
        gone: {
          opacity: 0,
        },
      }),
    [colors],
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
