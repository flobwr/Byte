import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '../../components/ui/Screen';
import { CATEGORY_BY_ID, type CategoryId, colorForCategory } from '../../constants/categories';
import { RUNNING_MASCOT } from '../../constants/mascots';
import { CategoryGrid } from '../../features/home/CategoryGrid';
import { DayControls } from '../../features/home/DayControls';
import { HomeHeader } from '../../features/home/HomeHeader';
import { LogToast, type LogFeedback } from '../../features/home/LogToast';
import { Stopwatch } from '../../features/home/Stopwatch';
import { useElapsed } from '../../hooks/useElapsed';
import { selectTodayTotals, sumTotals, useTimerStore } from '../../stores/timerStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const status = useTimerStore((s) => s.status);
  const lastCategory = useTimerStore((s) => s.lastCategory);
  const totals = useTimerStore(selectTodayTotals);

  const startDay = useTimerStore((s) => s.startDay);
  const logCategory = useTimerStore((s) => s.logCategory);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const endDay = useTimerStore((s) => s.endDay);

  const elapsed = useElapsed();
  const totalToday = useMemo(() => sumTotals(totals), [totals]);

  const [feedback, setFeedback] = useState<LogFeedback | null>(null);

  const accent = lastCategory ? colorForCategory(lastCategory) : colors.accent;
  const heroMascot = lastCategory ? CATEGORY_BY_ID[lastCategory].mascot : RUNNING_MASCOT;

  const onLog = useCallback(
    (id: CategoryId) => {
      const added = logCategory(id);
      if (added <= 0) return;
      const cat = CATEGORY_BY_ID[id];
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback({
        id: Date.now(),
        label: cat.label,
        mascot: cat.mascot,
        color: colorForCategory(id),
        addedMs: added,
      });
    },
    [logCategory],
  );

  const isTracking = status !== 'idle';

  return (
    <Screen>
      <LogToast feedback={feedback} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.giant + spacing.huge },
        ]}
      >
        <HomeHeader totalTodayMs={totalToday} />

        <View style={styles.hero}>
          <Stopwatch elapsedMs={elapsed} status={status} mascot={lastCategory ? heroMascot : null} accent={accent} />
        </View>

        <View style={styles.controls}>
          <DayControls
            status={status}
            onStart={startDay}
            onPause={pause}
            onResume={resume}
            onEnd={endDay}
          />
        </View>

        <View style={styles.gridSection}>
          <CategoryGrid totals={totals} disabled={!isTracking} onLog={onLog} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  hero: { marginTop: spacing.xl },
  controls: { marginTop: spacing.xl },
  gridSection: { marginTop: spacing.xxxl },
});
