import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { motion } from '../../theme/motion';
import { radius, spacing } from '../../theme/spacing';
import { useShadows } from '../../theme/shadows';
import { useColors, useResolvedScheme } from '../../theme/ThemeContext';
import { AppText } from '../ui/AppText';
import { Icon, type IconName } from '../ui/Icon';
import { type Colors } from '../../theme/colors';

const ICONS: Record<string, IconName> = {
  index: 'home',
  calendar: 'calendar',
  stats: 'stats',
  profile: 'profile',
};

const LABELS: Record<string, string> = {
  index: 'Aujourd’hui',
  calendar: 'Calendrier',
  stats: 'Stats',
  profile: 'Profil',
};

/** Floating, blurred, pill-shaped tab bar — the app's signature chrome. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const shadows = useShadows();
  const scheme = useResolvedScheme();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: insets.bottom + spacing.sm }]}>
      <BlurView
        intensity={40}
        tint={scheme}
        style={[
          styles.bar,
          shadows.lg,
          {
            borderColor: colors.hairlineStrong,
            backgroundColor: scheme === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(20,20,22,0.6)',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            Haptics.selectionAsync();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TabButton
              key={route.key}
              focused={focused}
              icon={ICONS[route.name] ?? 'home'}
              label={LABELS[route.name] ?? route.name}
              onPress={onPress}
              colors={colors}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

function TabButton({
  focused,
  icon,
  label,
  onPress,
  colors,
}: {
  focused: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
  colors: Colors;
}) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - motion.press.scale) }],
    opacity: 1 - pressed.value * (1 - motion.press.dim),
  }));
  const to = (v: number) =>
    withTiming(v, { duration: motion.duration.press, easing: motion.easing.standard });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (pressed.value = to(1))}
      onPressOut={() => (pressed.value = to(0))}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[styles.tabInner, focused && { backgroundColor: colors.fillMedium }, animatedStyle]}
      >
        <Icon name={icon} size={22} color={focused ? colors.textPrimary : colors.textTertiary} />
        {focused && (
          <AppText variant="caption" color="primary" style={styles.label}>
            {label}
          </AppText>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  tab: { borderRadius: radius.pill },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    minWidth: 52,
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  label: { marginRight: spacing.xxs },
});
