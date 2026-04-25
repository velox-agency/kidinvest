import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Asset } from "expo-asset";
import { Slot, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";
import { AppSplashScreen } from "@/components/splash-screen";

import { setupI18n } from "@/utils/i18n";

void SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [appReady, setAppReady] = React.useState(false);
  const [splashDone, setSplashDone] = React.useState(false);
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isOnboardingRoute = pathname.startsWith("/onboarding");

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
    if (!appReady || !splashDone) {
      return;
    }

    let mounted = true;

    const checkOnboarding = async () => {
      try {
        const hasOnboarding = await AsyncStorage.getItem("onboarding_complete");
        if (!mounted) {
          return;
        }

        setOnboardingComplete(hasOnboarding === "true");
      } finally {
        if (mounted) {
          setOnboardingChecked(true);
        }
      }
    };

    checkOnboarding();

    return () => {
      mounted = false;
    };
  }, [appReady, splashDone]);

  React.useEffect(() => {
    if (!onboardingChecked) {
      return;
    }

    if (!onboardingComplete && !isOnboardingRoute) {
      router.replace("/onboarding");
      return;
    }

    if (onboardingComplete && isOnboardingRoute) {
      router.replace("/");
    }
  }, [isOnboardingRoute, onboardingChecked, onboardingComplete]);

  const resolvedScheme = colorScheme === "dark" ? "dark" : "light";

  return (
    <ThemeProvider value={resolvedScheme === "dark" ? DarkTheme : DefaultTheme}>
      {appReady && splashDone && onboardingChecked &&
        (isOnboardingRoute ? <Slot /> : onboardingComplete ? <AppTabs /> : null)}
      {!splashDone && (
        <AppSplashScreen
          colorScheme={resolvedScheme}
          onAnimationEnd={() => setSplashDone(true)}
        />
      )}
    </ThemeProvider>
  );
}
