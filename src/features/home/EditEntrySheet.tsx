import * as Haptics from 'expo-haptics';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { CATEGORY_BY_ID, colorForCategory, DEFAULT_CATEGORIES, type CategoryId } from '../../constants/categories';
import { type LogEntry, useTimerStore } from '../../stores/timerStore';
import { radius, spacing } from '../../theme/spacing';
import { useShadows } from '../../theme/shadows';
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
  const shadows = useShadows();
  const editEntry = useTimerStore((s) => s.editEntry);
  const deleteEntry = useTimerStore((s) => s.deleteEntry);

  if (!entry) return null;

  const pick = (id: CategoryId) => {
    if (id !== entry.category) {
      Haptics.selectionAsync();
      editEntry(dayKey, entry.id, id);
    }
    onClose();
  };

  const remove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Supprimer cette activité', 'Le temps enregistré sera retiré des statistiques.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteEntry(dayKey, entry.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.scrim }]} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
      <View pointerEvents="box-none" style={styles.wrap}>
        <Animated.View
          entering={FadeInDown.duration(260).springify().damping(18)}
          exiting={FadeOut.duration(160)}
          style={[styles.sheet, shadows.lg, { backgroundColor: colors.surfaceElevated, borderColor: colors.hairlineStrong }]}
        >
          <View style={styles.handle} />
          <View style={styles.head}>
            <AppText variant="title3">Réattribuer à…</AppText>
            <AppText variant="callout" color="secondary">
              {formatDuration(entry.ms)} actuellement sur {CATEGORY_BY_ID[entry.category].label}
            </AppText>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {DEFAULT_CATEGORIES.map((cat) => {
                const active = cat.id === entry.category;
                const accent = colorForCategory(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => pick(cat.id)}
                    style={({ pressed }) => [
                      styles.option,
                      { backgroundColor: active ? accent + '22' : colors.fillFaint, opacity: pressed ? 0.8 : 1 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={cat.label}
                  >
                    <View style={[styles.optionThumb, { backgroundColor: accent + '22' }]}>
                      <Mascot name={cat.mascot} size={30} animated={false} />
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '78%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginBottom: spacing.lg,
  },
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
    width: 40,
    height: 40,
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
