import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type MascotKey } from '../constants/mascots';
import {
  deleteCategory,
  replaceAllCategories,
  updatePositions,
  upsertCategory,
} from '../services/sync/categories';
import { safeSync } from '../services/sync/safeSync';
import { zustandStorage } from '../services/storage';
import { categoryColors, type CategoryColorKey } from '../theme/colors';
import { randomUUID } from '../utils/uuid';
import { useAuthStore } from './authStore';

/**
 * How an activity's time is read into the day score:
 * progress counts fully toward it, essential is neutral, waste counts
 * against it. Kept to three plain options on purpose — this is the only
 * lever the score needs, not a tagging system.
 */
export type CategoryType = 'progress' | 'essential' | 'waste';

export type CategoryId = string;

export type Category = {
  id: CategoryId;
  label: string;
  mascot: MascotKey;
  color: CategoryColorKey;
  type: CategoryType;
  /** Hidden categories keep their history but drop off the logging grid. */
  hidden: boolean;
  /** Daily time target, in ms. 0 = no goal. Lives on the category (Supabase's `goal_minutes`). */
  goalMs: number;
};

/** Seed data — also what "reset to defaults" restores. Fresh ids every time. */
function cloneDefaults(): Category[] {
  const seed: Omit<Category, 'id'>[] = [
    {
      label: 'Travail',
      mascot: 'working',
      color: 'indigo',
      type: 'progress',
      hidden: false,
      goalMs: 0,
    },
    {
      label: 'Étude',
      mascot: 'writing',
      color: 'violet',
      type: 'progress',
      hidden: false,
      goalMs: 0,
    },
    {
      label: 'Lecture',
      mascot: 'reading',
      color: 'teal',
      type: 'progress',
      hidden: false,
      goalMs: 0,
    },
    { label: 'Sport', mascot: 'sport', color: 'coral', type: 'progress', hidden: false, goalMs: 0 },
    {
      label: 'Repas',
      mascot: 'eating',
      color: 'amber',
      type: 'essential',
      hidden: false,
      goalMs: 0,
    },
    {
      label: 'Pause',
      mascot: 'coffee',
      color: 'clay',
      type: 'essential',
      hidden: false,
      goalMs: 0,
    },
    { label: 'Jeu', mascot: 'gaming', color: 'sky', type: 'waste', hidden: false, goalMs: 0 },
    { label: 'Social', mascot: 'phone', color: 'rose', type: 'waste', hidden: false, goalMs: 0 },
    {
      label: 'Musique',
      mascot: 'music',
      color: 'lilac',
      type: 'essential',
      hidden: false,
      goalMs: 0,
    },
    {
      label: 'Détente',
      mascot: 'meditating',
      color: 'mint',
      type: 'essential',
      hidden: false,
      goalMs: 0,
    },
  ];
  return seed.map((c) => ({ ...c, id: randomUUID() }));
}

/** Returned for an id that no longer exists (deleted category) so lookups never crash. */
const FALLBACK: Omit<Category, 'id'> = {
  label: 'Autre',
  mascot: 'meditating',
  color: 'clay',
  type: 'essential',
  hidden: true,
  goalMs: 0,
};

export const CATEGORY_TYPE_LABEL: Record<CategoryType, string> = {
  progress: 'Progression',
  essential: 'Essentiel',
  waste: 'Perte de temps',
};

export const CATEGORY_COLOR_KEYS = Object.keys(categoryColors) as CategoryColorKey[];

type NewCategoryInput = {
  label: string;
  mascot: MascotKey;
  color: CategoryColorKey;
  type: CategoryType;
  goalMs: number;
};

type CategoriesState = {
  categories: Category[];
  addCategory: (input: NewCategoryInput) => CategoryId;
  updateCategory: (id: CategoryId, patch: Partial<Omit<Category, 'id'>>) => void;
  removeCategory: (id: CategoryId) => void;
  moveCategory: (id: CategoryId, direction: -1 | 1) => void;
  resetToDefaults: () => void;
  /** Replace everything with the server's current state — pull-side of sync only. */
  hydrate: (categories: Category[]) => void;
};

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: cloneDefaults(),

      addCategory: (input) => {
        const id = randomUUID();
        const category: Category = { ...input, id, hidden: false };
        const position = get().categories.length;
        set({ categories: [...get().categories, category] });

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => upsertCategory(userId, category, position));
        return id;
      },

      updateCategory: (id, patch) => {
        const categories = get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
        set({ categories });

        const userId = useAuthStore.getState().user?.id;
        const position = categories.findIndex((c) => c.id === id);
        const updated = categories[position];
        if (userId && updated) safeSync(() => upsertCategory(userId, updated, position));
      },

      removeCategory: (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => deleteCategory(id));
      },

      moveCategory: (id, direction) => {
        const list = [...get().categories];
        const index = list.findIndex((c) => c.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target]!, list[index]!];
        set({ categories: list });

        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          safeSync(() =>
            updatePositions([
              { id: list[index]!.id, position: index },
              { id: list[target]!.id, position: target },
            ]),
          );
        }
      },

      resetToDefaults: () => {
        const categories = cloneDefaults();
        set({ categories });

        const userId = useAuthStore.getState().user?.id;
        if (userId) safeSync(() => replaceAllCategories(userId, categories));
      },

      hydrate: (categories) => set({ categories }),
    }),
    {
      name: 'byte.categories',
      version: 2,
      storage: createJSONStorage(() => zustandStorage),
      // v1 categories had no daily-goal field (goals lived in a separate
      // settings map). Default to "no goal" rather than lose the category.
      migrate: (persisted, version) => {
        const p = persisted as { categories?: Record<string, unknown>[] };
        if (version < 2 && p.categories) {
          p.categories = p.categories.map((c) => ({ goalMs: 0, ...c }));
        }
        return p as CategoriesState;
      },
    },
  ),
);

/** Always returns a usable category, even if `id` was since deleted. */
export function resolveCategory(id: CategoryId): Category {
  const found = useCategoriesStore.getState().categories.find((c) => c.id === id);
  return found ?? { ...FALLBACK, id };
}

export const colorForCategory = (id: CategoryId): string =>
  categoryColors[resolveCategory(id).color];

export const selectVisibleCategories = (s: CategoriesState): Category[] =>
  s.categories.filter((c) => !c.hidden);
