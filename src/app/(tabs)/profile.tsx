import * as Haptics from 'expo-haptics';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { useTimerStore } from '../../stores/timerStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

function Row({ label, value, onPress, danger }: { label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={onPress ? { color: colors.fillSoft } : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.rowItem, pressed && onPress ? styles.rowPressed : null]}
    >
      <AppText variant="body" color={danger ? 'danger' : 'primary'}>
        {label}
      </AppText>
      <View style={styles.rowRight}>
        {value && (
          <AppText variant="callout" color="tertiary">
            {value}
          </AppText>
        )}
        {onPress && <Icon name="chevronRight" size={18} color={colors.textTertiary} />}
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const resetAll = useTimerStore((s) => s.resetAll);

  const confirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Réinitialiser Byte', 'Toutes tes données seront effacées. Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.giant + spacing.huge }]}
      >
        <AppText variant="overline" color="tertiary">
          Profil
        </AppText>
        <AppText variant="display" style={styles.title}>
          Byte
        </AppText>

        <Card padding="xxl" cornerRadius="xxl" style={styles.hero}>
          <Mascot name="coffee" size={96} />
          <AppText variant="title3" style={styles.heroTitle}>
            Ton compagnon de focus
          </AppText>
          <AppText variant="callout" color="secondary" align="center">
            Un geste, une activité enregistrée. Byte s’occupe du reste.
          </AppText>
        </Card>

        <Card padding="none" cornerRadius="xl" style={styles.list}>
          <Row label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <Row label="Catégories" value="10" />
        </Card>

        <Card padding="none" cornerRadius="xl" style={styles.list}>
          <Row label="Réinitialiser les données" onPress={confirmReset} danger />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  heroTitle: { marginTop: spacing.sm },
  list: { marginTop: spacing.lg, overflow: 'hidden' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowPressed: { backgroundColor: colors.fillFaint },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginLeft: spacing.xl },
});
