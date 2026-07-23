import { useMemo } from 'react';

import { useSettingsStore } from '../stores/settingsStore';
import {
  type DayTotals,
  entriesToTotals,
  type LogEntry,
  useTimerStore,
} from '../stores/timerStore';
import { dayKey } from '../utils/time';

const EMPTY_ENTRIES: readonly LogEntry[] = Object.freeze([]);

export type DayLogView = {
  key: string;
  entries: readonly LogEntry[];
  note: string;
  totals: DayTotals;
};

/** Today's key, honouring the user's configured day-start hour. Reactive to setting changes. */
export function useTodayKey(): string {
  const dayStartHour = useSettingsStore((s) => s.dayStartHour);
  return dayKey(new Date(), dayStartHour);
}

/** Live, reactive view of a single day's log — entries, note and derived totals. */
export function useDayLog(key: string): DayLogView {
  const day = useTimerStore((s) => s.history[key]);
  const entries = day?.entries ?? EMPTY_ENTRIES;
  const note = day?.note ?? '';
  const totals = useMemo(() => entriesToTotals(entries), [entries]);
  return { key, entries, note, totals };
}
