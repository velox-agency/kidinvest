import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Asset } from "expo-asset";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { useColorScheme } from "react-native";

import { AppSplashScreen } from "@/components/splash-screen";

import { setupI18n } from "@/utils/i18n";

void SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [appReady, setAppReady] = React.useState(false);
  const [splashDone, setSplashDone] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);
  const colorScheme = useColorScheme();

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

  React.useEffect(() => {
    let mounted = true;

    const checkOnboarding = async () => {
      try {
        const hasOnboarding = await AsyncStorage.getItem("onboarding_complete");
        if (!mounted) {
          return;
        }

        setNeedsOnboarding(hasOnboarding !== "true");
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    checkOnboarding();

    return () => {
      mounted = false;
    };
  }, []);

  const resolvedScheme = colorScheme === "dark" ? "dark" : "light";

  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider value={resolvedScheme === "dark" ? DarkTheme : DefaultTheme}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
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
