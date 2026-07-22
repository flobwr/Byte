import { Image, type ImageStyle } from 'expo-image';
import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MASCOTS, type MascotKey } from '../constants/mascots';
import { hasParticles, MascotParticles } from './mascot/MascotParticles';

const AImage = Animated.createAnimatedComponent(Image);

type MascotProps = {
  name: MascotKey;
  size?: number;
  /** Gentle breathing + floating idle, plus rare blink/twitch. Off for thumbnails. */
  animated?: boolean;
  /** Ambient, category-specific overlay accessories + change transition. */
  effects?: boolean;
  style?: ImageStyle;
};

/**
 * Renders a mascot sprite with a layered, discreet "alive" idle: continuous
 * breathing + slow float, plus randomly-timed blink-nods and micro tail/ear
 * flicks so it never feels frozen but never fidgets either. Transforms are kept
 * near-uniform so the pixel art is not distorted. When `effects` is on, the
 * sprite also does a soft fade+zoom whenever the category (name) changes.
 */
function MascotBase({ name, size = 180, animated = true, effects = false, style }: MascotProps) {
  const breath = useSharedValue(0);
  const float = useSharedValue(0);
  const blink = useSharedValue(0);
  const flick = useSharedValue(0);
  const pop = useSharedValue(1);

  // Continuous breathing + float.
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
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [animated, breath, float]);

  // Randomly-timed blink-nods and micro flicks (setTimeout — cheap, off-frame).
  useEffect(() => {
    if (!animated) return;
    let alive = true;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let flickTimer: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      blinkTimer = setTimeout(
        () => {
          if (!alive) return;
          blink.value = withSequence(
            withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) }),
          );
          scheduleBlink();
        },
        2600 + Math.random() * 4200,
      );
    };
    const scheduleFlick = () => {
      flickTimer = setTimeout(
        () => {
          if (!alive) return;
          const dir = Math.random() > 0.5 ? 1 : -1;
          flick.value = withSequence(
            withTiming(dir, { duration: 120, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          );
          scheduleFlick();
        },
        4000 + Math.random() * 5000,
      );
    };
    scheduleBlink();
    scheduleFlick();
    return () => {
      alive = false;
      clearTimeout(blinkTimer);
      clearTimeout(flickTimer);
    };
  }, [animated, blink, flick]);

  // Fade+zoom pop whenever the category changes (hero only).
  useEffect(() => {
    if (!effects) return;
    pop.value = 0.92;
    pop.value = withSpring(1, { damping: 13, stiffness: 170, mass: 0.6 });
  }, [name, effects, pop]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = (1 + breath.value * 0.022) * (1 - blink.value * 0.02) * pop.value;
    const translateY = -breath.value * 2 - float.value * 3 + blink.value * 2;
    const rotate = flick.value * 0.55;
    return {
      transform: [{ scale }, { translateY }, { rotateZ: `${rotate}deg` }],
    };
  });

  const showParticles = effects && hasParticles(name);

  const image = (
    <AImage
      source={MASCOTS[name]}
      style={[{ width: size, height: size }, styles.img, animatedStyle, style]}
      contentFit="contain"
      transition={240}
      cachePolicy="memory-disk"
      accessibilityIgnoresInvertColors
    />
  );

  if (!showParticles) return image;

  return (
    <View style={{ width: size, height: size }}>
      {image}
      <MascotParticles name={name} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  img: { alignSelf: 'center' },
});

export const Mascot = memo(MascotBase);
