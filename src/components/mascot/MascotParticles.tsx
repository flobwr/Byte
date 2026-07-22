import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '../ui/AppText';

export type ParticleKind = 'sleep' | 'steam' | 'notes';

/** Which mascots get an ambient particle effect. */
export const PARTICLE_FOR_MASCOT: Partial<Record<string, ParticleKind>> = {
  sleeping: 'sleep',
  coffee: 'steam',
  music: 'notes',
};

type ParticleProps = {
  kind: ParticleKind;
  delay: number;
  duration: number;
  left: number;
  drift: number;
  scale: number;
};

/** A single rising-and-fading particle (Z, steam puff or musical note). */
function Particle({ kind, delay, duration, left, drift, scale }: ParticleProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [t, delay, duration]);

  const style = useAnimatedStyle(() => {
    // Fade in over the first 25%, hold, then fade out over the last 40%.
    const opacity = t.value < 0.25 ? t.value / 0.25 : t.value > 0.6 ? (1 - t.value) / 0.4 : 1;
    return {
      opacity: Math.max(0, opacity) * 0.9,
      transform: [
        { translateY: -t.value * 34 },
        { translateX: drift * t.value },
        { scale: scale * (0.7 + t.value * 0.5) },
      ],
    };
  });

  if (kind === 'steam') {
    return <Animated.View style={[styles.steam, { left }, style]} />;
  }

  return (
    <Animated.View style={[styles.glyphWrap, { left }, style]}>
      <AppText variant="caption" color={kind === 'notes' ? 'accent' : 'secondary'} style={styles.glyph}>
        {kind === 'sleep' ? 'Z' : PICK_NOTE(left)}
      </AppText>
    </Animated.View>
  );
}

const PICK_NOTE = (seed: number) => (seed % 2 === 0 ? '♪' : '♫');

type MascotParticlesProps = {
  kind: ParticleKind;
  size: number;
};

/** Overlay layer of 3 staggered particles anchored above the mascot's head. */
function MascotParticlesBase({ kind, size }: MascotParticlesProps) {
  // Anchor point sits toward the upper area of the sprite.
  const cx = size * 0.5;
  const specs: ParticleProps[] =
    kind === 'sleep'
      ? [
          { kind, delay: 0, duration: 2600, left: cx - 8, drift: 10, scale: 1 },
          { kind, delay: 900, duration: 2600, left: cx - 20, drift: 8, scale: 0.8 },
          { kind, delay: 1700, duration: 2600, left: cx - 30, drift: 6, scale: 0.65 },
        ]
      : kind === 'steam'
        ? [
            { kind, delay: 0, duration: 2200, left: cx - 26, drift: 6, scale: 1 },
            { kind, delay: 700, duration: 2200, left: cx - 20, drift: -5, scale: 0.9 },
            { kind, delay: 1400, duration: 2200, left: cx - 14, drift: 4, scale: 0.8 },
          ]
        : [
            { kind, delay: 0, duration: 2400, left: cx - 34, drift: -8, scale: 1 },
            { kind, delay: 800, duration: 2400, left: cx - 44, drift: -12, scale: 0.85 },
            { kind, delay: 1600, duration: 2400, left: cx - 24, drift: -6, scale: 0.7 },
          ];

  return (
    <View pointerEvents="none" style={[styles.layer, { height: size * 0.42 }]}>
      {specs.map((s, i) => (
        <Particle key={i} {...s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  glyphWrap: { position: 'absolute', top: 6 },
  glyph: { fontWeight: '800', fontSize: 15 },
  steam: {
    position: 'absolute',
    top: 10,
    width: 7,
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
});

export const MascotParticles = memo(MascotParticlesBase);
