import { memo, useEffect } from 'react';
import { StyleSheet, TextInput, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '../../theme/motion';
import { useColors } from '../../theme/ThemeContext';
import { typography, type TypographyVariant } from '../../theme/typography';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type CountKind = 'duration' | 'int';

type AnimatedCountProps = {
  value: number;
  kind: CountKind;
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
};

function fmtDuration(ms: number): string {
  'worklet';
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function fmtInt(n: number): string {
  'worklet';
  return `${Math.round(n)}`;
}

/**
 * Displays a number that tweens to its target on the UI thread (via an
 * animated, non-editable TextInput) — the value counts up without ever
 * re-rendering or moving its container.
 */
function AnimatedCountBase({
  value,
  kind,
  variant = 'title2',
  color,
  style,
}: AnimatedCountProps) {
  const colors = useColors();
  const resolvedColor = color ?? colors.textPrimary;
  const sv = useSharedValue(value);

  useEffect(() => {
    sv.value = withTiming(value, {
      duration: motion.duration.value,
      easing: motion.easing.standard,
    });
  }, [value, sv]);

  const animatedProps = useAnimatedProps(() => {
    const text = kind === 'duration' ? fmtDuration(sv.value) : fmtInt(sv.value);
    return { text, defaultValue: text } as object;
  });

  const initial = kind === 'duration' ? fmtDuration(value) : fmtInt(value);

  return (
    <AnimatedTextInput
      editable={false}
      pointerEvents="none"
      underlineColorAndroid="transparent"
      defaultValue={initial}
      animatedProps={animatedProps}
      style={[
        styles.base,
        typography[variant],
        { color: resolvedColor, fontVariant: ['tabular-nums'] },
        style,
      ]}
      accessible
      accessibilityLabel={initial}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 0,
    margin: 0,
  },
});

export const AnimatedCount = memo(AnimatedCountBase);
