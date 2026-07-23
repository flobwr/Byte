/**
 * Byte color system — dark-first, sober and premium, with a genuine light
 * theme that keeps the same personality (warm ink instead of pure black,
 * the same brand accent, the same restrained category hues) rather than a
 * flat inversion.
 * Inspired by Linear / Arc / Nothing: quiet canvas, quiet surfaces, a single
 * confident accent.
 */

export const palette = {
  // Neutral canvas — dark
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

  // Neutral canvas — light (warm paper, not clinical white)
  paper000: '#FFFFFF',
  paper050: '#FBFAF7',
  paper100: '#F5F3EE',
  paper200: '#ECE9E2',
  ink050: '#17171A',
  ink100: '#4B4A50',
  ink200: '#84838A',

  // Brand accent — a calm periwinkle drawn from the mascot's blue-grey coat.
  accent: '#7C8CF8',
  accentSoft: '#5C6BD6',
  accentDeep: '#3D47A8',

  // Warm amber — the mascot's eyes; used for "time / energy".
  amber: '#F5B84C',
  amberDeep: '#E0913A',

  // Semantic
  positive: '#5FD08A',
  positiveDeep: '#2FA968',
  danger: '#FF6B6B',
  dangerDeep: '#D8483F',
} as const;

/** Category accent hues — muted, distinct, never neon. Shared across themes. */
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

export type Colors = {
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceElevated: string;
  surfaceHigh: string;
  hairline: string;
  hairlineStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnAccent: string;
  accent: string;
  accentSoft: string;
  amber: string;
  positive: string;
  danger: string;
  fillFaint: string;
  fillSoft: string;
  fillMedium: string;
  scrim: string;
};

export const darkColors: Colors = {
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
};

/**
 * A true light theme, not an inverted dark one: warm paper canvas, ink-toned
 * text, and deepened brand hues so accent/amber/danger keep enough contrast
 * on bright surfaces while staying recognisably "Byte".
 */
export const lightColors: Colors = {
  bg: palette.paper100,
  bgElevated: palette.paper050,
  surface: palette.paper000,
  surfaceElevated: palette.paper000,
  surfaceHigh: palette.paper200,

  hairline: 'rgba(23,23,20,0.08)',
  hairlineStrong: 'rgba(23,23,20,0.14)',

  textPrimary: palette.ink050,
  textSecondary: palette.ink100,
  textTertiary: palette.ink200,
  textOnAccent: palette.white,

  accent: palette.accentSoft,
  accentSoft: palette.accentDeep,
  amber: palette.amberDeep,

  positive: palette.positiveDeep,
  danger: palette.dangerDeep,

  fillFaint: 'rgba(23,23,20,0.035)',
  fillSoft: 'rgba(23,23,20,0.055)',
  fillMedium: 'rgba(23,23,20,0.09)',
  scrim: 'rgba(15,15,14,0.4)',
};

/** Static default — kept for the handful of theme-agnostic modules (e.g. icons in a fixed context). */
export const colors = darkColors;
