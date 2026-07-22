import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  accent?: string;
  fullWidth?: boolean;
  haptic?: Haptics.ImpactFeedbackStyle | null;
  style?: ViewStyle;
};

function ButtonBase({
  label,
  onPress,
  variant = 'primary',
  icon,
  accent = colors.accent,
  fullWidth,
  haptic = Haptics.ImpactFeedbackStyle.Light,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: accent }
      : variant === 'secondary'
        ? { backgroundColor: colors.surfaceElevated, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairlineStrong }
        : { backgroundColor: 'transparent' };

  const fg =
    variant === 'primary' ? colors.textOnAccent : variant === 'ghost' ? colors.textTertiary : colors.textPrimary;

  const handle = () => {
    if (haptic) Haptics.impactAsync(haptic);
    onPress();
  };

  return (
    <Pressable
      onPress={handle}
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 13 }))}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={fullWidth ? styles.full : undefined}
    >
      <Animated.View style={[styles.base, bg, fullWidth && styles.full, animatedStyle, style]}>
        <View style={styles.content}>
          {icon && <Icon name={icon} size={19} color={fg} />}
          <AppText variant="bodyStrong" style={{ color: fg }}>
            {label}
          </AppText>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  full: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export const Button = memo(ButtonBase);
