// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '@/types';

const SETTINGS_KEY = '@fitness_tracker_settings';

export async function getSettings(): Promise<Settings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return { defaultUnit: 'kg' };
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}
