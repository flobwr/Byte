import { Image, type ImageStyle } from 'expo-image';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { MASCOTS, type MascotKey } from '../constants/mascots';
import { MascotParticles, PARTICLE_FOR_MASCOT } from './mascot/MascotParticles';

const AImage = Animated.createAnimatedComponent(Image);

type MascotProps = {
  name: MascotKey;
  size?: number;
  /** Gentle breathing + floating idle. Disable for static thumbnails. */
  animated?: boolean;
  /** Ambient particles (Z / steam / notes) for eligible mascots. */
  effects?: boolean;
  style?: ImageStyle;
};

/**
 * Renders a mascot sprite with a soft "breathing" + "floating" idle so it feels
 * alive and embedded in the scene rather than dropped on top of it. Transforms
 * are uniform (scale/translate only) so the pixel art is never distorted.
 */
function MascotBase({ name, size = 180, animated = true, effects = false, style }: MascotProps) {
  const breath = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      breath.value = 0;
      float.value = 0;
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
    // Slower, independent float for a very discreet drift.
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [animated, breath, float]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 + breath.value * 0.022;
    const translateY = -breath.value * 2 - float.value * 3;
    return { transform: [{ scale }, { translateY }] };
  });

  const particleKind = effects ? PARTICLE_FOR_MASCOT[name] : undefined;

  const image = (
    <AImage
      source={MASCOTS[name]}
      style={[{ width: size, height: size }, styles.img, animatedStyle, style]}
      contentFit="contain"
      transition={220}
      cachePolicy="memory-disk"
      accessibilityIgnoresInvertColors
    />
  );

  if (!particleKind) return image;

  return (
    <View style={{ width: size, height: size }}>
      {image}
      <MascotParticles kind={particleKind} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  img: { alignSelf: 'center' },
});

export const Mascot = memo(MascotBase);
