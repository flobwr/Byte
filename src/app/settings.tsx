import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Icon, type IconName } from '../components/ui/Icon';
import { Screen } from '../components/ui/Screen';
import { useCategoriesStore } from '../stores/categoriesStore';
import { useMetaStore } from '../stores/metaStore';
import { type ThemeMode, useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import { motion } from '../theme/motion';
import { radius, spacing } from '../theme/spacing';
import { useColors } from '../theme/ThemeContext';
import { formatShortDate } from '../utils/dateRange';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'Système', icon: 'settings' },
  { mode: 'light', label: 'Clair', icon: 'sun' },
  { mode: 'dark', label: 'Sombre', icon: 'moon' },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="overline" color="tertiary" style={styles.sectionTitle}>
      {children}
    </AppText>
  );
}

function Row({
  label,
  value,
  onPress,
  danger,
  last,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        android_ripple={onPress ? { color: colors.fillSoft } : undefined}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => [
          styles.rowItem,
          pressed && onPress ? { backgroundColor: colors.fillFaint } : null,
        ]}
      >
        <AppText variant="body" color={danger ? 'danger' : 'primary'}>
          {label}
        </AppText>
        <View style={styles.rowRight}>
          {value && (
            <AppText variant="callout" color="tertiary" tabular>
              {value}
            </AppText>
          )}
          {onPress && <Icon name="chevronRight" size={18} color={colors.textTertiary} />}
        </View>
      </Pressable>
      {!last && <View style={[styles.divider, { backgroundColor: colors.hairline }]} />}
    </>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();

  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const dayStartHour = useSettingsStore((s) => s.dayStartHour);
  const setDayStartHour = useSettingsStore((s) => s.setDayStartHour);
  const createdAt = useMetaStore((s) => s.createdAt);
  const resetAll = useTimerStore((s) => s.resetAll);
  const categoryCount = useCategoriesStore((s) => s.categories.length);

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Réinitialiser Byte',
      'Toutes tes activités enregistrées seront effacées. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: resetAll },
      ],
    );
  };

  const dayStartLabel = `${String(dayStartHour).padStart(2, '0')}h00`;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="title2">Paramètres</AppText>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.close,
            { backgroundColor: colors.fillSoft, opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
        >
          <Icon name="close" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.huge }]}
      >
        <Animated.View entering={FadeInDown.delay(20).duration(motion.duration.reveal)}>
          <SectionTitle>Apparence</SectionTitle>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.mode;
              return (
                <Pressable
                  key={opt.mode}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setThemeMode(opt.mode);
                  }}
                  style={({ pressed }) => [
                    styles.themeOption,
                    {
                      backgroundColor: active ? colors.accent + '1A' : colors.surface,
                      borderColor: active ? colors.accent : colors.hairline,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Icon
                    name={opt.icon}
                    size={20}
                    color={active ? colors.accent : colors.textSecondary}
                  />
                  <AppText variant="callout" color={active ? 'accent' : 'secondary'}>
                    {opt.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(motion.duration.reveal)}>
          <SectionTitle>Journée</SectionTitle>
          <Card padding="none" cornerRadius="xl" style={styles.card}>
            <View style={styles.stepperRow}>
              <View>
                <AppText variant="body">Début de journée</AppText>
                <AppText variant="caption" color="tertiary" style={styles.hint}>
                  Une nouvelle journée commence à cette heure.
                </AppText>
              </View>
              <View style={styles.stepperControls}>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDayStartHour((dayStartHour + 23) % 24);
                  }}
                  style={[styles.stepBtn, { backgroundColor: colors.fillSoft }]}
                  accessibilityRole="button"
                  accessibilityLabel="Heure précédente"
                >
                  <Icon name="chevronLeft" size={16} color={colors.textPrimary} />
                </Pressable>
                <AppText variant="bodyStrong" tabular style={styles.stepperValue}>
                  {dayStartLabel}
                </AppText>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDayStartHour((dayStartHour + 1) % 24);
                  }}
                  style={[styles.stepBtn, { backgroundColor: colors.fillSoft }]}
                  accessibilityRole="button"
                  accessibilityLabel="Heure suivante"
                >
                  <Icon name="chevronRight" size={16} color={colors.textPrimary} />
                </Pressable>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(motion.duration.reveal)}>
          <SectionTitle>Activités</SectionTitle>
          <Card padding="none" cornerRadius="xl" style={styles.card}>
            <Row
              label="Gérer les catégories"
              value={`${categoryCount} activité${categoryCount > 1 ? 's' : ''}`}
              onPress={() => router.push('/categories')}
              last
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(motion.duration.reveal)}>
          <SectionTitle>Données</SectionTitle>
          <Card padding="none" cornerRadius="xl" style={styles.card}>
            <Row label="Réinitialiser les données" onPress={confirmReset} danger last />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(motion.duration.reveal)}>
          <SectionTitle>À propos</SectionTitle>
          <Card padding="none" cornerRadius="xl" style={styles.card}>
            <Row label="Données depuis" value={createdAt ? formatShortDate(createdAt) : '—'} />
            <Row label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} last />
          </Card>
        </Animated.View>
      </ScrollView>
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
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  card: { overflow: 'hidden' },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  hint: { marginTop: spacing.xxs, maxWidth: 200 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { minWidth: 56, textAlign: 'center' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: spacing.xl },
});
