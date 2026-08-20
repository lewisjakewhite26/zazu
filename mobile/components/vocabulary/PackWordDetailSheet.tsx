import { useMemo } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { Divider } from '@/components/ui/Divider';
import { GlassCard } from '@/components/ui/GlassCard';
import { OriginText } from '@/components/ui/OriginText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useAlarmFlow } from '@/context/AlarmFlowContext';
import { useTheme, type AppThemeColors } from '@/context/ThemeContext';
import type { PackWord } from '../../../lib/word-pack-words';

type PackWordDetailSheetProps = {
  visible: boolean;
  word: PackWord | null;
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
      maxHeight: '80%',
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
      marginVertical: 14,
    },
    def: {
      fontFamily: fonts.sans,
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 10,
    },
    cta: {
      marginTop: spacing.lg,
    },
  });
}

export function PackWordDetailSheet({ visible, word, onClose }: PackWordDetailSheetProps) {
  const router = useRouter();
  const { colors, blend } = useTheme();
  const { startGymFlow } = useAlarmFlow();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!word) return null;

  const openGym = () => {
    onClose();
    startGymFlow(word);
    router.push('/puzzle');
  };

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
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.word}>{word.word}</Text>
              <Text style={styles.pron}>
                {word.pronunciation} · {word.pos}
              </Text>
              <Divider style={styles.divider} />
              <Text style={styles.def}>{word.definition}</Text>
              <OriginText origin={word.origin} />
            </ScrollView>

            <PrimaryButton
              label={copy.vocabulary.openInGym}
              onPress={openGym}
              style={styles.cta}
            />
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
