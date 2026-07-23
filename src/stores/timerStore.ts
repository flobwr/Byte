import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { scoreForTotals } from '../features/stats/score';
import {
  deleteActivity,
  insertActivity,
  resetRemoteHistory,
  updateActivityCategory,
  upsertDayMeta,
} from '../services/sync/days';
import { safeSync } from '../services/sync/safeSync';
import { zustandStorage } from '../services/storage';
import { parseDayKey } from '../utils/dateRange';
import { dayKey } from '../utils/time';
import { randomUUID } from '../utils/uuid';
import { useAuthStore } from './authStore';
import { type CategoryId } from './categoriesStore';
import { useSettingsStore } from './settingsStore';

/** One completed, attributed segment of tracked time. */
export type LogEntry = {
  id: string;
  category: CategoryId;
  startedAt: number;
  endedAt: number;
  ms: number;
};

export type DayLog = {
  entries: LogEntry[];
  note: string;
};

/** ms tracked per category, for a single calendar day — derived from entries. */
export type DayTotals = Partial<Record<CategoryId, number>>;
export type History = Record<string, DayLog>;

export type TimerStatus = 'idle' | 'running' | 'paused';

type PersistedState = {
  dayStartedAt: number | null;
  /** Absolute anchor: while running, elapsed = now - sessionAnchor. */
  sessionAnchor: number | null;
  /** Frozen elapsed captured on pause, re-folded into the anchor on resume. */
  pausedElapsed: number;
  status: TimerStatus;
  lastCategory: CategoryId | null;
  /** Wall-clock start of the current running/paused segment (for history timestamps). */
  segmentStartedAt: number | null;
  history: History;
};

type Actions = {
  startDay: () => void;
  /** Attribute the running segment to `id`, then restart the stopwatch. Returns ms added. */
  logCategory: (id: CategoryId) => number;
  pause: () => void;
  resume: () => void;
  endDay: () => void;
  resetAll: () => void;
  /** Remove the most recently logged entry (today) and fold its time back into the live segment. */
  undoLast: () => void;
  /** Reassign a logged entry to a different activity — totals recompute automatically. */
  editEntry: (dayKey: string, entryId: string, newCategory: CategoryId) => void;
  /** Remove a single logged entry entirely. */
  deleteEntry: (dayKey: string, entryId: string) => void;
  setNote: (dayKey: string, note: string) => void;
  /** Replace the history with the server's current state — pull-side of sync only. */
  hydrate: (history: History) => void;
};

export type TimerState = PersistedState & Actions;

/**
 * Stable reference for "no data today". Selectors MUST return a referentially
 * stable value when empty — otherwise useSyncExternalStore sees a new snapshot
 * on every render and loops forever ("Maximum update depth exceeded").
 */
const EMPTY_TOTALS: DayTotals = Object.freeze({});
const EMPTY_ENTRIES: readonly LogEntry[] = Object.freeze([]);
const EMPTY_DAY: DayLog = Object.freeze({ entries: EMPTY_ENTRIES as LogEntry[], note: '' });

const initial: PersistedState = {
  dayStartedAt: null,
  sessionAnchor: null,
  pausedElapsed: 0,
  status: 'idle',
  lastCategory: null,
  segmentStartedAt: null,
  history: {},
};

/** Pure helper: elapsed ms of the current running/paused segment. */
export function elapsedFrom(state: PersistedState, now: number): number {
  if (state.status === 'running' && state.sessionAnchor != null) {
    return Math.max(0, now - state.sessionAnchor);
  }
  if (state.status === 'paused') return state.pausedElapsed;
  return 0;
}

/** Today's key, honouring the user's configured day-start hour. */
function todayKey(): string {
  return dayKey(new Date(), useSettingsStore.getState().dayStartHour);
}

/** Push the day's current score + total to Supabase — cheap denormalized cache, cross-device. */
function pushDayTotals(dayKeyValue: string, entries: readonly LogEntry[]): void {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  const totals = entriesToTotals(entries);
  const totalMs = sumTotals(totals);
  const score = scoreForTotals(totals);
  safeSync(() => upsertDayMeta(userId, dayKeyValue, { totalMs, score }));
}

export function entriesToTotals(entries: readonly LogEntry[]): DayTotals {
  if (entries.length === 0) return EMPTY_TOTALS;
  const totals: DayTotals = {};
  for (const e of entries) totals[e.category] = (totals[e.category] ?? 0) + e.ms;
  return totals;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initial,

      startDay: () => {
        const now = Date.now();
        set({
          dayStartedAt: now,
          sessionAnchor: now,
          pausedElapsed: 0,
          status: 'running',
          segmentStartedAt: now,
        });
      },

      logCategory: (id) => {
        const now = Date.now();
        const state = get();
        if (state.status === 'idle' || state.dayStartedAt == null) return 0;

        const added = elapsedFrom(state, now);
        const key = todayKey();
        const day = state.history[key] ?? EMPTY_DAY;

        let history = state.history;
        if (added > 0) {
          const entry: LogEntry = {
            id: randomUUID(),
            category: id,
            startedAt: state.segmentStartedAt ?? now,
            endedAt: now,
            ms: added,
          };
          const entries = [...day.entries, entry];
          history = { ...state.history, [key]: { ...day, entries } };

          const userId = useAuthStore.getState().user?.id;
          if (userId) safeSync(() => insertActivity(userId, key, entry));
          pushDayTotals(key, entries);
        }

        set({
          history,
          sessionAnchor: now,
          pausedElapsed: 0,
          status: 'running',
          lastCategory: id,
          segmentStartedAt: now,
        });
        return added;
      },

      pause: () => {
        const now = Date.now();
        const state = get();
        if (state.status !== 'running') return;
        set({ status: 'paused', pausedElapsed: elapsedFrom(state, now), sessionAnchor: null });
      },

      resume: () => {
        const state = get();
        if (state.status !== 'paused') return;
        set({
          status: 'running',
          sessionAnchor: Date.now() - state.pausedElapsed,
          pausedElapsed: 0,
        });
      },

      endDay: () => {
        set({
          dayStartedAt: null,
          sessionAnchor: null,
          pausedElapsed: 0,
          status: 'idle',
          lastCategory: null,
          segmentStartedAt: null,
        });
      },

      resetAll: () => {
        set({ ...initial });
        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => resetRemoteHistory(userId));
      },

      undoLast: () => {
        const state = get();
        const key = todayKey();
        const day = state.history[key];
        if (!day || day.entries.length === 0) return;

        const last = day.entries[day.entries.length - 1]!;
        const entries = day.entries.slice(0, -1);
        const history: History = { ...state.history, [key]: { ...day, entries } };

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => deleteActivity(last.id));
        pushDayTotals(key, entries);

        if (state.status === 'idle') {
          set({ history });
          return;
        }

        const now = Date.now();
        const restoredElapsed = elapsedFrom(state, now) + last.ms;
        set({
          history,
          status: 'running',
          sessionAnchor: now - restoredElapsed,
          pausedElapsed: 0,
          segmentStartedAt: last.startedAt,
          lastCategory: entries.length > 0 ? entries[entries.length - 1]!.category : null,
        });
      },

      editEntry: (key, entryId, newCategory) => {
        const state = get();
        const day = state.history[key];
        if (!day) return;
        const entries = day.entries.map((e) =>
          e.id === entryId ? { ...e, category: newCategory } : e,
        );
        set({ history: { ...state.history, [key]: { ...day, entries } } });

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => updateActivityCategory(entryId, newCategory));
        pushDayTotals(key, entries);
      },

      deleteEntry: (key, entryId) => {
        const state = get();
        const day = state.history[key];
        if (!day) return;
        const entries = day.entries.filter((e) => e.id !== entryId);
        set({ history: { ...state.history, [key]: { ...day, entries } } });

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => deleteActivity(entryId));
        pushDayTotals(key, entries);
      },

      setNote: (key, note) => {
        const state = get();
        const day = state.history[key] ?? EMPTY_DAY;
        set({ history: { ...state.history, [key]: { ...day, note } } });

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => upsertDayMeta(userId, key, { note }));
      },

      hydrate: (history) => set({ history }),
    }),
    {
      name: 'byte.timer',
      version: 2,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s): PersistedState => ({
        dayStartedAt: s.dayStartedAt,
        sessionAnchor: s.sessionAnchor,
        pausedElapsed: s.pausedElapsed,
        status: s.status,
        lastCategory: s.lastCategory,
        segmentStartedAt: s.segmentStartedAt,
        history: s.history,
      }),
      // v1 stored `history[day]` as a flat { [category]: ms } map. v2 stores a
      // chronological entry log instead, so undo/edit/notes have something to
      // operate on. Old totals become one synthetic entry per category, dated
      // to that calendar day — the granular timestamps are lost, but no time is.
      migrate: (persisted, version) => {
        const p = persisted as { history?: Record<string, unknown>; sessionAnchor?: number | null };
        if (version < 2 && p.history) {
          const migrated: History = {};
          for (const [key, value] of Object.entries(p.history)) {
            const totals = value as DayTotals;
            const nominal = parseDayKey(key).getTime();
            const entries: LogEntry[] = Object.entries(totals)
              .filter(([, ms]) => (ms ?? 0) > 0)
              .map(([category, ms]) => ({
                id: `migrated-${key}-${category}`,
                category: category as CategoryId,
                startedAt: nominal,
                endedAt: nominal,
                ms: ms as number,
              }));
            migrated[key] = { entries, note: '' };
          }
          p.history = migrated;
        }
        return p as PersistedState;
      },
    },
  ),
);

export const sumTotals = (totals: DayTotals): number =>
  Object.values(totals).reduce<number>((acc, v) => acc + (v ?? 0), 0);
