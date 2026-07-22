import { categoryColors, type CategoryColorKey } from '../theme/colors';
import { type MascotKey } from './mascots';

export type CategoryId =
  | 'work'
  | 'study'
  | 'read'
  | 'sport'
  | 'eat'
  | 'break'
  | 'play'
  | 'social'
  | 'music'
  | 'rest';

export type Category = {
  id: CategoryId;
  label: string;
  mascot: MascotKey;
  color: CategoryColorKey;
};

/**
 * Default activities. Ordered by how often a typical day touches them so the
 * most-used cards sit within thumb reach at the top of the grid.
 */
export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: 'work', label: 'Travail', mascot: 'working', color: 'indigo' },
  { id: 'study', label: 'Étude', mascot: 'writing', color: 'violet' },
  { id: 'read', label: 'Lecture', mascot: 'reading', color: 'teal' },
  { id: 'sport', label: 'Sport', mascot: 'sport', color: 'coral' },
  { id: 'eat', label: 'Repas', mascot: 'eating', color: 'amber' },
  { id: 'break', label: 'Pause', mascot: 'coffee', color: 'clay' },
  { id: 'play', label: 'Jeu', mascot: 'gaming', color: 'sky' },
  { id: 'social', label: 'Social', mascot: 'phone', color: 'rose' },
  { id: 'music', label: 'Musique', mascot: 'music', color: 'lilac' },
  { id: 'rest', label: 'Détente', mascot: 'meditating', color: 'mint' },
] as const;

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const colorForCategory = (id: CategoryId): string =>
  categoryColors[CATEGORY_BY_ID[id].color];
