import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';

import { useAppSelector } from '@/hooks/redux-hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQFAutoRefreshToken } from '@/hooks/use-qf-auto-refresh-token';
import { persistor, store } from '@/store/store';
import React, { useEffect } from 'react';
import { PersistGate } from 'redux-persist/lib/integration/react';

import '../constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNav() {
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useQFAutoRefreshToken();

  const auth = useAppSelector((state: any) => state.auth);

  const isAuthenticated = !!auth.isAuthenticated;
  const selectedLanguage = useAppSelector(
    (state: any) => state.config.language.language
  );

  const isRehydrated = useSelector(
    (state: any) => state.auth?._persist?.rehydrated
  );

  if (!isRehydrated) {
    return null; // atau splash screen
  }

  // redirect logic:
  useEffect(() => {
    if (!isRehydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    // 1. Belum login
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    // 2. Sudah login tapi belum pilih bahasa
    if (!selectedLanguage) {
      if (!inOnboarding) {
        router.replace('/(onboarding)/choose-language');
      }
      return;
    }

    // 3. Sudah lengkap → paksa ke tabs
    if (inAuthGroup || inOnboarding) {
      router.replace('/(tabs)');
    }

  }, [isAuthenticated, selectedLanguage, isRehydrated, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootNav />
      </PersistGate>
    </Provider>
  );
}
