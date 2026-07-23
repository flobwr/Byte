import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '../../components/Mascot';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Screen } from '../../components/ui/Screen';
import { StatTile } from '../../features/stats/StatTile';
import { useStats } from '../../features/stats/useStats';
import { motion } from '../../theme/motion';
import { spacing } from '../../theme/spacing';
import { useColors } from '../../theme/ThemeContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const s = useStats();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.giant + spacing.huge },
        ]}
      >
        <AppText variant="overline" color="tertiary">
          Profil
        </AppText>
        <AppText variant="display" style={styles.title}>
          Byte
        </AppText>

        <Animated.View entering={FadeInDown.delay(40).duration(motion.duration.reveal)}>
          <Card padding="xxl" cornerRadius="xxl" style={styles.hero}>
            <Mascot name="coffee" size={104} effects />
            <AppText variant="title3" style={styles.heroTitle}>
              Ton compagnon de focus
            </AppText>
            <AppText variant="callout" color="secondary" align="center">
              Un geste, une activité enregistrée. Byte s’occupe du reste.
            </AppText>
          </Card>
        </Animated.View>

        <View style={styles.tileRow}>
          <StatTile label="Temps total" value={s.allTime} kind="duration" accent={colors.amber} index={2} />
          <StatTile label="Activités" value={s.activityCount} kind="int" accent={colors.accent} index={3} />
        </View>
        <View style={styles.tileRow}>
          <StatTile label="Jours suivis" value={s.daysTracked} kind="int" accent={colors.positive} index={4} />
          <StatTile label="Catégories" value={s.categoriesCount} kind="int" accent={colors.accentSoft} index={5} />
        </View>

        <Card padding="none" cornerRadius="xl" style={styles.list}>
          <Pressable
            onPress={() => router.push('/settings')}
            android_ripple={{ color: colors.fillSoft }}
            accessibilityRole="button"
            accessibilityLabel="Paramètres"
            style={({ pressed }) => [styles.rowItem, pressed && { backgroundColor: colors.fillFaint }]}
          >
            <View style={styles.rowLeft}>
              <Icon name="settings" size={19} color={colors.textPrimary} />
              <AppText variant="body">Paramètres</AppText>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textTertiary} />
          </Pressable>
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
  tileRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  list: { marginTop: spacing.lg, overflow: 'hidden' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
