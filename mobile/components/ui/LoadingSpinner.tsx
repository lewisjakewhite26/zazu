import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

type LoadingSpinnerProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/** Simple rotating ring — matches prototype loading feel without system ActivityIndicator. */
export function LoadingSpinner({ size = 18, style }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const borderWidth = Math.max(2, Math.round(size / 9));

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]} accessibilityElementsHidden>
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: colors.subtext,
            borderTopColor: colors.blush,
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderStyle: 'solid',
  },
});
