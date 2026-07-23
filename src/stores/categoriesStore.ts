import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type MascotKey } from '../constants/mascots';
import { zustandStorage } from '../services/storage';
import { categoryColors, type CategoryColorKey } from '../theme/colors';

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
};

/** Seed data — also what "reset to defaults" restores. */
const DEFAULT_CATEGORIES: readonly Category[] = [
  {
    id: 'work',
    label: 'Travail',
    mascot: 'working',
    color: 'indigo',
    type: 'progress',
    hidden: false,
  },
  {
    id: 'study',
    label: 'Étude',
    mascot: 'writing',
    color: 'violet',
    type: 'progress',
    hidden: false,
  },
  {
    id: 'read',
    label: 'Lecture',
    mascot: 'reading',
    color: 'teal',
    type: 'progress',
    hidden: false,
  },
  { id: 'sport', label: 'Sport', mascot: 'sport', color: 'coral', type: 'progress', hidden: false },
  { id: 'eat', label: 'Repas', mascot: 'eating', color: 'amber', type: 'essential', hidden: false },
  {
    id: 'break',
    label: 'Pause',
    mascot: 'coffee',
    color: 'clay',
    type: 'essential',
    hidden: false,
  },
  { id: 'play', label: 'Jeu', mascot: 'gaming', color: 'sky', type: 'waste', hidden: false },
  { id: 'social', label: 'Social', mascot: 'phone', color: 'rose', type: 'waste', hidden: false },
  {
    id: 'music',
    label: 'Musique',
    mascot: 'music',
    color: 'lilac',
    type: 'essential',
    hidden: false,
  },
  {
    id: 'rest',
    label: 'Détente',
    mascot: 'meditating',
    color: 'mint',
    type: 'essential',
    hidden: false,
  },
];

/** Returned for an id that no longer exists (deleted category) so lookups never crash. */
const FALLBACK: Omit<Category, 'id'> = {
  label: 'Autre',
  mascot: 'meditating',
  color: 'clay',
  type: 'essential',
  hidden: true,
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
};

type CategoriesState = {
  categories: Category[];
  addCategory: (input: NewCategoryInput) => CategoryId;
  updateCategory: (id: CategoryId, patch: Partial<Omit<Category, 'id'>>) => void;
  removeCategory: (id: CategoryId) => void;
  moveCategory: (id: CategoryId, direction: -1 | 1) => void;
  resetToDefaults: () => void;
};

function cloneDefaults(): Category[] {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
}

function makeCategoryId(): CategoryId {
  return `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: cloneDefaults(),

      addCategory: (input) => {
        const id = makeCategoryId();
        set({ categories: [...get().categories, { ...input, id, hidden: false }] });
        return id;
      },

      updateCategory: (id, patch) => {
        set({
          categories: get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        });
      },

      removeCategory: (id) => {
        set({ categories: get().categories.filter((c) => c.id !== id) });
      },

      moveCategory: (id, direction) => {
        const list = [...get().categories];
        const index = list.findIndex((c) => c.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target]!, list[index]!];
        set({ categories: list });
      },

      resetToDefaults: () => set({ categories: cloneDefaults() }),
    }),
    {
      name: 'byte.categories',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
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
