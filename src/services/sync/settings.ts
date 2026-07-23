import { type ThemeMode } from '../../stores/settingsStore';
import { supabase } from '../supabase';
import { dayStartHourFromRow, dayStartHourToRow, themeToRow } from './mappers';
import { type SettingsRow } from './types';

export type RemoteSettings = { themeMode: ThemeMode; dayStartHour: number };

export async function fetchSettings(userId: string): Promise<RemoteSettings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('theme, day_start')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Pick<SettingsRow, 'theme' | 'day_start'>;
  return { themeMode: row.theme, dayStartHour: dayStartHourFromRow(row.day_start) };
}

export async function updateSettings(
  userId: string,
  patch: Partial<RemoteSettings>,
): Promise<void> {
  const row: Record<string, string> = {};
  if (patch.themeMode) row.theme = themeToRow(patch.themeMode);
  if (patch.dayStartHour != null) row.day_start = dayStartHourToRow(patch.dayStartHour);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('settings').update(row).eq('user_id', userId);
  if (error) throw error;
}
