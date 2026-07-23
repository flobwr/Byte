import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AnimatedCount } from '../../components/ui/AnimatedCount';
import { AppText } from '../../components/ui/AppText';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type RingProgressProps = {
  /** 0..100 */
  progress: number;
  label: string;
  size?: number;
  stroke?: number;
  accent?: string;
};

/** Animated circular progress (SVG) — the day-score ring. Expo Go safe (no Skia). */
function RingProgressBase({
  progress,
  label,
  size = 132,
  stroke = 12,
  accent,
}: RingProgressProps) {
  const colors = useColors();
  const resolvedAccent = accent ?? colors.accent;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withDelay(
      200,
      withTiming(Math.max(0, Math.min(1, progress / 100)), {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [progress, anim]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - anim.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.fillSoft}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={resolvedAccent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <AnimatedCount value={progress} kind="int" variant="title1" style={styles.score} />
        <AppText variant="caption" color="tertiary" style={styles.label}>
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 34, lineHeight: 38 },
  label: { marginTop: spacing.xxs },
});

export const RingProgress = memo(RingProgressBase);
