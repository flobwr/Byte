import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '../stores/settingsStore';
import { type Colors, darkColors, lightColors } from './colors';

export type ResolvedScheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: ResolvedScheme;
  colors: Colors;
};

const ThemeCtx = createContext<ThemeContextValue>({ scheme: 'dark', colors: darkColors });

/**
 * Resolves the active color scheme from the user's preference (system /
 * light / dark) and the OS setting, then provides the matching color table
 * to the whole tree. This is the single source of truth for theming — every
 * component reads colors through `useColors()` instead of importing a
 * static object, so switching theme re-renders live.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = useSettingsStore((s) => s.themeMode);

  const scheme: ResolvedScheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, colors: scheme === 'light' ? lightColors : darkColors }),
    [scheme],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/** The resolved color table for the current theme. Re-renders on theme change. */
export function useColors(): Colors {
  return useContext(ThemeCtx).colors;
}

/** 'light' | 'dark' — the theme actually in effect, after resolving "system". */
export function useResolvedScheme(): ResolvedScheme {
  return useContext(ThemeCtx).scheme;
}
