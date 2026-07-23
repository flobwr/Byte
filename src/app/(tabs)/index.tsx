import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '../../components/ui/Screen';
import { CATEGORY_BY_ID, type CategoryId, colorForCategory } from '../../constants/categories';
import { RUNNING_MASCOT } from '../../constants/mascots';
import { CategoryGrid } from '../../features/home/CategoryGrid';
import { DayControls } from '../../features/home/DayControls';
import { DayHistory } from '../../features/home/DayHistory';
import { DayNotes } from '../../features/home/DayNotes';
import { HomeHeader } from '../../features/home/HomeHeader';
import { LogToast, type LogFeedback } from '../../features/home/LogToast';
import { Stopwatch } from '../../features/home/Stopwatch';
import { useDayLog, useTodayKey } from '../../hooks/useDayLog';
import { useElapsed } from '../../hooks/useElapsed';
import { sumTotals, useTimerStore } from '../../stores/timerStore';
import { useColors } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const status = useTimerStore((s) => s.status);
  const lastCategory = useTimerStore((s) => s.lastCategory);

  const todayKey = useTodayKey();
  const { entries, note, totals } = useDayLog(todayKey);

  const startDay = useTimerStore((s) => s.startDay);
  const logCategory = useTimerStore((s) => s.logCategory);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const endDay = useTimerStore((s) => s.endDay);
  const undoLast = useTimerStore((s) => s.undoLast);

  const elapsed = useElapsed();
  const totalToday = sumTotals(totals);

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
        <Animated.View entering={FadeIn.duration(320)}>
          <HomeHeader totalTodayMs={totalToday} />
        </Animated.View>

        <Animated.View style={styles.hero} entering={FadeInDown.delay(70).duration(380)}>
          <Stopwatch
            elapsedMs={elapsed}
            status={status}
            mascot={lastCategory ? heroMascot : null}
            accent={accent}
          />
        </Animated.View>

        <Animated.View style={styles.controls} entering={FadeInDown.delay(130).duration(380)}>
          <DayControls
            status={status}
            onStart={startDay}
            onPause={pause}
            onResume={resume}
            onEnd={endDay}
          />
        </Animated.View>

        <View style={styles.gridSection}>
          <CategoryGrid totals={totals} disabled={!isTracking} onLog={onLog} />
        </View>

        <Animated.View style={styles.section} entering={FadeInDown.delay(240).duration(380)}>
          <DayHistory
            entries={entries}
            dayKey={todayKey}
            canUndo={entries.length > 0}
            onUndoLast={undoLast}
          />
        </Animated.View>

        <Animated.View style={styles.section} entering={FadeInDown.delay(300).duration(380)}>
          <DayNotes dayKey={todayKey} note={note} />
        </Animated.View>
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
  section: { marginTop: spacing.lg },
});
