import { type Category, type CategoryId, type CategoryType } from '../../stores/categoriesStore';
import { type LogEntry } from '../../stores/timerStore';
import { type MascotKey } from '../../constants/mascots';
import { type CategoryColorKey } from '../../theme/colors';
import { type ActivityRow, type CategoryRow, type CategoryTypeRow, type ThemeRow } from './types';

/** Stand-in id for an entry whose category was deleted server-side (FK → SET NULL). */
export const DELETED_CATEGORY_ID: CategoryId = 'deleted-category';

const TYPE_TO_ROW: Record<CategoryType, CategoryTypeRow> = {
  progress: 'Progression',
  essential: 'Essentiel',
  waste: 'Perte de temps',
};
const TYPE_FROM_ROW: Record<CategoryTypeRow, CategoryType> = {
  Progression: 'progress',
  Essentiel: 'essential',
  'Perte de temps': 'waste',
};

export const categoryTypeToRow = (type: CategoryType): CategoryTypeRow => TYPE_TO_ROW[type];
export const categoryTypeFromRow = (type: CategoryTypeRow): CategoryType => TYPE_FROM_ROW[type];

/** ThemeMode and the `theme_type` enum share the same three literal values. */
export const themeToRow = (mode: string): ThemeRow => mode as ThemeRow;

export function dayStartHourToRow(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00:00`;
}

export function dayStartHourFromRow(time: string): number {
  const hour = Number.parseInt(time.split(':')[0] ?? '0', 10);
  return Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 0;
}

export const goalMsToMinutes = (ms: number): number => Math.round(ms / 60000);
export const goalMinutesToMs = (minutes: number): number => minutes * 60000;

export const durationMsToMinutes = (ms: number): number => ms / 60000;
export const durationMinutesToMs = (minutes: number): number => Math.round(minutes * 60000);

export function categoryFromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    label: row.name,
    mascot: (row.icon ?? 'meditating') as MascotKey,
    color: row.color as CategoryColorKey,
    type: categoryTypeFromRow(row.type),
    hidden: row.is_hidden,
    goalMs: goalMinutesToMs(row.goal_minutes),
  };
}

export function activityRowToEntry(row: ActivityRow): LogEntry {
  return {
    id: row.id,
    category: row.category_id ?? DELETED_CATEGORY_ID,
    startedAt: new Date(row.start_time).getTime(),
    endedAt: new Date(row.end_time).getTime(),
    ms: durationMinutesToMs(row.duration_minutes),
  };
}
