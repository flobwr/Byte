import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { Sheet } from '../../components/ui/Sheet';
import {
  type CategoryId,
  colorForCategory,
  resolveCategory,
  selectVisibleCategories,
  useCategoriesStore,
} from '../../stores/categoriesStore';
import { type LogEntry, useTimerStore } from '../../stores/timerStore';
import { radius, spacing } from '../../theme/spacing';
import { sizes } from '../../theme/sizes';
import { useColors } from '../../theme/ThemeContext';
import { formatDuration } from '../../utils/time';

type EditEntrySheetProps = {
  entry: LogEntry | null;
  dayKey: string;
  onClose: () => void;
};

/** Bottom-sheet-style modal to reassign a logged entry to another activity, or remove it. */
export function EditEntrySheet({ entry, dayKey, onClose }: EditEntrySheetProps) {
  const colors = useColors();
  const editEntry = useTimerStore((s) => s.editEntry);
  const deleteEntry = useTimerStore((s) => s.deleteEntry);
  const categories = useCategoriesStore(useShallow(selectVisibleCategories));

  // The parent clears `entry` the instant an action closes the sheet, but the
  // close animation still has ~190ms left to play — keep showing the last
  // known entry during that window instead of the content dropping out early.
  const [lastEntry, setLastEntry] = useState(entry);
  useEffect(() => {
    if (entry) setLastEntry(entry);
  }, [entry]);
  const shown = entry ?? lastEntry;

  const pick = (id: CategoryId) => {
    if (!shown) return;
    if (id !== shown.category) {
      Haptics.selectionAsync();
      editEntry(dayKey, shown.id, id);
    }
    onClose();
  };

  const remove = () => {
    if (!shown) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Supprimer cette activité', 'Le temps enregistré sera retiré des statistiques.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteEntry(dayKey, shown.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Sheet visible={entry !== null} onClose={onClose} maxHeight="78%">
      {shown && (
        <>
          <View style={styles.head}>
            <AppText variant="title3">Réattribuer à…</AppText>
            <AppText variant="callout" color="secondary">
              {formatDuration(shown.ms)} actuellement sur {resolveCategory(shown.category).label}
            </AppText>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {categories.map((cat) => {
                const active = cat.id === shown.category;
                const accent = colorForCategory(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => pick(cat.id)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: active ? accent + '22' : colors.fillFaint,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={cat.label}
                  >
                    <View style={[styles.optionThumb, { backgroundColor: accent + '22' }]}>
                      <Mascot name={cat.mascot} size={sizes.thumbMd - 14} animated={false} />
                    </View>
                    <AppText variant="callout" numberOfLines={1}>
                      {cat.label}
                    </AppText>
                    {active && <Icon name="check" size={16} color={accent} />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <Pressable
            onPress={remove}
            style={({ pressed }) => [styles.deleteRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
          >
            <Icon name="trash" size={16} color={colors.danger} />
            <AppText variant="callout" color="danger">
              Supprimer cette activité
            </AppText>
          </Pressable>
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.xxs, marginBottom: spacing.lg },
  list: { flexGrow: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingBottom: spacing.md },
  option: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  optionThumb: {
    width: sizes.thumbMd,
    height: sizes.thumbMd,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
});
