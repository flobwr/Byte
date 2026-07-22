import { Platform, type ViewStyle } from 'react-native';

/** Discreet elevation. Shadows stay soft and low-contrast on dark surfaces. */
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

export const shadows = {
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

export type ShadowKey = keyof typeof shadows;
