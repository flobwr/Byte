import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { type Category } from '../../constants/categories';
import { categoryColors, colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { formatDuration } from '../../utils/time';

type CategoryCardProps = {
  category: Category;
  totalMs: number;
  disabled?: boolean;
  onLog: (id: Category['id']) => void;
};

const SPRING = { damping: 15, stiffness: 220, mass: 0.6 };

function CategoryCardBase({ category, totalMs, disabled, onLog }: CategoryCardProps) {
  const accent = categoryColors[category.color];
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const hasTime = totalMs > 0;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: glow.value > 0 ? accent : colors.hairline,
    shadowOpacity: interpolate(glow.value, [0, 1], [0.12, 0.55]),
    shadowRadius: interpolate(glow.value, [0, 1], [14, 22]),
  }));

  const sheenStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.14 }));

  const press = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    glow.value = withTiming(1, { duration: 130 }, () => {
      glow.value = withTiming(0, { duration: 420 });
    });
    onLog(category.id);
  };

  return (
    <Pressable
      onPress={press}
      onPressIn={() => (scale.value = withSpring(0.955, SPRING))}
      onPressOut={() => (scale.value = withSpring(1, SPRING))}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${formatDuration(totalMs)} aujourd’hui`}
      style={styles.pressable}
    >
      <Animated.View
        style={[styles.card, { backgroundColor: accent + '12', shadowColor: accent }, cardStyle, disabled && styles.disabled]}
      >
        {/* Selection sheen — brief accent wash on tap. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.sheen, { backgroundColor: accent }, sheenStyle]}
        />

        <View style={styles.top}>
          <View style={[styles.thumb, { backgroundColor: accent + '24' }]}>
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
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  disabled: { opacity: 0.42 },
  sheen: { ...StyleSheet.absoluteFillObject },
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
