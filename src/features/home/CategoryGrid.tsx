import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { type Category, type CategoryId, DEFAULT_CATEGORIES } from '../../constants/categories';
import { useSettingsStore } from '../../stores/settingsStore';
import { type DayTotals } from '../../stores/timerStore';
import { spacing } from '../../theme/spacing';
import { CategoryCard } from './CategoryCard';

type CategoryGridProps = {
  totals: DayTotals;
  disabled?: boolean;
  onLog: (id: CategoryId) => void;
};

/** 2-column grid of activity cards with a staggered entrance. */
function CategoryGridBase({ totals, disabled, onLog }: CategoryGridProps) {
  const goals = useSettingsStore((s) => s.goals);
  const rows: Category[][] = [];
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i += 2) {
    rows.push(DEFAULT_CATEGORIES.slice(i, i + 2));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((cat, colIdx) => {
            const index = rowIdx * 2 + colIdx;
            return (
              <Animated.View
                key={cat.id}
                style={styles.cell}
                entering={FadeInDown.delay(190 + index * 45).duration(360)}
              >
                <CategoryCard
                  category={cat}
                  totalMs={totals[cat.id] ?? 0}
                  goalMs={goals[cat.id]}
                  disabled={disabled}
                  onLog={onLog}
                />
              </Animated.View>
            );
          })}
          {row.length === 1 && <View style={styles.spacer} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  cell: { flex: 1 },
  spacer: { flex: 1 },
});

export const CategoryGrid = memo(CategoryGridBase);
