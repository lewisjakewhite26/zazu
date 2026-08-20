import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Divider } from '@/components/ui/Divider';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { PackWordDetailSheet } from '@/components/vocabulary/PackWordDetailSheet';
import { copy } from '@/constants/copy';
import { fonts } from '@/constants/theme';
import { CONTENT_MAX_WIDTH, spacing } from '@/constants/layout';
import { useTheme, type AppThemeColors } from '@/context/ThemeContext';
import { fetchPackWords, type PackWord } from '../../../lib/word-pack-words';
import { WORD_PACKS } from '../../../lib/word-packs';

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    inner: {
      flex: 1,
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
    },
    loadingWrap: {
      paddingVertical: 48,
      alignItems: 'center',
    },
    empty: {
      fontFamily: fonts.sans,
      fontSize: 14,
      color: colors.subtext,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
    listContent: {
      paddingVertical: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    rowText: {
      flex: 1,
    },
    rowWord: {
      fontFamily: fonts.serif,
      fontSize: 18,
      color: colors.text,
    },
    rowPos: {
      fontFamily: fonts.sans,
      fontSize: 12,
      color: colors.subtext,
      marginTop: 2,
    },
  });
}

export function PackDetailScreen() {
  const router = useRouter();
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<PackWord[]>([]);
  const [selected, setSelected] = useState<PackWord | null>(null);

  const pack = useMemo(() => WORD_PACKS.find((p) => p.id === packId) ?? null, [packId]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (!packId) return;
    let cancelled = false;
    setLoading(true);
    fetchPackWords(packId).then((result) => {
      if (cancelled) return;
      setWords(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [packId]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.inner}>
          <ScreenHeader
            title={pack?.title ?? ''}
            subtitle={loading ? undefined : copy.vocabulary.packWordCount(words.length)}
            onBack={() => router.back()}
          />

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.text} />
            </View>
          ) : words.length === 0 ? (
            <Text style={styles.empty}>{copy.vocabulary.empty}</Text>
          ) : (
            <FlatList
              data={words}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => setSelected(item)}
                  accessibilityRole="button"
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowWord}>{item.word}</Text>
                    <Text style={styles.rowPos}>{item.pos}</Text>
                  </View>
                  <CaretRightIcon size={16} color={colors.subtext} />
                </Pressable>
              )}
              ItemSeparatorComponent={Divider}
            />
          )}
        </View>

        <PackWordDetailSheet
          visible={selected != null}
          word={selected}
          onClose={() => setSelected(null)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
