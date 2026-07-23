import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { useDayDetail } from '../../features/calendar/useDayDetail';
import { useMarkedDayKeys } from '../../features/calendar/useMarkedDayKeys';
import { MonthGrid } from '../../features/calendar/MonthGrid';
import { DayHistory } from '../../features/home/DayHistory';
import { DayNotes } from '../../features/home/DayNotes';
import { DistributionRow } from '../../features/stats/DistributionRow';
import { RingProgress } from '../../features/stats/RingProgress';
import { useTodayKey } from '../../hooks/useDayLog';
import { useMetaStore } from '../../stores/metaStore';
import { useTimerStore } from '../../stores/timerStore';
import { motion } from '../../theme/motion';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';
import { parseDayKey } from '../../utils/dateRange';
import { formatLongDate } from '../../utils/frDate';
import { dayKey, formatDuration } from '../../utils/time';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const todayKey = useTodayKey();
  const createdAt = useMetaStore((s) => s.createdAt);
  const minKey = createdAt ? dayKey(new Date(createdAt)) : null;
  const undoLast = useTimerStore((s) => s.undoLast);
  const marked = useMarkedDayKeys();

  const [month, setMonth] = useState(() => parseDayKey(todayKey));
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const detail = useDayDetail(selectedKey);
  const isToday = selectedKey === todayKey;
  const maxCat = detail.byCategory[0]?.ms ?? 1;
  const scoreAccent =
    detail.score >= 75 ? colors.positive : detail.score >= 40 ? colors.accent : colors.amber;

  const heading = useMemo(() => {
    const label = formatLongDate(parseDayKey(selectedKey));
    return isToday ? `${label} · aujourd’hui` : label;
  }, [selectedKey, isToday]);

  const changeMonth = (delta: number) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

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
          Calendrier
        </AppText>
        <AppText variant="display" style={styles.title} numberOfLines={1}>
          {heading}
        </AppText>

        <Animated.View entering={FadeInDown.delay(40).duration(motion.duration.reveal)}>
          <Card padding="xl" cornerRadius="xxl">
            <MonthGrid
              month={month}
              selectedKey={selectedKey}
              todayKey={todayKey}
              minKey={minKey}
              markedKeys={marked}
              onSelect={setSelectedKey}
              onChangeMonth={changeMonth}
            />
          </Card>
        </Animated.View>

        <Animated.View
          key={`score-${selectedKey}`}
          entering={FadeInDown.delay(80).duration(motion.duration.reveal)}
        >
          <Card padding="xl" cornerRadius="xxl" style={styles.scoreCard}>
            <RingProgress progress={detail.score} label="score" accent={scoreAccent} size={104} stroke={10} />
            <View style={styles.scoreBody}>
              <AppText variant="overline" color="tertiary">
                Score du jour
              </AppText>
              <AppText variant="title3" style={styles.scoreLabel}>
                {detail.total > 0 ? detail.scoreLabel : 'Aucune activité'}
              </AppText>
              <AppText variant="callout" color="secondary" tabular>
                {formatDuration(detail.total)} au total
              </AppText>
            </View>
          </Card>
        </Animated.View>

        {detail.byCategory.length > 0 && (
          <Animated.View
            key={`dist-${selectedKey}`}
            entering={FadeInDown.delay(120).duration(motion.duration.reveal)}
          >
            <Card padding="xl" cornerRadius="xxl" style={styles.section}>
              <AppText variant="title3" style={styles.sectionTitle}>
                Répartition
              </AppText>
              <View style={styles.rows}>
                {detail.byCategory.map((r, i) => (
                  <DistributionRow
                    key={r.category.id}
                    category={r.category}
                    ms={r.ms}
                    fraction={r.ms / maxCat}
                    index={i}
                  />
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        <Animated.View
          key={`hist-${selectedKey}`}
          style={styles.section}
          entering={FadeInDown.delay(160).duration(motion.duration.reveal)}
        >
          <DayHistory
            entries={detail.entries}
            dayKey={selectedKey}
            canUndo={isToday && detail.entries.length > 0}
            onUndoLast={isToday ? undoLast : undefined}
          />
        </Animated.View>

        <Animated.View
          key={`notes-${selectedKey}`}
          style={styles.section}
          entering={FadeInDown.delay(200).duration(motion.duration.reveal)}
        >
          <DayNotes dayKey={selectedKey} note={detail.note} />
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xl },
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: spacing.lg },
  scoreBody: { flex: 1, gap: spacing.xxs },
  scoreLabel: { marginVertical: spacing.xxs },
  section: { marginTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.lg },
  rows: { gap: spacing.lg },
});
