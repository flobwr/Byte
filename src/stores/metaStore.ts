import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '../services/storage';

type MetaState = {
  /** First time the app was ever opened — the "data since" date. */
  createdAt: number | null;
  ensureCreated: () => void;
};

/**
 * Tiny additive store for app metadata. It does not touch the tracking logic —
 * it only stamps the first-run date so the profile can show "données depuis".
 */
export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      createdAt: null,
      ensureCreated: () => {
        if (get().createdAt == null) set({ createdAt: Date.now() });
      },
    }),
    {
      name: 'byte.meta',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
