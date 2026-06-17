import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/ui/GradientBackground';
import { typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>This page is not here.</Text>
            <Link href="/" style={styles.link}>
              <Text style={[styles.linkText, { color: colors.ink }]}>Back to home</Text>
            </Link>
          </View>
        </SafeAreaView>
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    ...typography.learnDef,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
  },
  linkText: {
    ...typography.btnPrimary,
  },
});
