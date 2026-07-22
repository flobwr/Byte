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
import { categoryColors, colors } from '../../theme/colors';
import { AppText } from '../ui/AppText';

export type ParticleKind =
  | 'zzz'
  | 'notes'
  | 'steam'
  | 'sparkle'
  | 'bubble'
  | 'dot'
  | 'glow'
  | 'sweat';

type FxConfig = {
  kind: ParticleKind;
  /** Emission point as a fraction of the sprite box (top-left origin). */
  origin: { x: number; y: number };
  count: number;
  /** Loop length in ms — the higher, the slower/calmer. */
  period: number;
};

/**
 * Per-mascot accessory emitters, each anchored to the exact spot on the sprite
 * the effect should come from. Only the hero mascot mounts these, so at most one
 * set animates at a time. Loops are independent, infinite and slow — the cat is
 * always the star.
 */
export const MASCOT_FX: Partial<Record<MascotKey, FxConfig>> = {
  sleeping: { kind: 'zzz', origin: { x: 0.33, y: 0.3 }, count: 3, period: 3400 },
  music: { kind: 'notes', origin: { x: 0.64, y: 0.33 }, count: 3, period: 3200 },
  coffee: { kind: 'steam', origin: { x: 0.2, y: 0.5 }, count: 3, period: 2600 },
  eating: { kind: 'steam', origin: { x: 0.44, y: 0.58 }, count: 3, period: 2600 },
  writing: { kind: 'sparkle', origin: { x: 0.34, y: 0.68 }, count: 3, period: 2200 },
  working: { kind: 'glow', origin: { x: 0.3, y: 0.58 }, count: 1, period: 2600 },
  reading: { kind: 'glow', origin: { x: 0.34, y: 0.7 }, count: 1, period: 3000 },
  gaming: { kind: 'glow', origin: { x: 0.5, y: 0.64 }, count: 1, period: 2400 },
  phone: { kind: 'bubble', origin: { x: 0.4, y: 0.36 }, count: 2, period: 3800 },
  meditating: { kind: 'dot', origin: { x: 0.5, y: 0.5 }, count: 3, period: 4200 },
  sport: { kind: 'sweat', origin: { x: 0.56, y: 0.4 }, count: 2, period: 4200 },
};

export const hasParticles = (name: MascotKey): boolean => MASCOT_FX[name] != null;

const NOTE_GLYPHS = ['♪', '♫'];

type ParticleProps = {
  kind: ParticleKind;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  index: number;
};

/** A single looping accessory element. Motion is fully worklet-driven (UI thread). */
function Particle({ kind, x, y, size, delay, duration, index }: ParticleProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
  }, [t, delay, duration]);

  const unit = size; // px per fraction
  const style = useAnimatedStyle(() => {
    const p = t.value;
    const fadeIn = p < 0.22 ? p / 0.22 : 1;
    const fadeOut = p > 0.62 ? Math.max(0, (1 - p) / 0.38) : 1;
    let opacity = fadeIn * fadeOut;
    let translateX = 0;
    let translateY = 0;
    let scale = 1;
    let scaleX = 1;
    let scaleY = 1;

    switch (kind) {
      case 'zzz':
        translateY = -p * unit * 0.2;
        translateX = -p * unit * 0.05;
        scale = 1 - p * 0.45;
        opacity *= 0.85;
        break;
      case 'notes':
        translateY = -p * unit * 0.2;
        translateX = Math.sin(p * Math.PI * 2) * unit * 0.05;
        scale = 1 - p * 0.35;
        opacity *= 0.85;
        break;
      case 'steam':
        translateY = -p * unit * 0.22;
        translateX = Math.sin(p * Math.PI * 3) * unit * 0.03;
        scaleY = 1 + p * 0.5;
        scaleX = 1 + Math.sin(p * Math.PI * 4) * 0.18;
        opacity *= 0.5;
        break;
      case 'dot':
        translateY = -p * unit * 0.24;
        translateX = Math.sin(p * Math.PI * 2 + index) * unit * 0.04;
        scale = 0.8 + Math.sin(p * Math.PI) * 0.2;
        opacity *= 0.5;
        break;
      case 'sparkle':
        // twinkle: scale up then down, barely rising
        translateY = -p * unit * 0.06;
        scale = Math.sin(p * Math.PI); // 0 → 1 → 0
        opacity = Math.sin(p * Math.PI) * 0.9;
        break;
      case 'bubble':
        // pop in, hold, fade — a chat bubble surfacing
        translateY = -p * unit * 0.08;
        scale = p < 0.2 ? p / 0.2 : 1;
        opacity = fadeOut * 0.9;
        break;
      case 'sweat':
        // appear near the head, slide down, fade
        translateY = p * unit * 0.16;
        scale = p < 0.15 ? p / 0.15 : 1;
        opacity = (p < 0.15 ? p / 0.15 : fadeOut) * 0.7;
        break;
      case 'glow':
        // soft breathing glow over a device/screen — no travel
        opacity = (0.12 + Math.sin(p * Math.PI * 2) * 0.5 + 0.5) * 0.18;
        scale = 1 + Math.sin(p * Math.PI * 2) * 0.04;
        break;
    }

    return {
      opacity: Math.max(0, opacity),
      transform: [{ translateX }, { translateY }, { scale }, { scaleX }, { scaleY }],
    };
  });

  const glyph = size * 0.1;

  if (kind === 'zzz' || kind === 'notes') {
    return (
      <Animated.View pointerEvents="none" style={[styles.abs, { left: x, top: y }, style]}>
        <AppText
          variant="caption"
          color={kind === 'notes' ? 'accent' : 'secondary'}
          style={{ fontSize: glyph, lineHeight: glyph * 1.1, fontWeight: '800' }}
        >
          {kind === 'zzz' ? 'Z' : NOTE_GLYPHS[index % NOTE_GLYPHS.length]}
        </AppText>
      </Animated.View>
    );
  }

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

  if (kind === 'dot') {
    const d = Math.max(4, size * 0.03);
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.dot, { left: x, top: y, width: d, height: d, borderRadius: d / 2 }, style]}
      />
    );
  }

  if (kind === 'sparkle') {
    const d = Math.max(5, size * 0.05);
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.sparkle, { left: x, top: y, width: d, height: d }, style]}
      />
    );
  }

  if (kind === 'sweat') {
    const w = Math.max(4, size * 0.035);
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.sweat, { left: x, top: y, width: w, height: w * 1.4 }, style]}
      />
    );
  }

  if (kind === 'bubble') {
    const w = size * 0.14;
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.bubble, { left: x, top: y, width: w, height: w * 0.64 }, style]}
      >
        <View style={[styles.bubbleDot, { backgroundColor: colors.textSecondary }]} />
        <View style={[styles.bubbleDot, { backgroundColor: colors.textSecondary }]} />
        <View style={[styles.bubbleDot, { backgroundColor: colors.textSecondary }]} />
      </Animated.View>
    );
  }

  // glow
  const w = size * 0.3;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.glow, { left: x, top: y, width: w, height: w * 0.62 }, style]}
    />
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

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: fx.count }).map((_, i) => (
        <Particle
          key={i}
          index={i}
          kind={fx.kind}
          x={originX + (i - (fx.count - 1) / 2) * size * 0.05}
          y={originY}
          size={size}
          delay={(i * fx.period) / fx.count}
          duration={fx.period + i * 220}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  steam: {
    position: 'absolute',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dot: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.5)' },
  sparkle: {
    position: 'absolute',
    backgroundColor: colors.amber,
    borderRadius: 1,
  },
  sweat: {
    position: 'absolute',
    backgroundColor: categoryColors.sky,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 2,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(240,240,245,0.92)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bubbleDot: { width: 3, height: 3, borderRadius: 2 },
  glow: {
    position: 'absolute',
    backgroundColor: categoryColors.sky,
    borderRadius: 10,
  },
});

export const MascotParticles = memo(MascotParticlesBase);
