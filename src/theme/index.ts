import { colors } from './colors';
import { shadows } from './shadows';
import { radius, spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';

/**
 * A hook indirection so the codebase never imports the raw `theme` object
 * directly in components. This keeps the door open for a light theme or a
 * runtime ThemeProvider later without touching call sites.
 */
export function useTheme(): Theme {
  return theme;
}
