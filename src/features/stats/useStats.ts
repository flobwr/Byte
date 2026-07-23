import { useMemo } from 'react';

import {
  type Category,
  type CategoryId,
  type CategoryType,
  resolveCategory,
  selectVisibleCategories,
  useCategoriesStore,
} from '../../stores/categoriesStore';
import { useMetaStore } from '../../stores/metaStore';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  type DayTotals,
  entriesToTotals,
  type History,
  useTimerStore,
} from '../../stores/timerStore';
import { currentWeekKeys, isSameMonth, WEEKDAY_INITIALS } from '../../utils/dateRange';
import { dayKey } from '../../utils/time';

export type CategoryTotal = { category: Category; ms: number };
export type WeekBar = { label: string; ms: number; isToday: boolean };

/** How much each category type counts toward the day score — progress helps
 * it, waste hurts it, essential is neutral. */
const TYPE_WEIGHT: Record<CategoryType, number> = { progress: 1, essential: 0.5, waste: -0.5 };

export function scoreBand(score: number): string {
  if (score === 0) return '—';
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Bonne journée';
  if (score >= 25) return 'Correct';
  return 'À équilibrer';
}

/** 0..100 — weighted by each logged activity's type (progress/essential/waste). */
export function scoreForTotals(totals: DayTotals): number {
  const total = Object.values(totals).reduce<number>((a, v) => a + (v ?? 0), 0);
  if (total <= 0) return 0;
  let weighted = 0;
  for (const [id, ms] of Object.entries(totals)) {
    if (!ms) continue;
    weighted += TYPE_WEIGHT[resolveCategory(id).type] * ms;
  }
  return Math.max(0, Math.min(100, Math.round((weighted / total) * 100)));
}

export function rankCategories(source: Partial<Record<CategoryId, number>>): CategoryTotal[] {
  return Object.entries(source)
    .filter(([, ms]) => (ms ?? 0) > 0)
    .map(([id, ms]) => ({ category: resolveCategory(id), ms: ms ?? 0 }))
    .sort((a, b) => b.ms - a.ms);
}

export type Stats = {
  today: number;
  week: number;
  month: number;
  allTime: number;
  activityCount: number;
  daysTracked: number;
  categoriesCount: number;
  todayByCategory: CategoryTotal[];
  allTimeByCategory: CategoryTotal[];
  weekBars: WeekBar[];
  weekMax: number;
  dayScore: number;
  scoreLabel: string;
  createdAt: number | null;
};

const sumDay = (d: DayTotals): number => Object.values(d).reduce<number>((a, v) => a + (v ?? 0), 0);

const dayTotals = (history: History, key: string): DayTotals =>
  entriesToTotals(history[key]?.entries ?? []);

function compute(
  history: History,
  createdAt: number | null,
  dayStartHour: number,
  categoriesCount: number,
): Stats {
  const todayKey = dayKey(new Date(), dayStartHour);
  const weekKeys = new Set(currentWeekKeys());

  let week = 0;
  let month = 0;
  let allTime = 0;
  let activityCount = 0;
  let daysTracked = 0;

  const allByCat: Partial<Record<CategoryId, number>> = {};

  for (const key of Object.keys(history)) {
    const day = dayTotals(history, key);
    const total = sumDay(day);
    if (total <= 0) continue;
    daysTracked += 1;
    allTime += total;
    if (weekKeys.has(key)) week += total;
    if (isSameMonth(key)) month += total;
    for (const [cid, ms] of Object.entries(day)) {
      if (ms && ms > 0) {
        activityCount += 1;
        allByCat[cid] = (allByCat[cid] ?? 0) + ms;
      }
    }
  }

  const todayCategoryTotals = dayTotals(history, todayKey);
  const today = sumDay(todayCategoryTotals);

  const weekBars: WeekBar[] = currentWeekKeys().map((key, i) => ({
    label: WEEKDAY_INITIALS[i] ?? '',
    ms: sumDay(dayTotals(history, key)),
    isToday: key === todayKey,
  }));
  const weekMax = Math.max(1, ...weekBars.map((b) => b.ms));

  const dayScore = scoreForTotals(todayCategoryTotals);

  return {
    today,
    week,
    month,
    allTime,
    activityCount,
    daysTracked,
    categoriesCount,
    todayByCategory: rankCategories(todayCategoryTotals),
    allTimeByCategory: rankCategories(allByCat),
    weekBars,
    weekMax,
    dayScore,
    scoreLabel: scoreBand(dayScore),
    createdAt,
  };
}

/** Read-only aggregation of the tracking history. Memoised on the raw history. */
export function useStats(): Stats {
  const history = useTimerStore((s) => s.history);
  const createdAt = useMetaStore((s) => s.createdAt);
  const dayStartHour = useSettingsStore((s) => s.dayStartHour);
  const categoriesCount = useCategoriesStore((s) => selectVisibleCategories(s).length);
  return useMemo(
    () => compute(history, createdAt, dayStartHour, categoriesCount),
    [history, createdAt, dayStartHour, categoriesCount],
  );
}
