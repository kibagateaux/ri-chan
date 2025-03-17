import { MMKV } from 'react-native-mmkv';
import { Linking } from 'react-native';
import type { StoreApi, UseBoundStore } from 'zustand';

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}

export const storage = new MMKV();

export function getStorage<T>(key: string): T {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setStorage<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeStorage(key: string) {
  storage.delete(key);
}