import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { safeSync } from '../services/sync/safeSync';
import { updateSettings } from '../services/sync/settings';
import { zustandStorage } from '../services/storage';
import { useAuthStore } from './authStore';

export type ThemeMode = 'system' | 'light' | 'dark';

type SettingsState = {
  themeMode: ThemeMode;
  /** 0-23. A day "starts" at this hour instead of midnight. */
  dayStartHour: number;
  setThemeMode: (mode: ThemeMode) => void;
  setDayStartHour: (hour: number) => void;
  /** Replace with the server's current state — pull-side of sync only. */
  hydrate: (remote: { themeMode: ThemeMode; dayStartHour: number }) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      dayStartHour: 0,

      setThemeMode: (themeMode) => {
        set({ themeMode });
        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => updateSettings(userId, { themeMode }));
      },

      setDayStartHour: (hour) => {
        const dayStartHour = Math.min(23, Math.max(0, Math.round(hour)));
        set({ dayStartHour });
        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => updateSettings(userId, { dayStartHour }));
      },

      hydrate: (remote) => set({ themeMode: remote.themeMode, dayStartHour: remote.dayStartHour }),
    }),
    {
      name: 'byte.settings',
      version: 2,
      storage: createJSONStorage(() => zustandStorage),
      // v1 kept a `goals` map here; goals now live per-category (`Category.goalMs`).
      migrate: (persisted) => {
        const p = persisted as Record<string, unknown>;
        delete p.goals;
        return p as SettingsState;
      },
    },
  ),
);
