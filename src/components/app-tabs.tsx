import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const { t } = useTranslation();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/images/tabIcons/home.png")}
              style={[styles.icon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: t("tabs.games"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/images/tabIcons/games.png")}
              style={[styles.icon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t("tabs.wallet"),
        }}
      />
      <Tabs.Screen
        name="music"
        options={{
          title: t("music.title"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  icon: {
    resizeMode: "contain",
  },
});
