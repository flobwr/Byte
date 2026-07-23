import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useAuthStore } from '../../stores/authStore';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';

type Mode = 'signIn' | 'signUp';

/** The only screen shown while signed out — email/password sign-in and sign-up. */
export function AuthScreen() {
  const colors = useColors();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !submitting;

  const toggleMode = () => {
    Haptics.selectionAsync();
    clearError();
    setConfirmationSent(false);
    setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        const { needsEmailConfirmation } = await signUp(email, password);
        if (needsEmailConfirmation) {
          setConfirmationSent(true);
          setMode('signIn');
        }
      }
    } catch {
      // useAuthStore already captured a friendly message in `error`.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.hero}>
            <Mascot name="meditating" size={88} effects />
            <AppText variant="display" style={styles.title}>
              Byte
            </AppText>
            <AppText variant="callout" color="secondary" align="center">
              Un geste, une activité enregistrée.
            </AppText>
          </View>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error) clearError();
              }}
              placeholder="Email"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                { color: colors.textPrimary, borderBottomColor: colors.hairlineStrong },
              ]}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
            <TextInput
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (error) clearError();
              }}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                { color: colors.textPrimary, borderBottomColor: colors.hairlineStrong },
              ]}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'signIn' ? 'password' : 'password-new'}
              textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
              returnKeyType="done"
              onSubmitEditing={submit}
            />

            {error && (
              <AppText variant="caption" color="danger" style={styles.message}>
                {error}
              </AppText>
            )}
            {!error && confirmationSent && (
              <AppText variant="caption" color="positive" style={styles.message}>
                Compte créé — vérifie ta boîte mail pour le confirmer, puis connecte-toi.
              </AppText>
            )}

            <Button
              label={
                submitting ? 'Patiente…' : mode === 'signIn' ? 'Se connecter' : 'Créer un compte'
              }
              onPress={submit}
              fullWidth
              style={canSubmit ? styles.submit : { ...styles.submit, ...styles.disabled }}
            />

            <Pressable onPress={toggleMode} hitSlop={8} style={styles.toggle}>
              <AppText variant="callout" color="secondary" align="center">
                {mode === 'signIn' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
                <AppText variant="callout" color="accent">
                  {mode === 'signIn' ? 'Créer un compte' : 'Se connecter'}
                </AppText>
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.giant,
  },
  hero: { alignItems: 'center', gap: spacing.sm },
  title: { marginTop: spacing.xs },
  form: { gap: spacing.xl },
  input: {
    fontSize: 16,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  message: { marginTop: -spacing.md },
  submit: { marginTop: spacing.sm },
  disabled: { opacity: 0.5 },
  toggle: { paddingVertical: spacing.sm },
});
