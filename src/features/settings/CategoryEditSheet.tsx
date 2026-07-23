import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { MASCOT_KEYS, type MascotKey } from '../../constants/mascots';
import {
  CATEGORY_COLOR_KEYS,
  CATEGORY_TYPE_LABEL,
  type Category,
  type CategoryId,
  type CategoryType,
  selectVisibleCategories,
  useCategoriesStore,
} from '../../stores/categoriesStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { categoryColors, type CategoryColorKey } from '../../theme/colors';
import { useShadows } from '../../theme/shadows';
import { sizes } from '../../theme/sizes';
import { radius, spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { typography } from '../../theme/typography';
import { formatDuration, MINUTE } from '../../utils/time';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GOAL_STEP = 15 * MINUTE;
const GOAL_MAX = 12 * 60 * MINUTE;
const TYPE_ORDER: readonly CategoryType[] = ['progress', 'essential', 'waste'];
const TYPE_EMOJI: Record<CategoryType, string> = { progress: '🟢', essential: '⚪', waste: '🔴' };

type CategoryEditSheetProps = {
  /** null while closed. Pass an existing category to edit it, or `'new'` to create one. */
  target: Category | 'new' | null;
  onClose: () => void;
};

/**
 * Full editor for one activity: name, illustration, color, type and daily
 * goal in a single sheet — creating and editing share the same form so the
 * two flows never drift apart.
 */
export function CategoryEditSheet({ target, onClose }: CategoryEditSheetProps) {
  const colors = useColors();
  const shadows = useShadows();
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const removeCategory = useCategoriesStore((s) => s.removeCategory);
  const visibleCount = useCategoriesStore((s) => selectVisibleCategories(s).length);
  const setGoal = useSettingsStore((s) => s.setGoal);

  const category = target === 'new' ? null : target;
  const visible = target !== null;

  const [label, setLabel] = useState('');
  const [mascot, setMascot] = useState<MascotKey>('working');
  const [color, setColor] = useState<CategoryColorKey>('indigo');
  const [type, setType] = useState<CategoryType>('essential');
  const [hidden, setHidden] = useState(false);
  const [goalMs, setGoalMs] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (category) {
      setLabel(category.label);
      setMascot(category.mascot);
      setColor(category.color);
      setType(category.type);
      setHidden(category.hidden);
      // Snapshot read (not subscribed) — we only want the goal as it stood
      // when the sheet opened, not to overwrite an in-progress edit if it
      // changes elsewhere while this sheet stays mounted.
      setGoalMs(useSettingsStore.getState().goals[category.id] ?? 0);
    } else {
      setLabel('');
      setMascot('working');
      setColor('indigo');
      setType('essential');
      setHidden(false);
      setGoalMs(0);
    }
    // Intentionally keyed on category?.id, not the whole object: this should
    // reseed the form when a *different* activity is opened, not every time
    // the current one's fields change underneath it (e.g. right after save).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, category?.id]);

  if (!visible) return null;

  const accent = categoryColors[color];
  const trimmed = label.trim();
  const canSave = trimmed.length > 0;

  const step = (dir: 1 | -1) => {
    Haptics.selectionAsync();
    setGoalMs((v) => Math.max(0, Math.min(GOAL_MAX, v + dir * GOAL_STEP)));
  };

  const save = () => {
    if (!canSave) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let id: CategoryId;
    if (category) {
      updateCategory(category.id, { label: trimmed, mascot, color, type, hidden });
      id = category.id;
    } else {
      id = addCategory({ label: trimmed, mascot, color, type });
    }
    setGoal(id, goalMs > 0 ? goalMs : null);
    onClose();
  };

  const toggleHidden = (next: boolean) => {
    if (next && visibleCount <= 1) {
      Alert.alert('Impossible', 'Il doit rester au moins une catégorie visible.');
      return;
    }
    Haptics.selectionAsync();
    setHidden(!next);
  };

  const remove = () => {
    if (!category) return;
    if (!category.hidden && visibleCount <= 1) {
      Alert.alert('Impossible', 'Il doit rester au moins une catégorie visible.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Supprimer cette catégorie',
      'Son historique reste visible dans les statistiques passées, mais elle disparaît de la grille.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            removeCategory(category.id);
            setGoal(category.id, null);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <AnimatedPressable
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(160)}
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}
        onPress={onClose}
      />
      <View pointerEvents="box-none" style={styles.wrap}>
        <Animated.View
          entering={FadeInDown.duration(260).springify().damping(18)}
          exiting={FadeOut.duration(160)}
          style={[
            styles.sheet,
            shadows.lg,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.hairlineStrong },
          ]}
        >
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.previewRow}>
              <View style={[styles.previewThumb, { backgroundColor: accent + '22' }]}>
                <Mascot name={mascot} size={sizes.thumbLg - 12} animated={false} />
              </View>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="Nom de l’activité"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.nameInput,
                  { color: colors.textPrimary, borderBottomColor: colors.hairlineStrong },
                ]}
                maxLength={24}
                returnKeyType="done"
                autoFocus={!category}
              />
            </View>

            <AppText variant="overline" color="tertiary" style={styles.sectionLabel}>
              Illustration
            </AppText>
            <View style={styles.mascotGrid}>
              {MASCOT_KEYS.map((key) => {
                const active = key === mascot;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setMascot(key);
                    }}
                    style={({ pressed }) => [
                      styles.mascotOption,
                      { backgroundColor: active ? accent + '26' : colors.fillFaint },
                      active && { borderColor: accent },
                      pressed && styles.pressedDim,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Mascot name={key} size={30} animated={false} />
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="overline" color="tertiary" style={styles.sectionLabel}>
              Couleur
            </AppText>
            <View style={styles.colorRow}>
              {CATEGORY_COLOR_KEYS.map((key) => {
                const hex = categoryColors[key];
                const active = key === color;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setColor(key);
                    }}
                    style={({ pressed }) => [
                      styles.swatch,
                      { backgroundColor: hex },
                      active && { borderColor: colors.textPrimary },
                      pressed && styles.pressedDim,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={key}
                    accessibilityState={{ selected: active }}
                  />
                );
              })}
            </View>

            <AppText variant="overline" color="tertiary" style={styles.sectionLabel}>
              Type
            </AppText>
            <View style={styles.typeRow}>
              {TYPE_ORDER.map((t) => {
                const active = t === type;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setType(t);
                    }}
                    style={({ pressed }) => [
                      styles.typeOption,
                      {
                        backgroundColor: active ? colors.accent + '1A' : colors.surface,
                        borderColor: active ? colors.accent : colors.hairline,
                      },
                      pressed && styles.pressedDim,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <AppText>{TYPE_EMOJI[t]}</AppText>
                    <AppText
                      variant="caption"
                      color={active ? 'accent' : 'secondary'}
                      align="center"
                    >
                      {CATEGORY_TYPE_LABEL[t]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="overline" color="tertiary" style={styles.sectionLabel}>
              Objectif quotidien
            </AppText>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => step(-1)}
                disabled={goalMs <= 0}
                style={({ pressed }) => [
                  styles.stepBtn,
                  {
                    backgroundColor: colors.fillSoft,
                    opacity: goalMs <= 0 ? 0.35 : pressed ? 0.7 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Réduire l’objectif"
              >
                <Icon name="chevronLeft" size={16} color={colors.textPrimary} />
              </Pressable>
              <AppText variant="bodyStrong" tabular style={styles.stepperValue}>
                {goalMs > 0 ? formatDuration(goalMs) : 'Aucun'}
              </AppText>
              <Pressable
                onPress={() => step(1)}
                disabled={goalMs >= GOAL_MAX}
                style={({ pressed }) => [
                  styles.stepBtn,
                  {
                    backgroundColor: colors.fillSoft,
                    opacity: goalMs >= GOAL_MAX ? 0.35 : pressed ? 0.7 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Augmenter l’objectif"
              >
                <Icon name="chevronRight" size={16} color={colors.textPrimary} />
              </Pressable>
            </View>

            {category && (
              <View style={[styles.hiddenRow, { borderColor: colors.hairline }]}>
                <View style={styles.hiddenText}>
                  <AppText variant="body">Visible sur l’accueil</AppText>
                  <AppText variant="caption" color="tertiary">
                    Masquer la retire de la grille sans effacer son historique.
                  </AppText>
                </View>
                <Switch
                  value={!hidden}
                  onValueChange={toggleHidden}
                  trackColor={{ false: colors.fillMedium, true: colors.positive }}
                  thumbColor={colors.textOnAccent}
                />
              </View>
            )}

            <Pressable
              onPress={save}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.save,
                { backgroundColor: accent, opacity: !canSave ? 0.4 : pressed ? 0.9 : 1 },
              ]}
              accessibilityRole="button"
            >
              <AppText variant="bodyStrong" style={{ color: colors.textOnAccent }}>
                Enregistrer
              </AppText>
            </Pressable>

            {category && (
              <Pressable
                onPress={remove}
                style={({ pressed }) => [styles.deleteRow, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
              >
                <Icon name="trash" size={16} color={colors.danger} />
                <AppText variant="callout" color="danger">
                  Supprimer cette catégorie
                </AppText>
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  wrap: { flex: 1, justifyContent: 'flex-end' },
  pressedDim: { opacity: 0.7 },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginBottom: spacing.lg,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  previewThumb: {
    width: sizes.thumbLg,
    height: sizes.thumbLg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nameInput: {
    flex: 1,
    ...typography.title3,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: { marginBottom: spacing.sm, marginTop: spacing.lg },
  mascotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  mascotOption: {
    width: sizes.thumbMd,
    height: sizes.thumbMd,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { minWidth: 110, textAlign: 'center' },
  hiddenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hiddenText: { flex: 1, gap: spacing.xxs },
  save: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
});
