import { createContext, useContext, useMemo } from 'react';
import { makeUnitHelpers } from './units';

export const SettingsContext = createContext(null);

// { theme: 'dark' | 'light' | 'system', resolvedTheme: 'dark' | 'light', unit: 'kg' | 'lb', setTheme, setUnit }
export const useSettings = () => useContext(SettingsContext);

// Weight helpers for the user's chosen unit - see units.js.
// Memoized per unit so the functions are stable and safe to use in effect dependencies.
export const useUnits = () => {
  const { unit } = useSettings();
  return useMemo(() => makeUnitHelpers(unit), [unit]);
};
