import { supabase } from '../supabase';
import { type ProfileRow } from './types';

/** Account creation date — the authoritative "data since" once signed in. */
export async function fetchProfileCreatedAt(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? new Date((data as Pick<ProfileRow, 'created_at'>).created_at).getTime() : null;
}
