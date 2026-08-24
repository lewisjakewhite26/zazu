import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type TextStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const BAND_WIDTH = 90;
const BAND_HEIGHT = 70;

export type ShimmerTextProps = {
  children: string;
  style: TextStyle;
  /** Colour of the light sweep itself. Defaults to a soft white, which reads on any background. */
  sweepColor?: string;
  delay?: number;
  duration?: number;
};

/** A single diagonal light sweep across the text, once per mount -- the "sparkle" from the alarm greeting. */
export function ShimmerText({ children, style, sweepColor = 'rgba(255,255,255,0.9)', delay = 500, duration = 2600 }: ShimmerTextProps) {
  const [width, setWidth] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!width) return;
    Animated.timing(shimmerAnim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();
  }, [width, shimmerAnim, duration, delay]);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Text style={style}>{children}</Text>
      {width > 0 ? (
        <MaskedView pointerEvents="none" style={StyleSheet.absoluteFill} maskElement={<Text style={style}>{children}</Text>}>
          <Animated.View
            style={[
              styles.band,
              {
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-BAND_WIDTH, width + BAND_WIDTH],
                    }),
                  },
                  { rotate: '20deg' },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', sweepColor, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </MaskedView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: -BAND_HEIGHT / 3,
    height: BAND_HEIGHT,
    width: BAND_WIDTH,
  },
});
