import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { fonts } from '@/constants/theme';
import { spacing } from '@/constants/layout';
import { useTheme } from '@/context/ThemeContext';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  text: string;
  style?: AppAlertButtonStyle;
  onPress?: () => void;
};

export type AppAlertOptions = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

let showFn: ((options: AppAlertOptions) => void) | null = null;

/** Drop-in replacement for Alert.alert that matches the app's own visual system on every platform. */
export function showAppAlert(options: AppAlertOptions) {
  showFn?.(options);
}

export function AppAlertHost() {
  const { colors, blend } = useTheme();
  const [current, setCurrent] = useState<AppAlertOptions | null>(null);

  useEffect(() => {
    showFn = (options) => setCurrent(options);
    return () => {
      showFn = null;
    };
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
          ...(Platform.OS === 'web'
            ? ({ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as object)
            : null),
        },
        card: {
          width: '100%',
          maxWidth: 340,
          backgroundColor: colors.sheetBg,
        },
        content: {
          padding: spacing.lg,
        },
        title: {
          fontFamily: fonts.sansSemiBold,
          fontSize: 17,
          color: colors.text,
          textAlign: 'center',
          marginBottom: 6,
        },
        message: {
          fontFamily: fonts.sans,
          fontSize: 14,
          lineHeight: 20,
          color: colors.subtext,
          textAlign: 'center',
          marginBottom: spacing.md,
        },
        buttons: {
          gap: spacing.sm,
        },
      }),
    [colors],
  );

  const close = () => setCurrent(null);

  if (!current) return null;

  const buttons = current.buttons?.length ? current.buttons : [{ text: 'OK' as const }];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        {Platform.OS !== 'web' ? (
          <BlurView
            intensity={30}
            tint={blend >= 0.5 ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 340 }}>
          <GlassCard borderRadius={24} style={styles.card} contentStyle={styles.content}>
            <Text style={styles.title}>{current.title}</Text>
            {current.message ? <Text style={styles.message}>{current.message}</Text> : null}
            <View style={styles.buttons}>
              {buttons.map((button) => (
                <PrimaryButton
                  key={button.text}
                  label={button.text}
                  variant={button.style === 'cancel' ? 'outline' : 'filled'}
                  style={
                    button.style === 'destructive' ? { backgroundColor: colors.wrong } : undefined
                  }
                  onPress={() => {
                    close();
                    button.onPress?.();
                  }}
                />
              ))}
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
