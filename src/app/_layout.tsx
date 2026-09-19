import "../../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nProvider } from "@/i18n";
import { ToastHost } from "@/components/ui/ToastHost";
import { ConfirmHost } from "@/components/ui/ConfirmHost";
import { PremiumBackdrop } from "@/components/ui/PremiumBackdrop";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/constants/theme";

const QUERY_STALE_TIME_MS = 30_000;

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: "transparent",
    card: "transparent",
    text: colors.ink,
    border: colors.line,
    notification: colors.danger,
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: QUERY_STALE_TIME_MS,
    },
  },
});

// Keep the native splash visible until fonts resolve.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Rejected when the splash is already hidden (cold start race) — safe to ignore.
});

function Providers({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <I18nProvider>{children}</I18nProvider>
          </KeyboardProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const [isAuthReady, setIsAuthReady] = useState(false);
  const hydrate = useMemo(() => useAuthStore.getState().hydrate, []);

  useEffect(() => {
    hydrate().finally(() => setIsAuthReady(true));
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !isAuthReady) {
    return null;
  }

  return (
    <Providers>
      <View style={{ flex: 1, backgroundColor: colors.base }}>
        <PremiumBackdrop />
        <StatusBar style="light" />
        <ThemeProvider value={navigationTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
              animation: "none",
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="card/[cardId]" />
            <Stack.Screen name="activate" />
            <Stack.Screen name="my-info/phones" />
            <Stack.Screen name="my-info/emails" />
            <Stack.Screen name="my-info/addresses" />
            <Stack.Screen name="my-info/social-medias" />
            <Stack.Screen name="support" />
            <Stack.Screen name="about" />
          </Stack>
        </ThemeProvider>
        <ConfirmHost />
        <ToastHost />
      </View>
    </Providers>
  );
}
