import { memo } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useColors } from '../../theme/ThemeContext';
import { typography, type TypographyVariant } from '../../theme/typography';

type ColorToken = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'amber' | 'positive' | 'danger';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken | string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  tabular?: boolean;
};

/** The single text component for the whole app. Everything is typed to the scale. */
function AppTextBase({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  tabular,
  style,
  ...rest
}: AppTextProps) {
  const colors = useColors();
  const colorMap: Record<ColorToken, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    accent: colors.accent,
    amber: colors.amber,
    positive: colors.positive,
    danger: colors.danger,
  };
  const resolved = (colorMap as Record<string, string>)[color] ?? color;
  return (
    <Text
      allowFontScaling
      {...rest}
      style={[
        typography[variant],
        { color: resolved, textAlign: align },
        weight ? { fontWeight: weight } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}

export const AppText = memo(AppTextBase);
