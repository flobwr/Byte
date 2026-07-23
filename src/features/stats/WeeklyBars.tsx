import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '../../components/ui/AppText';
import { type WeekBar } from './useStats';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { formatDurationCompact } from '../../utils/time';

const TRACK_HEIGHT = 128;

type WeeklyBarsProps = {
  bars: WeekBar[];
  max: number;
  accent?: string;
};

function Bar({ bar, max, accent, index }: { bar: WeekBar; max: number; accent: string; index: number }) {
  const colors = useColors();
  const grow = useSharedValue(0);
  const target = Math.max(bar.ms > 0 ? 0.06 : 0, bar.ms / max);

  useEffect(() => {
    grow.value = withDelay(
      index * 70,
      withTiming(target, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [grow, target, index]);

  const style = useAnimatedStyle(() => ({ height: TRACK_HEIGHT * grow.value }));
  const hasTime = bar.ms > 0;

  return (
    <View style={styles.col}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: bar.isToday ? accent : colors.fillMedium },
            style,
          ]}
        />
      </View>
      <AppText
        variant="caption"
        color={bar.isToday ? 'primary' : 'tertiary'}
        style={styles.dayLabel}
      >
        {bar.label}
      </AppText>
      <AppText variant="caption" color="tertiary" tabular style={styles.value}>
        {hasTime ? formatDurationCompact(bar.ms) : ''}
      </AppText>
    </View>
  );
}

function WeeklyBarsBase({ bars, max, accent }: WeeklyBarsProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      {bars.map((bar, i) => (
        <Bar key={i} bar={bar} max={max} accent={accent ?? colors.accent} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center', gap: spacing.xs },
  track: {
    height: TRACK_HEIGHT,
    width: 14,
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: radius.pill, minHeight: 3 },
  dayLabel: { marginTop: spacing.xxs },
  value: { fontSize: 10, lineHeight: 12, height: 12 },
});

export const WeeklyBars = memo(WeeklyBarsBase);
