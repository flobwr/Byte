import { MMKV } from 'react-native-mmkv';
import { type StateStorage } from 'zustand/middleware';

/** Single MMKV instance for the whole app. Synchronous, fast, encrypted-capable. */
export const storage = new MMKV({ id: 'byte.store' });

/** Adapter that lets Zustand's `persist` middleware write to MMKV. */
export const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};
