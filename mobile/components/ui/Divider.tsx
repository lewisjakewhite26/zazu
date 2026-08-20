import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

type DividerProps = {
  style?: StyleProp<ViewStyle>;
};

/** A single themed hairline — for separating rows within one shared surface, never a second box. */
export function Divider({ style }: DividerProps) {
  const { colors } = useTheme();

  return <View style={[styles.line, { backgroundColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
  },
});
