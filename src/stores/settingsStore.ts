import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type CategoryId } from './categoriesStore';
import { zustandStorage } from '../services/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  /** 0-23. A day "starts" at this hour instead of midnight. */
  dayStartHour: number;
  /** Daily time target per activity, in ms. Absent = no goal set. */
  goals: Partial<Record<CategoryId, number>>;
  setThemeMode: (mode: ThemeMode) => void;
  setDayStartHour: (hour: number) => void;
  setGoal: (id: CategoryId, ms: number | null) => void;
  clearGoals: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      dayStartHour: 0,
      goals: {},

      setThemeMode: (themeMode) => set({ themeMode }),

      setDayStartHour: (hour) => set({ dayStartHour: Math.min(23, Math.max(0, Math.round(hour))) }),

      setGoal: (id, ms) => {
        const goals = { ...get().goals };
        if (ms == null || ms <= 0) delete goals[id];
        else goals[id] = ms;
        set({ goals });
      },

      clearGoals: () => set({ goals: {} }),
    }),
    {
      name: 'byte.settings',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
