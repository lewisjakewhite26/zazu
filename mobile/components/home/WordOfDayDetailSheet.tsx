import { useMemo } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { GlassCard } from '@/components/ui/GlassCard';
import { OriginText } from '@/components/ui/OriginText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { useTheme, type AppThemeColors } from '@/context/ThemeContext';
import type { WordOfDay } from '@/types/home';

type WordOfDayDetailSheetProps = WordOfDay & {
  visible: boolean;
  onClose: () => void;
};

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      ...(Platform.OS === 'web'
        ? ({ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as object)
        : null),
    },
    sheet: {
      width: '100%',
      maxWidth: 390,
    },
    sheetCard: {
      backgroundColor: colors.sheetBg,
    },
    sheetContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
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
      marginBottom: 8,
    },
    posBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.posBadgeBg,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 14,
    },
    posText: {
      fontFamily: fonts.sansSemiBold,
      fontSize: 11,
      textTransform: 'uppercase',
      color: colors.subtext,
    },
    divider: {
      height: 0.5,
      backgroundColor: colors.border,
      marginBottom: 14,
    },
    def: {
      fontFamily: fonts.sans,
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 14,
    },
    etymLabel: {
      fontFamily: fonts.sansSemiBold,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.subtext,
      marginBottom: 6,
    },
    etymBox: {
      padding: 12,
      backgroundColor: colors.sheetSecondary,
      borderRadius: 12,
      marginBottom: 18,
    },
    closeBtn: {
      marginTop: 4,
    },
  });
}

export function WordOfDayDetailSheet({
  visible,
  word,
  pronunciation,
  pos,
  definition,
  origin,
  onClose,
}: WordOfDayDetailSheetProps) {
  const { colors, blend } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} accessible={false}>
        {Platform.OS !== 'web' ? (
          <BlurView
            intensity={30}
            tint={blend >= 0.5 ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <Pressable
          style={styles.sheet}
          onPress={(e) => e.stopPropagation()}
          accessible={false}
          accessibilityViewIsModal
        >
          <GlassCard borderRadius={24} style={styles.sheetCard} contentStyle={styles.sheetContent}>
            <View style={styles.handle} />
            <Text style={styles.eyebrow}>{copy.home.wordOfDayEyebrow}</Text>
            <Text style={styles.word}>{word}</Text>
            <Text style={styles.pron}>{pronunciation}</Text>
            <View style={styles.posBadge}>
              <Text style={styles.posText}>{pos}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.def}>{definition}</Text>
            <Text style={styles.etymLabel}>{copy.learn.etymology}</Text>
            <View style={styles.etymBox}>
              <OriginText origin={origin} />
            </View>
            <PrimaryButton
              label={copy.home.wordOfDayClose}
              variant="outline"
              onPress={onClose}
              style={styles.closeBtn}
            />
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
