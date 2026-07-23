import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { CATEGORY_BY_ID, colorForCategory } from '../../constants/categories';
import { type LogEntry } from '../../stores/timerStore';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { formatDuration } from '../../utils/time';
import { EditEntrySheet } from './EditEntrySheet';

type DayHistoryProps = {
  entries: readonly LogEntry[];
  dayKey: string;
  /** Only offered when true — undo only ever targets today's very last entry. */
  canUndo?: boolean;
  onUndoLast?: () => void;
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Chronological log of the day's activities — tap a row to reassign it. */
export function DayHistory({ entries, dayKey, canUndo, onUndoLast }: DayHistoryProps) {
  const colors = useColors();
  const [editing, setEditing] = useState<LogEntry | null>(null);

  const undo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUndoLast?.();
  };

  return (
    <Card padding="xl" cornerRadius="xxl">
      <View style={styles.head}>
        <AppText variant="title3">Historique de la journée</AppText>
        {canUndo && onUndoLast && (
          <Pressable
            onPress={undo}
            hitSlop={8}
            style={({ pressed }) => [styles.undo, { opacity: pressed ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Annuler la dernière activité"
          >
            <Icon name="undo" size={15} color={colors.textSecondary} />
            <AppText variant="caption" color="secondary">
              Annuler
            </AppText>
          </Pressable>
        )}
      </View>

      {entries.length === 0 ? (
        <AppText variant="callout" color="tertiary" style={styles.empty}>
          Aucune activité enregistrée pour l’instant.
        </AppText>
      ) : (
        <View style={styles.rows}>
          {entries.map((entry, i) => {
            const cat = CATEGORY_BY_ID[entry.category];
            const accent = colorForCategory(entry.category);
            return (
              <Animated.View
                key={entry.id}
                entering={FadeIn.duration(220).delay(Math.min(i, 6) * 30)}
                layout={Layout.springify().damping(18)}
              >
                <Pressable
                  onPress={() => setEditing(entry)}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: pressed ? colors.fillFaint : 'transparent' },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatTime(entry.startedAt)}, ${cat.label}, ${formatDuration(entry.ms)}. Toucher pour modifier.`}
                >
                  <AppText variant="caption" color="tertiary" tabular style={styles.time}>
                    {formatTime(entry.startedAt)}
                  </AppText>
                  <View style={[styles.thumb, { backgroundColor: accent + '1F' }]}>
                    <Mascot name={cat.mascot} size={26} animated={false} />
                  </View>
                  <AppText variant="callout" style={styles.label} numberOfLines={1}>
                    {cat.label}
                  </AppText>
                  <AppText variant="callout" color="secondary" tabular>
                    {formatDuration(entry.ms)}
                  </AppText>
                  <Icon name="edit" size={14} color={colors.textTertiary} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      <EditEntrySheet entry={editing} dayKey={dayKey} onClose={() => setEditing(null)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  undo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  empty: { paddingVertical: spacing.sm },
  rows: { gap: spacing.xxs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  time: { width: 44 },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: { flex: 1 },
});
