import { Stack } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthScreen } from '../features/auth/AuthScreen';
import { bootstrapAfterSignIn, resetSyncState } from '../services/sync/bootstrap';
import { useAuthStore } from '../stores/authStore';
import { useMetaStore } from '../stores/metaStore';
import { ThemeProvider, useColors, useResolvedScheme } from '../theme/ThemeContext';

function LoadingSplash() {
  const colors = useColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function ThemedRoot() {
  const colors = useColors();
  const scheme = useResolvedScheme();
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id);

  // Gates the app behind the splash until the just-signed-in user's data has
  // been pulled — otherwise a re-login on the same device could flash the
  // previous session's cached local state for a moment.
  const [ready, setReady] = useState(false);
  const bootstrappedFor = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'signedOut') {
      bootstrappedFor.current = null;
      setReady(false);
      resetSyncState();
      return;
    }
    if (status !== 'signedIn' || !userId) return;
    if (bootstrappedFor.current === userId) return;
    bootstrappedFor.current = userId;
    setReady(false);
    bootstrapAfterSignIn(userId).finally(() => setReady(true));
  }, [status, userId]);

  useEffect(() => {
    useMetaStore.getState().ensureCreated();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(scheme === 'light' ? 'dark' : 'light').catch(() => {});
    }
  }, [colors.bg, scheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
        {status === 'signedOut' && <AuthScreen />}
        {status === 'signedIn' && !ready && <LoadingSplash />}
        {status === 'loading' && <LoadingSplash />}
        {status === 'signedIn' && ready && (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
            <Stack.Screen name="categories" options={{ presentation: 'modal' }} />
          </Stack>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedRoot />
    </ThemeProvider>
  );
}
