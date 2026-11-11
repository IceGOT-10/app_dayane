import '../../global.css';

import {
  DarkTheme,
  DefaultTheme,
  Tabs,
  ThemeProvider,
  usePathname,
  useRouter,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BrandColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync();

const HIDDEN_TAB_BAR_ROUTES = new Set(['login', 'index']);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const hydrateStore = useAppStore((state) => state.hydrateStore);
  const redirectTo = !isHydrated
    ? null
    : !isAuthenticated && pathname !== '/login'
      ? '/login'
      : isAuthenticated &&
          (pathname === '/login' || pathname === '/' || pathname === '/index')
        ? '/dashboard'
        : null;

  useEffect(() => {
    void hydrateStore();
  }, [hydrateStore]);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs
        initialRouteName="login"
        screenOptions={({ route }) => {
          const hideTabBar = HIDDEN_TAB_BAR_ROUTES.has(route.name);

          return {
            headerShown: false,
            tabBarActiveTintColor: BrandColors.green,
            tabBarInactiveTintColor: BrandColors.muted,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarItemStyle: styles.tabBarItem,
            tabBarHideOnKeyboard: true,
            tabBarStyle: hideTabBar
              ? styles.tabBarHidden
              : styles.tabBar,
            tabBarIcon: ({ color, size }) => {
              const symbols = {
                dashboard: {
                  ios: 'house.fill',
                  android: 'home',
                  web: 'home',
                },
                games: {
                  ios: 'calendar',
                  android: 'calendar_month',
                  web: 'calendar_month',
                },
                documents: {
                  ios: 'doc.text',
                  android: 'description',
                  web: 'description',
                },
                profile: {
                  ios: 'person.crop.circle',
                  android: 'account_circle',
                  web: 'account_circle',
                },
                more: {
                  ios: 'ellipsis',
                  android: 'more_horiz',
                  web: 'more_horiz',
                },
              } as const;

              const symbol = symbols[route.name as keyof typeof symbols];
              return symbol ? (
                <SymbolView name={symbol} tintColor={color} size={size} />
              ) : null;
            },
          };
        }}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Início' }} />
        <Tabs.Screen name="games" options={{ title: 'Jogos' }} />
        <Tabs.Screen name="documents" options={{ title: 'Documentos' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
        <Tabs.Screen name="more" options={{ title: 'Mais' }} />
        <Tabs.Screen
          name="login"
          options={{ href: null, tabBarStyle: styles.tabBarHidden }}
        />
        <Tabs.Screen name="games/[id]" options={{ href: null }} />
        <Tabs.Screen name="guests/index" options={{ href: null }} />
        <Tabs.Screen
          name="index"
          options={{ href: null, tabBarStyle: styles.tabBarHidden }}
        />
      </Tabs>
      {!isHydrated || redirectTo ? (
        <View style={styles.authGuardOverlay}>
        <ActivityIndicator color={BrandColors.green} />
        </View>
      ) : null}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingHorizontal: 2,
  },
  tabBar: {
    backgroundColor: BrandColors.surface,
    borderTopColor: BrandColors.border,
    paddingTop: 6,
    paddingBottom: 6,
  },
  tabBarHidden: {
    display: 'none',
  },
  authGuardOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.page,
    zIndex: 1100,
  },
});
