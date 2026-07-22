import { Image, type ImageStyle } from 'expo-image';
import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MASCOTS, type MascotKey } from '../constants/mascots';

const AImage = Animated.createAnimatedComponent(Image);

type MascotProps = {
  name: MascotKey;
  size?: number;
  /** Gentle breathing loop. Disable for static thumbnails. */
  animated?: boolean;
  style?: ImageStyle;
};

/**
 * Renders a mascot sprite with a soft "breathing" idle so it feels alive and
 * embedded in the scene rather than dropped on top of it.
 */
function MascotBase({ name, size = 180, animated = true, style }: MascotProps) {
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      breath.value = 0;
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [animated, breath]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 + breath.value * 0.025;
    const translateY = -breath.value * 3;
    return { transform: [{ scale }, { translateY }] };
  });

  return (
    <AImage
      source={MASCOTS[name]}
      style={[{ width: size, height: size }, styles.img, animatedStyle, style]}
      contentFit="contain"
      transition={220}
      cachePolicy="memory-disk"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  img: { alignSelf: 'center' },
});

export const Mascot = memo(MascotBase);
