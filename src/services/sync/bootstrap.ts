import { scoreForTotals } from '../../features/stats/score';
import { type Category, type CategoryId, useCategoriesStore } from '../../stores/categoriesStore';
import { useMetaStore } from '../../stores/metaStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { entriesToTotals, type History, sumTotals, useTimerStore } from '../../stores/timerStore';
import { randomUUID } from '../../utils/uuid';
import { fetchCategories, replaceAllCategories } from './categories';
import { clearDayIdCache, fetchAllDays, insertActivity, upsertDayMeta } from './days';
import { DELETED_CATEGORY_ID } from './mappers';
import { fetchProfileCreatedAt } from './profile';
import { fetchSettings, updateSettings } from './settings';

/**
 * One-time, per-device push of whatever this device already had locally
 * before its first sign-in. Every id gets a fresh uuid (old local ids —
 * "work", "cat-abc123" — predate Supabase and aren't valid `uuid` values),
 * with a local id→id map so entries end up pointing at their category's new
 * remote id. Runs at most once per device (`metaStore.migratedToSupabase`).
 */
async function migrateLocalDataIfNeeded(userId: string): Promise<void> {
  if (useMetaStore.getState().migratedToSupabase) return;

  const localCategories = useCategoriesStore.getState().categories;
  const localSettings = useSettingsStore.getState();
  const localHistory = useTimerStore.getState().history;

  const idMap = new Map<CategoryId, CategoryId>();
  const migratedCategories: Category[] = localCategories.map((c) => {
    const newId = randomUUID();
    idMap.set(c.id, newId);
    return { ...c, id: newId };
  });
  await replaceAllCategories(userId, migratedCategories);
  useCategoriesStore.getState().hydrate(migratedCategories);

  await updateSettings(userId, {
    themeMode: localSettings.themeMode,
    dayStartHour: localSettings.dayStartHour,
  });

  const migratedHistory: History = {};
  await Promise.all(
    Object.entries(localHistory).map(async ([dayKey, day]) => {
      const entries = day.entries.map((e) => ({
        ...e,
        id: randomUUID(),
        category: idMap.get(e.category) ?? DELETED_CATEGORY_ID,
      }));
      await Promise.all(entries.map((entry) => insertActivity(userId, dayKey, entry)));
      if (entries.length > 0 || day.note.trim().length > 0) {
        const totals = entriesToTotals(entries);
        await upsertDayMeta(userId, dayKey, {
          note: day.note,
          totalMs: sumTotals(totals),
          score: scoreForTotals(totals),
        });
      }
      migratedHistory[dayKey] = { entries, note: day.note };
    }),
  );
  useTimerStore.getState().hydrate(migratedHistory);

  useMetaStore.getState().markMigrated();
}

/**
 * Runs once per sign-in (see the root layout): migrates any pre-existing
 * local data the first time, then always pulls the server's current state
 * so every store reflects Supabase, not a stale local cache.
 */
export async function bootstrapAfterSignIn(userId: string): Promise<void> {
  try {
    await migrateLocalDataIfNeeded(userId);

    clearDayIdCache();
    const [categories, settings, history, createdAt] = await Promise.all([
      fetchCategories(userId),
      fetchSettings(userId),
      fetchAllDays(userId),
      fetchProfileCreatedAt(userId),
    ]);

    useCategoriesStore.getState().hydrate(categories);
    if (settings) useSettingsStore.getState().hydrate(settings);
    useTimerStore.getState().hydrate(history);
    if (createdAt != null) useMetaStore.getState().setCreatedAt(createdAt);
  } catch (err) {
    console.warn('[sync] bootstrap failed, continuing with locally cached data:', err);
  }
}

/** Clears the day-id cache — call on sign-out so a later sign-in starts clean. */
export function resetSyncState(): void {
  clearDayIdCache();
}
