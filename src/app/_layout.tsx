import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Asset } from "expo-asset";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppSplashScreen } from "@/components/splash-screen";
import { useStoreHydration } from "@/hooks/useStoreHydration";
import { usePlayerStore } from "@/store/playerStore";

import { setupI18n } from "@/utils/i18n";

void SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [appReady, setAppReady] = React.useState(false);
  const [splashDone, setSplashDone] = React.useState(false);
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const playerHydrated = useStoreHydration();
  const profile = usePlayerStore((state) => state.profile);

  React.useEffect(() => {
    let mounted = true;

    const prepare = async () => {
      try {
        await Promise.all([
          setupI18n(),
          Asset.fromModule(
            require("@/assets/images/dark-icon-logoKidInvest-.png"),
          ).downloadAsync(),
          Asset.fromModule(
            require("@/assets/images/light-icon-logoKidInvest-.png"),
          ).downloadAsync(),
          new Promise((resolve) => setTimeout(resolve, 220)),
        ]);
      } finally {
        if (mounted) {
          setAppReady(true);
        }
      }
    };

    prepare();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!appReady) {
      return;
    }

    SplashScreen.hideAsync().catch(() => {
      // Ignore splash hide errors in dev reload race conditions.
    });
  }, [appReady]);

  const resolvedScheme = colorScheme === "dark" ? "dark" : "light";
  const activeRootSegment = segments[0];
  const shouldGoToOnboarding =
    playerHydrated && !profile && activeRootSegment !== "onboarding";
  const shouldGoToTabs =
    playerHydrated && !!profile && activeRootSegment !== "(tabs)";

  if (!playerHydrated) {
    return null;
  }

  return (
    <ThemeProvider value={resolvedScheme === "dark" ? DarkTheme : DefaultTheme}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="level/[id]" />
        </Stack>
        {needsOnboarding ? <Redirect href="/onboarding" /> : null}
        {!splashDone && (
          <AppSplashScreen
            colorScheme={resolvedScheme}
            onAnimationEnd={() => setSplashDone(true)}
          />
        )}
      </>
    </ThemeProvider>
  );
}
