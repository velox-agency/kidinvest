import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({ id: 'kidinvest-storage' })

export const mmkvZustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};

// Typed helpers for direct MMKV reads/writes (outside Zustand)
export const mmkv = {
  getString: (key: string) => storage.getString(key) ?? null,
  setString: (key: string, value: string) => storage.set(key, value),
  getBool: (key: string) => storage.getBoolean(key) ?? false,
  setBool: (key: string, value: boolean) => storage.set(key, value),
  delete: (key: string) => storage.remove(key),
  clearAll: () => storage.clearAll(),
};

// Well-known MMKV keys (not managed by Zustand)
export const MMKV_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  LANGUAGE: 'language',
} as const;