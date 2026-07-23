import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { radius, spacing } from '../../theme/spacing';
import { type ShadowKey, useShadows } from '../../theme/shadows';
import { useColors } from '../../theme/ThemeContext';

export type CardProps = ViewProps & {
  children?: ReactNode;
  padding?: keyof typeof spacing;
  cornerRadius?: keyof typeof radius;
  elevation?: ShadowKey;
  bordered?: boolean;
  surface?: 'surface' | 'surfaceElevated' | 'surfaceHigh' | 'transparent';
};

function CardBase({
  children,
  padding = 'xl',
  cornerRadius = 'xl',
  elevation = 'sm',
  bordered = true,
  surface = 'surface',
  style,
  ...rest
}: CardProps) {
  const colors = useColors();
  const shadows = useShadows();
  const bg =
    surface === 'transparent'
      ? 'transparent'
      : surface === 'surfaceElevated'
        ? colors.surfaceElevated
        : surface === 'surfaceHigh'
          ? colors.surfaceHigh
          : colors.surface;

  const composed: ViewStyle = {
    backgroundColor: bg,
    borderRadius: radius[cornerRadius],
    padding: spacing[padding],
    borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
    borderColor: colors.hairline,
  };

  return (
    <View {...rest} style={[composed, shadows[elevation], style]}>
      {children}
    </View>
  );
}

export const Card = memo(CardBase);
