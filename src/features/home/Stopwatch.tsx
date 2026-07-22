import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { IDLE_MASCOT, RUNNING_MASCOT, type MascotKey } from '../../constants/mascots';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { formatClock } from '../../utils/time';

type StopwatchProps = {
  elapsedMs: number;
  status: 'idle' | 'running' | 'paused';
  mascot: MascotKey | null;
  accent: string;
};

/** The hero: mascot inside a soft pulsing halo, with the live stopwatch face. */
export function Stopwatch({ elapsedMs, status, mascot, accent }: StopwatchProps) {
  const running = status === 'running';
  const pulse = useSharedValue(0);
  const beat = useSharedValue(0);

  useEffect(() => {
    if (running) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0, { duration: 400 });
    }
  }, [running, pulse]);

  // Discreet per-second beat, synced to the ticking seconds.
  useEffect(() => {
    beat.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 320, easing: Easing.inOut(Easing.ease) }),
    );
  }, [elapsedMs, beat]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.12,
    transform: [{ scale: 0.96 + pulse.value * 0.09 }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: running ? 0.45 + beat.value * 0.45 : 0.25,
    transform: [{ scale: 1 + beat.value * 0.35 }],
  }));

  const displayMascot: MascotKey = status === 'idle' ? IDLE_MASCOT : (mascot ?? RUNNING_MASCOT);

  return (
    <View style={styles.wrap}>
      <View style={styles.mascotZone}>
        <Animated.View
          style={[styles.halo, { backgroundColor: accent, shadowColor: accent }, haloStyle]}
        />
        <Mascot name={displayMascot} size={172} animated={status !== 'idle'} effects />
      </View>

      <View style={styles.timeRow}>
        <Animated.View style={[styles.beat, { backgroundColor: accent }, dotStyle]} />
        <AppText variant="title1" tabular style={styles.time} accessibilityLabel="Temps écoulé">
          {formatClock(elapsedMs)}
        </AppText>
      </View>
      <AppText variant="overline" color="tertiary" style={styles.caption}>
        {status === 'idle'
          ? 'Prêt à démarrer'
          : status === 'paused'
            ? 'En pause'
            : 'Temps en cours'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  mascotZone: {
    width: 224,
    height: 196,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 184,
    height: 184,
    borderRadius: 999,
    shadowOpacity: 0.9,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 0 },
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  beat: { width: 9, height: 9, borderRadius: 5 },
  time: {
    fontSize: 76,
    lineHeight: 82,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  caption: { marginTop: spacing.sm, letterSpacing: 2 },
});
