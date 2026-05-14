import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { getUnixTime } from 'date-fns';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';

import { theme } from '@/constants/theme';
import { getUserProfile } from '@/features/auth/authThunks';
import { getConfig } from '@/features/config/configThunks';
import { getAllChapters } from '@/features/reading/readingThunk';
import { generateWeeklyGoal } from '@/features/user/userThunks';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQFAutoRefreshToken } from '@/hooks/use-qf-auto-refresh-token';
import { supabase } from '@/services/supabase';
import { persistor, store } from '@/store/store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PaperProvider } from 'react-native-paper';
import 'react-native-url-polyfill/auto';
import { PersistGate } from 'redux-persist/lib/integration/react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNav() {
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useQFAutoRefreshToken();

  // state selector
  const auth = useAppSelector((state: any) => state.auth);
  const selectedLanguage = useAppSelector((state: any) => state.config.preferences.language.language);
  const isRehydrated = useSelector((state: any) => state.auth?._persist?.rehydrated);
  const isAuthenticated = !!auth.isAuthenticated;

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
      // refresh config
      dispatch(getConfig() as any);

      // redirecting...
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, selectedLanguage, isRehydrated, segments]);

  // Listen supabase signup
  const dispatch = useAppDispatch();
  const supabaseUser = useAppSelector((state: any) => state.auth.supabase.user);

  useEffect(() => {
    if (supabaseUser) {
      const lastSignIn = getUnixTime(new Date(supabaseUser.last_sign_in_at));
      const createdAt = getUnixTime(new Date(supabaseUser.created_at));
      const isNew = Math.abs(lastSignIn - createdAt) < 5;

      if (isNew) {
        console.info("New user detected...");

        // generate default goal for one week
        dispatch(generateWeeklyGoal({ 
          type: 'QURAN_TIME',
          amount: 900, // in seconds
          duration: 1,
          category: 'QURAN'
        }) as any);
      }
    }
  }, [supabaseUser]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // start once
    supabase.auth.startAutoRefresh();

    dispatch(getUserProfile() as any);
    dispatch(getAllChapters() as any);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider 
        theme={theme} 
        settings={{
          icon: (props) => <MaterialIcons {...props} />,
        }}>
        <KeyboardProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="adjust-goal-modal" options={{ headerShown: false, presentation: 'modal', title: 'Adjust Goal' }} />
            <Stack.Screen name="tafsir-reader" options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal', title: 'Read Tafsir' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </KeyboardProvider>
      </PaperProvider>
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
