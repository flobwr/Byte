import { Platform, type TextStyle } from 'react-native';

/**
 * Typography. We lean on the platform's native display face (SF Pro on iOS,
 * Roboto on Android) for UI text, a serif for editorial headers, and
 * tabular figures for the stopwatch so digits never jitter.
 */

const sans = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const fonts = { sans, serif, mono } as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const satisfies Record<string, TextStyle['fontWeight']>;

type Variant = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
};

export const typography = {
  // Editorial header (serif italic accents, à la the Dribbble refs)
  display: {
    fontFamily: serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  title1: { fontFamily: sans, fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.2 },
  title2: { fontFamily: sans, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  title3: { fontFamily: sans, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontFamily: sans, fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontFamily: sans, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  callout: { fontFamily: sans, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  caption: {
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  overline: {
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
} as const satisfies Record<string, Variant>;

export type TypographyVariant = keyof typeof typography;
