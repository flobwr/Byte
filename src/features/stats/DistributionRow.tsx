import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { type Category } from '../../constants/categories';
import { categoryColors, colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { formatDuration } from '../../utils/time';

type DistributionRowProps = {
  category: Category;
  ms: number;
  fraction: number; // 0..1 of the day's max
  index: number;
};

/** One activity row with an animated proportion bar. */
export function DistributionRow({ category, ms, fraction, index }: DistributionRowProps) {
  const accent = categoryColors[category.color];
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.value = withDelay(
      index * 60,
      withTiming(fraction, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [fraction, grow, index]);

  const barStyle = useAnimatedStyle(() => ({ width: `${Math.max(4, grow.value * 100)}%` }));

  return (
    <View style={styles.row}>
      <View style={[styles.thumb, { backgroundColor: accent + '1F' }]}>
        <Mascot name={category.mascot} size={34} animated={false} />
      </View>
      <View style={styles.body}>
        <View style={styles.labelRow}>
          <AppText variant="callout">{category.label}</AppText>
          <AppText variant="callout" color="secondary" tabular>
            {formatDuration(ms)}
          </AppText>
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { backgroundColor: accent }, barStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  body: { flex: 1, gap: spacing.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.fillSoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
