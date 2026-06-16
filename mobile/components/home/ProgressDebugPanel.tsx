import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

type ProgressDebugPanelProps = {
  wordId: string;
  streak: number;
  onSetLastCompleted: (isoDate: string) => Promise<void>;
  onCompleteWord: (wordId: string) => Promise<{ streak: number; coinsEarned: number } | undefined>;
};

function offsetIsoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ProgressDebugPanel({
  wordId,
  streak,
  onSetLastCompleted,
  onCompleteWord,
}: ProgressDebugPanelProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        panel: {
          width: '100%',
          marginTop: spacing.md,
          padding: spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: 'dashed',
          backgroundColor: colors.card,
        },
        title: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.subtext,
          marginBottom: spacing.xs,
        },
        meta: {
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.text,
          marginBottom: spacing.sm,
        },
        button: {
          marginTop: spacing.xs,
        },
      }),
    [colors],
  );

  if (!__DEV__) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Progress debug</Text>
      <Text style={styles.meta}>Streak: {streak}</Text>
      <PrimaryButton
        label="Set last completed: yesterday"
        variant="outline"
        onPress={() => onSetLastCompleted(offsetIsoDate(1))}
        style={styles.button}
      />
      <PrimaryButton
        label="Set last completed: 2 days ago"
        variant="outline"
        onPress={() => onSetLastCompleted(offsetIsoDate(2))}
        style={styles.button}
      />
      <PrimaryButton
        label="Complete word (debug)"
        variant="outline"
        onPress={() => onCompleteWord(wordId)}
        style={styles.button}
      />
    </View>
  );
}
