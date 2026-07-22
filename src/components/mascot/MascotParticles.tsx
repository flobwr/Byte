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

import { type MascotKey } from '../../constants/mascots';
import { AppText } from '../ui/AppText';

export type ParticleKind = 'sleep' | 'steam' | 'notes';

type FxConfig = {
  kind: ParticleKind;
  /** Emission point as a fraction of the sprite box (top-left origin). */
  origin: { x: number; y: number };
  /** Rise distance / horizontal sway, as fractions of sprite size. */
  travel: number;
  sway: number;
  count: number;
};

/**
 * Per-mascot particle emitters, anchored to the exact spot on the sprite the
 * effect should come from (Z above the head, steam from the cup, notes from the
 * earbud). Loops are independent, infinite and slow so the cat stays the star.
 */
export const MASCOT_FX: Partial<Record<MascotKey, FxConfig>> = {
  sleeping: { kind: 'sleep', origin: { x: 0.33, y: 0.3 }, travel: 0.2, sway: 0.05, count: 3 },
  coffee: { kind: 'steam', origin: { x: 0.22, y: 0.52 }, travel: 0.22, sway: 0.03, count: 3 },
  music: { kind: 'notes', origin: { x: 0.64, y: 0.33 }, travel: 0.2, sway: 0.05, count: 3 },
};

export const hasParticles = (name: MascotKey): boolean => MASCOT_FX[name] != null;

const NOTE_GLYPHS = ['♪', '♫'];

type ParticleProps = {
  kind: ParticleKind;
  x: number;
  y: number;
  travel: number;
  sway: number;
  glyph: number;
  delay: number;
  duration: number;
  index: number;
};

function Particle({ kind, x, y, travel, sway, glyph, delay, duration, index }: ParticleProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
  }, [t, delay, duration]);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    // Fade in early, hold, fade out late.
    const opacity = (p < 0.22 ? p / 0.22 : p > 0.62 ? (1 - p) / 0.38 : 1) * 0.85;

    const translateY = -p * travel;
    let translateX: number;
    let scale: number;
    let scaleX = 1;
    let scaleY = 1;

    if (kind === 'notes') {
      translateX = Math.sin(p * Math.PI * 2) * sway; // gentle oscillation
      scale = 1 - p * 0.35;
    } else if (kind === 'sleep') {
      translateX = -p * sway; // drift up-left
      scale = 1 - p * 0.45; // shrink as it rises
    } else {
      // steam: slight wobble + vertical stretch/deform
      translateX = Math.sin(p * Math.PI * 3) * sway;
      scaleY = 1 + p * 0.5;
      scaleX = 1 + Math.sin(p * Math.PI * 4) * 0.18;
      scale = 1;
    }

    return {
      opacity: Math.max(0, opacity),
      transform: [{ translateY }, { translateX }, { scale }, { scaleX }, { scaleY }],
    };
  });

  if (kind === 'steam') {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.steam,
          { left: x, top: y, width: Math.max(4, glyph * 0.42), height: glyph },
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.glyphWrap, { left: x, top: y }, style]}>
      <AppText
        variant="caption"
        color={kind === 'notes' ? 'accent' : 'secondary'}
        style={{ fontSize: glyph, lineHeight: glyph * 1.1, fontWeight: '800' }}
      >
        {kind === 'sleep' ? 'Z' : NOTE_GLYPHS[index % NOTE_GLYPHS.length]}
      </AppText>
    </Animated.View>
  );
}

type MascotParticlesProps = {
  name: MascotKey;
  size: number;
};

function MascotParticlesBase({ name, size }: MascotParticlesProps) {
  const fx = MASCOT_FX[name];
  if (!fx) return null;

  const originX = fx.origin.x * size;
  const originY = fx.origin.y * size;
  const travelPx = fx.travel * size;
  const swayPx = fx.sway * size;
  const glyph = size * 0.1;
  const baseDuration = 3400;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: fx.count }).map((_, i) => (
        <Particle
          key={i}
          index={i}
          kind={fx.kind}
          x={originX + (i - 1) * size * 0.03}
          y={originY}
          travel={travelPx}
          sway={swayPx}
          glyph={glyph}
          delay={(i * baseDuration) / fx.count}
          duration={baseDuration + i * 260}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glyphWrap: { position: 'absolute' },
  steam: {
    position: 'absolute',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});

export const MascotParticles = memo(MascotParticlesBase);
