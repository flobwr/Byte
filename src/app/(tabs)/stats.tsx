import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { categoryColors } from '../../theme/colors';
import { DistributionRow } from '../../features/stats/DistributionRow';
import { RingProgress } from '../../features/stats/RingProgress';
import { StatTile } from '../../features/stats/StatTile';
import { useStats } from '../../features/stats/useStats';
import { WeeklyBars } from '../../features/stats/WeeklyBars';
import { motion } from '../../theme/motion';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { formatDuration } from '../../utils/time';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = useStats();

  const scoreAccent =
    s.dayScore >= 75 ? colors.positive : s.dayScore >= 40 ? colors.accent : colors.amber;

  const todayMax = s.todayByCategory[0]?.ms ?? 1;
  const allMax = s.allTimeByCategory[0]?.ms ?? 1;

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
          Statistiques
        </AppText>
        <AppText variant="display" style={styles.title}>
          Tableau de bord
        </AppText>

        {/* Day score */}
        <Animated.View entering={FadeInDown.delay(40).duration(motion.duration.reveal)}>
          <Card padding="xl" cornerRadius="xxl" style={styles.scoreCard}>
            <RingProgress progress={s.dayScore} label="score" accent={scoreAccent} />
            <View style={styles.scoreBody}>
              <AppText variant="overline" color="tertiary">
                Score de journée
              </AppText>
              <AppText variant="title2" style={styles.scoreLabel}>
                {s.scoreLabel}
              </AppText>
              <AppText variant="callout" color="secondary">
                Part de temps concentré aujourd’hui.
              </AppText>
            </View>
          </Card>
        </Animated.View>

        {/* KPI tiles */}
        <View style={styles.tileRow}>
          <StatTile
            label="Aujourd’hui"
            value={s.today}
            kind="duration"
            accent={colors.amber}
            index={2}
          />
          <StatTile
            label="Cette semaine"
            value={s.week}
            kind="duration"
            accent={categoryColors.violet}
            index={3}
          />
        </View>
        <View style={styles.tileRow}>
          <StatTile
            label="Ce mois"
            value={s.month}
            kind="duration"
            accent={colors.positive}
            index={4}
          />
          <StatTile
            label="Depuis le début"
            value={s.allTime}
            kind="duration"
            hint={`${s.daysTracked} jour${s.daysTracked > 1 ? 's' : ''} · ${s.activityCount} activité${s.activityCount > 1 ? 's' : ''}`}
            accent={categoryColors.sky}
            index={5}
          />
        </View>

        {/* Weekly chart */}
        <Animated.View entering={FadeInDown.delay(140).duration(motion.duration.reveal)}>
          <Card padding="xl" cornerRadius="xxl" style={styles.section}>
            <View style={styles.sectionHead}>
              <AppText variant="title3">Cette semaine</AppText>
              <AppText variant="callout" color="tertiary" tabular>
                {formatDuration(s.week)}
              </AppText>
            </View>
            <WeeklyBars bars={s.weekBars} max={s.weekMax} accent={colors.accent} />
          </Card>
        </Animated.View>

        {/* Today distribution */}
        {s.todayByCategory.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(motion.duration.reveal)}>
            <Card padding="xl" cornerRadius="xxl" style={styles.section}>
              <AppText variant="title3" style={styles.sectionTitle}>
                Aujourd’hui par activité
              </AppText>
              <View style={styles.rows}>
                {s.todayByCategory.map((r, i) => (
                  <DistributionRow
                    key={r.category.id}
                    category={r.category}
                    ms={r.ms}
                    fraction={r.ms / todayMax}
                    index={i}
                  />
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* All-time distribution */}
        {s.allTimeByCategory.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(260).duration(motion.duration.reveal)}>
            <Card padding="xl" cornerRadius="xxl" style={styles.section}>
              <AppText variant="title3" style={styles.sectionTitle}>
                Répartition globale
              </AppText>
              <View style={styles.rows}>
                {s.allTimeByCategory.map((r, i) => (
                  <DistributionRow
                    key={r.category.id}
                    category={r.category}
                    ms={r.ms}
                    fraction={r.ms / allMax}
                    index={i}
                  />
                ))}
              </View>
            </Card>
          </Animated.View>
        ) : (
          <Card padding="xxl" cornerRadius="xxl" style={styles.empty}>
            <AppText variant="body" color="secondary" align="center">
              Aucune activité pour l’instant.{'\n'}Démarre ta journée pour voir tes statistiques
              prendre vie.
            </AppText>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xl },
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  scoreBody: { flex: 1, gap: spacing.xxs },
  scoreLabel: { marginVertical: spacing.xxs },
  tileRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  section: { marginTop: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
  },
  sectionTitle: { marginBottom: spacing.lg },
  rows: { gap: spacing.lg },
  empty: { marginTop: spacing.lg, alignItems: 'center' },
});
