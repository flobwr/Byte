import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AnimatedCount } from '../../components/ui/AnimatedCount';
import { AppText } from '../../components/ui/AppText';
import { motion } from '../../theme/motion';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';

type StatTileProps = {
  label: string;
  value: number;
  kind: 'duration' | 'int';
  hint?: string;
  accent?: string;
  index?: number;
};

/** Compact KPI tile — the value counts up; the tile itself never moves. */
function StatTileBase({ label, value, kind, hint, accent, index = 0 }: StatTileProps) {
  const colors = useColors();
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 55).duration(motion.duration.reveal)}
      style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.hairline }]}
    >
      <View style={[styles.bar, { backgroundColor: accent ?? colors.accent }]} />
      <AppText variant="overline" color="tertiary">
        {label}
      </AppText>
      <AnimatedCount value={value} kind={kind} variant="title2" style={styles.value} />
      {hint ? (
        <AppText variant="caption" color="tertiary">
          {hint}
        </AppText>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.xxs,
    overflow: 'hidden',
    minHeight: 96,
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: spacing.lg,
    bottom: spacing.lg,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  value: { marginTop: spacing.xxs },
});

export const StatTile = memo(StatTileBase);
