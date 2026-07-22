import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { type MascotKey } from '../../constants/mascots';
import { radius, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { formatDuration } from '../../utils/time';

export type LogFeedback = {
  id: number;
  label: string;
  mascot: MascotKey;
  color: string;
  addedMs: number;
};

/** Ephemeral confirmation that slides in on log and fades away — no dialog, no tap. */
export function LogToast({ feedback }: { feedback: LogFeedback | null }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!feedback) return;
    progress.value = withSpring(1, { damping: 16, stiffness: 200 });
    const t = setTimeout(() => {
      progress.value = withTiming(0, { duration: 320 });
    }, 1500);
    return () => clearTimeout(t);
  }, [feedback, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }, { scale: 0.96 + progress.value * 0.04 }],
  }));

  if (!feedback) return null;

  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="none">
      <View style={[styles.toast, { borderColor: feedback.color + '55' }]}>
        <View style={[styles.thumb, { backgroundColor: feedback.color + '22' }]}>
          <Mascot name={feedback.mascot} size={34} animated={false} />
        </View>
        <View style={styles.textCol}>
          <AppText variant="bodyStrong">
            +{formatDuration(feedback.addedMs)}
          </AppText>
          <AppText variant="caption" color="secondary">
            ajouté à {feedback.label}
          </AppText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(28,28,31,0.96)',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textCol: { paddingRight: spacing.sm },
});
