import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
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
  const seconds = useSharedValue(0);

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

  // Discreet "time passing" beat, in sync with the ticking seconds.
  useEffect(() => {
    seconds.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.ease) }, () => {
      seconds.value = 0;
    });
  }, [elapsedMs, seconds]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + pulse.value * 0.22,
    transform: [{ scale: 0.92 + pulse.value * 0.16 }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: running ? 0.5 + seconds.value * 0.5 : 0.25,
    transform: [{ scale: 1 + seconds.value * 0.6 }],
  }));

  const displayMascot: MascotKey =
    status === 'idle' ? IDLE_MASCOT : (mascot ?? RUNNING_MASCOT);

  return (
    <View style={styles.wrap}>
      <View style={styles.mascotZone}>
        <Animated.View
          style={[styles.halo, { backgroundColor: accent, shadowColor: accent }, haloStyle]}
        />
        <Mascot name={displayMascot} size={168} animated={status !== 'idle'} />
      </View>

      <View style={styles.timeRow}>
        <Animated.View style={[styles.beat, { backgroundColor: accent }, dotStyle]} />
        <AppText variant="title1" tabular style={styles.time} accessibilityLabel="Temps écoulé">
          {formatClock(elapsedMs)}
        </AppText>
      </View>
      <AppText variant="caption" color="tertiary" style={styles.caption}>
        {status === 'idle'
          ? 'Prêt à démarrer ta journée'
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
    width: 220,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  beat: { width: 8, height: 8, borderRadius: 4 },
  time: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  caption: { marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 1.5 },
});
