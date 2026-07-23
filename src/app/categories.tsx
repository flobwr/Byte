import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Mascot } from '../components/Mascot';
import { AppText } from '../components/ui/AppText';
import { Icon } from '../components/ui/Icon';
import { Screen } from '../components/ui/Screen';
import { CategoryEditSheet } from '../features/settings/CategoryEditSheet';
import {
  CATEGORY_TYPE_LABEL,
  type Category,
  type CategoryType,
  useCategoriesStore,
} from '../stores/categoriesStore';
import { useSettingsStore } from '../stores/settingsStore';
import { categoryColors } from '../theme/colors';
import { motion } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { sizes } from '../theme/sizes';
import { useColors } from '../theme/ThemeContext';

function typeDotColor(type: CategoryType, colors: ReturnType<typeof useColors>): string {
  if (type === 'progress') return colors.positive;
  if (type === 'waste') return colors.danger;
  return colors.textTertiary;
}

export default function CategoriesScreen() {
  const colors = useColors();
  const router = useRouter();
  const categories = useCategoriesStore((s) => s.categories);
  const moveCategory = useCategoriesStore((s) => s.moveCategory);
  const resetToDefaults = useCategoriesStore((s) => s.resetToDefaults);
  const clearGoals = useSettingsStore((s) => s.clearGoals);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Réinitialiser les catégories',
      'Retrouve la liste, l’ordre et les couleurs d’origine. Les objectifs sont effacés ; ton historique reste intact.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            resetToDefaults();
            clearGoals();
          },
        },
      ],
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: colors.fillSoft, opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Icon name="chevronLeft" size={18} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="title2">Catégories</AppText>
        <Pressable
          onPress={() => setEditing('new')}
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: colors.fillSoft, opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Ajouter une catégorie"
        >
          <Icon name="plus" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppText variant="callout" color="secondary" style={styles.hint}>
          Touche une activité pour la modifier. Les flèches changent son ordre sur l’accueil.
        </AppText>

        <View style={styles.list}>
          {categories.map((cat, i) => {
            const accent = categoryColors[cat.color];
            return (
              <Animated.View
                key={cat.id}
                entering={FadeInDown.delay(Math.min(i, 8) * 35).duration(motion.duration.reveal)}
              >
                <Pressable
                  onPress={() => setEditing(cat)}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: colors.surface, borderColor: colors.hairline },
                    cat.hidden && styles.rowHidden,
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${cat.label}, ${CATEGORY_TYPE_LABEL[cat.type]}${cat.hidden ? ', masquée' : ''}`}
                >
                  <View style={[styles.thumb, { backgroundColor: accent + '20' }]}>
                    <Mascot name={cat.mascot} size={sizes.thumbMd - 12} animated={false} />
                  </View>

                  <View style={styles.rowBody}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {cat.label}
                    </AppText>
                    <View style={styles.typeRow}>
                      <View
                        style={[styles.dot, { backgroundColor: typeDotColor(cat.type, colors) }]}
                      />
                      <AppText variant="caption" color="tertiary">
                        {CATEGORY_TYPE_LABEL[cat.type]}
                        {cat.hidden ? ' · masquée' : ''}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.reorder}>
                    <Pressable
                      disabled={i === 0}
                      onPress={() => moveCategory(cat.id, -1)}
                      hitSlop={8}
                      style={{ opacity: i === 0 ? 0.25 : 1 }}
                      accessibilityRole="button"
                      accessibilityLabel="Monter"
                    >
                      <View style={styles.rotateUp}>
                        <Icon name="chevronRight" size={16} color={colors.textSecondary} />
                      </View>
                    </Pressable>
                    <Pressable
                      disabled={i === categories.length - 1}
                      onPress={() => moveCategory(cat.id, 1)}
                      hitSlop={8}
                      style={{ opacity: i === categories.length - 1 ? 0.25 : 1 }}
                      accessibilityRole="button"
                      accessibilityLabel="Descendre"
                    >
                      <View style={styles.rotateDown}>
                        <Icon name="chevronRight" size={16} color={colors.textSecondary} />
                      </View>
                    </Pressable>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Pressable
          onPress={confirmReset}
          style={({ pressed }) => [styles.resetRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
        >
          <AppText variant="callout" color="danger">
            Réinitialiser les catégories
          </AppText>
        </Pressable>
      </ScrollView>

      <CategoryEditSheet target={editing} onClose={() => setEditing(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  hint: { marginBottom: spacing.lg },
  list: { gap: spacing.sm },
  resetRow: { alignItems: 'center', paddingVertical: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  rowHidden: { opacity: 0.5 },
  thumb: {
    width: sizes.thumbMd,
    height: sizes.thumbMd,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowBody: { flex: 1, gap: spacing.xxs },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
  reorder: { gap: spacing.sm },
  rotateUp: { transform: [{ rotate: '-90deg' }] },
  rotateDown: { transform: [{ rotate: '90deg' }] },
});
