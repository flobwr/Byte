import AsyncStorage from '@react-native-async-storage/async-storage';
import { type StateStorage } from 'zustand/middleware';

/**
 * Key/value storage for the app, backed by AsyncStorage.
 *
 * AsyncStorage ships with Expo Go and works across every platform without a
 * custom native build, so persistence is available everywhere out of the box.
 * The API is asynchronous — Zustand's `persist` middleware handles that
 * natively via the adapter below.
 */

/** Low-level async key/value store. */
export const storage = {
  set: (key: string, value: string): Promise<void> => AsyncStorage.setItem(key, value),
  getString: (key: string): Promise<string | null> => AsyncStorage.getItem(key),
  delete: (key: string): Promise<void> => AsyncStorage.removeItem(key),
} as const;

/** Adapter that lets Zustand's `persist` middleware read/write AsyncStorage. */
export const zustandStorage: StateStorage = {
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  getItem: (name) => AsyncStorage.getItem(name),
  removeItem: (name) => AsyncStorage.removeItem(name),
};
