import { Tabs } from 'expo-router';

import { TabBar } from '../../components/navigation/TabBar';
import { motion } from '../../theme/motion';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        // Gentle fade + horizontal shift between tabs (no full-UI movement).
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: { duration: motion.duration.tab },
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Aujourd’hui' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
