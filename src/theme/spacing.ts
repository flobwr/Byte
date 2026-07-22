/** 4-pt spacing scale. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

/** Corner radii — generous, per the brief ("coins très arrondis"). */
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  pill: 999,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
