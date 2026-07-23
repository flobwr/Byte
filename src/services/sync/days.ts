import { type CategoryId } from '../../stores/categoriesStore';
import { type History, type LogEntry } from '../../stores/timerStore';
import { supabase } from '../supabase';
import { activityRowToEntry, durationMsToMinutes } from './mappers';
import { type DayWithActivitiesRow } from './types';

/** Local dayKey -> remote `days.id`, so repeated writes on the same day skip the lookup. */
const dayIdCache = new Map<string, string>();

export function clearDayIdCache(): void {
  dayIdCache.clear();
}

/** Get-or-create the remote day row for a local day key, returning its id. */
async function resolveDayId(userId: string, dayKey: string): Promise<string> {
  const cached = dayIdCache.get(dayKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('days')
    .upsert({ user_id: userId, day_date: dayKey }, { onConflict: 'user_id,day_date' })
    .select('id')
    .single();
  if (error) throw error;

  const id = (data as { id: string }).id;
  dayIdCache.set(dayKey, id);
  return id;
}

/** Pull every day + its activities for the signed-in user, for initial hydration. */
export async function fetchAllDays(userId: string): Promise<History> {
  const { data, error } = await supabase
    .from('days')
    .select(
      'id, day_date, note, activities(id, category_id, start_time, end_time, duration_minutes)',
    )
    .eq('user_id', userId);
  if (error) throw error;

  const history: History = {};
  for (const row of data as DayWithActivitiesRow[]) {
    dayIdCache.set(row.day_date, row.id);
    const entries: LogEntry[] = [...row.activities]
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .map(activityRowToEntry);
    history[row.day_date] = { entries, note: row.note ?? '' };
  }
  return history;
}

export async function upsertDayMeta(
  userId: string,
  dayKey: string,
  patch: { note?: string; score?: number; totalMs?: number },
): Promise<void> {
  const dayId = await resolveDayId(userId, dayKey);
  const row: Record<string, unknown> = {};
  if (patch.note != null) row.note = patch.note;
  if (patch.score != null) row.score = patch.score;
  if (patch.totalMs != null) row.total_minutes = durationMsToMinutes(patch.totalMs);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('days').update(row).eq('id', dayId);
  if (error) throw error;
}

export async function insertActivity(
  userId: string,
  dayKey: string,
  entry: LogEntry,
): Promise<void> {
  const dayId = await resolveDayId(userId, dayKey);
  const { error } = await supabase.from('activities').insert({
    id: entry.id,
    day_id: dayId,
    category_id: entry.category,
    start_time: new Date(entry.startedAt).toISOString(),
    end_time: new Date(entry.endedAt).toISOString(),
    duration_minutes: durationMsToMinutes(entry.ms),
  });
  if (error) throw error;
}

export async function updateActivityCategory(
  entryId: string,
  categoryId: CategoryId,
): Promise<void> {
  const { error } = await supabase
    .from('activities')
    .update({ category_id: categoryId })
    .eq('id', entryId);
  if (error) throw error;
}

export async function deleteActivity(entryId: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', entryId);
  if (error) throw error;
}

/** "Réinitialiser Byte": wipes every day (and, via cascade, every activity). */
export async function resetRemoteHistory(userId: string): Promise<void> {
  const { error } = await supabase.from('days').delete().eq('user_id', userId);
  if (error) throw error;
  clearDayIdCache();
}
