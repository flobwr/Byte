import { useMemo } from 'react';

import { type Category, type CategoryId, DEFAULT_CATEGORIES } from '../../constants/categories';
import { useMetaStore } from '../../stores/metaStore';
import { type DayTotals, type History, useTimerStore } from '../../stores/timerStore';
import { currentWeekKeys, isSameMonth, WEEKDAY_INITIALS } from '../../utils/dateRange';
import { dayKey } from '../../utils/time';

export type CategoryTotal = { category: Category; ms: number };
export type WeekBar = { label: string; ms: number; isToday: boolean };

/** Categories that count as "focused" time for the day score. */
const FOCUS: readonly CategoryId[] = ['work', 'study', 'read', 'sport'];

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

const sumDay = (d: DayTotals): number =>
  Object.values(d).reduce<number>((a, v) => a + (v ?? 0), 0);

function scoreBand(score: number): string {
  if (score === 0) return '—';
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Bonne journée';
  if (score >= 25) return 'Correct';
  return 'À équilibrer';
}

function compute(history: History, createdAt: number | null): Stats {
  const todayKey = dayKey();
  const weekKeys = new Set(currentWeekKeys());

  let week = 0;
  let month = 0;
  let allTime = 0;
  let activityCount = 0;
  let daysTracked = 0;

  const allByCat: Partial<Record<CategoryId, number>> = {};

  for (const key of Object.keys(history)) {
    const day = history[key] ?? {};
    const dayTotal = sumDay(day);
    if (dayTotal <= 0) continue;
    daysTracked += 1;
    allTime += dayTotal;
    if (weekKeys.has(key)) week += dayTotal;
    if (isSameMonth(key)) month += dayTotal;
    for (const [cid, ms] of Object.entries(day) as [CategoryId, number][]) {
      if (ms > 0) {
        activityCount += 1;
        allByCat[cid] = (allByCat[cid] ?? 0) + ms;
      }
    }
  }

  const todayTotals = history[todayKey] ?? {};
  const today = sumDay(todayTotals);

  const rank = (source: Partial<Record<CategoryId, number>>): CategoryTotal[] =>
    DEFAULT_CATEGORIES.map((category) => ({ category, ms: source[category.id] ?? 0 }))
      .filter((r) => r.ms > 0)
      .sort((a, b) => b.ms - a.ms);

  const weekBars: WeekBar[] = currentWeekKeys().map((key, i) => ({
    label: WEEKDAY_INITIALS[i] ?? '',
    ms: sumDay(history[key] ?? {}),
    isToday: key === todayKey,
  }));
  const weekMax = Math.max(1, ...weekBars.map((b) => b.ms));

  const focusMs = FOCUS.reduce<number>((a, cid) => a + (todayTotals[cid] ?? 0), 0);
  const dayScore = today > 0 ? Math.round((focusMs / today) * 100) : 0;

  return {
    today,
    week,
    month,
    allTime,
    activityCount,
    daysTracked,
    categoriesCount: DEFAULT_CATEGORIES.length,
    todayByCategory: rank(todayTotals),
    allTimeByCategory: rank(allByCat),
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
  return useMemo(() => compute(history, createdAt), [history, createdAt]);
}
