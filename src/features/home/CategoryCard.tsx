import * as Haptics from 'expo-haptics';
import { memo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { type Category } from '../../constants/categories';
import { categoryColors } from '../../theme/colors';
import { motion } from '../../theme/motion';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { formatDuration } from '../../utils/time';

type CategoryCardProps = {
  category: Category;
  totalMs: number;
  /** Daily time target, in ms. When set, the card shows a progress bar. */
  goalMs?: number;
  disabled?: boolean;
  onLog: (id: Category['id']) => void;
};

/**
 * Restrained, high-end card. On press it simply looks *pressed* — a small scale
 * and a slight dim, timing-based (no spring, no bounce, no glow). Feel: Linear.
 */
function CategoryCardBase({ category, totalMs, goalMs, disabled, onLog }: CategoryCardProps) {
  const colors = useColors();
  const accent = categoryColors[category.color];
  const pressed = useSharedValue(0);
  const hasTime = totalMs > 0;
  const hasGoal = (goalMs ?? 0) > 0;
  const fraction = hasGoal ? Math.min(1, totalMs / (goalMs as number)) : 0;
  const reached = hasGoal && totalMs >= (goalMs as number);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - motion.press.cardScale) }],
    opacity: 1 - pressed.value * (1 - motion.press.dim),
  }));

  const pressIn = () =>
    withTiming(1, { duration: motion.duration.press, easing: motion.easing.standard });
  const release = () => withSpring(0, motion.spring.press);

  const press = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLog(category.id);
  };

  const grow = useSharedValue(0);
  useEffect(() => {
    grow.value = withTiming(fraction, { duration: motion.duration.value, easing: motion.easing.standard });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fraction]);

  const pop = useSharedValue(1);
  const wasReached = useRef(false);
  useEffect(() => {
    if (reached && !wasReached.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      pop.value = 0.88;
      pop.value = withSpring(1, motion.spring.press);
    }
    wasReached.current = reached;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reached]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(hasGoal && fraction > 0 ? 4 : 0, grow.value * 100)}%`,
  }));
  const barScaleStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: pop.value }] }));

  return (
    <Pressable
      onPress={press}
      onPressIn={() => (pressed.value = pressIn())}
      onPressOut={() => (pressed.value = release())}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${formatDuration(totalMs)} aujourd’hui`}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: accent + '12', borderColor: colors.hairline },
          cardStyle,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.top}>
          <View style={[styles.thumb, { backgroundColor: accent + '20' }]}>
            <Mascot name={category.mascot} size={50} animated={false} />
          </View>
          <View style={[styles.dot, { backgroundColor: hasTime ? accent : colors.fillMedium }]} />
        </View>

        <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
          {category.label}
        </AppText>
        <AppText
          variant="callout"
          color={hasTime ? 'secondary' : 'tertiary'}
          tabular
          style={styles.total}
        >
          {hasGoal
            ? `${formatDuration(totalMs)} / ${formatDuration(goalMs as number)}`
            : hasTime
              ? formatDuration(totalMs)
              : '—'}
        </AppText>

        {hasGoal && (
          <View style={[styles.track, { backgroundColor: colors.fillSoft }]}>
            <Animated.View
              style={[styles.trackFill, { backgroundColor: reached ? colors.positive : accent }, barStyle, barScaleStyle]}
            />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  disabled: { opacity: 0.42 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { marginTop: spacing.xxs },
  total: { marginTop: spacing.xxs },
  track: {
    height: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  trackFill: { height: '100%', borderRadius: radius.pill },
});

export const CategoryCard = memo(CategoryCardBase);
