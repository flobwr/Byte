import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Icon } from '../../components/ui/Icon';
import { type Category, colorForCategory } from '../../constants/categories';
import { radius, spacing } from '../../theme/spacing';
import { useShadows } from '../../theme/shadows';
import { useColors } from '../../theme/ThemeContext';
import { formatDuration, MINUTE } from '../../utils/time';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const STEP = 15 * MINUTE;
const MAX = 12 * 60 * MINUTE;

type GoalEditorSheetProps = {
  category: Category | null;
  initialMs: number;
  onClose: () => void;
  onSave: (ms: number | null) => void;
};

/** Bottom-sheet stepper to set (or clear) a daily time target for one activity. */
export function GoalEditorSheet({ category, initialMs, onClose, onSave }: GoalEditorSheetProps) {
  const colors = useColors();
  const shadows = useShadows();
  const [ms, setMs] = useState(initialMs);

  // The sheet stays mounted across categories — reseed the stepper whenever a
  // different activity (or its stored goal) is opened, not just on first mount.
  useEffect(() => {
    setMs(initialMs);
  }, [category?.id, initialMs]);

  if (!category) return null;
  const accent = colorForCategory(category.id);

  const step = (dir: 1 | -1) => {
    Haptics.selectionAsync();
    setMs((v) => Math.max(0, Math.min(MAX, v + dir * STEP)));
  };

  const save = () => {
    onSave(ms > 0 ? ms : null);
    onClose();
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
          <View style={styles.head}>
            <View style={[styles.thumb, { backgroundColor: accent + '22' }]}>
              <Mascot name={category.mascot} size={34} animated={false} />
            </View>
            <View>
              <AppText variant="title3">{category.label}</AppText>
              <AppText variant="callout" color="secondary">
                Objectif quotidien
              </AppText>
            </View>
          </View>

          <View style={styles.stepper}>
            <Pressable
              onPress={() => step(-1)}
              disabled={ms <= 0}
              style={({ pressed }) => [
                styles.stepBtn,
                { backgroundColor: colors.fillSoft, opacity: ms <= 0 ? 0.35 : pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Réduire l’objectif"
            >
              <Icon name="chevronLeft" size={18} color={colors.textPrimary} />
            </Pressable>

            <AppText variant="title1" tabular style={styles.value}>
              {ms > 0 ? formatDuration(ms) : 'Aucun'}
            </AppText>

            <Pressable
              onPress={() => step(1)}
              disabled={ms >= MAX}
              style={({ pressed }) => [
                styles.stepBtn,
                { backgroundColor: colors.fillSoft, opacity: ms >= MAX ? 0.35 : pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Augmenter l’objectif"
            >
              <Icon name="chevronRight" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Pressable
            onPress={save}
            style={({ pressed }) => [
              styles.save,
              { backgroundColor: accent, opacity: pressed ? 0.9 : 1 },
            ]}
            accessibilityRole="button"
          >
            <AppText variant="bodyStrong" style={{ color: colors.textOnAccent }}>
              Enregistrer
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
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.35)',
    marginBottom: spacing.lg,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 140, textAlign: 'center' },
  save: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
});
