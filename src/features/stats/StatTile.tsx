import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '../../components/ui/AppText';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  index?: number;
};

/** Compact KPI tile — big value, quiet label, optional accent + hint. */
function StatTileBase({ label, value, hint, accent = colors.accent, index = 0 }: StatTileProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60)
        .duration(400)
        .springify()
        .damping(18)}
      style={styles.tile}
    >
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <AppText variant="overline" color="tertiary">
        {label}
      </AppText>
      <AppText variant="title2" tabular style={styles.value}>
        {value}
      </AppText>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
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
