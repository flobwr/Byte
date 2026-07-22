import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type CategoryId } from '../constants/categories';
import { zustandStorage } from '../services/storage';
import { dayKey } from '../utils/time';

/** ms tracked per category, for a single calendar day. */
export type DayTotals = Partial<Record<CategoryId, number>>;
export type History = Record<string, DayTotals>;

export type TimerStatus = 'idle' | 'running' | 'paused';

type PersistedState = {
  dayStartedAt: number | null;
  /** Absolute anchor: while running, elapsed = now - sessionAnchor. */
  sessionAnchor: number | null;
  /** Frozen elapsed captured on pause, re-folded into the anchor on resume. */
  pausedElapsed: number;
  status: TimerStatus;
  lastCategory: CategoryId | null;
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
};

export type TimerState = PersistedState & Actions;

/**
 * Stable reference for "no data today". Selectors MUST return a referentially
 * stable value when empty — otherwise useSyncExternalStore sees a new snapshot
 * on every render and loops forever ("Maximum update depth exceeded").
 */
const EMPTY_TOTALS: DayTotals = Object.freeze({});

const initial: PersistedState = {
  dayStartedAt: null,
  sessionAnchor: null,
  pausedElapsed: 0,
  status: 'idle',
  lastCategory: null,
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
        });
      },

      logCategory: (id) => {
        const now = Date.now();
        const state = get();
        if (state.status === 'idle' || state.dayStartedAt == null) return 0;

        const added = elapsedFrom(state, now);
        const key = dayKey(new Date(now));
        const day = state.history[key] ?? {};
        const next: History = {
          ...state.history,
          [key]: { ...day, [id]: (day[id] ?? 0) + added },
        };

        set({
          history: next,
          sessionAnchor: now,
          pausedElapsed: 0,
          status: 'running',
          lastCategory: id,
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
        });
      },

      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'byte.timer',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s): PersistedState => ({
        dayStartedAt: s.dayStartedAt,
        sessionAnchor: s.sessionAnchor,
        pausedElapsed: s.pausedElapsed,
        status: s.status,
        lastCategory: s.lastCategory,
        history: s.history,
      }),
    },
  ),
);

/** Selector helpers (kept outside the store to avoid re-render churn). */
export const selectTodayTotals = (s: TimerState): DayTotals => s.history[dayKey()] ?? EMPTY_TOTALS;

export const sumTotals = (totals: DayTotals): number =>
  Object.values(totals).reduce<number>((acc, v) => acc + (v ?? 0), 0);
