import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { SettingsContext } from './SettingsContext';

// Settings are per-device preferences, saved in localStorage.
// index.html reads the same key before React loads, so there's no flash of the wrong theme.
const STORAGE_KEY = 'tonnage_settings';
const DEFAULTS = { theme: 'dark', unit: 'kg' };

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
}

// Live "does the OS prefer dark?" value, for theme = 'system'
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const subscribeToSystemTheme = (callback) => {
  darkQuery.addEventListener('change', callback);
  return () => darkQuery.removeEventListener('change', callback);
};

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, () => darkQuery.matches);

  const resolvedTheme =
    settings.theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : settings.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable (e.g. private mode) - settings still apply for this visit
    }
  }, [settings]);

  const setTheme = useCallback((theme) => setSettings((s) => ({ ...s, theme })), []);
  const setUnit = useCallback((unit) => setSettings((s) => ({ ...s, unit })), []);

  const value = useMemo(
    () => ({ ...settings, resolvedTheme, setTheme, setUnit }),
    [settings, resolvedTheme, setTheme, setUnit]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
