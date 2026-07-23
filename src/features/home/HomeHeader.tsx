import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedCount } from '../../components/ui/AnimatedCount';
import { AppText } from '../../components/ui/AppText';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { formatLongDate, greeting } from '../../utils/frDate';

type HomeHeaderProps = {
  totalTodayMs: number;
};

function HomeHeaderBase({ totalTodayMs }: HomeHeaderProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <AppText variant="overline" color="tertiary">
          {formatLongDate()}
        </AppText>
        <AppText variant="display" style={styles.title}>
          {greeting()}
        </AppText>
      </View>

      <View
        style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.hairline }]}
      >
        <AppText variant="caption" color="tertiary">
          Aujourd’hui
        </AppText>
        <AnimatedCount value={totalTodayMs} kind="duration" variant="bodyStrong" color={colors.amber} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: { flex: 1, gap: spacing.xxs },
  title: { marginTop: spacing.xxs },
  chip: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});

export const HomeHeader = memo(HomeHeaderBase);
