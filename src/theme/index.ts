import { type Colors } from './colors';
import { type ShadowKey, useShadows } from './shadows';
import { radius, spacing } from './spacing';
import { typography } from './typography';
import { useColors } from './ThemeContext';

export type Theme = {
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: Record<ShadowKey, object>;
};

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './ThemeContext';

/** Live theme snapshot: colors and shadows resolve to the active scheme. */
export function useTheme(): Theme {
  return { colors: useColors(), spacing, radius, typography, shadows: useShadows() };
}
