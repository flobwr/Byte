import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { WEEKDAY_INITIALS } from '../../utils/dateRange';
import { dayKey } from '../../utils/time';

type Cell = { date: Date; key: string; inMonth: boolean };

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

function buildMonth(anchor: Date): Cell[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const start = new Date(first);
  start.setDate(1 - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, key: dayKey(d), inMonth: d.getMonth() === anchor.getMonth() };
  });
}

type MonthGridProps = {
  month: Date;
  selectedKey: string;
  todayKey: string;
  minKey?: string | null;
  markedKeys: ReadonlySet<string>;
  onSelect: (key: string) => void;
  onChangeMonth: (deltaMonths: number) => void;
};

function MonthGridBase({
  month,
  selectedKey,
  todayKey,
  minKey,
  markedKeys,
  onSelect,
  onChangeMonth,
}: MonthGridProps) {
  const colors = useColors();
  const cells = buildMonth(month);
  const canGoNext = dayKey(new Date(month.getFullYear(), month.getMonth() + 1, 1)) <= todayKey;

  return (
    <View>
      <View style={styles.head}>
        <Pressable
          onPress={() => onChangeMonth(-1)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.nav,
            { backgroundColor: colors.fillSoft, opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Mois précédent"
        >
          <Icon name="chevronLeft" size={16} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="bodyStrong">
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
        </AppText>
        <Pressable
          onPress={() => canGoNext && onChangeMonth(1)}
          disabled={!canGoNext}
          hitSlop={8}
          style={({ pressed }) => [
            styles.nav,
            { backgroundColor: colors.fillSoft, opacity: !canGoNext ? 0.3 : pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Mois suivant"
        >
          <Icon name="chevronRight" size={16} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAY_INITIALS.map((w, i) => (
          <AppText key={i} variant="caption" color="tertiary" style={styles.weekday}>
            {w}
          </AppText>
        ))}
      </View>

      <Animated.View key={dayKey(month)} entering={FadeIn.duration(200)} style={styles.grid}>
        {cells.map((cell) => {
          const disabled = cell.key > todayKey || (minKey != null && cell.key < minKey);
          const selected = cell.key === selectedKey;
          const isToday = cell.key === todayKey;
          const marked = markedKeys.has(cell.key);

          return (
            <Pressable
              key={cell.key}
              disabled={disabled}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(cell.key);
              }}
              style={styles.cell}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
            >
              <View
                style={[
                  styles.cellInner,
                  selected && { backgroundColor: colors.accent },
                  !selected && isToday && { borderWidth: 1.5, borderColor: colors.accent },
                ]}
              >
                <AppText
                  variant="callout"
                  color={selected ? undefined : !cell.inMonth || disabled ? 'tertiary' : 'primary'}
                  style={selected ? { color: colors.textOnAccent } : undefined}
                >
                  {cell.date.getDate()}
                </AppText>
              </View>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: marked
                      ? selected
                        ? colors.accent
                        : colors.amber
                      : 'transparent',
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  nav: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdays: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: spacing.xxs },
  cellInner: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});

export const MonthGrid = memo(MonthGridBase);
