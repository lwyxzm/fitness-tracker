// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { Settings } from '@/types';
import { getSettings, saveSettings } from '@/lib/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (newSettings: Settings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  return { settings, isLoading, updateSettings };
}
