import * as Haptics from 'expo-haptics';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { StatTile } from '../../features/stats/StatTile';
import { useStats } from '../../features/stats/useStats';
import { useTimerStore } from '../../stores/timerStore';
import { colors } from '../../theme/colors';
import { formatShortDate } from '../../utils/dateRange';
import { spacing } from '../../theme/spacing';
import { formatDuration } from '../../utils/time';

function Row({
  label,
  value,
  onPress,
  danger,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={onPress ? { color: colors.fillSoft } : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.rowItem, pressed && onPress ? styles.rowPressed : null]}
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
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const resetAll = useTimerStore((state) => state.resetAll);
  const s = useStats();

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Réinitialiser Byte',
      'Toutes tes données seront effacées. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: resetAll },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.giant + spacing.huge },
        ]}
      >
        <AppText variant="overline" color="tertiary">
          Profil
        </AppText>
        <AppText variant="display" style={styles.title}>
          Byte
        </AppText>

        <Animated.View entering={FadeInDown.duration(420).springify().damping(18)}>
          <Card padding="xxl" cornerRadius="xxl" style={styles.hero}>
            <Mascot name="coffee" size={104} effects />
            <AppText variant="title3" style={styles.heroTitle}>
              Ton compagnon de focus
            </AppText>
            <AppText variant="callout" color="secondary" align="center">
              Un geste, une activité enregistrée. Byte s’occupe du reste.
            </AppText>
          </Card>
        </Animated.View>

        <View style={styles.tileRow}>
          <StatTile label="Temps total" value={formatDuration(s.allTime)} accent={colors.amber} index={0} />
          <StatTile label="Activités" value={String(s.activityCount)} accent={colors.accent} index={1} />
        </View>
        <View style={styles.tileRow}>
          <StatTile label="Jours suivis" value={String(s.daysTracked)} accent={colors.positive} index={2} />
          <StatTile label="Catégories" value={String(s.categoriesCount)} accent={colors.accentSoft} index={3} />
        </View>

        <Card padding="none" cornerRadius="xl" style={styles.list}>
          <Row label="Données depuis" value={s.createdAt ? formatShortDate(s.createdAt) : '—'} />
          <View style={styles.divider} />
          <Row label="Version" value="1.0.0" />
        </Card>

        <Card padding="none" cornerRadius="xl" style={styles.list}>
          <Row label="Réinitialiser les données" onPress={confirmReset} danger />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  heroTitle: { marginTop: spacing.sm },
  tileRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  list: { marginTop: spacing.lg, overflow: 'hidden' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowPressed: { backgroundColor: colors.fillFaint },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginLeft: spacing.xl },
});
