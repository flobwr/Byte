import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { motion } from '../../theme/motion';
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
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - motion.press.scale) }],
    opacity: 1 - pressed.value * (1 - motion.press.dim),
  }));

  const pressIn = () =>
    withTiming(1, { duration: motion.duration.press, easing: motion.easing.standard });
  const release = () => withSpring(0, motion.spring.press);

  const bg: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: accent, shadowColor: accent, ...primaryShadow }
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
      onPressIn={() => (pressed.value = pressIn())}
      onPressOut={() => (pressed.value = release())}
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

const primaryShadow: ViewStyle = {
  shadowOpacity: 0.35,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  full: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export const Button = memo(ButtonBase);
