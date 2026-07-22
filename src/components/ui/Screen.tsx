import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

type ScreenProps = {
  children: ReactNode;
  edges?: readonly Edge[];
  style?: ViewStyle;
};

/** Base screen wrapper: the app's near-black canvas + safe-area handling. */
export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
});
