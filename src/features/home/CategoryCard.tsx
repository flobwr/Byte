import * as Haptics from 'expo-haptics';
import { memo } from 'react';
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
import { categoryColors, colors } from '../../theme/colors';
import { motion } from '../../theme/motion';
import { radius, spacing } from '../../theme/spacing';
import { formatDuration } from '../../utils/time';

type CategoryCardProps = {
  category: Category;
  totalMs: number;
  disabled?: boolean;
  onLog: (id: Category['id']) => void;
};

/**
 * Restrained, high-end card. On press it simply looks *pressed* — a small scale
 * and a slight dim, timing-based (no spring, no bounce, no glow). Feel: Linear.
 */
function CategoryCardBase({ category, totalMs, disabled, onLog }: CategoryCardProps) {
  const accent = categoryColors[category.color];
  const pressed = useSharedValue(0);
  const hasTime = totalMs > 0;

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
        style={[styles.card, { backgroundColor: accent + '12' }, cardStyle, disabled && styles.disabled]}
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
          {hasTime ? formatDuration(totalMs) : '—'}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { flex: 1 },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
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
});

export const CategoryCard = memo(CategoryCardBase);
