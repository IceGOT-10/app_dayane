import '../../global.css';

import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BrandColors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs
        initialRouteName="dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: BrandColors.green,
          tabBarInactiveTintColor: BrandColors.muted,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ color, size }) => {
            const symbols = {
              dashboard: { ios: 'house.fill', android: 'home', web: 'home' },
              games: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
              documents: { ios: 'doc.text', android: 'description', web: 'description' },
              profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
              more: { ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' },
            } as const;

            const symbol = symbols[route.name as keyof typeof symbols];
            return symbol ? <SymbolView name={symbol} tintColor={color} size={size} /> : null;
          },
        })}>
        <Tabs.Screen name="dashboard" options={{ title: 'Início' }} />
        <Tabs.Screen name="games" options={{ title: 'Jogos' }} />
        <Tabs.Screen name="documents" options={{ title: 'Documentos' }} />
        <Tabs.Screen name="profile" options={{ title: 'Meu Perfil' }} />
        <Tabs.Screen name="more" options={{ title: 'Mais' }} />
        <Tabs.Screen name="games/[id]" options={{ href: null }} />
        <Tabs.Screen name="guests/index" options={{ href: null }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabBar: {
    backgroundColor: BrandColors.surface,
    borderTopColor: BrandColors.border,
    height: 62,
    paddingTop: 6,
  },
});
