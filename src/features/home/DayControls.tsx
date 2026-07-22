import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Button } from '../../components/ui/Button';
import { type TimerStatus } from '../../stores/timerStore';
import { spacing } from '../../theme/spacing';

type DayControlsProps = {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

function DayControlsBase({ status, onStart, onPause, onResume, onEnd }: DayControlsProps) {
  return (
    <Animated.View
      key={status}
      entering={FadeIn.duration(260)}
      exiting={FadeOut.duration(160)}
    >
      {status === 'idle' ? (
        <Button label="Démarrer la journée" icon="sunrise" onPress={onStart} fullWidth />
      ) : (
        <View style={styles.row}>
          <View style={styles.grow}>
            {status === 'running' ? (
              <Button label="Pause" icon="pause" variant="secondary" onPress={onPause} fullWidth />
            ) : (
              <Button label="Reprendre" icon="play" onPress={onResume} fullWidth />
            )}
          </View>
          <Button label="Terminer" icon="flag" variant="ghost" onPress={onEnd} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grow: { flex: 1 },
});

export const DayControls = memo(DayControlsBase);
