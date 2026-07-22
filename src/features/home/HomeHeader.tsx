import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../components/ui/AppText';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { formatDuration } from '../../utils/time';
import { formatLongDate, greeting } from '../../utils/frDate';

type HomeHeaderProps = {
  totalTodayMs: number;
};

function HomeHeaderBase({ totalTodayMs }: HomeHeaderProps) {
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

      <View style={styles.chip}>
        <AppText variant="caption" color="tertiary">
          Aujourd’hui
        </AppText>
        <AppText variant="bodyStrong" tabular color="amber">
          {formatDuration(totalTodayMs)}
        </AppText>
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});

export const HomeHeader = memo(HomeHeaderBase);
