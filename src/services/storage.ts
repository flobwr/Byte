import { type StateStorage } from 'zustand/middleware';

/**
 * Key/value storage for the app.
 *
 * We use MMKV (synchronous, fast, persistent) whenever it can initialise —
 * i.e. in a dev/production build with the New Architecture enabled. MMKV is a
 * TurboModule and is NOT available in Expo Go, so we degrade gracefully to an
 * in-memory store there instead of hard-crashing on import. Persistence then
 * lasts for the session only; a development build restores full persistence.
 *
 * → For real persistence run a dev build: `npx expo run:ios` / `run:android`
 *   (New Architecture is enabled via app.json `newArchEnabled: true`).
 */

type KeyValue = {
  set: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  delete: (key: string) => void;
};

function createStorage(): { kv: KeyValue; persistent: boolean } {
  try {
    // Lazy require so a missing/old-arch native module can't crash module init.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    const instance = new MMKV({ id: 'byte.store' });
    // Touch it once to surface any TurboModule error here, inside the try.
    instance.getString('__probe__');
    return { kv: instance, persistent: true };
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[Byte] MMKV unavailable — using in-memory storage (data will not persist). ' +
          'Run a development build for full persistence.',
        error,
      );
    }
    const memory = new Map<string, string>();
    return {
      kv: {
        set: (key, value) => void memory.set(key, value),
        getString: (key) => memory.get(key),
        delete: (key) => void memory.delete(key),
      },
      persistent: false,
    };
  }
}

const { kv, persistent } = createStorage();

/** True when writes survive an app restart (MMKV active). */
export const isPersistent = persistent;

/** Low-level key/value store (MMKV or in-memory fallback). */
export const storage = kv;

/** Adapter that lets Zustand's `persist` middleware write to our storage. */
export const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => kv.set(name, value),
  getItem: (name) => kv.getString(name) ?? null,
  removeItem: (name) => kv.delete(name),
};
