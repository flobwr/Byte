import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useColors } from '../../theme/ThemeContext';

type ScreenProps = {
  children: ReactNode;
  edges?: readonly Edge[];
  style?: ViewStyle;
};

/** Base screen wrapper: the app's canvas + safe-area handling. */
export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  const colors = useColors();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
});
