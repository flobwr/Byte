import { Platform, type ViewStyle } from 'react-native';

import { useResolvedScheme } from './ThemeContext';

/** Discreet elevation. Shadows stay soft and low-contrast on both surfaces. */
const make = (elevation: number, opacity: number, radius: number, y: number): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;

const darkShadows = {
  none: {} as ViewStyle,
  sm: make(2, 0.25, 8, 3),
  md: make(6, 0.35, 18, 8),
  lg: make(12, 0.45, 30, 16),
  glow: {
    shadowColor: '#7C8CF8',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  } as ViewStyle,
} as const;

// Lighter surfaces need noticeably softer, lower-contrast shadows or they
// read as heavy smudges instead of a gentle lift.
const lightShadows = {
  none: {} as ViewStyle,
  sm: make(2, 0.06, 8, 2),
  md: make(4, 0.08, 16, 6),
  lg: make(8, 0.1, 26, 12),
  glow: {
    shadowColor: '#5C6BD6',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  } as ViewStyle,
} as const;

export type ShadowKey = keyof typeof darkShadows;
/** Static default, dark-themed — for the few call sites outside React render. */
export const shadows = darkShadows;

/** Theme-aware shadow table. Reads the resolved scheme, re-renders on theme change. */
export function useShadows(): typeof darkShadows {
  const scheme = useResolvedScheme();
  return scheme === 'light' ? lightShadows : darkShadows;
}
