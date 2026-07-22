import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '../../components/ui/Card';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { DistributionRow } from '../../features/stats/DistributionRow';
import { selectTodayTotals, sumTotals, useTimerStore } from '../../stores/timerStore';
import { spacing } from '../../theme/spacing';
import { formatDuration } from '../../utils/time';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const totals = useTimerStore(selectTodayTotals);

  const { total, ranked, max } = useMemo(() => {
    const rows = DEFAULT_CATEGORIES.map((c) => ({ category: c, ms: totals[c.id] ?? 0 })).filter(
      (r) => r.ms > 0,
    );
    rows.sort((a, b) => b.ms - a.ms);
    return {
      total: sumTotals(totals),
      ranked: rows,
      max: rows.length ? rows[0]!.ms : 1,
    };
  }, [totals]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.giant + spacing.huge }]}
      >
        <AppText variant="overline" color="tertiary">
          Statistiques
        </AppText>
        <AppText variant="display" style={styles.title}>
          Ta journée
        </AppText>

        <Card padding="xxl" cornerRadius="xxl" style={styles.totalCard}>
          <AppText variant="caption" color="tertiary">
            TEMPS SUIVI AUJOURD’HUI
          </AppText>
          <AppText variant="title1" tabular color="amber" style={styles.bigTotal}>
            {formatDuration(total)}
          </AppText>
          <AppText variant="caption" color="secondary">
            {ranked.length} activité{ranked.length > 1 ? 's' : ''} enregistrée
            {ranked.length > 1 ? 's' : ''}
          </AppText>
        </Card>

        {ranked.length > 0 ? (
          <Card padding="xl" cornerRadius="xxl" style={styles.breakdown}>
            <AppText variant="title3" style={styles.sectionTitle}>
              Répartition
            </AppText>
            <View style={styles.rows}>
              {ranked.map((r, i) => (
                <DistributionRow
                  key={r.category.id}
                  category={r.category}
                  ms={r.ms}
                  fraction={r.ms / max}
                  index={i}
                />
              ))}
            </View>
          </Card>
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
  totalCard: { alignItems: 'flex-start', gap: spacing.xs },
  bigTotal: { fontSize: 40, lineHeight: 46, marginVertical: spacing.xxs },
  breakdown: { marginTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.lg },
  rows: { gap: spacing.lg },
  empty: { marginTop: spacing.lg, alignItems: 'center' },
});
