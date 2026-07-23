import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../services/storage';

type MetaState = {
  /** First time the app was ever opened, or (once signed in) the account's creation date. */
  createdAt: number | null;
  /** Per-device flag: pre-existing local data has been pushed to Supabase once. */
  migratedToSupabase: boolean;
  ensureCreated: () => void;
  setCreatedAt: (timestamp: number) => void;
  markMigrated: () => void;
};

/**
 * Tiny additive store for app metadata. It does not touch the tracking logic —
 * it only stamps the first-run date so the profile can show "données depuis".
 */
export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      createdAt: null,
      migratedToSupabase: false,
      ensureCreated: () => {
        if (get().createdAt == null) set({ createdAt: Date.now() });
      },
      setCreatedAt: (createdAt) => set({ createdAt }),
      markMigrated: () => set({ migratedToSupabase: true }),
    }),
    {
      name: 'byte.meta',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
