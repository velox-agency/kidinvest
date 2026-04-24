import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Asset } from "expo-asset";
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

  const resolvedScheme = colorScheme === "dark" ? "dark" : "light";

  return (
    <ThemeProvider value={resolvedScheme === "dark" ? DarkTheme : DefaultTheme}>
      {appReady && <AppTabs />}
      {!splashDone && (
        <AppSplashScreen
          colorScheme={resolvedScheme}
          onAnimationEnd={() => setSplashDone(true)}
        />
      )}
    </ThemeProvider>
  );
}
