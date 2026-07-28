import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { copy } from '@/constants/copy';
import { fonts, typography } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

type WordLibraryErrorBannerProps = {
  onRetry: () => void;
  retrying?: boolean;
};

/** index.html .wotd-error */
export function WordLibraryErrorBanner({ onRetry, retrying = false }: WordLibraryErrorBannerProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          width: '100%',
          marginBottom: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 14,
          backgroundColor: 'rgba(232,97,122,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(232,97,122,0.35)',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
        },
        text: {
          ...typography.wotdDef,
          flex: 1,
          minWidth: 160,
          color: colors.text,
          lineHeight: 22,
        },
        btn: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 6,
          paddingHorizontal: 14,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
        btnText: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 12,
          color: colors.text,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{copy.home.wordLibraryError}</Text>
      <Pressable
        style={styles.btn}
        onPress={onRetry}
        disabled={retrying}
        accessibilityRole="button"
        accessibilityLabel={copy.home.wordLibraryRetry}
      >
        {retrying ? <ActivityIndicator size="small" color={colors.text} /> : null}
        <Text style={styles.btnText}>{copy.home.wordLibraryRetry}</Text>
      </Pressable>
    </View>
  );
}
