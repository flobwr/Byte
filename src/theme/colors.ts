/**
 * Byte color system — dark-first, sober and premium.
 * Inspired by Linear / Arc / Nothing: near-black canvas, quiet surfaces,
 * a single confident accent, and restrained category hues.
 */

export const palette = {
  // Neutral canvas
  black: '#0A0A0B',
  ink900: '#0E0E10',
  ink800: '#141416',
  ink700: '#1C1C1F',
  ink600: '#242428',
  ink500: '#2E2E33',

  white: '#FFFFFF',
  fog100: '#F5F5F7',
  fog200: '#C9C9CF',
  fog300: '#9A9AA2',
  fog400: '#6B6B73',
  fog500: '#48484E',

  // Brand accent — a calm periwinkle drawn from the mascot's blue-grey coat.
  accent: '#7C8CF8',
  accentSoft: '#5C6BD6',
  accentDeep: '#3D47A8',

  // Warm amber — the mascot's eyes; used for "time / energy".
  amber: '#F5B84C',
  amberDeep: '#E0913A',

  // Semantic
  positive: '#5FD08A',
  danger: '#FF6B6B',
} as const;

/** Category accent hues — muted, distinct, never neon. */
export const categoryColors = {
  indigo: '#7C8CF8',
  violet: '#B08CF8',
  teal: '#5EC8C0',
  coral: '#FF8A6B',
  amber: '#F5B84C',
  rose: '#F587B0',
  sky: '#63B8F5',
  mint: '#66D6A0',
  clay: '#C79A6B',
  lilac: '#9AA0E0',
} as const;

export type CategoryColorKey = keyof typeof categoryColors;

export const colors = {
  bg: palette.black,
  bgElevated: palette.ink900,
  surface: palette.ink800,
  surfaceElevated: palette.ink700,
  surfaceHigh: palette.ink600,

  hairline: 'rgba(255,255,255,0.07)',
  hairlineStrong: 'rgba(255,255,255,0.12)',

  textPrimary: palette.fog100,
  textSecondary: palette.fog300,
  textTertiary: palette.fog400,
  textOnAccent: palette.white,

  accent: palette.accent,
  accentSoft: palette.accentSoft,
  amber: palette.amber,

  positive: palette.positive,
  danger: palette.danger,

  // translucent fills for glass / pressed states
  fillFaint: 'rgba(255,255,255,0.04)',
  fillSoft: 'rgba(255,255,255,0.06)',
  fillMedium: 'rgba(255,255,255,0.10)',
  scrim: 'rgba(0,0,0,0.6)',
} as const;

export type Colors = typeof colors;
