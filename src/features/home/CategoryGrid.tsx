import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { type Category, type CategoryId, DEFAULT_CATEGORIES } from '../../constants/categories';
import { type DayTotals } from '../../stores/timerStore';
import { spacing } from '../../theme/spacing';
import { CategoryCard } from './CategoryCard';

type CategoryGridProps = {
  totals: DayTotals;
  disabled?: boolean;
  onLog: (id: CategoryId) => void;
};

/** 2-column grid of activity cards. Kept as pairs of rows for stable layout. */
function CategoryGridBase({ totals, disabled, onLog }: CategoryGridProps) {
  const rows: Category[][] = [];
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i += 2) {
    rows.push(DEFAULT_CATEGORIES.slice(i, i + 2));
  }

  return (
    <View style={styles.grid}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              totalMs={totals[cat.id] ?? 0}
              disabled={disabled}
              onLog={onLog}
            />
          ))}
          {row.length === 1 && <View style={styles.spacer} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  spacer: { flex: 1 },
});

export const CategoryGrid = memo(CategoryGridBase);
