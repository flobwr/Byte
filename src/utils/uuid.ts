import { randomUUID as cryptoRandomUUID } from 'expo-crypto';

/**
 * RFC 4122 v4 UUID, generated client-side so new rows (categories, entries)
 * can carry the same id locally and in Supabase from the moment they're
 * created — no round trip needed before the id is usable everywhere.
 *
 * Uses expo-crypto (a first-party Expo SDK module, supported in Expo Go)
 * rather than a bare native polyfill, keeping this dependency-light.
 */
export function randomUUID(): string {
  return cryptoRandomUUID();
}
