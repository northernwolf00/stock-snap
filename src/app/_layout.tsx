import { useCallback, useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/services/sync.service';
import { getDatabase } from '@/services/database';
import { useSyncManager } from '@/features/sync';
import { initPushNotifications } from '@/features/alerts';
import { useInventoryBootstrap } from '@/features/inventory';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some errors here */
});

function AppBootstrap({ onReady }: { onReady: () => void }) {
  useSyncManager();
  useInventoryBootstrap();

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          getDatabase(),
          initPushNotifications(),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        onReady();
      }
    }

    prepare();
  }, [onReady]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const handleReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={isDark ? MD3DarkTheme : MD3LightTheme}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <AppBootstrap onReady={handleReady} />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
